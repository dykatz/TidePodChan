var Key = {
	Left: 37, Up: 38, Right: 39, Down: 40, Space: 32, Zero: 48, One: 49,
	Two: 50, Three: 51, Four: 52, Five: 53, Six: 54, Seven: 55, Eight: 56,
	Nine: 57, A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72,
	I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82,
	S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, LastCode: 222
};

class Game {
	constructor(canvas_id) {
		this.canvas = document.getElementById(canvas_id);
		this.gl = this.canvas.getContext("webgl");
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this._prev_time = Date.now();
		this._should_run = false;
		this._is_key_down = [];
		this._is_key_down_prev = [];

		for (var i = 0; i < Key.LastCode; ++i) {
			this._is_key_down[i] = false;
			this._is_key_down_prev[i] = false;
		}
	}

	_raw_update() {
		if (!this._should_run) return;
		window.requestAnimationFrame(this._raw_update.bind(this));

		var current = Date.now();
		var elapsed = current - this._prev_time;
		this._prev_time = current;

		this.update(elapsed);
		this.draw();

		for (var i = 0; i < Key.LastCode; ++i)
			this._is_key_down_prev[i] = this._is_key_down[i];
	}

	_rkeydown(e) {
		this._is_key_down[e.keyCode] = true;
	}

	_rkeyup(e) {
		this._is_key_down[e.keyCode] = false;
	}

	start() {
		this._should_run = true;
		window.requestAnimationFrame(this._raw_update.bind(this));
		window.addEventListener('keyup', this._rkeyup.bind(this));
		window.addEventListener('keydown', this._rkeydown.bind(this));
	}

	quit() {
		this._should_run = false;
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
}
