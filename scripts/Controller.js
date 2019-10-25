class Controller {  //contains a function to operate on the target
  constructor(target, run){
    this.target = target; //Tile to operate on
    this.run = run; //function to operate on Tile
    Global.controllers.push(this);  //add to Global array for automatic update each frame
  }
  delete(){ //remove from Global array
    for(var i = 0; i < Global.controllers.length; i++)
      if(Global.controllers[i] === this){
        Global.controllers.splice(i, 1);
        break;
      }
  }
}
