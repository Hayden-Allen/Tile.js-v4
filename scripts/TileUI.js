class TileUI extends TileBase { //Tile that adds itself to the Renderer's UI list
  constructor(src, x, y, properties){
    super(src, properties);
    Global.currentRenderer.addUI(this, x, y);
  }
}
