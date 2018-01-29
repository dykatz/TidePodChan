class MP3 extends Game {
	constructor(canvas_id) {
		super(canvas_id, 0.9, 0.9, 0.9);
		this.sshader = new SimpleShader(this);
		this.tshader = new TextureShader(this);
		this.main_camera = new Camera(this, vec2.fromValues(0, 0), 100, [260, 5, 535, 590]);
		this.anim_camera = new Camera(this, vec2.fromValues(0, 0), 100, [5, 345, 250, 250]);
		this.anim_camera.bg = [0.8, 1.0, 0.8, 1.0];

		var d = 108;
		this.zib0_camera = new Camera(this, vec2.fromValues(0, 0), 100, [130 - d / 2, 15 + d * 2, d, d]);
		this.zib1_camera = new Camera(this, vec2.fromValues(0, 0), 100, [127.5 - d, 10 + d, d, d]);
		this.zib2_camera = new Camera(this, vec2.fromValues(0, 0), 100, [132.5, 10 + d, d, d]);
		this.zib3_camera = new Camera(this, vec2.fromValues(0, 0), 100, [130 - d / 2, 5, d, d]);

		this.q_mode = false;

		this.bgborder = [];
		for (var i = 0; i < 4; ++i) {
			this.bgborder[i] = new Renderable(this.sshader);
			this.bgborder[i].color = [0.0, 0.0, 0.0, 0.5];
		}
		for (var i = 4; i < 8; ++i) {
			this.bgborder[i] = new Renderable(this.sshader);
			this.bgborder[i].xform.width = 4;
			this.bgborder[i].xform.height = 4;
		}
		this.bgborder[4].color = [0.0, 0.7, 0.2, 1.0];
		this.bgborder[5].color = [0.2, 0.3, 1.0, 1.0];
		this.bgborder[6].color = [1.0, 0.5, 0.0, 1.0];
		this.bgborder[7].color = [1.0, 0.5, 1.0, 1.0];

		this.fetchImageResource("assets/mp3/minion_sprite.png", n => {
			var r = this.getResource(n);
			this.background = new TextureRenderable(this.tshader, r);
			var w = 90, h = w * r.height / r.width;
			this.background.xform.width = w;
			this.background.xform.height = h;
			this.bgborder[0].xform.height = h + 2;
			this.bgborder[0].xform.x = -w / 2 - 0.5;
			this.bgborder[1].xform.height = h + 2;
			this.bgborder[1].xform.x = w / 2 + 0.5;
			this.bgborder[2].xform.width = w;
			this.bgborder[2].xform.y = -h / 2 - 0.5;
			this.bgborder[3].xform.width = w;
			this.bgborder[3].xform.y = h / 2 + 0.5;
			this.bgborder[4].xform.x = this.bgborder[0].xform.x;
			this.bgborder[4].xform.y = this.bgborder[2].xform.y;
			this.bgborder[5].xform.x = this.bgborder[0].xform.x;
			this.bgborder[5].xform.y = this.bgborder[3].xform.y;
			this.bgborder[6].xform.x = this.bgborder[1].xform.x;
			this.bgborder[6].xform.y = this.bgborder[2].xform.y;
			this.bgborder[7].xform.x = this.bgborder[1].xform.x;
			this.bgborder[7].xform.y = this.bgborder[3].xform.y;
		});
	}

	update(dt) {
		if (this.isKeyPressed(Key.Q))
			this.q_mode = !this.q_mode;
	}

	draw(updates, lag_time) {
		if (!this.background)
			return;

		this.main_camera.setup_vp();
		this.background.draw(this.main_camera.vp);
		for (var i = 0; i < 8; ++i)
			this.bgborder[i].draw(this.main_camera.vp);
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
