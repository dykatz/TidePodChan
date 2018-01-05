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
	}

	_raw_update() {
		if (!this._should_run) return;
		window.requestAnimationFrame(this._raw_update.bind(this));

		var current = Date.now();
		var elapsed = current - this._prev_time;
		this._prev_time = current;
		this._lag_time += elapsed;

		while (this._lag_time > this._t_dt && this._should_run) {
			this.update(this._t_dt);
			this._lag_time -= this._t_dt;
		}

		this.draw();
	}

	start() {
		this._should_run = true;
		window.requestAnimationFrame(this._raw_update.bind(this));
	}

	quit() {
		this._should_run = false;
	}
}
