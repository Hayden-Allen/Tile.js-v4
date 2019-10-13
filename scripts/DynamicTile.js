class DynamicTile extends AnimatedTile {
  constructor(src, x, y, frames, time, v, properties){
    super(src, 0, 0, frames, time, properties);
    this.x = x;
    this.y = y;
    this.v = v || new Vec2(0, 0);
    this.light = this.property("light", 0);
    this.children = [];

    let parent = this.property("parent", undefined);
    if(parent)
      parent.addChild(this, this.x, this.y);

    this.calculateEffectMatrix();
  }
  delete(){
    let z = this.property("zindex", 0);
    let arr = Global.currentScene.dynamicTiles;
    for(var i = 0; i < arr.length; i++){
      if(arr[i] === this){
        arr.splice(i, 1);
        break;
      }
    }
    arr = Global.currentScene.layers[z].dts;
    for(var i = 0; i < arr.length; i++){
      if(arr[i] === this){
        arr.splice(i, 1);
        break;
      }
    }
  }
  checkBounds(){
    let ox = this.x, oy = this.y;
    //every dt's addX is called every frame, so this can't be setX
    this.x = Global.clamp(this.x, 0, Global.currentScene.width - Global.tileSize);
    this.y = Global.clamp(this.y, 0, Global.currentScene.height - Global.tileSize);

    if(this.property("deleteOnWorldEnd", false) && (this.x !== ox || this.y !== oy))
      this.delete();
  }
  setProperty(id, val){
    if(!this.properties)
      this.properties = {};
    this.properties[id] = val;
    this.children.forEach(function(c){
      if(!c.properties)
        c.properties = {};
      c.properties[id] = val;
    });
  }
  addX(x){
    this.x += x;
    this.children.forEach(function(c){
      c.addX(x);
    });
    this.checkBounds();
  }
  addY(y){
    this.y += y;
    this.children.forEach(function(c){
      c.addY(y);
    });
    this.checkBounds();
  }
  setX(x){
    let parentX = this.x;
    this.x = x;
    this.children.forEach(function(c){
      let ox = c.x - parentX;
      c.setX(x + ox);
    });
  }
  setY(y){
    let parentY = this.y;
    this.y = y;
    this.children.forEach(function(c){
      let oy = c.y - parentY;
      c.setY(y + oy);
    });
  }
  setVel(v){
    this.v = v;
  }
  addChild(c, ox, oy){
    this.children.push(c);
    c.setX(this.x + ox);
    c.setY(this.y + oy);
  }
  calculateEffectMatrix(){
    if(this.light){
      let size = (this.light - 1) * 2 + 1;
      this.effectMatrix = Global.arr2d(size, size, 0);
      Global.propagate(parseInt(size / 2), parseInt(size / 2), this.light, this.effectMatrix);
    }
  }
  update(){
    super.update();
    this.addX(this.v.x * Global.timeScale());
    this.addY(this.v.y * Global.timeScale());
  }
  intensityAt(x, y){
    if(!this.effectMatrix || !this.property("visible", true))
      return 0;

    let sx = parseInt((this.x + Global.tileSize / 2) / Global.tileSize);
    let sy = parseInt((this.y + Global.tileSize / 2) / Global.tileSize);
    let emx = parseInt(this.effectMatrix.length / 2) + (sx - x);
    let emy = parseInt(this.effectMatrix.length / 2) + (sy - y);

    if(emy < 0 || emy > this.effectMatrix.length - 1 ||
      emx < 0 || emx > this.effectMatrix.length - 1)
      return 0;
    return this.effectMatrix[emy][emx];
  }
}
