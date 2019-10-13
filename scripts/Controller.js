class Controller {
  constructor(target, run){
    this.target = target;
    this.run = run;
    Global.controllers.push(this);
  }
  delete(){
    for(var i = 0; i < Global.controllers.length; i++)
      if(Global.controllers[i] === this){
        Global.controllers.splice(i, 1);
        break;
      }
  }
}
