class MP1 extends Game {
	constructor(arg) {
		super(arg, 0.9, 0.9, 0.9);
		this.colorShader = new SimpleShader(this);
		this.camera = new Camera(this, vec2.fromValues(0, 0), 200,
			[0, 0, 640, 480]);

		this.cursor = new Renderable(this, this.colorShader);
		this.cursor.color = [1.0, 0.0, 0.0, 1.0];
		this.cursor.xform.x = 0;
		this.cursor.xform.y = 0;
		this.cursor.xform.width = 1;
		this.cursor.xform.height = 1;

		this.squares = new Set();
		this.delete_mode = false;
	}

	update(dt) {
		if (this.isKeyDown(Key.Left))
			this.cursor.xform.x -= dt * 50;
		if (this.isKeyDown(Key.Right))
			this.cursor.xform.x += dt * 50;
		if (this.isKeyDown(Key.Up))
			this.cursor.xform.y += dt * 50;
		if (this.isKeyDown(Key.Down))
			this.cursor.xform.y -= dt * 50;

		if (this.cursor.xform.x < -100) this.cursor.xform.x = -100;
		if (this.cursor.xform.x >  100) this.cursor.xform.x =  100;
		if (this.cursor.xform.y < -75)  this.cursor.xform.y = -75;
		if (this.cursor.xform.y >  75)  this.cursor.xform.y =  75;

		if (this.isKeyReleased(Key.Space)) {
			var sc = Math.floor(Math.random() * 10) + 10;
			for (var i = 0; i < sc; ++i) {
				var s = new Renderable(this, this.colorShader);
				this.squares.add(s);
				s.xform.x = this.cursor.xform.x + Math.floor(Math.random() * 10) - 5;
				s.xform.y = this.cursor.xform.y + Math.floor(Math.random() * 10) - 5;
				s.xform.width = Math.floor(Math.random() * 5) + 1;
				s.xform.height = s.xform.width;
				s.xform.rot_deg = Math.floor(Math.random() * 360);
			}
		}

		if (this.delete_mode) {
			this.squares.forEach(function(s) {
				if (Date.now() >= s.creation_time + 10000)
					this.squares.delete(s);
			}, this);

			if (this.squares.size == 0)
				this.delete_mode = false;
		} else {
			if (this.isKeyReleased(Key.D) && this.squares.size > 0)
				this.delete_mode = true;
		}

		document.getElementById("elapsed").innerHTML = (dt*1000).toFixed(2);
		document.getElementById("fps").innerHTML = (1/dt).toFixed(2);
		document.getElementById("objs").innerHTML = this.squares.size;
		document.getElementById("delete-mode").innerHTML = this.delete_mode;
	}

	draw(update_count, lag_time) {
		document.getElementById("lag-time").innerHTML = lag_time.toFixed(2);
		document.getElementById("updates").innerHTML = update_count;

		this.camera.setup_vp();

		this.squares.forEach(function(s) {
			s.draw(this.camera.vp);
		}, this);

		this.cursor.draw(this.camera.vp);
	}
}
