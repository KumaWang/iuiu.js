function Bitmap() {
    this.isVisual = true;
}
Bitmap.items = {};
Bitmap.callbacks = [];

Bitmap.prototype.triangulate = function(name) {
    var sheet = this.sheets[name];
    if(sheet == null) return;
    
    var minX = Number.MAX_VALUE;
    var minY = Number.MAX_VALUE;
    for(var index2 = 0; index2 < sheet.keypoints.length; index2++) {
        var drawOffset = { x : sheet.keypoints[index2].x, y : sheet.keypoints[index2].y };
        sheet.keypoints[index2].drawOffset = drawOffset;
        sheet.keypoints[index2].bindingUV = [ sheet.keypoints[index2].x / this.image.width, sheet.keypoints[index2].y / this.image.height ];
        
        if(minX > drawOffset.x) minX = drawOffset.x;
        if(minY > drawOffset.y) minY = drawOffset.y;
    }
    sheet.drawOffset = { x : minX, y : minY };
    
    this.triangles[name] = [];
    var vertices = [];
    this.fixedUVs = [];
    for(var i = 0; i < sheet.keypoints.length; i++) {
        var keypoint = sheet.keypoints[i];
        vertices.push([ keypoint.drawOffset.x - sheet.drawOffset.x, keypoint.drawOffset.y - sheet.drawOffset.y ]);
    }
    
    
    var delau_triangles = Delaunay.triangulate(vertices);
    for(var x = 0; x < delau_triangles.length; x += 3) {
        
        var v1 = vertices[delau_triangles[x]];
        var v2 = vertices[delau_triangles[x + 1]];
        var v3 = vertices[delau_triangles[x + 2]];
        
        var p1 = new MeshVertexTrackerDefault(v1);
        var p2 = new MeshVertexTrackerDefault(v2);
        var p3 = new MeshVertexTrackerDefault(v3);
        
        this.triangles[name].push({
            p1 : { tracker : p1, uv : { x : (v1[0] + sheet.drawOffset.x) / this.image.width, y : (v1[1] + sheet.drawOffset.y) / this.image.height } },
            p2 : { tracker : p2, uv : { x : (v2[0] + sheet.drawOffset.x) / this.image.width, y : (v2[1] + sheet.drawOffset.y) / this.image.height } },
            p3 : { tracker : p3, uv : { x : (v3[0] + sheet.drawOffset.x) / this.image.width, y : (v3[1] + sheet.drawOffset.y) / this.image.height } },
        });     
    }
}

Bitmap.fromName = function(fullName, userToken, callback) {
    var inculde;
    var name;
    if(fullName.indexOf('&') != -1) {
        var sd = fullName.split('&');
        inculde = sd[0];
        name = sd[1];
    }
    
    if(!Bitmap.items[inculde]) {
        Bitmap.callbacks.push({ inculde : inculde, name : name, userToken : userToken, func : callback });
        IUIU.Loader.load(inculde, { inculde : inculde, name : name, userToken : userToken }, function(c) {
            c.content.isLoaded = true;
            c.content.image.userToken = c.userToken.inculde;
            c.content.image.onloaded = function(userToken) { 
                for(var i = 0; i < Bitmap.callbacks.length; i++) {
                    var callback = Bitmap.callbacks[i];
                    if(callback.inculde == userToken) {
                        callback.func(c.content.sheets[callback.name], callback.userToken);
                        Bitmap.callbacks.splice(i, 1);
                        i--;
                    }
                }
            }
            Bitmap.items[inculde] = c.content;
        });     
    } else {
        callback(Bitmap.items[inculde].sheets[name], userToken);
    }
}

Bitmap.create = function() {
    var data = new Bitmap();
    data.sheets = {};
    data.triangles = {};
    return data;
}

Bitmap.fromJson = function(json, param, entry) {
    var data = entry;
    var texture = new Texture.fromURL('data:image/png;base64,' + json.data);
    texture.userToken = data;
    texture.onloaded = function(userToken) {
        userToken.isLoaded = true;
    };
    data.isLoaded = false;
    data.image = texture;
    
    for(var index2 = 0; index2 < json.sheets.length; index2++) {
        var sheetJson = json.sheets[index2];
        var name = sheetJson.name; 
        var keypoints = [];
        
        
        var left = Number.MAX_VALUE, top = Number.MAX_VALUE, right = Number.MIN_VALUE, bottom = Number.MIN_VALUE;
        for(var i = 0; i < sheetJson.outline.length; i++) {
            var values = sheetJson.outline[i].split(',');
            var x = parseFloat(values[0]);
            var y = parseFloat(values[1]);
            keypoints.push({ x : x, y : y });
            
            if(x < left) left = x;
            if(x > right) right = x;
            if(y < top) top = y;
            if(y > bottom) bottom = y;
        }
        
        for(var i = 0; i < sheetJson.inline.length; i++) {
            var values = sheetJson.inline[i].split(',');
            var x = parseFloat(values[0]);
            var y = parseFloat(values[1]);
            keypoints.push({ x : x, y : y });
        }
              
        data.sheets[name] = { width : Math.max(0, right - left), height : Math.max(0, bottom - top), texture : data, keypoints : keypoints }; 
    }
    
    var tiled = {};
    tiled.brushs = [];
    tiled.tiles  = [];
    tiled.images = [];
    var tiledJson = json.terrain;
    
    for(var i = 0; i < tiledJson.brushs.length; i++) {
        var brushJson = tiledJson.brushs[i];
        var brushName = brushJson.name;
        var brushIcon = brushJson.icon;
        tiled.brushs.push({ name : brushName, icon : brushIcon });
    }
    
    for(var i = 0; i < tiledJson.tiles.length; i++) {
        var tileJson = tiledJson.tiles[i];
        var tileIndex = tileJson.index;
        var tileBrush = tileJson.brush.split(',');
        tiled.tiles.push({ index : tileIndex, brush : tileBrush });
    }
    
    for(var i = 0; i < tiledJson.images.length; i++) {
        var imageJson = tiledJson.images[imageKey];
        var name = imageJson.name;
        var srcValues = imageJson.src.split(',');
        var x = parseFloat(srcValues[0]);
        var y = parseFloat(srcValues[1]);
        var width = parseFloat(srcValues[2]);
        var height = parseFloat(srcValues[3]);
        tiled.images.push({ x : x, y : y, width : width, height : height });
    }
    
    data.tiles = tiled;
    
    return data;
}