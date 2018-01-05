var Key = {
	Left: 37, Up: 38, Right: 39, Down: 40, Space: 32, Zero: 48, One: 49,
	Two: 50, Three: 51, Four: 52, Five: 53, Six: 54, Seven: 55, Eight: 56,
	Nine: 57, A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72,
	I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82,
	S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, LastCode: 222
};

class Game {
	constructor(canvas_id, target_fps) {
		this.canvas = document.getElementById(canvas_id);
		this.gl = this.canvas.getContext("webgl");
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this._t_dt = 1000 / target_fps;
		this._prev_time = Date.now();
		this._lag_time = 0;
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
		this._lag_time += elapsed;

		this.update(this._lag_time);
		this.draw();
		this._lag_time = 0;

		for (var i = 0; i < Key.LastCode; ++i)
			this._is_key_down_prev[i] = this._is_key_down[i];
	}

	_raw_on_key_down(e) {
		this._is_key_down[e.keyCode] = true;
	}

	_raw_on_key_up(e) {
		this._is_key_down[e.keyCode] = false;
	}

	start() {
		this._should_run = true;
		window.requestAnimationFrame(this._raw_update.bind(this));
		window.addEventListener('keyup', this._raw_on_key_up.bind(this));
		window.addEventListener('keydown', this._raw_on_key_down.bind(this));
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
