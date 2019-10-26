Global.init();  //first time setup

let scene1 = new Scene(0);  //new Scene with minimum light value of 0
Global.currentScene = scene1;

let player = new Character(500, 500, 0, //starts at (500, 500), facing up
  //animation states
  {idle: new DynamicTile("assets/player/idle.png", 0, 0, 2, 500, new Vec2(0, 0), {zindex: 1}),
   walk: new DynamicTile("assets/player/move.png", 0, 0, 2, 500, new Vec2(0, 0), {zindex: 1})},
   undefined,  //no inventory
   //interacts with doors, 2nd layer of Scene, interacts with other rigid Tiles, emits light, movable by other rigid Tiles
   {doors: true, zindex: 1, rigid: true, speed: 10 * Global.tileSize, light: 7, movable: true}
 );
 player.setState(player.states.idle);

//moves player 3 Tiles up
let trampoline = new Item("assets/item/ball.png", 0, 0, 1, 1000,
  async function(user){
    //appear underneath player
    this.properties.visible = true;
    this.x = user.root.x;
    this.y = user.root.y + Global.tileSize;

    user.root.v.unlock(); //make sure player can move
    //only move in y axis
    user.root.v.setX(0);
    user.root.v.setY(-Global.tileSize * 3); //3 tiles/second
    user.root.v.lock(); //no changes until moved 3 tiles

    await Global.sleep(1000); //wait 1 second

    this.properties.visible = false;  //disappear
    user.root.v.unlock(); //let player move
  }, {parent: player.root, visible: false, cooldown: 500, onEquip: function(){}});

//swings a flame around in a circle
let ballnchain = new Item("assets/animation/fire.png", 0, 0, 3, 250,
  async function(user){
    this.properties.visible = true;
    let radius = this.property("radius", 0);

    let chain = []; //list of chain links
    //generate 2 chains per Tile
    for(var i = 0; i < (radius / Global.tileSize - 1) * 2 + 1; i++)
      chain.push(new DynamicTile("assets/item/chain.png",
        user.root.x + Global.tileSize / 2 * (i + 1), user.root.y, 1, 1000, new Vec2(0, 0)));

    let theta = 0;  //start angle
    while(Math.abs(theta) <= 2 * Math.PI){  //1 complete revolution
      let sin = Math.sin(theta), cos = Math.cos(theta);
      //update flame position
      this.setX(Global.roundToPixel(radius * cos + user.root.x));
      this.setY(Global.roundToPixel(radius * sin + user.root.y));

      //update chain position
      for(var i = 0; i < chain.length; i++){
        chain[i].setX(Global.roundToPixel(Global.tileSize / 2 * (i + 1) * cos + user.root.x));
        chain[i].setY(Global.roundToPixel(Global.tileSize / 2 * (i + 1) * sin + user.root.y));
      }

      await Global.sleep(15); //wait a bit before next movement
      theta -= .1;  //increment theta
    }
    this.properties.visible = false;  //disappear
    //delete chain links
    for(var i = 0; i < chain.length; i++)
      chain[i].delete();
  }, {parent: player.root, radius: 5 * Global.tileSize, visible: false, cooldown: 0,
      light: 15, zindex: 1, onEquip: function(){}});

//shoots arrows in direction player is facing
let bow = new Item("assets/item/bow.png", 0, 0, 1, 1000,
  async function(user){
    let theta = user.root.property("theta", 0) - Math.PI / 2; //0 = facing up
    let speed = this.property("speed", 0);  //speed of arrow

    let sin = Math.sin(theta), cos = Math.cos(theta);

    new DynamicTile("assets/item/arrow.png",
      //start 1 Tile in front player in direction it's facing
      user.root.x + cos * Global.tileSize,
      user.root.y + sin * Global.tileSize,
      1, 1000, new Vec2(cos * speed, sin * speed),
      {rigid: true, light: 7, theta: theta + Math.PI / 2, deleteOnWorldEnd: true, //delete when end of Scene is reached
        onCollide: function(dt, collision){ //delete on any collision
          dt.delete();
        }
      }
    );
  }, {parent: player.root, visible: false, speed: 15 * Global.tileSize, zindex: 1, cooldown: 250});

//give player Items
player.addItem(ballnchain);
player.addItem(bow);
player.addItem(trampoline);

let cam = new Camera(player.root);  //center rendering on player
//radius is the smallest value that doesn't leave any blank space on screen
let renderer = new Renderer(Math.round(Math.sqrt((Global.c.width / Global.tileSize) ** 2 + (Global.c.height / Global.tileSize) ** 2)));
Global.currentRenderer = renderer;

new Controller(player, function(){
  let p = this.target.root;
  let vel = p.v;
  let speed = p.property("speed");
  let keys = Global.keys.lowest(4);
  if(!keys.log2())  //if moving along both axes
    speed /= Math.sqrt(2);

  //change direction based on which key was pressed last
  if(Global.lastKey.lowest(4).value !== 0)
    p.setProperty("theta", Global.lastKey.at(Global.Key.w) * Math.PI * 0 +
                            Global.lastKey.at(Global.Key.a) * Math.PI * 3 / 2 +
                            Global.lastKey.at(Global.Key.s) * Math.PI +
                            Global.lastKey.at(Global.Key.d) * Math.PI / 2);

  //x-axis movement
  if(keys.at(Global.Key.d) || keys.at(Global.Key.a))
    p.setVel(vel.setX(speed * (Global.keys.at(Global.Key.d) - Global.keys.at(Global.Key.a))));
  else
    p.setVel(vel.setX(vel.x * .25));

  //y-axis movement
  if(keys.at(Global.Key.s) || keys.at(Global.Key.w))
    p.setVel(vel.setY(speed * (Global.keys.at(Global.Key.s) - Global.keys.at(Global.Key.w))));
  else
    p.setVel(vel.setY(vel.y * .25));

  //if not moving, set animation state to idle
  if(vel.equals(new Vec2(0, 0))){
    this.target.setState(this.target.states.idle);
    //round position to nearest pixels because it looks nice
    //don't do this if moving, because it messes with diagonal movement speed
    p.setX(Global.roundToPixel(p.x));
    p.setY(Global.roundToPixel(p.y));
  }
  else  //if moving, set state to walk
    this.target.setState(this.target.states.walk);

  let numbers = Global.keys.sub(5, 14); //Inventory switch keys
  this.target.equip(numbers.lowestBit()); //equip Item based on lowest valued key pressed

  if(Global.keys.at(Global.Key.space))  //use Item if space pressed
    this.target.useItem();
});


Global.tileStretch("assets/tile/grass.png", 0, 0, 32, 32);  //grass background
//lights
new AnimatedTile("assets/animation/fire.png", 7, 7, 3, 250, {rigid: true, light: 11});
new AnimatedTile("assets/animation/fire.png", 7, 24, 3, 250, {rigid: true, light: 11});
new AnimatedTile("assets/animation/fire.png", 24, 7, 3, 250, {rigid: true, light: 11});
new AnimatedTile("assets/animation/fire.png", 24, 24, 3, 250, {rigid: true, light: 11});
//border with trees
Global.tileStretch("assets/decoration/tree.png", 0, 0, 32, 1, {zindex: 2, w: 2, h: 2});
Global.tileStretch("assets/decoration/tree.png", 30, 2, 1, 30, {zindex: 2, w: 2, h: 2});
Global.tileStretch("assets/decoration/tree.png", 0, 30, 30, 1, {zindex: 2, w: 2, h: 2});
Global.tileStretch("assets/decoration/tree.png", 0, 2, 1, 28, {zindex: 2, w: 2, h: 2});

//pond and campfire
Global.animatedTileStretch("assets/animation/water.png", 8, 18, 3, 3, 4, 1000, {rigid: true});
new Tile("assets/decoration/campfire.png", 11, 18);
new AnimatedTile("assets/animation/fire.png", 11, 18, 3, 250, {rigid: true, light: 9});

//house
Global.tileStretch("assets/tile/wood.png", 12, 9, 3, 2, {rigid: true});
Global.tileStretch("assets/tile/wood.png", 11, 10, 5, 2, {rigid: true});
Global.tileStretch("assets/tile/wood.png", 11, 12, 2, 1, {rigid: true});
Global.tileStretch("assets/tile/wood.png", 14, 12, 2, 1, {rigid: true});
Global.tileStretch("assets/tile/wood_log.png", 12, 8, 3, 1, {rigid: true, zindex: 2});
Global.tileStretch("assets/tile/brick.png", 15, 7, 1, 2, {zindex: 2});
new AnimatedTile("assets/animation/smoke.png", 15, 6, 3, 750, {zindex: 2});
new Tile("assets/tile/wood_log.png", 11, 9, {rigid: true, zindex: 2});
new Tile("assets/tile/wood_log.png", 10, 10, {zindex: 2});
new Tile("assets/tile/wood_log.png", 15, 9, {rigid: true, zindex: 2});
new Tile("assets/tile/wood_log.png", 16, 10, {zindex: 2});

//create new Scenes for use in Doors
let scene2 = new Scene(0);
let scene3 = new Scene(3);

new Door("assets/tile/door.png", 13, 12, 1, 0, scene3, 8, 8); //door into house
//door to white Scene
Global.tileStretch("assets/tile/white.png", 20, 20, 3, 3);
new Door("assets/tile/door.png", 21, 21, 1, 0, scene2, 0, 1);

scene1.finalize();  //generate lightMap

Global.currentScene = scene2; //white world

Global.tileStretch("assets/tile/white.png", 0, 0, 32, 32);  //white background
//lights
new AnimatedTile("assets/animation/fire.png", 7, 7, 3, 250, {rigid: true, light: 11});
new AnimatedTile("assets/animation/fire.png", 7, 24, 3, 250, {rigid: true, light: 11});
new AnimatedTile("assets/animation/fire.png", 24, 7, 3, 250, {rigid: true, light: 11});
new AnimatedTile("assets/animation/fire.png", 24, 24, 3, 250, {rigid: true, light: 11});
new Door("assets/tile/door.png", 0, 0, 1, 0, scene1, 21, 22); //door back to first Scene
scene2.finalize();  //generate lightMap

Global.currentScene = scene3; //inside of house

//walls and floor
Global.tileStretch("assets/tile/wood.png", 0, 0, 12, 4, {rigid: true});
Global.tileStretch("assets/tile/stone.png", 0, 4, 12, 5);
Global.tileStretch("assets/tile/wood.png", 0, 9, 8, 1, {rigid: true});
Global.tileStretch("assets/tile/wood.png", 9, 9, 3, 1, {rigid: true});

//chimney and fireplace
Global.tileStretch("assets/tile/brick.png", 9, 0, 2, 4);
Global.tileStretch("assets/tile/brick.png", 8, 3, 1, 2, {rigid: true});
Global.tileStretch("assets/tile/brick.png", 11, 3, 1, 2, {rigid: true});
new Tile("assets/tile/brick_slope_tl.png", 8, 2);
new Tile("assets/tile/brick_slope_tr.png", 11, 2);
Global.tileStretch("assets/decoration/wood_pile.png", 9, 4, 2, 1);
Global.animatedTileStretch("assets/animation/fire.png", 9, 4, 2, 1, 3, 250, {rigid: true, light: 7});
//decorations
new Tile("assets/decoration/bear_rug.png", 9, 5, {zindex: 1, w: 2, h: 2});
new Tile("assets/decoration/table.png", 0, 4, {rigid: true});
new Tile("assets/decoration/lamp.png", 0, 3, {light: 9});

new Door("assets/tile/door.png", 8, 9, 1, 0, scene1, 13, 13); //door back to first Scene
scene3.finalize();  //generate lightMap

Global.currentScene = scene1;

//player's Inventory UI
//for each Item, make a white background UI Tile
for(var i = 0; i < player.inventory.length; i++){
  //make sure the Tile's are centered horizontally
  let x = Global.c.width / 2 - Global.tileSize / 2 -
    (parseInt(player.inventory.length / 2) - i) * (Global.pixelsPerSide + 2) * Global.pixelSize;
  let y = Global.c.height - Global.tileSize * 1.5;  //same y value for each
  new TileUI("assets/tile/white.png", x, y, {alpha: .5}); //half transparent

  let cur = player.inventory[i];
  new AnimatedTileUI(cur.texture.src, x, y, cur.frames, cur.time);  //add Item texture on top of white background
}
//cursor that hovers on current Item
let cursor = new AnimatedTileUI("assets/animation/cursor.png", 0, Global.c.height - Global.tileSize * 1.5, 2, 500, {});
new Controller(cursor, function(){
  let index = cursor.property("index", -1);
  if(index < 0)
    for(var i = 0; i < Global.currentRenderer.ui.length; i++)
      if(Global.currentRenderer.ui[i].t === this.target){
        index = i;
        cursor.properties.index = i;
        break;
      }

  //use same formula as above to move between Item slots
  Global.currentRenderer.ui[index].x =
    Global.c.width / 2 - Global.tileSize / 2 -
    (parseInt(player.inventory.length / 2) - player.currentItem)
    * (Global.pixelsPerSide + 2) * Global.pixelSize;
});


function update(){
  let start = performance.now();
  Global.clearScreen(); //clear canvas, draw background color, update Global.Time

  Global.updateControllers(); //update all Controllers
  renderer.render(cam, Global.currentScene);  //fix all collisions and draw everything

  //wait for ideal frame time and account for current frame time
  setTimeout(update, 1000 / Global.fps - (performance.now() - start));
}
update(); //call once to start loop

//handle keyboard input and store result in Global.keys
window.onkeydown = function(e){
  e.preventDefault();
  e.stopPropagation();
  for(var key in Global.Key.Code)
    if(e.keyCode === Global.Key.Code[key]){
      Global.keys.set(Global.Key[key]);
      Global.lastKey.clearSet(Global.Key[key]);
    }
}
window.onkeyup = function(e){
  for(var key in Global.Key.Code)
    if(e.keyCode === Global.Key.Code[key])
      Global.keys.reset(Global.Key[key]);
}
//whenever the display area changes size, resize the canvas
window.onresize = Global.init;
//prevent right click menu
window.oncontextmenu = function(){return false;};
