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
		if (!this.is_shaking && (this.game.isKeyDown(Key.Q) ||
			[...this.game.patrols].reduce((b, p) => b || p.box.intersects(this.box), false))) {
			var t = new Tween(this.game, 1);
			t.add_var(13.5, 9, w => { this.renderable.xform.width = w; });
			t.add_var(18, 12, h => { this.renderable.xform.height = h; });
			t._oncomplete = () => { this.is_shaking = false; };
			t.easing = Easing.Harmonic(4);
			this.is_shaking = true;
		}

		if (this.cam.mouse_over) {
			this.renderable.xform.x -= (this.renderable.xform.x - this.cam.mouse_x) * 1.1 * dt;
			this.renderable.xform.y -= (this.renderable.xform.y - this.cam.mouse_y) * 1.1 * dt;
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

		this.is_shaking = false;
	}

	update(dt) {
		if (!this.is_shaking && (this.game.isKeyDown(Key.S) ||
			[...this.game.patrols].reduce((b, p) => b || p.box.intersects(this.box)
				|| p.wing0.box.intersects(this.box)
				|| p.wing1.box.intersects(this.box), false))) {
			var t = new Tween(this.game, 5);
			t.add_var(2.2, 2, w => { this.renderable.xform.width = w; });
			t.add_var(4, 3.25, h => { this.renderable.xform.height = h; });
			t.easing = Easing.Harmonic(20);
			this.is_shaking = true;
			this.my_tween = t;

			for (var i = 1; i < 4; ++i) {
				if (this.game.sm_cam_used_by[i] === null) {
					this.game.sm_cam_used_by[i] = this;
					this.game.sm_cam[i].center = this.renderable.xform.pos;
					break;
				}
			}

			t._oncomplete = () => {
				this.is_shaking = false;
				this.my_tween = null;

				for (var i = 1; i < 4; ++i) {
					if (this.game.sm_cam_used_by[i] === this) {
						this.game.sm_cam_used_by[i] = null;
						break;
					}
				}
			};
		}

		this.lifespan -= dt;

		if (this.lifespan <= 0)
			this.destroy();

		if (this.game.isKeyDown(Key.D) || [...this.game.patrols].reduce(
			(b, p) => b || p.large_box.intersects(this.box), false)) {
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

		if (this.my_tween)
			this.my_tween.abort();

		this.game.patrols.forEach(p => {
			if (p.prev_dye.has(this))
				p.prev_dye.delete(this);
		});
	}
}

class Brain extends TextureObject {
	constructor(game, img, x, y) {
		super(game, game.sshader, game.tshader, img, 0, 0, 0, 0);

		var speed = 5 + Math.random() * 5;
		var dir = Math.random() * 2 * Math.PI;
		this.dx = speed * Math.cos(dir);
		this.dy = speed * Math.sin(dir);
		this.prev_dye = new Set();

		this.renderable.xform.x = x;
		this.renderable.xform.y = y;
		this.renderable.xform.width = 7.5;
		this.renderable.xform.height = 7.5;
		this.renderable.uvrect.x = 220 / img.width;
		this.renderable.uvrect.y = 0.18;
		this.renderable.uvrect.w = 137 / img.width;
		this.renderable.uvrect.h = 173 / img.height;

		this.wing0 = new Drone(game, img, 0, x, y);
		this.wing1 = new Drone(game, img, 1, x, y);

		this.addKid(this.wing0);
		this.addKid(this.wing1);
	}

	update(dt) {
		this.renderable.xform.x += this.dx * dt;
		this.renderable.xform.y += this.dy * dt;

		this.game.dye_packs.forEach(d => {
			if (d.box.intersects(this.box) && !this.prev_dye.has(d)) {
				this.renderable.xform.x += 5;
				this.prev_dye.add(d);
			}
		});

		var bb = this.large_box, cb = this.game.main_cam.box;
		var dbx = this.renderable.xform.x - bb.x;
		var dby = this.renderable.xform.y - bb.y;

		if (bb.left > cb.right)
			this.destroy();

		if (bb.left < cb.left) this.dx = Math.abs(this.dx);
		if (bb.right > cb.right) this.dx = -Math.abs(this.dx);
		if (bb.top > cb.top) this.dy = -Math.abs(this.dy);
		if (bb.bottom < cb.bottom) this.dy = Math.abs(this.dy);

		super.update(dt);
	}

	destroy() {
		super.destroy();
		this.game.kill_patrol(this);
	}

	get large_box() {
		var boxes = [this.box, this.wing0.box, this.wing1.box];
		var left = boxes.reduce((t, b) => (t && t < b.left) ? t : b.left, null);
		var right = boxes.reduce((t, b) => (t && t > b.right) ? t : b.right, null);
		var top = boxes.reduce((t, b) => (t && t > b.top) ? t : b.top, null);
		var bottom = boxes.reduce((t, b) => (t && t < b.bottom) ? t : b.bottom, null);
		top += 0.5 * (top - bottom);

		return new Box(left + (right - left) / 2, bottom + (top - bottom) / 2,
			right - left, top - bottom);
	}

	debug_draw(vp) {
		super.debug_draw(vp);

		var b = this.large_box;
		super.debug_draw(vp, b, true);
	}
}

class Drone extends SpriteObject {
	constructor(game, img, pos, x, y) {
		super(game, game.sshader, game.tshader, img, 0, 0, 0, 0);
		this.pos = pos;
		this.speed = 50;
		this.prev_dye = new Set();

		this.renderable.color = [0.0, 0.0, 0.0, 0.0];
		this.renderable.xform.x = x;
		this.renderable.xform.y = y;
		this.renderable.xform.width = 10;
		this.renderable.xform.height = 8;
		this.renderable._fx = 0.099;
		this.renderable.uvrect.y = 0.8635333333;
		this.renderable.uvrect.w = 0.199;
		this.renderable.uvrect.h = (1-0.8635333333)*2;
		this.renderable.frame_dt = 0.075;
		this.renderable.frame_count = 5;
		this.renderable.animation_enabled = true;
	}

	update(dt) {
		super.update(dt);
		var mb = this.box, pb = this._parent.box;
		pb.x += 10;
		pb.y += this.pos ? -6 : 6;

		var dx = pb.x - mb.x, dy = pb.y - mb.y;
		var l = Math.sqrt(dx*dx + dy*dy);

		if (l > 0) {
			var ax = dx * dt * this.speed / l;
			var ay = dy * dt * this.speed / l;

			if (l < dt * this.speed) {
				this.renderable.xform.x = pb.x;
				this.renderable.xform.y = pb.y;
			} else {
				this.renderable.xform.x += ax;
				this.renderable.xform.y += ay;
			}
		}

		this.game.dye_packs.forEach(d => {
			if (d.box.intersects(this.box) && !this.prev_dye.has(d)
				&& !this._parent.prev_dye.has(d)) {
				this.renderable.color[0] += 0.2;
				this.renderable.color[3] += 0.2;
			}
		});

		this.prev_dye.clear();
		this.game.dye_packs.forEach(d => {
			if (d.box.intersects(this.box))
				this.prev_dye.add(d);
		});

		if (this.renderable.color[0] > 1)
			this._parent.destroy();
	}
}

class MP4 extends Game {
	constructor(id) {
		super(id, 0.9, 0.9, 0.9);
		this.__auto_spawn = false;
		this.auto_spawn_timer = 3;

		this.sshader = new SimpleShader(this);
		this.tshader = new TextureShader(this);
		this.main_cam = new Camera(this, vec2.fromValues(0.0, 0.0), 200,
			[5, 5, this.canvas.width - 10, this.canvas.height - 115]);
		this.sm_cam = [];
		this.sm_cam_used_by = [];

		for (var i = 0; i < 4; ++i) {
			this.sm_cam[i] = new Camera(this, vec2.fromValues(0.0, 0.0), 30, [
				5 + i * (((this.canvas.width - 25) / 4) + 5),
				this.canvas.height - 105, (this.canvas.width - 25) / 4, 100]);

			this.sm_cam_used_by[i] = null;
		}

		this.fetchImageResource("assets/mp4/bg.jpg", n => {
			var r = this.getResource(n);
			this.bg = new TextureRenderable(this.tshader, r);
			this.bg.xform.width = 200;
			this.bg.xform.height = 200 * r.height / r.width;
		});

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
		var p = new Brain(this, this.my_tex, 25+Math.random()*50, -25+Math.random()*50);
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

		if (this.isKeyPressed(Key.C))
			this.spawn_patrol();

		if (this.auto_spawn) {
			this.auto_spawn_timer -= dt;

			if (this.auto_spawn_timer <= 0) {
				this.auto_spawn_timer = 2 + Math.random();
				this.spawn_patrol();
			}
		}

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

		if (this.bg)
			this.bg.draw(this.main_cam.vp);

		if (this.hero)
			this.hero.draw(this.main_cam.vp);

		this.dye_packs.forEach(d => { d.draw(this.main_cam.vp); });
		this.patrols.forEach(p => { p.draw(this.main_cam.vp); });

		for (var i = 0; i < 4; ++i) {
			if (i == 0 && this.hero && !this.hero.is_shaking && !this.isKeyDown(Key.Zero))
				continue;

			if (i > 0 && this.sm_cam_used_by[i] === null && !this.isKeyDown(Key.Zero+i))
				continue;

			this.sm_cam[i].setup_vp();

			if (this.bg)
				this.bg.draw(this.sm_cam[i].vp);

			if (this.hero)
				this.hero.draw(this.sm_cam[i].vp);

			this.dye_packs.forEach(d => { d.draw(this.sm_cam[i].vp); });
			this.patrols.forEach(p => { p.draw(this.sm_cam[i].vp); });
		}
	}
}
