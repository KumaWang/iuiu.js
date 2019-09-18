function Map() {
}

Map.prototype.update = function(gl, inv) {
if(this.terrain == null || this.terrain.image == null) return;
    
    var bitmapColumn = this.terrain.image.width / 16;
    
    for(var i = 0; i < this.layers.length; i++) {
        var layer = this.layers[i];
        for(var x = 0; x < layer.tiles.length; x++) {
            var tile = layer.tiles[x];
            
            var step1 = {};
            var step2 = {};
            
            step1.color = [ 1, 1, 1, 1 ];
            step2.color = [ 1, 1, 1, 1 ];
            
            step1.texture = this.terrain.image;
            step2.texture = this.terrain.image;
            
            step1.p1 = [ tile.x * 16, tile.y * 16 ];
            step1.p2 = [ tile.x * 16 + 16, tile.y * 16 ];
            step1.p3 = [ tile.x * 16 + 16, tile.y * 16 + 16 ];
            
            step2.p1 = [ tile.x * 16, tile.y * 16 ];
            step2.p2 = [ tile.x * 16 + 16, tile.y * 16 + 16 ];
            step2.p3 = [ tile.x * 16, tile.y * 16 + 16 ];
            
            var uvLeft = (tile.index % bitmapColumn) / bitmapColumn;
            var uvTop = (tile.index / bitmapColumn * 16) / this.terrain.image.height;
            var uvRight = uvLeft + 15 / this.terrain.image.width;
            var uvBottom = uvTop + 15 / this.terrain.image.height;
            
            step1.uv1 = [ uvLeft, 1 - uvTop ];
            step1.uv2 = [ uvRight, 1 - uvTop ];
            step1.uv3 = [ uvRight, 1 - uvBottom ];
            
            step2.uv1 = [ uvLeft, 1 - uvTop ];
            step2.uv2 = [ uvRight, 1 - uvBottom ];
            step2.uv3 = [ uvLeft, 1 - uvBottom ];
            
            gl.draw(step1);
            gl.draw(step2);
        }
    }
} 

Map.create = function() {
    var map = new Map();
    map.mask     = [];
    map.layers   = [];
    map.triggers = [];
    return map;
}

Map.fromJson = function(json, params, entry) {
    var map = entry;
    
    //for(var i = 0; i < json.mask.length; i++) {
    //    
    //}

    if(json["terrain"]) {
        map.terrain = IUIU.Loader.load(json.terrain);
    }

    for(var i = 0; i < json.layers.length; i++) {
        var layer = {};
        layer.tiles   = [];
        layer.spirtes = [];
        var layerJson = json.layers[i];
        
        for(var x = 0; x < layerJson.tiles.length; x++) {
            layer.tiles.push({ 
                x : layerJson.tiles[x].x,
                y : layerJson.tiles[x].y,
                index : layerJson.tiles[x].index
            });
        }
        
        for(var x = 0; x < layerJson.sprites.length; x++) {
            var obj = null;
            switch(layerJson.sprites[x].type) {
              case "ani":
                obj = IUIU.Loader.load(layerJson.sprites[x].inculde);
                break;
              case "image":
                obj = IUIU.Loader.load(layerJson.sprites[x].inculde);
                break;
              case "text":
                obj = IUIU.Loader.load(layerJson.sprites[x].inculde);
                break;
            }
            
            if(obj != null) {
                var spriteJson = layerJson.sprites[x];
                var locationStr = spriteJson.location.split(',');
                var scaleStr = spriteJson.scale.split(',');
                var originStr = spriteJson.origin.split(',');
                var colorStr = spriteJson.color.sprlit(',');
                
                obj.location = { x : parseFloat(locationStr[0]), y : parseFloat(locationStr[1]) };
                obj.scale    = { x : parseFloat(scaleStr[0]), y : parseFloat(scaleStr[1]) };
                obj.origin   = { x : parseFloat(originStr[0]), y : parseFloat(originStr[1]) };
                obj.angle    = parseFloat(spriteJson.angle);
                obj.color    = { 
                    r : parseFloat(spriteJson.color[0]),
                    g : parseFloat(spriteJson.color[1]),
                    b : parseFloat(spriteJson.color[2]),
                    a : parseFloat(spriteJson.color[3])
                };
            }
        }
        
        map.layers.push(layer);
    }

    return map;
}