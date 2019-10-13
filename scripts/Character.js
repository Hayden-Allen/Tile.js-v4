class Character {
  constructor(x, y, direction, states, inventory, properties){
    this.direction = direction;
    this.states = states;
    this.currentState = Object.values(this.states)[0];
    this.root = new DynamicTile("", x, y, 0, 0, new Vec2(0, 0), properties);
    this.inventory = inventory;
    this.currentItem = 0;

    let self = this;
    Object.values(this.states).forEach(function(s){
      self.root.addChild(s, s.x, s.y);
    });
  }
  addItem(item){
    if(!this.inventory){
      this.inventory = [item];
      this.equip(0);
    }
    else
      this.inventory.push(item);
  }
  equip(index){
    let cur = this.inventory[this.currentItem];
    if(!cur.inUse && index >= 0 && index < this.inventory.length){
      cur.onUnequip();
      this.currentItem = index;
      this.inventory[this.currentItem].onEquip();
    }
  }
  useItem(){
    let cur = this.inventory[this.currentItem];
    if(cur)
      cur.use(this);
  }
  setState(state){
    this.currentState = state;
    this.currentState.properties.visible = true;
    Object.values(this.states).forEach(function(s){
      if(s !== state)
        s.properties.visible = false;
    });
  }
}
