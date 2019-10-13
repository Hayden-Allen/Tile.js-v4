class Vec2 {
  constructor(x, y, locked){
    this.x = x;
    this.y = y;
    this.locked = (locked !== undefined ? locked : false);
  }
  lock(){
    this.locked = true;
  }
  unlock(){
    this.locked = false;
  }
  setX(x){
    if(!this.locked)
      this.x = x;
    return this;
  }
  setY(y){
    if(!this.locked)
      this.y = y;
    return this;
  }
  equals(v){
    return Math.abs(this.x - v.x) < 1 && Math.abs(this.y - v.y) < 1;
  }
  add(v){
    if(!this.locked)
      return new Vec2(this.x + v.x, this.y + v.y, this.locked);
    return this;
  }
  scale(s){
    return new Vec2(s * this.x, s * this.y);
  }
}
