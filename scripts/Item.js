class Item extends DynamicTile {
  constructor(src, x, y, frames, time, fn, properties){
    super(src, x, y, frames, time, new Vec2(0, 0), properties);
    this.fn = fn;
    this.last = 0;
    this.inUse = false;

    if(this.property("onEquip", undefined))
      this.onEquip = this.property("onEquip");
    if(this.property("onUnequip", undefined))
      this.onUnequip = this.property("onUnequip");
  }
  async use(user){
    if(!this.inUse && (Global.Time.now - this.last >= this.property("cooldown", 0))){
      this.inUse = true;
      await this.fn(user);
      this.inUse = false;
      this.last = Global.Time.now;
    }
  }
  onEquip(){
    this.properties.visible = true;
  }
  onUnequip(){
    this.properties.visible = false;
  }
}
