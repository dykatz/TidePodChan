class TextureShader {
	constructor(game) {
		var fragmentshadersrc = `
			precision mediump float;
			uniform sampler2D uSampler;
			uniform vec4 uPixelColor;
			varying vec2 vTexCoord;

			void main(void) {
				vec4 c = texture2D(uSampler, vTexCoord);
				vec3 r = vec3(c) * (1.0 - uPixelColor.a)
					+ vec3(uPixelColor) * uPixelColor.a;
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
		this.squareBuf = game.squareBuf;
		this.vpattr = this.findAttrib("aSquareVertexPosition");
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareBuf);
		this.gl.vertexAttribPointer(this.vpattr, 3, this.gl.FLOAT, false, 0, 0);

		this.texCoord = this.findAttrib("aTextureCoordinate");
		this.pixColor = this.findUniform("uPixColor");
		this.modelXform = this.findUniform("uModelTransform");
		this.vpXform = this.findUniform("uViewProjTransform");
	}

	activateShader(pixColor, vpXform) {
		this.use();
		this.gl.uniformMatrix4fv(this.vpXform, false, vpXform);
		this.gl.enableVertexAttribArray(this.vpattr);
		this.gl.uniform4fv(this.pixColor, pixColor);
		this.gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuf);
		this.gl.enableVertexAttribArray(this.texCoord);
		this.gl.vertexAttribPointer(this.texCoord, 2, this.gl.FLOAT, false, 0, 0);
	}

	loadObjectTransform(modelXform) {
		this.gl.uniformMatrix4fv(this.modelXform, false, modelXform);
	}
}
