class MP3 extends Game {
	constructor(canvas_id) {
		super(canvas_id, 0.9, 0.9, 0.9);
		this.sshader = new SimpleShader(this);
		this.tshader = new TextureShader(this);
		this.main_camera = new Camera(this, vec2.fromValues(0, 0), 100, [260, 5, 535, 590]);
		this.anim_camera = new Camera(this, vec2.fromValues(0, 0), 100, [5, 345, 250, 250]);
		this.anim_camera.bg = [0.8, 1.0, 0.8, 1.0];

		var d = 108;
		this.zib_camera = [];
		this.zib_camera[0] = new Camera(this, vec2.fromValues(0, 0), 100, [130 - d / 2, 15 + d * 2, d, d]);
		this.zib_camera[1] = new Camera(this, vec2.fromValues(0, 0), 100, [127.5 - d, 10 + d, d, d]);
		this.zib_camera[2] = new Camera(this, vec2.fromValues(0, 0), 100, [132.5, 10 + d, d, d]);
		this.zib_camera[3] = new Camera(this, vec2.fromValues(0, 0), 100, [130 - d / 2, 5, d, d]);

		this.zib_block = [];
		for (var i = 0; i < 4; ++i) {
			this.zib_block[i] = new Renderable(this.sshader);
			this.zib_block[i].xform.pos = this.zib_camera[i].center;
		}
		this.zib_block[0].color = [1.0, 1.0, 0.0, 1.0];
		this.zib_block[1].color = [1.0, 0.0, 1.0, 1.0];
		this.zib_block[2].color = [0.0, 1.0, 1.0, 1.0];
		this.zib_block[3].color = [0.5, 0.5, 1.0, 1.0];

		this.q_mode = false;
		this.frame_gap = 0;

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
			this.background = new Sprite(this.tshader, r);
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

			this.animation = new Sprite(this.tshader, r);
			if (this.bound) {
				this.animation.xform.scale = this.bound.xform.scale;
				this._sync_zib();
			}
		});

		this.fetchImageResource("assets/mp3/Bound.png", n => {
			var r = this.getResource(n);
			this.bound = new Sprite(this.tshader, r);
			this.bound.xform.width = 10;
			this.bound.xform.height = 10;
			this._sync_zib();

			if (this.animation) {
				this.animation.xform.scale = this.bound.xform.scale;
				this._sync_zib();
			}
		});
	}

	update(dt) {
		if (!this.background || !this.bound)
			return;

		if (this.isKeyPressed(Key.Q)) {
			this.animation.frame_dt = this.q_mode ? 0 : 0.1;
			this.animation.current_frame = 0;
			this.q_mode = !this.q_mode;
		}

		var px = this.bound.xform.x, py = this.bound.xform.y, s = 20;
		var pw = this.bound.xform.width, ph = this.bound.xform.height;
		var pg = this.frame_gap;

		if (this.isKeyDown(Key.Space))
			s *= 0.01;
		else if (this.isKeyDown(Key.Shift))
			s *= 0.1;

		if (this.isKeyDown(Key.A) && !this.isKeyDown(Key.D))
			this.bound.xform.x -= dt * s;
		else if (this.isKeyDown(Key.D) && !this.isKeyDown(Key.A))
			this.bound.xform.x += dt * s;

		if (this.isKeyDown(Key.W) && !this.isKeyDown(Key.S))
			this.bound.xform.y += dt * s;
		else if (this.isKeyDown(Key.S) && !this.isKeyDown(Key.W))
			this.bound.xform.y -= dt * s;

		if (this.isKeyDown(Key.Left) && !this.isKeyDown(Key.Right))
			this.bound.xform.width -= dt * s;
		else if (this.isKeyDown(Key.Right) && !this.isKeyDown(Key.Left))
			this.bound.xform.width += dt * s;

		if (this.isKeyDown(Key.Up) && !this.isKeyDown(Key.Down))
			this.bound.xform.height += dt * s;
		else if (this.isKeyDown(Key.Down) && !this.isKeyDown(Key.Up))
			this.bound.xform.height -= dt * s;

		if (this.q_mode) {
			if (this.isKeyDown(Key.Z) && !this.isKeyDown(Key.X))
				this.frame_gap -= dt * s;
			else if (this.isKeyDown(Key.X) && !this.isKeyDown(Key.Z))
				this.frame_gap += dt * s;

			if (this.frame_gap < 0)
				this.frame_gap = 0;
			else if (this.frame_gap > this.background.xform.width)
				this.frame_gap = this.background.xform.width;
		}

		if (this.bound.xform.width > this.background.xform.width)
			this.bound.xform.width = this.background.xform.width;
		else if (this.bound.xform.width < 0.1)
			this.bound.xform.width = 0.1;

		if (this.bound.xform.height > this.background.xform.height)
			this.bound.xform.height = this.background.xform.height;
		else if (this.bound.xform.height < 0.1)
			this.bound.xform.height = 0.1;

		if (this.bound.xform.x - this.bound.xform.width / 2 < this.background.xform.x - this.background.xform.width / 2)
			this.bound.xform.x = this.background.xform.x - this.background.xform.width / 2 + this.bound.xform.width / 2;
		else if (this.bound.xform.x + this.bound.xform.width / 2 > this.background.xform.x + this.background.xform.width / 2)
			this.bound.xform.x = this.background.xform.x + this.background.xform.width / 2 - this.bound.xform.width / 2;

		if (this.bound.xform.y - this.bound.xform.height / 2 < this.background.xform.y - this.background.xform.height / 2)
			this.bound.xform.y = this.background.xform.y - this.background.xform.height / 2 + this.bound.xform.height / 2;
		else if (this.bound.xform.y + this.bound.xform.height / 2 > this.background.xform.y + this.background.xform.height / 2)
			this.bound.xform.y = this.background.xform.y + this.background.xform.height / 2 - this.bound.xform.height / 2;

		this.animation.update(dt);

		if (px !== this.bound.xform.x || py !== this.bound.xform.y || pw !== this.bound.xform.width
			|| ph !== this.bound.xform.height || pg !== this.frame_gap)
			this._sync_zib();
	}

	draw(updates, lag_time) {
		if (!this.background || !this.bound)
			return;

		var cnt = this._get_anim_frames();
		this.main_camera.setup_vp();
		this.background.draw(this.main_camera.vp);

		for (var i = 0; i < 8; ++i)
			this.bgborder[i].draw(this.main_camera.vp);

		for (var i = 0; i < 4; ++i)
			this.zib_block[i].draw(this.main_camera.vp);

		if (this.q_mode) {
			var orig_x = this.bound.xform.x;

			for (var i = 0; i < cnt; ++i) {
				this.bound.xform.x += this.bound.xform.width + this.frame_gap;
				this.bound.draw(this.main_camera.vp);
			}

			this.bound.xform.x = orig_x;
		}

		this.bound.draw(this.main_camera.vp);

		for (var i = 0; i < 4; ++i) {
			this.zib_camera[i].setup_vp();
			this.background.draw(this.zib_camera[i].vp);

			for (var j = 0; j < 8; ++j)
				this.bgborder[j].draw(this.zib_camera[i].vp);

			this.zib_block[i].draw(this.zib_camera[i].vp);
			this.bound.draw(this.zib_camera[i].vp);

			if (this.q_mode && i !== 1) {
				var orig_x = this.bound.xform.x;

				for (var j = 0; j < cnt; ++j) {
					this.bound.xform.x += this.bound.xform.width + this.frame_gap;
					this.bound.draw(this.zib_camera[i].vp);
				}

				this.bound.xform.x = orig_x;
			}
		}

		this.anim_camera.setup_vp();
		this.animation.draw(this.anim_camera.vp);
	}

	_sync_zib() {
		if (!this.background || !this.bound)
			return;

		this.zib_camera[0].width = this.bound.xform.height / 2;
		this.zib_camera[0].center[0] = this.bound.xform.x;
		this.zib_camera[0].center[1] = this.bound.xform.y + this.zib_camera[0].width;

		this.zib_camera[1].width = this.bound.xform.width / 2;
		this.zib_camera[1].center[0] = this.bound.xform.x - this.zib_camera[1].width;
		this.zib_camera[1].center[1] = this.bound.xform.y;

		this.zib_camera[2].width = this.bound.xform.width / 2;
		this.zib_camera[2].center[0] = this.bound.xform.x + this.zib_camera[1].width;
		this.zib_camera[2].center[1] = this.bound.xform.y;

		this.zib_camera[3].width = this.bound.xform.height / 2;
		this.zib_camera[3].center[0] = this.bound.xform.x;
		this.zib_camera[3].center[1] = this.bound.xform.y - this.zib_camera[0].width;

		this.anim_camera.width = Math.max(this.animation.xform.width, this.animation.xform.height);
		this.animation._fx = (this.bound.xform.x - this.background.xform.x
			+ this.background.xform.width / 2) / this.background.xform.width;
		this.animation._fy = (this.bound.xform.y - this.background.xform.y
			+ this.background.xform.height / 2) / this.background.xform.height;
		this.animation._fw = this.bound.xform.width / this.background.xform.width;
		this.animation._fh = this.bound.xform.height / this.background.xform.height;

		this.animation.frame_count = this._get_anim_frames() + 1;
		this.animation._fg = this.frame_gap / this.background.xform.width;
	}

	_get_anim_frames() {
		var bound_right = this.bound.xform.x + this.bound.xform.width / 2;
		var bgrnd_right = this.background.xform.x + this.background.xform.width / 2;
		return Math.floor((bgrnd_right - bound_right) / (this.bound.xform.width + this.frame_gap));
	}
}
