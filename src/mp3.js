class MP3 extends Game {
	constructor(canvas_id) {
		super(canvas_id, 0.9, 0.9, 0.9);
		this.shader = new TextureShader(this);
		this.main_camera = new Camera(this, vec2.fromValues(0, 0), 100, [260, 5, 535, 590]);
		this.anim_camera = new Camera(this, vec2.fromValues(0, 0), 100, [5, 345, 250, 250]);
		this.anim_camera.bg = [0.8, 1.0, 0.8, 1.0];

		var d = 108;
		this.zib0_camera = new Camera(this, vec2.fromValues(0, 0), 100, [130-d/2, 15+d*2, d, d]);
		this.zib1_camera = new Camera(this, vec2.fromValues(0, 0), 100, [127.5-d, 10+d, d, d]);
		this.zib2_camera = new Camera(this, vec2.fromValues(0, 0), 100, [132.5, 10+d, d, d]);
		this.zib3_camera = new Camera(this, vec2.fromValues(0, 0), 100, [130-d/2, 5, d, d]);

		this.frames = new Set();
	}

	draw(updates, lag_time) {
		this.main_camera.setup_vp();
		this.anim_camera.setup_vp();
		this.zib0_camera.setup_vp();
		this.zib1_camera.setup_vp();
		this.zib2_camera.setup_vp();
		this.zib3_camera.setup_vp();
	}
}
