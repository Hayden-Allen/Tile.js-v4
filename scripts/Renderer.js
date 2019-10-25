class Renderer {  //takes a Scene and Camera and draws to the screen
  constructor(radius){
    this.radius = radius; //radius of circle of Tiles to render from the Scene
    this.offsets = [];  //list of coordinate offsets used to determine what to render
    this.ui = []; //list of UI elements

    //x = sqrt(r^2 - y^2)
    //generate list of offsets
    //
    //iterate from top to bottom of circle
    //for each iteration, calculate x axis boundaries using above formula
    //iterate from left to right and add each coordinate to list
    for(var y = -this.radius; y <= this.radius; y++){
      let bound = parseInt(Math.sqrt(this.radius * this.radius - y * y + 1));
      for(var x = -bound; x <= bound; x++)
        this.offsets.push({x: x, y: y});
    }
  }
  addUI(t, x, y){ //add Tile to UI
    this.ui.push({t: t, x: x, y: y});
  }
  render(cam, scene){
    //update all DynamicTiles
    scene.dynamicTiles.forEach(function(dt){
      dt.update();
    });
    Global.fixIntersections();  //fix all collisions
    cam.update(); //calculate coordinate offsets

    //Scene coordinates of camera target
    let px = Math.round(cam.target.x / Global.tileSize);
    let py = Math.round(cam.target.y / Global.tileSize);

    //update all AnimatedTiles to avoid frame staggering
    //in future, I would like to make this a chunk loading algorithm:
    //all AnimatedTiles adjacent to an AnimatedTile that is visible are updated
    scene.animatedTiles.forEach(function(at){
      at.update();
    });


    let self = this;
    scene.layers.forEach(function(layer){ //draw each layer of the Scene in order
      self.offsets.forEach(function(point){ //for each offset value
        let x = px + point.x, y = py + point.y; //calculate Scene coordinate as camera target coordinate + offset
        let cur = layer.grid[y] ? layer.grid[y][x] : undefined; //Tile array in current layer at current coordinate

        if(cur){  //if Tile array exists
          //screen coordinates
          let sx = Math.round(x * Global.tileSize + cam.offx);
          let sy = Math.round(y * Global.tileSize + cam.offy);

          cur.forEach(function(tile){ //if visible, draw each Tile in array
            if(tile.property("visible", true))
              tile.draw(sx, sy);
          });
        }
      });
      //draw layer's DynamicTiles on top of layer's Tiles
      layer.dts.forEach(function(dt){
        if(dt.property("visible", true)){
          dt.draw(dt.x + cam.offx, dt.y + cam.offy);
        }
      });
    });

    //draw shadows on visible part of screen, mostly same as above
    self.offsets.forEach(function(point){
      let x = px + point.x, y = py + point.y;
      let cur = scene.lightMap[y] ? scene.lightMap[y][x] : undefined;

      if(cur !== undefined){
        let sx = Math.round(x * Global.tileSize + cam.offx);
        let sy = Math.round(y * Global.tileSize + cam.offy);

        let lightOffset = 0;  //sum of all DynamicTile light effects at current coordinate
        scene.dynamicTiles.forEach(function(dt){
          lightOffset += dt.intensityAt(x, y);
        });

        //clamp total light value to [0, lightMax] to avoid out of range alpha
        Global.rect(sx, sy, Global.tileSize, Global.tileSize, "#000000",
          1 - Global.clamp(cur + lightOffset, 0, Global.lightMax) / Global.lightMax);
      }
    });

    //finally, draw all UI elements
    this.ui.forEach(function(uie){
      uie.t.draw(uie.x, uie.y);
    });
  }
}
