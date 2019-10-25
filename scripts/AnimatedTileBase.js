class AnimatedTileBase extends TileBase { //Tile with multiple texture frames
  constructor(src, frames, time, properties){
    super(src, properties);
    this.frames = frames; //number of frames in texture
    this.frame = 0; //current frame
    this.time = time; //time (in ms) for one cycle of animation
    this.timePerFrame = this.time / this.frames;  //time (in ms) for each frame to be displayed
    this.last = 0;  //time of last frame switch
    this.frameWidth = 0;  //crop width for texture

    let self = this;
    this.texture.img.onload = function(){
      self.frameWidth = self.texture.img.width / self.frames; //crop width = total width / number of frames
    }
  }
  update(){
    if(Global.Time.now - this.last >= this.timePerFrame){ //if enough time has passed
      this.frame = (this.frame + 1) % this.frames;  //switch frame (automatically loops to 0)
      this.last = Global.Time.now;  //set last update time
    }
  }
  draw(x, y){
    //crop texture at current frame * width of each frame
    this.texture.draw(this.frameWidth * this.frame, 0, this.frameWidth, this.texture.img.height,
      x, y, this.property("w", 1), this.property("h", 1),
      this.property("alpha", 1), this.property("theta", 0));
  }
}
