class AnimatedTileBase extends TileBase {
  constructor(src, frames, time, properties){
    super(src, properties);
    this.frames = frames;
    this.frame = 0;
    this.time = time;
    this.timePerFrame = this.time / this.frames;
    this.last = 0;
    this.frameWidth = 0;

    let self = this;
    this.texture.img.onload = function(){
      self.frameWidth = self.texture.img.width / self.frames;
    }
  }
  update(){
    if(Global.Time.now - this.last >= this.timePerFrame){
      this.frame = (this.frame + 1) % this.frames;
      this.last = Global.Time.now;
    }
  }
  draw(x, y){
    this.texture.draw(this.frameWidth * this.frame, 0, this.frameWidth, this.texture.img.height,
      x, y, this.property("w", 1), this.property("h", 1),
      this.property("alpha", 1), this.property("theta", 0));
  }
}
