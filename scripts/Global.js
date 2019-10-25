let Global = {  //contains data and functions used in other classes
  c: document.getElementById("c"),  //canvas
  ctx: this.c.getContext("2d"), //canvas draw context
  fps: 60,  //frames per second
  keys: new Bitset(0),  //keeps track of input
  lastKey: new Bitset(0), //last key pressed
  controllers: [],  //list of Controllers to be updated each frame
  currentScene: undefined,  //Scene currently being displayed
  currentRenderer: undefined, //Renderer currently being used
  tileSize: 40, //default width and height of every Tile
  clearColor: "#000000",  //background color
  lightMax: 15, //maximum light value for any given Tile
  pixelsPerSide: 8, //number of pixels on each side of a Tile texture. The textures I use are 8x8
  pixelSize: 5, //every pixel in a texture turns into a 5x5 rectangle on the canvas
  fading: false,  //whether or not a graphical fade effect is in progress

  Key: {  //key event codes and indices for keys Bitset
    Code: {
      //for movement
      w: 87,
      a: 65,
      s: 83,
      d: 68,
      //for Item use
      space: 32,
      //for Inventory control
      $1: 49, //1
      $2: 50, //2
      $3: 51, //3
      $4: 52, //4
      q: 81,
      e: 69,
      r: 82,
      f: 70,
      c: 67
    },
    c: 13,
    f: 12,
    r: 11,
    e: 10,
    q: 9,
    $4: 8,
    $3: 7,
    $2: 6,
    $1: 5,
    space: 4,
    w: 3,
    a: 2,
    s: 1,
    d: 0
  },
  Time: {
    now: 0, //set to current time at start of frame
    last: 0,  //set to current time after delta is calculated
    delta: 0  //now - last; that is, time (in ms) that last frame took
  },

  fade: function(ms, dt, door){ //milliseconds this fade should take, DynamicTile and Door to operate on
    if(!Global.fading){ //if a fade effect isn't already happening
      Global.fading = true; //a fade effect is happening
      //set all keys to 0 and lock
      Global.keys.value = 0;
      Global.keys.lock();

      let r = new Rect(0, 0, Global.c.width, Global.c.height, "#000000", 0);  //black rectangle that fades in then out
      let alphaStep = 2 / (ms / (1000 / Global.fps)); //amount added to r's opacity each frame
      new Controller(r, function(){
        r.alpha += alphaStep; //increment opacity
        if(r.alpha > 1){  //if greater than 1 (fully black), then begin to fade out
          r.alpha = 1 - alphaStep;  //start in negative direction
          alphaStep *= -1;  //alphaStep becomes negative
          Global.currentScene = door.to;  //swap Scene when full black rectangle is displayed so you can't see the transition
          //set DynamicTile's coordinates to ones specified by the Door
          dt.setX(door.tox * Global.tileSize);
          dt.setY(door.toy * Global.tileSize);
        }
        if(r.alpha <= 0){ //completed fade
          Global.keys.unlock(); //allow movement
          Global.fading = false;  //no longer fading
          //delete rectangle and this Controller
          r.delete();
          this.delete();
        }
      });
    }
  },
  clearScreen: function(){
    //update Time
    this.Time.now = performance.now();
    this.Time.delta = this.Time.now - this.Time.last;
    this.Time.last = this.Time.now;

    this.ctx.clearRect(0, 0, this.c.width, this.c.height);  //clear screen so that new graphical data isn't being added on top of old
    this.rect(0, 0, this.c.width, this.c.height, this.clearColor, 1);  //draw background color
  },
  tileStretch: function(src, x, y, w, h, properties){ //generates a rectangle of Tiles in the current Scene
    let tw = properties && properties.w ? properties.w : 1; //width of each Tile if specified, 1 otherwise
    let th = properties && properties.h ? properties.h : 1; //height of each Tile if specified, 1 otherwise
    for(var i = 0; i < h; i += th)
      for(var j = 0; j < w; j += tw)
        new Tile(src, x + j, y + i, properties);
  },
  animatedTileStretch: function(src, x, y, w, h, frames, time, properties){ //generates a rectangle of AnimatedTiles in the current Scene
    for(var i = 0; i < h; i++)
      for(var j = 0; j < w; j++)
        new AnimatedTile(src, x + j, y + i, frames, time, properties);
  },
  fixIntersection: function(c, dt){ //resolves collision between two objects
    let w = Global.tileSize, h = w; //only works for Tiles with default dimensions
    let distances = [
      Math.abs(c.y - (dt.y + h)), //distance between top of c and bottom of dt
      Math.abs(c.x - (dt.x + w)), //distance between left of c and right of dt
      Math.abs((c.y + h) - dt.y), //distance between bottom of c and top of dt
      Math.abs((c.x + w) - dt.x)  //distance between right of c and left of dt
    ];

    //determine which direction a collision is most likely to happen from
    let min = 0;
    for(var i = 1; i < distances.length; i++)
      min = (distances[i] < distances[min] ? i : min);

    let hit = false;  //whether or not a collision occurrs
    if(dt.x + w > c.x && dt.x < c.x + w){ //dt is in x range of c
      if(min === 0 && dt.y + h > c.y){  //most likely between top of c and bottom of dt and bottom of dt is below top of c
        dt.setY(c.y - h); //move dt so bottom is touching top of c
        hit = true; //collision occurred
      }
      if(min === 2 && dt.y < c.y + h){  //most likely between bottom of c and top of dt and top of dt is above bottom of c
        dt.setY(c.y + h); //move dt so top is touching bottom of c
        hit = true; //collision occurred
      }
    }
    if(dt.y + h > c.y && dt.y < c.y + h){ //dt is in y range of c
      if(min === 1 && dt.x + w > c.x){  //most likely between left of c and right of dt and right of dt is right of left of c
        dt.setX(c.x - w); //move dt so right is touching left of c
        hit = true; //collision occurred
      }
      if(min === 3 && dt.x < c.x + w){  //most likely between right of c and left of dt and left of dt is left of right of c
        dt.setX(c.x + w); //move dt so left is touching right of c
        hit = true; //collision occurred
      }
    }
    if(hit){  //if a collision occurred
      let fndt = dt.property("onCollide");  //dt's collision handle function
      let fnc = (c instanceof DynamicTile ? c.property("onCollide") : undefined); //c's collision handle function
      //call both functions with respective objects
      if(fndt)
        fndt(dt, c);
      if(fnc)
        fnc(c, dt);
    }
    return hit; //whether or not a collision occurred
  },
  fixIntersections: function(){ //check all objects for collision
    let scene = this.currentScene;
    let self = this;

    //check every visible and rigid DynamicTile against every other visible and rigid DynamicTile
    for(var i = 0; i < scene.dynamicTiles.length; i++){
      let dt = scene.dynamicTiles[i];
      if(dt.property("visible", true) && dt.property("rigid", false)){
        for(var j = i + 1; j < scene.dynamicTiles.length; j++){
          let dt2 = scene.dynamicTiles[j];
          if(dt2.property("visible", true) && dt2.property("rigid", false))
            Global.fixIntersection(dt, dt2);
        }

        //Scene coordinates of DynamicTile
        let sx = parseInt(dt.x / Global.tileSize);
        let sy = parseInt(dt.y / Global.tileSize);

        let corners = [ //Scene coordinates of corners of DynamicTile
          {x: sx, y: sy}, //top left
          {x: sx + 1, y: sy}, //top right
          {x: sx + 1, y: sy + 1}, //bottom right
          {x: sx, y: sy + 1}  //bottom left
        ];

        //check each corner of DynamicTile against rigid Tiles in the Scene
        corners.forEach(async function(c){
          if(scene.rigidAt(c.x, c.y) || scene.doorAt(c.x, c.y)){  //if there's a rigid Tile or a Door at corner coordinates
            let door = scene.doorAt(c.x, c.y);  //door at corner coordinates
            //convert to world coordinates
            c.x *= Global.tileSize;
            c.y *= Global.tileSize;
            //if a collision occurred, dt interacts with Doors, and there is a Door
            if(Global.fixIntersection(c, dt) && dt.property("doors", false) && door){
              let z = dt.property("zindex", 0);
              if(!door.to.layers[z])
                door.to.deepAdd(dt);  //add dt and all children to new Scene
              else {  //if new Scene already contains dt and children, don't add
                let contains = false;
                door.to.layers.forEach(function(layer){
                  layer.dts.forEach(function(t){
                    if(t === dt)
                      contains = true;
                  });
                });
                if(!contains){
                  door.to.deepAdd(dt);
                }
              }
              Global.fade(1000, dt, door);  //fade for 1 second (out for .5 sec, in for .5 sec) and switch Scene
            }
          }
        });
      }
    }
  },
  init: function(){ //size canvas and prevent cursor from displaying on it
    this.c.width = window.innerWidth - 25;
    this.c.height = window.innerHeight - 50;
    this.c.style = "cursor: none;";
  },
  rect: function(x, y, w, h, color, alpha){  //draws a rect filled with color and opacity alpha
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillRect(x, y, w, h);
  },
  updateControllers: function(){  //update all Controllers
    this.controllers.forEach(function(c){
      c.run();
    });
  },
  clamp: function(x, min, max){ //clamps x to [min, max]
    return Math.min(max, Math.max(x, min));
  },
  arr2d: function(w, h, fill){  //create a 2d array of dimensions wxh and fill with fill
    let arr = new Array(h);
    for(var i = 0; i < h; i++){
      arr[i] = new Array(w);
      arr[i].fill(fill);
    }
    return arr;
  },
  propagate: function(x, y, l, arr){  //propagates a light l over array arr. Used in DynamicTile and Scene
    let center = parseInt(arr.length / 2);  //x and y position of l
    //newValue based on linear distance between (x, y) and (lx, ly)
    let newValue = Math.round(l * (1 - Math.sqrt((x - center) ** 2 + (y - center) ** 2) / l));
    //if out of bounds or new value isn't greater than current value
    if(y < 0 || y > arr.length - 1 ||
      x < 0 || x > arr[y].length - 1 ||
      arr[y][x] >= newValue)
      return;
    arr[y][x] = newValue; //set current to new
    //propagate in cardinal directions
    this.propagate(x, y - 1, l, arr);
    this.propagate(x - 1, y, l, arr);
    this.propagate(x, y + 1, l, arr);
    this.propagate(x + 1, y, l, arr);
  },
  round: function(x, base){ //rounds number x to the nearest multiple of base
    let diff = (x - parseInt(x / base) * base) % base;
    return x + (diff > base / 2 ? base - diff : -diff);
  },
  roundToPixel: function(x){  //rounds x to the nearest pixel coordinate (used for player movement to make it look nicer)
    return this.round(x, Global.pixelSize);
  },
  sleep: function(ms){  //waits for given milliseconds
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  timeScale: function(){  //used to scale velocities (in pixels / s) by time since lst frame
    return this.Time.delta / 1000;
  }
};
