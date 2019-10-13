class Texture {
  constructor(src){
    this.src = src;
    this.img = new Image();
    this.img.src = src;
  }
  draw(cx, cy, cw, ch, x, y, w, h, alpha, theta){
    Global.ctx.save();
    Global.ctx.globalAlpha = alpha;

    Global.ctx.translate(x + Global.tileSize / 2, y + Global.tileSize / 2);
    Global.ctx.rotate(theta);
    Global.ctx.drawImage(this.img, cx, cy, cw, ch,
      -Global.tileSize / 2, -Global.tileSize / 2,
      Global.tileSize * w, Global.tileSize * h);

    Global.ctx.restore();
  }
}
