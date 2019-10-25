class Scene { //stores Tile and light data
  constructor(lightMin){
    this.lightMin = lightMin; //minimum light value for any Tile in this Scene

    this.lightMap = []; //grid of light values
    this.layers = []; //list of layers of grids of lists of Tiles
    this.rigids = []; //list of copy of rigid Tiles (for increased collision check performance)
    this.dynamicTiles = []; //list of DynamicTiles
    this.lights = []; //list of light objects used to generate lightMap
    this.dynamicLights = [];  //list of DynamicTiles with light property
    this.animatedTiles = [];  //list of AnimatedTiles (for update in Renderer)
  }
  deepAdd(t, x, y){ //add a Tile and all of its children
    this.add(t, x, y);
    if(t instanceof DynamicTile){
      let self = this;
      t.children.forEach(function(c){
        self.add(c, x, y);
      });
    }
  }
  add(t, x, y){ //add Tile t at (x, y) in grid
    let z = t.property("zindex", 0);  //layer this Tile will be in

    if(!this.layers[z]) //if given layer doesn't exist, create it
      this.layers[z] = {grid: [], dts: []};
    let layer = this.layers[z];

    if(t instanceof DynamicTile){
      layer.dts.push(t);  //add to layer's DynamicTile array (for rendering)
      this.dynamicTiles.push(t);  //add to Scene's DynamicTile array (for collision prevention)
    }
    else {
      //if list at coordinate doesn't exist, create it
      if(!layer.grid[y])
        layer.grid[y] = [];
      if(!layer.grid[y][x])
        layer.grid[y][x] = [];
      layer.grid[y][x].push(t); //add t to list at (x, y)

      if(t instanceof AnimatedTile)
        this.animatedTiles.push(t); //if AnimatedTile, add to special array for update in Renderer
    }

    let light = t.property("light", 0);
    if(light){
      if(t instanceof DynamicTile)
        this.dynamicLights.push(t); //if non-zero light property and DynamicTile
      else
        this.lights.push({x: x, y: y, light: light}); //if non-zero light property and regular Tile (or AnimatedTile)
    }
  }
  rigidAt(x, y){  //whether or not there's a rigid Tile at (x, y)
    let found = false;
    this.layers.forEach(function(l){  //check each layer
      //if (x, y) is out of bounds for current Scene, return false
      if(y < 0 || y > l.grid.length - 1 || !l.grid[y] ||
        x < 0 || x > l.grid[y].length - 1 || !l.grid[y][x])
        return false;
      //for each Tile at given coordinate in current layer, check if it's rigid
      l.grid[y][x].forEach(function(t){
        found |= t.property("rigid", false);
      });
    });
    return found;
  }
  doorAt(x, y){ //the Door at (x, y)
    let door;
    this.layers.forEach(function(l){  //for each layer
      //if (x, y) is out of bounds for current layer, return
      if(y < 0 || y > l.grid.length - 1 || !l.grid[y] ||
        x < 0 || x > l.grid[y].length - 1 || !l.grid[y][x])
        return;
      //if the list at (x, y) in current layer contains door, save it
      l.grid[y][x].forEach(function(t){
        if(t instanceof Door)
          door = t;
      });
    });
    return door;  //return last found door
  }
  finalize(){ //creates lightMap and saves max width and height of any layer
    let self = this;

    let effectMatrices = [];  //list of light value grids for every light
    this.lights.forEach(function(l){
      effectMatrices.push({x: l.x, y: l.y, m: undefined});  //x and y coords of light, offset matrix

      let size = (l.light - 1) * 2 + 1; //light propagates light - 1 Tiles in each direction, plus the Tile it's on
      let cur = effectMatrices[effectMatrices.length - 1];

      cur.m = Global.arr2d(size, size, 0);  //create square matrix filled with 0s

      //propagate over new grid width current light, starting at the middle of the grid
      Global.propagate(parseInt(size / 2), parseInt(size / 2), l.light, cur.m);
    });

    //determine maximum x and y coordinates allowed in this Scene
    let maxw = 0, maxh = 0;
    this.layers.forEach(function(l){
      maxh = Math.max(l.grid.length, maxh);
      l.grid.forEach(function(row){
        maxw = Math.max(row.length, maxw);
      });
    });
    this.width = maxw * Global.tileSize;
    this.height = maxh * Global.tileSize;

    //create final lightMap by compiling list of effect matrices
    this.lightMap = Global.arr2d(maxw, maxh, 0);
    for(var y = 0; y < maxh; y++){
      for(var x = 0; x < maxw; x++){
        let light = 0;  //light value at (x, y)
        //add up effects of all lights at (x, y)
        effectMatrices.forEach(function(em){
          //convert (x, y) into effect matrix coordinates
          let emx = parseInt(em.m[0].length / 2) + (x - em.x);
          let emy = parseInt(em.m.length / 2) + (y - em.y);

          //if out of bounds, do nothing
          if(emy < 0 || emy > em.m.length - 1 ||
            emx < 0 || emx > em.m[emy].length - 1)
            return;
          light += em.m[emy][emx];  //else add value at (emx, emy) to value at (x, y)
        });
        //clamp to [lightMin, lightMax]
        this.lightMap[y][x] = Global.clamp(light, this.lightMin, Global.lightMax);
      }
    }
  }
}
