class Texture { //Image that is drawn to the screen from file
  constructor(src){
    this.src = src; //filepath
    this.img = new Image(); //image data
    this.img.src = src; //set image data source to given filepath
  }
  //crop x, crop y, crop width, crop height, display x and y, display width and height, opacity, angle
  draw(cx, cy, cw, ch, x, y, w, h, alpha, theta){
    Global.ctx.save();  //save canvas state
    Global.ctx.globalAlpha = alpha; //set opacity

    Global.ctx.translate(x + Global.tileSize / 2, y + Global.tileSize / 2); //move origin to center of image
    Global.ctx.rotate(theta); //rotate about origin
    //draw cropped image
    Global.ctx.drawImage(this.img, cx, cy, cw, ch,
      -Global.tileSize / 2, -Global.tileSize / 2,
      Global.tileSize * w, Global.tileSize * h);

    Global.ctx.restore(); //restore canvas state
  }
}
