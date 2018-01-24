class MP3 extends Game {
	constructor(canvas_id) {
		super(canvas_id, 0.9, 0.9, 0.9);
		this.shader = new TextureShader(this);
		this.main_camera = new Camera(this,
			vec2.fromValues(0, 0), 100, [210, 5, 585, 590]);
		this.anim_camera = new Camera(this,
			vec2.fromValues(0, 0), 100, [5, 395, 200, 200]);
		this.anim_camera.bg = [0.5, 0.9, 0.7, 1.0];

		this.frames = new Set();
	}

	draw(updates, lag_time) {
		this.main_camera.setup_vp();
		this.anim_camera.setup_vp();
	}
}
