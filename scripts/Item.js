class Item extends DynamicTile {  //DynamicTile that performs some function
  constructor(src, x, y, frames, time, fn, properties){
    super(src, x, y, frames, time, new Vec2(0, 0), properties);
    this.fn = fn; //function to call on use
    this.last = 0;  //time of last use
    this.inUse = false; //if currently in use

    //optional setup and cleanup functions
    if(this.property("onEquip", undefined))
      this.onEquip = this.property("onEquip");
    if(this.property("onUnequip", undefined))
      this.onUnequip = this.property("onUnequip");
  }
  async use(user){  //user is the Character that uses the Item
    //if not currently being used and cooldown is not active
    if(!this.inUse && (Global.Time.now - this.last >= this.property("cooldown", 0))){
      this.inUse = true;  //is being used
      await this.fn(user);  //wait for action
      this.inUse = false; //not in use
      this.last = Global.Time.now;  //set last use to now
    }
  }
  //default setup and cleanup functions (called in Character.useItem)
  onEquip(){
    this.properties.visible = true;
  }
  onUnequip(){
    this.properties.visible = false;
  }
}
