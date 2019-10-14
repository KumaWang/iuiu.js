function ObjectState(animation) {
    this.frame = 0;
    this.elaspedTime = 0;
    this.isPlaying = true;
    this.object = animation;
    this._init = false;
    this._state = null;
}

ObjectState.prototype = {
    update : function(inv) {
        if(!this.isPlaying) return;
        
        if(!this._init) {
            if(this.object.staties != null && this.object.staties[this.state]) {
                this.frame = this.object.staties[this.state];
                this.elaspedTime = 0;
                this._init = true;
            }
            else if(this.state == null) {
                this._init = true;
            }
        }
        
        var frameRate = Math.max(24, this.object.frameRate);
        this.elaspedTime = this.elaspedTime + inv;
        this.frame = this.frame + parseInt(this.elaspedTime / frameRate);
        this.elaspedTime = this.elaspedTime % frameRate;
        if(this.frame > this.object.getMaxFrame()) { 
            this.frame = this._state != null && this.object.staties && this.object.staties[this._state] ? this.object.staties[this._state] : 0;
        }
    },
    play : function() {
        this.isPlaying = true;
    },
    stop : function() {
        this.isPlaying = false;
    },
    get state() {
        return this._state;
    },
    set state(value) {
        if(this._state != value) {
            this._state = value;
            this._init = false;
        }
    }
}

function IObject() {
    this.isVisual = true;
}

IObject.prototype  = {
    getMaxFrame : function() {
        var maxFrame = 0;
        for(var i = 0; i < this.items.length; i++) {
            if(this.items[i].maxFrame > maxFrame) {
                maxFrame = this.items[i].maxFrame;
            }
        }
        return maxFrame;
    },
    
    newState : function() {
        return new ObjectState(this);
    }
}

function readKeyframe(json) {
    var locStr = json.location.split(',');
    var scaleStr = json.scale.split(',');
    var originStr = json.origin.split(',');
    var colorStr = json.color.split(',');
    
    var frame = { 
        frame : json.frame,
        value : json.value,
        x : parseFloat(locStr[0]),
        y : parseFloat(locStr[1]),
        originX : parseFloat(originStr[0]),
        originY : parseFloat(originStr[1]),
        angle : json.angle,
        r : parseFloat(colorStr[0]),
        g : parseFloat(colorStr[1]),
        b : parseFloat(colorStr[2]),
        a : parseFloat(colorStr[3]),
        smooth : json.smooth,
        scaleX : parseFloat(scaleStr[0]),
        scaleY : parseFloat(scaleStr[1]),
    };
    
    return frame;
}

IObject.create = function() {
    var ani = new IObject();
    ani.items = [];
    ani.frameRate = 24;
    ani.loop = true;
    return ani;
}

IObject.fromJson = function(json, params, entry) {
    var ani = entry;
    ani.staties = {};
    ani.frameRate = parseFloat(json.framerate);
    ani.loop = Boolean(json.loop);
    
    for(var index = 0; index < json.states.length; index++) {
        ani.staties[json.states[index].name] = json.states[index].frame;
    }
    
    for(var index = 0; index < json.items.length; index++) {
        var item = json.items[index];
        var baseItem = null;
        
        // 添加属性
        switch(item.type) {
          case "mesh":
            var mesh = new ObjectItemMesh();
            mesh.keypoints = [];
            mesh.brush = new VoidBrush();
            
            Tile.fromName(item.inculde, { mesh : mesh }, function(sheet, userToken) {
                var mesh2 = userToken.mesh;
                mesh2.brush = sheet;
                var tb = mesh2.brush;
                var minX = Number.MAX_VALUE;
                var minY = Number.MAX_VALUE;
                for(var index2 = 0; index2 < mesh2.keypoints.length; index2++) {
                    var keypoint = mesh2.keypoints[index2];
                    var point = tb.keypoints[index2];
                    var drawOffset = { x : point.x, y : point.y };
                    keypoint.drawOffset = drawOffset;
                    keypoint.bindingUV = [ point.x / tb.texture.image.width, point.y / tb.texture.image.height ];
                    
                    if(minX > drawOffset.x) minX = drawOffset.x;
                    if(minY > drawOffset.y) minY = drawOffset.y;
                }
                mesh2.drawOffset = { x : minX, y : minY };          
                mesh2.triangulate();
            });
            
            for(var index2 = 0; index2 < item.vertices.length; index2++) {
                var keypoint = item.vertices[index2];
                var key = {};
                key.index = keypoint.index;
                key.parent = mesh;
                key.keyframes = [];
                // 添加方法
                addAnimationItemFunctions(key);
                for(var index3 = 0; index3 < keypoint.keyframes.length; index3++) {
                    var keyframe = keypoint.keyframes[index3];
                    key.keyframes.push(readKeyframe(keyframe));
                }
                mesh.keypoints.push(key);
                
            }
            
            baseItem = mesh;
            baseItem.type = "mesh";
            break;
            
          case "text":
            var label = new ObjectItemLabel();
            label.text = item.text;
            label.size = parseFloat(item.size);
            label.font = new Font();
            IUIU.Loader.load(item.inculde, { label : label }, function(c) {
                c.userToken.label.font = c.content;
            }); 
            
            baseItem = label;
            baseItem.type = "text";
            break;
            
          case "collide":
            var collide = ObjectItemCollideBox();
            collide.points = [];
            for(var index2 = 0; index2 < item.points.length; index2++) {
                var point = item.points[index2];
                var pointStr = point.split(',');
                var x = parseFloat(pointStr[0]);
                var y = parseFloat(pointStr[1]);
                collide.points.push({ x : x, y : y });
            }
            
            baseItem = collide;
            baseItem.type = "collide";
            break;
            
          case "spline":
            var spline = {};
            Spline.addSplineFunctions(spline);
            spline.type = "spline";
            spline.points = [];
            spline.splitCornersThreshold = 120;
            spline.streachThreshold = 0;
            spline.splitWhenDifferent = false;
            spline.smoothFactor = 5;
            for(var i = 0; i < item.points.length; i++) {
                var pointStr = item.points[i].split(',');
                var x = parseFloat(pointStr[0]);
                var y = parseFloat(pointStr[1]);
                spline.points.push({ x : x, y : y });
            }
            
            if(item.uvmapping.fill.inculde != null) spline.downloadCount = 1;
            if(item.uvmapping.left.inculde != null) spline.downloadCount++;
            if(item.uvmapping.top.inculde != null) spline.downloadCount++;
            if(item.uvmapping.right.inculde != null) spline.downloadCount++;
            if(item.uvmapping.bottom.inculde != null) spline.downloadCount++;
            
            spline.fill = Spline.readSegment(item.uvmapping.fill, spline);
            spline.left = Spline.readSegment(item.uvmapping.left, spline);
            spline.top = Spline.readSegment(item.uvmapping.top, spline);
            spline.right = Spline.readSegment(item.uvmapping.right, spline);
            spline.bottom = Spline.readSegment(item.uvmapping.bottom, spline);
            
            baseItem = spline;
            baseItem.type = "spline";
            break;
            
          default:
            throw "not support data type";
        }
        
        baseItem.isVisual = Boolean(item.visual);
        baseItem.isLocked = Boolean(item.locked);
        baseItem.keyframes = [];
        for(var index2 = 0; index2 < item.keyframes.length; index2++) {
            var keyframe = item.keyframes[index2];
            baseItem.keyframes.push(readKeyframe(keyframe));
        }
        
        // 查找最大帧
        var maxFrame = 0;
        for(var i = 0; i < baseItem.keyframes.length; i++) {
            if(maxFrame < baseItem.keyframes[i].frame) {
                maxFrame = baseItem.keyframes[i].frame;
            }
        }
        baseItem.maxFrame = maxFrame;
        
        // 添加方法
        addObjectItemFunctions(baseItem);
        
        ani.items.push(baseItem);
    }
    return ani;
}

function addObjectItemFunctions(baseItem) {
    baseItem.getFirst = function() {
        var frame = Number.MAX_VALUE;
        var first = null;
        for (var i = 0; i < this.keyframes.length; i++) {
            var item = this.keyframes[i];
            if (item.frame < frame) {
                first = item;
                frame = item.frame;
            }
        }
        return first;
    },
    baseItem.evaluate = function(frame) {
        var first = null;  
        for (var i = 0; i < this.keyframes.length; i++) 
        {
            var item = this.keyframes[i];
            if (item.frame < frame && (first == null || item.frame > first.frame)) 
            {
                first = item;
            }
        }
        
        if (first != null)
        {
            if (frame == first.frame)
                return first.value;
            
            var next = this.getNextState(first.frame) || first;
            
            if (frame == next.frame)
                return next.value;
            
            var countTime = frame - first.frame;
            var totalTime = next.frame - first.frame;
            if (countTime > totalTime)
            {
                return 0;
            }
            else if (first.smooth)
            {
                return first.value + (next.value - first.value) * (countTime / totalTime);
            }
            else 
            {
                throw " NotImplementedException(); ";
            }
        }
        else 
        {
            return 0;
        }
    };
    
    baseItem.getState = function(frame) {
        for(var i = 0; i < this.keyframes.length; i++) {
            if(this.keyframes[i].frame == frame) {
                return this.keyframes[i];
            }
        }
    };
    
    baseItem.getLastState = function(frame) {
        var result = -1;
        var state = null;
        for(var i = 0; i < this.keyframes.length; i++) {
            var keyframe = this.keyframes[i];
            if(keyframe.frame < frame && keyframe.frame > result) {
                result = keyframe.frame;
                state = keyframe;
            }
        }
        
        return state;
    };
    
    baseItem.getNextState = function(frame) {
        var result = Number.MAX_VALUE;
        var state = null;
        for(var i = this.keyframes.length - 1; i > 0; i--) {
            var keyframe = this.keyframes[i];
            if(keyframe.frame > frame && keyframe.frame < result) {
                result = keyframe.frame;
                state = keyframe;
            }
        }
        
        return state;
    };
    
    baseItem.getRealState = function(frame) {
        var lastState = this.getState(frame) || this.getLastState(frame);
        if (lastState == null || (lastState.frame != frame && !lastState.smooth))
            return null;
        
        var nextState = this.getNextState(frame);
        var value = this.evaluate(frame);
        var x, y, scalex, scaley, rotateZ, originX, originY;
        var r, g, b, a;
        if (lastState == null) {
            if (nextState == null) {
                return null;
            }
            
            x = nextState.x;
            y = nextState.y;
            scalex = nextState.scaleX;
            scaley = nextState.scaleY;
            rotateZ = nextState.angle;
            r = nextState.r;
            g = nextState.g;
            b = nextState.b;
            a = nextState.a;
            originX = nextState.originX;
            originY = nextState.originY;
        }
        else if (nextState == null) {
            if (lastState == null || lastState.frame != frame) {
                return null;
            }
            
            x = lastState.x;
            y = lastState.y;
            scalex = lastState.scaleX;
            scaley = lastState.scaleY;
            rotateZ = lastState.angle;
            r = lastState.r;
            g = lastState.g;
            b = lastState.b;
            a = lastState.a;
            originX = lastState.originX;
            originY = lastState.originY;
        }
        else {
            value = value * (frame - lastState.frame) / (nextState.frame - lastState.frame);
            
            x = lastState.x + (nextState.x - lastState.x) * value;
            y = lastState.y + (nextState.y - lastState.y) * value;
            scalex = lastState.scaleX + (nextState.scaleX - lastState.scaleX) * value;
            scaley = lastState.scaleY + (nextState.scaleY - lastState.scaleY) * value;
            
            rotateZ = lastState.angle + (nextState.angle - lastState.angle) * value;
            
            r = parseInt(lastState.r + (nextState.r - lastState.r) * value);
            g = parseInt(lastState.g + (nextState.g - lastState.g) * value);
            b = parseInt(lastState.b + (nextState.b - lastState.b) * value);
            a = parseInt(lastState.a + (nextState.a - lastState.a) * value);
            
            originX = lastState.originX + (nextState.originX - lastState.originX) * value;
            originY = lastState.originY + (nextState.originY - lastState.originY) * value;
        }
        
        if (this.parent != null) {
            var ps = this.parent.getRealState(frame);
            if (ps != null) {
                return {
                    frame : frame,
                    value : value,
                    x : x + ps.x,
                    y : y + ps.y,
                    scaleX : scalex * ps.scaleX,
                    scaleY : scaley * ps.scaleY,
                    angle : rotateZ + ps.angle,
                    r : r / 255 * ps.r,
                    g : g / 255 * ps.g,
                    b : b / 255 * ps.b,
                    a : a / 255 * ps.a,
                    originX : originX + ps.originX,
                    originY : originY + ps.originY
                };
            }
        }
        else {
            return {
                frame : frame,
                value : value,
                x : x,
                y : y,
                scaleX : scalex,
                scaleY : scaley,
                angle : rotateZ,
                r : r,
                g : g,
                b : b,
                a : a,
                originX : originX,
                originY : originY
            };
        }
    };
}

function VoidBrush() {
    return {
        onupdate : function(frame, g) {
        }
    };
}

function MeshVertexTrackerDefault(position) {
    return {
        position : { x : position[0], y : position[1] },
        getPostion : function(frame) {
            return this.position;
        }
    };
}

function MeshVertexTrackerKeyPoint(key, offset) {
    return {
        key : key,
        offset : offset,
        getPostion : function(frame) {
            var ps = this.key.parent.getRealState(frame);
            var state = this.key.getRealState(frame);
            if (state != null) {
                return { x : state.x - ps.x - this.offset.x, y : state.y - ps.y - this.offset.y };
            }
            else {
                return { x : 0, y : 0 };
            }
        }
    };
}

function ObjectItemCollideBox() {
    return {};
}

function ObjectItemLabel() {
    return {};
}

function ObjectItemMesh() {
    return {
        triangles : null,
        fixedUVs : {},
        triangulate : function() {
            var vertices = [];
            this.fixedUVs = [];
            for(var i = 0; i < this.keypoints.length; i++) {
                var keypoint = this.keypoints[i];
                vertices.push([ keypoint.drawOffset.x - this.drawOffset.x, keypoint.drawOffset.y - this.drawOffset.y ]);
            }
            
            this.triangles = [];
            var delau_triangles = Delaunay.triangulate(vertices);
            for(var x = 0; x < delau_triangles.length; x += 3) {
                
                var v1 = vertices[delau_triangles[x]];
                var v2 = vertices[delau_triangles[x + 1]];
                var v3 = vertices[delau_triangles[x + 2]];
                
                var p1 = new MeshVertexTrackerDefault(v1);
                var p2 = new MeshVertexTrackerDefault(v2);
                var p3 = new MeshVertexTrackerDefault(v3);
                
                for(var i = 0; i < this.keypoints.length; i++) {
                    var keypoint = this.keypoints[i];
                    var real = { x : keypoint.drawOffset.x - this.drawOffset.x, y : keypoint.drawOffset.y - this.drawOffset.y };
                    
                    if (v1[0] == real.x && v1[1] == real.y) p1 = new MeshVertexTrackerKeyPoint(keypoint, this.drawOffset);
                    if (v2[0] == real.x && v2[1] == real.y) p2 = new MeshVertexTrackerKeyPoint(keypoint, this.drawOffset);
                    if (v3[0] == real.x && v3[1] == real.y) p3 = new MeshVertexTrackerKeyPoint(keypoint, this.drawOffset);
                }
                
                this.triangles.push({
                    p1 : { tracker : p1, uv : { x : (v1[0] + this.drawOffset.x) / this.brush.texture.image.width, y : (v1[1] + this.drawOffset.y) / this.brush.texture.image.height } },
                    p2 : { tracker : p2, uv : { x : (v2[0] + this.drawOffset.x) / this.brush.texture.image.width, y : (v2[1] + this.drawOffset.y) / this.brush.texture.image.height } },
                    p3 : { tracker : p3, uv : { x : (v3[0] + this.drawOffset.x) / this.brush.texture.image.width, y : (v3[1] + this.drawOffset.y) / this.brush.texture.image.height } },
                });
                
            }
        }
    };
}

function Spline() {
}

Spline.readSegment = function(json, spline) {
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

Spline.addSplineFunctions = function(spline) {
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
        
        var doLeftCap = spline.shouldCloseSegment(segment, "left") && segmentUvMapping.leftcap != null;
        var doRightCap = spline.shouldCloseSegment(segment, "right") && segmentUvMapping.rightcap != null;
        
        if(doLeftCap)
            segment.prevprev = segment.prev = null;
        
        if(doRightCap)
            segment.nextnext = segment.next = null;
        
        if(segment.prevprev != null && segment.prev != null) {
            var seg2 = { prev : segment.prevprev, begin : segment.prev, end : segment.begin };
            Spline.addSegmentFunctions(seg2);
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
                    p1 : p1,
                    p2 : p2,
                    p3 : p3,
                    uv1 : uv1,
                    uv2 : uv2,
                    uv3 : uv3
                });
                
                edgeList.push({
                    texture : segmentUvMapping.texture.texture.image,
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
                    p1 : p1,
                    p2 : p2,
                    p3 : p3,
                    uv1 : uv1,
                    uv2 : uv2,
                    uv3 : uv3
                });
                
                edgeList.unshift({
                    texture : segmentUvMapping.texture.texture.image,
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
                p1 : p1,
                p2 : p2,
                p3 : p3,
                uv1 : uv1,
                uv2 : uv2,
                uv3 : uv3
            });
            
            edges.push({
                texture : texture.texture.image,
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
                p1 : p1,
                p2 : p2,
                p3 : p3,
                uv1 : uv1,
                uv2 : uv2,
                uv3 : uv3
            });
            
            edges.unshift({
                texture : texture.texture.image,
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
            
            Spline.addSegmentFunctions(seg);
            
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
    
    spline.getEdgeDisplayStates = function(location, origin, scale, angle, color) {
        var result = [];
        if(this.triangles != null) {
            for(var i = 0; i < this.edgeTriangles.length; i++) {
                var tri = this.edgeTriangles[i];
                var origin = { x : origin.x + location.x, y : origin.y + location.y };
                var p1 = MathTools.pointRotate(origin, { x : tri.p1[0] * scale.x, y : tri.p1[1] * scale.y }, angle);
                var p2 = MathTools.pointRotate(origin, { x : tri.p2[0] * scale.x, y : tri.p2[1] * scale.y }, angle);
                var p3 = MathTools.pointRotate(origin, { x : tri.p3[0] * scale.x, y : tri.p3[1] * scale.y }, angle);
                
                p1 = [ p1.x + location.x, p1.y + location.y ];
                p2 = [ p2.x + location.x, p2.y + location.y ];
                p3 = [ p3.x + location.x, p3.y + location.y ];
                
                result.push({
                    texture : tri.texture,
                    color : [ color.r, color.g, color.b, color.a ],
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
    
    spline.getFillDisplayStates = function(location, origin, scale, angle, color) {
        var result = [];
        if(this.triangles != null) {
            for(var i = 0; i < this.triangles.length; i++) {
                var tri = this.triangles[i];
                var origin = { x : origin.x + location.x, y : origin.y + location.y };
                var p1 = MathTools.pointRotate(origin, { x : tri.p1[0] * scale.x, y : tri.p1[1] * scale.y }, angle);
                var p2 = MathTools.pointRotate(origin, { x : tri.p2[0] * scale.x, y : tri.p2[1] * scale.y }, angle);
                var p3 = MathTools.pointRotate(origin, { x : tri.p3[0] * scale.x, y : tri.p3[1] * scale.y }, angle);
                
                p1 = [ p1.x + location.x, p1.y + location.y ];
                p2 = [ p2.x + location.x, p2.y + location.y ];
                p3 = [ p3.x + location.x, p3.y + location.y ];
                
                result.push({
                    texture : tri.texture,
                    color : [ color.r, color.g, color.b, color.a ],
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

Spline.addSegmentFunctions = function(seg) {
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
