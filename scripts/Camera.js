class Camera {  //calculates coordinate offsets relative to target
  constructor(target){
    this.target = target; //Tile to follow
  }
  update(){
    //round to avoid annoying graphical quirks
    this.offx = Math.round(Global.c.width / 2 - Global.tileSize / 2 - this.target.x);
    this.offy = Math.round(Global.c.height / 2 - Global.tileSize / 2 - this.target.y);

    //coordinates of center of target
    let tx = this.target.x + Global.tileSize / 2, ty = this.target.y + Global.tileSize / 2;
    let xmax = Global.currentScene.width, ymax = Global.currentScene.height;  //max allowed values in current Scene

    //clamp offsets to range of Scene; if possible, nowhere outside of the Scene will be displayed
    if(xmax > Global.c.width){
      if(tx < Global.c.width / 2)
        this.offx = 0;
      if(xmax - tx < Global.c.width / 2)
        this.offx = Global.c.width - xmax;
    }
    if(ymax > Global.c.height){
      if(ty < Global.c.height / 2)
        this.offy = 0;
      if(ymax - ty < Global.c.height / 2)
        this.offy = Global.c.height - ymax;
    }
  }
}
