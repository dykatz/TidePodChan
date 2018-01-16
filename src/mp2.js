class Scene1 extends Scene {
	constructor(game, sq_shader, cam2) {
		super(game);
		this.really_loaded = false;
		this.sq_shader = sq_shader;
		this.camera = null;
		this.camera2 = cam2;
		this.sqaures = null;
		this.scene2 = new Scene2(game, sq_shader, cam2);
	}

	onLoad() {
		this.game.fetchJsonResource("assets/mp2/scene1.json", n => {
			var result = this.loadFromJson(n, this.sq_shader);
			this.camera = result.Cameras[0];
			this.squares = result.Squares;
			this.really_loaded = true;
		});
	}

	update(dt) {
		if (this.game.isKeyReleased(Key.Q))
			this.pushAndSwitchScene(this.scene2);

		if (!this.really_loaded) return;

		this.squares[0].xform.x -= (20 / 3) * dt;
		this.squares[0].xform.rot_deg += (360 / 5) * dt;

		while (this.squares[0].xform.x < 10)
			this.squares[0].xform.x += 20;
	}

	draw(updates, lag_time) {
		if (!this.really_loaded) return;
		this.camera.setup_vp();

		this.squares.forEach(s => {
			s.draw(this.camera.vp);
		});

		this.camera2.setup_vp();

		this.squares.forEach(s => {
			s.draw(this.camera2.vp);
		});
	}
}

class Scene2 extends Scene {
	constructor(game, sq_shader, cam2) {
		super(game);
		this.really_loaded = false;
		this.sq_shader = sq_shader;
		this.camera = null;
		this.camera2 = cam2;
		this.squares = null;
	}

	onLoad() {
		this.game.fetchXmlResource("assets/mp2/scene2.xml", n => {
			var result = this.loadFromXml(n, this.sq_shader);
			this.camera = result.Camera[0];
			this.squares = result.Squares;
			this.really_loaded = true;
		});
	}

	update(dt) {
		if (this.game.isKeyReleased(Key.Q))
			this.popScene();

		if (!this.really_loaded) return;
	}

	draw(updates, lag_time) {
		if (!this.really_loaded) return;
		this.camera.setup_vp();

		this.squares.forEach(s => {
			s.draw(this.camera.vp);
		});

		this.camera2.setup_vp();

		this.squares.forEach(s => {
			s.draw(this.camera2.vp);
		});
	}
}

class MP2 extends Game {
	constructor(canvas_id) {
		super(canvas_id, 0.9, 0.9, 0.9);
		var sq_shader = new SimpleShader(this);
		this.cam2 = new Camera(this, vec2.fromValues(20, 60), 20,
			[100, 20, 50, 50]);
		this.cam2.bg = [0.0, 0.9, 0.9, 1.0];
		this.currentScene = new Scene1(this, sq_shader, this.cam2);
	}

	update(dt) {
		if (this.isKeyReleased(Key.A))
			this.cam2.viewport[0] -= 10;

		if (this.isKeyReleased(Key.D))
			this.cam2.viewport[0] += 10;

		if (this.isKeyReleased(Key.S))
			this.cam2.viewport[1] -= 10;

		if (this.isKeyReleased(Key.W))
			this.cam2.viewport[1] += 10;
	}
}
