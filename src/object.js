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
    },
    
    attach : function(object) {
        for(var x = 0; x < this.items.length; x++) {
            var item2 = this.items[x];
            if(item2.type == "mesh") {
                for(var i = 0; i < object.items.length; i++) {
                    var item = object.items[i];
                    if(item.type == "bone") {
                        
                    }
                }
            }
        }
    }
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
    
    var meshBoneInfos = {};
    var boneParents = {};
    //var boneChildrens = {};
    
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
                var json2 = userToken.json;
                var tb = sheet;
                
                mesh2.brush = sheet;
                for(var index2 = 0; index2 < tb.keypoints.length; index2++) {
                    var keypoint;
                    if(index2 < mesh2.keypoints.length) {
                        keypoint = mesh2.keypoints[index2];
                    }
                    else {
                        keypoint = {
                            weights : []
                        };
                        mesh2.keypoints.push(keypoint);
                    }
                    
                    var point = tb.keypoints[index2];
                    keypoint.offset = { x : point.x, y : point.y };
                    keypoint.uv = { x : (point.x + tb.bounds.x) / tb.texture.image.width, y : (point.y + tb.bounds.y) / tb.texture.image.height };
                }
                    
                mesh2.triangulate(); 
            });
            
            for(var index2 = 0; index2 < item.weights.length; index2++) {
                var weightJson = item.weights[index2];
                var weight = parseInt(weightJson.value);
                var boneIndex = parseInt(weightJson.bone);
                var keyIndex = parseInt(weightJson.key);
                
                for(var i = mesh.keypoints.length; i <= keyIndex; i++) {
                    var keypoint = {
                        weights : []
                    };
                    mesh.keypoints.push(keypoint);
                }
                
                var keypoint = mesh.keypoints[keyIndex];
                if(!meshBoneInfos[keypoint]) {
                    meshBoneInfos[keypoint] = [];
                }
                
                meshBoneInfos[keypoint].push({ key : keypoint, index : boneIndex, value : weight });
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
                var key = {};
                key.keyframes = [];
                addObjectItemFunctions(key);
                collide.points.push(key);
            }
            
            baseItem = collide;
            baseItem.type = "collide";
            break;
            
          case "spline":
            var spline = new ObjectSpline();
            ObjectSpline.addSplineFunctions(spline);
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
            
            spline.fill = ObjectSpline.readSegment(item.uvmapping.fill, spline);
            spline.left = ObjectSpline.readSegment(item.uvmapping.left, spline);
            spline.top = ObjectSpline.readSegment(item.uvmapping.top, spline);
            spline.right = ObjectSpline.readSegment(item.uvmapping.right, spline);
            spline.bottom = ObjectSpline.readSegment(item.uvmapping.bottom, spline);
            
            baseItem = spline; 
            baseItem.type = "spline";
            break;
            
          case "bone":
            var bone = new ObjectBone();
            bone.length = item.length;            
            boneParents[bone] = { item : bone, parent : item.parent };
            /*
            boneChildrens[bone] = [];
            for(var i = 0; i < item.childrens.length; i++) {
                boneChildrens[bone].push({ item : item, child : item.childrens[i] });
            }
            */
            baseItem = bone;
            baseItem.type = "bone";
            break;
            
          default:
            throw "not support data type";
        }
        
        // 设置基础信息
        var locStr = item.position.split(',');
        var scaleStr = item.scale.split(',');
        var originStr = item.origin.split(',');
        
        baseItem.visual = item.visual == "true" ? true : false;
        baseItem.locked = item.locked == "true" ? true : false;
        baseItem.position = { x : parseFloat(locStr[0]), y : parseFloat(locStr[1]) };
        baseItem.scale = { x : parseFloat(scaleStr[0]), y : parseFloat(scaleStr[1]) };
        baseItem.origin = { x : parseFloat(originStr[0]), y : parseFloat(originStr[1]) };
        baseItem.angle = parseFloat(item.angle);
        
        // 设置关键帧
        baseItem.keyframes = [];
        for(var index2 = 0; index2 < item.keyframes.length; index2++) {
            var keyframe = item.keyframes[index2];
            baseItem.keyframes.push(baseItem.readKeyframe(keyframe));
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
        
        // 添加物体
        ani.items.push(baseItem);
    }
    
    // 引用关系
    for(var key in meshBoneInfos) {
        for(var i = 0; i < meshBoneInfos[key].length; i++) {
            var bone = meshBoneInfos[key][i];      
            bone.key.weights.push({
                binding : ani.items[bone.index],
                weight : bone.value
            });
        }
    }
    
    for(var info in boneParents) {
        var bone = boneParents[info];
        if(bone.parent != -1) {
            bone.item.parent = ani.items[bone.parent];
        }
    }
    
    ani.body = CreateBody(ani);
    
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

function MeshVertexTrackerKeyPoint(mesh, key) {
    return {
        key : key,
        mesh : mesh,
        getPostion : function(frame) {
            return this.mesh.getPosition(this.key, frame);
        }
    };
}

function ObjectItemCollideBox() {
    return {
        readKeyframe : function (json) {
            var offsetStr = json.offset.split(',');

            var frame = {};
            frame.frame = parseFloat(json.frame);
            frame.value = parseFloat(json.value);
            frame.smooth = json.smooth == "true" ? true : false;
            frame.offset = { x : parseFloat(offsetStr[0]), y : parseFloat(offsetStr[1]) };
            return frame;
        },
        getRealState : function (frame) {
            var lastState = this.getState(frame) || this.getLastState(frame);
            if (lastState == null || (lastState.frame != frame && !lastState.smooth))
                return null;
        
            var nextState = this.getNextState(frame);
            var value = this.evaluate(frame);
            
            if(lastState == null) {
                return nextState;
            }
            else if(nextState == null) {
                return lastState;
            }
            else {
                value = value * (frame - lastState.frame) / (nextState.frame - lastState.frame);
                var x = lastState.control.x + (nextState.control.x - lastState.control.x) * value;
                var y = lastState.control.y + (nextState.control.y - lastState.control.y) * value;

                return {
                    frame : frame,
                    value : value,
                    offset : { x : x, y : y }
                };
            }
        }
    };
}

function ObjectItemLabel() {
    return {
        readKeyframe : function (json) {
            var colorStr = json.color.split(',');
            
            var frame = {};
            frame.frame = parseFloat(json.frame);
            frame.value = parseFloat(json.value);
            frame.smooth = json.smooth == "true" ? true : false;
            frame.color = {
                r : parseFloat(colorStr[0]),
                g : parseFloat(colorStr[1]),
                b : parseFloat(colorStr[2]),
                a : parseFloat(colorStr[3])
            };
            return frame;
        },
        getRealState : function (frame) {
            var lastState = this.getState(frame) || this.getLastState(frame);
            if (lastState == null || (lastState.frame != frame && !lastState.smooth))
                return null;
        
            var nextState = this.getNextState(frame);
            var value = this.evaluate(frame);
            
            if(lastState == null) {
                return nextState;
            }
            else if(nextState == null) {
                return lastState;
            }
            else {
                value = value * (frame - lastState.frame) / (nextState.frame - lastState.frame);
                var r = parseInt(lastState.color.r + (nextState.color.r - lastState.color.r) * value);
                var g = parseInt(lastState.color.g + (nextState.color.g - lastState.color.g) * value);
                var b = parseInt(lastState.color.b + (nextState.color.b - lastState.color.b) * value);
                var a = parseInt(lastState.color.a + (nextState.color.a - lastState.color.a) * value);
                
                return {
                    frame : frame,
                    value : value,
                    color : { r : r, g : g, b : b, a : a }
                };
            }
        }
    };
}

function ObjectItemMesh() {
    return {
        triangles : null,
        attach : function (bone) {
            for(var i = 0; i < this.keypoints.length; i++) {
                var keypoint = this.keypoints[i];
                keypoint.weights.push({
                    binding : bone,
                    weight : 100
                });
            }
        },
        readKeyframe : function (json) {
            var controlStr = json.control.split(',');
            var colorStr = json.color.split(',');
            
            var frame = {};
            frame.frame = parseFloat(json.frame);
            frame.value = parseFloat(json.value);
            frame.smooth = json.smooth == "true" ? true : false;
            frame.control = { x : parseFloat(controlStr[0]), y : parseFloat(controlStr[1]) };
            frame.color = {
                r : parseFloat(colorStr[0]),
                g : parseFloat(colorStr[1]),
                b : parseFloat(colorStr[2]),
                a : parseFloat(colorStr[3])
            };
            return frame;
        },
        getRealState : function (frame) {
            var lastState = this.getState(frame) || this.getLastState(frame);
            if (lastState == null || (lastState.frame != frame && !lastState.smooth))
                return null;
        
            var nextState = this.getNextState(frame);
            var value = this.evaluate(frame);
            
            if(lastState == null) {
                return nextState;
            }
            else if(nextState == null) {
                return lastState;
            }
            else {
                value = value * (frame - lastState.frame) / (nextState.frame - lastState.frame);
                var x = lastState.control.x + (nextState.control.x - lastState.control.x) * value;
                var y = lastState.control.y + (nextState.control.y - lastState.control.y) * value;
                var r = parseInt(lastState.color.r + (nextState.color.r - lastState.color.r) * value);
                var g = parseInt(lastState.color.g + (nextState.color.g - lastState.color.g) * value);
                var b = parseInt(lastState.color.b + (nextState.color.b - lastState.color.b) * value);
                var a = parseInt(lastState.color.a + (nextState.color.a - lastState.color.a) * value);
                
                return {
                    frame : frame,
                    value : value,
                    control : { x : x, y : y },
                    color : { r : r, g : g, b : b, a : a }
                };
            }
        },
        getPosition : function(point, frame) {
            var state = this.getRealState(frame);
            if(state != null) 
            {
                var real = { 
                        x : point.offset.x - this.brush.x,
                        y : point.offset.y - this.brush.y 
                    };
                
                var d = MathTools.getDistance(
                    real, { 
                        x : state.control.x + this.bounds.x + this.bounds.width / 2,
                        y : state.control.y + this.bounds.y + this.bounds.height / 2
                    });
                    
                real = this.getBonePoint(real, point, frame);
                real = { 
                        x : real.x * this.scale.x + this.position.x,
                        y : real.y * this.scale.y + this.position.y
                    };
                    
                var origin = {
                    x : this.position.x + this.origin.x,
                    y : this.position.y + this.origin.y
                };
                    
                return MathTools.pointRotate(origin, real, this.angle);
            }
        },
        getBonePoint : function(real, point, frame) {
            for(var i = 0; i < point.weights.length; i++)
            {
                var weight = point.weights[i];
                var state = weight.binding.getRealState(frame);
                if(state != null && weight.weight != 0) {
                    var start = { 
                        x : weight.binding.position.x - this.position.x,
                        y : weight.binding.position.y - this.position.y
                    };
                    
                    var start2 = weight.binding.start(frame);
                    real = MathTools.pointRotate(start, real, (state.angle - weight.binding.angle) * weight.weight / 100);
                    real = {
                        x : real.x + (start2.x - weight.binding.position.x) * weight.weight / 100,
                        y : real.y + (start2.y - weight.binding.position.y) * weight.weight / 100
                    };
                }
            }  
            
            return real;
        },
        triangulate : function() {
            var vertices = [];
            
            var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;            
            for(var i = 0; i < this.keypoints.length; i++) {
                var keypoint = this.keypoints[i];
                vertices.push([ keypoint.offset.x, keypoint.offset.y ]);
                
                if(keypoint.offset.x < minX) minX = keypoint.offset.x;
                if(keypoint.offset.x > maxX) maxX = keypoint.offset.x;
                if(keypoint.offset.y < minY) minY = keypoint.offset.y;
                if(keypoint.offset.y > maxY) maxY = keypoint.offset.y;
            }
            
            this.bounds = { x : minX, y : minY, width : maxX - minX, height : maxY - minY };
            
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
                    if (v1[0] == keypoint.offset.x && v1[1] == keypoint.offset.y) p1 = new MeshVertexTrackerKeyPoint(this, keypoint);
                    if (v2[0] == keypoint.offset.x && v2[1] == keypoint.offset.y) p2 = new MeshVertexTrackerKeyPoint(this, keypoint);
                    if (v3[0] == keypoint.offset.x && v3[1] == keypoint.offset.y) p3 = new MeshVertexTrackerKeyPoint(this, keypoint);
                }
                
                this.triangles.push({
                    p1 : { tracker : p1, uv : { x : (v1[0] + this.brush.bounds.x) / this.brush.texture.image.width, y : (v1[1] + this.brush.bounds.y) / this.brush.texture.image.height } },
                    p2 : { tracker : p2, uv : { x : (v2[0] + this.brush.bounds.x) / this.brush.texture.image.width, y : (v2[1] + this.brush.bounds.y) / this.brush.texture.image.height } },
                    p3 : { tracker : p3, uv : { x : (v3[0] + this.brush.bounds.x) / this.brush.texture.image.width, y : (v3[1] + this.brush.bounds.y) / this.brush.texture.image.height } },
                });
                
            }
        }
    };
}

function ObjectSpline() {
    return {
        readKeyframe : function (json) {
            var colorStr = json.color.split(',');
            
            var frame = {};
            frame.frame = parseFloat(json.frame);
            frame.value = parseFloat(json.value);
            frame.smooth = json.smooth == "true" ? true : false;
            frame.color = {
                r : parseFloat(colorStr[0]),
                g : parseFloat(colorStr[1]),
                b : parseFloat(colorStr[2]),
                a : parseFloat(colorStr[3])
            };
            return frame;
        },
        getRealState : function (frame) {
            var lastState = this.getState(frame) || this.getLastState(frame);
            if (lastState == null || (lastState.frame != frame && !lastState.smooth))
                return null;
        
            var nextState = this.getNextState(frame);
            var value = this.evaluate(frame);
            
            if(lastState == null) {
                return nextState;
            }
            else if(nextState == null) {
                return lastState;
            }
            else {
                value = value * (frame - lastState.frame) / (nextState.frame - lastState.frame);
                var r = parseInt(lastState.color.r + (nextState.color.r - lastState.color.r) * value);
                var g = parseInt(lastState.color.g + (nextState.color.g - lastState.color.g) * value);
                var b = parseInt(lastState.color.b + (nextState.color.b - lastState.color.b) * value);
                var a = parseInt(lastState.color.a + (nextState.color.a - lastState.color.a) * value);
                
                return {
                    frame : frame,
                    value : value,
                    color : { r : r, g : g, b : b, a : a }
                };
            }
        }
    }
}

ObjectSpline.readSegment = function(json, spline) {
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

ObjectSpline.addSplineFunctions = function(spline) {
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
            ObjectSpline.addSegmentFunctions(seg2);
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
            
            ObjectSpline.addSegmentFunctions(seg);
            
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
                //var origin = { x : origin.x + location.x, y : origin.y + location.y };
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
                //var origin = { x : origin.x + location.x, y : origin.y + location.y };
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

ObjectSpline.addSegmentFunctions = function(seg) {
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

function ObjectBone()
{
    return {
        start : function(frame) {
            if(this.parent == null) {
                return this.position;
            }
            else {
                return this.parent.end(frame);
            }
        },
        end : function(frame) {
            var state = this.getRealState(frame);
            var angle = state == null ? 0 : state.angle;
            var start = this.start(frame);
            return MathTools.pointRotate(start, { x : start.x, y : start.y - this.length }, angle);
        },
        readKeyframe : function (json) {
            var frame = {};
            frame.frame = parseFloat(json.frame);
            frame.value = parseFloat(json.value);
            frame.smooth = json.smooth == "true" ? true : false;
            frame.angle = parseFloat(json.angle);
            return frame;
        },
        getRealState : function (frame) {
            var lastState = this.getState(frame) || this.getLastState(frame);
            if (lastState == null || (lastState.frame != frame && !lastState.smooth))
                return null;
        
            var nextState = this.getNextState(frame);
            var value = this.evaluate(frame);
            
            if(lastState == null) {
                return nextState;
            }
            else if(nextState == null) {
                return lastState;
            }
            else {
                value = value * (frame - lastState.frame) / (nextState.frame - lastState.frame);
                var angle = lastState.angle + (nextState.angle - lastState.angle) * value;

                return {
                    frame : frame,
                    value : value,
                    angle : angle
                };
            }
        }
    };
}