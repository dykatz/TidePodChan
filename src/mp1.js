class MP1 extends Game {
	constructor(arg) {
		super(arg, 0.9, 0.9, 0.9);
		this.colorShader = new SimpleShader(this);
		this.camera = new Camera(this, vec2.fromValues(0, 0), 200,
			[5, 5, 630, 630]);

		this.cursor = new Renderable(this, this.colorShader);
		this.cursor.color = [1.0, 0.0, 0.0, 1.0];
		this.cursor.xform.x = 0;
		this.cursor.xform.y = 0;
		this.cursor.xform.width = 1;
		this.cursor.xform.height = 1;

		this.delete_mode = false;
	}

	update(dt) {
		if (this.isKeyReleased(Key.D))
			this.delete_mode = !this.delete_mode;

		if (this.isKeyDown(Key.A) || this.isKeyDown(Key.Left))
			this.cursor.xform.x -= dt * 50;
		if (this.isKeyDown(Key.D) || this.isKeyDown(Key.Right))
			this.cursor.xform.x += dt * 50;
		if (this.isKeyDown(Key.W) || this.isKeyDown(Key.Up))
			this.cursor.xform.y += dt * 50;
		if (this.isKeyDown(Key.S) || this.isKeyDown(Key.Down))
			this.cursor.xform.y -= dt * 50;

		if (this.cursor.xform.x < -100) this.cursor.xform.x = -100;
		if (this.cursor.xform.x >  100) this.cursor.xform.x =  100;
		if (this.cursor.xform.y < -100) this.cursor.xform.y = -100;
		if (this.cursor.xform.y >  100) this.cursor.xform.y =  100;

		document.getElementById("elapsed").innerHTML = (dt*1000).toFixed(2);
		document.getElementById("fps").innerHTML = (1/dt).toFixed(2);
		document.getElementById("objs").innerHTML = 2;
		document.getElementById("delete-mode").innerHTML = this.delete_mode;
	}

	draw(update_count, lag_time) {
		document.getElementById("lag-time").innerHTML = lag_time.toFixed(2);
		document.getElementById("updates").innerHTML = update_count;

		this.camera.setup_vp();
		this.cursor.draw(this.camera.vp);
	}
}
