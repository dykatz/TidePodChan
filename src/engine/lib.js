var Key = {
	Shift: 16, Left: 37, Up: 38, Right: 39, Down: 40, Space: 32, Zero: 48,
	One: 49, Two: 50, Three: 51, Four: 52, Five: 53, Six: 54, Seven: 55,
	Eight: 56, Nine: 57, A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71,
	H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81,
	R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
	LastCode: 222
};

var Mouse = { Left: 0, Middle: 1, Right: 2 };

class Game {
	constructor(canvas_id, bg_r, bg_g, bg_b) {
		this.canvas = document.getElementById(canvas_id);
		this.gl = this.canvas.getContext("webgl");
		this.gl.clearColor(bg_r, bg_g, bg_b, 1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.squareBuf = this.gl.createBuffer();
		this.lineBuf = this.gl.createBuffer();
		this._prev_time = Date.now();
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
		this._mouse_x = 0;
		this._mouse_y = 0;
		this._is_mouse_down = [];
		this._is_mouse_down_prev = [];
		this._tweens = new Set();

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

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lineBuf);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
			0.5, 0.5, 0.0,
			-0.5, -0.5, 0.0]), this.gl.STATIC_DRAW);

		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.gl.enable(this.gl.BLEND);

		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
	}

	update(dt) { }
	draw() { }

	_rupdate() {
		if (!this._should_run)
			return;

		window.requestAnimationFrame(this._rupdate.bind(this));

		var current = Date.now();
		var elapsed = current - this._prev_time;
		this._prev_time = current;
		this._tweens.forEach(t => t._update(elapsed / 1000.0));
		this.update(elapsed / 1000.0);

		if (this._current_scene !== null)
			this._current_scene.update(elapsed / 1000.0);

		for (var i = 0; i < Key.LastCode; ++i)
			this._is_key_down_prev[i] = this._is_key_down[i];

		for (var i = 0; i < 3; ++i)
			this._is_mouse_down_prev[i] = this._is_mouse_down[i];

		this.draw();

		if (this._current_scene !== null)
			this._current_scene.draw();
	}

	_rkeydown(e) {
		this._is_key_down[e.keyCode] = true;
	}

	_rkeyup(e) {
		this._is_key_down[e.keyCode] = false;
	}

	_rmousemove(e) {
		var r = this.canvas.getBoundingClientRect();
		this._mouse_x = Math.round((e.clientX - r.left) * (this.canvas.width / r.width));
		this._mouse_y = this.canvas.height - Math.round((e.clientY - r.top) * (this.canvas.height / r.height));
	}

	_rmouseleave(e) {
		this._mouse_x = null;
		this._mouse_y = null;
	}

	_rmousedown(e) {
		this._is_mouse_down[e.button] = true;
	}

	_rmouseup(e) {
		this._is_mouse_down[e.button] = false;
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
		this.canvas.addEventListener('mousemove', this._rmousemove.bind(this));
		this.canvas.addEventListener('mousedown', this._rmousedown.bind(this));
		this.canvas.addEventListener('mouseup', this._rmouseup.bind(this));
		this.canvas.addEventListener('mouseleave', this._rmouseleave.bind(this));
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

	isMouseDown(b) {
		return this._is_mouse_down[b];
	}

	isMousePressed(b) {
		return this._is_mouse_down[b] && (!this._is_mouse_down_prev[b]);
	}

	isMouseReleased(b) {
		return (!this._is_mouse_down[b]) && this._is_mouse_down_prev[b];
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
				var gl = this.gl;
				var texid = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, texid);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
				gl.generateMipmap(gl.TEXTURE_2D);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
				gl.bindTexture(gl.TEXTURE_2D, null);

				this._resource_special_unloads[n] = () => {
					gl.deleteTexture(texid);
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
	constructor(game) { this.game = game; }
	update(dt) { }
	draw() { }
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

class GameObject {
	constructor(game, sshader) {
		this.game = game;
		this._kids = new Set();

		if (sshader) {
			this._lines = [];

			for (var i = 0; i < 4; ++i)
				this._lines[i] = new Line(sshader);
		}
	}

	update(dt) {
		this._kids.forEach(k => k.update(dt));
	}

	draw(vp) {
		this._kids.forEach(k => k.draw(vp));

		if (this.game.isKeyDown(Key.B))
			this.debug_draw(vp);
	}

	addKid(k) {
		if (k._parent)
			return false;

		k._parent = this;
		this._kids.add(k);
		return true;
	}

	rmKid(k) {
		this._kids.delete(k);
	}

	destroy() {
		if (this._parent)
			this._parent._kids.delete(this);

		this._kids.forEach(k => k.destroy());
	}

	get box() {
		if (this._kids.size < 1) return new Box(0, 0, 0, 0);

		var boxes = [...this._kids.map(k => k.box)];
		var left = boxes.reduce((t, v) => (t && t < b.left) ? t : b.left, null);
		var right = boxes.reduce((t, v) => (t && t > b.right) ? t : b.right, null);
		var top = boxes.reduce((t, v) => (t && t > b.top) ? t : b.top, null);
		var bottom = boxes.reduce((t, v) => (t && t < b.bottom) ? t : b.bottom, null);

		return new Box(left + (right - left) / 2, bottom + (top - bottom) / 2,
			right - left, top - bottom);
	}

	debug_draw(vp, b, no_recurse) {
		b = b || this.box;

		this._lines[0].p1x = b.left;
		this._lines[0].p1y = b.top;
		this._lines[0].p2x = b.left;
		this._lines[0].p2y = b.bottom;

		this._lines[1].p1x = b.right;
		this._lines[1].p1y = b.top;
		this._lines[1].p2x = b.right;
		this._lines[1].p2y = b.bottom;

		this._lines[2].p1x = b.left;
		this._lines[2].p1y = b.top;
		this._lines[2].p2x = b.right;
		this._lines[2].p2y = b.top;

		this._lines[3].p1x = b.left;
		this._lines[3].p1y = b.bottom;
		this._lines[3].p2x = b.right;
		this._lines[3].p2y = b.bottom;

		for (var i = 0; i < 4; ++i)
			this._lines[i].draw(vp);

		if (no_recurse)
			return;

		this._kids.forEach(k => k.debug_draw(vp));
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

	findAttrib(a) { return this.gl.getAttribLocation(this._shader, a); }
	findUniform(u) { return this.gl.getUniformLocation(this._shader, u); }
	use() { this.gl.useProgram(this._shader); }
}

class Camera {
	constructor(game, center, width, viewport) {
		this.game = game;
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

	get vp() { return this._vp; }

	get box() {
		return new Box(this.center[0], this.center[1], this.width,
			this.width * this.viewport[3] / this.viewport[2]);
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

	get mouse_x() {
		if (this.game._mouse_x) {
			var m = this.center[0] - this.width / 2;
			return m + (this.game._mouse_x - this.viewport[0]) * this.width / this.viewport[2];
		}
	}

	get mouse_y() {
		if (this.game._mouse_y) {
			var m = this.center[0] - this.width * this.viewport[3] / this.viewport[2] / 2;
			return m + (this.game._mouse_y - this.viewport[1]) * this.width / this.viewport[2];
		}
	}

	get mouse_over() {
		if (this.game._mouse_x && this.game._mouse_y)
			return this.game._mouse_x >= this.viewport[0]
				&& this.game._mouse_x < this.viewport[0] + this.viewport[2]
				&& this.game._mouse_y >= this.viewport[1]
				&& this.game._mouse_y < this.viewport[1] + this.viewport[3];
		return false;
	}
}

class Transform {
	constructor() {
		this.pos = vec2.fromValues(0, 0);
		this.scale = vec2.fromValues(1, 1);
		this.rot = 0;
	}

	get x() { return this.pos[0]; }
	set x(_x) { this.pos[0] = _x; }
	get y() { return this.pos[1]; }
	set y(_y) { this.pos[1] = _y; }
	get width() { return this.scale[0]; }
	set width(_w) { this.scale[0] = _w; }
	get height() { return this.scale[1]; }
	set height(_h) { this.scale[1] = _h; }
	get left() { return this.x - this.width / 2; }
	get right() { return this.x + this.width / 2; }
	get top() { return this.y + this.height / 2; }
	get bottom() { return this.y - this.height / 2; }
	get rot_rad() { return this.rot; }
	get rot_deg() { return this.rot * 180.0 / Math.PI; }
	set rot_deg(_d) { this.rot_rad = _d * Math.PI / 180.0; }

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

	get box() {
		return new Box(this.x, this.y,
			Math.sin(this.rot) * this.height + Math.cos(this.rot) * this.width,
			Math.sin(this.rot) * this.width + Math.cos(this.rot) * this.height);
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
		this.shader.activate(this.color, vp, this.xform.x_form);
		this.shader.gl.drawArrays(this.shader.gl.TRIANGLE_STRIP, 0, 4);
	}
}

var Easing = {
	Linear: x => x,
	QuadIn: x => x*x,
	QuadOut: x => 1-(1-x)*(1-x),
	CubicIn: x => x*x*x,
	CubicOut: x => 1-(1-x)*(1-x)*(1-x),
	QuartIn: x => x*x*x*x,
	QuartOut: x => 1-(1-x)*(1-x)*(1-x)*(1-x),
	QuintIn: x => x*x*x*x*x,
	QuintOut: x => 1-(1-x)*(1-x)*(1-x)*(1-x)*(1-x),
	ExpoIn: x => Math.pow(2, 10*(x-1)),
	ExpoOut: x => 1-Math.pow(2, 10*(-x)),
	SineIn: x => 1-Math.cos(x*Math.PI*0.5),
	SineOut: x => Math.cos((1-x)*Math.PI*0.5),
	CircIn: x => 1-Math.sqrt(1-x*x),
	CircOut: x => Math.sqrt(1-(1-x)*(1-x)),
	BackIn: x => x*x*(2.7*x-1.7),
	BackOut: x => 1-(1-x)*(1-x)*(2.7*(1-x)-1.7),
	ElasticIn: x => -(Math.pow(2, 10*(x-1))*Math.sin((x-1.075)*Math.PI*2/0.3)),
	ElasticOut: x => 1+(Math.pow(2, 10*(-x))*Math.sin((-x-0.075)*Math.PI*2/0.3)),
	Harmonic: (freq) => {
		var omega = freq * 2 * Math.PI;
		return (p) => 1-(1-p)*(1-p)*Math.cos(p*omega);
	}
};

class Tween {
	constructor(game, dt) {
		this.game = game;
		this.easing = Easing.Linear;
		this.delay = 0;
		this._prog = 0;
		this._rate = dt > 0 ? 1 / dt : 0;
		this._vars = new Set();
		game._tweens.add(this);
	}

	add_var(start, finish, set) {
		this._vars.add({ set: set, start: start, diff: finish - start });
	}

	_update(dt) {
		if (this.delay > 0) {
			this.delay -= dt;
		} else {
			if (this._onstart) {
				this._onstart();
				this._onstart = null;
			}

			this._prog += dt * this._rate;
			var x = this._prog >= 1 ? 1 : this.easing(this._prog);
			this._vars.forEach(v => v.set(v.start + v.diff * x));

			if (this._onupdate)
				this._onupdate();

			if (this._prog >= 1)
				this.abort();
		}
	}

	abort() {
		if (this._oncomplete)
			this._oncomplete();

		this.game._tweens.delete(this);
	}
}

class Box {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
	}

	get left() { return this.x - this.width / 2; }
	get right() { return this.x + this.width / 2; }
	get top() { return this.y + this.height / 2; }
	get bottom() { return this.y - this.height / 2; }

	contains(x, y) {
		return x > this.left && x < this.right && y > this.bottom && y < this.top;
	}
}
