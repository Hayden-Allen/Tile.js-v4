class Door extends AnimatedTile {
  constructor(src, x, y, frames, time, to, tox, toy, properties){
    super(src, x, y, frames, time, properties);
    this.to = to;
    this.tox = tox;
    this.toy = toy;
    this.properties.onCollide = function(dt, collision){

    }
  }
}
