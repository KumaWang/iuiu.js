var mapShader = null;

function Map() {
}
 
Map.prototype.update = function(gl, inv) {
    if(mapShader == null) {
        mapShader = new Shader('\
            uniform mat4 MatrixTransform;\
            varying vec4 diffuseColor;\
            varying vec4 diffuseTexCoord;\
            varying vec2 TilePostion;\
            void main( )\
            {\
                gl_Position = MatrixTransform * gl_Vertex;\
                TilePostion = (gl_Vertex).xy;\
                diffuseTexCoord = gl_TexCoord;\
                diffuseColor = gl_Color;\
            }\
            ', '\
            uniform sampler2D Texture;\
            varying vec4 diffuseColor;\
            varying vec4 diffuseTexCoord;\
            varying vec2 TilePostion;\
            uniform vec2 TileOffset;\
            uniform vec2 TileSize;\
            uniform vec2 TileUvOffset;\
            uniform vec2 TileUvSize;\
            void main( )\
            {\
                vec2 uv = TileUvOffset + fract((TilePostion - TileOffset) / TileSize) * TileUvSize;\
                uv.y = 1.0 - uv.y;\
                gl_FragColor = texture2D(Texture, uv) * diffuseColor;\
            }\
            '
            );
    }
    
    for(var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];
        if(obj.update) obj.update(inv);
        
        if(obj.type == "spline") {
            if(obj.fill.texture) {
                gl.end();
                gl.begin(gl.blendState, gl.camera, mapShader);
                var states = obj.getFillDisplayStates();
                if(states != null) {
                    for(var x = 0; x < states.length; x++) {
                        gl.draw(states[x]);
                    }
                }
                gl.end({
                    TileOffset : [ obj.location.x, obj.location.y ],
                    TileSize : [ obj.fill.texture.texture.image.width, obj.fill.texture.texture.image.height ],
                    TileUvOffset : [ obj.fill.texture.x / obj.fill.texture.texture.image.width, obj.fill.texture.y / obj.fill.texture.texture.image.width ],
                    TileUvSize : [ obj.fill.texture.width / obj.fill.texture.texture.image.width, obj.fill.texture.height / obj.fill.texture.texture.image.width ]
                });
                gl.begin();
            }
            states = obj.getEdgeDisplayStates();
            if(states != null) {
                for(var x = 0; x < states.length; x++) {
                    gl.draw(states[x]);
                }
            }
            
        }
    }
} 

Map.create = function() {
    var map = new Map();
    map.objects  = [];
    map.triggers = [];
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