class Dye extends GameObject {
	constructor(game) {
		super(game);
	}
}

class DyePack extends GameObject {
	constructor(game) {
		super(game);
	}

	destroy() {
		super.destroy();
		this.game.kill_dye_pack(this);
	}
}

class Patrol extends GameObject {
	constructor(game) {
		super(game);
	}

	destroy() {
		super.destroy();
		this.game.kill_patrol(this);
	}
}

class Brain extends GameObject {
	constructor(game) {
		super(game);
	}
}

class Drone extends GameObject {
	constructor(game) {
		super(game);
	}
}

class MP4 extends Game {
	constructor(id) {
		super(id, 0.9, 0.9, 0.9);
		this.__dye_packs_sts = document.getElementById("dye-packs");
		this.__patrols_sts = document.getElementById("patrols");
		this.__auto_spawn_sts = document.getElementById("auto-spawn");
		this.__auto_spawn = false;

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
			this.hero.xform.width = 50;
			this.hero.xform.height = 50 * r.height / r.width;
		});

		this.dye = new Dye(this);
		this.dye_packs = new Set();
		this.patrols = new Set();
	}

	get auto_spawn() { return this.__auto_spawn; }

	set auto_spawn(a) {
		this.__auto_spawn = a;
		this.__auto_spawn_sts.innerHTML = a;
	}

	spawn_dye_pack() {
		var d = new DyePack(this);
		this.dye_packs.add(d);
		this.__dye_packs_sts.innerHTML = this.dye_packs.size;
		return d;
	}

	kill_dye_pack(d) {
		this.dye_packs.delete(d);
		this.__dye_packs_sts.innerHTML = this.dye_packs.size;
	}

	spawn_patrol() {
		var p = new Patrol(this);
		this.patrols.add(p);
		this.__patrols_sts.innerHTML = this.patrols.size;
		return p;
	}

	kill_patrol(p) {
		this.patrols.delete(p);
		this.__patrols_sts.innerHTML = this.patrols.size;
	}

	update(dt) {
		this.dye_packs.forEach(d => d.update(dt));
		this.patrols.forEach(p => p.update(dt));
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
