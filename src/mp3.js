class MP3 extends Game {
	constructor(canvas_id) {
		super(canvas_id, 0.9, 0.9, 0.9);
		this.tshader = new TextureShader(this);
		this.main_camera = new Camera(this, vec2.fromValues(0, 0), 100, [260, 5, 535, 590]);
		this.anim_camera = new Camera(this, vec2.fromValues(0, 0), 100, [5, 345, 250, 250]);
		this.anim_camera.bg = [0.8, 1.0, 0.8, 1.0];

		var d = 108;
		this.zib0_camera = new Camera(this, vec2.fromValues(0, 0), 100, [130 - d / 2, 15 + d * 2, d, d]);
		this.zib1_camera = new Camera(this, vec2.fromValues(0, 0), 100, [127.5 - d, 10 + d, d, d]);
		this.zib2_camera = new Camera(this, vec2.fromValues(0, 0), 100, [132.5, 10 + d, d, d]);
		this.zib3_camera = new Camera(this, vec2.fromValues(0, 0), 100, [130 - d / 2, 5, d, d]);

		this.fetchImageResource("assets/mp3/minion_sprite.png", n => {
			var r = this.getResource(n);
			this.background = new TextureRenderable(this.tshader, r);
			this.background.xform.width = 90;
			this.background.xform.height = 90 * r.height / r.width;
		});
	}

	draw(updates, lag_time) {
		if (!this.background)
			return;

		this.main_camera.setup_vp();
		this.background.draw(this.main_camera.vp);
		this.anim_camera.setup_vp();
		this.background.draw(this.anim_camera.vp);
		this.zib0_camera.setup_vp();
		this.background.draw(this.zib0_camera.vp);
		this.zib1_camera.setup_vp();
		this.background.draw(this.zib1_camera.vp);
		this.zib2_camera.setup_vp();
		this.background.draw(this.zib2_camera.vp);
		this.zib3_camera.setup_vp();
		this.background.draw(this.zib3_camera.vp);
	}
}
