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
          case "ani":
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
          case "spline":
            obj = {};
            obj.type = "spline";
            obj.points = [];
            obj.splitCornersThreshold = 120;
            obj.streachThreshold = 0;
            obj.splitWhenDifferent = false;
            obj.smoothFactor = 5;
            for(var i = 0; i < itemJson.points.length; i++) {
                var pointStr = itemJson.points[i].split(',');
                var x = parseFloat(pointStr[0]);
                var y = parseFloat(pointStr[1]);
                obj.points.push({ x : x, y : y });
            }
            
            if(itemJson.uvmapping.fill.inculde != null) obj.downloadCount = 1;
            if(itemJson.uvmapping.left.inculde != null) obj.downloadCount++;
            if(itemJson.uvmapping.top.inculde != null) obj.downloadCount++;
            if(itemJson.uvmapping.right.inculde != null) obj.downloadCount++;
            if(itemJson.uvmapping.bottom.inculde != null) obj.downloadCount++;
            
            obj.fill = Map.readSegment(itemJson.uvmapping.fill, obj);
            obj.left = Map.readSegment(itemJson.uvmapping.left, obj);
            obj.top = Map.readSegment(itemJson.uvmapping.top, obj);
            obj.right = Map.readSegment(itemJson.uvmapping.right, obj);
            obj.bottom = Map.readSegment(itemJson.uvmapping.bottom, obj);
            
            Map.addSplineFunctions(obj);
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

Map.readSegment = function(json, spline) {
    var seg = {};
    if(json.inculde) {
        Tile.fromName(json.inculde, { segment : seg, spline : spline }, function(sheet, userToken) {
            var segment = userToken.segment;
            var spline = userToken.spline;
            segment.texture = sheet;
            spline.downloadCount--;
            if(spline.downloadCount <= 0)
                spline.generateMesh();
        });
    }
    seg.bodies = [];
    if(json.leftcap) {
        var aabbStr = json.leftcap.split(',');
        var x = parseFloat(aabbStr[0]);
        var y = parseFloat(aabbStr[1]);
        var width = parseFloat(aabbStr[2]);
        var height = parseFloat(aabbStr[3]);
        
        seg.leftcap = { x : x, y : y, width : width, height : height };
    }
    
    if(json.rightcap) {
        var aabbStr = json.rightcap.split(',');
        var x = parseFloat(aabbStr[0]);
        var y = parseFloat(aabbStr[1]);
        var width = parseFloat(aabbStr[2]);
        var height = parseFloat(aabbStr[3]);
        
        seg.rightcap = { x : x, y : y, width : width, height : height };
    }
    
    if(json.bodies) {
        for(var i = 0; i < json.bodies.length; i++) {
            var aabbStr = json.bodies[i].split(',');
            var x = parseFloat(aabbStr[0]);
            var y = parseFloat(aabbStr[1]);
            var width = parseFloat(aabbStr[2]);
            var height = parseFloat(aabbStr[3]);
            
            seg.bodies.push({ x : x, y : y, width : width, height : height });
        }
    }
    
    return seg;
}

Map.addSplineFunctions = function(spline) {
    spline.shouldCloseSegment = function(segment, side) {
        if(this.splitWhenDifferent && (side == "left" && segment.direction != segment.prevDirection || (side == "right" && segment.direction != segment.nextDirection)))
            return true;
              
        var angle = side == "left" ? segment.angleWithPrev() : segment.angleWithNext();
        if(angle <= this.splitCornersThreshold || angle >= (360 - this.splitCornersThreshold))
            return true;
            
        return angle == 180 && !(side == "left" ? segment.prev != null : segment.next != null);
    };
    
    spline.hermite = function(v1, v2, v3, v4, aPercentage, aTension, aBias) {
        var mu2 = aPercentage * aPercentage;
        var mu3 = mu2 * aPercentage;
        var m0 = (v2 - v1) * (1 + aBias) * (1 - aTension) / 2;
        m0 += (v3 - v2) * (1 - aBias) * (1 - aTension) / 2;
        var m1 = (v3 - v2) * (1 + aBias) * (1 - aTension) / 2;
        m1 += (v4 - v3) * (1 - aBias) * (1 - aTension) / 2;
        var a0 = 2 * mu3 - 3 * mu2 + 1;
        var a1 = mu3 - 2 * mu2 + aPercentage;
        var a2 = mu3 - mu2;
        var a3 = -2 * mu3 + 3 * mu2;
        
        return (a0 * v2 + a1 * m0 + a2 * m1 + a3 * v3);
    };
    
    spline.hermiteLerp = function(a, b, c, d, percentage, tension, bias) {
        tension = tension || 0;
        bias = bias || 0;
        
        return { x : this.hermite(a.x, b.x, c.x, d.x, percentage, tension, bias),
                 y : this.hermite(a.y, b.y, c.y, d.y, percentage, tension, bias) };
    };
    
    spline.normal = function(v) {
        var normal = { x : -v.y, y : v.x };
        var num = 1 / Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        normal.x *= num;
        normal.y *= num;
        return normal;
    };
    
    spline.circularIndex = function(source, i, looped) {
        looped = looped || false;
        
        var n = source.length;
        
        return i < 0 || i >= n ? (looped ? source[((i % n) + n) % n] : null) : source[i];
    };
    
    spline.calculateDirection = function(fst, snd) {
        if(fst.direction != null && fst.direction != "auto") 
            return fst.direction;
            
        var normal = this.normal({ x : fst.x - snd.x, y : fst.y - snd.y });
        if(Math.abs(normal.x) > Math.abs(normal.y)) {
            return normal.x < 0 ? "right" : "left";
        }
        
        return normal.y < 0 ? "top" : "down";
    };
    
    spline.getUvMappingOf = function(direction) {
        switch(direction) {
          case "top":
            return this.top;
          case "down":
            return this.bottom || this.top;
          case "left":
            return this.left || this.right || this.top;
          case "right":
            return this.right || this.left || this.top;
        }
        
        return null;
    }; 
    
    spline.drawSegment = function(segment, edgeList) {
        var segmentUvMapping = this.getUvMappingOf(segment.direction);
        
        if(segmentUvMapping == null || segmentUvMapping.bodies.length == 0) {
            return [ segment.begin, segment.end ];
        }
        
        var rect = segmentUvMapping.bodies[0];
        var width = segmentUvMapping.texture.texture.image.width;
        var height = segmentUvMapping.texture.texture.image.height;
        
        var x = rect.x / width;
        var y = rect.y / height;
        
        var width2 = rect.width / width;
        var height2 = rect.height / height;
        
        var bodyUvSize = { width : width2, height : height2 };
        var unitsPerEdgeUv = { width : segmentUvMapping.texture.texture.image.width, height : segmentUvMapping.texture.texture.image.height };
        var bodyWidthInUnits = bodyUvSize.width * unitsPerEdgeUv.width;
        var halfBodyHeightInUnits = bodyUvSize.height * unitsPerEdgeUv.height / 2;
        
        var bodyUv = {};
        var start = segment.begin;
        var smoothFactor = Math.max(1, this.smoothFactor);
        
        var doLeftCap = spline.shouldCloseSegment(segment, "left");
        var doRightCap = spline.shouldCloseSegment(segment, "right");
        
        if(doLeftCap)
            segment.prevprev = segment.prev = null;
            
        if(doRightCap)
            segment.nextnext = segment.next = null;
        
        if(segment.prevprev != null && segment.prev != null) {
            var seg2 = { prev : segment.prevprev, begin : segment.prev, end : segment.begin };
            Map.addSegmentFunctions(seg2);
            if(spline.shouldCloseSegment(seg2, "left")) {
                segment.prevprev = null;
            }
        }
            
        var last = segment.prev || segment.begin;
        var next = { x : segment.begin.x - last.x, y : segment.begin.y - last.y };
        var length = Math.sqrt(next.x * next.x + next.y * next.y);
        var prevNumOfCuts = Math.max(parseInt(Math.floor(length / (bodyWidthInUnits + spline.streachThreshold))), 1) * smoothFactor;
        var endPrevious = spline.hermiteLerp(segment.prevprev || segment.prev || segment.begin, segment.prev || segment.begin, segment.begin, segment.end, prevNumOfCuts == 1 ? 0.001 : ((prevNumOfCuts - 1) / prevNumOfCuts));
        var startOffset = spline.normal({ x : start.x - endPrevious.x, y : start.y - endPrevious.y }); // * halfBodyHeightInUnits;
        startOffset = { x : startOffset.x * halfBodyHeightInUnits, y : startOffset.y * halfBodyHeightInUnits };
        
        if(doLeftCap)
            spline.drawCap(
                segmentUvMapping.leftcap, 
                "left", 
                { x : segment.begin.x - startOffset.x, y : segment.begin.y - startOffset.y },
                { x : segment.begin.x + startOffset.x, y : segment.begin.y + startOffset.y },
                edgeList,
                segmentUvMapping.texture,
                segment.direction
            );
            
        if(doLeftCap && doRightCap) 
            smoothFactor = 1;
        
        next = { x : segment.end.x - segment.begin.x, y : segment.end.y - segment.begin.y };
        length = Math.sqrt(next.x * next.x + next.y * next.y);
        var numberOfCuts = Math.max(parseInt(Math.floor(length / (bodyWidthInUnits + spline.streachThreshold))), 1) * smoothFactor;
        var fillPoints = [];
        
        for(var i = 0; i < numberOfCuts; i++) {
            var percentEnd = (i + 1) / numberOfCuts;
            var end = spline.hermiteLerp(segment.prev || segment.begin, segment.begin, segment.end, segment.next || segment.end, percentEnd);
            var endOffset = spline.normal({ x : end.x - start.x, y : end.y - start.y }); // * halfBodyHeightInUnits;
            endOffset = { x : endOffset.x * halfBodyHeightInUnits, y : endOffset.y * halfBodyHeightInUnits };
            
            var localTopLeft = { x : start.x - startOffset.x, y : start.y - startOffset.y };
            var localTopRight = { x : end.x - endOffset.x, y : end.y - endOffset.y };
            var localBottomLeft = { x : start.x + startOffset.x, y : start.y + startOffset.y };
            var localBottomRight = { x : end.x + endOffset.x, y : end.y + endOffset.y };
            
            fillPoints.push(start);
            
            start = end;
            startOffset = endOffset;
            
            if(i % smoothFactor == 0) {
                rect = segmentUvMapping.bodies[Math.abs(percentEnd >> 32) % 1];
                width = segmentUvMapping.texture.texture.image.width;
                height = segmentUvMapping.texture.texture.image.height;
                
                x = rect.x / width;
                y = rect.y / height;
                
                width2 = rect.width / width;
                height2 = rect.height / height;
                
                bodyUv = { x : x, y : y, width : width2 / smoothFactor, height : height2 };
            }
            else {
                bodyUv = { x : bodyUv.x + bodyUv.width, y : bodyUv.y, width : bodyUv.width, height : bodyUv.height };
            }
            
            var p1 = [ localBottomLeft.x, localBottomLeft.y ];
            var p2 = [ localTopLeft.x, localTopLeft.y ];
            var p3 = [ localTopRight.x, localTopRight.y ];
            var p4 = [ localBottomRight.x, localBottomRight.y ];
            
            var uv1 = [ bodyUv.x, 1 - bodyUv.y - bodyUv.height ];
            var uv2 = [ bodyUv.x, 1 - bodyUv.y ];
            var uv3 = [ bodyUv.x + bodyUv.width, 1 - bodyUv.y ];
            var uv4 = [ bodyUv.x + bodyUv.width, 1 - bodyUv.y - bodyUv.height ];
            
            if(segment.direction == "top") {
                edgeList.push({
                    texture : segmentUvMapping.texture.texture.image,
                    color : this.color,
                    p1 : p1,
                    p2 : p2,
                    p3 : p3,
                    uv1 : uv1,
                    uv2 : uv2,
                    uv3 : uv3
                });
                
                edgeList.push({
                    texture : segmentUvMapping.texture.texture.image,
                    color : this.color,
                    p1 : p1,
                    p2 : p4,
                    p3 : p3,
                    uv1 : uv1,
                    uv2 : uv4,
                    uv3 : uv3
                });
            } else {
                edgeList.unshift({
                    texture : segmentUvMapping.texture.texture.image,
                    color : this.color,
                    p1 : p1,
                    p2 : p2,
                    p3 : p3,
                    uv1 : uv1,
                    uv2 : uv2,
                    uv3 : uv3
                });
                
                edgeList.unshift({
                    texture : segmentUvMapping.texture.texture.image,
                    color : this.color,
                    p1 : p1,
                    p2 : p4,
                    p3 : p3,
                    uv1 : uv1,
                    uv2 : uv4,
                    uv3 : uv3
                });
            }
        }
        
        if(doRightCap)
            spline.drawCap(
                segmentUvMapping.rightcap, 
                "right", 
                { x : segment.end.x - startOffset.x, y : segment.end.y - startOffset.y },
                { x : segment.end.x + startOffset.x, y : segment.end.y + startOffset.y },
                edgeList,
                segmentUvMapping.texture,
                segment.direction
            );
        
        return fillPoints;
    };
    
    spline.drawCap = function(rect, side, top, bottom, edges, texture, driection) {
        width = texture.texture.image.width;
        height = texture.texture.image.height;
        
        x = rect.x / width;
        y = rect.y / height;
        
        width2 = rect.width / width;
        height2 = rect.height / height;
        
        var capUv = { x : x, y : y, width : width2, height : height2 };
        var capOffset = this.normal({ x : bottom.x - top.x, y : bottom.y - top.y });
        capOffset = { x : capOffset.x * capUv.width * texture.width, y : capOffset.y * capUv.width * texture.width };
        
        var otherTop = side == "left" ? { x : top.x + capOffset.x, y : top.y + capOffset.y } : { x : top.x - capOffset.x, y : top.y - capOffset.y };
        var otherBottom = side == "left" ? { x : bottom.x + capOffset.x, y : bottom.y + capOffset.y } : { x : bottom.x - capOffset.x, y : bottom.y - capOffset.y };
        
        if(side == "left") {
            var temp = top;
            top = otherTop;
            otherTop = temp;
            
            var temp2 = bottom;
            bottom = otherBottom;
            otherBottom = temp2;
        }
        
        var p1 = [ bottom.x, bottom.y ];
        var p2 = [ top.x, top.y ];
        var p3 = [ otherTop.x, otherTop.y ];
        var p4 = [ otherBottom.x, otherBottom.y ];
        
        var uv1 = [ capUv.x, 1 - capUv.y - capUv.height ];
        var uv2 = [ capUv.x, 1 - capUv.y ];
        var uv3 = [ capUv.x + capUv.width, 1 - capUv.y ];
        var uv4 = [ capUv.x + capUv.width, 1 - capUv.y - capUv.height ];
        
        if(driection == "top") {
            edges.push({
                texture : texture.texture.image,
                color : this.color,
                p1 : p1,
                p2 : p2,
                p3 : p3,
                uv1 : uv1,
                uv2 : uv2,
                uv3 : uv3
            });
            
            edges.push({
                texture : texture.texture.image,
                color : this.color,
                p1 : p1,
                p2 : p4,
                p3 : p3,
                uv1 : uv1,
                uv2 : uv4,
                uv3 : uv3
            });
        } else {
            edges.unshift({
                texture : texture.texture.image,
                color : this.color,
                p1 : p1,
                p2 : p2,
                p3 : p3,
                uv1 : uv1,
                uv2 : uv2,
                uv3 : uv3
            });
            
            edges.unshift({
                texture : texture.texture.image,
                color : this.color,
                p1 : p1,
                p2 : p4,
                p3 : p3,
                uv1 : uv1,
                uv2 : uv4,
                uv3 : uv3
            });
        }
    };
    
    spline.generateSegments = function() {
        var result = []
        var size = spline.points.length + 1;
        
        for(var i = 1; i < size; i++) {
            var prev2 = spline.circularIndex(spline.points, i - 2, true);
            var next = spline.circularIndex(spline.points, i + 1, true);
            var prev = spline.circularIndex(spline.points, i - 1, true);
            var cur = spline.circularIndex(spline.points, i, true);
            
            var seg = {};
            seg.prevprev = spline.circularIndex(spline.points, i - 3, true);
            seg.prev = prev2;
            seg.begin = prev;
            seg.end = cur;
            seg.next = next;
            seg.nextnext = spline.circularIndex(spline.points, i + 2, true);
            seg.direction = spline.calculateDirection(prev, cur);
            seg.prevDirection = prev2 == null ? "none" : spline.calculateDirection(prev2, prev);
            seg.nextDirection = next == null ? "none" : spline.calculateDirection(cur, next);

            Map.addSegmentFunctions(seg);
            
            result.push(seg);
        }
        return result;
    };
    
    spline.generateMesh = function() {
        this.triangles = [];
        this.edgeTriangles = [];
        
        var segments = this.generateSegments();
        var vertices = [];
        var edgeVertices = [];
        for(var i = 0; i < segments.length; i++) {
            var points = this.drawSegment(segments[i], this.edgeTriangles);
            for(var x = 0; x < points.length; x++) {
                vertices.push(new poly2tri.Point(points[x].x, points[x].y));
            }
        }
        
        var swctx = new poly2tri.SweepContext(vertices);
        swctx.triangulate();
        var triangles = swctx.getTriangles();
        
        for(var x = 0; x < triangles.length; x++) {
            
            var v1 = triangles[x].points_[0];
            var v2 = triangles[x].points_[1];
            var v3 = triangles[x].points_[2];

            this.triangles.push({
                texture : this.fill.texture.texture.image,
                color : this.color,
                p1 : [ v1.x, v1.y ],
                p2 : [ v2.x, v2.y ],
                p3 : [ v3.x, v3.y ],
                uv1 : [ v1.x / this.fill.texture.texture.image.width, v1.y / this.fill.texture.texture.image.height ],
                uv2 : [ v2.x / this.fill.texture.texture.image.width, v2.y / this.fill.texture.texture.image.height ],
                uv3 : [ v3.x / this.fill.texture.texture.image.width, v3.y / this.fill.texture.texture.image.height ]
            });
        }
                
    };
    
    spline.getEdgeDisplayStates = function() {
        var result = [];
        if(this.triangles != null) {
            for(var i = 0; i < this.edgeTriangles.length; i++) {
                var tri = this.edgeTriangles[i];
                var origin = { x : this.origin.x + this.location.x, y : this.origin.y + this.location.y };
                var p1 = MathTools.pointRotate(origin, { x : tri.p1[0] * this.scale.x, y : tri.p1[1] * this.scale.y }, this.angle);
                var p2 = MathTools.pointRotate(origin, { x : tri.p2[0] * this.scale.x, y : tri.p2[1] * this.scale.y }, this.angle);
                var p3 = MathTools.pointRotate(origin, { x : tri.p3[0] * this.scale.x, y : tri.p3[1] * this.scale.y }, this.angle);
                
                p1 = [ p1.x + this.location.x, p1.y + this.location.y ];
                p2 = [ p2.x + this.location.x, p2.y + this.location.y ];
                p3 = [ p3.x + this.location.x, p3.y + this.location.y ];
                
                result.push({
                    texture : tri.texture,
                    color : [ tri.color.r, tri.color.g, tri.color.b, tri.color.a ],
                    p1 : p1,
                    p2 : p2,
                    p3 : p3,
                    uv1 : tri.uv1,
                    uv2 : tri.uv2,
                    uv3 : tri.uv3
                });
            }
        }
        return result;
    };
    
    spline.getFillDisplayStates = function() {
        var result = [];
        if(this.triangles != null) {
            for(var i = 0; i < this.triangles.length; i++) {
                var tri = this.triangles[i];
                var origin = { x : this.origin.x + this.location.x, y : this.origin.y + this.location.y };
                var p1 = MathTools.pointRotate(origin, { x : tri.p1[0] * this.scale.x, y : tri.p1[1] * this.scale.y }, this.angle);
                var p2 = MathTools.pointRotate(origin, { x : tri.p2[0] * this.scale.x, y : tri.p2[1] * this.scale.y }, this.angle);
                var p3 = MathTools.pointRotate(origin, { x : tri.p3[0] * this.scale.x, y : tri.p3[1] * this.scale.y }, this.angle);
                
                p1 = [ p1.x + this.location.x, p1.y + this.location.y ];
                p2 = [ p2.x + this.location.x, p2.y + this.location.y ];
                p3 = [ p3.x + this.location.x, p3.y + this.location.y ];
                
                result.push({
                    texture : tri.texture,
                    color : [ tri.color.r, tri.color.g, tri.color.b, tri.color.a ],
                    p1 : p1,
                    p2 : p2,
                    p3 : p3,
                    uv1 : tri.uv1,
                    uv2 : tri.uv2,
                    uv3 : tri.uv3
                });
            }
        }
        return result;
    };
}

Map.addSegmentFunctions = function(seg) {
    seg.angleBetween = function(v1, v2) {
        var y = v1.x * v2.y - v2.x * v1.y;
        var x = v1.x * v2.x + v1.y * v2.y;
        return Math.atan2(y, x) * (180 / Math.PI);
    };
    
    seg.angleWithPrev = function() {
        if(this.prev == null) return 180;
        
        var angle = this.angleBetween(
            { x : this.end.x - this.begin.x, y : this.end.y - this.begin.y },
            { x : this.prev.x - this.begin.x, y : this.prev.y - this.begin.y });
        
        return angle < 0 ? angle + 360 : angle;
    };
    
    seg.angleWithNext = function() {
        if(this.next == null) return 180;
        
        var angle = this.angleBetween(
            { x : this.begin.x - this.end.x, y : this.begin.y - this.end.y },
            { x : this.next.x - this.end.x, y : this.next.y - this.end.y });
        
        return angle < 0 ? angle + 360 : angle;
    };
}