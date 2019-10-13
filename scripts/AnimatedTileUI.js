class AnimatedTileUI extends AnimatedTileBase {
  constructor(src, x, y, frames, time, properties){
    super(src, frames, time, properties);
    Global.currentRenderer.addUI(this, x, y);
  }
  draw(x, y){
    super.update();
    super.draw(x, y);
  }
}
