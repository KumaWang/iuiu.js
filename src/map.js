function Map() {
    
}
 
Map.prototype.update = function(gl, inv) {
    for(var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];        
        if(obj.type == "object") {
            if(!this.states[obj]) {
                this.states[obj] = obj.newState();
            }
            
            this.states[obj].update(inv);
            gl.state(this.states[obj], obj.location, obj.scale, obj.origin, obj.angle, obj.color);
        }
        else {
            if(obj.update) obj.update(inv);
        }
    }
}

Map.prototype.test = function(obj2, x, y) {
    var collisions = [];
    for(var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];
        if(obj2 == obj) continue;
        
        for(x = 0; x < obj.body.parts.length; x++) {
            for(var y = 0; y < obj2.body.parts.length; y++) {
                var part = obj2.body.parts[y];
                for(var l = 0; l < part.vertices.length; l++) {
                    var curr = part.vertices[l];
                    var next = part.vertices[l == part.vertices.length - 1 ? 0 : l + 1];
                    
                    curr = { x : curr.x * obj2.scale.x, y : curr.y * obj2.scale.y };
                    next = { x : next.x * obj2.scale.x, y : next.y * obj2.scale.y };
                    
                    curr = MathTools.pointRotate(obj2.origin, curr, obj2.angle) + obj2.location;
                    next = MathTools.pointRotate(obj2.origin, next, obj2.angle) + obj2.location;
                    
                    if(MathTools.collideLinePoly(curr.x, curr.y, next.x, next.y, obj.body.parts[x])) {
                        collisions.push({ bodyA : obj, bodyB : obj2, partA : obj.body.parts[x], partB : obj2.body.parts[y] });
                        
                        break;
                    }
                
                }
            }
        }
    }
    
    return collisions.length > 0 ? collisions : false;
}

Map.create = function() {
    var map = new Map();
    map.objects  = [];
    map.triggers = [];
    map.states = {};
    return map;
}

Map.fromJson = function(json, params, entry) {
    var map = entry;
    
    for(var x = 0; x < json.items.length; x++) {
        var itemJson = json.items[x];
        var obj = null;
        switch(itemJson.type) {
          case "object":
            obj = IUIU.Loader.load(itemJson.inculde);
            break;
          case "image":
            obj = Tile.fromName(itemJson.inculde);
            break;
          case "text":
            obj = IUIU.Loader.load(itemJson.inculde);
            obj.text = itemJson.text;
            obj.size = parseFloat(itemJson.size);
            break;
        }
        
        if(obj != null) {
            obj.type = itemJson.type;
            var locationStr = itemJson.location.split(',');
            var scaleStr = itemJson.scale.split(',');
            var originStr = itemJson.origin.split(',');
            var colorStr = itemJson.color.split(',');
            
            obj.location = { x : parseFloat(locationStr[0]), y : parseFloat(locationStr[1]) };
            obj.scale    = { x : parseFloat(scaleStr[0]), y : parseFloat(scaleStr[1]) };
            obj.origin   = { x : parseFloat(originStr[0]), y : parseFloat(originStr[1]) };
            obj.angle    = parseFloat(itemJson.angle);
            obj.color    = { 
                r : parseFloat(colorStr[0]) / 255,
                g : parseFloat(colorStr[1]) / 255,
                b : parseFloat(colorStr[2]) / 255,
                a : parseFloat(colorStr[3]) / 255
            };
            
            map.objects.push(obj);
        }
    }
    
    return map;
}