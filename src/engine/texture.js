class TextureShader extends Shader {
	constructor(game, is_anim) {
		var fragmentshadersrc = `
			precision mediump float;
			uniform sampler2D uSampler;
			uniform vec4 uPixelColor;
			varying vec2 vTexCoord;

			void main(void) {
				vec4 c = texture2D(uSampler, vTexCoord);
				vec3 r = c.rgb * (1.0 - uPixelColor.a)
					+ uPixelColor.rgb * uPixelColor.a;
				gl_FragColor = vec4(r, c.a);
			}
		`;

		var vertexshadersrc = `
			attribute vec3 aSquareVertexPosition;
			attribute vec2 aTextureCoordinate;
			varying vec2 vTexCoord;
			uniform mat4 uModelTransform;
			uniform mat4 uViewProjTransform;

			void main(void) {
				gl_Position = uViewProjTransform
					* uModelTransform
					* vec4(aSquareVertexPosition, 1.0);
				vTexCoord = aTextureCoordinate;
			}
		`;

		super(game.gl, fragmentshadersrc, vertexshadersrc);
		this.vpattr = this.findAttrib("aSquareVertexPosition");
		this.texCoord = this.findAttrib("aTextureCoordinate");
		this.pixColor = this.findUniform("uPixelColor");
		this.modelXform = this.findUniform("uModelTransform");
		this.vpXform = this.findUniform("uViewProjTransform");

		this.texCoordBuf = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuf);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
			1.0, 1.0,
			0.0, 1.0,
			1.0, 0.0,
			0.0, 0.0]), this.gl.DYNAMIC_DRAW);
		this.gl.vertexAttribPointer(this.texCoord, 2, this.gl.FLOAT, false, 0, 0);

		this._sq_buf = game.squareBuf;
	}

	activate(pixColor, vpXform, modelXform) {
		this.use();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._sq_buf);
		this.gl.vertexAttribPointer(this.vpattr, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.vpattr);
		this.gl.enableVertexAttribArray(this.texCoord);
		this.gl.uniformMatrix4fv(this.vpXform, false, vpXform);
		this.gl.uniform4fv(this.pixColor, pixColor);
		this.gl.uniformMatrix4fv(this.modelXform, false, modelXform);
	}

	set texcoord(tc) {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuf);
		this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(tc));
	}

	destroy() {
		this.gl.deleteBuffer(this.texCoordBuf);
	}
}

class TextureRenderable extends Renderable {
	constructor(shader, texture) {
		super(shader);
		this.color = [1.0, 1.0, 1.0, 0.0];
		this.texid = texture.id;
		this.uvrect = {x: 0.5, y: 0.5, w: 1.0, h: 1.0};
	}

	draw(vp) {
		var newr = this.uvrect.x + this.uvrect.w / 2;
		var newl = this.uvrect.x - this.uvrect.w / 2;
		var newt = this.uvrect.y + this.uvrect.h / 2;
		var newb = this.uvrect.y - this.uvrect.h / 2;
		this.shader.texcoord = [newr, newt, newl, newt, newr, newb, newl, newb];
		this.shader.gl.bindTexture(this.shader.gl.TEXTURE_2D, this.texid);
		super.draw(vp);
	}
}

class Sprite extends TextureRenderable {
	constructor(shader, texture) {
		super(shader, texture);
		this._accumulative_dt = 0;
		this.frame_dt = 0;
		this.current_frame = 0;
		this.frame_count = 1;
		this.animation_enabled = false;
		this._fg = 0;
		this._fx = 0.5;
	}

	update(dt) {
		if (this.animation_enabled && this.frame_dt > 0 && this.frame_count > 1) {
			this._accumulative_dt += dt;

			var advance_by = Math.floor(this._accumulative_dt / this.frame_dt);
			this.current_frame += advance_by;
			this._accumulative_dt -= advance_by * this.frame_dt;

			var loop_back = Math.floor(this.current_frame / this.frame_count);
			this.current_frame -= loop_back * this.frame_count;
		}
	}

	draw(vp) {
		this.uvrect.x = this._fx + this.current_frame * (this._fg + this.uvrect.w);
		super.draw(vp);
	}
}
