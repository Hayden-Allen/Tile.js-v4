class TileBase {
  constructor(src, properties){
    this.texture = new Texture(src);
    this.properties = properties || {};
  }
  property(id, def){
    if(!this.properties || this.properties[id] === undefined)
      return def;
    return this.properties[id];
  }
  draw(x, y){
    this.texture.draw(0, 0, this.texture.img.width, this.texture.img.height,
      x, y, this.property("w", 1), this.property("h", 1),
      this.property("alpha", 1), this.property("theta", 0));
  }
}
