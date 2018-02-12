class MP4 extends Game {
	constructor(id) {
		super(id, 0.9, 0.9, 0.9);
		this.sshader = new SimpleShader(this);
		this.tshader = new TextureShader(this);

		this.main_cam = new Camera(this, vec2.fromValues(0.0, 0.0), 100,
			[5, 5, this.canvas.width - 10, this.canvas.height - 115]);

		this.sm_cam = [];
		this.sm_cam_disabled = [];
		for (var i = 0; i < 4; ++i) {
			this.sm_cam[i] = new Camera(this, vec2.fromValues(0.0, 0.0), 10, [
				5 + i * (((this.canvas.width - 25) / 4) + 5),
				this.canvas.height - 105, (this.canvas.width - 25) / 4, 100]);
			this.sm_cam_disabled[i] = true;
		}

		this.fetchImageResource("assets/mp4/SpriteSheet.png", n => {
			var r = this.getResource(n);

			this.hero = new TextureRenderable(this.tshader, r);
			this.hero.uvrect.x = 0.07;
			this.hero.uvrect.y = 0.17;
			this.hero.uvrect.w = this.hero.uvrect.x * 2;
			this.hero.uvrect.h = this.hero.uvrect.y * 2;
			this.hero.xform.width = 50 * this.hero.uvrect.w / this.hero.uvrect.h;
			this.hero.xform.height = 50;
		});
	}

	draw() {
		this.main_cam.setup_vp();

		if (this.hero && this.main_cam.mouse_over)
			this.hero.draw(this.main_cam.vp);

		for (var i = 0; i < 4; ++i) {
			if (this.sm_cam_disabled[i] && !this.isKeyDown(Key.P))
				continue;

			this.sm_cam[i].setup_vp();
		}
	}
}
