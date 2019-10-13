class Scene {
  constructor(lightMin){
    this.lightMin = lightMin;

    this.lightMap = [];
    this.layers = [];
    this.tiles = [];
    this.rigids = [];
    this.dynamicTiles = [];
    this.lights = [];
    this.dynamicLights = [];
    this.animatedTiles = [];
  }
  deepAdd(t, x, y){
    this.add(t, x, y);
    if(t instanceof DynamicTile){
      let self = this;
      t.children.forEach(function(c){
        self.add(c, x, y);
      });
    }
  }
  add(t, x, y){
    let z = t.property("zindex", 0);

    if(!this.layers[z])
      this.layers[z] = {grid: [], dts: []};
    let layer = this.layers[z];

    if(t instanceof DynamicTile){
      layer.dts.push(t);
      this.dynamicTiles.push(t);
    }
    else {
      if(!layer.grid[y])
        layer.grid[y] = [];
      if(!layer.grid[y][x])
        layer.grid[y][x] = [];
      layer.grid[y][x].push(t);

      if(t instanceof AnimatedTile)
        this.animatedTiles.push(t);
    }

    let light = t.property("light", 0);
    if(light){
      if(t instanceof DynamicTile)
        this.dynamicLights.push(t);
      else
        this.lights.push({x: x, y: y, light: light});
    }
  }
  rigidAt(x, y){
    let found = false;
    this.layers.forEach(function(l){
      if(y < 0 || y > l.grid.length - 1 || !l.grid[y] ||
        x < 0 || x > l.grid[y].length - 1 || !l.grid[y][x])
        return false;
      l.grid[y][x].forEach(function(t){
        found |= t.property("rigid", false);
      });
    });
    return found;
  }
  doorAt(x, y){
    let door;
    this.layers.forEach(function(l){
      if(y < 0 || y > l.grid.length - 1 || !l.grid[y] ||
        x < 0 || x > l.grid[y].length - 1 || !l.grid[y][x])
        return;
      l.grid[y][x].forEach(function(t){
        if(t instanceof Door)
          door = t;
      });
    });
    return door;
  }
  finalize(){
    let self = this;

    let effectMatrices = [];
    this.lights.forEach(function(l){
      effectMatrices.push({x: l.x, y: l.y, m: undefined});

      let size = (l.light - 1) * 2 + 1;
      let cur = effectMatrices[effectMatrices.length - 1];

      cur.m = Global.arr2d(size, size, 0);

      Global.propagate(parseInt(size / 2), parseInt(size / 2), l.light, cur.m);
    });

    let maxw = 0, maxh = 0;
    this.layers.forEach(function(l){
      maxh = Math.max(l.grid.length, maxh);
      l.grid.forEach(function(row){
        maxw = Math.max(row.length, maxw);
      });
    });
    this.width = maxw * Global.tileSize;
    this.height = maxh * Global.tileSize;

    this.lightMap = Global.arr2d(maxw, maxh, 0);
    for(var y = 0; y < maxh; y++){
      for(var x = 0; x < maxw; x++){
        let light = 0;
        effectMatrices.forEach(function(em){
          let emx = parseInt(em.m[0].length / 2) + (x - em.x);
          let emy = parseInt(em.m.length / 2) + (y - em.y);

          if(emy < 0 || emy > em.m.length - 1 ||
            emx < 0 || emx > em.m[emy].length - 1)
            return;
          light += em.m[emy][emx];
        });
        this.lightMap[y][x] = Global.clamp(light, this.lightMin, Global.lightMax);
      }
    }
  }
}
