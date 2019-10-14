function Map() {
    
}
 
Map.prototype.update = function(gl, inv) {
    for(var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];        
        if(obj.type == "obj") {
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
          case "obj":
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