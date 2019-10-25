class AnimatedTile extends AnimatedTileBase { //Tile with several texture frames that adds itself to the Scene
  constructor(src, x, y, frames, time, properties){
    super(src, frames, time, properties);
    Global.currentScene.add(this, x, y);
  }
}
