class Dye extends TextureObject {
	constructor(game, cam, img) {
		super(game, game.sshader, game.tshader, img, 0, 0, 0, 0);
		this.cam = cam;

		this.renderable.uvrect.x = 0.06;
		this.renderable.uvrect.y = 0.18;
		this.renderable.uvrect.w = this.renderable.uvrect.x * 2;
		this.renderable.uvrect.h = this.renderable.uvrect.y * 2;

		this.renderable.xform.width = 9;
		this.renderable.xform.height = 12;
		this.is_shaking = false;
	}

	update(dt) {
		if (this.cam.mouse_over) {
			this.renderable.xform.x -= (this.renderable.xform.x - this.cam.mouse_x) * 1.1 * dt;
			this.renderable.xform.y -= (this.renderable.xform.y - this.cam.mouse_y) * 1.1 * dt;
		}

		if (this.game.isKeyDown(Key.T) && !this.is_shaking) {
			var t = new Tween(this.game, 1);
			t.add_var(13.5, 9, w => { this.renderable.xform.width = w; });
			t.add_var(18, 12, h => { this.renderable.xform.height = h; });
			t._oncomplete = () => { this.is_shaking = false; };
			t.easing = Easing.ElasticOut;
			this.is_shaking = true;
		}

		var mb = this.box, cb = this.cam.box;
		if (mb.left < cb.left) this.renderable.xform.x = cb.left + mb.width / 2;
		if (mb.right > cb.right) this.renderable.xform.x = cb.right - mb.width / 2;
		if (mb.top > cb.top) this.renderable.xform.y = cb.top - mb.height / 2;
		if (mb.bottom < cb.bottom) this.renderable.xform.y = cb.bottom + mb.height / 2;

		super.update(dt);
	}
}

class DyePack extends TextureObject {
	constructor(game, cam, img, x, y) {
		super(game, game.sshader, game.tshader, img, 0, 0, 0, 0);

		this.dx = 120;
		this.lifespan = 5;
		this.cam = cam;
		this.renderable.xform.x = x;
		this.renderable.xform.y = y;
		this.renderable.xform.height = 3.25;
		this.renderable.xform.width = 2;
		this.renderable.xform.rot_deg = 90;

		this.renderable.uvrect.x = 550 / img.width;
		this.renderable.uvrect.y = 90 / img.height;
		this.renderable.uvrect.w = 83 / img.width;
		this.renderable.uvrect.h = 129 / img.height;
	}

	update(dt) {
		this.lifespan -= dt;

		if (this.lifespan <= 0)
			this.destroy();

		if (this.game.isKeyDown(Key.D)) {
			this.dx -= dt * 120;

			if (this.dx <= 0)
				this.destroy();
		}

		this.renderable.xform.x += this.dx * dt;
		var mb = this.box, cb = this.cam.box;

		if (mb.right >= cb.right)
			this.destroy();
	}

	destroy() {
		super.destroy();
		this.game.kill_dye_pack(this);
	}
}

class Patrol extends GameObject {
	constructor(game, img) {
		super(game, game.sshader);

		this.head = new Brain(game, img);
		var wing0 = new Drone(game, img, 0);
		var wing1 = new Drone(game, img, 1);

		this.addKid(this.head);
		this.addKid(wing0);
		this.addKid(wind1);
	}

	destroy() {
		super.destroy();
		this.game.kill_patrol(this);
	}
}

class Brain extends TextureObject {
	constructor(game, img) {
		super(game, game.sshader, game.tshader, img, 0, 0, 0, 0);
	}
}

class Drone extends TextureObject {
	constructor(game, img, pos) {
		super(game, game.sshader, game.tshader, img, 0, 0, 0, 0);
		this.pos = pos;
	}
}

class MP4 extends Game {
	constructor(id) {
		super(id, 0.9, 0.9, 0.9);
		this.__auto_spawn = false;

		this.sshader = new SimpleShader(this);
		this.tshader = new TextureShader(this);

		this.main_cam = new Camera(this, vec2.fromValues(0.0, 0.0), 200,
			[5, 5, this.canvas.width - 10, this.canvas.height - 115]);

		this.sm_cam = [];
		for (var i = 0; i < 4; ++i) {
			this.sm_cam[i] = new Camera(this, vec2.fromValues(0.0, 0.0), 30, [
				5 + i * (((this.canvas.width - 25) / 4) + 5),
				this.canvas.height - 105, (this.canvas.width - 25) / 4, 100]);
		}

		this.fetchImageResource("assets/mp4/SpriteSheet.png", n => {
			this.my_tex = this.getResource(n);
			this.hero = new Dye(this, this.main_cam, this.my_tex);
			this.sm_cam[0].center = this.hero.renderable.xform.pos;
		});

		this.dye_packs = new Set();
		this.patrols = new Set();
	}

	get auto_spawn() { return this.__auto_spawn; }

	set auto_spawn(a) {
		this.__auto_spawn = a;
		document.getElementById("auto-spawn").innerHTML = a;
	}

	spawn_dye_pack(x, y) {
		var d = new DyePack(this, this.main_cam, this.my_tex, x, y);
		this.dye_packs.add(d);
		document.getElementById("dye-packs").innerHTML = this.dye_packs.size;
		return d;
	}

	kill_dye_pack(d) {
		this.dye_packs.delete(d);
		document.getElementById("dye-packs").innerHTML = this.dye_packs.size;
	}

	spawn_patrol() {
		var p = new Patrol(this);
		this.patrols.add(p);
		document.getElementById("patrols").innerHTML = this.patrols.size;
		return p;
	}

	kill_patrol(p) {
		this.patrols.delete(p);
		document.getElementById("patrols").innerHTML = this.patrols.size;
	}

	update(dt) {
		if (this.isKeyPressed(Key.P))
			this.auto_spawn = !this.auto_spawn;

		if (this.hero) {
			this.hero.update(dt);

			if (this.isKeyPressed(Key.Space)) {
				var hb = this.hero.box;
				this.spawn_dye_pack(hb.right, hb.y);
			}
		}

		this.dye_packs.forEach(d => { d.update(dt); });
		this.patrols.forEach(p => { p.update(dt); });
	}

	draw() {
		this.main_cam.setup_vp();

		if (this.hero)
			this.hero.draw(this.main_cam.vp);

		this.dye_packs.forEach(d => { d.draw(this.main_cam.vp); });

		for (var i = 0; i < 4; ++i) {
			if (i == 0 && this.hero && !this.hero.is_shaking)
				continue;

			this.sm_cam[i].setup_vp();

			if (this.hero)
				this.hero.draw(this.sm_cam[i].vp);

			this.dye_packs.forEach(d => { d.draw(this.sm_cam[i].vp); });
		}
	}
}
