class TileUI extends TileBase {
  constructor(src, x, y, properties){
    super(src, properties);
    Global.currentRenderer.addUI(this, x, y);
  }
}
