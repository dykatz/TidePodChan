class MP1 extends Game {
	constructor(arg) {
		super(arg, 0.9, 0.9, 0.9);
		this.colorShader = new SimpleShader(this);
		this.camera = new Camera(this, vec2.fromValues(20, 60), 20,
			[20, 40, 600, 300]);

		this.white_sq = new Renderable(this, this.colorShader);
		this.white_sq.color = [1.0, 1.0, 1.0, 1.0];
		this.white_sq.xform.x = 20;
		this.white_sq.xform.y = 60;
		this.white_sq.xform.width = 5;
		this.white_sq.xform.height = 5;
		this.white_sq.xform.rot_rad = 0.2;

		this.red_sq = new Renderable(this, this.colorShader);
		this.red_sq.color = [1.0, 0.0, 0.0, 1.0];
		this.red_sq.xform.x = 20;
		this.red_sq.xform.y = 60;
		this.red_sq.xform.width = 2;
		this.red_sq.xform.height = 2;
	}

	update(dt) {
		var wxform = this.white_sq.xform;
		var rxform = this.red_sq.xform;

		if (this.isKeyDown(Key.Right)) {
			if (wxform.x > 30)
				wxform.x = 10;

			wxform.x += 10 * dt;
		}

		if (this.isKeyPressed(Key.Up))
			wxform.rot_deg += 1;

		if (this.isKeyDown(Key.Down)) {
			if (rxform.width > 5) {
				rxform.width = 2;
				rxform.height = 2;
			}

			rxform.width += 10 * dt;
			rxform.height += 10 * dt;
		}
	}

	draw() {
		this.camera.setup_vp();
		this.white_sq.draw(this.camera.vp);
		this.red_sq.draw(this.camera.vp);
	}
}
