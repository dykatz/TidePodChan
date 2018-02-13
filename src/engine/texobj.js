class TextureObject extends GameObject {
	constructor(game, sshader, tshader, img, x, y, w, h) {
		super(game, sshader);
		this.renderable = new TextureRenderable(tshader, img);
		this.renderable.xform.x = x;
		this.renderable.xform.y = y;
		this.renderable.xform.width = w;
		this.renderable.xform.height = h;
	}

	get box() { return this.renderable.xform.box; }

	draw(vp) {
		this.renderable.draw(vp);
		super.draw(vp);
	}
}
