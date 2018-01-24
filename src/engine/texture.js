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

		var gl = game.gl;
		this.gl = gl; this.squareBuf = game.squareBuf;
		var fragmentshader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentshader, fragmentshadersrc);
		gl.compileShader(fragmentshader);
		var vertexshader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexshader, vertexshadersrc);
		gl.compileShader(vertexshader);
		this.shader = gl.createProgram();
		gl.attachShader(this.shader, fragmentshader);
		gl.attachShader(this.shader, vertexshader);
		gl.linkProgram(this.shader);

		this.vpattr = gl.getAttribLocation(this.shader, "aSquareVertexPosition");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuf);
		gl.vertexAttribPointer(this.vpattr, 3, gl.FLOAT, false, 0, 0);

		this.texCoord = gl.getAttribLocation(this.shader, "aTextureCoordinate");
		this.pixColor = gl.getUniformLocation(this.shader, "uPixColor");
		this.modelXform = gl.getUniformLocation(this.shader, "uModelTransform");
		this.vpXform = gl.getUniformLocation(this.shader, "uViewProjTransform");
	}

	activateShader(pixColor, vpXform) {
		this.gl.useProgram(this.shader);
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
