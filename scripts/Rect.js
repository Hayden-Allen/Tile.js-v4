class Rect {
  constructor(x, y, w, h, color, alpha){
    this.x = x; this.y = y;
    this.w = w; this.h = h;
    this.color = color;
    this.alpha = alpha;
    this.renderer = Global.currentRenderer;

    this.renderer.addUI(this, 0, 0);
  }
  draw(ox, oy){
    //console.log(this.alpha);
    Global.rect(this.x + ox, this.y + oy, this.w, this.h,
      this.color, this.alpha, 0);
  }
  delete(){
    for(var i = 0; i < this.renderer.ui.length; i++)
      if(this.renderer.ui[i].t === this){
        this.renderer.ui.splice(i, 1);
        break;
      }
  }
}
