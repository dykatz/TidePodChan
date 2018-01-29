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

			void main(void) {
				gl_Position = uViewProjTransform
					* uModelTransform
					* vec4(aSquareVertexPosition, 1.0);
			}
		`;

		super(game.gl, fragmentshadersrc, vertexshadersrc);

		this.vpattr = this.findAttrib("aSquareVertexPosition");
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, game.squareBuf);
		this.gl.vertexAttribPointer(this.vpattr, 3, this.gl.FLOAT, false, 0, 0);

		this.pixColor = this.findUniform("uPixColor");
		this.modelXform = this.findUniform("uModelTransform");
		this.vpXform = this.findUniform("uViewProjTransform");
	}

	activate(pixColor, vpXform, modelXform) {
		this.use();
		this.gl.enableVertexAttribArray(this.vpattr);
		this.gl.uniformMatrix4fv(this.vpXform, false, vpXform);
		this.gl.uniform4fv(this.pixColor, pixColor);
		this.gl.uniformMatrix4fv(this.modelXform, false, modelXform);
	}
}
