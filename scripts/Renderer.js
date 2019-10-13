class Renderer {
  constructor(radius){
    this.radius = radius;
    this.offsets = [];
    this.ui = [];

    //x = r^2 - y^2
    for(var y = -this.radius; y <= this.radius; y++){
      let bound = parseInt(Math.sqrt(this.radius * this.radius - y * y + 1));
      for(var x = -bound; x <= bound; x++)
        this.offsets.push({x: x, y: y});
    }
  }
  addUI(t, x, y){
    this.ui.push({t: t, x: x, y: y});
  }
  render(cam, scene){
    scene.dynamicTiles.forEach(function(dt){
      dt.update();
    });
    Global.fixIntersections();
    cam.update();

    let px = Math.round(cam.target.x / Global.tileSize);
    let py = Math.round(cam.target.y / Global.tileSize);

    scene.animatedTiles.forEach(function(at){
      at.update();
    });


    let self = this;
    scene.layers.forEach(function(layer){
      self.offsets.forEach(function(point){
        let x = px + point.x, y = py + point.y;
        let cur = layer.grid[y] ? layer.grid[y][x] : undefined;

        if(cur){
          let sx = Math.round(x * Global.tileSize + cam.offx);
          let sy = Math.round(y * Global.tileSize + cam.offy);

          cur.forEach(function(tile){
            if(tile.property("visible", true))
              tile.draw(sx, sy);
          });
        }
      });
      layer.dts.forEach(function(dt){
        if(dt.property("visible", true)){
          dt.draw(dt.x + cam.offx, dt.y + cam.offy);
        }
      });
    });

    self.offsets.forEach(function(point){
      let x = px + point.x, y = py + point.y;
      let cur = scene.lightMap[y] ? scene.lightMap[y][x] : undefined;

      if(cur !== undefined){
        let sx = Math.round(x * Global.tileSize + cam.offx);
        let sy = Math.round(y * Global.tileSize + cam.offy);

        let lightOffset = 0;
        scene.dynamicTiles.forEach(function(dt){
          lightOffset += dt.intensityAt(x, y);
        });

        Global.rect(sx, sy, Global.tileSize, Global.tileSize, "#000000",
          1 - Global.clamp(cur + lightOffset, 0, Global.lightMax) / Global.lightMax);
      }
    });

    this.ui.forEach(function(uie){
      uie.t.draw(uie.x, uie.y);
    });
  }
}
