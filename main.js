Global.init();

let scene1 = new Scene(0);
Global.currentScene = scene1;

let player = new Character(500, 500, 0,
  {idle: new DynamicTile("assets/player/idle.png", 0, 0, 2, 500, new Vec2(0, 0), {zindex: 1}),
   walk: new DynamicTile("assets/player/move.png", 0, 0, 2, 500, new Vec2(0, 0), {zindex: 1})},
   undefined, {doors: true, zindex: 1, rigid: true, speed: 10 * Global.tileSize, light: 7, movable: true});

let trampoline = new Item("assets/item/ball.png", 500, 500, 1, 1000,
  async function(user){
    this.properties.visible = true;
    this.x = user.root.x;
    this.y = user.root.y + Global.tileSize;

    user.root.v.unlock();
    user.root.v.setX(0);
    user.root.v.setY(-Global.tileSize * 3);
    user.root.v.lock();

    await Global.sleep(1000);

    this.properties.visible = false;
    user.root.v.unlock();
  }, {parent: player.root, visible: false, cooldown: 500, onEquip: function(){}});

let ballnchain = new Item("assets/animation/fire.png", 0, 0, 3, 250,
  async function(user){
    this.properties.visible = true;
    let radius = this.property("radius", 0);

    // if(!this.properties.chain){
    //   this.properties.chain = [];
    let chain = [];
    for(var i = 0; i < (radius / Global.tileSize - 1) * 2 + 1; i++)
      chain.push(new DynamicTile("assets/item/chain.png",
        user.root.x + Global.tileSize / 2 * (i + 1), user.root.y, 1, 1000, new Vec2(0, 0)));
    // }
    // else
    //   for(var i = 0; i < this.properties.chain.length; i++)
    //     this.properties.chain[i].properties.visible = true;
    // let chain = this.properties.chain;

    let theta = 0;
    while(Math.abs(theta) <= 2 * Math.PI){
      let sin = Math.sin(theta), cos = Math.cos(theta);
      this.setX(Global.roundToPixel(radius * cos + user.root.x));
      this.setY(Global.roundToPixel(radius * sin + user.root.y));

      for(var i = 0; i < chain.length; i++){
        chain[i].setX(Global.roundToPixel(Global.tileSize / 2 * (i + 1) * cos + user.root.x));
        chain[i].setY(Global.roundToPixel(Global.tileSize / 2 * (i + 1) * sin + user.root.y));
      }

      await Global.sleep(17);
      theta -= .1;
    }
    this.properties.visible = false;
    for(var i = 0; i < chain.length; i++)
      chain[i].delete();
  }, {parent: player.root, radius: 5 * Global.tileSize, visible: false, cooldown: 0,
      light: 15, zindex: 1, onEquip: function(){}});

let bow = new Item("assets/item/bow.png", 0, 0, 1, 1000,
  async function(user){
    let theta = user.root.property("theta", 0) - Math.PI / 2;
    let speed = this.property("speed", 0);

    let sin = Math.sin(theta), cos = Math.cos(theta);

    new DynamicTile("assets/item/arrow.png",
      user.root.x + cos * Global.tileSize,
      user.root.y + sin * Global.tileSize,
      1, 1000, new Vec2(cos * speed, sin * speed),
      {rigid: true, light: 7, theta: theta + Math.PI / 2, deleteOnWorldEnd: true,
        onCollide: function(dt, collision){
          dt.delete();
        }
      }
    );
  }, {parent: player.root, visible: false, speed: 15 * Global.tileSize, zindex: 1, cooldown: 250});

player.addItem(bow);
player.addItem(ballnchain);
player.addItem(trampoline);

let cam = new Camera(player.root);
let renderer = new Renderer(Math.round(Math.sqrt((Global.c.width / Global.tileSize) ** 2 + (Global.c.height / Global.tileSize) ** 2)));
Global.currentRenderer = renderer;

new Controller(player, function(){
  let p = this.target.root;
  let vel = p.v;
  let speed = p.property("speed");
  let keys = Global.keys.lowest(4);
  if(!keys.log2())
    speed /= Math.sqrt(2);

  if(Global.lastKey.lowest(4).value !== 0)
    p.setProperty("theta", Global.lastKey.at(Global.Key.w) * Math.PI * 0 +
                            Global.lastKey.at(Global.Key.a) * Math.PI * 3 / 2 +
                            Global.lastKey.at(Global.Key.s) * Math.PI +
                            Global.lastKey.at(Global.Key.d) * Math.PI / 2);

  if(keys.at(Global.Key.d) || keys.at(Global.Key.a))
    p.setVel(vel.setX(speed * (Global.keys.at(Global.Key.d) - Global.keys.at(Global.Key.a))));
  else
    p.setVel(vel.setX(vel.x * .5));

  if(keys.at(Global.Key.s) || keys.at(Global.Key.w))
    p.setVel(vel.setY(speed * (Global.keys.at(Global.Key.s) - Global.keys.at(Global.Key.w))));
  else
    p.setVel(vel.setY(vel.y * .5));

  if(vel.equals(new Vec2(0, 0))){
    this.target.setState(this.target.states.idle);
    p.setX(Global.roundToPixel(this.target.root.x));
    p.setY(Global.roundToPixel(this.target.root.y));
  }
  else
    this.target.setState(this.target.states.walk);

  let numbers = Global.keys.sub(5, 14); //number keys
  this.target.equip(numbers.lowestBit());

  if(Global.keys.at(Global.Key.space))
    this.target.useItem();
});


Global.tileStretch("assets/tile/grass.png", 0, 0, 32, 32);
new AnimatedTile("assets/animation/fire.png", 7, 7, 3, 250, {rigid: true, light: 11});
new AnimatedTile("assets/animation/fire.png", 7, 24, 3, 250, {rigid: true, light: 11});
new AnimatedTile("assets/animation/fire.png", 24, 7, 3, 250, {rigid: true, light: 11});
new AnimatedTile("assets/animation/fire.png", 24, 24, 3, 250, {rigid: true, light: 11});
Global.tileStretch("assets/decoration/tree.png", 0, 0, 32, 1, {zindex: 2, w: 2, h: 2});
Global.tileStretch("assets/decoration/tree.png", 30, 2, 1, 30, {zindex: 2, w: 2, h: 2});
Global.tileStretch("assets/decoration/tree.png", 0, 30, 30, 1, {zindex: 2, w: 2, h: 2});
Global.tileStretch("assets/decoration/tree.png", 0, 2, 1, 28, {zindex: 2, w: 2, h: 2});

Global.animatedTileStretch("assets/animation/water.png", 8, 18, 3, 3, 4, 1000, {rigid: true});
new Tile("assets/decoration/campfire.png", 11, 18);
new AnimatedTile("assets/animation/fire.png", 11, 18, 3, 250, {rigid: true, light: 9});

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

let scene2 = new Scene(0);
let scene3 = new Scene(3);
new Door("assets/tile/door.png", 13, 12, 1, 0, scene3, 8, 8);
Global.tileStretch("assets/tile/white.png", 20, 20, 3, 3);
new Door("assets/tile/door.png", 21, 21, 1, 0, scene2, 0, 1);
scene1.finalize();

Global.currentScene = scene2;

Global.tileStretch("assets/tile/white.png", 0, 0, 32, 32);
new AnimatedTile("assets/animation/fire.png", 7, 7, 3, 250, {rigid: true, light: 11});
new AnimatedTile("assets/animation/fire.png", 7, 24, 3, 250, {rigid: true, light: 11});
new AnimatedTile("assets/animation/fire.png", 24, 7, 3, 250, {rigid: true, light: 11});
new AnimatedTile("assets/animation/fire.png", 24, 24, 3, 250, {rigid: true, light: 11});
new Door("assets/tile/door.png", 0, 0, 1, 0, scene1, 15, 16);
scene2.finalize();

Global.currentScene = scene3;

Global.tileStretch("assets/tile/wood.png", 0, 0, 12, 4, {rigid: true});
Global.tileStretch("assets/tile/stone.png", 0, 4, 12, 5);
Global.tileStretch("assets/tile/wood.png", 0, 9, 8, 1, {rigid: true});
Global.tileStretch("assets/tile/wood.png", 9, 9, 3, 1, {rigid: true});

Global.tileStretch("assets/tile/brick.png", 9, 0, 2, 4);
Global.tileStretch("assets/tile/brick.png", 8, 3, 1, 2, {rigid: true});
Global.tileStretch("assets/tile/brick.png", 11, 3, 1, 2, {rigid: true});
new Tile("assets/tile/brick_slope_tl.png", 8, 2);
new Tile("assets/tile/brick_slope_tr.png", 11, 2);
Global.tileStretch("assets/decoration/wood_pile.png", 9, 4, 2, 1);
Global.animatedTileStretch("assets/animation/fire.png", 9, 4, 2, 1, 3, 250, {rigid: true, light: 7});
new Tile("assets/decoration/bear_rug.png", 9, 5, {zindex: 1, w: 2, h: 2});
new Tile("assets/decoration/table.png", 0, 4, {rigid: true});
new Tile("assets/decoration/lamp.png", 0, 3, {light: 9});


new Door("assets/tile/door.png", 8, 9, 1, 0, scene1, 13, 13);
scene3.finalize();


Global.currentScene = scene1;

for(var i = 0; i < player.inventory.length; i++){
  let x = Global.c.width / 2 - Global.tileSize / 2 -
    (parseInt(player.inventory.length / 2) - i) * (Global.pixelsPerSide + 2) * Global.pixelSize;
  let y = Global.c.height - Global.tileSize * 1.5;
  new TileUI("assets/tile/white.png", x, y, {alpha: .5});

  let cur = player.inventory[i];
  new AnimatedTileUI(cur.texture.src, x, y, cur.frames, cur.time);
}
let cursor = new AnimatedTileUI("assets/animation/cursor.png", 0, Global.c.height - Global.tileSize * 1.5, 2, 500);
new Controller(cursor, function(){
  let index = 0;
  for(var i = 0; i < Global.currentRenderer.ui.length; i++)
    if(Global.currentRenderer.ui[i].t === this.target){
      index = i;
      break;
    }
  Global.currentRenderer.ui[index].x =
    Global.c.width / 2 - Global.tileSize / 2 -
    (parseInt(player.inventory.length / 2) - player.currentItem)
    * (Global.pixelsPerSide + 2) * Global.pixelSize;
});

let frames = 0, seconds = 0, start = performance.now();
function update(){
  let frameStart = performance.now();
  Global.clearScreen();

  Global.updateControllers();
  renderer.render(cam, Global.currentScene);

  frames++;
  seconds = parseInt((performance.now() - start) / 1000);
  //document.getElementById("framerate").innerHTML = Math.round(frames / seconds);

  setTimeout(update, 0);
}
update();

window.onkeydown = function(e){
  // if(e.keyCode !== 122 && e.keyCode !== 123){ //open console
  //   e.preventDefault();
  //   e.stopPropagation();
  // }
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
window.onresize = Global.init;
