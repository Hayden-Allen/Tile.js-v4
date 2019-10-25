class Vec2 {  //2d vector used for velocities
  constructor(x, y, locked){
    //directional components
    this.x = x;
    this.y = y;
    this.locked = (locked !== undefined ? locked : false);  //whether or not this vector can be altered
  }
  lock(){
    this.locked = true;
  }
  unlock(){
    this.locked = false;
  }
  setX(x){  //sets x component if possible
    if(!this.locked)
      this.x = x;
    return this;
  }
  setY(y){  //sets y component if possible
    if(!this.locked)
      this.y = y;
    return this;
  }
  equals(v){  //true if difference between both components are within 1 of each other
              //highly inaccurate, but better than true equality for how it's used
    return Math.abs(this.x - v.x) < 1 && Math.abs(this.y - v.y) < 1;
  }
  add(v){ //adds two vectors together if possible
    if(!this.locked)
      return new Vec2(this.x + v.x, this.y + v.y, this.locked);
    return this;
  }
  scale(s){ //multiply both components by s
    return new Vec2(s * this.x, s * this.y);
  }
}
