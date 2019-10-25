class TileBase {  //basic graphical unit
  constructor(src, properties){
    this.texture = new Texture(src);  //image data
    this.properties = properties || {}; //contains optional values
  }
  property(id, def){  //returns properties.id if it exists, def if undefined
    if(!this.properties || this.properties[id] === undefined)
      return def;
    return this.properties[id];
  }
  draw(x, y){ //draw texture at given coordinates
    this.texture.draw(0, 0, this.texture.img.width, this.texture.img.height,
      x, y, this.property("w", 1), this.property("h", 1),
      this.property("alpha", 1), this.property("theta", 0));
  }
}
