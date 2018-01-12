class SimpleShader {
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

		this.gl = game.gl;
		var fragmentshader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		this.gl.shaderSource(fragmentshader, fragmentshadersrc);
		this.gl.compileShader(fragmentshader);
		var vertexshader = this.gl.createShader(this.gl.VERTEX_SHADER);
		this.gl.shaderSource(vertexshader, vertexshadersrc);
		this.gl.compileShader(vertexshader);
		this.shader = this.gl.createProgram();
		this.gl.attachShader(this.shader, fragmentshader);
		this.gl.attachShader(this.shader, vertexshader);
		this.gl.linkProgram(this.shader);

		this.vpattr = this.gl.getAttribLocation(this.shader, "aSquareVertexPosition");
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, game.squareBuf);
		this.gl.vertexAttribPointer(this.vpattr, 3, this.gl.FLOAT, false, 0, 0);

		this.pixColor = this.gl.getUniformLocation(this.shader, "uPixColor");
		this.modelXform = this.gl.getUniformLocation(this.shader, "uModelTransform");
		this.vpXform = this.gl.getUniformLocation(this.shader, "uViewProjTransform");
	}

	activateShader(pixColor, vpXform) {
		this.gl.useProgram(this.shader);
		this.gl.uniformMatrix4fv(this.vpXform, false, vpXform);
		this.gl.enableVertexAttribArray(this.vpattr);
		this.gl.uniform4fv(this.pixColor, pixColor);
	}

	loadObjectTransform(modelXform) {
		this.gl.uniformMatrix4fv(this.modelXform, false, modelXform);
	}
}
