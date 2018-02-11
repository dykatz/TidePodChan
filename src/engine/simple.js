class SimpleShader extends Shader {
	constructor(game) {
		var fragmentshadersrc = `
			precision mediump float;

			uniform vec4 uPixColor;

			void main(void) {
				gl_FragColor = uPixColor;
			}
		`;

		var vertexshadersrc = `
			attribute vec3 aSquareVertexPosition;

			uniform mat4 uModelTransform;
			uniform mat4 uViewProjTransform;
			uniform float uPointSize;

			void main(void) {
				gl_Position = uViewProjTransform
					* uModelTransform
					* vec4(aSquareVertexPosition, 1.0);

				gl_PointSize = uPointSize;
			}
		`;

		super(game.gl, fragmentshadersrc, vertexshadersrc);
		this.vpattr = this.findAttrib("aSquareVertexPosition");
		this.pixColor = this.findUniform("uPixColor");
		this.modelXform = this.findUniform("uModelTransform");
		this._pnt_size = this.findUniform("uPointSize");
		this.vpXform = this.findUniform("uViewProjTransform");

		this._sq_buf = game.squareBuf;
		this._ln_buf = game.lineBuf;
	}

	set point_size(p) {
		this.gl.uniform1f(this._pnt_size, p);
	}

	activate(pixColor, vpXform, modelXform, is_line) {
		this.use();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, is_line ? this._ln_buf : this._sq_buf);
		this.gl.vertexAttribPointer(this.vpattr, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.vpattr);
		this.gl.uniformMatrix4fv(this.vpXform, false, vpXform);
		this.gl.uniform4fv(this.pixColor, pixColor);
		this.gl.uniformMatrix4fv(this.modelXform, false, modelXform);
	}
}

class Line extends Renderable {
	constructor(shader) {
		super(shader);
		this.color = [0.0, 0.0, 0.0, 1.0];
		this.p1 = vec2.fromValues(0.0, 0.0);
		this.p2 = vec2.fromValues(0.0, 0.0);
		this.show_line = true;
		this.show_vert = false;
		this.point_size = 1;
	}

	get p1x() { return this.p1[0]; }
	set p1x(x) { this.p1[0] = x; }
	get p1y() { return this.p1[1]; }
	set p1y(y) { this.p1[1] = y; }
	get p2x() { return this.p2[0]; }
	set p2x(x) { this.p2[0] = x; }
	get p2y() { return this.p2[1]; }
	set p2y(y) { this.p2[1] = y; }

	draw(vp) {
		var sx = this.p1x - this.p2x;
		var sy = this.p1y - this.p2y;
		this.xform.x = this.p1x - sx / 2;
		this.xform.y = this.p1y - sy / 2;
		this.xform.width = sx;
		this.xform.height = sy;
		this.shader.activate(this.color, vp, this.xform.x_form, true);
		this.shader.point_size = this.point_size;
		if (this.show_line)
			this.shader.gl.drawArrays(this.shader.gl.LINE_STRIP, 0, 2);
		if (!this.show_line || this.show_vert)
			this.shader.gl.drawArrays(this.shader.gl.POINTS, 0, 2);
	}
}
