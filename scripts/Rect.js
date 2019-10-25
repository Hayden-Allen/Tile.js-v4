class Rect {  //a single colored rectangle
  constructor(x, y, w, h, color, alpha){
    //screen coordinates
    this.x = x; this.y = y;
    //width and height
    this.w = w; this.h = h;
    this.color = color;
    this.alpha = alpha; //opacity
    this.renderer = Global.currentRenderer;

    this.renderer.addUI(this, 0, 0);  //add to Renderer's UI list
  }
  draw(ox, oy){ //draw at coordinates plus given offsets
    Global.rect(this.x + ox, this.y + oy, this.w, this.h,
      this.color, this.alpha);
  }
  delete(){ //remove from Renderer
    for(var i = 0; i < this.renderer.ui.length; i++)
      if(this.renderer.ui[i].t === this){
        this.renderer.ui.splice(i, 1);
        break;
      }
  }
}
