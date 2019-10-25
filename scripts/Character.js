class Character { //collection of DynamicTiles
  constructor(x, y, direction, states, inventory, properties){
    this.direction = direction; //direction facing (from 0 to 3)
    this.states = states; //DynamicTiles representing different animation states
    this.currentState = Object.values(this.states)[0];  //set current to first in list
    this.root = new DynamicTile("", x, y, 0, 0, new Vec2(0, 0), properties);  //invisible root Tile that all transformations will be applied to
    this.inventory = inventory; //list of Items
    this.currentItem = 0; //index of equipped Item

    for(var state in this.states){  //make each animation state a child of root
      let cur = this.states[state];
      this.root.addChild(cur, cur.x, cur.y);
    }
  }
  addItem(item){  //adds Item to Inventory
    if(!this.inventory){  //if inventory doesn't exist, create it and equip given Item
      this.inventory = [item];
      this.equip(0);
    }
    else
      this.inventory.push(item);
  }
  equip(index){ //switch current Item
    let cur = this.inventory[this.currentItem]; //current Item
    if(!cur.inUse && index >= 0 && index < this.inventory.length){  //if cur is not being used and index is valid
      cur.onUnequip();  //current Item's cleanup function
      this.currentItem = index; //set current Item
      this.inventory[this.currentItem].onEquip(); //new Item's setup function
    }
  }
  useItem(){  //call current Item's use function and pass this
    let cur = this.inventory[this.currentItem];
    if(cur)
      cur.use(this);
  }
  setState(state){  //changes current animation state
    this.currentState.properties.visible = false; //set current to invisible
    this.currentState = state;  //set to new
    this.currentState.properties.visible = true;  //set new to visible
  }
}
