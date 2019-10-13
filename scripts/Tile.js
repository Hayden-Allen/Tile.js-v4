class Tile extends TileBase {
  constructor(src, x, y, properties){
    super(src, properties);
    Global.currentScene.add(this, x, y);
  }
}
