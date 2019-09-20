function Font() {
    this.isLoaded = false;
}

Font.create = function() {
    return new Font();
}

Font.fromJson = function(json, params, entry) {
    var font = entry;
    for(var c in json.data) {
        var left = Number.MAX_VALUE, top = Number.MAX_VALUE, right = Number.MIN_VALUE, bottom = Number.MIN_VALUE;
        font[c] = { vertices : [] };
        var points = json.data[c].split(',');
        for(var i = 0; i < points.length; i = i + 2) {
            var x = parseFloat(points[i]);
            var y = parseFloat(points[i + 1]);
            font[c].vertices.push({ x : x, y : y });
            
            if(x < left) left = x;
            if(x > right) right = x;
            if(y < top) top = y;
            if(y > bottom) bottom = y;
        }
        
        font[c].size = { width : right - left, height : bottom - top };
    }
    font.isLoaded = true;
    return font;
}