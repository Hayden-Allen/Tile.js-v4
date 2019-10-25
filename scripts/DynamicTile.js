class DynamicTile extends AnimatedTile {  //Tile that is not bound to the Scene grid and can move freely around the Scene
  constructor(src, x, y, frames, time, v, properties){
    super(src, 0, 0, frames, time, properties);
    //keep track of coordinates because not part of Scene grid
    this.x = x;
    this.y = y;
    this.v = v || new Vec2(0, 0); //velocity vector
    this.light = this.property("light", 0); //intensity of emitted light
    this.children = []; //list of other DynamicTiles that are attached to this Tile

    //if a parent DynamicTile is given, automatically add this to its child array
    let parent = this.property("parent", undefined);
    if(parent)
      parent.addChild(this, this.x, this.y);

    this.calculateEffectMatrix(); //grid of light offset values
  }
  delete(){ //delete from all arrays in Scene
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
  checkBounds(){  //prevent from walking outside of Scene
    let ox = this.x, oy = this.y; //original coordinates
    //clamp coords to allowed Scene values
    //every dt's addX is called every frame, so this can't be setX
    this.x = Global.clamp(this.x, 0, Global.currentScene.width - Global.tileSize);
    this.y = Global.clamp(this.y, 0, Global.currentScene.height - Global.tileSize);

    //if supposed to delete when it hits the end of the world, and the clamp operation did something, delete
    if(this.property("deleteOnWorldEnd", false) && (this.x !== ox || this.y !== oy))
      this.delete();
  }
  setProperty(id, val){ //set property width name id to value val for itself and all children
    if(!this.properties)
      this.properties = {};
    this.properties[id] = val;
    this.children.forEach(function(c){
      if(!c.properties)
        c.properties = {};
      c.properties[id] = val;
    });
  }
  addX(x){  //add x to this.x and do for all children. Automatically check bounds
    this.x += x;
    this.children.forEach(function(c){
      c.addX(x);
    });
    this.checkBounds();
  }
  addY(y){  //add y to this.y and do for all children. Automatically check bounds
    this.y += y;
    this.children.forEach(function(c){
      c.addY(y);
    });
    this.checkBounds();
  }
  setX(x){  //set this.x to x and do for all children. Automatically check bounds
    let parentX = this.x;
    this.x = x;
    this.children.forEach(function(c){
      let ox = c.x - parentX; //preserve relative offset
      c.setX(x + ox);
    });
  }
  setY(y){  //set this.y to y and do for all children. Automatically check bounds
    let parentY = this.y;
    this.y = y;
    this.children.forEach(function(c){
      let oy = c.y - parentY; //preserve relative offset
      c.setY(y + oy);
    });
  }
  setVel(v){  //children's velocities are relative to this, so don't set theirs
    this.v = v;
  }
  addChild(c, ox, oy){  //add DynamicTile to children array with given coordinate offsets
    this.children.push(c);
    c.setX(this.x + ox);
    c.setY(this.y + oy);
  }
  calculateEffectMatrix(){  //create grid of light offset values
    if(this.light){
      let size = (this.light - 1) * 2 + 1;
      this.effectMatrix = Global.arr2d(size, size, 0);
      Global.propagate(parseInt(size / 2), parseInt(size / 2), this.light, this.effectMatrix);
    }
  }
  update(){
    super.update(); //switch frame if necessary
    //add velocities scaled by frame time to coordinates
    this.addX(this.v.x * Global.timeScale());
    this.addY(this.v.y * Global.timeScale());
  }
  intensityAt(x, y){  //gives the value in effect matrix at given Scene coordinates
    if(!this.effectMatrix || !this.property("visible", true)) //if no light emitted or not currently visible
      return 0;

    //convert world coordinates to Scene coordinates
    let sx = parseInt((this.x + Global.tileSize / 2) / Global.tileSize);
    let sy = parseInt((this.y + Global.tileSize / 2) / Global.tileSize);
    //x and y indices for effect matrix grid
    //add length / 2 because the center value of the grid is displayed at (this.x, this.y)
    let emx = parseInt(this.effectMatrix.length / 2) + (sx - x);
    let emy = parseInt(this.effectMatrix.length / 2) + (sy - y);

    //if indices out of bounds
    if(emy < 0 || emy > this.effectMatrix.length - 1 ||
      emx < 0 || emx > this.effectMatrix.length - 1)
      return 0;
    return this.effectMatrix[emy][emx];
  }
}
