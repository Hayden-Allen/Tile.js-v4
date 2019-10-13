class AnimatedTile extends AnimatedTileBase {
  constructor(src, x, y, frames, time, properties){
    super(src, frames, time, properties);
    Global.currentScene.add(this, x, y);
  }
}
