var Key = {
	Left: 37, Up: 38, Right: 39, Down: 40, Space: 32, Zero: 48, One: 49,
	Two: 50, Three: 51, Four: 52, Five: 53, Six: 54, Seven: 55, Eight: 56,
	Nine: 57, A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72,
	I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82,
	S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, LastCode: 222
};

class Game {
	constructor(canvas_id, bg_r, bg_g, bg_b) {
		this.canvas = document.getElementById(canvas_id);
		this.gl = this.canvas.getContext("webgl");
		this.gl.clearColor(bg_r, bg_g, bg_b, 1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.squareBuf = this.gl.createBuffer();
		this.texSquareBuf = this.gl.createBuffer();
		this._prev_time = Date.now();
		this._lag_time = 0;
		this._dt = 1 / 60;
		this._should_run = false;
		this._is_key_down = [];
		this._is_key_down_prev = [];
		this._resource_map = {};
		this._resource_special_unloads = {};
		this._outstanding_loads = 0;
		this._acomplete_callback = null;
		this._scene_stak = new Array();
		this._scene_loaded = new Set();
		this._current_scene = null;

		var __AudioCtx = window.AudioContext || window.webkitAudioContext;
		this._audio_ctx = new __AudioCtx();

		for (var i = 0; i < Key.LastCode; ++i) {
			this._is_key_down[i] = false;
			this._is_key_down_prev[i] = false;
		}

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareBuf);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
			0.5, 0.5, 0.0,
			-0.5, 0.5, 0.0,
			0.5, -0.5, 0.0,
			-0.5, -0.5, 0.0]), this.gl.STATIC_DRAW);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texSquareBuf);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
			1.0, 0.0,
			0.0, 0.0,
			1.0, 1.0,
			0.0, 1.0]), this.gl.STATIC_DRAW);
	}

	update(dt) { }
	draw(updates, lag_time) { }

	_rupdate() {
		if (!this._should_run)
			return;
		window.requestAnimationFrame(this._rupdate.bind(this));

		var current = Date.now();
		var elapsed = current - this._prev_time;
		this._prev_time = current;
		this._lag_time += elapsed;
		var original_lag_time = this._lag_time;
		var update_count = 0;

		while ((this._lag_time >= this._dt * 1000) && this._should_run) {
			this.update(this._dt);

			if (this._current_scene !== null)
				this._current_scene.update(this._dt);

			for (var i = 0; i < Key.LastCode; ++i)
				this._is_key_down_prev[i] = this._is_key_down[i];

			this._lag_time -= this._dt * 1000;
			++update_count;
		}

		this.draw(update_count, original_lag_time);

		if (this._current_scene !== null)
			this._current_scene.draw(update_count, original_lag_time);
	}

	_rkeydown(e) {
		this._is_key_down[e.keyCode] = true;
	}

	_rkeyup(e) {
		this._is_key_down[e.keyCode] = false;
	}

	_acomplete(n, a) {
		this._resource_map[n] = a;
		--this._outstanding_loads;

		if (this._outstanding_loads === 0 && this._acomplete_callback !== null) {
			this._acomplete_callback();
			this._acomplete_callback = null;
		}

		return a;
	}

	_fetch_resource(n, rh, lf, cf, bin) {
		if (this.hasResource(n)) {
			if (cf !== null && cf !== undefined)
				cf(n);
		} else {
			++this._outstanding_loads;
			var req = new XMLHttpRequest();
			req.open('GET', n, true);
			if (bin)
				req.responseType = 'arraybuffer';

			if (rh !== null && rh !== undefined)
				req.setRequestHeader('Content-Type', rh);

			req.onload = () => {
				var l = lf(req);
				if (l !== null && l !== undefined)
					this._acomplete(n, l);
				if (cf !== null && cf !== undefined)
					cf(n);
			};

			req.send();
		}
	}

	start() {
		this._should_run = true;
		window.requestAnimationFrame(this._rupdate.bind(this));
		window.addEventListener('keyup', this._rkeyup.bind(this));
		window.addEventListener('keydown', this._rkeydown.bind(this));
	}

	isKeyDown(k) {
		return this._is_key_down[k];
	}

	isKeyPressed(k) {
		return this._is_key_down[k] && (!this._is_key_down_prev[k]);
	}

	isKeyReleased(k) {
		return (!this._is_key_down[k]) && this._is_key_down_prev[k];
	}

	hasResource(a) {
		return a in this._resource_map;
	}

	getResource(a) {
		return this.hasResource(a) ? this._resource_map[a] : null;
	}

	rmResource(n) {
		if (n in this._resource_special_unloads) {
			this._resource_special_unloads[n]();
			delete this._resource_special_unloads[n];
		}

		if (n in this._resource_map)
			delete this._resource_map[n];
	}

	set asyncLoadCallback(f) {
		if (this._outstanding_loads === 0)
			f();
		else
			this._acomplete_callback = f;
	}

	fetchXmlResource(n, cf) {
		this._fetch_resource(n, "application/xml", req => req.responseXML, cf);
	}

	fetchTextResource(n, cf) {
		this._fetch_resource(n, "text/plain", req => req.responseText, cf);
	}

	fetchJsonResource(n, cf) {
		this._fetch_resource(n, "application/json", req => JSON.parse(req.responseText), cf);
	}

	fetchAudioResource(n, cf) {
		this._fetch_resource(n, null, req => {
			this._audio_ctx.decodeAudioData(req.response, buf => {
				this._acomplete(n, buf);

				if (cf !== null && cf !== undefined)
					cf(n);
			});
		}, null, true);
	}

	fetchImageResource(n, cf) {
		if (this.hasResource(n)) {
			if (cf !== null && cf !== undefined)
				cf(n);
		} else {
			++this._outstanding_loads;
			var img = new Image();
			img.src = n;
			img.onload = () => {
				var texid = this.gl.createTexture();
				this.gl.bindTexture(this.gl.TEXTURE_2D, texid);
				this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
				this.gl.generateMipmap(this.gl.TEXTURE_2D);
				this.gl.bindTexture(this.gl.TEXTURE_2D, null);

				this._resource_special_unloads[n] = () => {
					this.gl.deleteTexture(texid);
				};

				this._acomplete(n, {
					id: texid,
					width: img.naturalWidth,
					height: img.naturalHeight
				});

				if (cf !== null && cf !== undefined)
					cf(n);
			};
		}
	}

	set currentScene(s) {
		this._current_scene = s;
		if (!s.loaded)
			s.load();
		s.onEnter(null);
	}
}

class Scene {
	constructor(game) {
		this.game = game;
	}
	update(dt) { }
	draw(updates, lag_time) { }
	onEnter(from) { }
	onLeave(to) { }
	onLoad() { }
	onUnload() { }

	load() {
		if (!this.game._scene_loaded.has(this)) {
			this.game._scene_loaded.add(this);
			this.onLoad();
		}
	}

	get loaded() {
		return this.game._scene_loaded.has(this);
	}

	unload() {
		if (this.game._scene_loaded.has(this) &&
			this.game._current_scene !== this &&
			!(this in this.game._scene_stak)) {
			this.game._scene_loaded.delete(this);
			this.onUnload();
		}
	}

	pushAndSwitchScene(s) {
		this.game._scene_stak.push(this);
		this.game._current_scene = s;
		if (!s.loaded)
			s.load();
		s.onEnter(this);
	}

	switchScene(s) {
		this.game._current_scene = s;
		if (!s.loaded)
			s.load();
		this.onLeave(s);
		s.onEnter(this);
	}

	popScene() {
		if (this.game._scene_stak.length > 0) {
			var n = this.game._scene_stak.pop();
			this.game._current_scene = n;
			this.onLeave(n);
		} else {
			this.game._should_run = false;
			this.game._scene_loaded.forEach(s => s.unload());
		}
	}

	loadFromXml(path, sqShader) {
		if (!this.game.hasResource(path))
			return null;
		var xml = this.game.getResource(path);

		var cameras = [...xml.getElementsByTagName("Camera")].map(c => {
			var cx = Number(c.getAttribute("CenterX"));
			var cy = Number(c.getAttribute("CenterY"));
			var w = Number(c.getAttribute("Width"));
			var v = c.getAttribute("Viewport").split(" ").map(Number);
			var cam = new Camera(this.game, vec2.fromValues(cx, cy), w, v);
			cam.bg = c.getAttribute("BgColor").split(" ").map(Number);
			return cam;
		});

		var squares = [...xml.getElementsByTagName("Square")].map(s => {
			var sq = new Renderable(sqShader);
			sq.xform.x = Number(s.getAttribute("PosX"));
			sq.xform.y = Number(s.getAttribute("PosY"));
			sq.xform.width = Number(s.getAttribute("Width"));
			sq.xform.height = Number(s.getAttribute("Height"));
			sq.xform.rot_deg = Number(s.getAttribute("Rotation"));
			sq.color = s.getAttribute("Color").split(" ").map(Number);
			return sq;
		});

		return {Cameras: cameras, Squares: squares};
	}

	loadFromJson(path, sqShader) {
		if (!this.game.hasResource(path))
			return null;
		var json = this.game.getResource(path);

		var cam = new Camera(this.game,
			vec2.fromValues(json["Camera"]["Center"][0], json["Camera"]["Center"][1]),
			json["Camera"]["Width"], json["Camera"]["Viewport"]);
		cam.bg = json["Camera"]["BgColor"];

		var squares = json["Square"].map(s => {
			var sq = new Renderable(sqShader);
			sq.xform.x = s["Pos"][0];
			sq.xform.y = s["Pos"][1];
			sq.xform.width = s["Width"];
			sq.xform.height = s["Height"];
			sq.xform.rot_deg = s["Rotation"];
			sq.color = s["Color"];
			return sq;
		});

		return {Cameras: [cam], Squares: squares};
	}
}

class Shader {
	constructor(gl, fragsrc, vertsrc) {
		this.gl = gl;

		var frag = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(frag, fragsrc);
		gl.compileShader(frag);
		if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS))
			alert("Error compiling fragment shader: " + gl.getShaderInfoLog(frag));

		var vert = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vert, vertsrc);
		gl.compileShader(vert);
		if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS))
			alert("Error compiling vertex shader: " + gl.getShaderInfoLog(vert));

		this._shader = gl.createProgram();
		gl.attachShader(this._shader, frag);
		gl.attachShader(this._shader, vert);
		gl.linkProgram(this._shader);
		if (!gl.getProgramParameter(this._shader, gl.LINK_STATUS))
			alert("Error linking shader");
	}

	findAttrib(a) {
		return this.gl.getAttribLocation(this._shader, a);
	}
	findUniform(u) {
		return this.gl.getUniformLocation(this._shader, u);
	}
	use() {
		this.gl.useProgram(this._shader);
	}
}

class Camera {
	constructor(game, center, width, viewport) {
		this.gl = game.gl;
		this.center = center;
		this.width = width;
		this.viewport = viewport;
		this.near = 0;
		this.far = 1000;
		this.bg = [0.8, 0.8, 0.8, 1.0];

		this._view = mat4.create();
		this._proj = mat4.create();
		this._vp = mat4.create();
	}

	get vp() {
		return this._vp;
	}

	setup_vp() {
		this.gl.viewport(this.viewport[0], this.viewport[1], this.viewport[2], this.viewport[3]);
		this.gl.scissor(this.viewport[0], this.viewport[1], this.viewport[2], this.viewport[3]);
		this.gl.clearColor(this.bg[0], this.bg[1], this.bg[2], this.bg[3]);
		this.gl.enable(this.gl.SCISSOR_TEST);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.disable(this.gl.SCISSOR_TEST);

		mat4.lookAt(this._view, [this.center[0], this.center[1], 10],
			[this.center[0], this.center[1], 0], [0, 1, 0]);

		var half_w = this.width * 0.5;
		var half_h = half_w * this.viewport[3] / this.viewport[2];
		mat4.ortho(this._proj, -half_w, half_w, -half_h, half_h, this.near, this.far);

		mat4.multiply(this._vp, this._proj, this._view);
	}
}

class Transform {
	constructor() {
		this.pos = vec2.fromValues(0, 0);
		this.scale = vec2.fromValues(1, 1);
		this.rot = 0;
	}

	get x() {
		return this.pos[0];
	}
	set x(_x) {
		this.pos[0] = _x;
	}
	get y() {
		return this.pos[1];
	}
	set y(_y) {
		this.pos[1] = _y;
	}
	get width() {
		return this.scale[0];
	}
	set width(_w) {
		this.scale[0] = _w;
	}
	get height() {
		return this.scale[1];
	}
	set height(_h) {
		this.scale[1] = _h;
	}
	get rot_rad() {
		return this.rot;
	}
	get rot_deg() {
		return this.rot * 180.0 / Math.PI;
	}
	set rot_deg(_d) {
		this.rot_rad = _d * Math.PI / 180.0;
	}

	set rot_rad(_r) {
		this.rot = _r - 2.0 * Math.PI * Math.floor(_r / (2.0 * Math.PI));
	}

	get x_form() {
		var m = mat4.create();
		mat4.translate(m, m, vec3.fromValues(this.x, this.y, 0.0));
		mat4.rotateZ(m, m, this.rot_rad);
		mat4.scale(m, m, vec3.fromValues(this.width, this.height, 1.0));
		return m;
	}
}

class Renderable {
	constructor(shader) {
		this.shader = shader;
		this.color = [1.0, 1.0, 1.0, 1.0];
		this.xform = new Transform();
		this.creation_time = Date.now();
	}

	draw(vp) {
		this.shader.activateShader(this.color, vp);
		this.shader.loadObjectTransform(this.xform.x_form);
		this.shader.gl.drawArrays(this.shader.gl.TRIANGLE_STRIP, 0, 4);
	}
}

class TextureRenderable extends Renderable {
	constructor(shader, texture) {
		super(shader);
		this.color = [1.0, 1.0, 1.0, 0.0];
		this.texid = texture.id;
	}

	draw(vp) {
		var gl = this.shader.gl;
		gl.bindTexture(gl.TEXTURE_2D, this.texid);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_FILTER);
		super.draw(vp);
	}
}
