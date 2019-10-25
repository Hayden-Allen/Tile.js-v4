class AnimatedTileUI extends AnimatedTileBase { //Tile with several texture frames that adds itself to the Renderer's UI list
  constructor(src, x, y, frames, time, properties){
    super(src, frames, time, properties);
    Global.currentRenderer.addUI(this, x, y);
  }
  draw(x, y){ //automatically update frame when drawn
    super.update();
    super.draw(x, y);
  }
}
