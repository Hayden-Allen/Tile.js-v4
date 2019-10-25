class Tile extends TileBase { //Tile that adds itself to the Scene
  constructor(src, x, y, properties){
    super(src, properties);
    Global.currentScene.add(this, x, y);
  }
}
