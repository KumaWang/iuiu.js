function Tile() {
    this.isVisual = true;
}
Tile.items = {};
Tile.callbacks = [];

Tile.prototype.triangulate = function(name) {
    var sheet = this.sheets[name];
    if(sheet == null) return;
    
    var minX = Number.MAX_VALUE;
    var minY = Number.MAX_VALUE;
    for(var index2 in sheet.keypoints) {
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
    for(var i in sheet.keypoints) {
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

Tile.fromName = function(fullName, userToken, callback) {
    var inculde;
    var name;
    if(fullName.indexOf('&') != -1) {
        var sd = fullName.split('&');
        inculde = sd[0];
        name = sd[1];
    }
    
    if(!Tile.items[inculde]) {
        Tile.callbacks.push({ inculde : inculde, name : name, userToken : userToken, func : callback });
        IUIU.Loader.load(inculde, { inculde : inculde, name : name, userToken : userToken }, function(c) {
            c.content.isLoaded = true;
            c.content.image.userToken = c.userToken.inculde;
            c.content.image.onloaded = function(userToken) { 
                for(var i = 0; i < Tile.callbacks.length; i++) {
                    var callback = Tile.callbacks[i];
                    if(callback.inculde == userToken) {
                        callback.func(c.content.sheets[callback.name], callback.userToken);
                        Tile.callbacks.splice(i, 1);
                        i--;
                    }
                }
            }
            Tile.items[inculde] = c.content;
        });     
    } else {
        callback(Tile.items[inculde].sheets[name], userToken);
    }
}

Tile.create = function() {
    var data = new Tile();
    data.sheets = {};
    data.triangles = {};
    return data;
}

Tile.fromJson = function(json, param, entry) {
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
        
        var boundsStr = sheetJson.bounds.split(',');
        var bx = parseFloat(boundsStr[0]);
        var by = parseFloat(boundsStr[1]);
        var bwidth = parseFloat(boundsStr[2]);
        var bheight = parseFloat(boundsStr[3]);
        var bounds = { x : bx, y : by, width : bwidth, height : bheight };
        
        var keypoints = []; 
        var left = Number.MAX_VALUE, top = Number.MAX_VALUE, right = Number.MIN_VALUE, bottom = Number.MIN_VALUE;
        for(var i = 0; i < sheetJson.out.length; i++) {
            var values = sheetJson.out[i].split(',');
            var x = parseFloat(values[0]) + bounds.x;
            var y = parseFloat(values[1]) + bounds.y;
            var point = { x : x, y : y };
            keypoints.push(point);
            
            if(x < left) left = x;
            if(x > right) right = x;
            if(y < top) top = y;
            if(y > bottom) bottom = y;
        }
        
        for(var i = 0; i < sheetJson.in.length; i++) {
            var values = sheetJson.in[i].split(',');
            var x = parseFloat(values[0]);
            var y = parseFloat(values[1]);
            var point = { x : x, y : y };
            keypoints.push(point);
        }
        
        data.sheets[name] = { bounds : bounds, x : left, y : top, width : Math.max(0, right - left), height : Math.max(0, bottom - top), texture : data, keypoints : keypoints }; 
    }
    
    return data;
}