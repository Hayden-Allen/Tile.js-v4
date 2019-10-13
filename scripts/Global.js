let Global = {
  c: document.getElementById("c"),
  ctx: this.c.getContext("2d"),
  fps: 60,
  keys: new Bitset(0),
  lastKey: new Bitset(0),
  controllers: [],
  currentScene: undefined,
  currentRenderer: undefined,
  tileSize: 40,
  clearColor: "#000000",
  lightMax: 15,
  pixelsPerSide: 8,
  pixelSize: 5,
  fading: false,

  Key: {
    Code: {
      w: 87,
      a: 65,
      s: 83,
      d: 68,
      space: 32,
      $1: 49,
      $2: 50,
      $3: 51,
      $4: 52,
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
    now: 0,
    last: 0,
    delta: 0
  },

  fade: function(ms, dt, door){
    if(!Global.fading){
      Global.fading = true;
      Global.keys.value = 0;
      Global.keys.lock();

      let w = Math.max(Global.currentScene.width, door.to.width);
      let h = Math.max(Global.currentScene.height, door.to.height);
      let r = new Rect(0, 0, w, h, "#000000", 0);
      let alphaStep = 2 / (ms / (1000 / Global.fps));
      new Controller(r, function(){
        r.alpha += alphaStep;
        if(r.alpha > 1){
          r.alpha = 1 - alphaStep;
          alphaStep *= -1;
          Global.currentScene = door.to;
          dt.setX(door.tox * Global.tileSize);
          dt.setY(door.toy * Global.tileSize);
        }
        if(r.alpha <= 0){
          Global.keys.unlock();
          Global.fading = false;
          r.delete();
          this.delete();
        }
      });
    }
  },
  clearScreen: function(){
    this.Time.now = performance.now();
    this.Time.delta = this.Time.now - this.Time.last;
    this.Time.last = this.Time.now;

    this.ctx.clearRect(0, 0, this.c.width, this.c.height);
    this.rect(0, 0, this.c.width, this.c.height, this.clearColor);
  },
  tileStretch: function(src, x, y, w, h, properties){
    let tw = properties && properties.w ? properties.w : 1;
    let th = properties && properties.h ? properties.h : 1;
    for(var i = 0; i < h; i += th)
      for(var j = 0; j < w; j += tw)
        new Tile(src, x + j, y + i, properties);
  },
  animatedTileStretch: function(src, x, y, w, h, frames, time, properties){
    for(var i = 0; i < h; i++)
      for(var j = 0; j < w; j++)
        new AnimatedTile(src, x + j, y + i, frames, time, properties);
  },
  fixIntersection: function(c, dt){
    let w = Global.tileSize, h = w;
    let distances = [
      Math.abs(c.y - (dt.y + h)),
      Math.abs(c.x - (dt.x + w)),
      Math.abs((c.y + h) - dt.y),
      Math.abs((c.x + w) - dt.x)
    ];

    let min = 0;
    for(var i = 1; i < distances.length; i++)
      min = (distances[i] < distances[min] ? i : min);

    let hit = false;
    if(dt.x + w > c.x && dt.x < c.x + w){
      if(min === 0 && dt.y + h > c.y){
        dt.setY(c.y - h);
        hit = true;
      }
      if(min === 2 && dt.y < c.y + h){
        dt.setY(c.y + h);
        hit = true;
      }
    }
    if(dt.y + h > c.y && dt.y < c.y + h){
      if(min === 1 && dt.x + w > c.x){
        dt.setX(c.x - w);
        hit = true;
      }
      if(min === 3 && dt.x < c.x + w){
        dt.setX(c.x + w);
        hit = true;
      }
    }
    if(hit){
      let fndt = dt.property("onCollide");
      let fnc = (c instanceof DynamicTile ? c.property("onCollide") : undefined);
      if(fndt)
        fndt(dt, c);
      if(fnc)
        fnc(c, dt);
    }
    return hit;
  },
  fixIntersections: function(){
    let scene = this.currentScene;
    let self = this;

    for(var i = 0; i < scene.dynamicTiles.length; i++){
      let dt = scene.dynamicTiles[i];
      if(dt.property("visible", true) && dt.property("rigid", false)){
        for(var j = i + 1; j < scene.dynamicTiles.length; j++){
          let dt2 = scene.dynamicTiles[j];
          if(dt2.property("visible", true) && dt2.property("rigid", false))
            Global.fixIntersection(dt, dt2);
        }

        let sx = parseInt(dt.x / Global.tileSize);
        let sy = parseInt(dt.y / Global.tileSize);

        let corners = [
          {x: sx, y: sy},
          {x: sx + 1, y: sy},
          {x: sx + 1, y: sy + 1},
          {x: sx, y: sy + 1}
        ];

        corners.forEach(async function(c){
          if(scene.rigidAt(c.x, c.y) || scene.doorAt(c.x, c.y)){
            let door = scene.doorAt(c.x, c.y);
            c.x *= Global.tileSize;
            c.y *= Global.tileSize;
            if(Global.fixIntersection(c, dt) && dt.property("doors", false) && door){
              let z = dt.property("zindex", 0);
              if(!door.to.layers[z])
                door.to.deepAdd(dt);
              else {
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
              Global.fade(1000, dt, door);
            }
          }
        });
      }
    }
  },
  init: function(){
    this.c.width = window.innerWidth - 25;
    this.c.height = window.innerHeight - 50;
    this.c.style = "cursor: none;";
  },
  rect: function(x, y, w, h, color, alpha, theta){
    this.ctx.save();

    this.ctx.translate(x + w / 2, y + h / 2);
    this.ctx.rotate(theta);
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillRect(-w / 2, -h / 2, w, h);

    this.ctx.restore();
  },
  updateControllers: function(){
    this.controllers.forEach(function(c){
      c.run();
    });
  },
  clamp: function(x, min, max){
    return Math.min(max, Math.max(x, min));
  },
  arr2d: function(w, h, fill){
    let arr = new Array(h);
    for(var i = 0; i < h; i++){
      arr[i] = new Array(w);
      arr[i].fill(fill);
    }
    return arr;
  },
  propagate: function(x, y, l, arr){
    let center = parseInt(arr.length / 2);
    let newValue = Math.round(l * (1 - Math.sqrt((x - center) ** 2 + (y - center) ** 2) / l));
    if(y < 0 || y > arr.length - 1 ||
      x < 0 || x > arr[y].length - 1 ||
      arr[y][x] >= newValue)
      return;
    arr[y][x] = newValue;
    this.propagate(x, y - 1, l, arr);
    this.propagate(x - 1, y, l, arr);
    this.propagate(x, y + 1, l, arr);
    this.propagate(x + 1, y, l, arr);
  },
  round: function(x, base){
    let diff = (x - parseInt(x / base) * base) % base;
    return x + (diff > base / 2 ? base - diff : -diff);
  },
  roundToPixel: function(x){
    return this.round(x, Global.tileSize / Global.pixelsPerSide);
  },
  sleep: function(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  timeScale: function(){
    return this.Time.delta / 1000;
  }
};
