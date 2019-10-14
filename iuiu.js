/*
 * lightgl.js
 * http://github.com/KumaWang/iuiu.js/
 *
 * Copyright 2018 KumaWang
 * Released under the MIT license
 */
var IUIU = (function() {

// src/animation.js
function ObjectState(animation) {
    this.frame = 0;
    this.elaspedTime = 0;
    this.isPlaying = true;
    this.animation = animation;
    this._init = false;
    this._state = null;
}

ObjectState.prototype = {
    update : function(inv) {
        if(!this.isPlaying) return;
        
        if(!this._init) {
            if(this.animation.staties != null) {
                this.frame = this.animation.staties[this.state];
                this.elaspedTime = 0;
                this._init = true;
            }
            else if(this.state == null) {
                this._init = true;
            }
        }
        
        var frameRate = Math.max(24, this.animation.frameRate);
        this.elaspedTime = this.elaspedTime + inv;
        this.frame = this.frame + parseInt(this.elaspedTime / frameRate);
        this.elaspedTime = this.elaspedTime % frameRate;
        if(this.frame > this.animation.getMaxFrame()) { 
            this.frame = this._state != null && this.animation.staties && this.animation.staties[this._state] ? this.animation.staties[this._state] : 0;
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

function Object() {
    this.isVisual = true;
}

Object.prototype  = {
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

Object.create = function() {
    var ani = nObjection();
    ani.items = [];
    ani.frameRate = 24;
    ani.loop = true;
    return ani;
}

Object.fromJson = function(json, params, entry) {
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
                var mesh = new AnimationItemMesh();
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
                var label = new AnimationItemLabel();
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
                var collideObjectItemCollideBoxBox();
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
        addAnimationItemFunctions(baseItem);
        
        ani.items.push(baseItem);
    }
    return ani;
}

function addAnimationItemFunctions(baseItem) {
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

function AnimationItemLabel() {
    return {};
}

function AnimationItemMesh() {
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
// src/color.js
function Color(r, g, b, a) {
	if (((((r | g) | b) | a) & -256) != 0) {
    	r = r < 0 ? 0 : (r > 255 ? 255 : r);
        g = g < 0 ? 0 : (g > 255 ? 255 : g);
        b = b < 0 ? 0 : (b > 255 ? 255 : b);
        a = a < 0 ? 0 : (a > 255 ? 255 : a);
    } else {
    	r = r / 255;
    	g = g / 255;
    	b = b / 255;
    	a = a / 255;
	}
	
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}
Color.prototype = {
	toArray : function(n) {
		return [this.r, this.g, this.b, this.a].slice(0, n || 4);
	},
	multiply : function multiply(other) {
	    return new Color(
	    	Math.floor(this.r * other.r / 255.0),
	    	Math.floor(this.g * other.g / 255.0),
	    	Math.floor(this.b * other.b / 255.0),
	    	Math.floor(this.a * other.a / 255.0));
	},
	clone : function() {
		var result = new Color();
		result.r = this.r;
		result.g = this.g;
		result.b = this.b;
		result.a = this.a;
		return result;
	}
};

Color.multiply = function(value, scale) {
	var r = value.r;
	var g = value.g;
	var b = value.b;
	var a = value.a;
	
 	var value = scale*65536;
 	var min = 0;
 	var max = 0xffffff;
	
	value = (value > max) ? max : value;
    value = (value < min) ? min : value;
    var uintScale = value < 0 ? 0 : value;
    
     r = (r*uintScale) >> 16;
     g = (g*uintScale) >> 16;
     b = (b*uintScale) >> 16;
     a = (a*uintScale) >> 16;
     
     r = r > 255 ? 255 : r;
     g = g > 255 ? 255 : g;
     b = b > 255 ? 255 : b;
     a = a > 255 ? 255 : a;
     
     return new Color(r, g, b, a);
};

Color.lerp = function(value1, value2, amount) {
	var r1 = value1.r;
	var g1 = valur1.g;
	var b1 = value1.b;
	var a1 = value1.a;
	
	var r2 = value2.r;
	var g2 = valur2.g;
	var b2 = value2.b;
	var a2 = value2.a;
	
	amount *= 65536;
	if(isNaN(amount) || amount < 0)
		amount = 0
	else if(amount == Number.POSITIVE_INFINITY)
		amount = amount == Number.NEGATIVE_INFINITY ? 0 : 65536;

	return new Color(r1 + (((r2 - r1)*factor) >> 16),
					 g1 + (((g2 - g1)*factor) >> 16),
					 b1 + (((b2 - b1)*factor) >> 16),
					 a1 + (((a2 - a1)*factor) >> 16));
};

Color.aliceBlue=new Color(240,248,255,255);
Color.antiqueWhite=new Color(250,235,215,255);
Color.aqua=new Color(0,255,255,255);
Color.aquamarine=new Color(127,255,212,255);
Color.azure=new Color(240,255,255,255);
Color.beige=new Color(245,245,220,255);
Color.bisque=new Color(255,228,196,255);
Color.black=new Color(0,0,0,255);
Color.blanchedAlmond=new Color(255,235,205,255);
Color.blue=new Color(0,0,255,255);
Color.blueViolet=new Color(138,43,226,255);
Color.brown=new Color(165,42,42,255);
Color.burlyWood=new Color(222,184,135,255);
Color.cadetBlue=new Color(95,158,160,255);
Color.chartreuse=new Color(127,255,0,255);
Color.chocolate=new Color(210,105,30,255);
Color.coral=new Color(255,127,80,255);
Color.cornflowerBlue=new Color(0xffed9564);
Color.cornsilk=new Color(255,248,220,255);
Color.crimson=new Color(220,20,60,255);
Color.cyan=new Color(0,255,255,255);
Color.darkBlue=new Color(0,0,139,255);
Color.darkCyan=new Color(0,139,139,255);
Color.darkGoldenrod=new Color(184,134,11,255);
Color.darkGray=new Color(169,169,169,255);
Color.darkGreen=new Color(0,100,0,255);
Color.darkKhaki=new Color(189,183,107,255);
Color.darkMagenta=new Color(139,0,139,255);
Color.darkOliveGreen=new Color(85,107,47,255);
Color.darkOrange=new Color(255,140,0,255);
Color.darkOrchid=new Color(153,50,204,255);
Color.darkRed=new Color(139,0,0,255);
Color.darkSalmon=new Color(233,150,122,255);
Color.darkSeaGreen=new Color(143,188,139,255);
Color.darkSlateBlue=new Color(72,61,139,255);
Color.darkSlateGray=new Color(47,79,79,255);
Color.darkTurquoise=new Color(0,206,209,255);
Color.darkViolet=new Color(148,0,211,255);
Color.deepPink=new Color(255,20,147,255);
Color.deepSkyBlue=new Color(0,191,255,255);
Color.dimGray=new Color(105,105,105,255);
Color.dodgerBlue=new Color(30,144,255,255);
Color.firebrick=new Color(178,34,34,255);
Color.floralWhite=new Color(255,250,240,255);
Color.forestGreen=new Color(34,139,34,255);
Color.fuchsia=new Color(255,0,255,255);
Color.gainsboro=new Color(220,220,220,255);
Color.ghostWhite=new Color(248,248,255,255);
Color.gold=new Color(255,215,0,255);
Color.goldenrod=new Color(218,165,32,255);
Color.gray=new Color(128,128,128,255);
Color.green=new Color(0,128,0,255);
Color.greenYellow=new Color(173,255,47,255);
Color.honeydew=new Color(240,255,240,255);
Color.hotPink=new Color(255,105,180,255);
Color.indianRed=new Color(205,92,92,255);
Color.indigo=new Color(75,0,130,255);
Color.ivory=new Color(255,255,240,255);
Color.khaki=new Color(240,230,140,255);
Color.lavender=new Color(230,230,250,255);
Color.lavenderBlush=new Color(255,240,245,255);
Color.lawnGreen=new Color(124,252,0,255);
Color.lemonChiffon=new Color(255,250,205,255);
Color.lightBlue=new Color(173,216,230,255);
Color.lightCoral=new Color(240,128,128,255);
Color.lightCyan=new Color(224,255,255,255);
Color.lightGoldenrodYellow=new Color(250,250,210,255);
Color.lightGray=new Color(211,211,211,255);
Color.lightGreen=new Color(144,238,144,255);
Color.lightPink=new Color(255,182,193,255);
Color.lightSalmon=new Color(255,160,122,255);
Color.lightSeaGreen=new Color(32,178,170,255);
Color.lightSkyBlue=new Color(135,206,250,255);
Color.lightSlateGray=new Color(119,136,153,255);
Color.lightSteelBlue=new Color(176,196,222,255);
Color.lightYellow=new Color(255,255,224,255);
Color.lime=new Color(0,255,0,255);
Color.limeGreen=new Color(50,205,50,255);
Color.linen=new Color(250,240,230,255);
Color.magenta=new Color(255,0,255,255);
Color.maroon=new Color(128,0,0,255);
Color.mediumAquamarine=new Color(102,205,170,255);
Color.mediumBlue=new Color(0,0,205,255);
Color.mediumOrchid=new Color(186,85,211,255);
Color.mediumPurple=new Color(147,112,219,255);
Color.mediumSeaGreen=new Color(60,179,113,255);
Color.mediumSlateBlue=new Color(123,104,238,255);
Color.mediumSpringGreen=new Color(0,250,154,255);
Color.mediumTurquoise=new Color(72,209,204,255);
Color.mediumVioletRed=new Color(199,21,133,255);
Color.midnightBlue=new Color(25,25,112,255);
Color.mintCream=new Color(245,255,250,255);
Color.mistyRose=new Color(255,228,225,255);
Color.moccasin=new Color(255,228,181,255);
Color.navajoWhite=new Color(255,222,173,255);
Color.navy=new Color(0,0,128,255);
Color.oldLace=new Color(253,245,230,255);
Color.olive=new Color(128,128,0,255);
Color.oliveDrab=new Color(107,142,35,255);
Color.orange=new Color(255,165,0,255);
Color.orangeRed=new Color(255,69,0,255);
Color.orchid=new Color(218,112,214,255);
Color.paleGoldenrod=new Color(238,232,170,255);
Color.paleGreen=new Color(152,251,152,255);
Color.paleTurquoise=new Color(175,238,238,255);
Color.paleVioletRed=new Color(219,112,147,255);
Color.papayaWhip=new Color(255,239,213,255);
Color.peachPuff=new Color(255,218,185,255);
Color.peru=new Color(205,133,63,255);
Color.pink=new Color(255,192,203,255);
Color.plum=new Color(221,160,221,255);
Color.powderBlue=new Color(176,224,230,255);
Color.purple=new Color(128,0,128,255);
Color.red=new Color(255,0,0,255);
Color.rosyBrown=new Color(188,143,143,255);
Color.royalBlue=new Color(65,105,225,255);
Color.saddleBrown=new Color(139,69,19,255);
Color.salmon=new Color(250,128,114,255);
Color.sandyBrown=new Color(244,164,96,255);
Color.seaGreen=new Color(46,139,87,255);
Color.seaShell=new Color(255,245,238,255);
Color.sienna=new Color(160,82,45,255);
Color.silver=new Color(192,192,192,255);
Color.skyBlue=new Color(135,206,235,255);
Color.slateBlue=new Color(106,90,205,255);
Color.slateGray=new Color(112,128,144,255);
Color.snow=new Color(255,250,250,255);
Color.springGreen=new Color(0,255,127,255);
Color.steelBlue=new Color(70,130,180,255);
Color.tan=new Color(210,180,140,255);
Color.teal=new Color(0,128,128,255);
Color.thistle=new Color(216,191,216,255);
Color.tomato=new Color(255,99,71,255);
Color.transparent=new Color(0,0,0,0);
Color.turquoise=new Color(64,224,208,255);
Color.violet=new Color(238,130,238,255);
Color.wheat=new Color(245,222,179,255);
Color.white=new Color(255,255,255,255);
Color.whiteSmoke=new Color(245,245,245,255);
Color.yellow=new Color(255,255,0,255);
Color.yellowGreen=new Color(154,205,50,255);
// src/common.js
Array.prototype.insert = function (index, item) {  
  this.splice(index, 0, item);  
};  

Array.prototype.removeAt=function(index) {
	this.splice(index, 1);
}

function Common() {
}
Common.clone = function (obj) {
   var str, newobj = obj.constructor === Array ? [] : {};
    if(typeof obj !== 'object'){
        return;
    } else if(window.JSON){
        str = JSON.stringify(obj), //系列化对象
        newobj = JSON.parse(str); //还原
    } else {
        for(var i in obj){
            newobj[i] = typeof obj[i] === 'object' ? 
            cloneObj(obj[i]) : obj[i]; 
        }
    }
    return newobj;
}

Common.copy = function(target, source, strict){
    for(var key in source){
        if(!strict || target.hasOwnProperty(key) || target[key] !== undefined){
            target[key] = source[key];
        }
    }
    return target;
}

function deepCopyObj(oldObj){
  var newObj={};
  if(oldObj &&  typeof oldObj=="object" ){
    for(var i in oldObj ) {
    	
      if(typeof oldObj[i]=="object"){//如果子还是对象那么循环调用值赋值
        newObj[i]=deepCopyObj(oldObj[i]);
      }else{//直接值赋值
        newObj[i]=oldObj[i];
      }
    }
    return newObj
  }
}

String.prototype.format = function () {
    var str = this
    for (var i = 0; i < arguments.length; i++) {
        var re = new RegExp('\\{' + i + '\\}', 'gm')
        str = str.replace(re, arguments[i])
    }
    return str
}
// src/component.js
function Component() {
    this.components = {};
}

Component.prototype.create = function(name) {
    return this.components[name]();
}

Component.prototype.define = function(name, createFunc) {
    this.components[name] = createFunc;
}


// src/delaunay.js
var Delaunay;

(function() {
  "use strict";

  var EPSILON = 1.0 / 1048576.0;

  function supertriangle(vertices) {
    var xmin = Number.POSITIVE_INFINITY,
        ymin = Number.POSITIVE_INFINITY,
        xmax = Number.NEGATIVE_INFINITY,
        ymax = Number.NEGATIVE_INFINITY,
        i, dx, dy, dmax, xmid, ymid;

    for(i = vertices.length; i--; ) {
      if(vertices[i][0] < xmin) xmin = vertices[i][0];
      if(vertices[i][0] > xmax) xmax = vertices[i][0];
      if(vertices[i][1] < ymin) ymin = vertices[i][1];
      if(vertices[i][1] > ymax) ymax = vertices[i][1];
    }

    dx = xmax - xmin;
    dy = ymax - ymin;
    dmax = Math.max(dx, dy);
    xmid = xmin + dx * 0.5;
    ymid = ymin + dy * 0.5;

    return [
      [xmid - 20 * dmax, ymid -      dmax],
      [xmid            , ymid + 20 * dmax],
      [xmid + 20 * dmax, ymid -      dmax]
    ];
  }

  function circumcircle(vertices, i, j, k) {
    var x1 = vertices[i][0],
        y1 = vertices[i][1],
        x2 = vertices[j][0],
        y2 = vertices[j][1],
        x3 = vertices[k][0],
        y3 = vertices[k][1],
        fabsy1y2 = Math.abs(y1 - y2),
        fabsy2y3 = Math.abs(y2 - y3),
        xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;

    /* Check for coincident points */
    if(fabsy1y2 < EPSILON && fabsy2y3 < EPSILON)
      throw new Error("Eek! Coincident points!");

    if(fabsy1y2 < EPSILON) {
      m2  = -((x3 - x2) / (y3 - y2));
      mx2 = (x2 + x3) / 2.0;
      my2 = (y2 + y3) / 2.0;
      xc  = (x2 + x1) / 2.0;
      yc  = m2 * (xc - mx2) + my2;
    }

    else if(fabsy2y3 < EPSILON) {
      m1  = -((x2 - x1) / (y2 - y1));
      mx1 = (x1 + x2) / 2.0;
      my1 = (y1 + y2) / 2.0;
      xc  = (x3 + x2) / 2.0;
      yc  = m1 * (xc - mx1) + my1;
    }

    else {
      m1  = -((x2 - x1) / (y2 - y1));
      m2  = -((x3 - x2) / (y3 - y2));
      mx1 = (x1 + x2) / 2.0;
      mx2 = (x2 + x3) / 2.0;
      my1 = (y1 + y2) / 2.0;
      my2 = (y2 + y3) / 2.0;
      xc  = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
      yc  = (fabsy1y2 > fabsy2y3) ?
        m1 * (xc - mx1) + my1 :
        m2 * (xc - mx2) + my2;
    }

    dx = x2 - xc;
    dy = y2 - yc;
    return {i: i, j: j, k: k, x: xc, y: yc, r: dx * dx + dy * dy};
  }

  function dedup(edges) {
    var i, j, a, b, m, n;

    for(j = edges.length; j; ) {
      b = edges[--j];
      a = edges[--j];

      for(i = j; i; ) {
        n = edges[--i];
        m = edges[--i];

        if((a === m && b === n) || (a === n && b === m)) {
          edges.splice(j, 2);
          edges.splice(i, 2);
          break;
        }
      }
    }
  }

  Delaunay = {
    triangulate: function(vertices, key) {
      var n = vertices.length,
          i, j, indices, st, open, closed, edges, dx, dy, a, b, c;

      /* Bail if there aren't enough vertices to form any triangles. */
      if(n < 3)
        return [];

      /* Slice out the actual vertices from the passed objects. (Duplicate the
       * array even if we don't, though, since we need to make a supertriangle
       * later on!) */
      vertices = vertices.slice(0);

      if(key)
        for(i = n; i--; )
          vertices[i] = vertices[i][key];

      /* Make an array of indices into the vertex array, sorted by the
       * vertices' x-position. Force stable sorting by comparing indices if
       * the x-positions are equal. */
      indices = new Array(n);

      for(i = n; i--; )
        indices[i] = i;

      indices.sort(function(i, j) {
        var diff = vertices[j][0] - vertices[i][0];
        return diff !== 0 ? diff : i - j;
      });

      /* Next, find the vertices of the supertriangle (which contains all other
       * triangles), and append them onto the end of a (copy of) the vertex
       * array. */
      st = supertriangle(vertices);
      vertices.push(st[0], st[1], st[2]);
      
      /* Initialize the open list (containing the supertriangle and nothing
       * else) and the closed list (which is empty since we havn't processed
       * any triangles yet). */
      open   = [circumcircle(vertices, n + 0, n + 1, n + 2)];
      closed = [];
      edges  = [];

      /* Incrementally add each vertex to the mesh. */
      for(i = indices.length; i--; edges.length = 0) {
        c = indices[i];

        /* For each open triangle, check to see if the current point is
         * inside it's circumcircle. If it is, remove the triangle and add
         * it's edges to an edge list. */
        for(j = open.length; j--; ) {
          /* If this point is to the right of this triangle's circumcircle,
           * then this triangle should never get checked again. Remove it
           * from the open list, add it to the closed list, and skip. */
          dx = vertices[c][0] - open[j].x;
          if(dx > 0.0 && dx * dx > open[j].r) {
            closed.push(open[j]);
            open.splice(j, 1);
            continue;
          }

          /* If we're outside the circumcircle, skip this triangle. */
          dy = vertices[c][1] - open[j].y;
          if(dx * dx + dy * dy - open[j].r > EPSILON)
            continue;

          /* Remove the triangle and add it's edges to the edge list. */
          edges.push(
            open[j].i, open[j].j,
            open[j].j, open[j].k,
            open[j].k, open[j].i
          );
          open.splice(j, 1);
        }

        /* Remove any doubled edges. */
        dedup(edges);

        /* Add a new triangle for each edge. */
        for(j = edges.length; j; ) {
          b = edges[--j];
          a = edges[--j];
          open.push(circumcircle(vertices, a, b, c));
        }
      }

      /* Copy any remaining open triangles to the closed list, and then
       * remove any triangles that share a vertex with the supertriangle,
       * building a list of triplets that represent triangles. */
      for(i = open.length; i--; )
        closed.push(open[i]);
      open.length = 0;

      for(i = closed.length; i--; )
        if(closed[i].i < n && closed[i].j < n && closed[i].k < n)
          open.push(closed[i].i, closed[i].j, closed[i].k);

      /* Yay, we're done! */
      return open;
    },
    contains: function(tri, p) {
      /* Bounding box test first, for quick rejections. */
      if((p[0] < tri[0][0] && p[0] < tri[1][0] && p[0] < tri[2][0]) ||
         (p[0] > tri[0][0] && p[0] > tri[1][0] && p[0] > tri[2][0]) ||
         (p[1] < tri[0][1] && p[1] < tri[1][1] && p[1] < tri[2][1]) ||
         (p[1] > tri[0][1] && p[1] > tri[1][1] && p[1] > tri[2][1]))
        return null;

      var a = tri[1][0] - tri[0][0],
          b = tri[2][0] - tri[0][0],
          c = tri[1][1] - tri[0][1],
          d = tri[2][1] - tri[0][1],
          i = a * d - b * c;

      /* Degenerate tri. */
      if(i === 0.0)
        return null;

      var u = (d * (p[0] - tri[0][0]) - b * (p[1] - tri[0][1])) / i,
          v = (a * (p[1] - tri[0][1]) - c * (p[0] - tri[0][0])) / i;

      /* If we're outside the tri, fail. */
      if(u < 0.0 || v < 0.0 || (u + v) > 1.0)
        return null;

      return [u, v];
    }
  };

  if(typeof module !== "undefined")
    module.exports = Delaunay;
})();

// src/font.js
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
// src/HTMLAudio.js
/**
 * @language=zh
 * HTMLAudio声音播放模块。此模块使用HTMLAudioElement播放音频。
 * 使用限制：iOS平台需用户事件触发才能播放，很多Android浏览器仅能同时播放一个音频。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module iuiu/HTMLAudio
 */
function HTMLAudio(properties) {   
	var obj = {
	    src: null,
	    loop: false,
	    autoPlay: false,
	    loaded: false,
	    playing: false,
	    duration: 0,
	    volume: 1,
	    muted: false,

	    _element: null, //HTMLAudioElement对象
	    _listeners: null,

	    /**
	     * @language=zh
	     * 增加一个事件监听。
	     * @param {String} type 要监听的事件类型。
	     * @param {Function} listener 事件监听回调函数。
	     * @param {Boolean} once 是否是一次性监听，即回调函数响应一次后即删除，不再响应。
	     * @returns {Object} 对象本身。链式调用支持。
	     */
	    on: function(type, listener, once){
	        var listeners = (this._listeners = this._listeners || {});
	        var eventListeners = (listeners[type] = listeners[type] || []);
	        for(var i = 0, len = eventListeners.length; i < len; i++){
	            var el = eventListeners[i];
	            if(el.listener === listener) return;
	        }
	        eventListeners.push({listener:listener, once:once});
	        return this;
	    },

	    /**
	     * @language=zh
	     * 删除一个事件监听。如果不传入任何参数，则删除所有的事件监听；如果不传入第二个参数，则删除指定类型的所有事件监听。
	     * @param {String} type 要删除监听的事件类型。
	     * @param {Function} listener 要删除监听的回调函数。
	     * @returns {Object} 对象本身。链式调用支持。
	     */
	    off: function(type, listener){
	        //remove all event listeners
	        if(arguments.length == 0){
	            this._listeners = null;
	            return this;
	        }

	        var eventListeners = this._listeners && this._listeners[type];
	        if(eventListeners){
	            //remove event listeners by specified type
	            if(arguments.length == 1){
	                delete this._listeners[type];
	                return this;
	            }

	            for(var i = 0, len = eventListeners.length; i < len; i++){
	                var el = eventListeners[i];
	                if(el.listener === listener){
	                    eventListeners.splice(i, 1);
	                    if(eventListeners.length === 0) delete this._listeners[type];
	                    break;
	                }
	            }
	        }
	        return this;
	    },

	    /**
	     * @language=zh
	     * 发送事件。当第一个参数类型为Object时，则把它作为一个整体事件对象。
	     * @param {String} type 要发送的事件类型。
	     * @param {Object} detail 要发送的事件的具体信息，即事件随带参数。
	     * @returns {Boolean} 是否成功调度事件。
	     */
	    fire: function(type, detail){
	        var event, eventType;
	        if(typeof type === 'string'){
	            eventType = type;
	        }else{
	            event = type;
	            eventType = type.type;
	        }

	        var listeners = this._listeners;
	        if(!listeners) return false;

	        var eventListeners = listeners[eventType];
	        if(eventListeners){
	            var eventListenersCopy = eventListeners.slice(0);
	            event = event || new EventObject(eventType, this, detail);
	            if(event._stopped) return false;

	            for(var i = 0; i < eventListenersCopy.length; i++){
	                var el = eventListenersCopy[i];
	                el.listener.call(this, event);
	                if(el.once) {
	                    var index = eventListeners.indexOf(el);
	                    if(index > -1){
	                        eventListeners.splice(index, 1);
	                    }
	                }
	            }

	            if(eventListeners.length == 0) delete listeners[eventType];
	            return true;
	        }
	        return false;
	    },
	    /**
	     * @language=zh
	     * 加载音频文件。
	     */
	    load: function(){
	        if(!this._element){
	            var elem;
	            try{
	                elem = this._element = new Audio();
	                elem.addEventListener('canplaythrough', this._onAudioEvent, false);
	                elem.addEventListener('ended', this._onAudioEvent, false);
	                elem.addEventListener('error', this._onAudioEvent, false);
	                elem.src = this.src;
	                elem.volume = this.volume;
	                elem.load();
	            }
	            catch(err){
	                //ie9 某些版本有Audio对象，但是执行play,pause会报错！
	                elem = this._element = {};
	                elem.play = elem.pause = function(){

	                };
	            }
	        }
	        return this;
	    },

	    /**
	     * @language=zh
	     * @private
	     */
	    _onAudioEvent: function(e){
	        // console.log('onAudioEvent:', e.type);
	        var type = e.type;

	        switch(type){
	            case 'canplaythrough':
	                e.target.removeEventListener(type, this._onAudioEvent);
	                this.loaded = true;
	                this.duration = this._element.duration;
	                this.fire('load');
	                if(obj.autoPlay) this._doPlay();
	                break;
	            case 'ended':
	                this.playing = false;
	                this.fire('end');
	                if(this.loop) this._doPlay();
	                break;
	            case 'error':
	                this.fire('error');
	                break;
	        }
	    },

	    /**
	     * @language=zh
	     * @private
	     */
	    _doPlay: function(){
	        if(!this.playing){
	            this._element.volume = this.muted ? 0 : this.volume;
	            this._element.play();
	            this.playing = true;
	        }
	    },
	    /**
	     * @language=zh
	     * 播放音频。如果正在播放，则会重新开始。
	     * 注意：为了避免第一次播放不成功，建议在load音频后再播放。
	     */
	    play: function(){
	        if(this.playing) this.stop();

	        if(!this._element){
	            this.autoPlay = true;
	            this.load();
	        }else if(this.loaded){
	            this._doPlay();
	        }

	        return this;
	    },
	    /**
	     * @language=zh
	     * 暂停音频。
	     */
	    pause: function(){
	        if(this.playing){
	            this._element.pause();
	            this.playing = false;
	        }
	        return this;
	    },
	    /**
	     * @language=zh
	     * 恢复音频播放。
	     */
	    resume: function(){
	        if(!this.playing){
	            this._doPlay();
	        }
	        return this;
	    },
	    /**
	     * @language=zh
	     * 停止音频播放。
	     */
	    stop: function(){
	        if(this.playing){
	            this._element.pause();
	            this._element.currentTime = 0;
	            this.playing = false;
	        }
	        return this;
	    },
	    /**
	     * @language=zh
	     * 设置音量。注意: iOS设备无法设置音量。
	     */
	    setVolume: function(volume){
	        if(this.volume != volume){
	            this.volume = volume;
	            this._element.volume = volume;
	        }
	        return this;
	    },
	    /**
	     * @language=zh
	     * 设置静音模式。注意: iOS设备无法设置静音模式。
	     */
	    setMute: function(muted){
	        if(this.muted != muted){
	            this.muted = muted;
	            this._element.volume = muted ? 0 : this.volume;
	        }
	        return this;
	    }
	};
	
	Common.copy(obj, properties, true);
       obj._onAudioEvent = obj._onAudioEvent.bind(obj);
       return obj;
};
HTMLAudio.isSupported = window.Audio !== null;
// src/io.js
function DefaultDecoder() {
}

DefaultDecoder.prototype = {
	getCharCode : function(charCode) {
		return String.fromCharCode(charCode);
	}
};

function BinaryReader(dataView, start, length, decoder) {
	if(!dataView)
    	throw "data";
        
	this.data = dataView;
	this.position = start || 0;
	var up = start + length;
    this.length = up > dataView.byteLength ? dataView.byteLength - start : up;
    this.decoder = decoder || new DefaultDecoder();
}

BinaryReader.prototype = {
	readByte : function() {
		return this.data.getUint8(this.position++);
	},
	readSByte : function() {
		return this.data.getInt8(this.position++);
	},
	readInt16 : function() {
		var result = this.data.getInt16(this.position);
        this.position = this.position + 2;
        return result;
	},
	readUint16 : function() {
		var result = this.data.getUint16(this.position);
        this.position = this.position + 2;
        return result;
	},
	readInt32 : function() {
		var result = this.data.getInt32(this.position);
        this.position = this.position + 4;
        return result;
	},
	readUint32 : function() {
		var result = this.data.getUint32(this.position);
        this.position = this.position + 4;
        return result;
	},
	readSingle : function() {
		var result = this.data.getFloat32(this.position);
        this.position = this.position + 4;
        return result;
	},
	readDouble : function() {
		var result = this.data.getFloat64(this.position);
        this.position = this.position + 8;
        return result;
	},
	readBoolean : function() {
		return this.data.getInt8(this.position++) == 1;
	},
	readChar : function() {
		return this.decoder.getCharCode(this.readByte());
	},
	readString : function(length) {
		var result = "";
        var num = 0;        // int
        var capacity = length || this.read7BitEncodedInt();
        if (capacity < 0) {
        	throw "IO.IO_InvalidStringLen_Len";
        }
        
        if (capacity == 0) {
        	return result;
        }
        
        for(var i = 0; i < capacity; i++) {
        	result += this.readChar();
        }
        
        return result;
	},
	read7BitEncodedInt : function() {
		var num3;           // byte
       	var num = 0;        // int
		var num2 = 0;       // int
		do {
			if (num2 == 0x23) {
				throw "Format_Bad7BitInt32";
			}
			num3 = this.readByte();
			num |= (num3 & 0x7f) << num2;
			num2 += 7;
		} while ((num3 & 0x80) != 0);
		
		this.position = this.position + 7;
		return num;
	},
	readBytes : function(num) {
		var result = [];
		for (var i = 0; i < num; i++) {
			result[i] = this.readByte();
		}
		
		return result;
	},
	readFixed : function() {
		var val = this.readInt32() / 65536.0;
		return Math.ceil(val * 100000) / 100000;
	},
	readLongDateTime : function() {
		// 1970.1.1 - 1904.1.1
		var delta = -2080198800000;// (new Date(1904, 1, 1)).getTime();
		var date = new Date();
		this.position = this.position + 4;
		date.setTime(this.readUint32());
		return date;
	},
	getFixed : function(byteOffset) {
		var temp = this.position;
		this.position = byteOffset;
		var result = this.readFixed();
		this.position = temp;
		return result;
	},
	getLongDateTime : function(byteOffset) {
		var temp = this.position;
		this.position = byteOffset;
		var result = readLongDateTime();
		this.position = temp;
		return result;
	}
};
// src/keyboard.js
const isff = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase().indexOf('firefox') > 0 : false;

// 绑定事件
function addEvent(object, event, method) {
  if (object.addEventListener) {
    object.addEventListener(event, method, false);
  } else if (object.attachEvent) {
    object.attachEvent(`on${event}`, () => { method(window.event); });
  }
}

// 修饰键转换成对应的键码
function getMods(modifier, key) {
  const mods = key.slice(0, key.length - 1);
  for (let i = 0; i < mods.length; i++) mods[i] = modifier[mods[i].toLowerCase()];
  return mods;
}

// 处理传的key字符串转换成数组
function getKeys(key) {
  if (!key) key = '';

  key = key.replace(/\s/g, ''); // 匹配任何空白字符,包括空格、制表符、换页符等等
  const keys = key.split(','); // 同时设置多个快捷键，以','分割
  let index = keys.lastIndexOf('');

  // 快捷键可能包含','，需特殊处理
  for (; index >= 0;) {
    keys[index - 1] += ',';
    keys.splice(index, 1);
    index = keys.lastIndexOf('');
  }

  return keys;
}

// 比较修饰键的数组
function compareArray(a1, a2) {
  const arr1 = a1.length >= a2.length ? a1 : a2;
  const arr2 = a1.length >= a2.length ? a2 : a1;
  let isIndex = true;

  for (let i = 0; i < arr1.length; i++) {
    if (arr2.indexOf(arr1[i]) === -1) isIndex = false;
  }
  return isIndex;
}

const _keyMap = { // 特殊键
  backspace: 8,
  tab: 9,
  clear: 12,
  enter: 13,
  return: 13,
  esc: 27,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  del: 46,
  delete: 46,
  ins: 45,
  insert: 45,
  home: 36,
  end: 35,
  pageup: 33,
  pagedown: 34,
  capslock: 20,
  '?': 20,
  ',': 188,
  '.': 190,
  '/': 191,
  '`': 192,
  '-': isff ? 173 : 189,
  '=': isff ? 61 : 187,
  ';': isff ? 59 : 186,
  '\'': 222,
  '[': 219,
  ']': 221,
  '\\': 220,
};

const _modifier = { // 修饰键
  '?': 16,
  shift: 16,
  '?': 18,
  alt: 18,
  option: 18,
  '?': 17,
  ctrl: 17,
  control: 17,
  '?': isff ? 224 : 91,
  cmd: isff ? 224 : 91,
  command: isff ? 224 : 91,
};
const modifierMap = {
  16: 'shiftKey',
  18: 'altKey',
  17: 'ctrlKey',
};
const _mods = { 16: false, 18: false, 17: false };
const _handlers = {};

// F1~F12 特殊键
for (let k = 1; k < 20; k++) {
  _keyMap[`f${k}`] = 111 + k;
}

// 兼容Firefox处理
modifierMap[isff ? 224 : 91] = 'metaKey';
_mods[isff ? 224 : 91] = false;


let _downKeys = []; // 记录摁下的绑定键

let _scope = 'all'; // 默认热键范围
const elementHasBindEvent = []; // 已绑定事件的节点记录

// 返回键码
const code = x => _keyMap[x.toLowerCase()] || _modifier[x.toLowerCase()] || x.toUpperCase().charCodeAt(0);

// 设置获取当前范围（默认为'所有'）
function setScope(scope) { _scope = scope || 'all'; }
// 获取当前范围
function getScope() { return _scope || 'all'; }
// 获取摁下绑定键的键值
function getPressedKeyCodes() { return _downKeys.slice(0); }

// 表单控件控件判断 返回 Boolean
// hotkey is effective only when filter return true
function filter(event) {
  const target = event.target || event.srcElement;
  const tagName = target.tagName;
  let flag = true;
  // ignore: isContentEditable === 'true', <input> and <textarea> when readOnly state is false, <select>
  if (
    target.isContentEditable ||
    tagName === 'TEXTAREA' ||
    ((tagName === 'INPUT' || tagName === 'TEXTAREA') && !target.readOnly)
  ) {
    flag = false;
  }
  return flag;
}

// 判断摁下的键是否为某个键，返回true或者false
function isPressed(keyCode) {
  if (typeof (keyCode) === 'string') {
    keyCode = code(keyCode); // 转换成键码
  }
  return _downKeys.indexOf(keyCode) !== -1;
}


// 循环删除handlers中的所有 scope(范围)
function deleteScope(scope, newScope) {
  let handlers;
  let i;

  // 没有指定scope，获取scope
  if (!scope) scope = getScope();

  for (const key in _handlers) {
    if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
      handlers = _handlers[key];
      for (i = 0; i < handlers.length;) {
        if (handlers[i].scope === scope) handlers.splice(i, 1);
        else i++;
      }
    }
  }

  // 如果scope被删除，将scope重置为all
  if (getScope() === scope) setScope(newScope || 'all');
}

// 清除修饰键
function clearModifier(event) {
  let key = event.keyCode || event.which || event.charCode;
  const i = _downKeys.indexOf(key);

  // 从列表中清除按压过的键
  if (i >= 0) {
    _downKeys.splice(i, 1);
  }
  // 特殊处理 cmmand 键，在 cmmand 组合快捷键 keyup 只执行一次的问题
  if (event.key && event.key.toLowerCase() === 'meta') {
    _downKeys.splice(0, _downKeys.length);
  }

  // 修饰键 shiftKey altKey ctrlKey (command||metaKey) 清除
  if (key === 93 || key === 224) key = 91;
  if (key in _mods) {
    _mods[key] = false;

    // 将修饰键重置为false
    for (const k in _modifier) if (_modifier[k] === key) hotkeys[k] = false;
  }
}

// 解除绑定某个范围的快捷键
function unbind(key, scope, method) {
  const multipleKeys = getKeys(key);
  let keys;
  let mods = [];
  let obj;
  // 通过函数判断，是否解除绑定
  // https://github.com/jaywcjlove/hotkeys/issues/44
  if (typeof scope === 'function') {
    method = scope;
    scope = 'all';
  }

  for (let i = 0; i < multipleKeys.length; i++) {
    // 将组合快捷键拆分为数组
    keys = multipleKeys[i].split('+');

    // 记录每个组合键中的修饰键的键码 返回数组
    if (keys.length > 1) {
      mods = getMods(_modifier, keys);
    } else {
      mods = [];
    }

    // 获取除修饰键外的键值key
    key = keys[keys.length - 1];
    key = key === '*' ? '*' : code(key);

    // 判断是否传入范围，没有就获取范围
    if (!scope) scope = getScope();

    // 如何key不在 _handlers 中返回不做处理
    if (!_handlers[key]) return;

    // 清空 handlers 中数据，
    // 让触发快捷键键之后没有事件执行到达解除快捷键绑定的目的
    for (let r = 0; r < _handlers[key].length; r++) {
      obj = _handlers[key][r];
      // 通过函数判断，是否解除绑定，函数相等直接返回
      const isMatchingMethod = method ? obj.method === method : true;

      // 判断是否在范围内并且键值相同
      if (
        isMatchingMethod &&
        obj.scope === scope &&
        compareArray(obj.mods, mods)
      ) {
        _handlers[key][r] = {};
      }
    }
  }
}

// 对监听对应快捷键的回调函数进行处理
function eventHandler(handler, scope) {
  let modifiersMatch;

  // 看它是否在当前范围
  if (handler.scope === scope || handler.scope === 'all') {
    // 检查是否匹配修饰符（如果有返回true）
    modifiersMatch = handler.mods.length > 0;

    for (const y in _mods) {
      if (Object.prototype.hasOwnProperty.call(_mods, y)) {
        if (
          (!_mods[y] && handler.mods.indexOf(+y) > -1) ||
          (_mods[y] && handler.mods.indexOf(+y) === -1)
        ) modifiersMatch = false;
      }
    }

    // 调用处理程序，如果是修饰键不做处理
    if (
      (handler.mods.length === 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) ||
      modifiersMatch ||
      handler.shortcut === '*'
    ) {
      handler.method(handler);
    }
  }
}


// 处理keydown事件
function dispatch(event) {
  const asterisk = _handlers['*'];
  let key = event.keyCode || event.which || event.charCode;

  // 表单控件过滤 默认表单控件不触发快捷键
  if (!hotkeys.filter.call(this, event)) return;

  // Gecko(Firefox)的command键值224，在Webkit(Chrome)中保持一致
  // Webkit左右command键值不一样
  if (key === 93 || key === 224) key = 91;

  // Collect bound keys
  // If an Input Method Editor is processing key input and the event is keydown, return 229.
  // https://stackoverflow.com/questions/25043934/is-it-ok-to-ignore-keydown-events-with-keycode-229
  // http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
  if (_downKeys.indexOf(key) === -1 && key !== 229) _downKeys.push(key);

  if (key in _mods) {
    _mods[key] = true;

    // 将特殊字符的key注册到 hotkeys 上
    for (const k in _modifier) {
      if (_modifier[k] === key) hotkeys[k] = true;
    }

    if (!asterisk) return;
  }

  // 将modifierMap里面的修饰键绑定到event中
  for (const e in _mods) {
    if (Object.prototype.hasOwnProperty.call(_mods, e)) {
      _mods[e] = event[modifierMap[e]];
    }
  }
}

// 判断 element 是否已经绑定事件
function isElementBind(element) {
  return elementHasBindEvent.indexOf(element) > -1;
}

function update() {
  const asterisk = _handlers['*'];
  
  if (!asterisk) return;
	
  // 获取范围 默认为all
  const scope = getScope();

  // 对任何快捷键都需要做的处理
  if (asterisk) {
    for (let i = 0; i < asterisk.length; i++) {
      if (asterisk[i].scope === scope) {
        eventHandler(asterisk[i], scope);
      }
    }
  }
  // key 不在_handlers中返回
  // if (!(key in _handlers)) return;
  for (const key in _handlers) {
    if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
      for (let i = 0; i < _handlers[key].length; i++) {
        if (_handlers[key][i].key) {
          const keyShortcut = _handlers[key][i].key.split('+');
          let _downKeysCurrent = []; // 记录当前按键键值
          for (let a = 0; a < keyShortcut.length; a++) {
            _downKeysCurrent.push(code(keyShortcut[a]));
          }
          _downKeysCurrent = _downKeysCurrent.sort();
          if (_downKeysCurrent.join('') === _downKeys.sort().join('')) {
            // 找到处理内容
            eventHandler(_handlers[key][i], scope);
          }
        }
      }
    }
  }
}

function hotkeys(key, option, method) {
  const keys = getKeys(key); // 需要处理的快捷键列表
  let mods = [];
  let scope = 'all'; // scope默认为all，所有范围都有效
  let element = document; // 快捷键事件绑定节点
  let i = 0;
  let keyup = false;
  let keydown = true;

  // 对为设定范围的判断
  if (method === undefined && typeof option === 'function') {
    method = option;
  }

  if (Object.prototype.toString.call(option) === '[object Object]') {
    if (option.scope) scope = option.scope; // eslint-disable-line
    if (option.element) element = option.element; // eslint-disable-line
    if (option.keyup) keyup = option.keyup; // eslint-disable-line
    if (option.keydown !== undefined) keydown = option.keydown; // eslint-disable-line
  }

  if (typeof option === 'string') scope = option;

  // 对于每个快捷键进行处理
  for (; i < keys.length; i++) {
    key = keys[i].split('+'); // 按键列表
    mods = [];

    // 如果是组合快捷键取得组合快捷键
    if (key.length > 1) mods = getMods(_modifier, key);

    // 将非修饰键转化为键码
    key = key[key.length - 1];
    key = key === '*' ? '*' : code(key); // *表示匹配所有快捷键

    // 判断key是否在_handlers中，不在就赋一个空数组
    if (!(key in _handlers)) _handlers[key] = [];
    _handlers[key].push({
      keyup,
      keydown,
      scope,
      mods,
      shortcut: keys[i],
      method,
      key: keys[i],
    });
  }
  // 在全局document上设置快捷键
  if (typeof element !== 'undefined' && !isElementBind(element) && window) {
    elementHasBindEvent.push(element);
    addEvent(element, 'keydown', (e) => {
      dispatch(e);
      event.preventDefault();
	  event.stopPropagation();
 	  event.cancelBubble = true;
    });
    addEvent(window, 'focus', () => {
      _downKeys = [];
    });
    addEvent(element, 'keyup', (e) => {
      dispatch(e);
      clearModifier(e);
    });
  }
}

const _api = {
  setScope,
  getScope,
  deleteScope,
  getPressedKeyCodes,
  isPressed,
  filter,
  unbind,
  update
};
for (const a in _api) {
  if (Object.prototype.hasOwnProperty.call(_api, a)) {
    hotkeys[a] = _api[a];
  }
}

if (typeof window !== 'undefined') {
  const _hotkeys = window.hotkeys;
  hotkeys.noConflict = (deep) => {
    if (deep && window.hotkeys === hotkeys) {
      window.hotkeys = _hotkeys;
    }
    return hotkeys;
  };
  window.hotkeys = hotkeys;
}
// src/level.js
function Level() {
}

Level.create = function() {
	var level = new Level();
	level.objects = [];
	return level;
}

Level.prototype.init = function() {
	var json = this.json;
	for(var i = 0; i < json.items.length; i++) {
		var item = json.items[i];
		
	    IUIU.Module.load(item.fileName, function (sender) {
	    	var json2 = sender.data;
	    	var content = sender.src;
	    	
	        var obj = null;
	    	for(var x = 0; x < content.objects.length; x++) {
	    		var obj2 = content.objects[x];
	    		if(obj2.name == item.name) {
	    			obj = obj2;
	    		}
	    	}
	        	    	
			if(obj != null) {
				try {
	            	Common.copy(obj, IUIU.Component.create(json2.header), false);
	    		}
	        	catch(ex) {
	            	//obj = createErrorObject();
	    		}
				
		        obj.fileName = json2.fileName;
		        obj.header = json2.header;
		        
		        for (var property in json2) {
		            var value = json2[property];
		            var type = typeof value;
		            if (obj[property] && (type == "number" || type == "boolean" || type == "string")) {
		                obj[property] = json2[property];
		            }
		        }
		        
		        content.objects.push(obj);
		    }

	    }, { data : item, src : level });
	}
	
	delete this.json;
}

Level.fromJson = function(json, params, entry) {
	var level = entry;
	
	for(var i = 0; i < json.items.length; i++) {
		level.objects.push({ name : json.items[i].name });
	}
	
	level.json = json;
		
	for(var i = 0; i < json.trigger.length; i++) {
		Trigger.load(level, json.trigger[i]);
	}

	return level;
}
// src/loader.js
var parseINIString = function (data){ 
    var regex = { 
        section: /^\s*\[\s*([^\]]*)\s*\]\s*$/, 
        param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/, 
        comment: /^\s*;.*$/ 
    }; 
    var value = {}; 
    var lines = data.split(/\r\n|\r|\n/); 
    var section = null; 
    lines.forEach(function(line){ 
    if(regex.comment.test(line)){ 
        return; 
    }else if(regex.param.test(line)){ 
        var match = line.match(regex.param); 
        if(section){ 
            value[section][match[1]] = match[2]; 
        }else{ 
            value[match[1]] = match[2]; 
        } 
    }else if(regex.section.test(line)){ 
        var match = line.match(regex.section); 
        value[match[1]] = {}; 
        section = match[1]; 
    }else if(line.length == 0 && section){ 
        section = null; 
    }; 
    });
    
    return value; 
}

function IniLoader(loader) {
    this.loader = loader;
};
IniLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params) {
        return parseINIString(buffer);
    }
};

function PackageLoader(loader) {
    this.loader = loader;
}
PackageLoader.prototype = {
    responseType : 'arraybuffer',
    load : function(buffer, params) {
        if(buffer) {
            var content = {};
            var dataView = new DataView(buffer);
            var originalBuffer = readHeader(content, dataView);
            
            // 解压缩文件
            if(content.flags == 1) {
                var compressed = new Uint8Array(buffer, originalBuffer.position, originalBuffer.length);
                var decompressed = lz4.decompress(compressed)
                var arrayBuffer = new ArrayBuffer(decompressed.length);
                for(var i = 0; i < decompressed.length; i++) {
                    arrayBuffer[i] = decompressed[i];
                }
                
                originalBuffer = new BinaryReader(new DataView(arrayBuffer), 0, arrayBuffer.length);
            }

            // 读取实际内容
            readContent(content, originalBuffer);
        }
        else {
            // 失效的资源
            //content.valid = false;
            //content.errorMessage = '无效的资产源:' + content.src;
        }
    },
    readHeader : function(content, buffer) {
        var br = new BinaryReader(buffer);
        // 头校验
        var r = br.readChar();
        var e = br.readChar();
        var s = br.readChar();

        if(r != 'm' || e != 'r' || s != 'f') {
            throw '存在无效包文件';
        }

        // 读取平台
        var platform = br.readByte();
        
        // 读取文件格式
        var format = br.readByte();
        
        // 读取flags
        var flags = br.readByte();
        
        // 读取内容大小
        var contentSize = br.readInt32();

        // 预存数据
        var holdSize = br.readInt32();

        content.platform = platform;
        content.format = format;
        content.flags = flags;
        content.contentSize = contentSize;

        // 返回压缩数据大小
        return new BinaryReader(buffer, br.position, content.contentSize);
    },
    readContent : function(content, buffer) {
        var header = {};
        header.name = buffer.readString();
        header.version = {};
        header.version.major = buffer.readInt32();
        header.version.minor = buffer.readInt32();
        header.version.build = buffer.readInt32();
        header.version.revision = buffer.readInt32();
        
        var iconData = buffer.readString();
        var description = buffer.readString();
        var references = [];
        var files = [];
        
        var count = buffer.readInt32();
        for(var i = 0; i < count; i++) {
            var header2 = {};
            header2.name = buffer.readString();
            header2.version = {};
            header2.version.major = buffer.readInt32();
            header2.version.minor = buffer.readInt32();
            header2.version.build = buffer.readInt32();
            header2.version.revision = buffer.readInt32();
            
            references.push({ header : header2 });
        }
        
        count = buffer.readInt32();
        for(var i = 0; i < count;i ++) {
            var inculde = buffer.readString();
            var data = buffer.readString();
            files.push({ inculde : inculde, data : data });
        }
        
        content.header = header;
        //content.description = description;
        //content.
        content.files = files;
        content.references = reference;
    }
};

function JsonLoader(loader) {
    this.loader = loader;
}
JsonLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return jsonObj;
    }
}

function AnimationLoader(loader) {
    this.loader = loader;
}
AnimationLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return Object.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Object.create();
    }
}

function SectionLoader(loader) {
    this.loader = loader;
}
SectionLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return Tile.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Tile.create();
    }
}

function LevelLoader(loader) {
    this.loader = loader;
}
LevelLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return Level.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Level.create();
    }
}

function MapLoader(loader) {
    this.loader = loader;
}

MapLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return Map.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Map.create();
    }
};

function FontLoader(loader) {
    this.loader = loader;
}

FontLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return Font.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Font.create();
    }
};

function Loader(domain) {
    this.domain = domain;
    this.loadedContents = {};
    //this.checklist = window.localStorage.domain
    
    // modes
    this.loaders = {};
    this.addMode('pak', new PackageLoader(this));
    this.addMode('ini', new IniLoader(this));
    this.addMode('json', new JsonLoader(this));
    this.addMode("ani", new AnimationLoader(this));
    this.addMode("img", new SectionLoader(this));
    //this.addMode("level", new LevelLoader(this));
    this.addMode("map", new MapLoader(this));
    this.addMode("font", new FontLoader(this));
}

Loader.prototype = {
    // ### .addMode(name, loader)
    // @param loader
    //          method load
    addMode : function(name, loader) {
        this.loaders[name] = loader;
    },
    
    // ### .load(fileName[, type])
    // @param type
    //          content
    //          ini 
    //          image
    load : function(fileName, userToken, callback, params) {
        var scope = this;
        var fileNameExt = fileName.lastIndexOf(".");//取到文件名开始到最后一个点的长度
        var fileNameLength = fileName.length;//取到文件名长度
        var fileFormat = fileName.substring(fileNameExt + 1, fileNameLength);//截
        
        var type = fileFormat;
        var loader = this.loaders[type];
        
        // object cache
        if(!this.loadedContents[fileName])
            this.loadedContents[fileName] = { status : 'error', params : params, callbacks : [], content : loader.create() };
        
        var content = this.loadedContents[fileName];            
        if(content.status == 'error') {            
            if(loader) {
                if(callback) content.callbacks.push(callback);
                
                content.src = fileName;
                content.status = 'loading';
                content.userToken = userToken;
                content.type = type;
                if(loader.responseType) {
                    var request = new XMLHttpRequest();
                    request.responseType = loader.responseType;
                    request.open("GET", (this.domain != null ? this.domain + '/' : '') + fileName); // + (cache ? '' : '?' + new Date().toString()), true);
                    request.content = content;
                    request.loader = loader;
                    if(!request.loader) {
                        throw 'no dencoder';
                    }
                    
                    request.onload = function(e) {
                        var loader = e.currentTarget.loader;
                        var content = e.currentTarget.content;
                        try {
                            //content.md5 = CryptoJS.MD5(e.currentTarget.response);
                            content.content = loader.load(e.currentTarget.response, content.params, content.content);
                            content.status = 'loaded';
                        }
                        catch(error) {
                            content.status = 'error';
                            if(content.onerror) 
                                content.onerror(content);
                        }
                            
                        if(content.status == 'loaded') {
                            for(var i = 0; i < content.callbacks.length; i++) {
                                content.callbacks[i](content);
                            }
                            content.callbacks = [];
                        }
                    };
                    request.onerror = function(e) {
                        var content = e.currentTarget.content;
                        content.status = 'error';
                        if(content.onerror) 
                            content.onerror(content);
                        //content.errorMessage = 'Error ' + e.target.status + ' occurred while receiving the document.'
                    };
                    request.send();
                    
                    // 如果是同步资源
                    if(request.loader.sync) {
                        // 暂停循环
                        
                    }
                } else {
                    throw 'responseType';
                    //content.content = loader.load(fileName);
                }
            } else {
                throw 'unkonwn response type';
            }
        }
        else if(content.status == "loading") {
            if(callback) content.callbacks.push(callback);
        }
        else if(content.status == 'loaded') {
            if(callback) callback(content);
        }
        
        return content.content;
    }
};

// src/lz4.js
/*! lz4.js v0.3.3 Released under the MIT license. https://github.com/ukyo/lz4.js/LICENSE */var lz4={};(function(){
var c;c||(c=eval("(function() { try { return Module || {} } catch(e) { return {} } })()"));var l={},n;for(n in c)c.hasOwnProperty(n)&&(l[n]=c[n]);var q="object"===typeof window,v="function"===typeof importScripts,w="object"===typeof process&&"function"===typeof require&&!q&&!v,aa=!q&&!w&&!v;
if(w){c.print||(c.print=function(a){process.stdout.write(a+"\n")});c.printErr||(c.printErr=function(a){process.stderr.write(a+"\n")});var ba=require("fs"),ca=require("path");c.read=function(a,b){a=ca.normalize(a);var d=ba.readFileSync(a);d||a==ca.resolve(a)||(a=path.join(__dirname,"..","src",a),d=ba.readFileSync(a));d&&!b&&(d=d.toString());return d};c.readBinary=function(a){a=c.read(a,!0);a.buffer||(a=new Uint8Array(a));assert(a.buffer);return a};c.load=function(a){da(read(a))};c.thisProgram||(c.thisProgram=
1<process.argv.length?process.argv[1].replace(/\\/g,"/"):"unknown-program");c.arguments=process.argv.slice(2);"undefined"!==typeof module&&(module.exports=c);process.on("uncaughtException",function(a){if(!(a instanceof x))throw a;});c.inspect=function(){return"[Emscripten Module object]"}}else if(aa)c.print||(c.print=print),"undefined"!=typeof printErr&&(c.printErr=printErr),c.read="undefined"!=typeof read?read:function(){throw"no read() available (jsc?)";},c.readBinary=function(a){if("function"===
typeof readbuffer)return new Uint8Array(readbuffer(a));a=read(a,"binary");assert("object"===typeof a);return a},"undefined"!=typeof scriptArgs?c.arguments=scriptArgs:"undefined"!=typeof arguments&&(c.arguments=arguments),eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined");else if(q||v)c.read=function(a){var b=new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},"undefined"!=typeof arguments&&(c.arguments=arguments),"undefined"!==
typeof console?(c.print||(c.print=function(a){console.log(a)}),c.printErr||(c.printErr=function(a){console.log(a)})):c.print||(c.print=function(){}),v&&(c.load=importScripts),"undefined"===typeof c.setWindowTitle&&(c.setWindowTitle=function(a){document.title=a});else throw"Unknown runtime environment. Where are we?";function da(a){eval.call(null,a)}!c.load&&c.read&&(c.load=function(a){da(c.read(a))});c.print||(c.print=function(){});c.printErr||(c.printErr=c.print);c.arguments||(c.arguments=[]);
c.thisProgram||(c.thisProgram="./this.program");c.print=c.print;c.K=c.printErr;c.preRun=[];c.postRun=[];for(n in l)l.hasOwnProperty(n)&&(c[n]=l[n]);
var z={ja:function(a){ea=a},ha:function(){return ea},T:function(){return y},S:function(a){y=a},Q:function(a){switch(a){case "i1":case "i8":return 1;case "i16":return 2;case "i32":return 4;case "i64":return 8;case "float":return 4;case "double":return 8;default:return"*"===a[a.length-1]?z.F:"i"===a[0]?(a=parseInt(a.substr(1)),assert(0===a%8),a/8):0}},ga:function(a){return Math.max(z.Q(a),z.F)},la:16,xa:function(a,b){"double"===b||"i64"===b?a&7&&(assert(4===(a&7)),a+=4):assert(0===(a&3));return a},
ra:function(a,b,d){return d||"i64"!=a&&"double"!=a?a?Math.min(b||(a?z.ga(a):0),z.F):Math.min(b,8):8},I:function(a,b,d){return d&&d.length?(d.splice||(d=Array.prototype.slice.call(d)),d.splice(0,0,b),c["dynCall_"+a].apply(null,d)):c["dynCall_"+a].call(null,b)},C:[],V:function(a){for(var b=0;b<z.C.length;b++)if(!z.C[b])return z.C[b]=a,2*(1+b);throw"Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.";},ia:function(a){z.C[(a-2)/2]=null},r:function(a){z.r.L||
(z.r.L={});z.r.L[a]||(z.r.L[a]=1,c.K(a))},J:{},ta:function(a,b){assert(b);z.J[b]||(z.J[b]={});var d=z.J[b];d[a]||(d[a]=function(){return z.I(b,a,arguments)});return d[a]},sa:function(){throw"You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work";},D:function(a){var b=y;y=y+a|0;y=y+15&-16;return b},ka:function(a){var b=A;A=A+a|0;A=A+15&-16;return b},B:function(a){var b=C;C=C+a|0;C=C+15&-16;if(a=C>=D)E("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+
D+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 "),a=!0;return a?(C=b,0):b},G:function(a,b){return Math.ceil(a/(b?b:16))*(b?b:16)},wa:function(a,b,d){return d?+(a>>>0)+4294967296*+(b>>>0):+(a>>>0)+4294967296*+(b|0)},U:8,F:4,ma:0};z.addFunction=z.V;
z.removeFunction=z.ia;var F=!1,G,H,ea;function assert(a,b){a||E("Assertion failed: "+b)}(function(){var a={stackSave:function(){z.T()},stackRestore:function(){z.S()},arrayToC:function(a){for(var b=z.D(a.length),d=b,h=0;h<a.length;h++)I[d++>>0]=a[h];return b},stringToC:function(a){var b=0;null!==a&&void 0!==a&&0!==a&&(b=z.D((a.length<<2)+1),fa(a,b));return b}},b=/^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/,d;for(d in a)a.hasOwnProperty(d)&&a[d].toString().match(b).slice(1)})();
function ga(a){var b;b="i32";"*"===b.charAt(b.length-1)&&(b="i32");switch(b){case "i1":return I[a>>0];case "i8":return I[a>>0];case "i16":return J[a>>1];case "i32":return K[a>>2];case "i64":return K[a>>2];case "float":return L[a>>2];case "double":return M[a>>3];default:E("invalid type for setValue: "+b)}return null}
function N(a,b,d,e){var g,k;"number"===typeof a?(g=!0,k=a):(g=!1,k=a.length);var h="string"===typeof b?b:null;d=4==d?e:[O,z.D,z.ka,z.B][void 0===d?2:d](Math.max(k,h?1:b.length));if(g){e=d;assert(0==(d&3));for(a=d+(k&-4);e<a;e+=4)K[e>>2]=0;for(a=d+k;e<a;)I[e++>>0]=0;return d}if("i8"===h)return a.subarray||a.slice?P.set(a,d):P.set(new Uint8Array(a),d),d;e=0;for(var f,u;e<k;){var m=a[e];"function"===typeof m&&(m=z.ua(m));g=h||b[e];if(0===g)e++;else{"i64"==g&&(g="i32");var p=d+e,t=g,t=t||"i8";"*"===t.charAt(t.length-
1)&&(t="i32");switch(t){case "i1":I[p>>0]=m;break;case "i8":I[p>>0]=m;break;case "i16":J[p>>1]=m;break;case "i32":K[p>>2]=m;break;case "i64":H=[m>>>0,(G=m,1<=+ha(G)?0<G?(ja(+ka(G/4294967296),4294967295)|0)>>>0:~~+la((G-+(~~G>>>0))/4294967296)>>>0:0)];K[p>>2]=H[0];K[p+4>>2]=H[1];break;case "float":L[p>>2]=m;break;case "double":M[p>>3]=m;break;default:E("invalid type for setValue: "+t)}u!==g&&(f=z.Q(g),u=g);e+=f}}return d}
function ma(a){var b;if(0===b||!a)return"";for(var d=0,e,g=0;;){e=P[a+g>>0];d|=e;if(0==e&&!b)break;g++;if(b&&g==b)break}b||(b=g);e="";if(128>d){for(;0<b;)d=String.fromCharCode.apply(String,P.subarray(a,a+Math.min(b,1024))),e=e?e+d:d,a+=1024,b-=1024;return e}return c.UTF8ToString(a)}
function na(a){function b(d,e,g){e=e||Infinity;var t="",k=[],h;if("N"===a[f]){f++;"K"===a[f]&&f++;for(h=[];"E"!==a[f];)if("S"===a[f]){f++;var r=a.indexOf("_",f);h.push(m[a.substring(f,r)||0]||"?");f=r+1}else if("C"===a[f])h.push(h[h.length-1]),f+=2;else{var r=parseInt(a.substr(f)),B=r.toString().length;if(!r||!B){f--;break}var ia=a.substr(f+B,r);h.push(ia);m.push(ia);f+=B+r}f++;h=h.join("::");e--;if(0===e)return d?[h]:h}else if(("K"===a[f]||p&&"L"===a[f])&&f++,r=parseInt(a.substr(f)))B=r.toString().length,
h=a.substr(f+B,r),f+=B+r;p=!1;"I"===a[f]?(f++,r=b(!0),B=b(!0,1,!0),t+=B[0]+" "+h+"<"+r.join(", ")+">"):t=h;a:for(;f<a.length&&0<e--;)if(h=a[f++],h in u)k.push(u[h]);else switch(h){case "P":k.push(b(!0,1,!0)[0]+"*");break;case "R":k.push(b(!0,1,!0)[0]+"&");break;case "L":f++;r=a.indexOf("E",f)-f;k.push(a.substr(f,r));f+=r+2;break;case "A":r=parseInt(a.substr(f));f+=r.toString().length;if("_"!==a[f])throw"?";f++;k.push(b(!0,1,!0)[0]+" ["+r+"]");break;case "E":break a;default:t+="?"+h;break a}g||1!==
k.length||"void"!==k[0]||(k=[]);return d?(t&&k.push(t+"?"),k):t+("("+k.join(", ")+")")}var d=!!c.___cxa_demangle;if(d)try{var e=O(a.length);fa(a.substr(1),e);var g=O(4),k=c.___cxa_demangle(e,0,0,g);if(0===ga(g)&&k)return ma(k)}catch(h){}finally{e&&Q(e),g&&Q(g),k&&Q(k)}var f=3,u={v:"void",b:"bool",c:"char",s:"short",i:"int",l:"long",f:"float",d:"double",w:"wchar_t",a:"signed char",h:"unsigned char",t:"unsigned short",j:"unsigned int",m:"unsigned long",x:"long long",y:"unsigned long long",z:"..."},
m=[],p=!0,e=a;try{if("Object._main"==a||"_main"==a)return"main()";"number"===typeof a&&(a=ma(a));if("_"!==a[0]||"_"!==a[1]||"Z"!==a[2])return a;switch(a[3]){case "n":return"operator new()";case "d":return"operator delete()"}e=b()}catch(t){e+="?"}0<=e.indexOf("?")&&!d&&z.r("warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");return e}
function oa(){return pa().replace(/__Z[\w\d_]+/g,function(a){var b=na(a);return a===b?a:a+" ["+b+"]"})}function pa(){var a=Error();if(!a.stack){try{throw Error(0);}catch(b){a=b}if(!a.stack)return"(no stack trace available)"}return a.stack.toString()}function qa(){var a=C;0<a%4096&&(a+=4096-a%4096);return a}for(var I,P,J,ra,K,sa,L,M,ta=0,A=0,ua=0,y=0,R=0,va=0,C=0,wa=c.TOTAL_STACK||5242880,D=c.TOTAL_MEMORY||33554432,S=65536;S<D||S<2*wa;)S=16777216>S?2*S:S+16777216;S!==D&&(D=S);
assert("undefined"!==typeof Int32Array&&"undefined"!==typeof Float64Array&&!!(new Int32Array(1)).subarray&&!!(new Int32Array(1)).set,"JS engine does not provide full typed array support");var buffer;buffer=new ArrayBuffer(D);I=new Int8Array(buffer);J=new Int16Array(buffer);K=new Int32Array(buffer);P=new Uint8Array(buffer);ra=new Uint16Array(buffer);sa=new Uint32Array(buffer);L=new Float32Array(buffer);M=new Float64Array(buffer);K[0]=255;assert(255===P[0]&&0===P[3],"Typed arrays 2 must be run on a little-endian system");
c.HEAP=void 0;c.buffer=buffer;c.HEAP8=I;c.HEAP16=J;c.HEAP32=K;c.HEAPU8=P;c.HEAPU16=ra;c.HEAPU32=sa;c.HEAPF32=L;c.HEAPF64=M;function T(a){for(;0<a.length;){var b=a.shift();if("function"==typeof b)b();else{var d=b.qa;"number"===typeof d?void 0===b.H?z.I("v",d):z.I("vi",d,[b.H]):d(void 0===b.H?null:b.H)}}}var U=[],V=[],xa=[],ya=[],za=[],W=!1;function Aa(){var a=c.preRun.shift();U.unshift(a)}
function Ba(a,b){for(var d=0,e=0;e<a.length;++e){var g=a.charCodeAt(e);55296<=g&&57343>=g&&(g=65536+((g&1023)<<10)|a.charCodeAt(++e)&1023);127>=g?++d:d=2047>=g?d+2:65535>=g?d+3:2097151>=g?d+4:67108863>=g?d+5:d+6}d=Array(d+1);var k=d.length,e=0;if(0<k){for(var g=e,k=e+k-1,h=0;h<a.length;++h){var f=a.charCodeAt(h);55296<=f&&57343>=f&&(f=65536+((f&1023)<<10)|a.charCodeAt(++h)&1023);if(127>=f){if(e>=k)break;d[e++]=f}else{if(2047>=f){if(e+1>=k)break;d[e++]=192|f>>6}else{if(65535>=f){if(e+2>=k)break;d[e++]=
224|f>>12}else{if(2097151>=f){if(e+3>=k)break;d[e++]=240|f>>18}else{if(67108863>=f){if(e+4>=k)break;d[e++]=248|f>>24}else{if(e+5>=k)break;d[e++]=252|f>>30;d[e++]=128|f>>24&63}d[e++]=128|f>>18&63}d[e++]=128|f>>12&63}d[e++]=128|f>>6&63}d[e++]=128|f&63}}d[e]=0;e=e-g}else e=0;b&&(d.length=e);return d}function fa(a,b){for(var d=Ba(a,void 0),e=0;e<d.length;)I[b+e>>0]=d[e],e+=1}
Math.imul&&-5===Math.imul(4294967295,5)||(Math.imul=function(a,b){var d=a&65535,e=b&65535;return d*e+((a>>>16)*e+d*(b>>>16)<<16)|0});Math.va=Math.imul;Math.clz32||(Math.clz32=function(a){a=a>>>0;for(var b=0;32>b;b++)if(a&1<<31-b)return b;return 32});Math.oa=Math.clz32;var ha=Math.abs,la=Math.ceil,ka=Math.floor,ja=Math.min;c.preloadedImages={};c.preloadedAudios={};
var Ca=[function(a,b){a:for(var d=b,e=P,g,k,h,f,u,m,p="";;){g=e[d++];if(!g)break a;g&128?(k=e[d++]&63,192==(g&224)?p+=String.fromCharCode((g&31)<<6|k):(h=e[d++]&63,224==(g&240)?g=(g&15)<<12|k<<6|h:(f=e[d++]&63,240==(g&248)?g=(g&7)<<18|k<<12|h<<6|f:(u=e[d++]&63,248==(g&252)?g=(g&3)<<24|k<<18|h<<12|f<<6|u:(m=e[d++]&63,g=(g&1)<<30|k<<24|h<<18|f<<12|u<<6|m))),65536>g?p+=String.fromCharCode(g):(g-=65536,p+=String.fromCharCode(55296|g>>10,56320|g&1023)))):p+=String.fromCharCode(g)}X[a].n=Error(p)},function(a,
b,d){X[a].A(b,d)},function(a,b,d){return X[a].u(b,d)}],ta=8,A=ta+1296;V.push();
N([0,32,0,0,0,0,0,0,0,0,0,0,36,3,0,0,47,3,0,0,61,3,0,0,88,3,0,0,112,3,0,0,146,3,0,0,177,3,0,0,203,3,0,0,235,3,0,0,2,4,0,0,26,4,0,0,49,4,0,0,75,4,0,0,104,4,0,0,128,4,0,0,150,4,0,0,169,4,0,0,195,4,0,0,224,4,0,0,254,4,0,0,0,0,1,0,0,0,4,0,0,0,16,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,114,101,116,117,114,110,
32,76,90,52,74,83,95,114,101,97,100,40,36,48,44,32,36,49,44,32,36,50,41,125,0,123,76,90,52,74,83,95,119,114,105,116,101,40,36,48,44,32,36,49,44,32,36,50,41,125,0,123,76,90,52,74,83,95,101,114,114,111,114,40,36,48,44,32,36,49,41,125,0,79,75,95,78,111,69,114,114,111,114,0,69,82,82,79,82,95,71,69,78,69,82,73,67,0,69,82,82,79,82,95,109,97,120,66,108,111,99,107,83,105,122,101,95,105,110,118,97,108,105,100,0,69,82,82,79,82,95,98,108,111,99,107,77,111,100,101,95,105,110,118,97,108,105,100,0,69,82,82,79,
82,95,99,111,110,116,101,110,116,67,104,101,99,107,115,117,109,70,108,97,103,95,105,110,118,97,108,105,100,0,69,82,82,79,82,95,99,111,109,112,114,101,115,115,105,111,110,76,101,118,101,108,95,105,110,118,97,108,105,100,0,69,82,82,79,82,95,104,101,97,100,101,114,86,101,114,115,105,111,110,95,119,114,111,110,103,0,69,82,82,79,82,95,98,108,111,99,107,67,104,101,99,107,115,117,109,95,117,110,115,117,112,112,111,114,116,101,100,0,69,82,82,79,82,95,114,101,115,101,114,118,101,100,70,108,97,103,95,115,101,
116,0,69,82,82,79,82,95,97,108,108,111,99,97,116,105,111,110,95,102,97,105,108,101,100,0,69,82,82,79,82,95,115,114,99,83,105,122,101,95,116,111,111,76,97,114,103,101,0,69,82,82,79,82,95,100,115,116,77,97,120,83,105,122,101,95,116,111,111,83,109,97,108,108,0,69,82,82,79,82,95,102,114,97,109,101,72,101,97,100,101,114,95,105,110,99,111,109,112,108,101,116,101,0,69,82,82,79,82,95,102,114,97,109,101,84,121,112,101,95,117,110,107,110,111,119,110,0,69,82,82,79,82,95,102,114,97,109,101,83,105,122,101,95,
119,114,111,110,103,0,69,82,82,79,82,95,115,114,99,80,116,114,95,119,114,111,110,103,0,69,82,82,79,82,95,100,101,99,111,109,112,114,101,115,115,105,111,110,70,97,105,108,101,100,0,69,82,82,79,82,95,104,101,97,100,101,114,67,104,101,99,107,115,117,109,95,105,110,118,97,108,105,100,0,69,82,82,79,82,95,99,111,110,116,101,110,116,67,104,101,99,107,115,117,109,95,105,110,118,97,108,105,100,0,69,82,82,79,82,95,109,97,120,67,111,100,101,0],"i8",4,z.U);var Da=z.G(N(12,"i8",2),8);assert(0==Da%8);
c._i64Subtract=Ea;c._i64Add=Fa;c._memset=Ga;c._bitshift64Lshr=Ha;c._bitshift64Shl=Ia;c._memcpy=Ja;function Ka(a){c.___errno_location&&(K[c.___errno_location()>>2]=a);return a}function Y(a){Y.fa||(C=qa(),Y.fa=!0,assert(z.B),Y.ea=z.B,z.B=function(){E("cannot dynamically allocate, sbrk now has control")});var b=C;return 0==a||Y.ea(a)?b:4294967295}c._memmove=La;
var Ma=N([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,
1,0,3,0,1,0,2,0,1,0],"i8",2);c._llvm_cttz_i32=Na;ua=y=z.G(A);R=ua+wa;va=C=z.G(R);assert(va<D,"TOTAL_MEMORY not big enough for stack");c.W={Math:Math,Int8Array:Int8Array,Int16Array:Int16Array,Int32Array:Int32Array,Uint8Array:Uint8Array,Uint16Array:Uint16Array,Uint32Array:Uint32Array,Float32Array:Float32Array,Float64Array:Float64Array,NaN:NaN,Infinity:Infinity};
c.X={abort:E,assert:assert,invoke_iiiiiii:function(a,b,d,e,g,k,h){try{return c.dynCall_iiiiiii(a,b,d,e,g,k,h)}catch(f){if("number"!==typeof f&&"longjmp"!==f)throw f;Z.setThrew(1,0)}},_sysconf:function(a){switch(a){case 30:return 4096;case 85:return S/4096;case 132:case 133:case 12:case 137:case 138:case 15:case 235:case 16:case 17:case 18:case 19:case 20:case 149:case 13:case 10:case 236:case 153:case 9:case 21:case 22:case 159:case 154:case 14:case 77:case 78:case 139:case 80:case 81:case 82:case 68:case 67:case 164:case 11:case 29:case 47:case 48:case 95:case 52:case 51:case 46:return 200809;
case 79:return 0;case 27:case 246:case 127:case 128:case 23:case 24:case 160:case 161:case 181:case 182:case 242:case 183:case 184:case 243:case 244:case 245:case 165:case 178:case 179:case 49:case 50:case 168:case 169:case 175:case 170:case 171:case 172:case 97:case 76:case 32:case 173:case 35:return-1;case 176:case 177:case 7:case 155:case 8:case 157:case 125:case 126:case 92:case 93:case 129:case 130:case 131:case 94:case 91:return 1;case 74:case 60:case 69:case 70:case 4:return 1024;case 31:case 42:case 72:return 32;
case 87:case 26:case 33:return 2147483647;case 34:case 1:return 47839;case 38:case 36:return 99;case 43:case 37:return 2048;case 0:return 2097152;case 3:return 65536;case 28:return 32768;case 44:return 32767;case 75:return 16384;case 39:return 1E3;case 89:return 700;case 71:return 256;case 40:return 255;case 2:return 100;case 180:return 64;case 25:return 20;case 5:return 16;case 6:return 6;case 73:return 4;case 84:return"object"===typeof navigator?navigator.hardwareConcurrency||1:1}Ka(22);return-1},
_pthread_self:function(){return 0},_abort:function(){c.abort()},___setErrNo:Ka,_sbrk:Y,_time:function(a){var b=Date.now()/1E3|0;a&&(K[a>>2]=b);return b},_emscripten_memcpy_big:function(a,b,d){P.set(P.subarray(b,b+d),a);return a},_emscripten_asm_const_3:function(a,b,d,e){return Ca[a](b,d,e)},_emscripten_asm_const_2:function(a,b,d){return Ca[a](b,d)},STACKTOP:y,STACK_MAX:R,tempDoublePtr:Da,ABORT:F,cttz_i8:Ma};// EMSCRIPTEN_START_ASM

var Z=(function(global,env,buffer) {
"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=0;var o=0;var p=0;var q=0;var r=global.NaN,s=global.Infinity;var t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0.0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=global.Math.floor;var N=global.Math.abs;var O=global.Math.sqrt;var P=global.Math.pow;var Q=global.Math.cos;var R=global.Math.sin;var S=global.Math.tan;var T=global.Math.acos;var U=global.Math.asin;var V=global.Math.atan;var W=global.Math.atan2;var X=global.Math.exp;var Y=global.Math.log;var Z=global.Math.ceil;var _=global.Math.imul;var $=global.Math.min;var aa=global.Math.clz32;var ba=env.abort;var ca=env.assert;var da=env.invoke_iiiiiii;var ea=env._sysconf;var fa=env._pthread_self;var ga=env._abort;var ha=env.___setErrNo;var ia=env._sbrk;var ja=env._time;var ka=env._emscripten_memcpy_big;var la=env._emscripten_asm_const_3;var ma=env._emscripten_asm_const_2;var na=0.0;
// EMSCRIPTEN_START_FUNCS
function pa(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+15&-16;return b|0}function qa(){return i|0}function ra(a){a=a|0;i=a}function sa(a,b){a=a|0;b=b|0;i=a;j=b}function ta(a,b){a=a|0;b=b|0;if(!n){n=a;o=b}}function ua(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0]}function va(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0];a[k+4>>0]=a[b+4>>0];a[k+5>>0]=a[b+5>>0];a[k+6>>0]=a[b+6>>0];a[k+7>>0]=a[b+7>>0]}function wa(a){a=a|0;C=a}function xa(){return C|0}function ya(){c[3]=_a(8192)|0;c[4]=_a(8192)|0;return}function za(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=_a(64)|0;f=_a(152)|0;if(!f){$a(g);g=0;return g|0}if(c[f+-4>>2]&3)db(f|0,0,152)|0;c[f+56>>2]=100;c[f+60>>2]=0;c[g+4>>2]=f;f=g+8|0;c[f>>2]=a;c[g+12>>2]=b;c[g+16>>2]=d;d=g+20|0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;c[g+40>>2]=e;d=g+44|0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;f=Ha(8192,f)|0;if(f>>>0<=(c[2]|0)>>>0)return g|0;$a(c[4]|0);c[2]=f;c[4]=_a(f)|0;return g|0}function Aa(a){a=a|0;var b=0;b=c[a+4>>2]|0;if(!b){$a(a);return}$a(c[b+144>>2]|0);$a(c[b+72>>2]|0);$a(b);$a(a);return}function Ba(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;k=c[b+4>>2]|0;l=c[4]|0;d=b+8|0;do if((c[2]|0)>>>0>=15){m=k+60|0;if(!(c[m>>2]|0)){f=k;e=f+56|0;do{c[f>>2]=c[d>>2];f=f+4|0;d=d+4|0}while((f|0)<(e|0));j=k+32|0;d=(c[j>>2]|0)<3?1:2;e=k+148|0;if((c[e>>2]|0)>>>0<d>>>0){f=k+144|0;$a(c[f>>2]|0);if((c[j>>2]|0)<3){g=_a(16416)|0;if((g|0)!=0?(c[g+-4>>2]&3|0)!=0:0)db(g|0,0,16416)|0;db(g|0,0,16416)|0;c[f>>2]=g}else c[f>>2]=_a(262192)|0;c[e>>2]=d}d=c[k>>2]|0;if(d){d=d+-4|0;if(d>>>0>3)d=-2;else h=14}else{c[k>>2]=4;d=0;h=14}if((h|0)==14)d=c[100+(d<<2)>>2]|0;c[k+64>>2]=d;i=k+4|0;f=(c[i>>2]|0)==0&1;f=(c[b+44>>2]|0)==0?d+(f<<17)|0:f<<16;d=k+68|0;if((c[d>>2]|0)>>>0<f>>>0){c[d>>2]=f;e=k+72|0;$a(c[e>>2]|0);d=_a(f)|0;if(!d){c[e>>2]=d;d=-9;break}if(c[d+-4>>2]&3)db(d|0,0,f|0)|0;c[e>>2]=d}else d=c[k+72>>2]|0;c[k+76>>2]=d;c[k+80>>2]=0;d=k+96|0;c[k+104>>2]=0;c[d+12>>2]=606290984;c[k+112>>2]=-2048144777;c[d+20>>2]=0;c[k+120>>2]=1640531535;e=d;c[e>>2]=0;c[e+4>>2]=0;c[d+44>>2]=0;d=c[j>>2]|0;e=k+144|0;if((d|0)<3)db(c[e>>2]|0,0,16416)|0;else{j=c[e>>2]|0;c[j+262148>>2]=0;c[j+262172>>2]=d}g=l;a[g>>0]=4;a[g+1>>0]=34;a[g+2>>0]=77;a[g+3>>0]=24;h=g+4|0;f=k+16|0;d=f;a[h>>0]=c[i>>2]<<5&32|c[k+8>>2]<<2&4|(((c[d>>2]|0)!=0|(c[d+4>>2]|0)!=0)&1)<<3|64;d=g+6|0;a[g+5>>0]=c[k>>2]<<4&112;e=c[f>>2]|0;f=c[f+4>>2]|0;if((e|0)==0&(f|0)==0)e=7;else{a[d>>0]=e;d=eb(e|0,f|0,8)|0;a[g+7>>0]=d;d=eb(e|0,f|0,16)|0;a[g+8>>0]=d;d=eb(e|0,f|0,24)|0;a[g+9>>0]=d;a[g+10>>0]=f;d=eb(e|0,f|0,40)|0;a[g+11>>0]=d;d=eb(e|0,f|0,48)|0;a[g+12>>0]=d;e=eb(e|0,f|0,56)|0;a[g+13>>0]=e;e=k+88|0;c[e>>2]=0;c[e+4>>2]=0;e=15;d=g+14|0}a[d>>0]=Ia(h,d-h|0)|0;c[m>>2]=1;d=g+e-l|0;if(d>>>0<=4294967277){la(1,b|0,c[4]|0,d|0)|0;b=1;return b|0}}else d=-1}else d=-11;while(0);ma(0,b|0,c[20+(0-d<<2)>>2]|0)|0;b=0;return b|0}function Ca(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;y=i;i=i+16|0;p=y;s=c[a+4>>2]|0;t=c[4]|0;b=c[2]|0;u=c[3]|0;v=la(2,a|0,u|0,8192)|0;d=u;q=c[s+64>>2]|0;w=u+v|0;m=w;a:do if((c[s+60>>2]|0)==1)if(b>>>0>=(Ha(v,s)|0)>>>0){c[p>>2]=0;n=s+4|0;l=s+32|0;g=(c[n>>2]|0)==1;g=(c[l>>2]|0)<3?(g?1:2):g?3:4;r=s+80|0;b=c[r>>2]|0;do if(!b){b=t;f=0}else{e=q-b|0;d=s+76|0;b=(c[d>>2]|0)+b|0;if(e>>>0>v>>>0){gb(b|0,u|0,v|0)|0;c[r>>2]=(c[r>>2]|0)+v;b=t;f=0;d=m;break}gb(b|0,u|0,e|0)|0;b=t;b=b+(Ja(b,c[d>>2]|0,q,g,c[s+144>>2]|0,c[l>>2]|0)|0)|0;if(!(c[n>>2]|0))c[d>>2]=(c[d>>2]|0)+q;c[r>>2]=0;f=1;d=u+e|0}while(0);o=w;j=s+144|0;h=f;while(1){e=d;f=o-d|0;if(f>>>0<q>>>0)break;h=b;b=h+(Ja(h,e,q,g,c[j>>2]|0,c[l>>2]|0)|0)|0;h=2;d=e+q|0}k=s+36|0;if((c[k>>2]|0)!=0&e>>>0<w>>>0){g=b+(Ja(b,e,f,g,c[j>>2]|0,c[l>>2]|0)|0)|0;b=2;f=m}else{g=b;b=h;f=d}do if((c[n>>2]|0)==0&(b|0)==2){if(c[p>>2]|0){c[s+76>>2]=c[s+72>>2];break}b=Ka(s)|0;if(!b){b=-1;x=26;break a}c[s+76>>2]=(c[s+72>>2]|0)+b}while(0);d=s+76|0;b=c[d>>2]|0;e=s+72|0;if((b+q|0)>>>0>((c[e>>2]|0)+(c[s+68>>2]|0)|0)>>>0?(c[k>>2]|0)==0:0){b=Ka(s)|0;b=(c[e>>2]|0)+b|0;c[d>>2]=b}d=f;if(d>>>0<w>>>0){w=o-f|0;gb(b|0,d|0,w|0)|0;c[r>>2]=w}if((c[s+8>>2]|0)==1)Ra(s+96|0,u,v);b=s+88|0;w=b;w=cb(c[w>>2]|0,c[w+4>>2]|0,v|0,0)|0;c[b>>2]=w;c[b+4>>2]=C;b=g-t|0;if(b>>>0<=4294967277){la(1,a|0,c[4]|0,b|0)|0;x=1;i=y;return x|0}}else{b=-11;x=26}else{b=-1;x=26}while(0);ma(0,a|0,c[20+(0-b<<2)>>2]|0)|0;x=0;i=y;return x|0}function Da(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;j=c[b+4>>2]|0;k=c[4]|0;d=c[2]|0;if(c[j+80>>2]|0)if((c[j+60>>2]|0)==1){g=j+80|0;e=c[g>>2]|0;if(d>>>0>=(e+8|0)>>>0){f=j+4|0;d=c[j+32>>2]|0;l=(c[f>>2]|0)==1;m=k;h=j+76|0;e=m+(Ja(m,c[h>>2]|0,e,(d|0)<3?(l?1:2):l?3:4,c[j+144>>2]|0,d)|0)|0;if(!(c[f>>2]|0)){f=(c[h>>2]|0)+(c[g>>2]|0)|0;c[h>>2]=f}else f=c[h>>2]|0;c[g>>2]=0;d=j+72|0;if((f+(c[j+64>>2]|0)|0)>>>0>((c[d>>2]|0)+(c[j+68>>2]|0)|0)>>>0){m=Ka(j)|0;c[h>>2]=(c[d>>2]|0)+m}d=e-k|0;if(d>>>0<=4294967277)i=10}else d=-11}else d=-1;else{d=0;i=10}do if((i|0)==10){e=k;a[e+d>>0]=0;a[e+(d+1)>>0]=0;a[e+(d+2)>>0]=0;a[e+(d+3)>>0]=0;f=e+(d+4)|0;if((c[j+8>>2]|0)==1){m=Sa(j+96|0)|0;a[f>>0]=m;a[e+(d+5)>>0]=m>>>8;a[e+(d+6)>>0]=m>>>16;a[e+(d+7)>>0]=m>>>24;d=e+(d+8)|0}else d=f;c[j+60>>2]=0;f=j+16|0;e=c[f>>2]|0;f=c[f+4>>2]|0;if(!((e|0)==0&(f|0)==0)?(m=j+88|0,!((e|0)==(c[m>>2]|0)?(f|0)==(c[m+4>>2]|0):0)):0){d=-14;break}d=d-k|0;if(d>>>0<=4294967277){la(1,b|0,c[4]|0,d|0)|0;m=1;return m|0}}while(0);ma(0,b|0,c[20+(0-d<<2)>>2]|0)|0;m=0;return m|0}function Ea(){var a=0,b=0;a=_a(4)|0;b=_a(160)|0;if(!b){b=0;return b|0}if(c[b+-4>>2]&3)db(b|0,0,160)|0;c[b+32>>2]=100;c[a>>2]=b;if((c[2]|0)>>>0>=8192){b=a;return b|0}$a(c[4]|0);c[2]=8192;c[4]=_a(8192)|0;b=a;return b|0}function Fa(a){a=a|0;a=c[a>>2]|0;if(!a)return;$a(c[a+60>>2]|0);$a(c[a+72>>2]|0);$a(a);return}function Ga(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;X=i;i=i+16|0;V=X;N=la(2,b|0,c[3]|0,8192)|0;e=8192;U=0;a:while(1){D=c[b>>2]|0;O=c[4]|0;T=c[3]|0;S=T+U|0;T=T+N|0;F=O;B=F+e|0;c[V>>2]=0;I=D+56|0;M=c[I>>2]|0;if(!((M|0)==0|(S|0)==(M|0))){e=-15;W=99;break}m=D+36|0;n=T;o=D+64|0;p=D+68|0;q=D+60|0;r=D+48|0;s=B;t=D+8|0;u=D+16|0;v=D+4|0;w=D+40|0;x=D+96|0;G=D+88|0;J=D+92|0;y=D+84|0;z=D+144|0;K=D+76|0;L=D+80|0;M=D+72|0;A=D+148|0;E=1;l=O;H=1;k=0;j=S;b:while(1){if(!E)break;c:do switch(c[m>>2]|0){case 0:{h=j;e=n-j|0;if(e>>>0<=14){c[o>>2]=0;c[p>>2]=7;c[m>>2]=1;f=7;g=0;W=11;break c}e=La(D,h,e)|0;if(e>>>0>4294967277){W=99;break a}Z=k;Y=H;f=l;g=E;j=h+e|0;k=Z;H=Y;l=f;E=g;continue b}case 1:{e=n-j|0;h=j;f=c[p>>2]|0;g=c[o>>2]|0;W=11;break}case 2:if((n-j|0)>>>0>3){h=j;f=j+4|0;W=20;break c}else{c[o>>2]=0;c[m>>2]=3;W=17;break c}case 3:{W=17;break}case 4:{h=c[p>>2]|0;e=j;f=n-j|0;h=f>>>0<h>>>0?f:h;f=l;Z=s-l|0;h=Z>>>0<h>>>0?Z:h;gb(f|0,e|0,h|0)|0;if(c[t>>2]|0)Ra(x,e,h);Z=u;if(!((c[Z>>2]|0)==0&(c[Z+4>>2]|0)==0)){Y=w;Y=bb(c[Y>>2]|0,c[Y+4>>2]|0,h|0,0)|0;Z=w;c[Z>>2]=Y;c[Z+4>>2]=C}if(!(c[v>>2]|0))Ma(D,f,h,F,0);g=e+h|0;e=f+h|0;f=c[p>>2]|0;if((f|0)==(h|0)){c[m>>2]=2;h=k;Y=H;Z=E;l=e;j=g;k=h;H=Y;E=Z;continue b}else{H=f-h|0;c[p>>2]=H;Z=k;E=0;l=e;H=H+4|0;j=g;k=Z;continue b}}case 5:{e=c[p>>2]|0;if((n-j|0)>>>0<e>>>0){c[o>>2]=0;c[m>>2]=6;f=j;g=k;h=H;Y=l;Z=E;j=f;k=g;H=h;l=Y;E=Z;continue b}else{c[m>>2]=7;k=j;h=H;Y=l;Z=E;j=j+e|0;H=h;l=Y;E=Z;continue b}}case 6:{e=c[o>>2]|0;f=(c[p>>2]|0)-e|0;g=j;Z=n-j|0;f=f>>>0>Z>>>0?Z:f;gb((c[q>>2]|0)+e|0,g|0,f|0)|0;e=(c[o>>2]|0)+f|0;c[o>>2]=e;f=g+f|0;g=c[p>>2]|0;if(g>>>0>e>>>0){Y=k;Z=l;E=0;H=g-e+4|0;j=f;k=Y;l=Z;continue b}else{k=c[q>>2]|0;c[m>>2]=7;h=H;Y=l;Z=E;j=f;H=h;l=Y;E=Z;continue b}}case 7:if((s-l|0)>>>0<(c[r>>2]|0)>>>0){c[m>>2]=9;f=j;g=k;h=H;Y=l;Z=E;j=f;k=g;H=h;l=Y;E=Z;continue b}else{c[m>>2]=8;f=j;g=k;h=H;Y=l;Z=E;j=f;k=g;H=h;l=Y;E=Z;continue b}case 8:{e=l;f=oa[((c[v>>2]|0)==0?5:6)&7](k,e,c[p>>2]|0,c[r>>2]|0,c[K>>2]|0,c[L>>2]|0)|0;if((f|0)<0){e=-1;W=99;break a}if(c[t>>2]|0)Ra(x,e,f);Z=u;if(!((c[Z>>2]|0)==0&(c[Z+4>>2]|0)==0)){Y=w;Y=bb(c[Y>>2]|0,c[Y+4>>2]|0,f|0,((f|0)<0)<<31>>31|0)|0;Z=w;c[Z>>2]=Y;c[Z+4>>2]=C}if(!(c[v>>2]|0))Ma(D,e,f,F,0);c[m>>2]=2;g=j;h=k;Y=H;Z=E;l=e+f|0;j=g;k=h;H=Y;E=Z;continue b}case 9:{do if(!(c[v>>2]|0)){e=c[K>>2]|0;f=c[M>>2]|0;g=c[L>>2]|0;if((e|0)!=(f|0)){h=f+(g>>>0>65536?65536:g)|0;c[y>>2]=h;f=g;e=5;break}if(g>>>0>131072){gb(e|0,e+(g+-65536)|0,65536)|0;c[L>>2]=65536;e=c[M>>2]|0;f=65536}else f=g;h=e+f|0;c[y>>2]=h;e=5}else{h=c[y>>2]|0;f=c[L>>2]|0;e=6}while(0);e=oa[e&7](k,h,c[p>>2]|0,c[r>>2]|0,c[K>>2]|0,f)|0;if((e|0)<0){e=-16;W=99;break a}if(c[t>>2]|0)Ra(x,c[y>>2]|0,e);Z=u;if(!((c[Z>>2]|0)==0&(c[Z+4>>2]|0)==0)){Y=w;Y=bb(c[Y>>2]|0,c[Y+4>>2]|0,e|0,((e|0)<0)<<31>>31|0)|0;Z=w;c[Z>>2]=Y;c[Z+4>>2]=C}c[G>>2]=e;c[J>>2]=0;c[m>>2]=10;f=j;g=k;h=H;Y=l;Z=E;j=f;k=g;H=h;l=Y;E=Z;continue b}case 10:{Z=c[J>>2]|0;e=(c[G>>2]|0)-Z|0;f=l;Y=s-l|0;e=e>>>0>Y>>>0?Y:e;gb(f|0,(c[y>>2]|0)+Z|0,e|0)|0;if(!(c[v>>2]|0))Ma(D,f,e,F,1);Z=(c[J>>2]|0)+e|0;c[J>>2]=Z;e=f+e|0;if((Z|0)!=(c[G>>2]|0)){Y=j;Z=k;E=0;l=e;H=4;j=Y;k=Z;continue b}c[m>>2]=2;g=j;h=k;Y=H;Z=E;l=e;j=g;k=h;H=Y;E=Z;continue b}case 11:{Z=w;if(!((c[Z>>2]|0)==0&(c[Z+4>>2]|0)==0)){e=-14;W=99;break a}if(!(c[t>>2]&1073741823)){c[m>>2]=0;h=j;Y=k;Z=l;E=0;H=0;j=h;k=Y;l=Z;continue b}if((n-j|0)<4){c[o>>2]=0;c[m>>2]=12;W=75;break c}else{g=j;e=j+4|0;W=78;break c}}case 12:{W=75;break}case 13:if((n-j|0)>3){f=j;e=j+4|0;W=85;break c}else{c[o>>2]=4;c[p>>2]=8;c[m>>2]=14;W=82;break c}case 14:{W=82;break}case 15:{Y=c[p>>2]|0;Z=n-j|0;Z=Y>>>0>Z>>>0?Z:Y;f=j+Z|0;e=Y-Z|0;c[p>>2]=e;if((Y|0)!=(Z|0)){Y=k;Z=l;E=0;H=e;j=f;k=Y;l=Z;continue b}c[m>>2]=0;Y=k;Z=l;E=0;H=0;j=f;k=Y;l=Z;continue b}default:{f=j;g=k;h=H;Y=l;Z=E;j=f;k=g;H=h;l=Y;E=Z;continue b}}while(0);do if((W|0)==11){W=0;f=f-g|0;e=f>>>0>e>>>0?e:f;gb(D+144+g|0,h|0,e|0)|0;f=(c[o>>2]|0)+e|0;c[o>>2]=f;g=h+e|0;e=c[p>>2]|0;if(e>>>0<=f>>>0){e=La(D,z,e)|0;if(e>>>0>4294967277){W=99;break a}else{f=k;h=H;Y=l;Z=E;j=g;k=f;H=h;l=Y;E=Z;continue b}}else{Y=k;Z=l;E=0;H=e-f+4|0;j=g;k=Y;l=Z;continue b}}else if((W|0)==17){W=0;Z=c[o>>2]|0;e=4-Z|0;f=j;Y=n-j|0;e=e>>>0>Y>>>0?Y:e;gb((c[q>>2]|0)+Z|0,f|0,e|0)|0;f=f+e|0;e=(c[o>>2]|0)+e|0;c[o>>2]=e;if(e>>>0<4){Y=k;Z=l;E=0;H=4-e|0;j=f;k=Y;l=Z;continue b}else{h=c[q>>2]|0;W=20;break}}else if((W|0)==75){W=0;Z=c[o>>2]|0;e=4-Z|0;f=j;Y=n-j|0;e=e>>>0>Y>>>0?Y:e;gb((c[q>>2]|0)+Z|0,f|0,e|0)|0;f=f+e|0;e=(c[o>>2]|0)+e|0;c[o>>2]=e;if(e>>>0<4){Y=k;Z=l;E=0;H=4-e|0;j=f;k=Y;l=Z;continue b}else{g=c[q>>2]|0;e=f;W=78;break}}else if((W|0)==82){W=0;g=c[o>>2]|0;f=(c[p>>2]|0)-g|0;e=j;Z=n-j|0;f=f>>>0>Z>>>0?Z:f;gb(D+144+g|0,e|0,f|0)|0;e=e+f|0;f=(c[o>>2]|0)+f|0;c[o>>2]=f;g=c[p>>2]|0;if(g>>>0>f>>>0){Y=k;Z=l;E=0;H=g-f|0;j=e;k=Y;l=Z;continue b}else{f=A;W=85}}while(0);if((W|0)==20){W=0;g=h;e=g+3|0;g=d[g>>0]|d[g+1>>0]<<8|d[g+2>>0]<<16|d[e>>0]<<24&2130706432;if(!g){c[m>>2]=11;g=H;Y=l;Z=E;k=h;j=f;H=g;l=Y;E=Z;continue}if(g>>>0>(c[r>>2]|0)>>>0){e=-1;W=99;break a}c[p>>2]=g;if((a[e>>0]|0)<0){c[m>>2]=4;g=H;Y=l;Z=E;k=h;j=f;H=g;l=Y;E=Z;continue}else{c[m>>2]=5;k=(l|0)==(B|0);Z=l;E=k?0:E;H=k?g+4|0:H;k=h;j=f;l=Z;continue}}else if((W|0)==78){W=0;Z=g;Z=d[Z>>0]|d[Z+1>>0]<<8|d[Z+2>>0]<<16|d[Z+3>>0]<<24;if((Z|0)!=(Sa(x)|0)){e=-18;W=99;break a}c[m>>2]=0;Z=l;E=0;H=0;k=g;j=e;l=Z;continue}else if((W|0)==85){W=0;h=f;h=d[h>>0]|d[h+1>>0]<<8|d[h+2>>0]<<16|d[h+3>>0]<<24;Y=u;c[Y>>2]=h;c[Y+4>>2]=0;c[p>>2]=h;c[m>>2]=15;h=H;Y=l;Z=E;k=f;j=e;H=h;l=Y;E=Z;continue}}do if(((c[v>>2]|0)==0?(P=c[K>>2]|0,Q=c[M>>2]|0,(P|0)!=(Q|0)&(c[V>>2]|0)==0):0)?(R=c[m>>2]|0,(R+-1|0)>>>0<10):0){if((R|0)!=10){Y=c[L>>2]|0;Z=Y>>>0>65536?65536:Y;gb(Q|0,P+(Y-Z)|0,Z|0)|0;Y=c[M>>2]|0;c[K>>2]=Y;c[L>>2]=Z;c[y>>2]=Y+Z;break}f=(c[y>>2]|0)-Q|0;e=c[G>>2]|0;if(e>>>0>65536)e=0;else{e=65536-e|0;e=e>>>0>f>>>0?f:e}gb(Q+(f-e)|0,P+((c[L>>2]|0)-(c[J>>2]|0)-e)|0,e|0)|0;c[K>>2]=c[M>>2];c[L>>2]=f+(c[J>>2]|0)}while(0);if(j>>>0<T>>>0)c[I>>2]=j;else c[I>>2]=0;e=l-O|0;if(H>>>0>4294967277){e=H;break}U=j-S+U|0;if(e)la(1,b|0,c[4]|0,e|0)|0;if(!H){e=1;W=106;break}if(!(N>>>0>U>>>0|(e|0)==8192)){e=1;W=106;break}}if((W|0)!=99)if((W|0)==106){i=X;return e|0}ma(0,b|0,c[20+(0-e<<2)>>2]|0)|0;Z=0;i=X;return Z|0}function Ha(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;h=i;i=i+64|0;d=h;e=d;f=e+56|0;do{c[e>>2]=0;e=e+4|0}while((e|0)<(f|0));c[d+8>>2]=1;f=(b|0)==0?d:b;b=c[f>>2]|0;if(b){b=b+-4|0;if(b>>>0>3)e=-2;else g=3}else{b=0;g=3}if((g|0)==3)e=c[100+(b<<2)>>2]|0;d=(a>>>0)/(e>>>0)|0;if(!(c[f+36>>2]|0))b=e;else b=(a>>>0)%(e>>>0)|0;a=(d<<2)+4+(_(e,d)|0)+b+((c[f+8>>2]<<2)+4)|0;i=h;return a|0}function Ia(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;e=a;n=a+b|0;f=b>>>0>15;if(!(e&3)){if(f){i=a+(b+-16)|0;j=606290984;k=-2048144777;l=0;m=1640531535;do{f=j+(_(c[e>>2]|0,-2048144777)|0)|0;f=f<<13|f>>>19;j=_(f,-1640531535)|0;o=e;a=k+(_(c[o+4>>2]|0,-2048144777)|0)|0;a=a<<13|a>>>19;k=_(a,-1640531535)|0;g=l+(_(c[o+8>>2]|0,-2048144777)|0)|0;g=g<<13|g>>>19;l=_(g,-1640531535)|0;h=m+(_(c[o+12>>2]|0,-2048144777)|0)|0;h=h<<13|h>>>19;m=_(h,-1640531535)|0;o=o+16|0;e=o}while(o>>>0<=i>>>0);f=(_(f,1013904226)|0|j>>>31)+(_(a,465361024)|0|k>>>25)+(_(g,2006650880)|0|l>>>20)+(_(h,-423362560)|0|m>>>14)|0}else f=374761393;a=f+b|0;while(1){f=e+4|0;if(f>>>0>n>>>0)break;o=a+(_(c[e>>2]|0,-1028477379)|0)|0;a=_(o<<17|o>>>15,668265263)|0;e=f}while(1){if(e>>>0>=n>>>0)break;o=a+(_(d[e>>0]|0,374761393)|0)|0;a=_(o<<11|o>>>21,-1640531535)|0;e=e+1|0}o=_(a^a>>>15,-2048144777)|0;o=_(o^o>>>13,-1028477379)|0;o=o^o>>>16;o=o>>>8;o=o&255;return o|0}else{if(f){h=a+(b+-16)|0;j=606290984;k=-2048144777;l=0;m=1640531535;do{i=e;i=j+(_(d[i>>0]|d[i+1>>0]<<8|d[i+2>>0]<<16|d[i+3>>0]<<24,-2048144777)|0)|0;i=i<<13|i>>>19;j=_(i,-1640531535)|0;o=e;f=o+4|0;f=k+(_(d[f>>0]|d[f+1>>0]<<8|d[f+2>>0]<<16|d[f+3>>0]<<24,-2048144777)|0)|0;f=f<<13|f>>>19;k=_(f,-1640531535)|0;a=o+8|0;a=l+(_(d[a>>0]|d[a+1>>0]<<8|d[a+2>>0]<<16|d[a+3>>0]<<24,-2048144777)|0)|0;a=a<<13|a>>>19;l=_(a,-1640531535)|0;g=o+12|0;g=m+(_(d[g>>0]|d[g+1>>0]<<8|d[g+2>>0]<<16|d[g+3>>0]<<24,-2048144777)|0)|0;g=g<<13|g>>>19;m=_(g,-1640531535)|0;o=o+16|0;e=o}while(o>>>0<=h>>>0);f=(_(i,1013904226)|0|j>>>31)+(_(f,465361024)|0|k>>>25)+(_(a,2006650880)|0|l>>>20)+(_(g,-423362560)|0|m>>>14)|0}else f=374761393;a=f+b|0;while(1){f=e+4|0;if(f>>>0>n>>>0)break;o=e;o=a+(_(d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24,-1028477379)|0)|0;a=_(o<<17|o>>>15,668265263)|0;e=f}while(1){if(e>>>0>=n>>>0)break;o=a+(_(d[e>>0]|0,374761393)|0)|0;a=_(o<<11|o>>>21,-1640531535)|0;e=e+1|0}o=_(a^a>>>15,-2048144777)|0;o=_(o^o>>>13,-1028477379)|0;o=o^o>>>16;o=o>>>8;o=o&255;return o|0}return 0}function Ja(b,c,d,e,f,g){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0;i=b+4|0;g=oa[e&7](f,c,i,d,d+-1|0,g)|0;a[b>>0]=g;f=b+1|0;a[f>>0]=g>>>8;h=b+2|0;a[h>>0]=g>>>16;e=b+3|0;a[e>>0]=g>>>24;if(g){d=g;d=d+4|0;return d|0}a[b>>0]=d;a[f>>0]=d>>>8;a[h>>0]=d>>>16;a[e>>0]=d>>>24^128;gb(i|0,c|0,d|0)|0;d=d+4|0;return d|0}function Ka(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=a+144|0;if((c[a+32>>2]|0)<3){b=c[b>>2]|0;e=c[a+72>>2]|0;a=b+16400|0;d=c[a>>2]|0;d=d>>>0<65536?d:65536;hb(e|0,(c[b+16392>>2]|0)+((c[b+16400>>2]|0)-d)|0,d|0)|0;c[b+16392>>2]=e;c[a>>2]=d;return d|0}e=c[b>>2]|0;f=e+262160|0;d=(c[e+262144>>2]|0)-((c[e+262148>>2]|0)+(c[f>>2]|0))|0;d=(d|0)<65536?d:65536;g=c[a+72>>2]|0;h=e+262144|0;hb(g|0,(c[h>>2]|0)+(0-d)|0,d|0)|0;a=e+262148|0;b=(c[h>>2]|0)-(c[a>>2]|0)|0;c[h>>2]=g+d;c[a>>2]=g+(d-b);b=b-d|0;c[f>>2]=b;c[e+262164>>2]=b;a=e+262168|0;if((c[a>>2]|0)>>>0>=b>>>0){h=d;return h|0}c[a>>2]=b;h=d;return h|0}function La(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if(f>>>0<7){b=-12;return b|0};c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;c[b+20>>2]=0;c[b+24>>2]=0;c[b+28>>2]=0;i=d[e>>0]|0;j=d[e+1>>0]<<8;g=d[e+2>>0]<<16;h=d[e+3>>0]<<24;if((i&240|j|g|h|0)==407710288){c[b+12>>2]=1;if((b+144|0)==(e|0)){c[b+64>>2]=f;c[b+68>>2]=8;c[b+36>>2]=14;b=f;return b|0}else{c[b+36>>2]=13;b=4;return b|0}}if((i|j|g|h|0)!=407708164){b=-13;return b|0}c[b+12>>2]=0;i=e+4|0;j=a[i>>0]|0;k=j&255;h=k>>>5&1;l=k&16;m=k>>>3&1;n=k>>>2&1;o=m<<3|7;if(o>>>0>f>>>0){g=b+144|0;if((g|0)!=(e|0))gb(g|0,e|0,f|0)|0;c[b+64>>2]=f;c[b+68>>2]=o;c[b+36>>2]=1;b=f;return b|0}g=a[e+5>>0]|0;f=(g&255)>>>4&7;if((k&192|0)!=64){b=-6;return b|0}if(l){b=-7;return b|0}if((j&3)!=0|g<<24>>24<0){b=-8;return b|0}if(f>>>0<4){b=-2;return b|0}if(g&15){b=-8;return b|0}l=Ia(i,o+-5|0)|0;if(l<<24>>24!=(a[e+(o+-1)>>0]|0)){b=-17;return b|0}i=b+4|0;c[i>>2]=h;c[b+8>>2]=n;c[b>>2]=f;g=f+-4|0;if(g>>>0>3)g=-2;else g=c[100+(g<<2)>>2]|0;l=b+48|0;c[l>>2]=g;if(m){r=d[e+6>>0]|0;q=fb(d[e+7>>0]|0,0,8)|0;m=C;p=fb(d[e+8>>0]|0,0,16)|0;m=m|C;j=fb(d[e+9>>0]|0,0,24)|0;m=m|C|d[e+10>>0];f=fb(d[e+11>>0]|0,0,40)|0;m=m|C;k=fb(d[e+12>>0]|0,0,48)|0;k=cb(r|q|p|j|f|0,m|0,k|0,C|0)|0;m=C;f=fb(d[e+13>>0]|0,0,56)|0;f=cb(k|0,m|0,f|0,C|0)|0;m=C;e=b+16|0;c[e>>2]=f;c[e+4>>2]=m;e=b+40|0;c[e>>2]=f;c[e+4>>2]=m}if(n){h=b+96|0;c[b+104>>2]=0;c[h+12>>2]=606290984;c[b+112>>2]=-2048144777;c[h+20>>2]=0;c[b+120>>2]=1640531535;g=h;c[g>>2]=0;c[g+4>>2]=0;c[h+44>>2]=0;h=c[i>>2]|0;g=c[l>>2]|0}g=g+(((h|0)==0&1)<<17)|0;i=b+52|0;if(g>>>0>(c[i>>2]|0)>>>0){j=b+60|0;$a(c[j>>2]|0);k=b+72|0;$a(c[k>>2]|0);c[i>>2]=g;g=c[l>>2]|0;h=_a(g)|0;if(!h){c[j>>2]=h;r=-1;return r|0}if(c[h+-4>>2]&3)db(h|0,0,g|0)|0;c[j>>2]=h;h=c[i>>2]|0;g=_a(h)|0;if(!g){c[k>>2]=g;r=-1;return r|0}if(c[g+-4>>2]&3)db(g|0,0,h|0)|0;c[k>>2]=g}else g=c[b+72>>2]|0;c[b+64>>2]=0;c[b+68>>2]=0;c[b+76>>2]=g;c[b+80>>2]=0;c[b+84>>2]=g;c[b+92>>2]=0;c[b+88>>2]=0;c[b+36>>2]=2;r=o;return r|0}function Ma(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0;m=a+80|0;g=c[m>>2]|0;if(!g){l=a+76|0;c[l>>2]=b;h=b}else{h=a+76|0;l=h;h=c[h>>2]|0}if((h+g|0)==(b|0)){c[m>>2]=g+d;return}i=b-e+d|0;if(i>>>0>65535){c[l>>2]=e;c[m>>2]=i;return}j=a+72|0;k=c[j>>2]|0;i=(h|0)==(k|0);if(!f){if(!i){a=65536-d|0;a=a>>>0>g>>>0?g:a;gb(k|0,h+(g-a)|0,a|0)|0;gb((c[j>>2]|0)+a|0,b|0,d|0)|0;c[l>>2]=c[j>>2];c[m>>2]=a+d;return}if((g+d|0)>>>0>(c[a+52>>2]|0)>>>0){l=65536-d|0;gb(h|0,h+(g-l)|0,l|0)|0;c[m>>2]=l;h=c[j>>2]|0;g=l}gb(h+g|0,b|0,d|0)|0;c[m>>2]=(c[m>>2]|0)+d;return}else{if(i){c[m>>2]=g+d;return}f=(c[a+84>>2]|0)-k|0;i=c[a+88>>2]|0;e=a+92|0;if(i>>>0>65536)i=0;else{i=65536-i|0;i=i>>>0>f>>>0?f:i}gb(k+(f-i)|0,h+(g-(c[e>>2]|0)-i)|0,i|0)|0;c[l>>2]=c[j>>2];c[m>>2]=f+(c[e>>2]|0)+d;return}}function Na(b,e,f,g,h,i){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;i=b;h=e;u=b+f|0;v=e+g|0;if(!g){if((f|0)==1)i=(a[b>>0]|0)!=0;else i=1;z=i<<31>>31;return z|0}w=e+(g+-8)|0;x=e+(g+-5)|0;y=e;q=e+(g+-12)|0;r=w;s=b+(f+-5)|0;t=b+(f+-8)|0;p=b+(f+-15)|0;a:while(1){j=i;i=j+1|0;j=d[j>>0]|0;g=j>>>4;if((g|0)==15){g=15;do{o=i;n=o+1|0;i=n;o=a[o>>0]|0;g=g+(o&255)|0}while(n>>>0<p>>>0&o<<24>>24==-1);if((g|0)<0)break}o=h;m=o+g|0;if(m>>>0>q>>>0){z=11;break}f=i;if((f+g|0)>>>0>t>>>0){z=11;break}else i=f;while(1){l=i;A=l;A=d[A>>0]|d[A+1>>0]<<8|d[A+2>>0]<<16|d[A+3>>0]<<24;l=l+4|0;l=d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24;n=h;k=n;a[k>>0]=A;a[k+1>>0]=A>>8;a[k+2>>0]=A>>16;a[k+3>>0]=A>>24;n=n+4|0;a[n>>0]=l;a[n+1>>0]=l>>8;a[n+2>>0]=l>>16;a[n+3>>0]=l>>24;h=h+8|0;if(h>>>0>=m>>>0)break;else i=i+8|0}k=f+g|0;k=g-((d[k>>0]|d[k+1>>0]<<8)&65535)|0;l=o+k|0;i=f+(g+2)|0;if(l>>>0<e>>>0)break;h=j&15;if((h|0)==15){h=15;do{f=i;if(f>>>0>s>>>0)break a;i=f+1|0;A=a[f>>0]|0;h=h+(A&255)|0}while(A<<24>>24==-1);if((h|0)<0)break}n=o+(g+(h+4))|0;h=n;f=m-l|0;if((f|0)<8){A=c[116+(f<<2)>>2]|0;a[m>>0]=a[l>>0]|0;a[o+(g+1)>>0]=a[o+(k+1)>>0]|0;a[o+(g+2)>>0]=a[o+(k+2)>>0]|0;a[o+(g+3)>>0]=a[o+(k+3)>>0]|0;k=k+(c[148+(f<<2)>>2]|0)|0;l=o+k|0;m=o+(g+4)|0;l=d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24;a[m>>0]=l;a[m+1>>0]=l>>8;a[m+2>>0]=l>>16;a[m+3>>0]=l>>24;k=k-A|0}else{j=l;j=d[j>>0]|d[j+1>>0]<<8|d[j+2>>0]<<16|d[j+3>>0]<<24;l=l+4|0;l=d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24;A=m;m=A;a[m>>0]=j;a[m+1>>0]=j>>8;a[m+2>>0]=j>>16;a[m+3>>0]=j>>24;A=A+4|0;a[A>>0]=l;a[A+1>>0]=l>>8;a[A+2>>0]=l>>16;a[A+3>>0]=l>>24;k=k+8|0}j=o+(g+8)|0;f=o+k|0;g=j;if(n>>>0<=q>>>0){g=j;while(1){o=f;l=o;l=d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24;o=o+4|0;o=d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24;A=g;m=A;a[m>>0]=l;a[m+1>>0]=l>>8;a[m+2>>0]=l>>16;a[m+3>>0]=l>>24;A=A+4|0;a[A>>0]=o;a[A+1>>0]=o>>8;a[A+2>>0]=o>>16;a[A+3>>0]=o>>24;g=g+8|0;if(g>>>0<n>>>0)f=f+8|0;else continue a}}if(n>>>0>x>>>0)break;if(j>>>0<w>>>0){g=j;j=g;while(1){m=f;B=m;B=d[B>>0]|d[B+1>>0]<<8|d[B+2>>0]<<16|d[B+3>>0]<<24;m=m+4|0;m=d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24;A=j;l=A;a[l>>0]=B;a[l+1>>0]=B>>8;a[l+2>>0]=B>>16;a[l+3>>0]=B>>24;A=A+4|0;a[A>>0]=m;a[A+1>>0]=m>>8;a[A+2>>0]=m>>16;a[A+3>>0]=m>>24;j=j+8|0;if(j>>>0>=w>>>0)break;else f=f+8|0}f=o+(k+(r-g))|0;g=r}while(1){if(g>>>0>=n>>>0)continue a;a[g>>0]=a[f>>0]|0;f=f+1|0;g=g+1|0}}if((z|0)==11)if(!((i+g|0)!=(u|0)|m>>>0>v>>>0)){gb(o|0,i|0,g|0)|0;B=m-y|0;return B|0}B=b-i+-1|0;return B|0}function Oa(f,g,h,i,j,k){f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;l=h;db(f|0,0,16416)|0;o=i>>>0>2113929216;if(o)m=0;else m=((i|0)/255|0)+i+16|0;q=(i|0)<65547;n=g;k=g+i|0;z=g+(i+-12)|0;A=g+(i+-5)|0;if((m|0)<=(j|0))if(q){if(o){h=0;return h|0}a:do if((i|0)<13)r=n;else{Ua(g,f,2,g);m=g+1|0;u=g;o=m;m=(_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>19;while(1){i=64;r=1;while(1){q=o+r|0;r=i>>>6;if(q>>>0>z>>>0){r=n;break a}p=g+(e[f+(m<<1)>>1]|0)|0;j=m;m=(_(d[q>>0]|d[q+1>>0]<<8|d[q+2>>0]<<16|d[q+3>>0]<<24,-1640531535)|0)>>>19;b[f+(j<<1)>>1]=o-u;j=p;if((d[j>>0]|d[j+1>>0]<<8|d[j+2>>0]<<16|d[j+3>>0]<<24|0)==(d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24|0))break;else{o=q;i=i+1|0}}i=n;while(1){t=o;if(o>>>0<=i>>>0)break;m=p;if(m>>>0<=g>>>0)break;q=o+-1|0;m=m+-1|0;if((a[q>>0]|0)!=(a[m>>0]|0))break;o=q;p=m}m=o;s=m-n|0;o=l+1|0;if(s>>>0>14){a[l>>0]=-16;r=m+241|0;q=n+14-m|0;m=m+240+((q|0)>-255?q:-255)-n|0;q=(m>>>0)%255|0;i=s+-15|0;while(1){if((i|0)<=254)break;j=o;a[j>>0]=-1;i=i+-255|0;o=j+1|0}a[o>>0]=r-n+(q-m);o=o+1|0}else a[l>>0]=s<<4;m=o+s|0;while(1){y=n;w=y;w=d[w>>0]|d[w+1>>0]<<8|d[w+2>>0]<<16|d[w+3>>0]<<24;y=y+4|0;y=d[y>>0]|d[y+1>>0]<<8|d[y+2>>0]<<16|d[y+3>>0]<<24;j=o;x=j;a[x>>0]=w;a[x+1>>0]=w>>8;a[x+2>>0]=w>>16;a[x+3>>0]=w>>24;j=j+4|0;a[j>>0]=y;a[j+1>>0]=y>>8;a[j+2>>0]=y>>16;a[j+3>>0]=y>>24;o=o+8|0;if(o>>>0>=m>>>0){n=t;break}else n=n+8|0}while(1){r=n;o=n-p&65535;a[m>>0]=o;a[m+1>>0]=o>>8;m=m+2|0;o=Va(r+4|0,p+4|0,A)|0;r=r+(o+4)|0;n=d[l>>0]|0;if(o>>>0>14){a[l>>0]=n+15;p=o+-15|0;n=14-o|0;n=o+495+(n>>>0>4294966786?n:-510)|0;o=(n>>>0)%510|0;l=p;while(1){if(l>>>0<=509)break;j=m;a[j>>0]=-1;a[j+1>>0]=-1;m=j+2|0;l=l+-510|0}l=p+(o-n)|0;if(l>>>0>254){a[m>>0]=-1;l=l+-255|0;m=m+1|0}j=m;a[j>>0]=l;l=j+1|0}else{a[l>>0]=n+o;l=m}n=r;if(n>>>0>z>>>0)break a;Ua(n+-2|0,f,2,g);m=r;p=g+(e[f+((_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>19<<1)>>1]|0)|0;Ua(n,f,2,g);o=p;if((o+65535|0)>>>0<n>>>0)break;if((d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24|0)!=(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24|0))break;a[l>>0]=0;n=r;m=l+1|0}m=n+1|0;n=r;o=m;m=(_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>19}}while(0);i=r;q=k-r|0;if(q>>>0>14){p=l;a[p>>0]=-16;o=k+241|0;m=r+14-k|0;k=k+(m>>>0>4294967041?m:-255)+240-r|0;m=(k>>>0)%255|0;n=q+-15|0;while(1){l=p+1|0;if(n>>>0<=254)break;a[l>>0]=-1;p=l;n=n+-255|0}a[l>>0]=o-r+(m-k);k=p+2|0}else{k=l;a[k>>0]=q<<4;l=k;k=k+1|0}gb(k|0,i|0,q|0)|0;h=l+(q+1)-h|0;return h|0}else{if(o){h=0;return h|0}Ua(g,f,0,g);m=g+1|0;o=m;m=(_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>20;b:while(1){r=64;s=1;while(1){t=o;i=o;o=o+s|0;j=r;r=r+1|0;s=j>>>6;if(o>>>0>z>>>0){r=n;break b}p=c[f+(m<<2)>>2]|0;q=m;m=(_(d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24,-1640531535)|0)>>>20;c[f+(q<<2)>>2]=t;q=p;if((q+65535|0)>>>0<i>>>0)continue;if((d[q>>0]|d[q+1>>0]<<8|d[q+2>>0]<<16|d[q+3>>0]<<24|0)==(d[i>>0]|d[i+1>>0]<<8|d[i+2>>0]<<16|d[i+3>>0]<<24|0))break}i=n;while(1){m=t;if(m>>>0<=i>>>0)break;o=p;if(o>>>0<=g>>>0)break;q=m+-1|0;m=o+-1|0;if((a[q>>0]|0)!=(a[m>>0]|0))break;t=q;p=m}s=t-n|0;o=l+1|0;if(s>>>0>14){a[l>>0]=-16;m=t+241|0;q=n+14-t|0;q=t+240+((q|0)>-255?q:-255)-n|0;i=(q>>>0)%255|0;r=s+-15|0;while(1){if((r|0)<=254)break;j=o;a[j>>0]=-1;r=r+-255|0;o=j+1|0}a[o>>0]=m-n+(i-q);o=o+1|0}else a[l>>0]=s<<4;m=o+s|0;while(1){y=n;w=y;w=d[w>>0]|d[w+1>>0]<<8|d[w+2>>0]<<16|d[w+3>>0]<<24;y=y+4|0;y=d[y>>0]|d[y+1>>0]<<8|d[y+2>>0]<<16|d[y+3>>0]<<24;j=o;x=j;a[x>>0]=w;a[x+1>>0]=w>>8;a[x+2>>0]=w>>16;a[x+3>>0]=w>>24;j=j+4|0;a[j>>0]=y;a[j+1>>0]=y>>8;a[j+2>>0]=y>>16;a[j+3>>0]=y>>24;o=o+8|0;if(o>>>0>=m>>>0){n=t;break}else n=n+8|0}while(1){r=n;o=n-p&65535;a[m>>0]=o;a[m+1>>0]=o>>8;m=m+2|0;o=Va(r+4|0,p+4|0,A)|0;r=r+(o+4)|0;n=d[l>>0]|0;if(o>>>0>14){a[l>>0]=n+15;p=o+-15|0;n=14-o|0;n=o+495+(n>>>0>4294966786?n:-510)|0;o=(n>>>0)%510|0;l=p;while(1){if(l>>>0<=509)break;j=m;a[j>>0]=-1;a[j+1>>0]=-1;m=j+2|0;l=l+-510|0}l=p+(o-n)|0;if(l>>>0>254){a[m>>0]=-1;l=l+-255|0;m=m+1|0}j=m;a[j>>0]=l;l=j+1|0}else{a[l>>0]=n+o;l=m}n=r;if(n>>>0>z>>>0)break b;Ua(n+-2|0,f,0,g);m=r;p=c[f+((_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>20<<2)>>2]|0;Ua(n,f,0,g);o=p;if((o+65535|0)>>>0<n>>>0)break;if((d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24|0)!=(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24|0))break;a[l>>0]=0;n=r;m=l+1|0}m=n+1|0;n=r;o=m;m=(_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>20}i=r;q=k-r|0;if(q>>>0>14){a[l>>0]=-16;p=k+241|0;n=r+14-k|0;k=k+(n>>>0>4294967041?n:-255)+240-r|0;n=(k>>>0)%255|0;o=q+-15|0;while(1){m=l+1|0;if(o>>>0<=254)break;a[m>>0]=-1;l=m;o=o+-255|0}a[m>>0]=p-r+(n-k);k=l+2|0}else{k=l;a[k>>0]=q<<4;m=k;k=k+1|0}gb(k|0,i|0,q|0)|0;h=m+(q+1)-h|0;return h|0}y=h+j|0;if(!q){if(o){h=0;return h|0}Ua(g,f,0,g);m=g+1|0;o=m;m=(_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>20;c:while(1){r=64;s=1;while(1){t=o;i=o;o=o+s|0;w=r;r=r+1|0;s=w>>>6;if(o>>>0>z>>>0){x=n;v=l;l=160;break c}q=c[f+(m<<2)>>2]|0;p=m;m=(_(d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24,-1640531535)|0)>>>20;c[f+(p<<2)>>2]=t;p=q;if((p+65535|0)>>>0<i>>>0)continue;if((d[p>>0]|d[p+1>>0]<<8|d[p+2>>0]<<16|d[p+3>>0]<<24|0)==(d[i>>0]|d[i+1>>0]<<8|d[i+2>>0]<<16|d[i+3>>0]<<24|0))break}i=n;while(1){m=t;if(m>>>0<=i>>>0)break;o=q;if(o>>>0<=g>>>0)break;p=m+-1|0;m=o+-1|0;if((a[p>>0]|0)!=(a[m>>0]|0))break;t=p;q=m}s=t-n|0;m=l+1|0;if((l+(s+8+((s>>>0)/255|0)+1)|0)>>>0>y>>>0){u=0;l=168;break}if(s>>>0>14){a[l>>0]=-16;o=t+241|0;p=n+14-t|0;p=t+240+((p|0)>-255?p:-255)-n|0;i=(p>>>0)%255|0;r=s+-15|0;while(1){if((r|0)<=254)break;w=m;a[w>>0]=-1;r=r+-255|0;m=w+1|0}a[m>>0]=o-n+(i-p);m=m+1|0}else a[l>>0]=s<<4;o=m+s|0;while(1){s=n;i=s;i=d[i>>0]|d[i+1>>0]<<8|d[i+2>>0]<<16|d[i+3>>0]<<24;s=s+4|0;s=d[s>>0]|d[s+1>>0]<<8|d[s+2>>0]<<16|d[s+3>>0]<<24;w=m;r=w;a[r>>0]=i;a[r+1>>0]=i>>8;a[r+2>>0]=i>>16;a[r+3>>0]=i>>24;w=w+4|0;a[w>>0]=s;a[w+1>>0]=s>>8;a[w+2>>0]=s>>16;a[w+3>>0]=s>>24;m=m+8|0;if(m>>>0>=o>>>0){n=t;break}else n=n+8|0}while(1){w=n;m=n-q&65535;a[o>>0]=m;a[o+1>>0]=m>>8;m=o+2|0;p=Va(w+4|0,q+4|0,A)|0;n=w+(p+4)|0;if((o+((p>>>8)+8)|0)>>>0>y>>>0){u=0;l=168;break c}o=d[l>>0]|0;if(p>>>0>14){a[l>>0]=o+15;q=p+-15|0;o=14-p|0;o=p+495+(o>>>0>4294966786?o:-510)|0;p=(o>>>0)%510|0;l=q;while(1){if(l>>>0<=509)break;w=m;a[w>>0]=-1;a[w+1>>0]=-1;m=w+2|0;l=l+-510|0}l=q+(p-o)|0;if(l>>>0>254){a[m>>0]=-1;l=l+-255|0;m=m+1|0}w=m;a[w>>0]=l;l=w+1|0}else{a[l>>0]=o+p;l=m}o=n;if(o>>>0>z>>>0){x=n;v=l;l=160;break c}Ua(o+-2|0,f,0,g);m=n;q=c[f+((_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>20<<2)>>2]|0;Ua(o,f,0,g);p=q;if((p+65535|0)>>>0<o>>>0)break;if((d[p>>0]|d[p+1>>0]<<8|d[p+2>>0]<<16|d[p+3>>0]<<24|0)!=(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24|0))break;a[l>>0]=0;o=l+1|0}m=o+1|0;o=m;m=(_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>20}if((l|0)==160){i=x;q=k-x|0;if((v-h+q+1+(((q+240|0)>>>0)/255|0)|0)>>>0>j>>>0){h=0;return h|0}if(q>>>0>14){p=v;a[p>>0]=-16;o=k+241|0;m=x+14-k|0;k=k+(m>>>0>4294967041?m:-255)+240-x|0;m=(k>>>0)%255|0;n=q+-15|0;while(1){l=p+1|0;if(n>>>0<=254)break;a[l>>0]=-1;p=l;n=n+-255|0}a[l>>0]=o-x+(m-k);k=p+2|0}else{k=v;a[k>>0]=q<<4;l=k;k=k+1|0}gb(k|0,i|0,q|0)|0;h=l+(q+1)-h|0;return h|0}else if((l|0)==168)return u|0}else{if(o){h=0;return h|0}d:do if((i|0)>=13){Ua(g,f,2,g);m=g+1|0;v=g;o=m;m=(_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>19;e:while(1){r=64;s=1;while(1){q=o+s|0;s=r>>>6;if(q>>>0>z>>>0){w=n;p=l;break d}i=g+(e[f+(m<<1)>>1]|0)|0;x=m;m=(_(d[q>>0]|d[q+1>>0]<<8|d[q+2>>0]<<16|d[q+3>>0]<<24,-1640531535)|0)>>>19;b[f+(x<<1)>>1]=o-v;x=i;if((d[x>>0]|d[x+1>>0]<<8|d[x+2>>0]<<16|d[x+3>>0]<<24|0)==(d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24|0))break;else{o=q;r=r+1|0}}r=n;while(1){u=o;if(o>>>0<=r>>>0)break;m=i;if(m>>>0<=g>>>0)break;q=o+-1|0;m=m+-1|0;if((a[q>>0]|0)!=(a[m>>0]|0))break;o=q;i=m}t=o-n|0;m=l+1|0;if((l+(t+8+((t>>>0)/255|0)+1)|0)>>>0>y>>>0){u=0;l=168;break}if(t>>>0>14){a[l>>0]=-16;s=o+241|0;q=n+14-o|0;o=o+240+((q|0)>-255?q:-255)-n|0;q=(o>>>0)%255|0;r=t+-15|0;while(1){if((r|0)<=254)break;x=m;a[x>>0]=-1;r=r+-255|0;m=x+1|0}a[m>>0]=s-n+(q-o);m=m+1|0}else a[l>>0]=t<<4;o=m+t|0;while(1){t=n;r=t;r=d[r>>0]|d[r+1>>0]<<8|d[r+2>>0]<<16|d[r+3>>0]<<24;t=t+4|0;t=d[t>>0]|d[t+1>>0]<<8|d[t+2>>0]<<16|d[t+3>>0]<<24;x=m;s=x;a[s>>0]=r;a[s+1>>0]=r>>8;a[s+2>>0]=r>>16;a[s+3>>0]=r>>24;x=x+4|0;a[x>>0]=t;a[x+1>>0]=t>>8;a[x+2>>0]=t>>16;a[x+3>>0]=t>>24;m=m+8|0;if(m>>>0>=o>>>0){n=u;break}else n=n+8|0}while(1){x=n;m=n-i&65535;a[o>>0]=m;a[o+1>>0]=m>>8;m=o+2|0;q=Va(x+4|0,i+4|0,A)|0;n=x+(q+4)|0;if((o+((q>>>8)+8)|0)>>>0>y>>>0){u=0;l=168;break e}o=d[l>>0]|0;if(q>>>0>14){a[l>>0]=o+15;i=q+-15|0;o=14-q|0;o=q+495+(o>>>0>4294966786?o:-510)|0;q=(o>>>0)%510|0;l=i;while(1){if(l>>>0<=509)break;x=m;a[x>>0]=-1;a[x+1>>0]=-1;m=x+2|0;l=l+-510|0}l=i+(q-o)|0;if(l>>>0>254){a[m>>0]=-1;l=l+-255|0;m=m+1|0}x=m;a[x>>0]=l;l=x+1|0}else{a[l>>0]=o+q;l=m}m=n;if(m>>>0>z>>>0){w=n;p=l;break d}Ua(m+-2|0,f,2,g);o=n;i=g+(e[f+((_(d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24,-1640531535)|0)>>>19<<1)>>1]|0)|0;Ua(m,f,2,g);q=i;if((q+65535|0)>>>0<m>>>0)break;if((d[q>>0]|d[q+1>>0]<<8|d[q+2>>0]<<16|d[q+3>>0]<<24|0)!=(d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24|0))break;a[l>>0]=0;o=l+1|0}m=m+1|0;o=m;m=(_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>19}if((l|0)==168)return u|0}else{w=n;p=l}while(0);i=w;q=k-w|0;if((p-h+q+1+(((q+240|0)>>>0)/255|0)|0)>>>0>j>>>0){h=0;return h|0}if(q>>>0>14){a[p>>0]=-16;o=k+241|0;m=w+14-k|0;k=k+(m>>>0>4294967041?m:-255)+240-w|0;m=(k>>>0)%255|0;n=q+-15|0;while(1){l=p+1|0;if(n>>>0<=254)break;a[l>>0]=-1;p=l;n=n+-255|0}a[l>>0]=o-w+(m-k);k=p+2|0}else{k=p;a[k>>0]=q<<4;l=k;k=k+1|0}gb(k|0,i|0,q|0)|0;h=l+(q+1)-h|0;return h|0}return 0}function Pa(b,e,f,g,h,i){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;G=e;j=f;F=b+16392|0;n=c[F>>2]|0;I=b+16400|0;o=c[I>>2]|0;p=n+o|0;k=n;if(c[b+16388>>2]|0){g=0;return g|0}H=b+16384|0;i=c[H>>2]|0;if(i>>>0>2147483648?1:i>>>0>((o|0)!=0&p>>>0<e>>>0?p:G)>>>0){i=i+-65536|0;k=0;while(1){if((k|0)==4096)break;E=b+(k<<2)|0;D=c[E>>2]|0;c[E>>2]=D>>>0<i>>>0?0:D-i|0;k=k+1|0}c[H>>2]=65536;i=c[I>>2]|0;if(i>>>0>65536){c[I>>2]=65536;i=65536}k=n+(o-i)|0;c[F>>2]=k;m=k;r=65536;l=i}else{m=n;r=i;l=o}i=e+g|0;if(i>>>0>m>>>0&i>>>0<p>>>0){k=p-i|0;if(k>>>0>65536){k=65536;l=65536}else{l=k;E=l>>>0<4;k=E?0:l;l=E?0:l}c[I>>2]=l;E=n+(o-k)|0;c[F>>2]=E;l=k;k=E}m=l>>>0<65536&l>>>0<r>>>0;if((p|0)==(e|0)){t=e+(0-l)|0;q=e;x=e+(g+-12)|0;y=e+(g+-5)|0;z=f+h|0;k=g>>>0>2113929216;a:do if(m)if(!k){u=e+(0-r)|0;v=t;b:do if((g|0)>=13){w=u;Ua(e,b,1,w);k=e+1|0;l=k;k=(_(d[k>>0]|d[k+1>>0]<<8|d[k+2>>0]<<16|d[k+3>>0]<<24,-1640531535)|0)>>>20;while(1){p=64;r=1;while(1){m=l+r|0;G=p;p=p+1|0;r=G>>>6;if(m>>>0>x>>>0)break b;n=w+(c[b+(k<<2)>>2]|0)|0;G=k;k=(_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>20;c[b+(G<<2)>>2]=l-u;if(n>>>0<t>>>0){l=m;continue}o=n;if((o+65535|0)>>>0<l>>>0){l=m;continue}if((d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24|0)==(d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24|0))break;else l=m}o=q;p=v;while(1){s=l;if(l>>>0<=o>>>0)break;k=n;if(k>>>0<=p>>>0)break;m=l+-1|0;k=k+-1|0;if((a[m>>0]|0)!=(a[k>>0]|0))break;l=m;n=k}r=l-q|0;k=j+1|0;if((j+(r+8+((r>>>0)/255|0)+1)|0)>>>0>z>>>0){i=0;break a}if(r>>>0>14){a[j>>0]=-16;p=l+241|0;m=q+14-l|0;l=l+240+((m|0)>-255?m:-255)-q|0;m=(l>>>0)%255|0;o=r+-15|0;while(1){if((o|0)<=254)break;G=k;a[G>>0]=-1;o=o+-255|0;k=G+1|0}a[k>>0]=p-q+(m-l);k=k+1|0}else a[j>>0]=r<<4;l=k+r|0;while(1){F=q;E=F;E=d[E>>0]|d[E+1>>0]<<8|d[E+2>>0]<<16|d[E+3>>0]<<24;F=F+4|0;F=d[F>>0]|d[F+1>>0]<<8|d[F+2>>0]<<16|d[F+3>>0]<<24;G=k;e=G;a[e>>0]=E;a[e+1>>0]=E>>8;a[e+2>>0]=E>>16;a[e+3>>0]=E>>24;G=G+4|0;a[G>>0]=F;a[G+1>>0]=F>>8;a[G+2>>0]=F>>16;a[G+3>>0]=F>>24;k=k+8|0;if(k>>>0>=l>>>0){q=s;break}else q=q+8|0}while(1){G=q;k=q-n&65535;a[l>>0]=k;a[l+1>>0]=k>>8;k=l+2|0;m=Va(G+4|0,n+4|0,y)|0;q=G+(m+4)|0;if((l+((m>>>8)+8)|0)>>>0>z>>>0){i=0;break a}l=d[j>>0]|0;if(m>>>0>14){a[j>>0]=l+15;n=m+-15|0;l=14-m|0;l=m+495+(l>>>0>4294966786?l:-510)|0;m=(l>>>0)%510|0;j=n;while(1){if(j>>>0<=509)break;G=k;a[G>>0]=-1;a[G+1>>0]=-1;k=G+2|0;j=j+-510|0}j=n+(m-l)|0;if(j>>>0>254){a[k>>0]=-1;j=j+-255|0;k=k+1|0}G=k;a[G>>0]=j;j=G+1|0}else{a[j>>0]=l+m;j=k}k=q;if(k>>>0>x>>>0)break b;Ua(k+-2|0,b,1,w);l=q;n=w+(c[b+((_(d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24,-1640531535)|0)>>>20<<2)>>2]|0)|0;Ua(k,b,1,w);m=n;if(m>>>0<t>>>0|(m+65535|0)>>>0<k>>>0)break;if((d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24|0)!=(d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24|0))break;a[j>>0]=0;l=j+1|0}k=k+1|0;l=k;k=(_(d[k>>0]|d[k+1>>0]<<8|d[k+2>>0]<<16|d[k+3>>0]<<24,-1640531535)|0)>>>20}}while(0);p=q;o=i-q|0;if((j-f+o+1+(((o+240|0)>>>0)/255|0)|0)>>>0<=h>>>0){if(o>>>0>14){n=j;a[n>>0]=-16;m=i+241|0;k=q+14-i|0;i=i+(k>>>0>4294967041?k:-255)+240-q|0;k=(i>>>0)%255|0;l=o+-15|0;while(1){j=n+1|0;if(l>>>0<=254)break;a[j>>0]=-1;n=j;l=l+-255|0}a[j>>0]=m-q+(k-i);i=n+2|0}else{i=j;a[i>>0]=o<<4;j=i;i=i+1|0}gb(i|0,p|0,o|0)|0;i=j+(o+1)-f|0}else i=0}else i=0;else if(!k){v=e+(0-r)|0;c:do if((g|0)>=13){u=v;Ua(e,b,1,u);k=e+1|0;l=k;k=(_(d[k>>0]|d[k+1>>0]<<8|d[k+2>>0]<<16|d[k+3>>0]<<24,-1640531535)|0)>>>20;while(1){p=64;r=1;while(1){m=l+r|0;G=p;p=p+1|0;r=G>>>6;if(m>>>0>x>>>0)break c;n=u+(c[b+(k<<2)>>2]|0)|0;o=k;k=(_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>20;c[b+(o<<2)>>2]=l-v;o=n;if((o+65535|0)>>>0<l>>>0){l=m;continue}if((d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24|0)==(d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24|0))break;else l=m}o=q;p=t;while(1){s=l;if(l>>>0<=o>>>0)break;k=n;if(k>>>0<=p>>>0)break;m=l+-1|0;k=k+-1|0;if((a[m>>0]|0)!=(a[k>>0]|0))break;l=m;n=k}k=l;r=k-q|0;l=j+1|0;if((j+(r+8+((r>>>0)/255|0)+1)|0)>>>0>z>>>0){i=0;break a}if(r>>>0>14){a[j>>0]=-16;p=k+241|0;m=q+14-k|0;k=k+240+((m|0)>-255?m:-255)-q|0;m=(k>>>0)%255|0;o=r+-15|0;while(1){if((o|0)<=254)break;G=l;a[G>>0]=-1;o=o+-255|0;l=G+1|0}a[l>>0]=p-q+(m-k);l=l+1|0}else a[j>>0]=r<<4;m=l+r|0;k=q;while(1){F=k;E=F;E=d[E>>0]|d[E+1>>0]<<8|d[E+2>>0]<<16|d[E+3>>0]<<24;F=F+4|0;F=d[F>>0]|d[F+1>>0]<<8|d[F+2>>0]<<16|d[F+3>>0]<<24;G=l;e=G;a[e>>0]=E;a[e+1>>0]=E>>8;a[e+2>>0]=E>>16;a[e+3>>0]=E>>24;G=G+4|0;a[G>>0]=F;a[G+1>>0]=F>>8;a[G+2>>0]=F>>16;a[G+3>>0]=F>>24;l=l+8|0;if(l>>>0>=m>>>0){q=s;l=m;break}else k=k+8|0}while(1){G=q;k=q-n&65535;a[l>>0]=k;a[l+1>>0]=k>>8;k=l+2|0;m=Va(G+4|0,n+4|0,y)|0;q=G+(m+4)|0;if((l+((m>>>8)+8)|0)>>>0>z>>>0){i=0;break a}l=d[j>>0]|0;if(m>>>0>14){a[j>>0]=l+15;n=m+-15|0;l=14-m|0;l=m+495+(l>>>0>4294966786?l:-510)|0;m=(l>>>0)%510|0;j=n;while(1){if(j>>>0<=509)break;G=k;a[G>>0]=-1;a[G+1>>0]=-1;k=G+2|0;j=j+-510|0}j=n+(m-l)|0;if(j>>>0>254){a[k>>0]=-1;j=j+-255|0;k=k+1|0}G=k;a[G>>0]=j;j=G+1|0}else{a[j>>0]=l+m;j=k}k=q;if(k>>>0>x>>>0)break c;Ua(k+-2|0,b,1,u);l=q;n=u+(c[b+((_(d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24,-1640531535)|0)>>>20<<2)>>2]|0)|0;Ua(k,b,1,u);m=n;if((m+65535|0)>>>0<k>>>0)break;if((d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24|0)!=(d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24|0))break;a[j>>0]=0;l=j+1|0}k=k+1|0;l=k;k=(_(d[k>>0]|d[k+1>>0]<<8|d[k+2>>0]<<16|d[k+3>>0]<<24,-1640531535)|0)>>>20}}while(0);p=q;o=i-q|0;if((j-f+o+1+(((o+240|0)>>>0)/255|0)|0)>>>0<=h>>>0){if(o>>>0>14){a[j>>0]=-16;n=i+241|0;l=q+14-i|0;i=i+(l>>>0>4294967041?l:-255)+240-q|0;l=(i>>>0)%255|0;m=o+-15|0;while(1){k=j+1|0;if(m>>>0<=254)break;a[k>>0]=-1;j=k;m=m+-255|0}a[k>>0]=n-q+(l-i);i=j+2|0}else{i=j;a[i>>0]=o<<4;k=i;i=i+1|0}gb(i|0,p|0,o|0)|0;i=k+(o+1)-f|0}else i=0}else i=0;while(0);c[I>>2]=(c[I>>2]|0)+g;c[H>>2]=(c[H>>2]|0)+g;g=i;return g|0}d:do if(m){E=e+(0-l)|0;D=k;y=D+l|0;q=e;z=y-q|0;A=e+(g+-12)|0;B=e+(g+-5)|0;C=f+h|0;if(g>>>0<=2113929216){w=e+(0-r)|0;e:do if((g|0)>=13){x=w;Ua(e,b,1,x);l=e+1|0;m=l;l=(_(d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24,-1640531535)|0)>>>20;while(1){s=64;t=1;while(1){p=m+t|0;v=s;s=s+1|0;t=v>>>6;if(p>>>0>A>>>0)break e;o=x+(c[b+(l<<2)>>2]|0)|0;v=o>>>0<e>>>0;n=v?z:0;v=v?k:G;u=l;l=(_(d[p>>0]|d[p+1>>0]<<8|d[p+2>>0]<<16|d[p+3>>0]<<24,-1640531535)|0)>>>20;c[b+(u<<2)>>2]=m-w;if(o>>>0<E>>>0){m=p;continue}r=o;if((r+65535|0)>>>0<m>>>0){m=p;continue}u=r+n|0;if((d[u>>0]|d[u+1>>0]<<8|d[u+2>>0]<<16|d[u+3>>0]<<24|0)==(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24|0))break;else m=p}r=q;s=v;t=n+-1|0;while(1){u=m;if(m>>>0<=r>>>0)break;l=o;if((l+n|0)>>>0<=s>>>0)break;p=m+-1|0;if((a[p>>0]|0)!=(a[l+t>>0]|0))break;m=p;o=l+-1|0}t=m-q|0;l=j+1|0;if((j+(t+8+((t>>>0)/255|0)+1)|0)>>>0>C>>>0){j=F;i=0;break d}if(t>>>0>14){a[j>>0]=-16;s=m+241|0;p=q+14-m|0;m=m+240+((p|0)>-255?p:-255)-q|0;p=(m>>>0)%255|0;r=t+-15|0;while(1){if((r|0)<=254)break;J=l;a[J>>0]=-1;r=r+-255|0;l=J+1|0}a[l>>0]=s-q+(p-m);l=l+1|0}else a[j>>0]=t<<4;m=l+t|0;while(1){t=q;r=t;r=d[r>>0]|d[r+1>>0]<<8|d[r+2>>0]<<16|d[r+3>>0]<<24;t=t+4|0;t=d[t>>0]|d[t+1>>0]<<8|d[t+2>>0]<<16|d[t+3>>0]<<24;J=l;s=J;a[s>>0]=r;a[s+1>>0]=r>>8;a[s+2>>0]=r>>16;a[s+3>>0]=r>>24;J=J+4|0;a[J>>0]=t;a[J+1>>0]=t>>8;a[J+2>>0]=t>>16;a[J+3>>0]=t>>24;l=l+8|0;if(l>>>0>=m>>>0){q=u;r=v;s=m;break}else q=q+8|0}while(1){p=q;m=o;l=q-o&65535;a[s>>0]=l;a[s+1>>0]=l>>8;l=s+2|0;if((r|0)==(D|0)){J=p+(y-(m+n))|0;J=J>>>0>B>>>0?B:J;o=Va(p+4|0,m+(n+4)|0,J)|0;m=o+4|0;n=p+m|0;if((n|0)==(J|0)){J=Va(n,e,B)|0;n=p+(m+J)|0;o=o+J|0}}else{o=Va(p+4|0,m+4|0,B)|0;n=p+(o+4)|0}q=n;if((s+((o>>>8)+8)|0)>>>0>C>>>0){j=F;i=0;break d}m=d[j>>0]|0;if(o>>>0>14){a[j>>0]=m+15;p=o+-15|0;m=14-o|0;m=o+495+(m>>>0>4294966786?m:-510)|0;o=(m>>>0)%510|0;j=p;while(1){if(j>>>0<=509)break;J=l;a[J>>0]=-1;a[J+1>>0]=-1;l=J+2|0;j=j+-510|0}j=p+(o-m)|0;if(j>>>0>254){a[l>>0]=-1;j=j+-255|0;l=l+1|0}J=l;a[J>>0]=j;j=J+1|0}else{a[j>>0]=m+o;j=l}if(n>>>0>A>>>0)break e;Ua(n+-2|0,b,1,x);o=x+(c[b+((_(d[n>>0]|d[n+1>>0]<<8|d[n+2>>0]<<16|d[n+3>>0]<<24,-1640531535)|0)>>>20<<2)>>2]|0)|0;m=o>>>0<e>>>0;p=m?z:0;Ua(n,b,1,x);l=o;if(l>>>0<E>>>0|(l+65535|0)>>>0<n>>>0)break;J=l+p|0;if((d[J>>0]|d[J+1>>0]<<8|d[J+2>>0]<<16|d[J+3>>0]<<24|0)!=(d[n>>0]|d[n+1>>0]<<8|d[n+2>>0]<<16|d[n+3>>0]<<24|0))break;a[j>>0]=0;r=m?k:G;s=j+1|0;n=p}l=n+1|0;m=l;l=(_(d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24,-1640531535)|0)>>>20}}while(0);o=q;p=i-q|0;if((j-f+p+1+(((p+240|0)>>>0)/255|0)|0)>>>0<=h>>>0){if(p>>>0>14){a[j>>0]=-16;n=i+241|0;l=q+14-i|0;i=i+(l>>>0>4294967041?l:-255)+240-q|0;l=(i>>>0)%255|0;m=p+-15|0;while(1){k=j+1|0;if(m>>>0<=254)break;a[k>>0]=-1;j=k;m=m+-255|0}a[k>>0]=n-q+(l-i);i=j+2|0}else{i=j;a[i>>0]=p<<4;k=i;i=i+1|0}gb(i|0,o|0,p|0)|0;j=F;i=k+(p+1)-f|0}else{j=F;i=0}}else{j=F;i=0}}else{D=k;y=D+l|0;l=e;z=y-l|0;A=e+(g+-12)|0;B=e+(g+-5)|0;C=f+h|0;if(g>>>0<=2113929216){w=e+(0-r)|0;f:do if((g|0)<13)q=l;else{x=w;Ua(e,b,1,x);m=e+1|0;n=m;m=(_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>20;while(1){s=64;t=1;while(1){q=n+t|0;J=s;s=s+1|0;t=J>>>6;if(q>>>0>A>>>0){q=l;break f}o=x+(c[b+(m<<2)>>2]|0)|0;v=o>>>0<e>>>0;p=v?z:0;v=v?k:G;r=m;m=(_(d[q>>0]|d[q+1>>0]<<8|d[q+2>>0]<<16|d[q+3>>0]<<24,-1640531535)|0)>>>20;c[b+(r<<2)>>2]=n-w;r=o;if((r+65535|0)>>>0<n>>>0){n=q;continue}J=r+p|0;if((d[J>>0]|d[J+1>>0]<<8|d[J+2>>0]<<16|d[J+3>>0]<<24|0)==(d[n>>0]|d[n+1>>0]<<8|d[n+2>>0]<<16|d[n+3>>0]<<24|0))break;else n=q}r=l;s=v;t=p+-1|0;while(1){u=n;if(n>>>0<=r>>>0)break;m=o;if((m+p|0)>>>0<=s>>>0)break;q=n+-1|0;if((a[q>>0]|0)!=(a[m+t>>0]|0))break;n=q;o=m+-1|0}t=n-l|0;m=j+1|0;if((j+(t+8+((t>>>0)/255|0)+1)|0)>>>0>C>>>0){j=F;i=0;break d}if(t>>>0>14){a[j>>0]=-16;s=n+241|0;q=l+14-n|0;n=n+240+((q|0)>-255?q:-255)-l|0;q=(n>>>0)%255|0;r=t+-15|0;while(1){if((r|0)<=254)break;J=m;a[J>>0]=-1;r=r+-255|0;m=J+1|0}a[m>>0]=s-l+(q-n);m=m+1|0}else a[j>>0]=t<<4;n=m+t|0;while(1){E=l;s=E;s=d[s>>0]|d[s+1>>0]<<8|d[s+2>>0]<<16|d[s+3>>0]<<24;E=E+4|0;E=d[E>>0]|d[E+1>>0]<<8|d[E+2>>0]<<16|d[E+3>>0]<<24;J=m;t=J;a[t>>0]=s;a[t+1>>0]=s>>8;a[t+2>>0]=s>>16;a[t+3>>0]=s>>24;J=J+4|0;a[J>>0]=E;a[J+1>>0]=E>>8;a[J+2>>0]=E>>16;a[J+3>>0]=E>>24;m=m+8|0;if(m>>>0>=n>>>0){l=u;r=v;s=n;break}else l=l+8|0}while(1){q=l;n=o;m=l-o&65535;a[s>>0]=m;a[s+1>>0]=m>>8;m=s+2|0;if((r|0)==(D|0)){J=q+(y-(n+p))|0;J=J>>>0>B>>>0?B:J;o=Va(q+4|0,n+(p+4)|0,J)|0;l=o+4|0;n=q+l|0;if((n|0)==(J|0)){J=Va(n,e,B)|0;q=q+(l+J)|0;o=o+J|0}else q=n}else{o=Va(q+4|0,n+4|0,B)|0;q=q+(o+4)|0}l=q;if((s+((o>>>8)+8)|0)>>>0>C>>>0){j=F;i=0;break d}n=d[j>>0]|0;if(o>>>0>14){a[j>>0]=n+15;p=o+-15|0;n=14-o|0;n=o+495+(n>>>0>4294966786?n:-510)|0;o=(n>>>0)%510|0;j=p;while(1){if(j>>>0<=509)break;J=m;a[J>>0]=-1;a[J+1>>0]=-1;m=J+2|0;j=j+-510|0}j=p+(o-n)|0;if(j>>>0>254){a[m>>0]=-1;j=j+-255|0;m=m+1|0}J=m;a[J>>0]=j;j=J+1|0}else{a[j>>0]=n+o;j=m}if(q>>>0>A>>>0){q=l;break f}Ua(q+-2|0,b,1,x);o=x+(c[b+((_(d[q>>0]|d[q+1>>0]<<8|d[q+2>>0]<<16|d[q+3>>0]<<24,-1640531535)|0)>>>20<<2)>>2]|0)|0;n=o>>>0<e>>>0;p=n?z:0;Ua(q,b,1,x);m=o;if((m+65535|0)>>>0<q>>>0)break;J=m+p|0;if((d[J>>0]|d[J+1>>0]<<8|d[J+2>>0]<<16|d[J+3>>0]<<24|0)!=(d[q>>0]|d[q+1>>0]<<8|d[q+2>>0]<<16|d[q+3>>0]<<24|0))break;a[j>>0]=0;r=n?k:G;s=j+1|0}m=q+1|0;n=m;m=(_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-1640531535)|0)>>>20}}while(0);o=q;p=i-q|0;if((j-f+p+1+(((p+240|0)>>>0)/255|0)|0)>>>0<=h>>>0){if(p>>>0>14){a[j>>0]=-16;n=i+241|0;l=q+14-i|0;i=i+(l>>>0>4294967041?l:-255)+240-q|0;l=(i>>>0)%255|0;m=p+-15|0;while(1){k=j+1|0;if(m>>>0<=254)break;a[k>>0]=-1;j=k;m=m+-255|0}a[k>>0]=n-q+(l-i);i=j+2|0}else{i=j;a[i>>0]=p<<4;k=i;i=i+1|0}gb(i|0,o|0,p|0)|0;j=F;i=k+(p+1)-f|0}else{j=F;i=0}}else{j=F;i=0}}while(0);c[j>>2]=G;c[I>>2]=g;c[H>>2]=(c[H>>2]|0)+g;J=i;return J|0}function Qa(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;if(d>>>0>2113929216)f=0;else f=((d|0)/255|0)+d+16|0;if((f|0)>(e|0)){d=Ya(a,b,c,d,e,1)|0;return d|0}else{d=Ya(a,b,c,d,e,0)|0;return d|0}return 0}function Ra(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;n=b+e|0;f=a;f=cb(c[f>>2]|0,c[f+4>>2]|0,e|0,0)|0;o=a;c[o>>2]=f;c[o+4>>2]=C;o=a+44|0;f=c[o>>2]|0;if((f+e|0)>>>0<16){gb(a+28+f|0,b|0,e|0)|0;c[o>>2]=(c[o>>2]|0)+e;return}if(!f)f=b;else{l=a+28|0;gb(l+f|0,b|0,16-f|0)|0;l=_(d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24,-2048144777)|0;f=a+12|0;l=(c[f>>2]|0)+l|0;c[f>>2]=_(l<<13|l>>>19,-1640531535)|0;f=a+32|0;l=_(d[f>>0]|d[f+1>>0]<<8|d[f+2>>0]<<16|d[f+3>>0]<<24,-2048144777)|0;m=a+16|0;l=(c[m>>2]|0)+l|0;c[m>>2]=_(l<<13|l>>>19,-1640531535)|0;f=f+4|0;f=_(d[f>>0]|d[f+1>>0]<<8|d[f+2>>0]<<16|d[f+3>>0]<<24,-2048144777)|0;m=a+20|0;f=(c[m>>2]|0)+f|0;c[m>>2]=_(f<<13|f>>>19,-1640531535)|0;m=a+40|0;m=_(d[m>>0]|d[m+1>>0]<<8|d[m+2>>0]<<16|d[m+3>>0]<<24,-2048144777)|0;f=a+24|0;m=(c[f>>2]|0)+m|0;c[f>>2]=_(m<<13|m>>>19,-1640531535)|0;f=b+(16-(c[o>>2]|0))|0;c[o>>2]=0}g=f;m=b+(e+-16)|0;if(f>>>0<=m>>>0){i=a+12|0;j=a+16|0;k=a+20|0;l=a+24|0;f=c[i>>2]|0;b=c[j>>2]|0;e=c[k>>2]|0;h=c[l>>2]|0;do{p=g;p=f+(_(d[p>>0]|d[p+1>>0]<<8|d[p+2>>0]<<16|d[p+3>>0]<<24,-2048144777)|0)|0;f=_(p<<13|p>>>19,-1640531535)|0;p=g;q=p+4|0;q=b+(_(d[q>>0]|d[q+1>>0]<<8|d[q+2>>0]<<16|d[q+3>>0]<<24,-2048144777)|0)|0;b=_(q<<13|q>>>19,-1640531535)|0;q=p+8|0;q=e+(_(d[q>>0]|d[q+1>>0]<<8|d[q+2>>0]<<16|d[q+3>>0]<<24,-2048144777)|0)|0;e=_(q<<13|q>>>19,-1640531535)|0;q=p+12|0;q=h+(_(d[q>>0]|d[q+1>>0]<<8|d[q+2>>0]<<16|d[q+3>>0]<<24,-2048144777)|0)|0;h=_(q<<13|q>>>19,-1640531535)|0;p=p+16|0;g=p}while(p>>>0<=m>>>0);c[i>>2]=f;c[j>>2]=b;c[k>>2]=e;c[l>>2]=h}f=g;if(f>>>0>=n>>>0)return;q=n-g|0;gb(a+28|0,f|0,q|0)|0;c[o>>2]=q;return}function Sa(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0;b=a+28|0;f=b+(c[a+44>>2]|0)|0;g=a;e=c[g>>2]|0;g=c[g+4>>2]|0;if(g>>>0>0|(g|0)==0&e>>>0>15){i=c[a+12>>2]|0;h=c[a+16>>2]|0;g=c[a+20>>2]|0;a=c[a+24>>2]|0;a=(i<<1|i>>>31)+(h<<7|h>>>25)+(g<<12|g>>>20)+(a<<18|a>>>14)|0}else a=(c[a+8>>2]|0)+374761393|0;e=a+e|0;while(1){a=b+4|0;if(a>>>0>f>>>0)break;i=b;i=e+(_(d[i>>0]|d[i+1>>0]<<8|d[i+2>>0]<<16|d[i+3>>0]<<24,-1028477379)|0)|0;e=_(i<<17|i>>>15,668265263)|0;b=a}while(1){if(b>>>0>=f>>>0)break;i=e+(_(d[b>>0]|0,374761393)|0)|0;e=_(i<<11|i>>>21,-1640531535)|0;b=b+1|0}i=_(e^e>>>15,-2048144777)|0;i=_(i^i>>>13,-1028477379)|0;return i^i>>>16|0}function Ta(b,e,f,g,h,i){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;j=b;D=e;if(!i){A=b+f|0;B=e+g|0;if(!g){if((f|0)==1)j=(a[b>>0]|0)!=0;else j=1;E=j<<31>>31;return E|0}x=e+(g+-8)|0;y=e+(g+-5)|0;z=e;t=e+(g+-12)|0;u=x;v=b+(f+-5)|0;w=b+(f+-8)|0;s=b+(f+-15)|0;g=D;a:while(1){l=j;j=l+1|0;l=d[l>>0]|0;k=l>>>4;if((k|0)==15){k=15;do{h=j;D=h+1|0;j=D;h=a[h>>0]|0;k=k+(h&255)|0}while(D>>>0<s>>>0&h<<24>>24==-1);if((k|0)<0)break}r=g;o=r+k|0;if(o>>>0>t>>>0){E=12;break}f=j;if((f+k|0)>>>0>w>>>0){E=12;break}else{j=g;g=f}while(1){D=g;C=D;C=d[C>>0]|d[C+1>>0]<<8|d[C+2>>0]<<16|d[C+3>>0]<<24;D=D+4|0;D=d[D>>0]|d[D+1>>0]<<8|d[D+2>>0]<<16|d[D+3>>0]<<24;h=j;i=h;a[i>>0]=C;a[i+1>>0]=C>>8;a[i+2>>0]=C>>16;a[i+3>>0]=C>>24;h=h+4|0;a[h>>0]=D;a[h+1>>0]=D>>8;a[h+2>>0]=D>>16;a[h+3>>0]=D>>24;j=j+8|0;if(j>>>0>=o>>>0)break;else g=g+8|0}m=f+k|0;m=k-((d[m>>0]|d[m+1>>0]<<8)&65535)|0;n=r+m|0;j=f+(k+2)|0;if(n>>>0<e>>>0)break;g=l&15;if((g|0)==15){g=15;do{f=j;if(f>>>0>v>>>0)break a;j=f+1|0;h=a[f>>0]|0;g=g+(h&255)|0}while(h<<24>>24==-1);if((g|0)<0)break}p=r+(k+(g+4))|0;q=p;g=o-n|0;if((g|0)<8){l=c[116+(g<<2)>>2]|0;a[o>>0]=a[n>>0]|0;a[r+(k+1)>>0]=a[r+(m+1)>>0]|0;a[r+(k+2)>>0]=a[r+(m+2)>>0]|0;a[r+(k+3)>>0]=a[r+(m+3)>>0]|0;h=m+(c[148+(g<<2)>>2]|0)|0;i=r+h|0;D=r+(k+4)|0;i=d[i>>0]|d[i+1>>0]<<8|d[i+2>>0]<<16|d[i+3>>0]<<24;a[D>>0]=i;a[D+1>>0]=i>>8;a[D+2>>0]=i>>16;a[D+3>>0]=i>>24;l=h-l|0}else{h=n;i=h;i=d[i>>0]|d[i+1>>0]<<8|d[i+2>>0]<<16|d[i+3>>0]<<24;h=h+4|0;h=d[h>>0]|d[h+1>>0]<<8|d[h+2>>0]<<16|d[h+3>>0]<<24;l=o;D=l;a[D>>0]=i;a[D+1>>0]=i>>8;a[D+2>>0]=i>>16;a[D+3>>0]=i>>24;l=l+4|0;a[l>>0]=h;a[l+1>>0]=h>>8;a[l+2>>0]=h>>16;a[l+3>>0]=h>>24;l=m+8|0}f=r+(k+8)|0;g=r+l|0;k=f;if(p>>>0<=t>>>0){k=f;while(1){D=g;C=D;C=d[C>>0]|d[C+1>>0]<<8|d[C+2>>0]<<16|d[C+3>>0]<<24;D=D+4|0;D=d[D>>0]|d[D+1>>0]<<8|d[D+2>>0]<<16|d[D+3>>0]<<24;h=k;i=h;a[i>>0]=C;a[i+1>>0]=C>>8;a[i+2>>0]=C>>16;a[i+3>>0]=C>>24;h=h+4|0;a[h>>0]=D;a[h+1>>0]=D>>8;a[h+2>>0]=D>>16;a[h+3>>0]=D>>24;k=k+8|0;if(k>>>0<p>>>0)g=g+8|0;else{g=q;continue a}}}if(p>>>0>y>>>0)break;if(f>>>0<x>>>0){k=f;f=k;while(1){D=g;C=D;C=d[C>>0]|d[C+1>>0]<<8|d[C+2>>0]<<16|d[C+3>>0]<<24;D=D+4|0;D=d[D>>0]|d[D+1>>0]<<8|d[D+2>>0]<<16|d[D+3>>0]<<24;h=f;i=h;a[i>>0]=C;a[i+1>>0]=C>>8;a[i+2>>0]=C>>16;a[i+3>>0]=C>>24;h=h+4|0;a[h>>0]=D;a[h+1>>0]=D>>8;a[h+2>>0]=D>>16;a[h+3>>0]=D>>24;f=f+8|0;if(f>>>0>=x>>>0)break;else g=g+8|0}g=r+(l+(u-k))|0;k=u}while(1){if(k>>>0>=p>>>0){g=q;continue a}a[k>>0]=a[g>>0]|0;g=g+1|0;k=k+1|0}}if((E|0)==12)if(!((j+k|0)!=(A|0)|o>>>0>B>>>0)){gb(r|0,j|0,k|0)|0;E=o-z|0;return E|0}E=b-j+-1|0;return E|0}C=h+i|0;if((C|0)!=(e|0)){w=b+f|0;x=e+g|0;y=e+(0-i)|0;z=i>>>0<65536;if(!g){if((f|0)==1)j=(a[b>>0]|0)!=0;else j=1;E=j<<31>>31;return E|0}A=e+(g+-8)|0;B=e+(g+-5)|0;C=e;s=e+(g+-12)|0;t=A;u=b+(f+-5)|0;v=b+(f+-8)|0;r=b+(f+-15)|0;l=D;b:while(1){f=j;j=f+1|0;f=d[f>>0]|0;k=f>>>4;if((k|0)==15){k=15;do{q=j;p=q+1|0;j=p;q=a[q>>0]|0;k=k+(q&255)|0}while(p>>>0<r>>>0&q<<24>>24==-1);if((k|0)<0)break}q=l;p=q+k|0;if(p>>>0>s>>>0){E=107;break}g=j;if((g+k|0)>>>0>v>>>0){E=107;break}else j=g;while(1){n=j;F=n;F=d[F>>0]|d[F+1>>0]<<8|d[F+2>>0]<<16|d[F+3>>0]<<24;n=n+4|0;n=d[n>>0]|d[n+1>>0]<<8|d[n+2>>0]<<16|d[n+3>>0]<<24;o=l;m=o;a[m>>0]=F;a[m+1>>0]=F>>8;a[m+2>>0]=F>>16;a[m+3>>0]=F>>24;o=o+4|0;a[o>>0]=n;a[o+1>>0]=n>>8;a[o+2>>0]=n>>16;a[o+3>>0]=n>>24;l=l+8|0;if(l>>>0>=p>>>0)break;else j=j+8|0}m=g+k|0;m=k-((d[m>>0]|d[m+1>>0]<<8)&65535)|0;o=q+m|0;j=g+(k+2)|0;if(z&o>>>0<y>>>0)break;g=f&15;if((g|0)==15){g=15;do{f=j;if(f>>>0>u>>>0)break b;j=f+1|0;F=a[f>>0]|0;g=g+(F&255)|0}while(F<<24>>24==-1);if((g|0)<0)break}n=g+4|0;l=q+(k+n)|0;if(o>>>0<e>>>0){if(l>>>0>B>>>0)break;g=o;m=C-g|0;if(n>>>0<=m>>>0){hb(p|0,h+(g-C+i)|0,n|0)|0;continue}gb(p|0,h+(i-m)|0,m|0)|0;f=q+(k+m)|0;l=f;g=n-m|0;if(g>>>0<=(l-C|0)>>>0){gb(f|0,e|0,g|0)|0;l=q+(k+n)|0;continue}g=q+(k+n)|0;f=D;while(1){k=l;if(k>>>0>=g>>>0)continue b;l=f;a[k>>0]=a[l>>0]|0;f=l+1|0;l=k+1|0}}n=l;g=p-o|0;if((g|0)<8){F=c[116+(g<<2)>>2]|0;a[p>>0]=a[o>>0]|0;a[q+(k+1)>>0]=a[q+(m+1)>>0]|0;a[q+(k+2)>>0]=a[q+(m+2)>>0]|0;a[q+(k+3)>>0]=a[q+(m+3)>>0]|0;m=m+(c[148+(g<<2)>>2]|0)|0;o=q+m|0;p=q+(k+4)|0;o=d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24;a[p>>0]=o;a[p+1>>0]=o>>8;a[p+2>>0]=o>>16;a[p+3>>0]=o>>24;m=m-F|0}else{f=o;f=d[f>>0]|d[f+1>>0]<<8|d[f+2>>0]<<16|d[f+3>>0]<<24;o=o+4|0;o=d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24;F=p;p=F;a[p>>0]=f;a[p+1>>0]=f>>8;a[p+2>>0]=f>>16;a[p+3>>0]=f>>24;F=F+4|0;a[F>>0]=o;a[F+1>>0]=o>>8;a[F+2>>0]=o>>16;a[F+3>>0]=o>>24;m=m+8|0}f=q+(k+8)|0;g=q+m|0;k=f;if(l>>>0<=s>>>0){k=f;while(1){q=g;o=q;o=d[o>>0]|d[o+1>>0]<<8|d[o+2>>0]<<16|d[o+3>>0]<<24;q=q+4|0;q=d[q>>0]|d[q+1>>0]<<8|d[q+2>>0]<<16|d[q+3>>0]<<24;F=k;p=F;a[p>>0]=o;a[p+1>>0]=o>>8;a[p+2>>0]=o>>16;a[p+3>>0]=o>>24;F=F+4|0;a[F>>0]=q;a[F+1>>0]=q>>8;a[F+2>>0]=q>>16;a[F+3>>0]=q>>24;k=k+8|0;if(k>>>0<l>>>0)g=g+8|0;else{l=n;continue b}}}if(l>>>0>B>>>0)break;if(f>>>0<A>>>0){k=f;f=k;while(1){p=g;G=p;G=d[G>>0]|d[G+1>>0]<<8|d[G+2>>0]<<16|d[G+3>>0]<<24;p=p+4|0;p=d[p>>0]|d[p+1>>0]<<8|d[p+2>>0]<<16|d[p+3>>0]<<24;F=f;o=F;a[o>>0]=G;a[o+1>>0]=G>>8;a[o+2>>0]=G>>16;a[o+3>>0]=G>>24;F=F+4|0;a[F>>0]=p;a[F+1>>0]=p>>8;a[F+2>>0]=p>>16;a[F+3>>0]=p>>24;f=f+8|0;if(f>>>0>=A>>>0)break;else g=g+8|0}g=q+(m+(t-k))|0;k=t}while(1){if(k>>>0>=l>>>0){l=n;continue b}a[k>>0]=a[g>>0]|0;g=g+1|0;k=k+1|0}}if((E|0)==107)if(!((j+k|0)!=(w|0)|p>>>0>x>>>0)){gb(q|0,j|0,k|0)|0;G=p-C|0;return G|0}G=b-j+-1|0;return G|0}if((i|0)>65534){A=h+(i+-65536)|0;B=b+f|0;k=i+g|0;z=h+k|0;if(!g){if((f|0)==1)j=(a[b>>0]|0)!=0;else j=1;G=j<<31>>31;return G|0}x=h+(k+-8)|0;y=h+(k+-5)|0;t=h+(k+-12)|0;u=x;v=b+(f+-5)|0;w=b+(f+-8)|0;s=b+(f+-15)|0;g=D;c:while(1){l=j;j=l+1|0;l=d[l>>0]|0;k=l>>>4;if((k|0)==15){k=15;do{G=j;F=G+1|0;j=F;G=a[G>>0]|0;k=k+(G&255)|0}while(F>>>0<s>>>0&G<<24>>24==-1);if((k|0)<0)break}r=g;o=r+k|0;if(o>>>0>t>>>0){E=45;break}f=j;if((f+k|0)>>>0>w>>>0){E=45;break}else{j=g;g=f}while(1){F=g;e=F;e=d[e>>0]|d[e+1>>0]<<8|d[e+2>>0]<<16|d[e+3>>0]<<24;F=F+4|0;F=d[F>>0]|d[F+1>>0]<<8|d[F+2>>0]<<16|d[F+3>>0]<<24;G=j;h=G;a[h>>0]=e;a[h+1>>0]=e>>8;a[h+2>>0]=e>>16;a[h+3>>0]=e>>24;G=G+4|0;a[G>>0]=F;a[G+1>>0]=F>>8;a[G+2>>0]=F>>16;a[G+3>>0]=F>>24;j=j+8|0;if(j>>>0>=o>>>0)break;else g=g+8|0}m=f+k|0;m=k-((d[m>>0]|d[m+1>>0]<<8)&65535)|0;n=r+m|0;j=f+(k+2)|0;if(n>>>0<A>>>0)break;g=l&15;if((g|0)==15){g=15;do{f=j;if(f>>>0>v>>>0)break c;j=f+1|0;G=a[f>>0]|0;g=g+(G&255)|0}while(G<<24>>24==-1);if((g|0)<0)break}p=r+(k+(g+4))|0;q=p;g=o-n|0;if((g|0)<8){l=c[116+(g<<2)>>2]|0;a[o>>0]=a[n>>0]|0;a[r+(k+1)>>0]=a[r+(m+1)>>0]|0;a[r+(k+2)>>0]=a[r+(m+2)>>0]|0;a[r+(k+3)>>0]=a[r+(m+3)>>0]|0;G=m+(c[148+(g<<2)>>2]|0)|0;h=r+G|0;F=r+(k+4)|0;h=d[h>>0]|d[h+1>>0]<<8|d[h+2>>0]<<16|d[h+3>>0]<<24;a[F>>0]=h;a[F+1>>0]=h>>8;a[F+2>>0]=h>>16;a[F+3>>0]=h>>24;l=G-l|0}else{G=n;h=G;h=d[h>>0]|d[h+1>>0]<<8|d[h+2>>0]<<16|d[h+3>>0]<<24;G=G+4|0;G=d[G>>0]|d[G+1>>0]<<8|d[G+2>>0]<<16|d[G+3>>0]<<24;l=o;F=l;a[F>>0]=h;a[F+1>>0]=h>>8;a[F+2>>0]=h>>16;a[F+3>>0]=h>>24;l=l+4|0;a[l>>0]=G;a[l+1>>0]=G>>8;a[l+2>>0]=G>>16;a[l+3>>0]=G>>24;l=m+8|0}f=r+(k+8)|0;g=r+l|0;k=f;if(p>>>0<=t>>>0){k=f;while(1){F=g;e=F;e=d[e>>0]|d[e+1>>0]<<8|d[e+2>>0]<<16|d[e+3>>0]<<24;F=F+4|0;F=d[F>>0]|d[F+1>>0]<<8|d[F+2>>0]<<16|d[F+3>>0]<<24;G=k;h=G;a[h>>0]=e;a[h+1>>0]=e>>8;a[h+2>>0]=e>>16;a[h+3>>0]=e>>24;G=G+4|0;a[G>>0]=F;a[G+1>>0]=F>>8;a[G+2>>0]=F>>16;a[G+3>>0]=F>>24;k=k+8|0;if(k>>>0<p>>>0)g=g+8|0;else{g=q;continue c}}}if(p>>>0>y>>>0)break;if(f>>>0<x>>>0){k=f;f=k;while(1){F=g;e=F;e=d[e>>0]|d[e+1>>0]<<8|d[e+2>>0]<<16|d[e+3>>0]<<24;F=F+4|0;F=d[F>>0]|d[F+1>>0]<<8|d[F+2>>0]<<16|d[F+3>>0]<<24;G=f;h=G;a[h>>0]=e;a[h+1>>0]=e>>8;a[h+2>>0]=e>>16;a[h+3>>0]=e>>24;G=G+4|0;a[G>>0]=F;a[G+1>>0]=F>>8;a[G+2>>0]=F>>16;a[G+3>>0]=F>>24;f=f+8|0;if(f>>>0>=x>>>0)break;else g=g+8|0}g=r+(l+(u-k))|0;k=u}while(1){if(k>>>0>=p>>>0){g=q;continue c}a[k>>0]=a[g>>0]|0;g=g+1|0;k=k+1|0}}if((E|0)==45)if(!((j+k|0)!=(B|0)|o>>>0>z>>>0)){gb(r|0,j|0,k|0)|0;G=o-C|0;return G|0}G=b-j+-1|0;return G|0}else{A=b+f|0;k=i+g|0;z=h+k|0;if(!g){if((f|0)==1)j=(a[b>>0]|0)!=0;else j=1;G=j<<31>>31;return G|0}x=h+(k+-8)|0;y=h+(k+-5)|0;t=h+(k+-12)|0;u=x;v=b+(f+-5)|0;w=b+(f+-8)|0;s=b+(f+-15)|0;g=D;d:while(1){l=j;j=l+1|0;l=d[l>>0]|0;k=l>>>4;if((k|0)==15){k=15;do{G=j;F=G+1|0;j=F;G=a[G>>0]|0;k=k+(G&255)|0}while(F>>>0<s>>>0&G<<24>>24==-1);if((k|0)<0)break}r=g;o=r+k|0;if(o>>>0>t>>>0){E=76;break}f=j;if((f+k|0)>>>0>w>>>0){E=76;break}else{j=g;g=f}while(1){F=g;D=F;D=d[D>>0]|d[D+1>>0]<<8|d[D+2>>0]<<16|d[D+3>>0]<<24;F=F+4|0;F=d[F>>0]|d[F+1>>0]<<8|d[F+2>>0]<<16|d[F+3>>0]<<24;G=j;e=G;a[e>>0]=D;a[e+1>>0]=D>>8;a[e+2>>0]=D>>16;a[e+3>>0]=D>>24;G=G+4|0;a[G>>0]=F;a[G+1>>0]=F>>8;a[G+2>>0]=F>>16;a[G+3>>0]=F>>24;j=j+8|0;if(j>>>0>=o>>>0)break;else g=g+8|0}m=f+k|0;m=k-((d[m>>0]|d[m+1>>0]<<8)&65535)|0;n=r+m|0;j=f+(k+2)|0;if(n>>>0<h>>>0)break;g=l&15;if((g|0)==15){g=15;do{f=j;if(f>>>0>v>>>0)break d;j=f+1|0;G=a[f>>0]|0;g=g+(G&255)|0}while(G<<24>>24==-1);if((g|0)<0)break}p=r+(k+(g+4))|0;q=p;g=o-n|0;if((g|0)<8){l=c[116+(g<<2)>>2]|0;a[o>>0]=a[n>>0]|0;a[r+(k+1)>>0]=a[r+(m+1)>>0]|0;a[r+(k+2)>>0]=a[r+(m+2)>>0]|0;a[r+(k+3)>>0]=a[r+(m+3)>>0]|0;G=m+(c[148+(g<<2)>>2]|0)|0;e=r+G|0;F=r+(k+4)|0;e=d[e>>0]|d[e+1>>0]<<8|d[e+2>>0]<<16|d[e+3>>0]<<24;a[F>>0]=e;a[F+1>>0]=e>>8;a[F+2>>0]=e>>16;a[F+3>>0]=e>>24;l=G-l|0}else{G=n;e=G;e=d[e>>0]|d[e+1>>0]<<8|d[e+2>>0]<<16|d[e+3>>0]<<24;G=G+4|0;G=d[G>>0]|d[G+1>>0]<<8|d[G+2>>0]<<16|d[G+3>>0]<<24;l=o;F=l;a[F>>0]=e;a[F+1>>0]=e>>8;a[F+2>>0]=e>>16;a[F+3>>0]=e>>24;l=l+4|0;a[l>>0]=G;a[l+1>>0]=G>>8;a[l+2>>0]=G>>16;a[l+3>>0]=G>>24;l=m+8|0}f=r+(k+8)|0;g=r+l|0;k=f;if(p>>>0<=t>>>0){k=f;while(1){F=g;D=F;D=d[D>>0]|d[D+1>>0]<<8|d[D+2>>0]<<16|d[D+3>>0]<<24;F=F+4|0;F=d[F>>0]|d[F+1>>0]<<8|d[F+2>>0]<<16|d[F+3>>0]<<24;G=k;e=G;a[e>>0]=D;a[e+1>>0]=D>>8;a[e+2>>0]=D>>16;a[e+3>>0]=D>>24;G=G+4|0;a[G>>0]=F;a[G+1>>0]=F>>8;a[G+2>>0]=F>>16;a[G+3>>0]=F>>24;k=k+8|0;if(k>>>0<p>>>0)g=g+8|0;else{g=q;continue d}}}if(p>>>0>y>>>0)break;if(f>>>0<x>>>0){k=f;f=k;while(1){F=g;D=F;D=d[D>>0]|d[D+1>>0]<<8|d[D+2>>0]<<16|d[D+3>>0]<<24;F=F+4|0;F=d[F>>0]|d[F+1>>0]<<8|d[F+2>>0]<<16|d[F+3>>0]<<24;G=f;e=G;a[e>>0]=D;a[e+1>>0]=D>>8;a[e+2>>0]=D>>16;a[e+3>>0]=D>>24;G=G+4|0;a[G>>0]=F;a[G+1>>0]=F>>8;a[G+2>>0]=F>>16;a[G+3>>0]=F>>24;f=f+8|0;if(f>>>0>=x>>>0)break;else g=g+8|0}g=r+(l+(u-k))|0;k=u}while(1){if(k>>>0>=p>>>0){g=q;continue d}a[k>>0]=a[g>>0]|0;g=g+1|0;k=k+1|0}}if((E|0)==76)if(!((j+k|0)!=(A|0)|o>>>0>z>>>0)){gb(r|0,j|0,k|0)|0;G=o-C|0;return G|0}G=b-j+-1|0;return G|0}return 0}function Ua(a,e,f,g){a=a|0;e=e|0;f=f|0;g=g|0;var h=0;h=_(d[a>>0]|d[a+1>>0]<<8|d[a+2>>0]<<16|d[a+3>>0]<<24,-1640531535)|0;if((f|0)==2){b[e+(h>>>19<<1)>>1]=a-g;return}h=h>>>20;switch(f|0){case 0:{c[e+(h<<2)>>2]=a;return}case 1:{c[e+(h<<2)>>2]=a-g;return}default:return}}function Va(b,c,e){b=b|0;c=c|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;j=e+-3|0;h=c;i=b;while(1){c=i;g=h;if(i>>>0>=j>>>0)break;c=d[h>>0]|d[h+1>>0]<<8|d[h+2>>0]<<16|d[h+3>>0]<<24;f=d[i>>0]|d[i+1>>0]<<8|d[i+2>>0]<<16|d[i+3>>0]<<24;if((c|0)!=(f|0)){k=5;break}h=h+4|0;i=i+4|0}if((k|0)==5){b=i+((ib(c^f|0)|0)>>>3)-b|0;return b|0}if(i>>>0<(e+-1|0)>>>0?(d[h>>0]|d[h+1>>0]<<8)<<16>>16==(d[i>>0]|d[i+1>>0]<<8)<<16>>16:0){g=h+2|0;c=i+2|0}f=c;if(f>>>0<e>>>0?(a[g>>0]|0)==(a[f>>0]|0):0)c=f+1|0;b=c-b|0;return b|0}function Wa(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0;if(a&3){a=0;return a|0}db(a|0,0,131072)|0;db(a+131072|0,-1,131072)|0;c[a+262168>>2]=65536;h=b+-65536|0;c[a+262148>>2]=h;c[a+262144>>2]=b;c[a+262152>>2]=h;c[a+262160>>2]=65536;c[a+262164>>2]=65536;if(e>>>0>2113929216)h=0;else h=((e|0)/255|0)+e+16|0;if((h|0)>(f|0)){a=Xa(a,b,d,e,f,g,1)|0;return a|0}else{a=Xa(a,b,d,e,f,g,0)|0;return a|0}return 0}function Xa(f,g,h,i,j,k,l){f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0;m=g+i|0;Y=g+(i+-12)|0;$=g+(i+-5)|0;aa=$;ba=h+j|0;W=1<<((k|0)>16?16:(k|0)<1?9:k)+-1;Q=f+262144|0;c[Q>>2]=(c[Q>>2]|0)+i;Q=f+131072|0;R=f+262148|0;S=f+262152|0;T=f+262160|0;U=f+262164|0;V=f+262168|0;X=(l|0)==0;D=g;l=g+1|0;k=h;i=0;n=0;B=0;C=0;A=0;a:while(1){z=l;o=i;while(1){w=z;if(w>>>0>=Y>>>0){ca=187;break a}i=c[R>>2]|0;g=c[S>>2]|0;x=c[T>>2]|0;l=c[U>>2]|0;y=i;v=z-i|0;v=(l+65536|0)>>>0>v>>>0?l:v+-65535|0;i=z-i|0;l=c[V>>2]|0;while(1){if(l>>>0>=i>>>0)break;P=y+l|0;P=f+((_(d[P>>0]|d[P+1>>0]<<8|d[P+2>>0]<<16|d[P+3>>0]<<24,-1640531535)|0)>>>17<<2)|0;O=l-(c[P>>2]|0)|0;b[Q+((l&65535)<<1)>>1]=O>>>0>65535?65535:O;c[P>>2]=l;l=l+1|0}c[V>>2]=i;t=z;t=d[t>>0]|d[t+1>>0]<<8|d[t+2>>0]<<16|d[t+3>>0]<<24;r=w+4|0;s=y+x|0;u=0;i=W;q=c[f+((_(t,-1640531535)|0)>>>17<<2)>>2]|0;while(1){if(!(q>>>0>=v>>>0&(i|0)!=0))break;p=i+-1|0;if(x>>>0>q>>>0){P=g+q|0;if((d[P>>0]|d[P+1>>0]<<8|d[P+2>>0]<<16|d[P+3>>0]<<24|0)==(t|0)){l=w+(x-q)|0;l=l>>>0>$>>>0?aa:l;i=(Za(r,g+(q+4)|0,l)|0)+4|0;if((w+i|0)==(l|0)&l>>>0<$>>>0)i=i+(Za(l,s,$)|0)|0;if(i>>>0>u>>>0)o=y+q|0;else i=u}else i=u}else{P=y+q|0;l=P;if((a[y+(q+u)>>0]|0)==(a[w+u>>0]|0)?(d[P>>0]|d[P+1>>0]<<8|d[P+2>>0]<<16|d[P+3>>0]<<24|0)==(t|0):0){i=(Za(r,y+(q+4)|0,$)|0)+4|0;P=i>>>0>u>>>0;i=P?i:u;o=P?l:o}else i=u}u=i;i=p;q=q-(e[Q+((q&65535)<<1)>>1]|0)|0}if(u){M=D;g=z;p=u;l=o;H=o;G=z;i=C;break}z=w+1|0}b:while(1){F=G;I=g;K=p;L=l;while(1){E=I;J=E+K|0;if(J>>>0>=Y>>>0){q=n;r=i;ca=46;break b}z=K+-2|0;l=E+z|0;g=c[R>>2]|0;C=c[T>>2]|0;y=g;D=y+C|0;p=c[U>>2]|0;o=l;x=o-g|0;x=(p+65536|0)>>>0>x>>>0?p:x+-65535|0;p=c[S>>2]|0;g=o-g|0;o=c[V>>2]|0;while(1){if(o>>>0>=g>>>0)break;P=y+o|0;P=f+((_(d[P>>0]|d[P+1>>0]<<8|d[P+2>>0]<<16|d[P+3>>0]<<24,-1640531535)|0)>>>17<<2)|0;O=o-(c[P>>2]|0)|0;b[Q+((o&65535)<<1)>>1]=O>>>0>65535?65535:O;c[P>>2]=o;o=o+1|0}c[V>>2]=g;w=d[l>>0]|d[l+1>>0]<<8|d[l+2>>0]<<16|d[l+3>>0]<<24;t=p;v=E+(K+2)|0;p=K;l=W;s=c[f+((_(w,-1640531535)|0)>>>17<<2)>>2]|0;while(1){if(!(s>>>0>=x>>>0&(l|0)!=0)){g=i;break}r=l+-1|0;if(C>>>0>s>>>0){P=t+s|0;if((d[P>>0]|d[P+1>>0]<<8|d[P+2>>0]<<16|d[P+3>>0]<<24|0)==(w|0)){l=E+(z+(C-s))|0;l=l>>>0>$>>>0?aa:l;g=(Za(v,t+(s+4)|0,l)|0)+4|0;if(l>>>0<$>>>0?(E+(z+g)|0)==(l|0):0)g=g+(Za(l,D,$)|0)|0;o=0;while(1){P=z+o|0;q=E+P|0;if(!((P|0)>1&(s+o|0)>>>0>x>>>0))break;l=o+-1|0;if((a[E+(z+l)>>0]|0)==(a[t+(s+l)>>0]|0))o=l;else break}l=g-o|0;if((l|0)>(p|0)){p=l;n=y+(s+o)|0;i=q}}}else if((a[E+(p+1)>>0]|0)==(a[y+(s-(K+-3)+p)>>0]|0)?(P=y+s|0,(d[P>>0]|d[P+1>>0]<<8|d[P+2>>0]<<16|d[P+3>>0]<<24|0)==(w|0)):0){l=(Za(v,y+(s+4)|0,$)|0)+4|0;o=0;while(1){P=z+o|0;q=E+P|0;if(!((P|0)>1&(s+o|0)>(C|0)))break;g=o+-1|0;if((a[E+(z+g)>>0]|0)==(a[y+(s+g)>>0]|0))o=g;else break}l=l-o|0;if((l|0)>(p|0)){p=l;n=y+(s+o)|0;i=q}}l=r;s=s-(e[Q+((s&65535)<<1)>>1]|0)|0}if((p|0)==(K|0)){q=n;r=g;ca=46;break b}P=g;l=F>>>0<E>>>0&P>>>0<(E+u|0)>>>0;o=l?H:L;i=l?G:I;l=l?u:K;if((P-i|0)<3){I=g;K=p;L=n;i=g}else{N=M;O=i;s=l;P=o;l=B;i=A;break}}c:while(1){L=O;I=(s|0)>18;H=L+(s+3)|0;M=L+s|0;o=p;t=l;q=i;while(1){l=g;i=g-O|0;if((i|0)<18?(Z=I?18:s,Z=((L+Z|0)>>>0>(l+(o+-4)|0)>>>0?i+o+-4|0:Z)+(O-g)|0,(Z|0)>0):0){K=o-Z|0;v=n+Z|0;r=l+Z|0}else{K=o;v=n;r=g}G=r;J=G+K|0;if(J>>>0>=Y>>>0){A=q;break b}B=K+-3|0;i=G+B|0;l=c[R>>2]|0;C=c[T>>2]|0;z=l;D=z+C|0;n=c[U>>2]|0;E=i;y=E-l|0;y=(n+65536|0)>>>0>y>>>0?n:y+-65535|0;n=c[S>>2]|0;F=r;l=E-l|0;g=c[V>>2]|0;while(1){if(g>>>0>=l>>>0)break;A=z+g|0;A=f+((_(d[A>>0]|d[A+1>>0]<<8|d[A+2>>0]<<16|d[A+3>>0]<<24,-1640531535)|0)>>>17<<2)|0;x=g-(c[A>>2]|0)|0;b[Q+((g&65535)<<1)>>1]=x>>>0>65535?65535:x;c[A>>2]=g;g=g+1|0}c[V>>2]=l;x=d[i>>0]|d[i+1>>0]<<8|d[i+2>>0]<<16|d[i+3>>0]<<24;w=G+(K+1)|0;p=K;l=W;g=t;A=q;u=c[f+((_(x,-1640531535)|0)>>>17<<2)>>2]|0;while(1){if(!(u>>>0>=y>>>0&(l|0)!=0)){t=g;break}t=l+-1|0;if(C>>>0>u>>>0){q=n+u|0;if((d[q>>0]|d[q+1>>0]<<8|d[q+2>>0]<<16|d[q+3>>0]<<24|0)==(x|0)){i=G+(B+(C-u))|0;i=i>>>0>$>>>0?aa:i;l=(Za(w,n+(u+4)|0,i)|0)+4|0;if(i>>>0<$>>>0?(G+(B+l)|0)==(i|0):0)l=l+(Za(i,D,$)|0)|0;o=0;while(1){q=G+(B+o)|0;if(!(q>>>0>F>>>0&(u+o|0)>>>0>y>>>0))break;i=o+-1|0;if((a[G+(B+i)>>0]|0)==(a[n+(u+i)>>0]|0))o=i;else break}i=l-o|0;if((i|0)>(p|0)){p=i;g=z+(u+o)|0;i=q}else i=A}else i=A}else if((a[F+p>>0]|0)==(a[z+(u+(r-E)+p)>>0]|0)?(q=z+u|0,(d[q>>0]|d[q+1>>0]<<8|d[q+2>>0]<<16|d[q+3>>0]<<24|0)==(x|0)):0){i=(Za(w,z+(u+4)|0,$)|0)+4|0;o=0;while(1){q=G+(B+o)|0;if(!(q>>>0>F>>>0&(u+o|0)>(C|0)))break;l=o+-1|0;if((a[G+(B+l)>>0]|0)==(a[z+(u+l)>>0]|0))o=l;else break}i=i-o|0;if((i|0)>(p|0)){p=i;g=z+(u+o)|0;i=q}else i=A}else i=A;l=t;A=i;u=u-(e[Q+((u&65535)<<1)>>1]|0)|0}if((p|0)==(K|0))break b;i=A;if(i>>>0>=H>>>0)break;if(i>>>0<M>>>0){o=p;n=t;g=A;q=A}else break c}if(G>>>0<M>>>0){i=r-O|0;if((i|0)<15){l=I?18:s;i=(L+l|0)>>>0>(G+(K+-4)|0)>>>0?i+K+-4|0:l;l=i+(O-r)|0;if((l|0)>0){u=i;s=K-l|0;v=v+l|0;r=G+l|0}else{u=i;s=K}}else{u=i;s=K}}else{u=s;s=K}q=O-N|0;i=k+1|0;if(!X?(k+((q>>8)+q+9)|0)>>>0>ba>>>0:0){m=0;ca=196;break a}if((q|0)>14){a[k>>0]=-16;g=O+241|0;n=N+14-O|0;n=O+240+((n|0)>-255?n:-255)-N|0;o=(n>>>0)%255|0;l=q+-15|0;while(1){if((l|0)<=254)break;M=i;a[M>>0]=-1;i=M+1|0;l=l+-255|0}a[i>>0]=g-N+(o-n);i=i+1|0}else a[k>>0]=q<<4;n=i;g=n+q|0;l=i;i=N;while(1){M=i;J=M;J=d[J>>0]|d[J+1>>0]<<8|d[J+2>>0]<<16|d[J+3>>0]<<24;M=M+4|0;M=d[M>>0]|d[M+1>>0]<<8|d[M+2>>0]<<16|d[M+3>>0]<<24;N=l;K=N;a[K>>0]=J;a[K+1>>0]=J>>8;a[K+2>>0]=J>>16;a[K+3>>0]=J>>24;N=N+4|0;a[N>>0]=M;a[N+1>>0]=M>>8;a[N+2>>0]=M>>16;a[N+3>>0]=M>>24;l=l+8|0;if(l>>>0>=g>>>0)break;else i=i+8|0}P=O-P&65535;a[g>>0]=P;a[g+1>>0]=P>>8;P=q+2|0;i=n+P|0;g=u+-4|0;if(!X?(n+(P+((g>>8)+6))|0)>>>0>ba>>>0:0){m=0;ca=196;break a}l=d[k>>0]|0;if((g|0)>14){a[k>>0]=l+15;l=18-u|0;l=u+491+((l|0)>-510?l:-510)|0;g=(l>>>0)%510|0;k=u+-19|0;while(1){if((k|0)<=509)break;P=i;a[P>>0]=-1;a[P+1>>0]=-1;i=P+2|0;k=k+-510|0}k=u+-19+(g-l)|0;if((k|0)>254){a[i>>0]=-1;k=k+-255|0;i=i+1|0}P=i;a[P>>0]=k;k=P+1|0}else{a[k>>0]=l+g;k=i}N=L+u|0;O=r;P=v;n=t;l=t;g=A;i=A}if(G>>>0<M>>>0){L=M;J=L-r|0;u=K-J|0;r=(u|0)<4;u=r?p:u;v=r?t:v+J|0;r=r?A:L}else u=K;o=O-N|0;q=k;k=q+1|0;if(!X?(q+((o>>8)+o+9)|0)>>>0>ba>>>0:0){m=0;ca=196;break a}if((o|0)>14){a[q>>0]=-16;l=O+241|0;g=N+14-O|0;g=O+240+((g|0)>-255?g:-255)-N|0;n=(g>>>0)%255|0;i=o+-15|0;while(1){if((i|0)<=254)break;L=k;a[L>>0]=-1;k=L+1|0;i=i+-255|0}a[k>>0]=l-N+(n-g);k=k+1|0}else a[q>>0]=o<<4;g=k;l=g+o|0;i=k;k=N;while(1){L=k;J=L;J=d[J>>0]|d[J+1>>0]<<8|d[J+2>>0]<<16|d[J+3>>0]<<24;L=L+4|0;L=d[L>>0]|d[L+1>>0]<<8|d[L+2>>0]<<16|d[L+3>>0]<<24;N=i;K=N;a[K>>0]=J;a[K+1>>0]=J>>8;a[K+2>>0]=J>>16;a[K+3>>0]=J>>24;N=N+4|0;a[N>>0]=L;a[N+1>>0]=L>>8;a[N+2>>0]=L>>16;a[N+3>>0]=L>>24;i=i+8|0;if(i>>>0>=l>>>0)break;else k=k+8|0}P=O-P&65535;a[l>>0]=P;a[l+1>>0]=P>>8;P=o+2|0;k=g+P|0;l=s+-4|0;if(!X?(g+(P+((l>>8)+6))|0)>>>0>ba>>>0:0){m=0;ca=196;break a}i=d[q>>0]|0;if((l|0)>14){a[q>>0]=i+15;l=18-s|0;l=s+491+((l|0)>-510?l:-510)|0;g=(l>>>0)%510|0;i=s+-19|0;while(1){if((i|0)<=509)break;P=k;a[P>>0]=-1;a[P+1>>0]=-1;k=P+2|0;i=i+-510|0}i=s+-19+(g-l)|0;if((i|0)>254){a[k>>0]=-1;i=i+-255|0;k=k+1|0}a[k>>0]=i;k=k+1|0}else a[q>>0]=i+l;g=A;l=t;H=v;n=v;B=t;G=r;i=r}if((ca|0)==46){ca=0;p=I-M|0;i=k+1|0;if(!X?(k+((p>>8)+p+9)|0)>>>0>ba>>>0:0){m=0;ca=196;break}if((p|0)>14){a[k>>0]=-16;g=I+241|0;n=M+14-I|0;n=I+240+((n|0)>-255?n:-255)-M|0;o=(n>>>0)%255|0;l=p+-15|0;while(1){if((l|0)<=254)break;P=i;a[P>>0]=-1;i=P+1|0;l=l+-255|0}a[i>>0]=g-M+(o-n);i=i+1|0}else a[k>>0]=p<<4;n=i;g=n+p|0;l=i;i=M;while(1){O=i;M=O;M=d[M>>0]|d[M+1>>0]<<8|d[M+2>>0]<<16|d[M+3>>0]<<24;O=O+4|0;O=d[O>>0]|d[O+1>>0]<<8|d[O+2>>0]<<16|d[O+3>>0]<<24;P=l;N=P;a[N>>0]=M;a[N+1>>0]=M>>8;a[N+2>>0]=M>>16;a[N+3>>0]=M>>24;P=P+4|0;a[P>>0]=O;a[P+1>>0]=O>>8;a[P+2>>0]=O>>16;a[P+3>>0]=O>>24;l=l+8|0;if(l>>>0>=g>>>0)break;else i=i+8|0}P=I-L&65535;a[g>>0]=P;a[g+1>>0]=P>>8;P=p+2|0;i=n+P|0;g=K+-4|0;if(!X?(n+(P+((g>>8)+6))|0)>>>0>ba>>>0:0){m=0;ca=196;break}l=d[k>>0]|0;if((g|0)>14){a[k>>0]=l+15;l=18-K|0;l=K+491+((l|0)>-510?l:-510)|0;g=(l>>>0)%510|0;k=K+-19|0;while(1){if((k|0)<=509)break;P=i;a[P>>0]=-1;a[P+1>>0]=-1;i=P+2|0;k=k+-510|0}k=K+-19+(g-l)|0;if((k|0)>254){a[i>>0]=-1;k=k+-255|0;i=i+1|0}P=i;a[P>>0]=k;k=P+1|0}else{a[k>>0]=l+g;k=i}l=J;D=l;i=L;n=q;C=r;continue}q=G>>>0<M>>>0?r-O|0:s;p=O-N|0;i=k+1|0;if(!X?(k+((p>>8)+p+9)|0)>>>0>ba>>>0:0){m=0;ca=196;break}if((p|0)>14){a[k>>0]=-16;g=O+241|0;n=N+14-O|0;n=O+240+((n|0)>-255?n:-255)-N|0;o=(n>>>0)%255|0;l=p+-15|0;while(1){if((l|0)<=254)break;M=i;a[M>>0]=-1;i=M+1|0;l=l+-255|0}a[i>>0]=g-N+(o-n);i=i+1|0}else a[k>>0]=p<<4;n=i;g=n+p|0;l=i;i=N;while(1){M=i;H=M;H=d[H>>0]|d[H+1>>0]<<8|d[H+2>>0]<<16|d[H+3>>0]<<24;M=M+4|0;M=d[M>>0]|d[M+1>>0]<<8|d[M+2>>0]<<16|d[M+3>>0]<<24;N=l;I=N;a[I>>0]=H;a[I+1>>0]=H>>8;a[I+2>>0]=H>>16;a[I+3>>0]=H>>24;N=N+4|0;a[N>>0]=M;a[N+1>>0]=M>>8;a[N+2>>0]=M>>16;a[N+3>>0]=M>>24;l=l+8|0;if(l>>>0>=g>>>0)break;else i=i+8|0}O=O-P&65535;a[g>>0]=O;a[g+1>>0]=O>>8;O=p+2|0;i=n+O|0;g=q+-4|0;if(!X?(n+(O+((g>>8)+6))|0)>>>0>ba>>>0:0){m=0;ca=196;break}l=d[k>>0]|0;if((g|0)>14){a[k>>0]=l+15;l=18-q|0;l=q+491+((l|0)>-510?l:-510)|0;g=(l>>>0)%510|0;k=q+-19|0;while(1){if((k|0)<=509)break;O=i;a[O>>0]=-1;a[O+1>>0]=-1;i=O+2|0;k=k+-510|0}k=q+-19+(g-l)|0;if((k|0)>254){a[i>>0]=-1;k=k+-255|0;i=i+1|0}a[i>>0]=k;i=i+1|0}else a[k>>0]=l+g;o=L+q|0;p=r-o|0;q=i;k=q+1|0;if(!X?(q+((p>>8)+p+9)|0)>>>0>ba>>>0:0){m=0;ca=196;break}if((p|0)>14){a[q>>0]=-16;l=r+241|0;g=o+14-r|0;g=r+240+((g|0)>-255?g:-255)-o|0;n=(g>>>0)%255|0;i=p+-15|0;while(1){if((i|0)<=254)break;O=k;a[O>>0]=-1;k=O+1|0;i=i+-255|0}a[k>>0]=l-o+(n-g);k=k+1|0}else a[q>>0]=p<<4;g=k;l=g+p|0;i=k;k=o;while(1){N=k;L=N;L=d[L>>0]|d[L+1>>0]<<8|d[L+2>>0]<<16|d[L+3>>0]<<24;N=N+4|0;N=d[N>>0]|d[N+1>>0]<<8|d[N+2>>0]<<16|d[N+3>>0]<<24;O=i;M=O;a[M>>0]=L;a[M+1>>0]=L>>8;a[M+2>>0]=L>>16;a[M+3>>0]=L>>24;O=O+4|0;a[O>>0]=N;a[O+1>>0]=N>>8;a[O+2>>0]=N>>16;a[O+3>>0]=N>>24;i=i+8|0;if(i>>>0>=l>>>0)break;else k=k+8|0}O=r-v&65535;a[l>>0]=O;a[l+1>>0]=O>>8;O=p+2|0;k=g+O|0;l=K+-4|0;if(!X?(g+(O+((l>>8)+6))|0)>>>0>ba>>>0:0){m=0;ca=196;break}i=d[q>>0]|0;if((l|0)>14){a[q>>0]=i+15;l=18-K|0;l=K+491+((l|0)>-510?l:-510)|0;g=(l>>>0)%510|0;i=K+-19|0;while(1){if((i|0)<=509)break;O=k;a[O>>0]=-1;a[O+1>>0]=-1;k=O+2|0;i=i+-510|0}i=K+-19+(g-l)|0;if((i|0)>254){a[k>>0]=-1;i=i+-255|0;k=k+1|0}a[k>>0]=i;k=k+1|0}else a[q>>0]=i+l;l=J;D=l;i=P;n=v;B=t;C=r}if((ca|0)==187){p=D;o=m-D|0;if(!X?(k-h+o+1+(((o+240|0)>>>0)/255|0)|0)>>>0>j>>>0:0){h=0;return h|0}if((o|0)>14){n=k;a[n>>0]=-16;g=m+241|0;i=D+14-m|0;m=m+((i|0)>-255?i:-255)+240-D|0;i=(m>>>0)%255|0;l=o+-15|0;while(1){k=n+1|0;if((l|0)<=254)break;a[k>>0]=-1;n=k;l=l+-255|0}a[k>>0]=g-D+(i-m);m=n+2|0}else{m=k;a[m>>0]=o<<4;k=m;m=m+1|0}gb(m|0,p|0,o|0)|0;h=k+(o+1)-h|0;return h|0}else if((ca|0)==196)return m|0;return 0}function Ya(a,e,f,g,h,i){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;s=e;r=a+262148|0;k=c[r>>2]|0;if(!k){db(a|0,0,131072)|0;db(a+131072|0,-1,131072)|0;c[a+262168>>2]=65536;k=e+-65536|0;c[r>>2]=k;q=a+262144|0;c[q>>2]=s;c[a+262152>>2]=k;c[a+262160>>2]=65536;c[a+262164>>2]=65536;j=e}else{j=a+262144|0;q=j;j=c[j>>2]|0}if((j-k|0)>>>0>2147483648){k=j-k-(c[a+262160>>2]|0)|0;k=k>>>0>65536?65536:k;l=0-k|0;db(a|0,0,131072)|0;db(a+131072|0,-1,131072)|0;m=a+262168|0;c[m>>2]=65536;p=j+(l+-65536)|0;c[a+262148>>2]=p;n=a+262144|0;c[n>>2]=j+l;c[a+262152>>2]=p;c[a+262160>>2]=65536;c[a+262164>>2]=65536;if((k|0)>3){o=k+65533|0;p=65536;while(1){if(p>>>0>=o>>>0)break;t=j+(l+(p+-65536))|0;t=a+((_(d[t>>0]|d[t+1>>0]<<8|d[t+2>>0]<<16|d[t+3>>0]<<24,-1640531535)|0)>>>17<<2)|0;u=p-(c[t>>2]|0)|0;b[a+131072+((p&65535)<<1)>>1]=u>>>0>65535?65535:u;c[t>>2]=p;p=p+1|0}c[m>>2]=o}c[n>>2]=j+(l+k);j=c[q>>2]|0}if((j|0)!=(e|0)){l=a+262144|0;if(j>>>0<((c[r>>2]|0)+4|0)>>>0){k=a+262148|0;j=a+262168|0}else{k=a+262148|0;n=c[k>>2]|0;m=(c[l>>2]|0)+-3-n|0;j=a+262168|0;o=c[j>>2]|0;while(1){if(o>>>0>=m>>>0)break;u=n+o|0;u=a+((_(d[u>>0]|d[u+1>>0]<<8|d[u+2>>0]<<16|d[u+3>>0]<<24,-1640531535)|0)>>>17<<2)|0;t=o-(c[u>>2]|0)|0;b[a+131072+((o&65535)<<1)>>1]=t>>>0>65535?65535:t;c[u>>2]=o;o=o+1|0}c[j>>2]=m}r=a+262160|0;c[a+262164>>2]=c[r>>2];t=c[k>>2]|0;u=(c[l>>2]|0)-t|0;c[r>>2]=u;c[a+262152>>2]=t;c[k>>2]=e+(0-u);c[l>>2]=s;c[j>>2]=u}j=e+g|0;k=c[a+262152>>2]|0;l=a+262164|0;m=c[a+262160>>2]|0;n=k+m|0;if(!(n>>>0>e>>>0?j>>>0>(k+(c[l>>2]|0)|0)>>>0:0)){u=a+262172|0;u=c[u>>2]|0;u=Xa(a,e,f,g,h,u,i)|0;return u|0}u=(j>>>0>n>>>0?n:j)-k|0;c[l>>2]=u;c[l>>2]=(m-u|0)>>>0<4?m:u;u=a+262172|0;u=c[u>>2]|0;u=Xa(a,e,f,g,h,u,i)|0;return u|0}function Za(b,c,e){b=b|0;c=c|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;j=e+-3|0;h=c;i=b;while(1){c=i;g=h;if(i>>>0>=j>>>0)break;c=d[h>>0]|d[h+1>>0]<<8|d[h+2>>0]<<16|d[h+3>>0]<<24;f=d[i>>0]|d[i+1>>0]<<8|d[i+2>>0]<<16|d[i+3>>0]<<24;if((c|0)!=(f|0)){k=5;break}h=h+4|0;i=i+4|0}if((k|0)==5){b=i+((ib(c^f|0)|0)>>>3)-b|0;return b|0}if(i>>>0<(e+-1|0)>>>0?(d[h>>0]|d[h+1>>0]<<8)<<16>>16==(d[i>>0]|d[i+1>>0]<<8)<<16>>16:0){g=h+2|0;c=i+2|0}f=c;if(f>>>0<e>>>0?(a[g>>0]|0)==(a[f>>0]|0):0)c=f+1|0;b=c-b|0;return b|0}function _a(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;do if(a>>>0<245){o=a>>>0<11?16:a+11&-8;a=o>>>3;i=c[57]|0;b=i>>>a;if(b&3){b=(b&1^1)+a|0;e=b<<1;d=268+(e<<2)|0;e=268+(e+2<<2)|0;f=c[e>>2]|0;g=f+8|0;h=c[g>>2]|0;do if((d|0)!=(h|0)){if(h>>>0<(c[61]|0)>>>0)ga();a=h+12|0;if((c[a>>2]|0)==(f|0)){c[a>>2]=d;c[e>>2]=h;break}else ga()}else c[57]=i&~(1<<b);while(0);L=b<<3;c[f+4>>2]=L|3;L=f+(L|4)|0;c[L>>2]=c[L>>2]|1;L=g;return L|0}h=c[59]|0;if(o>>>0>h>>>0){if(b){e=2<<a;e=b<<a&(e|0-e);e=(e&0-e)+-1|0;j=e>>>12&16;e=e>>>j;f=e>>>5&8;e=e>>>f;g=e>>>2&4;e=e>>>g;d=e>>>1&2;e=e>>>d;b=e>>>1&1;b=(f|j|g|d|b)+(e>>>b)|0;e=b<<1;d=268+(e<<2)|0;e=268+(e+2<<2)|0;g=c[e>>2]|0;j=g+8|0;f=c[j>>2]|0;do if((d|0)!=(f|0)){if(f>>>0<(c[61]|0)>>>0)ga();a=f+12|0;if((c[a>>2]|0)==(g|0)){c[a>>2]=d;c[e>>2]=f;k=c[59]|0;break}else ga()}else{c[57]=i&~(1<<b);k=h}while(0);L=b<<3;h=L-o|0;c[g+4>>2]=o|3;i=g+o|0;c[g+(o|4)>>2]=h|1;c[g+L>>2]=h;if(k){f=c[62]|0;d=k>>>3;a=d<<1;e=268+(a<<2)|0;b=c[57]|0;d=1<<d;if(b&d){b=268+(a+2<<2)|0;a=c[b>>2]|0;if(a>>>0<(c[61]|0)>>>0)ga();else{l=b;m=a}}else{c[57]=b|d;l=268+(a+2<<2)|0;m=e}c[l>>2]=f;c[m+12>>2]=f;c[f+8>>2]=m;c[f+12>>2]=e}c[59]=h;c[62]=i;L=j;return L|0}a=c[58]|0;if(a){i=(a&0-a)+-1|0;K=i>>>12&16;i=i>>>K;J=i>>>5&8;i=i>>>J;L=i>>>2&4;i=i>>>L;b=i>>>1&2;i=i>>>b;j=i>>>1&1;j=c[532+((J|K|L|b|j)+(i>>>j)<<2)>>2]|0;i=(c[j+4>>2]&-8)-o|0;b=j;while(1){a=c[b+16>>2]|0;if(!a){a=c[b+20>>2]|0;if(!a)break}b=(c[a+4>>2]&-8)-o|0;L=b>>>0<i>>>0;i=L?b:i;b=a;j=L?a:j}f=c[61]|0;if(j>>>0<f>>>0)ga();h=j+o|0;if(j>>>0>=h>>>0)ga();g=c[j+24>>2]|0;d=c[j+12>>2]|0;do if((d|0)==(j|0)){b=j+20|0;a=c[b>>2]|0;if(!a){b=j+16|0;a=c[b>>2]|0;if(!a){n=0;break}}while(1){d=a+20|0;e=c[d>>2]|0;if(e){a=e;b=d;continue}d=a+16|0;e=c[d>>2]|0;if(!e)break;else{a=e;b=d}}if(b>>>0<f>>>0)ga();else{c[b>>2]=0;n=a;break}}else{e=c[j+8>>2]|0;if(e>>>0<f>>>0)ga();a=e+12|0;if((c[a>>2]|0)!=(j|0))ga();b=d+8|0;if((c[b>>2]|0)==(j|0)){c[a>>2]=d;c[b>>2]=e;n=d;break}else ga()}while(0);do if(g){a=c[j+28>>2]|0;b=532+(a<<2)|0;if((j|0)==(c[b>>2]|0)){c[b>>2]=n;if(!n){c[58]=c[58]&~(1<<a);break}}else{if(g>>>0<(c[61]|0)>>>0)ga();a=g+16|0;if((c[a>>2]|0)==(j|0))c[a>>2]=n;else c[g+20>>2]=n;if(!n)break}b=c[61]|0;if(n>>>0<b>>>0)ga();c[n+24>>2]=g;a=c[j+16>>2]|0;do if(a)if(a>>>0<b>>>0)ga();else{c[n+16>>2]=a;c[a+24>>2]=n;break}while(0);a=c[j+20>>2]|0;if(a)if(a>>>0<(c[61]|0)>>>0)ga();else{c[n+20>>2]=a;c[a+24>>2]=n;break}}while(0);if(i>>>0<16){L=i+o|0;c[j+4>>2]=L|3;L=j+(L+4)|0;c[L>>2]=c[L>>2]|1}else{c[j+4>>2]=o|3;c[j+(o|4)>>2]=i|1;c[j+(i+o)>>2]=i;a=c[59]|0;if(a){f=c[62]|0;d=a>>>3;a=d<<1;e=268+(a<<2)|0;b=c[57]|0;d=1<<d;if(b&d){a=268+(a+2<<2)|0;b=c[a>>2]|0;if(b>>>0<(c[61]|0)>>>0)ga();else{p=a;q=b}}else{c[57]=b|d;p=268+(a+2<<2)|0;q=e}c[p>>2]=f;c[q+12>>2]=f;c[f+8>>2]=q;c[f+12>>2]=e}c[59]=i;c[62]=h}L=j+8|0;return L|0}}}else if(a>>>0<=4294967231){a=a+11|0;o=a&-8;j=c[58]|0;if(j){b=0-o|0;a=a>>>8;if(a)if(o>>>0>16777215)i=31;else{q=(a+1048320|0)>>>16&8;x=a<<q;p=(x+520192|0)>>>16&4;x=x<<p;i=(x+245760|0)>>>16&2;i=14-(p|q|i)+(x<<i>>>15)|0;i=o>>>(i+7|0)&1|i<<1}else i=0;a=c[532+(i<<2)>>2]|0;a:do if(!a){d=0;a=0;x=86}else{f=b;d=0;g=o<<((i|0)==31?0:25-(i>>>1)|0);h=a;a=0;while(1){e=c[h+4>>2]&-8;b=e-o|0;if(b>>>0<f>>>0)if((e|0)==(o|0)){e=h;a=h;x=90;break a}else a=h;else b=f;x=c[h+20>>2]|0;h=c[h+16+(g>>>31<<2)>>2]|0;d=(x|0)==0|(x|0)==(h|0)?d:x;if(!h){x=86;break}else{f=b;g=g<<1}}}while(0);if((x|0)==86){if((d|0)==0&(a|0)==0){a=2<<i;a=j&(a|0-a);if(!a)break;a=(a&0-a)+-1|0;n=a>>>12&16;a=a>>>n;m=a>>>5&8;a=a>>>m;p=a>>>2&4;a=a>>>p;q=a>>>1&2;a=a>>>q;d=a>>>1&1;d=c[532+((m|n|p|q|d)+(a>>>d)<<2)>>2]|0;a=0}if(!d){i=b;j=a}else{e=d;x=90}}if((x|0)==90)while(1){x=0;q=(c[e+4>>2]&-8)-o|0;d=q>>>0<b>>>0;b=d?q:b;a=d?e:a;d=c[e+16>>2]|0;if(d){e=d;x=90;continue}e=c[e+20>>2]|0;if(!e){i=b;j=a;break}else x=90}if((j|0)!=0?i>>>0<((c[59]|0)-o|0)>>>0:0){f=c[61]|0;if(j>>>0<f>>>0)ga();h=j+o|0;if(j>>>0>=h>>>0)ga();g=c[j+24>>2]|0;d=c[j+12>>2]|0;do if((d|0)==(j|0)){b=j+20|0;a=c[b>>2]|0;if(!a){b=j+16|0;a=c[b>>2]|0;if(!a){s=0;break}}while(1){d=a+20|0;e=c[d>>2]|0;if(e){a=e;b=d;continue}d=a+16|0;e=c[d>>2]|0;if(!e)break;else{a=e;b=d}}if(b>>>0<f>>>0)ga();else{c[b>>2]=0;s=a;break}}else{e=c[j+8>>2]|0;if(e>>>0<f>>>0)ga();a=e+12|0;if((c[a>>2]|0)!=(j|0))ga();b=d+8|0;if((c[b>>2]|0)==(j|0)){c[a>>2]=d;c[b>>2]=e;s=d;break}else ga()}while(0);do if(g){a=c[j+28>>2]|0;b=532+(a<<2)|0;if((j|0)==(c[b>>2]|0)){c[b>>2]=s;if(!s){c[58]=c[58]&~(1<<a);break}}else{if(g>>>0<(c[61]|0)>>>0)ga();a=g+16|0;if((c[a>>2]|0)==(j|0))c[a>>2]=s;else c[g+20>>2]=s;if(!s)break}b=c[61]|0;if(s>>>0<b>>>0)ga();c[s+24>>2]=g;a=c[j+16>>2]|0;do if(a)if(a>>>0<b>>>0)ga();else{c[s+16>>2]=a;c[a+24>>2]=s;break}while(0);a=c[j+20>>2]|0;if(a)if(a>>>0<(c[61]|0)>>>0)ga();else{c[s+20>>2]=a;c[a+24>>2]=s;break}}while(0);b:do if(i>>>0>=16){c[j+4>>2]=o|3;c[j+(o|4)>>2]=i|1;c[j+(i+o)>>2]=i;a=i>>>3;if(i>>>0<256){b=a<<1;e=268+(b<<2)|0;d=c[57]|0;a=1<<a;if(d&a){a=268+(b+2<<2)|0;b=c[a>>2]|0;if(b>>>0<(c[61]|0)>>>0)ga();else{t=a;u=b}}else{c[57]=d|a;t=268+(b+2<<2)|0;u=e}c[t>>2]=h;c[u+12>>2]=h;c[j+(o+8)>>2]=u;c[j+(o+12)>>2]=e;break}a=i>>>8;if(a)if(i>>>0>16777215)e=31;else{K=(a+1048320|0)>>>16&8;L=a<<K;J=(L+520192|0)>>>16&4;L=L<<J;e=(L+245760|0)>>>16&2;e=14-(J|K|e)+(L<<e>>>15)|0;e=i>>>(e+7|0)&1|e<<1}else e=0;a=532+(e<<2)|0;c[j+(o+28)>>2]=e;c[j+(o+20)>>2]=0;c[j+(o+16)>>2]=0;b=c[58]|0;d=1<<e;if(!(b&d)){c[58]=b|d;c[a>>2]=h;c[j+(o+24)>>2]=a;c[j+(o+12)>>2]=h;c[j+(o+8)>>2]=h;break}a=c[a>>2]|0;c:do if((c[a+4>>2]&-8|0)!=(i|0)){e=i<<((e|0)==31?0:25-(e>>>1)|0);while(1){d=a+16+(e>>>31<<2)|0;b=c[d>>2]|0;if(!b)break;if((c[b+4>>2]&-8|0)==(i|0)){w=b;break c}else{e=e<<1;a=b}}if(d>>>0<(c[61]|0)>>>0)ga();else{c[d>>2]=h;c[j+(o+24)>>2]=a;c[j+(o+12)>>2]=h;c[j+(o+8)>>2]=h;break b}}else w=a;while(0);a=w+8|0;b=c[a>>2]|0;L=c[61]|0;if(b>>>0>=L>>>0&w>>>0>=L>>>0){c[b+12>>2]=h;c[a>>2]=h;c[j+(o+8)>>2]=b;c[j+(o+12)>>2]=w;c[j+(o+24)>>2]=0;break}else ga()}else{L=i+o|0;c[j+4>>2]=L|3;L=j+(L+4)|0;c[L>>2]=c[L>>2]|1}while(0);L=j+8|0;return L|0}}}else o=-1;while(0);d=c[59]|0;if(d>>>0>=o>>>0){a=d-o|0;b=c[62]|0;if(a>>>0>15){c[62]=b+o;c[59]=a;c[b+(o+4)>>2]=a|1;c[b+d>>2]=a;c[b+4>>2]=o|3}else{c[59]=0;c[62]=0;c[b+4>>2]=d|3;L=b+(d+4)|0;c[L>>2]=c[L>>2]|1}L=b+8|0;return L|0}a=c[60]|0;if(a>>>0>o>>>0){K=a-o|0;c[60]=K;L=c[63]|0;c[63]=L+o;c[L+(o+4)>>2]=K|1;c[L+4>>2]=o|3;L=L+8|0;return L|0}do if(!(c[175]|0)){a=ea(30)|0;if(!(a+-1&a)){c[177]=a;c[176]=a;c[178]=-1;c[179]=-1;c[180]=0;c[168]=0;c[175]=(ja(0)|0)&-16^1431655768;break}else ga()}while(0);g=o+48|0;f=c[177]|0;h=o+47|0;e=f+h|0;f=0-f|0;i=e&f;if(i>>>0<=o>>>0){L=0;return L|0}a=c[167]|0;if((a|0)!=0?(u=c[165]|0,w=u+i|0,w>>>0<=u>>>0|w>>>0>a>>>0):0){L=0;return L|0}d:do if(!(c[168]&4)){d=c[63]|0;e:do if(d){a=676;while(1){b=c[a>>2]|0;if(b>>>0<=d>>>0?(r=a+4|0,(b+(c[r>>2]|0)|0)>>>0>d>>>0):0)break;a=c[a+8>>2]|0;if(!a){x=174;break e}}b=e-(c[60]|0)&f;if(b>>>0<2147483647){d=ia(b|0)|0;w=(d|0)==((c[a>>2]|0)+(c[r>>2]|0)|0);a=w?b:0;if(w){if((d|0)!=(-1|0)){r=d;q=a;x=194;break d}}else x=184}else a=0}else x=174;while(0);do if((x|0)==174){e=ia(0)|0;if((e|0)!=(-1|0)){a=e;b=c[176]|0;d=b+-1|0;if(!(d&a))b=i;else b=i-a+(d+a&0-b)|0;a=c[165]|0;d=a+b|0;if(b>>>0>o>>>0&b>>>0<2147483647){w=c[167]|0;if((w|0)!=0?d>>>0<=a>>>0|d>>>0>w>>>0:0){a=0;break}d=ia(b|0)|0;x=(d|0)==(e|0);a=x?b:0;if(x){r=e;q=a;x=194;break d}else x=184}else a=0}else a=0}while(0);f:do if((x|0)==184){e=0-b|0;do if(g>>>0>b>>>0&(b>>>0<2147483647&(d|0)!=(-1|0))?(v=c[177]|0,v=h-b+v&0-v,v>>>0<2147483647):0)if((ia(v|0)|0)==(-1|0)){ia(e|0)|0;break f}else{b=v+b|0;break}while(0);if((d|0)!=(-1|0)){r=d;q=b;x=194;break d}}while(0);c[168]=c[168]|4;x=191}else{a=0;x=191}while(0);if((((x|0)==191?i>>>0<2147483647:0)?(y=ia(i|0)|0,z=ia(0)|0,y>>>0<z>>>0&((y|0)!=(-1|0)&(z|0)!=(-1|0))):0)?(A=z-y|0,B=A>>>0>(o+40|0)>>>0,B):0){r=y;q=B?A:a;x=194}if((x|0)==194){a=(c[165]|0)+q|0;c[165]=a;if(a>>>0>(c[166]|0)>>>0)c[166]=a;h=c[63]|0;g:do if(h){f=676;while(1){a=c[f>>2]|0;b=f+4|0;d=c[b>>2]|0;if((r|0)==(a+d|0)){x=204;break}e=c[f+8>>2]|0;if(!e)break;else f=e}if(((x|0)==204?(c[f+12>>2]&8|0)==0:0)?h>>>0<r>>>0&h>>>0>=a>>>0:0){c[b>>2]=d+q;L=(c[60]|0)+q|0;K=h+8|0;K=(K&7|0)==0?0:0-K&7;J=L-K|0;c[63]=h+K;c[60]=J;c[h+(K+4)>>2]=J|1;c[h+(L+4)>>2]=40;c[64]=c[179];break}a=c[61]|0;if(r>>>0<a>>>0){c[61]=r;j=r}else j=a;b=r+q|0;a=676;while(1){if((c[a>>2]|0)==(b|0)){x=212;break}a=c[a+8>>2]|0;if(!a){b=676;break}}if((x|0)==212)if(!(c[a+12>>2]&8)){c[a>>2]=r;n=a+4|0;c[n>>2]=(c[n>>2]|0)+q;n=r+8|0;n=(n&7|0)==0?0:0-n&7;k=r+(q+8)|0;k=(k&7|0)==0?0:0-k&7;a=r+(k+q)|0;m=n+o|0;p=r+m|0;l=a-(r+n)-o|0;c[r+(n+4)>>2]=o|3;h:do if((a|0)!=(h|0)){if((a|0)==(c[62]|0)){L=(c[59]|0)+l|0;c[59]=L;c[62]=p;c[r+(m+4)>>2]=L|1;c[r+(L+m)>>2]=L;break}h=q+4|0;b=c[r+(h+k)>>2]|0;if((b&3|0)==1){i=b&-8;f=b>>>3;i:do if(b>>>0>=256){g=c[r+((k|24)+q)>>2]|0;e=c[r+(q+12+k)>>2]|0;do if((e|0)==(a|0)){d=k|16;e=r+(h+d)|0;b=c[e>>2]|0;if(!b){d=r+(d+q)|0;b=c[d>>2]|0;if(!b){I=0;break}}else d=e;while(1){e=b+20|0;f=c[e>>2]|0;if(f){b=f;d=e;continue}e=b+16|0;f=c[e>>2]|0;if(!f)break;else{b=f;d=e}}if(d>>>0<j>>>0)ga();else{c[d>>2]=0;I=b;break}}else{f=c[r+((k|8)+q)>>2]|0;if(f>>>0<j>>>0)ga();b=f+12|0;if((c[b>>2]|0)!=(a|0))ga();d=e+8|0;if((c[d>>2]|0)==(a|0)){c[b>>2]=e;c[d>>2]=f;I=e;break}else ga()}while(0);if(!g)break;b=c[r+(q+28+k)>>2]|0;d=532+(b<<2)|0;do if((a|0)!=(c[d>>2]|0)){if(g>>>0<(c[61]|0)>>>0)ga();b=g+16|0;if((c[b>>2]|0)==(a|0))c[b>>2]=I;else c[g+20>>2]=I;if(!I)break i}else{c[d>>2]=I;if(I)break;c[58]=c[58]&~(1<<b);break i}while(0);d=c[61]|0;if(I>>>0<d>>>0)ga();c[I+24>>2]=g;a=k|16;b=c[r+(a+q)>>2]|0;do if(b)if(b>>>0<d>>>0)ga();else{c[I+16>>2]=b;c[b+24>>2]=I;break}while(0);a=c[r+(h+a)>>2]|0;if(!a)break;if(a>>>0<(c[61]|0)>>>0)ga();else{c[I+20>>2]=a;c[a+24>>2]=I;break}}else{d=c[r+((k|8)+q)>>2]|0;e=c[r+(q+12+k)>>2]|0;b=268+(f<<1<<2)|0;do if((d|0)!=(b|0)){if(d>>>0<j>>>0)ga();if((c[d+12>>2]|0)==(a|0))break;ga()}while(0);if((e|0)==(d|0)){c[57]=c[57]&~(1<<f);break}do if((e|0)==(b|0))E=e+8|0;else{if(e>>>0<j>>>0)ga();b=e+8|0;if((c[b>>2]|0)==(a|0)){E=b;break}ga()}while(0);c[d+12>>2]=e;c[E>>2]=d}while(0);a=r+((i|k)+q)|0;f=i+l|0}else f=l;a=a+4|0;c[a>>2]=c[a>>2]&-2;c[r+(m+4)>>2]=f|1;c[r+(f+m)>>2]=f;a=f>>>3;if(f>>>0<256){b=a<<1;e=268+(b<<2)|0;d=c[57]|0;a=1<<a;do if(!(d&a)){c[57]=d|a;J=268+(b+2<<2)|0;K=e}else{a=268+(b+2<<2)|0;b=c[a>>2]|0;if(b>>>0>=(c[61]|0)>>>0){J=a;K=b;break}ga()}while(0);c[J>>2]=p;c[K+12>>2]=p;c[r+(m+8)>>2]=K;c[r+(m+12)>>2]=e;break}a=f>>>8;do if(!a)e=0;else{if(f>>>0>16777215){e=31;break}J=(a+1048320|0)>>>16&8;K=a<<J;I=(K+520192|0)>>>16&4;K=K<<I;e=(K+245760|0)>>>16&2;e=14-(I|J|e)+(K<<e>>>15)|0;e=f>>>(e+7|0)&1|e<<1}while(0);a=532+(e<<2)|0;c[r+(m+28)>>2]=e;c[r+(m+20)>>2]=0;c[r+(m+16)>>2]=0;b=c[58]|0;d=1<<e;if(!(b&d)){c[58]=b|d;c[a>>2]=p;c[r+(m+24)>>2]=a;c[r+(m+12)>>2]=p;c[r+(m+8)>>2]=p;break}a=c[a>>2]|0;j:do if((c[a+4>>2]&-8|0)!=(f|0)){e=f<<((e|0)==31?0:25-(e>>>1)|0);while(1){d=a+16+(e>>>31<<2)|0;b=c[d>>2]|0;if(!b)break;if((c[b+4>>2]&-8|0)==(f|0)){L=b;break j}else{e=e<<1;a=b}}if(d>>>0<(c[61]|0)>>>0)ga();else{c[d>>2]=p;c[r+(m+24)>>2]=a;c[r+(m+12)>>2]=p;c[r+(m+8)>>2]=p;break h}}else L=a;while(0);a=L+8|0;b=c[a>>2]|0;K=c[61]|0;if(b>>>0>=K>>>0&L>>>0>=K>>>0){c[b+12>>2]=p;c[a>>2]=p;c[r+(m+8)>>2]=b;c[r+(m+12)>>2]=L;c[r+(m+24)>>2]=0;break}else ga()}else{L=(c[60]|0)+l|0;c[60]=L;c[63]=p;c[r+(m+4)>>2]=L|1}while(0);L=r+(n|8)|0;return L|0}else b=676;while(1){a=c[b>>2]|0;if(a>>>0<=h>>>0?(C=c[b+4>>2]|0,D=a+C|0,D>>>0>h>>>0):0)break;b=c[b+8>>2]|0}b=a+(C+-39)|0;b=a+(C+-47+((b&7|0)==0?0:0-b&7))|0;f=h+16|0;b=b>>>0<f>>>0?h:b;a=b+8|0;d=r+8|0;d=(d&7|0)==0?0:0-d&7;L=q+-40-d|0;c[63]=r+d;c[60]=L;c[r+(d+4)>>2]=L|1;c[r+(q+-36)>>2]=40;c[64]=c[179];d=b+4|0;c[d>>2]=27;c[a>>2]=c[169];c[a+4>>2]=c[170];c[a+8>>2]=c[171];c[a+12>>2]=c[172];c[169]=r;c[170]=q;c[172]=0;c[171]=a;a=b+28|0;c[a>>2]=7;if((b+32|0)>>>0<D>>>0)do{L=a;a=a+4|0;c[a>>2]=7}while((L+8|0)>>>0<D>>>0);if((b|0)!=(h|0)){g=b-h|0;c[d>>2]=c[d>>2]&-2;c[h+4>>2]=g|1;c[b>>2]=g;a=g>>>3;if(g>>>0<256){b=a<<1;e=268+(b<<2)|0;d=c[57]|0;a=1<<a;if(d&a){a=268+(b+2<<2)|0;b=c[a>>2]|0;if(b>>>0<(c[61]|0)>>>0)ga();else{F=a;G=b}}else{c[57]=d|a;F=268+(b+2<<2)|0;G=e}c[F>>2]=h;c[G+12>>2]=h;c[h+8>>2]=G;c[h+12>>2]=e;break}a=g>>>8;if(a)if(g>>>0>16777215)e=31;else{K=(a+1048320|0)>>>16&8;L=a<<K;J=(L+520192|0)>>>16&4;L=L<<J;e=(L+245760|0)>>>16&2;e=14-(J|K|e)+(L<<e>>>15)|0;e=g>>>(e+7|0)&1|e<<1}else e=0;d=532+(e<<2)|0;c[h+28>>2]=e;c[h+20>>2]=0;c[f>>2]=0;a=c[58]|0;b=1<<e;if(!(a&b)){c[58]=a|b;c[d>>2]=h;c[h+24>>2]=d;c[h+12>>2]=h;c[h+8>>2]=h;break}a=c[d>>2]|0;k:do if((c[a+4>>2]&-8|0)!=(g|0)){e=g<<((e|0)==31?0:25-(e>>>1)|0);while(1){d=a+16+(e>>>31<<2)|0;b=c[d>>2]|0;if(!b)break;if((c[b+4>>2]&-8|0)==(g|0)){H=b;break k}else{e=e<<1;a=b}}if(d>>>0<(c[61]|0)>>>0)ga();else{c[d>>2]=h;c[h+24>>2]=a;c[h+12>>2]=h;c[h+8>>2]=h;break g}}else H=a;while(0);a=H+8|0;b=c[a>>2]|0;L=c[61]|0;if(b>>>0>=L>>>0&H>>>0>=L>>>0){c[b+12>>2]=h;c[a>>2]=h;c[h+8>>2]=b;c[h+12>>2]=H;c[h+24>>2]=0;break}else ga()}}else{L=c[61]|0;if((L|0)==0|r>>>0<L>>>0)c[61]=r;c[169]=r;c[170]=q;c[172]=0;c[66]=c[175];c[65]=-1;a=0;do{L=a<<1;K=268+(L<<2)|0;c[268+(L+3<<2)>>2]=K;c[268+(L+2<<2)>>2]=K;a=a+1|0}while((a|0)!=32);L=r+8|0;L=(L&7|0)==0?0:0-L&7;K=q+-40-L|0;c[63]=r+L;c[60]=K;c[r+(L+4)>>2]=K|1;c[r+(q+-36)>>2]=40;c[64]=c[179]}while(0);a=c[60]|0;if(a>>>0>o>>>0){K=a-o|0;c[60]=K;L=c[63]|0;c[63]=L+o;c[L+(o+4)>>2]=K|1;c[L+4>>2]=o|3;L=L+8|0;return L|0}}if(!(c[45]|0))a=224;else a=c[(fa()|0)+60>>2]|0;c[a>>2]=12;L=0;return L|0}function $a(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if(!a)return;b=a+-8|0;i=c[61]|0;if(b>>>0<i>>>0)ga();d=c[a+-4>>2]|0;e=d&3;if((e|0)==1)ga();o=d&-8;q=a+(o+-8)|0;do if(!(d&1)){b=c[b>>2]|0;if(!e)return;j=-8-b|0;l=a+j|0;m=b+o|0;if(l>>>0<i>>>0)ga();if((l|0)==(c[62]|0)){b=a+(o+-4)|0;d=c[b>>2]|0;if((d&3|0)!=3){u=l;g=m;break}c[59]=m;c[b>>2]=d&-2;c[a+(j+4)>>2]=m|1;c[q>>2]=m;return}f=b>>>3;if(b>>>0<256){e=c[a+(j+8)>>2]|0;d=c[a+(j+12)>>2]|0;b=268+(f<<1<<2)|0;if((e|0)!=(b|0)){if(e>>>0<i>>>0)ga();if((c[e+12>>2]|0)!=(l|0))ga()}if((d|0)==(e|0)){c[57]=c[57]&~(1<<f);u=l;g=m;break}if((d|0)!=(b|0)){if(d>>>0<i>>>0)ga();b=d+8|0;if((c[b>>2]|0)==(l|0))h=b;else ga()}else h=d+8|0;c[e+12>>2]=d;c[h>>2]=e;u=l;g=m;break}h=c[a+(j+24)>>2]|0;e=c[a+(j+12)>>2]|0;do if((e|0)==(l|0)){d=a+(j+20)|0;b=c[d>>2]|0;if(!b){d=a+(j+16)|0;b=c[d>>2]|0;if(!b){k=0;break}}while(1){e=b+20|0;f=c[e>>2]|0;if(f){b=f;d=e;continue}e=b+16|0;f=c[e>>2]|0;if(!f)break;else{b=f;d=e}}if(d>>>0<i>>>0)ga();else{c[d>>2]=0;k=b;break}}else{f=c[a+(j+8)>>2]|0;if(f>>>0<i>>>0)ga();b=f+12|0;if((c[b>>2]|0)!=(l|0))ga();d=e+8|0;if((c[d>>2]|0)==(l|0)){c[b>>2]=e;c[d>>2]=f;k=e;break}else ga()}while(0);if(h){b=c[a+(j+28)>>2]|0;d=532+(b<<2)|0;if((l|0)==(c[d>>2]|0)){c[d>>2]=k;if(!k){c[58]=c[58]&~(1<<b);u=l;g=m;break}}else{if(h>>>0<(c[61]|0)>>>0)ga();b=h+16|0;if((c[b>>2]|0)==(l|0))c[b>>2]=k;else c[h+20>>2]=k;if(!k){u=l;g=m;break}}d=c[61]|0;if(k>>>0<d>>>0)ga();c[k+24>>2]=h;b=c[a+(j+16)>>2]|0;do if(b)if(b>>>0<d>>>0)ga();else{c[k+16>>2]=b;c[b+24>>2]=k;break}while(0);b=c[a+(j+20)>>2]|0;if(b)if(b>>>0<(c[61]|0)>>>0)ga();else{c[k+20>>2]=b;c[b+24>>2]=k;u=l;g=m;break}else{u=l;g=m}}else{u=l;g=m}}else{u=b;g=o}while(0);if(u>>>0>=q>>>0)ga();b=a+(o+-4)|0;d=c[b>>2]|0;if(!(d&1))ga();if(!(d&2)){if((q|0)==(c[63]|0)){t=(c[60]|0)+g|0;c[60]=t;c[63]=u;c[u+4>>2]=t|1;if((u|0)!=(c[62]|0))return;c[62]=0;c[59]=0;return}if((q|0)==(c[62]|0)){t=(c[59]|0)+g|0;c[59]=t;c[62]=u;c[u+4>>2]=t|1;c[u+t>>2]=t;return}g=(d&-8)+g|0;f=d>>>3;do if(d>>>0>=256){h=c[a+(o+16)>>2]|0;b=c[a+(o|4)>>2]|0;do if((b|0)==(q|0)){d=a+(o+12)|0;b=c[d>>2]|0;if(!b){d=a+(o+8)|0;b=c[d>>2]|0;if(!b){p=0;break}}while(1){e=b+20|0;f=c[e>>2]|0;if(f){b=f;d=e;continue}e=b+16|0;f=c[e>>2]|0;if(!f)break;else{b=f;d=e}}if(d>>>0<(c[61]|0)>>>0)ga();else{c[d>>2]=0;p=b;break}}else{d=c[a+o>>2]|0;if(d>>>0<(c[61]|0)>>>0)ga();e=d+12|0;if((c[e>>2]|0)!=(q|0))ga();f=b+8|0;if((c[f>>2]|0)==(q|0)){c[e>>2]=b;c[f>>2]=d;p=b;break}else ga()}while(0);if(h){b=c[a+(o+20)>>2]|0;d=532+(b<<2)|0;if((q|0)==(c[d>>2]|0)){c[d>>2]=p;if(!p){c[58]=c[58]&~(1<<b);break}}else{if(h>>>0<(c[61]|0)>>>0)ga();b=h+16|0;if((c[b>>2]|0)==(q|0))c[b>>2]=p;else c[h+20>>2]=p;if(!p)break}d=c[61]|0;if(p>>>0<d>>>0)ga();c[p+24>>2]=h;b=c[a+(o+8)>>2]|0;do if(b)if(b>>>0<d>>>0)ga();else{c[p+16>>2]=b;c[b+24>>2]=p;break}while(0);b=c[a+(o+12)>>2]|0;if(b)if(b>>>0<(c[61]|0)>>>0)ga();else{c[p+20>>2]=b;c[b+24>>2]=p;break}}}else{e=c[a+o>>2]|0;d=c[a+(o|4)>>2]|0;b=268+(f<<1<<2)|0;if((e|0)!=(b|0)){if(e>>>0<(c[61]|0)>>>0)ga();if((c[e+12>>2]|0)!=(q|0))ga()}if((d|0)==(e|0)){c[57]=c[57]&~(1<<f);break}if((d|0)!=(b|0)){if(d>>>0<(c[61]|0)>>>0)ga();b=d+8|0;if((c[b>>2]|0)==(q|0))n=b;else ga()}else n=d+8|0;c[e+12>>2]=d;c[n>>2]=e}while(0);c[u+4>>2]=g|1;c[u+g>>2]=g;if((u|0)==(c[62]|0)){c[59]=g;return}}else{c[b>>2]=d&-2;c[u+4>>2]=g|1;c[u+g>>2]=g}b=g>>>3;if(g>>>0<256){d=b<<1;f=268+(d<<2)|0;e=c[57]|0;b=1<<b;if(e&b){b=268+(d+2<<2)|0;d=c[b>>2]|0;if(d>>>0<(c[61]|0)>>>0)ga();else{r=b;s=d}}else{c[57]=e|b;r=268+(d+2<<2)|0;s=f}c[r>>2]=u;c[s+12>>2]=u;c[u+8>>2]=s;c[u+12>>2]=f;return}b=g>>>8;if(b)if(g>>>0>16777215)f=31;else{r=(b+1048320|0)>>>16&8;s=b<<r;q=(s+520192|0)>>>16&4;s=s<<q;f=(s+245760|0)>>>16&2;f=14-(q|r|f)+(s<<f>>>15)|0;f=g>>>(f+7|0)&1|f<<1}else f=0;b=532+(f<<2)|0;c[u+28>>2]=f;c[u+20>>2]=0;c[u+16>>2]=0;d=c[58]|0;e=1<<f;a:do if(d&e){b=c[b>>2]|0;b:do if((c[b+4>>2]&-8|0)!=(g|0)){f=g<<((f|0)==31?0:25-(f>>>1)|0);while(1){e=b+16+(f>>>31<<2)|0;d=c[e>>2]|0;if(!d)break;if((c[d+4>>2]&-8|0)==(g|0)){t=d;break b}else{f=f<<1;b=d}}if(e>>>0<(c[61]|0)>>>0)ga();else{c[e>>2]=u;c[u+24>>2]=b;c[u+12>>2]=u;c[u+8>>2]=u;break a}}else t=b;while(0);b=t+8|0;d=c[b>>2]|0;s=c[61]|0;if(d>>>0>=s>>>0&t>>>0>=s>>>0){c[d+12>>2]=u;c[b>>2]=u;c[u+8>>2]=d;c[u+12>>2]=t;c[u+24>>2]=0;break}else ga()}else{c[58]=d|e;c[b>>2]=u;c[u+24>>2]=b;c[u+12>>2]=u;c[u+8>>2]=u}while(0);u=(c[65]|0)+-1|0;c[65]=u;if(!u)b=684;else return;while(1){b=c[b>>2]|0;if(!b)break;else b=b+8|0}c[65]=-1;return}function ab(){}function bb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;d=b-d-(c>>>0>a>>>0|0)>>>0;return (C=d,a-c>>>0|0)|0}function cb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return (C=b+d+(c>>>0<a>>>0|0)>>>0,c|0)|0}function db(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;h=b&3;i=d|d<<8|d<<16|d<<24;g=f&~3;if(h){h=b+4-h|0;while((b|0)<(h|0)){a[b>>0]=d;b=b+1|0}}while((b|0)<(g|0)){c[b>>2]=i;b=b+4|0}}while((b|0)<(f|0)){a[b>>0]=d;b=b+1|0}return b-e|0}function eb(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){C=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}C=0;return b>>>c-32|0}function fb(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){C=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}C=a<<c-32;return 0}function gb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return ka(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if(!e)return f|0;a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function hb(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b>>0]=a[c>>0]|0}b=e}else gb(b,c,d)|0;return b|0}function ib(b){b=b|0;var c=0;c=a[m+(b&255)>>0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)>>0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)>>0]|0;if((c|0)<8)return c+16|0;return (a[m+(b>>>24)>>0]|0)+24|0}function jb(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){C=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}C=(b|0)<0?-1:0;return b>>c-32|0}function kb(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;f=a&65535;e=b&65535;c=_(e,f)|0;d=a>>>16;a=(c>>>16)+(_(e,d)|0)|0;e=b>>>16;b=_(e,f)|0;return (C=(a>>>16)+(_(e,d)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|c&65535|0)|0}function lb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;j=b>>31|((b|0)<0?-1:0)<<1;i=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;f=d>>31|((d|0)<0?-1:0)<<1;e=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;h=bb(j^a,i^b,j,i)|0;g=C;a=f^j;b=e^i;return bb((qb(h,g,bb(f^c,e^d,f,e)|0,C,0)|0)^a,C^b,a,b)|0}function mb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+16|0;j=f|0;h=b>>31|((b|0)<0?-1:0)<<1;g=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;l=e>>31|((e|0)<0?-1:0)<<1;k=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;a=bb(h^a,g^b,h,g)|0;b=C;qb(a,b,bb(l^d,k^e,l,k)|0,C,j)|0;e=bb(c[j>>2]^h,c[j+4>>2]^g,h,g)|0;d=C;i=f;return (C=d,e)|0}function nb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;f=c;c=kb(e,f)|0;a=C;return (C=(_(b,f)|0)+(_(d,e)|0)+a|a&0,c|0|0)|0}function ob(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return qb(a,b,c,d,0)|0}function pb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+16|0;f=g|0;qb(a,b,d,e,f)|0;i=g;return (C=c[f+4>>2]|0,c[f>>2]|0)|0}function qb(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;l=a;j=b;k=j;h=d;n=e;i=n;if(!k){g=(f|0)!=0;if(!i){if(g){c[f>>2]=(l>>>0)%(h>>>0);c[f+4>>2]=0}n=0;f=(l>>>0)/(h>>>0)>>>0;return (C=n,f)|0}else{if(!g){n=0;f=0;return (C=n,f)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;f=0;return (C=n,f)|0}}g=(i|0)==0;do if(h){if(!g){g=(aa(i|0)|0)-(aa(k|0)|0)|0;if(g>>>0<=31){m=g+1|0;i=31-g|0;b=g-31>>31;h=m;a=l>>>(m>>>0)&b|k<<i;b=k>>>(m>>>0)&b;g=0;i=l<<i;break}if(!f){n=0;f=0;return (C=n,f)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;n=0;f=0;return (C=n,f)|0}g=h-1|0;if(g&h){i=(aa(h|0)|0)+33-(aa(k|0)|0)|0;p=64-i|0;m=32-i|0;j=m>>31;o=i-32|0;b=o>>31;h=i;a=m-1>>31&k>>>(o>>>0)|(k<<m|l>>>(i>>>0))&b;b=b&k>>>(i>>>0);g=l<<p&j;i=(k<<p|l>>>(o>>>0))&j|l<<m&i-33>>31;break}if(f){c[f>>2]=g&l;c[f+4>>2]=0}if((h|0)==1){o=j|b&0;p=a|0|0;return (C=o,p)|0}else{p=ib(h|0)|0;o=k>>>(p>>>0)|0;p=k<<32-p|l>>>(p>>>0)|0;return (C=o,p)|0}}else{if(g){if(f){c[f>>2]=(k>>>0)%(h>>>0);c[f+4>>2]=0}o=0;p=(k>>>0)/(h>>>0)>>>0;return (C=o,p)|0}if(!l){if(f){c[f>>2]=0;c[f+4>>2]=(k>>>0)%(i>>>0)}o=0;p=(k>>>0)/(i>>>0)>>>0;return (C=o,p)|0}g=i-1|0;if(!(g&i)){if(f){c[f>>2]=a|0;c[f+4>>2]=g&k|b&0}o=0;p=k>>>((ib(i|0)|0)>>>0);return (C=o,p)|0}g=(aa(i|0)|0)-(aa(k|0)|0)|0;if(g>>>0<=30){b=g+1|0;i=31-g|0;h=b;a=k<<i|l>>>(b>>>0);b=k>>>(b>>>0);g=0;i=l<<i;break}if(!f){o=0;p=0;return (C=o,p)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;o=0;p=0;return (C=o,p)|0}while(0);if(!h){k=i;j=0;i=0}else{m=d|0|0;l=n|e&0;k=cb(m|0,l|0,-1,-1)|0;d=C;j=i;i=0;do{e=j;j=g>>>31|j<<1;g=i|g<<1;e=a<<1|e>>>31|0;n=a>>>31|b<<1|0;bb(k,d,e,n)|0;p=C;o=p>>31|((p|0)<0?-1:0)<<1;i=o&1;a=bb(e,n,o&m,(((p|0)<0?-1:0)>>31|((p|0)<0?-1:0)<<1)&l)|0;b=C;h=h-1|0}while((h|0)!=0);k=j;j=0}h=0;if(f){c[f>>2]=a;c[f+4>>2]=b}o=(g|0)>>>31|(k|h)<<1|(h<<1|g>>>31)&0|j;p=(g<<1|0>>>31)&-2|i;return (C=o,p)|0}function rb(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;return oa[a&7](b|0,c|0,d|0,e|0,f|0,g|0)|0}function sb(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ba(0);return 0}

// EMSCRIPTEN_END_FUNCS
var oa=[sb,Oa,Pa,Wa,Qa,Ta,Na,sb];return{_memmove:hb,_malloc:_a,_i64Subtract:bb,_free:$a,_memcpy:gb,_LZ4JS_compressBegin:Ba,_LZ4JS_freeCompressionContext:Aa,_LZ4JS_freeDecompressionContext:Fa,_memset:db,_llvm_cttz_i32:ib,_LZ4JS_init:ya,_i64Add:cb,_LZ4JS_compressEnd:Da,_LZ4JS_compressUpdate:Ca,_LZ4JS_decompress:Ga,_bitshift64Lshr:eb,_LZ4JS_createDecompressionContext:Ea,_LZ4JS_createCompressionContext:za,_bitshift64Shl:fb,runPostSets:ab,stackAlloc:pa,stackSave:qa,stackRestore:ra,establishStackSpace:sa,setThrew:ta,setTempRet0:wa,getTempRet0:xa,dynCall_iiiiiii:rb}})


// EMSCRIPTEN_END_ASM
(c.W,c.X,buffer),Oa=c._LZ4JS_init=Z._LZ4JS_init,Ea=c._i64Subtract=Z._i64Subtract,Q=c._free=Z._free;c.runPostSets=Z.runPostSets;
var Pa=c._LZ4JS_compressBegin=Z._LZ4JS_compressBegin,La=c._memmove=Z._memmove,Qa=c._LZ4JS_freeDecompressionContext=Z._LZ4JS_freeDecompressionContext,Ra=c._LZ4JS_decompress=Z._LZ4JS_decompress,Ga=c._memset=Z._memset,Sa=c._LZ4JS_compressUpdate=Z._LZ4JS_compressUpdate,Na=c._llvm_cttz_i32=Z._llvm_cttz_i32,O=c._malloc=Z._malloc,Fa=c._i64Add=Z._i64Add,Ta=c._LZ4JS_compressEnd=Z._LZ4JS_compressEnd,Ja=c._memcpy=Z._memcpy,Ua=c._LZ4JS_freeCompressionContext=Z._LZ4JS_freeCompressionContext,Ha=c._bitshift64Lshr=
Z._bitshift64Lshr,Va=c._LZ4JS_createDecompressionContext=Z._LZ4JS_createDecompressionContext,Wa=c._LZ4JS_createCompressionContext=Z._LZ4JS_createCompressionContext,Ia=c._bitshift64Shl=Z._bitshift64Shl;c.dynCall_iiiiiii=Z.dynCall_iiiiiii;z.D=Z.stackAlloc;z.T=Z.stackSave;z.S=Z.stackRestore;z.pa=Z.establishStackSpace;z.ja=Z.setTempRet0;z.ha=Z.getTempRet0;function x(a){this.name="ExitStatus";this.message="Program terminated with exit("+a+")";this.status=a}x.prototype=Error();x.prototype.constructor=x;
var Xa=null;
c.callMain=c.na=function(a){function b(){for(var a=0;3>a;a++)e.push(0)}assert(!0,"cannot call main when async dependencies remain! (listen on __ATMAIN__)");assert(0==U.length,"cannot call main when preRun functions remain to be called");a=a||[];W||(W=!0,T(V));var d=a.length+1,e=[N(Ba(c.thisProgram),"i8",0)];b();for(var g=0;g<d-1;g+=1)e.push(N(Ba(a[g]),"i8",0)),b();e.push(0);e=N(e,"i32",0);try{var k=c._main(d,e,0);Ya(k,!0)}catch(h){if(!(h instanceof x))if("SimulateInfiniteLoop"==h)c.noExitRuntime=!0;
else throw h&&"object"===typeof h&&h.stack&&c.K("exception thrown: "+[h,h.stack]),h;}finally{}};
function Za(a){function b(){if(!c.calledRun&&(c.calledRun=!0,!F)){W||(W=!0,T(V));T(xa);if(c.onRuntimeInitialized)c.onRuntimeInitialized();c._main&&$a&&c.callMain(a);if(c.postRun)for("function"==typeof c.postRun&&(c.postRun=[c.postRun]);c.postRun.length;){var b=c.postRun.shift();za.unshift(b)}T(za)}}a=a||c.arguments;null===Xa&&(Xa=Date.now());if(c.preRun)for("function"==typeof c.preRun&&(c.preRun=[c.preRun]);c.preRun.length;)Aa();T(U);c.calledRun||(c.setStatus?(c.setStatus("Running..."),setTimeout(function(){setTimeout(function(){c.setStatus("")},
1);b()},1)):b())}c.run=c.run=Za;function Ya(a,b){if(!b||!c.noExitRuntime){if(!c.noExitRuntime&&(F=!0,y=void 0,T(ya),c.onExit))c.onExit(a);w?(process.stdout.once("drain",function(){process.exit(a)}),console.log(" "),setTimeout(function(){process.exit(a)},500)):aa&&"function"===typeof quit&&quit(a);throw new x(a);}}c.exit=c.exit=Ya;var ab=[];
function E(a){void 0!==a?(c.print(a),c.K(a),a=JSON.stringify(a)):a="";F=!0;var b="abort("+a+") at "+oa()+"\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";ab&&ab.forEach(function(d){b=d(b,a)});throw b;}c.abort=c.abort=E;if(c.preInit)for("function"==typeof c.preInit&&(c.preInit=[c.preInit]);0<c.preInit.length;)c.preInit.pop()();var $a=!0;c.noInitialRun&&($a=!1);Za();var X={};
(function(){function a(a){Array.prototype.slice.call(arguments,1).forEach(function(b){null!=b&&"object"===typeof b&&Object.keys(b).forEach(function(d){a[d]=b[d]})});return a}function b(a){var b,d,e=0;b=a.map(function(a){return a.length}).reduce(function(a,b){return a+b},0);d=new Uint8Array(b);a.forEach(function(a){d.set(a,e);e+=a.length});return d}function d(a){return function(b){var d=a.apply(null,arguments);return Buffer.isBuffer(b)?new Buffer(d.buffer,d.byteOffset,d.byteOffset+d.length):d}}function e(b){this.options=
a({},p,b);this.g=Wa(this.options.Z,+this.options.Y,+this.options.ba,this.options.aa);if(!this.g)throw Error("LZ4JS_createCompressionContext");X[this.g]=this;this.n=null}function g(){this.p=Va();if(!this.p)throw Error("LZ4JS_createDecompressionContext");X[this.p]=this}function k(a,b){e.call(this,b);this.src=a;this.offset=0;this.o=[];this.e=0}function h(a,d){var e=new k(a,d);e.M();e.$();e.N();return b(e.o)}function f(a){g.call(this);this.src=a;this.offset=0;this.o=[];this.e=0}function u(a){var d=new f(a);
d.da();d=b(d.o);return a instanceof Uint8Array?d:new Buffer(d.buffer)}var m=this;"function"===typeof define&&define.amd?define("lz4",function(){return m}):w&&(module.exports=m);Oa();m.BLOCK_MAX_SIZE_64KB=4;m.BLOCK_MAX_SIZE_256KB=5;m.BLOCK_MAX_SIZE_1MB=6;var p={Z:m.BLOCK_MAX_SIZE_4MB=7,Y:!1,ba:!1,aa:0};e.prototype.M=function(){Pa(this.g)||this.k()};e.prototype.O=function(){Sa(this.g)||this.k()};e.prototype.N=function(){Ta(this.g);this.k()};e.prototype.k=function(){Ua(this.g);delete X[this.g];if(this.n)throw this.n;
};g.prototype.P=function(){Ra(this.p)||this.k()};g.prototype.k=function(){Qa(this.p);delete X[this.p];if(this.n)throw this.n;};w&&function(){function b(a){e.call(this,a);f.call(this,this.options);this.R=!1;this.e=0;this.src=new Buffer(0);this.q=new Buffer(0)}function d(){g.call(this);f.call(this,{});this.e=0;this.src=new Buffer(0);this.q=new Buffer(0)}var f=require("stream").Transform,h=require("util").inherits;h(b,f);a(b.prototype,e.prototype);b.prototype.u=function(a){P.set(new Uint8Array(this.src.buffer,
this.src.byteOffset,this.e),a);return this.e};b.prototype.A=function(a,b){this.q=(new Buffer(P.buffer)).slice(a,a+b);this.push(new Buffer(this.q))};b.prototype._transform=function(a,b,d){try{this.R||(this.M(),this.R=!0);var e;for(e=0;e<a.length;e+=8192)this.e=Math.min(a.length-e,8192),this.src=a.slice(e,e+this.e),this.O();d()}catch(f){d(f)}};b.prototype._flush=function(a){try{this.N(),a()}catch(b){a(b)}};m.createCompressStream=function(a){return new b(a)};h(d,f);a(d.prototype,g.prototype);d.prototype.u=
function(a){P.set(new Uint8Array(this.src.buffer,this.src.byteOffset,this.e),a);return this.e};d.prototype.A=function(a,b){this.q=(new Buffer(P.buffer)).slice(a,a+b);this.push(new Buffer(this.q))};d.prototype._transform=function(a,b,d){try{var e;for(e=0;e<a.length;e+=8192)this.e=Math.min(a.length-e,8192),this.src=a.slice(e,e+this.e),this.P();d()}catch(f){d(f)}};d.prototype._flush=function(a){this.k();a()};m.createDecompressStream=function(){return new d}}();a(k.prototype,e.prototype);k.prototype.A=
function(a,b){this.o.push(new Uint8Array(P.subarray(a,a+b)))};k.prototype.u=function(a){P.set(this.src.subarray(this.offset,this.offset+this.e),a);return this.e};k.prototype.$=function(){for(;this.offset<this.src.length;this.offset+=8192)this.e=Math.min(this.src.length-this.offset,8192),this.O()};m.compress=w?d(h):h;a(f.prototype,g.prototype);f.prototype.A=function(a,b){this.o.push(new Uint8Array(P.subarray(a,a+b)))};f.prototype.u=function(a){P.set(this.src.subarray(this.offset,this.offset+this.e),
a);return this.e};f.prototype.da=function(){for(;this.offset<this.src.length;this.offset+=8192)this.e=Math.min(this.src.length-this.offset,8192),this.P();this.k()};m.decompress=w?d(u):u}).call(this);


}).call(lz4);
// src/main.js
var gl;

var IUIU = {
    /**
    * 创建画布
    * @param     {Canvas}            canvas      所选中的画布，如果为null则新建一个画布
    * @param     {object}            options     创建webgl时所用到的参数选项
    * @return    GraphiceDevice
    * @date      2019-9-4
    * @author    KumaWang
    */
    create: function(canvas, options) {
        options = options || {};
        var canvas2 = canvas || document.createElement('canvas');
        if(!canvas) canvas2.width = 800;
        if(!canvas) canvas2.height = 600;
        if (!('alpha' in options)) options.alpha = false;
        try { gl = canvas2.getContext('webgl', options); } catch (e) {}
        try { gl = gl || canvas2.getContext('experimental-webgl', options); } catch (e) {}
        if (!gl) throw new Error('WebGL not supported');
        //gl.HALF_FLOAT_OES = 0x8D61;
        addDisplayBatchMode();
        addOtherMethods();
        
        gl.defaultShader = new Shader('\
            uniform mat4 MatrixTransform;\
            varying vec4 diffuseColor;\
            varying vec4 diffuseTexCoord;\
            void main( )\
            {\
                gl_Position = MatrixTransform * gl_Vertex;\
                diffuseTexCoord = gl_TexCoord;\
                diffuseColor = gl_Color;\
            }\
            ', '\
            uniform sampler2D Texture;\
            varying vec4 diffuseColor;\
            varying vec4 diffuseTexCoord;\
            void main( )\
            {\
                gl_FragColor = texture2D(Texture, diffuseTexCoord.xy) * diffuseColor;\
            }\
            '
            );
        
        return gl;
    },
    
    //Matrix: Matrix,
    //Indexer: Indexer,
    //Buffer: Buffer,
    //Mesh: Mesh,
    //HitTest: HitTest,
    //Raytracer: Raytracer,
    /**
    * Shader
    */
    Shader: Shader,
    /**
    * 材质
    */ 
    Texture: Texture,
    /**
    * 向量
    */
    Vector: Vector,
    /**
    * 颜色
    */
    Color: Color,
    //Level : Level,
    
    /**
    * 资源加载器
    */
    Loader: new Loader(),
    /**
    * 触发器，一般由IDE进行管理
    */
    Trigger : Trigger,
    /**
    * 组件管理器，一般由IDE进行管理
    */
    // Component : new Component(),
    /**
    * 模块管理器，一般由IDE进行管理
    */
    Module : Module
};

function addDisplayBatchMode() {
    var displayBatchMode = {
        steps : [],
        stepIndex : 0,
        mesh : new Mesh({ coords: true, colors: true, triangles: true }),
        blendState : 'none',
        hasBegun: false,
        hasClip : false,
        clipRect : null,
        transformMatrix: Matrix.identity()
    };
    
    Object.defineProperty(gl, 'camera', { get: function() { return displayBatchMode.camera; } });
    
    var systemClearFunc = gl.clear; 
    gl.clear = function(color) {    
        systemClearFunc.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(color.r, color.g, color.b, color.a);
    }
    
    /**
    * 通知渲染器开始接受命令，每次绘制前必须调用
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.begin = function(blendState, transform, shader) {
        displayBatchMode.hasBegun = true;
        displayBatchMode.blendState = blendState || 'none';
        gl.camera = gl.camera || transform;
        gl.blendState = gl.blendState || blendState;
  
        // project matrix
        if (displayBatchMode.cachedTransformMatrix == null || 
            gl.drawingBufferWidth != displayBatchMode.viewportWidth ||
            gl.drawingBufferHeight != displayBatchMode.viewportHeight) {
            
            displayBatchMode.viewportWidth = gl.drawingBufferWidth;
            displayBatchMode.viewportHeight = gl.drawingBufferHeight;
            displayBatchMode.cachedTransformMatrix = new Matrix();
            var m = displayBatchMode.cachedTransformMatrix.m;
            m[0] = 2 * (displayBatchMode.viewportWidth > 0 ? 1 / displayBatchMode.viewportWidth : 0);
            m[5] = 2 * (displayBatchMode.viewportHeight > 0 ? -1 / displayBatchMode.viewportHeight : 0);
            m[10] = 1;
            m[15] = 1;
            m[12] = -1;
            m[13] = 1;
            
            displayBatchMode.cachedTransformMatrix.m[12] -= displayBatchMode.cachedTransformMatrix.m[0];
            displayBatchMode.cachedTransformMatrix.m[13] -= displayBatchMode.cachedTransformMatrix.m[5];
        }
        
        displayBatchMode.shader = shader || gl.defaultShader;
        transform = transform || { location : Vector.zero, scale : 1, origin : Vector.zero, angle : 0 };
        var location = transform.location || Vector.zero;
        var angle = transform.angle / 180 * Math.PI || 0;
        var origin = transform.origin || Vector.zero;
        var scale = transform.scale || 1;
        
        var transformMatrix = Matrix.identity();
        transformMatrix = Matrix.multiply2(transformMatrix, Matrix.translate2(location.x, location.y, 0));
        transformMatrix = Matrix.multiply(transformMatrix, Matrix.rotateZ(angle));
        transformMatrix = Matrix.multiply2(transformMatrix, Matrix.translate2(origin.x, origin.y, 0));
        transformMatrix = Matrix.multiply2(transformMatrix, Matrix.scale(scale, scale, scale));
        displayBatchMode.transformMatrix = transformMatrix;
        
        var uniformsMatrix = Matrix.multiply2(displayBatchMode.transformMatrix, displayBatchMode.cachedTransformMatrix);
        displayBatchMode.shader.uniforms({ MatrixTransform: uniformsMatrix });
        
        if(gl.enableHitTest) {
            gl.bindHitTestContext(displayBatchMode.steps);
        }
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    };
    
    /**
    * 渲染场景
    * @param   {IUIU.Level}        level   渲染的场景
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.level = function(level) {
        for(var i = 0; i < level.objects.length; i++) {
            var obj = level.objects[i];
            if(obj.paint) {
                obj.paint(gl);
            }
        }
    };
    
    /**
    * 渲染动画
    * @param   {IUIU.Animation}    ani         选中的动画
    * @param   {int}               frame       所渲染的帧数
    * @param   {IUIU.Vector}       point       渲染的坐标
    * @param   {IUIU.Vector}       scale       渲染时采用的拉伸值
    * @param   {IUIU.Vector}       origin      渲染时采用的旋转锚点
    * @param   {int}               angle       渲染时采用的旋转值
    * @param   {IUIU.Color}        color       渲染时采用的颜色过滤
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.animate = function(ani, frame, point, scale, origin, angle, color) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        for(var index = 0; index < ani.items.length; index++) {
            var item = ani.items[index];
            switch(item.type) {
              case "mesh":
                gl.mesh(item, frame, point, scale, origin, angle, color);
                break;
              case "text":
                var state = item.getRealState(frame);
                if(state != null) {
                    point = point || IUIU.Vector.zero;
                    scale = scale || IUIU.Vector.one;
                    origin = origin || IUIU.Vector.zero;
                    angle = angle || 0;
                    color = color || IUIU.Color.white;
                    
                    point = { x: point.x + state.x, y: point.y + state.y };
                    scale = { x: scale.x * state.scaleX, y: scale.y * state.scaleY };
                    origin = { x: origin.x + state.originX, y: origin.y + state.originY };
                    angle = (state.angle + angle) % 360;
                    color = { r : state.r * color.r, g : state.g * color.g, b : state.b * color.b, a : state.a * color.a };
                    
                    gl.text(item.font, item.text, item.size, point, scale, origin, angle, color);
                }
                break;
              default:
                throw "not yet support";
            }
        }
    };
    
    /**
    * 渲染动画状态
    * @param   {IUIU.AnimationState}   state       所渲染的状态
    * @param   {IUIU.Vector}           point       渲染的坐标
    * @param   {IUIU.Vector}           scale       渲染时采用的拉伸值
    * @param   {IUIU.Vector}           origin      渲染时采用的旋转锚点
    * @param   {int}                   angle       渲染时采用的旋转值
    * @param   {IUIU.Color}            color       渲染时采用的颜色过滤
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.state = function(state, point, scale, origin, angle, color) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        state.update(gl.elapsedTime);
        gl.animate(state.animation, state.frame, point, scale, origin, angle, color);
    };
    
    /**
    * 渲染模型
    * @param   {IUIU.Mesh}         mesh        渲染的模型
    * @param   {int}               frame       所渲染的帧数
    * @param   {IUIU.Vector}       point       渲染的坐标
    * @param   {IUIU.Vector}       scale       渲染时采用的拉伸值
    * @param   {IUIU.Vector}       origin      渲染时采用的旋转锚点
    * @param   {int}               angle       渲染时采用的旋转值
    * @param   {IUIU.Color}        color       渲染时采用的颜色过滤
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.mesh = function(mesh, frame, point, scale, origin, angle, color) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        var state = mesh.getRealState(frame);
        if(mesh.brush.texture) {
            var img = mesh.brush.texture.image;
            if (img != null && state != null && mesh.triangles) {
                point = point || IUIU.Vector.zero;
                scale = scale || IUIU.Vector.one;
                origin = origin || IUIU.Vector.zero;
                angle = angle || 0;
                color = color || IUIU.Color.white;
                
                // 绘制内部填充
                var offset = { x : state.x + point.x, y : state.y + point.y };
                color = { r : state.r * color.r, g : state.g * color.g, b : state.b * color.b, a : state.a * color.a };
                origin = { x : offset.x + state.originX + origin.x, y : offset.y + state.originY + origin.y };
                angle = (state.angle + angle) % 360;
                scale = { x : state.scaleX * scale.x, y : state.scaleY * scale.y };
                var size = { x : img.width, y : img.height };
                
                for (var i = 0; i < mesh.triangles.length; i++)
                {
                    var triangle = mesh.triangles[i];
                    var p1 = triangle.p1.tracker.getPostion(frame);
                    var p2 = triangle.p2.tracker.getPostion(frame);
                    var p3 = triangle.p3.tracker.getPostion(frame);
                    
                    var point1 = { x : p1.x * scale.x + offset.x, y : p1.y * scale.y + offset.y };
                    var point2 = { x : p2.x * scale.x + offset.x, y : p2.y * scale.y + offset.y };
                    var point3 = { x : p3.x * scale.x + offset.x, y : p3.y * scale.y + offset.y };
                    
                    var point21 = MathTools.pointRotate(origin, point1, angle);
                    var point22 = MathTools.pointRotate(origin, point2, angle);
                    var point23 = MathTools.pointRotate(origin, point3, angle);
                    
                    var uv1 = triangle.p1.uv;
                    var uv2 = triangle.p2.uv;
                    var uv3 = triangle.p3.uv;
                    
                    gl.draw({
                        texture : mesh.brush.texture.image,
                        p1 : [ point21.x, point21.y ],
                        p2 : [ point22.x, point22.y ],
                        p3 : [ point23.x, point23.y ],
                        uv1: [ uv1.x, 1 - uv1.y ],
                        uv2: [ uv2.x, 1 - uv2.y ],
                        uv3: [ uv3.x, 1 - uv3.y ],
                        color: [ color.r / 255, color.g / 255, color.b / 255, color.a / 255 ]
                    });
                }
            }
        }
    };
    
    /**
    * 渲染图片
    * @param   {IUIU.Bitmap}       img         渲染的位图
    * @param   {string}            name        所渲染的切片名
    * @param   {IUIU.Vector}       point       渲染的坐标
    * @param   {IUIU.Vector}       scale       渲染时采用的拉伸值
    * @param   {IUIU.Vector}       origin      渲染时采用的旋转锚点
    * @param   {int}               angle       渲染时采用的旋转值
    * @param   {IUIU.Color}        color       渲染时采用的颜色过滤
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.image = function(img, name, point, scale, origin, angle, color) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        if(!img.isLoaded) return;
        if(!img.triangles[name]) img.triangulate(name);
        var triangles = img.triangles[name];
        if(!triangles) return;
        
        point = point || IUIU.Vector.zero;
        scale = scale || IUIU.Vector.one;
        origin = origin || IUIU.Vector.zero;
        angle = angle || 0;
        color = color || IUIU.Color.white;
        
        var size = { x : img.width, y : img.height };
        
        for (var i = 0; i < triangles.length; i++) {
            var triangle = triangles[i];
            var p1 = triangle.p1.tracker.getPostion(0);
            var p2 = triangle.p2.tracker.getPostion(0);
            var p3 = triangle.p3.tracker.getPostion(0);
            
            var point1 = { x : p1.x * scale.x + point.x, y : p1.y * scale.y + point.y };
            var point2 = { x : p2.x * scale.x + point.x, y : p2.y * scale.y + point.y };
            var point3 = { x : p3.x * scale.x + point.x, y : p3.y * scale.y + point.y };
            
            var point21 = MathTools.pointRotate(origin, point1, angle);
            var point22 = MathTools.pointRotate(origin, point2, angle);
            var point23 = MathTools.pointRotate(origin, point3, angle);
            
            var uv1 = triangle.p1.uv;
            var uv2 = triangle.p2.uv;
            var uv3 = triangle.p3.uv;
            
            gl.draw({
                texture : img.image,
                p1 : [ point21.x, point21.y ],
                p2 : [ point22.x, point22.y ],
                p3 : [ point23.x, point23.y ],
                uv1: [ uv1.x, 1 - uv1.y ],
                uv2: [ uv2.x, 1 - uv2.y ],
                uv3: [ uv3.x, 1 - uv3.y ],
                color: [ color.r, color.g, color.b, color.a ]
            });
        }
    };
    
    /**
    * 渲染图片
    * @param   {IUIU.Texture}      img             渲染的材质
    * @param   {IUIU.Vector}       point           渲染的坐标
    * @param   {IUIU.Vector}       scale           渲染时采用的拉伸值
    * @param   {IUIU.Vector}       origin          渲染时采用的旋转锚点
    * @param   {int}               angle           渲染时采用的旋转值
    * @param   {IUIU.Color}        color           渲染时采用的颜色过滤
    * @param   {IUIU.Rect}         sourceRectangle 渲染时截取的图片矩阵
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.texture = function(img, point, scale, origin, angle, color, sourceRectangle) {        
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        if (img == null)
            throw "texture";
        
        if(img.swapWith == null && !img.isLoaded) return;
        
        point = (point == undefined || point == null) ?  Vector.zero : point; 
        color = (color == undefined || color == null) ?  Color.white : color;
        origin = (origin == undefined || origin == null) ? Vector.zero : origin; 
        angle = (angle == undefined  || angle == null) ?  0 : angle; 
        scale = (scale == undefined || scale == null) ? Vector.one : scale; 
        sourceRectangle = (sourceRectangle == undefined || sourceRectangle == null) ?  { x : 0, y : 0, width : img.width, height : img.height } : sourceRectangle;
        
        var br = new Vector(point.x + (sourceRectangle.width * scale.x), point.y + (sourceRectangle.height * scale.y));
        
        var step1 = {};
        var step2 = {};
        
        var texture = img.swapWith == null ? img.image : img;
        step1.color   = [ color.r, color.g, color.b, color.a ];   
        step2.color   = [ color.r, color.g, color.b, color.a ];
        step1.texture = texture
        step2.texture = texture;
        
        if(sourceRectangle) {
            step1.uv1 = [ (sourceRectangle.x + 1) / texture.width, 1 - (sourceRectangle.y + 1) / texture.height ];
            step1.uv2 = [ (sourceRectangle.x + sourceRectangle.width - 1) / texture.width, 1 - (sourceRectangle.y + 1) / texture.height ];
            step1.uv3 = [ (sourceRectangle.x + 1) / texture.width, 1 - (sourceRectangle.y + sourceRectangle.height - 1) / texture.height ];
            
            step2.uv1 = [ (sourceRectangle.x + sourceRectangle.width - 1) / texture.width, 1 - (sourceRectangle.y + 1) / texture.height ];
            step2.uv2 = [ (sourceRectangle.x + sourceRectangle.width - 1) / texture.width, 1 - (sourceRectangle.y + sourceRectangle.height - 1) / texture.height ];
            step2.uv3 = [ (sourceRectangle.x + 1) / texture.width, 1 - (sourceRectangle.y + sourceRectangle.height - 1) / texture.height ];
            
        } else {
            step1.uv1 = [ 0, 0 ];
            step1.uv2 = [ 1, 0 ];
            step1.uv3 = [ 0, 1 ];
            
            step2.uv1 = [ 1, 0 ];
            step2.uv2 = [ 1, 1 ];
            step2.uv3 = [ 0, 1 ];
        }
        
        var v11 = MathTools.pointRotate(origin, { x : point.x, y : point.y }, angle);
        var v12 = MathTools.pointRotate(origin, { x : br.x, y : point.y }, angle);
        var v13 = MathTools.pointRotate(origin, { x : point.x, y : br.y }, angle);
        
        var v21 = MathTools.pointRotate(origin, { x : br.x, y : point.y }, angle);
        var v22 = MathTools.pointRotate(origin, { x : br.x, y : br.y }, angle);
        var v23 = MathTools.pointRotate(origin, { x : point.x, y : br.y }, angle);
        
        step1.p1 = [ v11.x, v11.y ];
        step1.p2 = [ v12.x, v12.y ];
        step1.p3 = [ v13.x, v13.y ];
        
        step2.p1 = [ v21.x, v21.y ];
        step2.p2 = [ v22.x, v22.y ];
        step2.p3 = [ v23.x, v23.y ];
        
        gl.draw(step1);
        gl.draw(step2);
    };
    
    /**
    * 渲染文字
    * @param   {IUIU.Font}         font            渲染的采用的字体
    * @param   {string}            text            所渲染的文字
    * @param   {IUIU.Vector}       point           渲染的坐标
    * @param   {IUIU.Vector}       scale           渲染时采用的拉伸值
    * @param   {IUIU.Vector}       origin          渲染时采用的旋转锚点
    * @param   {int}               angle           渲染时采用的旋转值
    * @param   {IUIU.Color}        color           渲染时采用的颜色过滤
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.text = function(font, text, size, point, scale, origin, angle, color) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        if(!font.isLoaded) return;
        
        point = point || IUIU.Vector.zero;
        scale = scale || IUIU.Vector.one;
        origin = origin || IUIU.Vector.zero;
        angle = angle || 0;
        color = color || IUIU.Color.white;
        
        var fontScale = size / 1000;
        var xOffset = 0;
        for(var i = 0; i < text.length; i++) {
            var c = text[i];
            var info = font[c];
            
            if(info) {
                for(var x = 0; x < info.vertices.length; x = x + 3) {
                    var p1 = { x : info.vertices[x].x * fontScale * scale.x + point.x + xOffset, y : info.vertices[x].y * fontScale * scale.y + point.y };
                    var p2 = { x : info.vertices[x + 1].x * fontScale * scale.x + point.x + xOffset, y : info.vertices[x + 1].y * fontScale * scale.y + point.y };
                    var p3 = { x : info.vertices[x + 2].x * fontScale * scale.x + point.x + xOffset, y : info.vertices[x + 2].y * fontScale * scale.y + point.y };
                    
                    p1 = MathTools.pointRotate(origin, p1, angle);
                    p2 = MathTools.pointRotate(origin, p2, angle);
                    p3 = MathTools.pointRotate(origin, p3, angle);
                    
                    gl.draw({
                        p1 : [ p1.x, p1.y ],
                        p2 : [ p2.x, p2.y ],
                        p3 : [ p3.x, p3.y ],
                        uv1 : [ 0, 0 ],
                        uv2 : [ 0, 1 ],
                        uv3 : [ 1, 1 ],
                        color: [ color.r, color.g, color.b, color.a ],
                        texture : IUIU.Texture.getPixel()
                    });
                }
                
                xOffset = xOffset + info.size.width * fontScale * scale.x + 1;
            }
            else {
                xOffset = xOffset + (size / 2) * scale.x + 1;
            }
        }
    };
    
    /**
    * 渲染直线
    * @param   {IUIU.Vector}       start           起始坐标
    * @param   {IUIU.Vector}       end             结束坐标
    * @param   {IUIU.Color}        color           渲染时采用的颜色过滤
    * @param   {int}               thickness       线粗细
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.line = function(start, end, color, thickness) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        var length = MathTools.getDistance(start, end);
        var angle = MathTools.getAngle(start, end);
        
        var v1 = new Vector(start.x, start.y);
        var v2 = new Vector(start.x + thickness, start.y);
        var v3 = new Vector(start.x + thickness, start.y - length);
        var v4 = new Vector(start.x, start.y - length);
        
        angle = angle % 360;
        v2 = MathTools.pointRotate(v1, v2, angle);
        v3 = MathTools.pointRotate(v1, v3, angle);
        v4 = MathTools.pointRotate(v1, v4, angle);
        
        gl.draw({
            texture : IUIU.Texture.getPixel(),
            color: [ color.r, color.g, color.b, color.a ],
            p1 : [ v1.x, v1.y ],
            p2 : [ v2.x, v2.y ],
            p3 : [ v3.x, v3.y ],
            uv1 : [ 0, 0 ],
            uv2 : [ 1, 0 ],
            uv3 : [ 1, 1 ]
        });
        
        gl.draw({
            texture : IUIU.Texture.getPixel(),
            color: [ color.r, color.g, color.b, color.a ],
            p1 : [ v1.x, v1.y ],
            p2 : [ v3.x, v3.y ],
            p3 : [ v4.x, v4.y ],
            uv1 : [ 0, 0 ],
            uv2 : [ 1, 1 ],
            uv3 : [ 0, 1 ]
        });
    };
    
    /**
    * 渲染矩形
    * @param   {IUIU.Vector}       lower           起始坐标
    * @param   {IUIU.Vector}       upper           结束坐标
    * @param   {IUIU.Color}        color           渲染时采用的颜色过滤
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.rect = function(lower, upper, color) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        gl.draw({
            texture : IUIU.Texture.getPixel(),
            color: [ color.r, color.g, color.b, color.a ],
            p1 : [ lower.x, lower.y ],
            p2 : [ upper.x, lower.y ],
            p3 : [ lower.x, upper.y ],
            uv1 : [ 0, 0 ],
            uv2 : [ 1, 0 ],
            uv3 : [ 1, 1 ]
        });
        
        gl.draw({
            texture : IUIU.Texture.getPixel(),
            color: [ color.r, color.g, color.b, color.a ],
            p1 : [ upper.x, lower.y ],
            p2 : [ upper.x, upper.y ],
            p3 : [ lower.x, upper.y ],
            uv1 : [ 0, 0 ],
            uv2 : [ 1, 0 ],
            uv3 : [ 1, 1 ]
        });
        
    };
    
    gl.ellipse = function(lower, upper) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
    };
    
    gl.draw = function(state) {
        displayBatchMode.steps[displayBatchMode.stepIndex++] = state;
    };
    
    gl.flush = function(offset, count) {
        if(count > 0) {
            displayBatchMode.mesh.vertices = [];
            displayBatchMode.mesh.colors = [];
            displayBatchMode.mesh.coords = [];
            displayBatchMode.mesh.triangles = [];
            for(var i = 0; i < count; i++) {
                var step = displayBatchMode.steps[i + offset];
                
                // corners
                displayBatchMode.mesh.vertices.push(step.p1);
                displayBatchMode.mesh.vertices.push(step.p2);
                displayBatchMode.mesh.vertices.push(step.p3);
                
                // colors
                displayBatchMode.mesh.colors.push(step.color);
                displayBatchMode.mesh.colors.push(step.color);
                displayBatchMode.mesh.colors.push(step.color);
                
                // coords
                displayBatchMode.mesh.coords.push(step.uv1);
                displayBatchMode.mesh.coords.push(step.uv2);
                displayBatchMode.mesh.coords.push(step.uv3);
                
                // triangles
                displayBatchMode.mesh.triangles.push([i * 3, i * 3 + 1, i * 3 + 2]);
            }
            
            displayBatchMode.mesh.compile();
            displayBatchMode.steps[offset].texture.bind(0);
            displayBatchMode.shader.uniforms({
                Texture : 0
            }).draw(displayBatchMode.mesh);
            displayBatchMode.steps[offset].texture.unbind(0);
        }
    };
    
    /**
    * 通知渲染器结束接受命令并绘制
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.end = function(uniforms) {
        if(uniforms != null) {
            displayBatchMode.shader.uniforms(uniforms);
        }
        var maxLenght = displayBatchMode.stepIndex;
        var endLenght = maxLenght - 1;
        // fist hit test
        if(gl.enableHitTest) {
            for(var i = 0; i < maxLenght; i++) {
                gl.innerHitTest(displayBatchMode.steps[i], i);
            }
        }
        
        // sec render any step
        var currentDrawnIndex = 0;
        for(var i = 0; i < maxLenght; i++) {
            var step = displayBatchMode.steps[i];
            if(i == endLenght) {
                gl.flush(currentDrawnIndex, i - currentDrawnIndex + 1);
            }
            else {
                var nextstep = displayBatchMode.steps[i + 1];
                if(step.texture != nextstep.texture) {
                    lastTexture = step.texture;
                    gl.flush(currentDrawnIndex, i + 1 - currentDrawnIndex);
                    currentDrawnIndex = i + 1;
                }
            }
        }
        
        displayBatchMode.stepIndex = 0;
        displayBatchMode.hasBegun = false;
    };
    
    gl.clip = function(x, y, width, height) {
        displayBatchMode.hasClip = true;
        displayBatchMode.clipArea = {
            x : x,
            y : y,
            width : width,
            height : height
        };
    };
    
    gl.endClip = function() {
        displayBatchMode.hasClip = false;
    };
}

function addOtherMethods() {    
    /**
    * 启用循环
    * @param     {int}           interval        每帧间隔（毫秒）
    * @date      2019-9-4
    * @author    KumaWang
    */
    gl.loop = function(interval) {
        interval = interval || 60;  
        
        var post =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function(callback) { setTimeout(callback, 1000 / interval); };
        var time = new Date().getTime();
        var context = gl;
        function update() {
            gl = context;
            var now = new Date().getTime();
            pointer.update();
            hotkeys.update();
            gl.elapsedTime = now - time;
            if (gl.onupdate) gl.onupdate(gl.elapsedTime);
            if (gl.ondraw) gl.ondraw();
            post(update);
            time = now;
        }
        update();
    };
    
    /**
    * 将画布全屏化
    * @date      2019-9-4
    * @author    KumaWang
    */
    gl.fullscreen = function(options) {
        options = options || {};
        var top = options.paddingTop || 0;
        var left = options.paddingLeft || 0;
        var right = options.paddingRight || 0;
        var bottom = options.paddingBottom || 0;
        if (!document.body) {
            throw new Error('document.body doesn\'t exist yet (call gl.fullscreen() from ' +
                'window.onload() or from inside the <body> tag)');
        }
        document.body.appendChild(gl.canvas);
        document.body.style.overflow = 'hidden';
        gl.canvas.style.position = 'absolute';
        gl.canvas.style.left = left + 'px';
        gl.canvas.style.top = top + 'px';
        function resize() {
            gl.canvas.width = window.innerWidth - left - right;
            gl.canvas.height = window.innerHeight - top - bottom;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            if (gl.ondraw) gl.ondraw();
        }
        
        window.addEventListener('resize', resize);
        resize();
    };
    
    (function(context) {
        gl.makeCurrent = function() {
            gl = context;
        };
    })(gl);
}

var ENUM = 0x12340000;

// src/map.js
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
// src/math.js
function MathTools() {
}

MathTools.pointRotate = function(center, p1, angle) {
	var tmp = {};
    var angleHude = -angle * Math.PI / 180;/*角度变成弧度*/
    var x1 = (p1.x - center.x) * Math.cos(angleHude) + (p1.y - center.y) * Math.sin(angleHude) + center.x;
    var y1 = -(p1.x - center.x) * Math.sin(angleHude) + (p1.y - center.y) * Math.cos(angleHude) + center.y;
    tmp.x = x1;
    tmp.y = y1;
    return tmp;
}

MathTools.getDistance = function(p1, p2) {
	var a = p1.x - p2.x;
	var b = p1.y - p2.y;
	var distance = Math.sqrt(a * a + b * b);
	return distance;
}

MathTools.getExtendPoint = function(p1, p2, length) {
	var rotation = MathTools.getAngle(p1, p2);
	var target = MathTools.pointRotate(p1, { x : p1.x, y : p1.y - length }, rotation);
	return target;
}

MathTools.getAngle = function(p1, p2) {
	var xDiff = p2.x - p1.x;
    var yDiff = p2.y - p1.y;

    if (xDiff == 0 && yDiff == 0) return 0;

    var angle = Math.atan2(xDiff, yDiff) * 180 / Math.PI;
    return ((180 - angle) % 360);
}

MathTools.maskPolygon = function(polygon, mask) {
	var v = new [];
	var intersectPoints = MathTools.intersectionPolygons(mask, polygon);
	if (intersectPoints.length % 2 == 0 && intersectPoints.length > 0) {
        for (var c = 0; c < polygon.length; c++) {
            for (var k = intersectPoints.length - 2; k >= 0; k = k - 2) {
                var start = intersectPoints[k];
                var end = intersectPoints[k + 1];

                if (start.reverse) {
                    if (c == start.index) {
                        v.push(end.point);
                    }

                    if (c > start.index && c < end.index + 1) {
                        v.push(polygon[c]);
                    }

                    if (c == start.index) {
                        v.push(start.point);
                    }
                }
                else {
                    if (c > start.index && c < end.index + 1) {
                    }
                    else {
                        v.push(polygon[c]);
                    }

                    if (c == start.index) {
                        v.push(start.point);
                        v.push(end.point);
                    }
                }
            }
        }
	}
	
	return v;
}

MathTools.intersectionPolygons = function(v1, v2) {
	var result = [];
	var temp = false;
	
	for(var i = 0; i < v2.length; i++) {
		var curr = v2[i];
		var next = v2[i == v2.length - 1 ? 0 : 1 ];
		
		var clipPoints = MathTools.clipLineWithPolygon(curr, next, v1);
		for(var x = 0; x < clipPoints.length; i++) {
			result.push({
				index : i,
				point : clipPoints[x].point,
				outside : clipPoints[x].outsdie
			});
		}
	}
	
	return result;
}

MathTools.clipLineWithPolygon = function(point1, point2, polygon_points) {
	// Make lists to hold points of
    // intersection and their t values.
    var intersections = [];
    var t_values = [];

    // Add the segment's starting point.
    //intersections.Add(point1);
    //t_values.Add(0f);
    var starts_outside_polygon =
        !PointIsInPolygon(point1.x, point1.y,
            polygon_points.ToArray());

    // Examine the polygon's edges.
    for (var i1 = 0; i1 < polygon_points.length; i1++)
    {
        // Get the end points for this edge.
        var i2 = (i1 + 1) % polygon_points.length;

        // See where the edge intersects the segment.
        var result = MathTools.findIntersection(point1, point2, polygon_points[i1], polygon_points[i2]);
        
        var lines_intersect = result.lines_intersect, segments_intersect = result.segments_intersect;
        var intersection = result.intersection, close_p1 = result.close_p1, close_p2 = result.close_p2;
        var t1 = result.t1, t2 = result.t2;

        // See if the segment intersects the edge.
        if (segments_intersect)
        {
            // See if we need to record this intersection.

            // Record this intersection.
            intersections.push(intersection);
            t_values.push(t1);
        }
    }

    // Add the segment's ending point.
    //intersections.Add(point2);
    //t_values.Add(1f);

    // Sort the points of intersection by t value.
    var s_array = [];
	for(var i = 0; i < intersections.length; i++) {
		s_array.push({ id : t_values[i], value : intersections[i] });
	}
	s_array.sort(function(a,b){
		return a.id - b.id;
	});
    
    var intersections_array = [];
	for(var i = 0; i < s_array.length; i++) {
		intersections_array.push(s_array[i].value);
	}
	
    // Return the intersections.
    return intersections_array;
}


MathTools.findIntersection = function(p1, p2, p3, p4) {
	var lines_intersect, segments_intersect, intersection, close_p1, close_p2, t1, t2;
	
    // Get the segments' parameters.
    var dx12 = p2.x - p1.x;
    var dy12 = p2.y - p1.y;
    var dx34 = p4.x - p3.x;
    var dy34 = p4.y - p3.y;

    // Solve for t1 and t2
    var denominator = (dy12 * dx34 - dx12 * dy34);
    t1 = ((p1.x - p3.x) * dy34 + (p3.y - p1.y) * dx34) / denominator;
    if (t1 == Number.NEGATIVE_INFINITY || t1 == Number.POSITIVE_INFINITY)
    {
        // The lines are parallel (or close enough to it).
        lines_intersect = false;
        segments_intersect = false;
		intersection = { x : Number.NaN, y : Number.NaN };
        close_p1 = { x : Number.NaN, y : Number.NaN };
        close_p2 = { x : Number.NaN, y : Number.NaN };
        t2 = Number.POSITIVE_INFINITY;
        return;
    }
    lines_intersect = true;

    t2 = ((p3.x - p1.x) * dy12 + (p1.y - p3.y) * dx12) / -denominator;

    // Find the point of intersection.
	intersection = { x : p1.x + dx12 * t1, y : p1.y + dy12 * t1 };

    // The segments intersect if t1 and t2 are between 0 and 1.
    segments_intersect = ((t1 >= 0) && (t1 <= 1) && (t2 >= 0) && (t2 <= 1));

    // Find the closest points on the segments.
    if (t1 < 0) t1 = 0;
    else if (t1 > 1) t1 = 1;

    if (t2 < 0) t2 = 0;
    else if (t2 > 1) t2 = 1;

	close_p1 = { x : p1.x + dx12 * t1, y : p1.y + dy12 * t1 };
	close_p2 = { x : p3.x + dx34 * t2, y : p3.y + dy34 * t2 };
	
	return {
		lines_intersect : lines_intersect,
		segments_intersect : segments_intersect,
		intersection : intersection,
		close_p1 : close_p1,
		close_p2 : close_p2,
		t1 : t1,
		t2 : t2
	};
}

MathTools.pointIsInPolygon = function(x, y, polygon_points) {
    // Get the angle between the point and the
    // first and last vertices.
    var max_point = polygon_points.length - 1;
    var total_angle = MathTool.getAngle2(
        polygon_points[max_point].x, polygon_points[max_point].y,
        x, y,
        polygon_points[0].x, polygon_points[0].y);

    // Add the angles from the point
    // to each other pair of vertices.
    for (var i = 0; i < max_point; i++)
    {
        total_angle += MathTool.getAngle2(
            polygon_points[i].x, polygon_points[i].y,
            x, y,
            polygon_points[i + 1].x, polygon_points[i + 1].y);
    }

    // The total angle should be 2 * PI or -2 * PI if
    // the point is in the polygon and close to zero
    // if the point is outside the polygon.
    return (Math.abs(total_angle) > 0.000001);
}

MathTools.getAngle2 = function(Ax, Ay, Bx, By, Cx, Cy) {
	// Get the dot product.
	var dot_product = MathTools.dotProduct(Ax, Ay, Bx, By, Cx, Cy);

	// Get the cross product.
	var cross_product = MathTools.crossProductLength(Ax, Ay, Bx, By, Cx, Cy);

	// Calculate the angle.
	return Math.atan2(cross_product, dot_product);
}

// Return the dot product AB · BC.
// Note that AB · BC = |AB| * |BC| * Cos(theta).
MathTools.dotProduct = function(Ax, Ay, Bx, By, Cx, Cy) {
	// Get the vectors' coordinates.
	var BAx = Ax - Bx;
	var BAy = Ay - By;
	var BCx = Cx - Bx;
	var BCy = Cy - By;

	// Calculate the dot product.
	return (BAx * BCx + BAy * BCy);
}

MathTools.crossProductLength = function(Ax, Ay, Bx, By, Cx, Cy)
{
    // Get the vectors' coordinates.
    var BAx = Ax - Bx;
    var BAy = Ay - By;
    var BCx = Cx - Bx;
    var BCy = Cy - By;

    // Calculate the Z coordinate of the cross product.
    return (BAx * BCy - BAy * BCx);
}
// src/matrix.js
// Represents a 4x4 matrix stored in row-major order that uses Float32Arrays
// when available. Matrix operations can either be done using convenient
// methods that return a new matrix for the result or optimized methods
// that store the result in an existing matrix to avoid generating garbage.

var hasFloat32Array = (typeof Float32Array != 'undefined');

// ### new GL.Matrix([elements])
//
// This constructor takes 16 arguments in row-major order, which can be passed
// individually, as a list, or even as four lists, one for each row. If the
// arguments are omitted then the identity matrix is constructed instead.
function Matrix() {
  var m = Array.prototype.concat.apply([], arguments);
  if (!m.length) {
    m = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }
  this.m = hasFloat32Array ? new Float32Array(m) : m;
}

Matrix.prototype = {
  // ### .inverse()
  //
  // Returns the matrix that when multiplied with this matrix results in the
  // identity matrix.
  inverse: function() {
    return Matrix.inverse(this, new Matrix());
  },

  // ### .transpose()
  //
  // Returns this matrix, exchanging columns for rows.
  transpose: function() {
    return Matrix.transpose(this, new Matrix());
  },

  // ### .multiply(matrix)
  //
  // Returns the concatenation of the transforms for this matrix and `matrix`.
  // This emulates the OpenGL function `glMultMatrix()`.
  multiply: function(matrix) {
    return Matrix.multiply(this, matrix, new Matrix());
  },

  // ### .transformPoint(point)
  //
  // Transforms the vector as a point with a w coordinate of 1. This
  // means translations will have an effect, for example.
  transformPoint: function(v) {
    var m = this.m;
    return new Vector(
      m[0] * v.x + m[1] * v.y + m[2] * v.z + m[3],
      m[4] * v.x + m[5] * v.y + m[6] * v.z + m[7],
      m[8] * v.x + m[9] * v.y + m[10] * v.z + m[11]
    ).divide(m[12] * v.x + m[13] * v.y + m[14] * v.z + m[15]);
  },

  // ### .transformPoint(vector)
  //
  // Transforms the vector as a vector with a w coordinate of 0. This
  // means translations will have no effect, for example.
  transformVector: function(v) {
    var m = this.m;
    return new Vector(
      m[0] * v.x + m[1] * v.y + m[2] * v.z,
      m[4] * v.x + m[5] * v.y + m[6] * v.z,
      m[8] * v.x + m[9] * v.y + m[10] * v.z
    );
  }
};

// ### GL.Matrix.inverse(matrix[, result])
//
// Returns the matrix that when multiplied with `matrix` results in the
// identity matrix. You can optionally pass an existing matrix in `result`
// to avoid allocating a new matrix. This implementation is from the Mesa
// OpenGL function `__gluInvertMatrixd()` found in `project.c`.
Matrix.inverse = function(matrix, result) {
  result = result || new Matrix();
  var m = matrix.m, r = result.m;

  r[0] = m[5]*m[10]*m[15] - m[5]*m[14]*m[11] - m[6]*m[9]*m[15] + m[6]*m[13]*m[11] + m[7]*m[9]*m[14] - m[7]*m[13]*m[10];
  r[1] = -m[1]*m[10]*m[15] + m[1]*m[14]*m[11] + m[2]*m[9]*m[15] - m[2]*m[13]*m[11] - m[3]*m[9]*m[14] + m[3]*m[13]*m[10];
  r[2] = m[1]*m[6]*m[15] - m[1]*m[14]*m[7] - m[2]*m[5]*m[15] + m[2]*m[13]*m[7] + m[3]*m[5]*m[14] - m[3]*m[13]*m[6];
  r[3] = -m[1]*m[6]*m[11] + m[1]*m[10]*m[7] + m[2]*m[5]*m[11] - m[2]*m[9]*m[7] - m[3]*m[5]*m[10] + m[3]*m[9]*m[6];

  r[4] = -m[4]*m[10]*m[15] + m[4]*m[14]*m[11] + m[6]*m[8]*m[15] - m[6]*m[12]*m[11] - m[7]*m[8]*m[14] + m[7]*m[12]*m[10];
  r[5] = m[0]*m[10]*m[15] - m[0]*m[14]*m[11] - m[2]*m[8]*m[15] + m[2]*m[12]*m[11] + m[3]*m[8]*m[14] - m[3]*m[12]*m[10];
  r[6] = -m[0]*m[6]*m[15] + m[0]*m[14]*m[7] + m[2]*m[4]*m[15] - m[2]*m[12]*m[7] - m[3]*m[4]*m[14] + m[3]*m[12]*m[6];
  r[7] = m[0]*m[6]*m[11] - m[0]*m[10]*m[7] - m[2]*m[4]*m[11] + m[2]*m[8]*m[7] + m[3]*m[4]*m[10] - m[3]*m[8]*m[6];

  r[8] = m[4]*m[9]*m[15] - m[4]*m[13]*m[11] - m[5]*m[8]*m[15] + m[5]*m[12]*m[11] + m[7]*m[8]*m[13] - m[7]*m[12]*m[9];
  r[9] = -m[0]*m[9]*m[15] + m[0]*m[13]*m[11] + m[1]*m[8]*m[15] - m[1]*m[12]*m[11] - m[3]*m[8]*m[13] + m[3]*m[12]*m[9];
  r[10] = m[0]*m[5]*m[15] - m[0]*m[13]*m[7] - m[1]*m[4]*m[15] + m[1]*m[12]*m[7] + m[3]*m[4]*m[13] - m[3]*m[12]*m[5];
  r[11] = -m[0]*m[5]*m[11] + m[0]*m[9]*m[7] + m[1]*m[4]*m[11] - m[1]*m[8]*m[7] - m[3]*m[4]*m[9] + m[3]*m[8]*m[5];

  r[12] = -m[4]*m[9]*m[14] + m[4]*m[13]*m[10] + m[5]*m[8]*m[14] - m[5]*m[12]*m[10] - m[6]*m[8]*m[13] + m[6]*m[12]*m[9];
  r[13] = m[0]*m[9]*m[14] - m[0]*m[13]*m[10] - m[1]*m[8]*m[14] + m[1]*m[12]*m[10] + m[2]*m[8]*m[13] - m[2]*m[12]*m[9];
  r[14] = -m[0]*m[5]*m[14] + m[0]*m[13]*m[6] + m[1]*m[4]*m[14] - m[1]*m[12]*m[6] - m[2]*m[4]*m[13] + m[2]*m[12]*m[5];
  r[15] = m[0]*m[5]*m[10] - m[0]*m[9]*m[6] - m[1]*m[4]*m[10] + m[1]*m[8]*m[6] + m[2]*m[4]*m[9] - m[2]*m[8]*m[5];

  var det = m[0]*r[0] + m[1]*r[4] + m[2]*r[8] + m[3]*r[12];
  for (var i = 0; i < 16; i++) r[i] /= det;
  return result;
};

// ### GL.Matrix.transpose(matrix[, result])
//
// Returns `matrix`, exchanging columns for rows. You can optionally pass an
// existing matrix in `result` to avoid allocating a new matrix.
Matrix.transpose = function(matrix, result) {
  result = result || new Matrix();
  var m = matrix.m, r = result.m;
  r[0] = m[0]; r[1] = m[4]; r[2] = m[8]; r[3] = m[12];
  r[4] = m[1]; r[5] = m[5]; r[6] = m[9]; r[7] = m[13];
  r[8] = m[2]; r[9] = m[6]; r[10] = m[10]; r[11] = m[14];
  r[12] = m[3]; r[13] = m[7]; r[14] = m[11]; r[15] = m[15];
  return result;
};

// ### GL.Matrix.multiply(left, right[, result])
//
// Returns the concatenation of the transforms for `left` and `right`. You can
// optionally pass an existing matrix in `result` to avoid allocating a new
// matrix. This emulates the OpenGL function `glMultMatrix()`.
Matrix.multiply = function(left, right, result) {
  result = result || new Matrix();
  var a = left.m, b = right.m, r = result.m;

  r[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
  r[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
  r[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
  r[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

  r[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
  r[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
  r[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
  r[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

  r[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
  r[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
  r[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
  r[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

  r[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
  r[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
  r[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
  r[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

  return result;
};

Matrix.multiply2 = function(matrix1, matrix2, result) {
    result = result || new Matrix();
    var m11 = (((matrix1.m[0] * matrix2.m[0]) + (matrix1.m[1] * matrix2.m[4])) + (matrix1.m[2] * matrix2.m[8])) + (matrix1.m[3] * matrix2.m[12]);
    var m12 = (((matrix1.m[0] * matrix2.m[1]) + (matrix1.m[1] * matrix2.m[5])) + (matrix1.m[2] * matrix2.m[9])) + (matrix1.m[3] * matrix2.m[13]);
    var m13 = (((matrix1.m[0] * matrix2.m[2]) + (matrix1.m[1] * matrix2.m[6])) + (matrix1.m[2] * matrix2.m[10])) + (matrix1.m[3] * matrix2.m[14]);
    var m14 = (((matrix1.m[0] * matrix2.m[3]) + (matrix1.m[1] * matrix2.m[7])) + (matrix1.m[2] * matrix2.m[11])) + (matrix1.m[3] * matrix2.m[15]);
    var m21 = (((matrix1.m[4] * matrix2.m[0]) + (matrix1.m[5] * matrix2.m[4])) + (matrix1.m[6] * matrix2.m[8])) + (matrix1.m[7] * matrix2.m[12]);
    var m22 = (((matrix1.m[4] * matrix2.m[1]) + (matrix1.m[5] * matrix2.m[5])) + (matrix1.m[6] * matrix2.m[9])) + (matrix1.m[7] * matrix2.m[13]);
    var m23 = (((matrix1.m[4] * matrix2.m[2]) + (matrix1.m[5] * matrix2.m[6])) + (matrix1.m[6] * matrix2.m[10])) + (matrix1.m[7] * matrix2.m[14]);
    var m24 = (((matrix1.m[4] * matrix2.m[3]) + (matrix1.m[5] * matrix2.m[7])) + (matrix1.m[6] * matrix2.m[11])) + (matrix1.m[7] * matrix2.m[15]);
    var m31 = (((matrix1.m[8] * matrix2.m[0]) + (matrix1.m[9] * matrix2.m[4])) + (matrix1.m[10] * matrix2.m[8])) + (matrix1.m[11] * matrix2.m[12]);
    var m32 = (((matrix1.m[8] * matrix2.m[1]) + (matrix1.m[9] * matrix2.m[5])) + (matrix1.m[10] * matrix2.m[9])) + (matrix1.m[11] * matrix2.m[13]);
    var m33 = (((matrix1.m[8] * matrix2.m[2]) + (matrix1.m[9] * matrix2.m[6])) + (matrix1.m[10] * matrix2.m[10])) + (matrix1.m[11] * matrix2.m[14]);
    var m34 = (((matrix1.m[8] * matrix2.m[3]) + (matrix1.m[9] * matrix2.m[7])) + (matrix1.m[10] * matrix2.m[11])) + (matrix1.m[11] * matrix2.m[15]);
    var m41 = (((matrix1.m[12] * matrix2.m[0]) + (matrix1.m[13] * matrix2.m[4])) + (matrix1.m[14] * matrix2.m[8])) + (matrix1.m[15] * matrix2.m[12]);
    var m42 = (((matrix1.m[12] * matrix2.m[1]) + (matrix1.m[13] * matrix2.m[5])) + (matrix1.m[14] * matrix2.m[9])) + (matrix1.m[15] * matrix2.m[13]);
    var m43 = (((matrix1.m[12] * matrix2.m[2]) + (matrix1.m[13] * matrix2.m[6])) + (matrix1.m[14] * matrix2.m[10])) + (matrix1.m[15] * matrix2.m[14]);
    var m44 = (((matrix1.m[12] * matrix2.m[3]) + (matrix1.m[13] * matrix2.m[7])) + (matrix1.m[14] * matrix2.m[11])) + (matrix1.m[15] * matrix2.m[15]);
    result.m[0] = m11;
    result.m[1] = m21;
    result.m[2] = m31;
    result.m[3] = m41;
    result.m[4] = m12;
    result.m[5] = m22;
    result.m[6] = m32;
    result.m[7] = m42;
    result.m[8] = m13;
    result.m[9] = m23;
    result.m[10] = m33;
    result.m[11] = m34;
    result.m[12] = m14;
    result.m[13] = m24;
    result.m[14] = m34;
    result.m[15] = m44;
    return result;
}

// ### GL.Matrix.identity([result])
//
// Returns an identity matrix. You can optionally pass an existing matrix in
// `result` to avoid allocating a new matrix. This emulates the OpenGL function
// `glLoadIdentity()`.
Matrix.identity = function(result) {
  result = result || new Matrix();
  var m = result.m;
  m[0] = m[5] = m[10] = m[15] = 1;
  m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = m[12] = m[13] = m[14] = 0;
  return result;
};

// ### GL.Matrix.perspective(fov, aspect, near, far[, result])
//
// Returns a perspective transform matrix, which makes far away objects appear
// smaller than nearby objects. The `aspect` argument should be the width
// divided by the height of your viewport and `fov` is the top-to-bottom angle
// of the field of view in degrees. You can optionally pass an existing matrix
// in `result` to avoid allocating a new matrix. This emulates the OpenGL
// function `gluPerspective()`.
Matrix.perspective = function(fov, aspect, near, far, result) {
  var y = Math.tan(fov * Math.PI / 360) * near;
  var x = y * aspect;
  return Matrix.frustum(-x, x, -y, y, near, far, result);
};

// ### GL.Matrix.frustum(left, right, bottom, top, near, far[, result])
//
// Sets up a viewing frustum, which is shaped like a truncated pyramid with the
// camera where the point of the pyramid would be. You can optionally pass an
// existing matrix in `result` to avoid allocating a new matrix. This emulates
// the OpenGL function `glFrustum()`.
Matrix.frustum = function(l, r, b, t, n, f, result) {
  result = result || new Matrix();
  var m = result.m;

  m[0] = 2 * n / (r - l);
  m[1] = 0;
  m[2] = (r + l) / (r - l);
  m[3] = 0;

  m[4] = 0;
  m[5] = 2 * n / (t - b);
  m[6] = (t + b) / (t - b);
  m[7] = 0;

  m[8] = 0;
  m[9] = 0;
  m[10] = -(f + n) / (f - n);
  m[11] = -2 * f * n / (f - n);

  m[12] = 0;
  m[13] = 0;
  m[14] = -1;
  m[15] = 0;

  return result;
};

// ### GL.Matrix.ortho(left, right, bottom, top, near, far[, result])
//
// Returns an orthographic projection, in which objects are the same size no
// matter how far away or nearby they are. You can optionally pass an existing
// matrix in `result` to avoid allocating a new matrix. This emulates the OpenGL
// function `glOrtho()`.
Matrix.ortho = function(l, r, b, t, n, f, result) {
  result = result || new Matrix();
  var m = result.m;

  m[0] = 2 / (r - l);
  m[1] = 0;
  m[2] = 0;
  m[3] = -(r + l) / (r - l);

  m[4] = 0;
  m[5] = 2 / (t - b);
  m[6] = 0;
  m[7] = -(t + b) / (t - b);

  m[8] = 0;
  m[9] = 0;
  m[10] = -2 / (f - n);
  m[11] = -(f + n) / (f - n);

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return result;
};

// ### GL.Matrix.scale(x, y, z[, result])
//
// This emulates the OpenGL function `glScale()`. You can optionally pass an
// existing matrix in `result` to avoid allocating a new matrix.
Matrix.scale = function(x, y, z, result) {
  result = result || new Matrix();
  var m = result.m;

  m[0] = x;
  m[1] = 0;
  m[2] = 0;
  m[3] = 0;

  m[4] = 0;
  m[5] = y;
  m[6] = 0;
  m[7] = 0;

  m[8] = 0;
  m[9] = 0;
  m[10] = z;
  m[11] = 0;

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return result;
};

// ### GL.Matrix.translate(x, y, z[, result])
//
// This emulates the OpenGL function `glTranslate()`. You can optionally pass
// an existing matrix in `result` to avoid allocating a new matrix.
Matrix.translate = function(x, y, z, result) {
  result = result || new Matrix();
  var m = result.m;

  m[0] = 1;
  m[1] = 0;
  m[2] = 0;
  m[3] = x;

  m[4] = 0;
  m[5] = 1;
  m[6] = 0;
  m[7] = y;

  m[8] = 0;
  m[9] = 0;
  m[10] = 1;
  m[11] = z;

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return result;
};

Matrix.translate2 = function(x, y, z) {
    var result = new Matrix();
    result.m[0] = 1;
    result.m[1] = 0;
    result.m[2] = 0;
    result.m[3] = x;
    result.m[4] = 0;
    result.m[5] = 1;
    result.m[6] = 0;
    result.m[7] = y;
    result.m[8] = 0;
    result.m[9] = 0;
    result.m[10] = 1;
    result.m[11] = z;
    result.m[12] = 0;
    result.m[13] = 0;
    result.m[14] = 0;
    result.m[15] = 1;
    return result;
}

// ### GL.Matrix.rotate(a, x, y, z[, result])
//
// Returns a matrix that rotates by `a` degrees around the vector `x, y, z`.
// You can optionally pass an existing matrix in `result` to avoid allocating
// a new matrix. This emulates the OpenGL function `glRotate()`.
Matrix.rotate = function(a, x, y, z, result) {
  if (!a || (!x && !y && !z)) {
    return Matrix.identity(result);
  }

  result = result || new Matrix();
  var m = result.m;

  var d = Math.sqrt(x*x + y*y + z*z);
  a *= Math.PI / 180; x /= d; y /= d; z /= d;
  var c = Math.cos(a), s = Math.sin(a), t = 1 - c;

  m[0] = x * x * t + c;
  m[1] = x * y * t - z * s;
  m[2] = x * z * t + y * s;
  m[3] = 0;

  m[4] = y * x * t + z * s;
  m[5] = y * y * t + c;
  m[6] = y * z * t - x * s;
  m[7] = 0;

  m[8] = z * x * t - y * s;
  m[9] = z * y * t + x * s;
  m[10] = z * z * t + c;
  m[11] = 0;

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return result;
};

Matrix.rotateZ = function(radians) {
    var result = Matrix.identity();
    var val1 = Math.cos(radians);
    var val2 = Math.sin(radians);
    
    result.m[0] = val1;
    result.m[4] = -val2;
    result.m[1] = val2;
    result.m[5] = val1;
    
    return result;
}

// ### GL.Matrix.lookAt(ex, ey, ez, cx, cy, cz, ux, uy, uz[, result])
//
// Returns a matrix that puts the camera at the eye point `ex, ey, ez` looking
// toward the center point `cx, cy, cz` with an up direction of `ux, uy, uz`.
// You can optionally pass an existing matrix in `result` to avoid allocating
// a new matrix. This emulates the OpenGL function `gluLookAt()`.
Matrix.lookAt = function(ex, ey, ez, cx, cy, cz, ux, uy, uz, result) {
  result = result || new Matrix();
  var m = result.m;

  var e = new Vector(ex, ey, ez);
  var c = new Vector(cx, cy, cz);
  var u = new Vector(ux, uy, uz);
  var f = e.subtract(c).unit();
  var s = u.cross(f).unit();
  var t = f.cross(s).unit();

  m[0] = s.x;
  m[1] = s.y;
  m[2] = s.z;
  m[3] = -s.dot(e);

  m[4] = t.x;
  m[5] = t.y;
  m[6] = t.z;
  m[7] = -t.dot(e);

  m[8] = f.x;
  m[9] = f.y;
  m[10] = f.z;
  m[11] = -f.dot(e);

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return result;
};

// src/md5.js
/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(o,q){var l={},m=l.lib={},n=m.Base=function(){function a(){}return{extend:function(e){a.prototype=this;var c=new a;e&&c.mixIn(e);c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.$super.extend(this)}}}(),j=m.WordArray=n.extend({init:function(a,e){a=
this.words=a||[];this.sigBytes=e!=q?e:4*a.length},toString:function(a){return(a||r).stringify(this)},concat:function(a){var e=this.words,c=a.words,d=this.sigBytes,a=a.sigBytes;this.clamp();if(d%4)for(var b=0;b<a;b++)e[d+b>>>2]|=(c[b>>>2]>>>24-8*(b%4)&255)<<24-8*((d+b)%4);else if(65535<c.length)for(b=0;b<a;b+=4)e[d+b>>>2]=c[b>>>2];else e.push.apply(e,c);this.sigBytes+=a;return this},clamp:function(){var a=this.words,e=this.sigBytes;a[e>>>2]&=4294967295<<32-8*(e%4);a.length=o.ceil(e/4)},clone:function(){var a=
n.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var e=[],c=0;c<a;c+=4)e.push(4294967296*o.random()|0);return j.create(e,a)}}),k=l.enc={},r=k.Hex={stringify:function(a){for(var e=a.words,a=a.sigBytes,c=[],d=0;d<a;d++){var b=e[d>>>2]>>>24-8*(d%4)&255;c.push((b>>>4).toString(16));c.push((b&15).toString(16))}return c.join("")},parse:function(a){for(var b=a.length,c=[],d=0;d<b;d+=2)c[d>>>3]|=parseInt(a.substr(d,2),16)<<24-4*(d%8);return j.create(c,b/2)}},p=k.Latin1={stringify:function(a){for(var b=
a.words,a=a.sigBytes,c=[],d=0;d<a;d++)c.push(String.fromCharCode(b[d>>>2]>>>24-8*(d%4)&255));return c.join("")},parse:function(a){for(var b=a.length,c=[],d=0;d<b;d++)c[d>>>2]|=(a.charCodeAt(d)&255)<<24-8*(d%4);return j.create(c,b)}},h=k.Utf8={stringify:function(a){try{return decodeURIComponent(escape(p.stringify(a)))}catch(b){throw Error("Malformed UTF-8 data");}},parse:function(a){return p.parse(unescape(encodeURIComponent(a)))}},b=m.BufferedBlockAlgorithm=n.extend({reset:function(){this._data=j.create();
this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=h.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var b=this._data,c=b.words,d=b.sigBytes,f=this.blockSize,i=d/(4*f),i=a?o.ceil(i):o.max((i|0)-this._minBufferSize,0),a=i*f,d=o.min(4*a,d);if(a){for(var h=0;h<a;h+=f)this._doProcessBlock(c,h);h=c.splice(0,a);b.sigBytes-=d}return j.create(h,d)},clone:function(){var a=n.clone.call(this);a._data=this._data.clone();return a},_minBufferSize:0});m.Hasher=b.extend({init:function(){this.reset()},
reset:function(){b.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);this._doFinalize();return this._hash},clone:function(){var a=b.clone.call(this);a._hash=this._hash.clone();return a},blockSize:16,_createHelper:function(a){return function(b,c){return a.create(c).finalize(b)}},_createHmacHelper:function(a){return function(b,c){return f.HMAC.create(a,c).finalize(b)}}});var f=l.algo={};return l}(Math);
(function(o){function q(b,f,a,e,c,d,g){b=b+(f&a|~f&e)+c+g;return(b<<d|b>>>32-d)+f}function l(b,f,a,e,c,d,g){b=b+(f&e|a&~e)+c+g;return(b<<d|b>>>32-d)+f}function m(b,f,a,e,c,d,g){b=b+(f^a^e)+c+g;return(b<<d|b>>>32-d)+f}function n(b,f,a,e,c,d,g){b=b+(a^(f|~e))+c+g;return(b<<d|b>>>32-d)+f}var j=CryptoJS,k=j.lib,r=k.WordArray,k=k.Hasher,p=j.algo,h=[];(function(){for(var b=0;64>b;b++)h[b]=4294967296*o.abs(o.sin(b+1))|0})();p=p.MD5=k.extend({_doReset:function(){this._hash=r.create([1732584193,4023233417,
2562383102,271733878])},_doProcessBlock:function(b,f){for(var a=0;16>a;a++){var e=f+a,c=b[e];b[e]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360}for(var e=this._hash.words,c=e[0],d=e[1],g=e[2],i=e[3],a=0;64>a;a+=4)16>a?(c=q(c,d,g,i,b[f+a],7,h[a]),i=q(i,c,d,g,b[f+a+1],12,h[a+1]),g=q(g,i,c,d,b[f+a+2],17,h[a+2]),d=q(d,g,i,c,b[f+a+3],22,h[a+3])):32>a?(c=l(c,d,g,i,b[f+(a+1)%16],5,h[a]),i=l(i,c,d,g,b[f+(a+6)%16],9,h[a+1]),g=l(g,i,c,d,b[f+(a+11)%16],14,h[a+2]),d=l(d,g,i,c,b[f+a%16],20,h[a+3])):48>a?(c=
m(c,d,g,i,b[f+(3*a+5)%16],4,h[a]),i=m(i,c,d,g,b[f+(3*a+8)%16],11,h[a+1]),g=m(g,i,c,d,b[f+(3*a+11)%16],16,h[a+2]),d=m(d,g,i,c,b[f+(3*a+14)%16],23,h[a+3])):(c=n(c,d,g,i,b[f+3*a%16],6,h[a]),i=n(i,c,d,g,b[f+(3*a+7)%16],10,h[a+1]),g=n(g,i,c,d,b[f+(3*a+14)%16],15,h[a+2]),d=n(d,g,i,c,b[f+(3*a+5)%16],21,h[a+3]));e[0]=e[0]+c|0;e[1]=e[1]+d|0;e[2]=e[2]+g|0;e[3]=e[3]+i|0},_doFinalize:function(){var b=this._data,f=b.words,a=8*this._nDataBytes,e=8*b.sigBytes;f[e>>>5]|=128<<24-e%32;f[(e+64>>>9<<4)+14]=(a<<8|a>>>
24)&16711935|(a<<24|a>>>8)&4278255360;b.sigBytes=4*(f.length+1);this._process();b=this._hash.words;for(f=0;4>f;f++)a=b[f],b[f]=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360}});j.MD5=k._createHelper(p);j.HmacMD5=k._createHmacHelper(p)})(Math);
// src/mesh.js
// Represents indexed triangle geometry with arbitrary additional attributes.
// You need a shader to draw a mesh; meshes can't draw themselves.
//
// A mesh is a collection of `GL.Buffer` objects which are either vertex buffers
// (holding per-vertex attributes) or index buffers (holding the order in which
// vertices are rendered). By default, a mesh has a position vertex buffer called
// `vertices` and a triangle index buffer called `triangles`. New buffers can be
// added using `addVertexBuffer()` and `addIndexBuffer()`. Two strings are
// required when adding a new vertex buffer, the name of the data array on the
// mesh instance and the name of the GLSL attribute in the vertex shader.
//
// Example usage:
//
//     var mesh = new GL.Mesh({ coords: true, lines: true });
//
//     // Default attribute "vertices", available as "gl_Vertex" in
//     // the vertex shader
//     mesh.vertices = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]];
//
//     // Optional attribute "coords" enabled in constructor,
//     // available as "gl_TexCoord" in the vertex shader
//     mesh.coords = [[0, 0], [1, 0], [0, 1], [1, 1]];
//
//     // Custom attribute "weights", available as "weight" in the
//     // vertex shader
//     mesh.addVertexBuffer('weights', 'weight');
//     mesh.weights = [1, 0, 0, 1];
//
//     // Default index buffer "triangles"
//     mesh.triangles = [[0, 1, 2], [2, 1, 3]];
//
//     // Optional index buffer "lines" enabled in constructor
//     mesh.lines = [[0, 1], [0, 2], [1, 3], [2, 3]];
//
//     // Upload provided data to GPU memory
//     mesh.compile();

// ### new GL.Indexer()
//
// Generates indices into a list of unique objects from a stream of objects
// that may contain duplicates. This is useful for generating compact indexed
// meshes from unindexed data.
function Indexer() {
  this.unique = [];
  this.indices = [];
  this.map = {};
}

Indexer.prototype = {
  // ### .add(v)
  //
  // Adds the object `obj` to `unique` if it hasn't already been added. Returns
  // the index of `obj` in `unique`.
  add: function(obj) {
    var key = JSON.stringify(obj);
    if (!(key in this.map)) {
      this.map[key] = this.unique.length;
      this.unique.push(obj);
    }
    return this.map[key];
  }
};

// ### new GL.Buffer(target, type)
//
// Provides a simple method of uploading data to a GPU buffer. Example usage:
//
//     var vertices = new GL.Buffer(gl.ARRAY_BUFFER, Float32Array);
//     var indices = new GL.Buffer(gl.ELEMENT_ARRAY_BUFFER, Uint16Array);
//     vertices.data = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]];
//     indices.data = [[0, 1, 2], [2, 1, 3]];
//     vertices.compile();
//     indices.compile();
//
function Buffer(target, type) {
  this.buffer = null;
  this.target = target;
  this.type = type;
  this.data = [];
}

Buffer.prototype = {
  // ### .compile(type)
  //
  // Upload the contents of `data` to the GPU in preparation for rendering. The
  // data must be a list of lists where each inner list has the same length. For
  // example, each element of data for vertex normals would be a list of length three.
  // This will remember the data length and element length for later use by shaders.
  // The type can be either `gl.STATIC_DRAW` or `gl.DYNAMIC_DRAW`, and defaults to
  // `gl.STATIC_DRAW`.
  //
  // This could have used `[].concat.apply([], this.data)` to flatten
  // the array but Google Chrome has a maximum number of arguments so the
  // concatenations are chunked to avoid that limit.
  compile: function(type) {
    var data = [];
    for (var i = 0, chunk = 10000; i < this.data.length; i += chunk) {
      data = Array.prototype.concat.apply(data, this.data.slice(i, i + chunk));
    }
    var spacing = this.data.length ? data.length / this.data.length : 0;
    if (spacing != Math.round(spacing)) throw new Error('buffer elements not of consistent size, average size is ' + spacing);
    this.buffer = this.buffer || gl.createBuffer();
    this.buffer.length = data.length;
    this.buffer.spacing = spacing;
    gl.bindBuffer(this.target, this.buffer);
    gl.bufferData(this.target, new this.type(data), type || gl.STATIC_DRAW);
  }
};

// ### new GL.Mesh([options])
//
// Represents a collection of vertex buffers and index buffers. Each vertex
// buffer maps to one attribute in GLSL and has a corresponding property set
// on the Mesh instance. There is one vertex buffer by default: `vertices`,
// which maps to `gl_Vertex`. The `coords`, `normals`, and `colors` vertex
// buffers map to `gl_TexCoord`, `gl_Normal`, and `gl_Color` respectively,
// and can be enabled by setting the corresponding options to true. There are
// two index buffers, `triangles` and `lines`, which are used for rendering
// `gl.TRIANGLES` and `gl.LINES`, respectively. Only `triangles` is enabled by
// default, although `computeWireframe()` will add a normal buffer if it wasn't
// initially enabled.
function Mesh(options) {
  options = options || {};
  this.vertexBuffers = {};
  this.indexBuffers = {};
  this.addVertexBuffer('vertices', 'gl_Vertex');
  if (options.coords) this.addVertexBuffer('coords', 'gl_TexCoord');
  if (options.normals) this.addVertexBuffer('normals', 'gl_Normal');
  if (options.colors) this.addVertexBuffer('colors', 'gl_Color');
  if (!('triangles' in options) || options.triangles) this.addIndexBuffer('triangles');
  if (options.lines) this.addIndexBuffer('lines');
}

Mesh.prototype = {
  // ### .addVertexBuffer(name, attribute)
  //
  // Add a new vertex buffer with a list as a property called `name` on this object
  // and map it to the attribute called `attribute` in all shaders that draw this mesh.
  addVertexBuffer: function(name, attribute) {
    var buffer = this.vertexBuffers[attribute] = new Buffer(gl.ARRAY_BUFFER, Float32Array);
    buffer.name = name;
    this[name] = [];
  },

  // ### .addIndexBuffer(name)
  //
  // Add a new index buffer with a list as a property called `name` on this object.
  addIndexBuffer: function(name) {
    var buffer = this.indexBuffers[name] = new Buffer(gl.ELEMENT_ARRAY_BUFFER, Uint16Array);
    this[name] = [];
  },

  // ### .compile()
  //
  // Upload all attached buffers to the GPU in preparation for rendering. This
  // doesn't need to be called every frame, only needs to be done when the data
  // changes.
  compile: function() {
    for (var attribute in this.vertexBuffers) {
      var buffer = this.vertexBuffers[attribute];
      buffer.data = this[buffer.name];
      buffer.compile();
    }

    for (var name in this.indexBuffers) {
      var buffer = this.indexBuffers[name];
      buffer.data = this[name];
      buffer.compile();
    }
  },

  // ### .transform(matrix)
  //
  // Transform all vertices by `matrix` and all normals by the inverse transpose
  // of `matrix`.
  transform: function(matrix) {
    this.vertices = this.vertices.map(function(v) {
      return matrix.transformPoint(Vector.fromArray(v)).toArray();
    });
    if (this.normals) {
      var invTrans = matrix.inverse().transpose();
      this.normals = this.normals.map(function(n) {
        return invTrans.transformVector(Vector.fromArray(n)).unit().toArray();
      });
    }
    this.compile();
    return this;
  },

  // ### .computeNormals()
  //
  // Computes a new normal for each vertex from the average normal of the
  // neighboring triangles. This means adjacent triangles must share vertices
  // for the resulting normals to be smooth.
  computeNormals: function() {
    if (!this.normals) this.addVertexBuffer('normals', 'gl_Normal');
    for (var i = 0; i < this.vertices.length; i++) {
      this.normals[i] = new Vector();
    }
    for (var i = 0; i < this.triangles.length; i++) {
      var t = this.triangles[i];
      var a = Vector.fromArray(this.vertices[t[0]]);
      var b = Vector.fromArray(this.vertices[t[1]]);
      var c = Vector.fromArray(this.vertices[t[2]]);
      var normal = b.subtract(a).cross(c.subtract(a)).unit();
      this.normals[t[0]] = this.normals[t[0]].add(normal);
      this.normals[t[1]] = this.normals[t[1]].add(normal);
      this.normals[t[2]] = this.normals[t[2]].add(normal);
    }
    for (var i = 0; i < this.vertices.length; i++) {
      this.normals[i] = this.normals[i].unit().toArray();
    }
    this.compile();
    return this;
  },

  // ### .computeWireframe()
  //
  // Populate the `lines` index buffer from the `triangles` index buffer.
  computeWireframe: function() {
    var indexer = new Indexer();
    for (var i = 0; i < this.triangles.length; i++) {
      var t = this.triangles[i];
      for (var j = 0; j < t.length; j++) {
        var a = t[j], b = t[(j + 1) % t.length];
        indexer.add([Math.min(a, b), Math.max(a, b)]);
      }
    }
    if (!this.lines) this.addIndexBuffer('lines');
    this.lines = indexer.unique;
    this.compile();
    return this;
  },

  // ### .getAABB()
  //
  // Computes the axis-aligned bounding box, which is an object whose `min` and
  // `max` properties contain the minimum and maximum coordinates of all vertices.
  getAABB: function() {
    var aabb = { min: new Vector(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE) };
    aabb.max = aabb.min.negative();
    for (var i = 0; i < this.vertices.length; i++) {
      var v = Vector.fromArray(this.vertices[i]);
      aabb.min = Vector.min(aabb.min, v);
      aabb.max = Vector.max(aabb.max, v);
    }
    return aabb;
  },

  // ### .getBoundingSphere()
  //
  // Computes a sphere that contains all vertices (not necessarily the smallest
  // sphere). The returned object has two properties, `center` and `radius`.
  getBoundingSphere: function() {
    var aabb = this.getAABB();
    var sphere = { center: aabb.min.add(aabb.max).divide(2), radius: 0 };
    for (var i = 0; i < this.vertices.length; i++) {
      sphere.radius = Math.max(sphere.radius,
        Vector.fromArray(this.vertices[i]).subtract(sphere.center).length());
    }
    return sphere;
  }
};

// ### GL.Mesh.plane([options])
//
// Generates a square 2x2 mesh the xy plane centered at the origin. The
// `options` argument specifies options to pass to the mesh constructor.
// Additional options include `detailX` and `detailY`, which set the tesselation
// in x and y, and `detail`, which sets both `detailX` and `detailY` at once.
// Two triangles are generated by default.
// Example usage:
//
//     var mesh1 = GL.Mesh.plane();
//     var mesh2 = GL.Mesh.plane({ detail: 5 });
//     var mesh3 = GL.Mesh.plane({ detailX: 20, detailY: 40 });
//
Mesh.plane = function(options) {
  options = options || {};
  var mesh = new Mesh(options);
  detailX = options.detailX || options.detail || 1;
  detailY = options.detailY || options.detail || 1;

  for (var y = 0; y <= detailY; y++) {
    var t = y / detailY;
    for (var x = 0; x <= detailX; x++) {
      var s = x / detailX;
      mesh.vertices.push([2 * s - 1, 2 * t - 1, 0]);
      if (mesh.coords) mesh.coords.push([s, t]);
      if (mesh.normals) mesh.normals.push([0, 0, 1]);
      if (x < detailX && y < detailY) {
        var i = x + y * (detailX + 1);
        mesh.triangles.push([i, i + 1, i + detailX + 1]);
        mesh.triangles.push([i + detailX + 1, i + 1, i + detailX + 2]);
      }
    }
  }

  mesh.compile();
  return mesh;
};

var cubeData = [
  [0, 4, 2, 6, -1, 0, 0], // -x
  [1, 3, 5, 7, +1, 0, 0], // +x
  [0, 1, 4, 5, 0, -1, 0], // -y
  [2, 6, 3, 7, 0, +1, 0], // +y
  [0, 2, 1, 3, 0, 0, -1], // -z
  [4, 5, 6, 7, 0, 0, +1]  // +z
];

function pickOctant(i) {
  return new Vector((i & 1) * 2 - 1, (i & 2) - 1, (i & 4) / 2 - 1);
}

// ### GL.Mesh.cube([options])
//
// Generates a 2x2x2 box centered at the origin. The `options` argument
// specifies options to pass to the mesh constructor.
Mesh.cube = function(options) {
  var mesh = new Mesh(options);

  for (var i = 0; i < cubeData.length; i++) {
    var data = cubeData[i], v = i * 4;
    for (var j = 0; j < 4; j++) {
      var d = data[j];
      mesh.vertices.push(pickOctant(d).toArray());
      if (mesh.coords) mesh.coords.push([j & 1, (j & 2) / 2]);
      if (mesh.normals) mesh.normals.push(data.slice(4, 7));
    }
    mesh.triangles.push([v, v + 1, v + 2]);
    mesh.triangles.push([v + 2, v + 1, v + 3]);
  }

  mesh.compile();
  return mesh;
};

// ### GL.Mesh.sphere([options])
//
// Generates a geodesic sphere of radius 1. The `options` argument specifies
// options to pass to the mesh constructor in addition to the `detail` option,
// which controls the tesselation level. The detail is `6` by default.
// Example usage:
//
//     var mesh1 = GL.Mesh.sphere();
//     var mesh2 = GL.Mesh.sphere({ detail: 2 });
//
Mesh.sphere = function(options) {
  function tri(a, b, c) { return flip ? [a, c, b] : [a, b, c]; }
  function fix(x) { return x + (x - x * x) / 2; }
  options = options || {};
  var mesh = new Mesh(options);
  var indexer = new Indexer();
  detail = options.detail || 6;

  for (var octant = 0; octant < 8; octant++) {
    var scale = pickOctant(octant);
    var flip = scale.x * scale.y * scale.z > 0;
    var data = [];
    for (var i = 0; i <= detail; i++) {
      // Generate a row of vertices on the surface of the sphere
      // using barycentric coordinates.
      for (var j = 0; i + j <= detail; j++) {
        var a = i / detail;
        var b = j / detail;
        var c = (detail - i - j) / detail;
        var vertex = { vertex: new Vector(fix(a), fix(b), fix(c)).unit().multiply(scale).toArray() };
        if (mesh.coords) vertex.coord = scale.y > 0 ? [1 - a, c] : [c, 1 - a];
        data.push(indexer.add(vertex));
      }

      // Generate triangles from this row and the previous row.
      if (i > 0) {
        for (var j = 0; i + j <= detail; j++) {
          var a = (i - 1) * (detail + 1) + ((i - 1) - (i - 1) * (i - 1)) / 2 + j;
          var b = i * (detail + 1) + (i - i * i) / 2 + j;
          mesh.triangles.push(tri(data[a], data[a + 1], data[b]));
          if (i + j < detail) {
            mesh.triangles.push(tri(data[b], data[a + 1], data[b + 1]));
          }
        }
      }
    }
  }

  // Reconstruct the geometry from the indexer.
  mesh.vertices = indexer.unique.map(function(v) { return v.vertex; });
  if (mesh.coords) mesh.coords = indexer.unique.map(function(v) { return v.coord; });
  if (mesh.normals) mesh.normals = mesh.vertices;
  mesh.compile();
  return mesh;
};

// ### GL.Mesh.load(json[, options])
//
// Creates a mesh from the JSON generated by the `convert/convert.py` script.
// Example usage:
//
//     var data = {
//       vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
//       triangles: [[0, 1, 2]]
//     };
//     var mesh = GL.Mesh.load(data);
//
Mesh.load = function(json, options) {
  options = options || {};
  if (!('coords' in options)) options.coords = !!json.coords;
  if (!('normals' in options)) options.normals = !!json.normals;
  if (!('colors' in options)) options.colors = !!json.colors;
  if (!('triangles' in options)) options.triangles = !!json.triangles;
  if (!('lines' in options)) options.lines = !!json.lines;
  var mesh = new Mesh(options);
  mesh.vertices = json.vertices;
  if (mesh.coords) mesh.coords = json.coords;
  if (mesh.normals) mesh.normals = json.normals;
  if (mesh.colors) mesh.colors = json.colors;
  if (mesh.triangles) mesh.triangles = json.triangles;
  if (mesh.lines) mesh.lines = json.lines;
  mesh.compile();
  return mesh;
};

// src/module.js
/**
 * 获取网站根地址，如果是虚拟目录则带有虚拟目录名
 * @param isVirtual 是否虚拟目录
 * @returns {String}
 */
function getSiteRoot(isVirtual) {
	var siteRoot = window.location.protocol +"//"+ window.location.host +"/";
	if(!isVirtual) return siteRoot;
	
	var relativePath = window.location.pathname;
	if(relativePath != "" && relativePath.substring(0,1) == "/"){
		//此处重要，不同的浏览器可能返回的relativePath不一样
		relativePath = relativePath.substring(1);
	}
	var virtualPath = (relativePath == "") ? "" : relativePath.substring(0, relativePath.indexOf("/") + 1);

	return siteRoot + virtualPath;
}

function Module() {
}

Module.load = function(path, callback, param) {
	var root = getSiteRoot(false);

	var needAdd = true;
	// 检查脚本是否存在
	var eleList = document.querySelectorAll('script')
	for (var i = 0; i < eleList.length; i++) {
	  	// 遍历操作
	  	var ele = eleList[i];
	  	var src = ele.src.replace(root, '');
		if(src == path) {
			needAdd = false;
		}
	}
	
	if(needAdd) {
		var script=document.createElement("script");
		script.type="text/javascript";
		script.src = path;
		document.getElementsByTagName('head')[0].appendChild(script); 
		script.onload = function(){
			script.loaded = true;
			if(callback) callback(param);
		}//js加载完成执行方法
	}
	else {
		if(callback) callback(param);
	}
}

Module.replace = function(path, callback) {
	var root = getSiteRoot(false);
	
	// 检查脚本是否存在
	var exist = false;
	var eleList = document.querySelectorAll('script')
	for (var i = 0; i < eleList.length; i++) {
	  	// 遍历操作
	  	var ele = eleList[i];
	  	var src = ele.src.replace(root, '');
		if(src == path) {
			ele.parentNode.removeChild(ele); 
			exist = true;
		}
	}
	
	if(exist) {
		var script=document.createElement("script");
		script.type="text/javascript";
		script.src=path;
		document.getElementsByTagName('head')[0].appendChild(script); 
		script.onload = function(){
			script.loaded = true;
			if(callback) callback();
		}//js加载完成执行方法
	}
}
// src/pointer.js
function initPointer() {
    var body = document;

    var isScrolling = false;
    var timeout = false;
    var sDistX = 0;
    var sDistY = 0;
    window.addEventListener('scroll', function() {
        if (!isScrolling) {
            sDistX = window.pageXOffset;
            sDistY = window.pageYOffset;
        }
        isScrolling = true;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            isScrolling = false;
            sDistX = 0;
            sDistY = 0;
        }, 100);
    });

    body.addEventListener('mousedown', pointerDown);
    body.addEventListener('touchstart', pointerDown);
    body.addEventListener('mouseup', pointerUp);
    body.addEventListener('touchend', pointerUp);
    body.addEventListener('mousemove', pointerMove);
    body.addEventListener('touchmove', pointerMove);
    body.addEventListener('mouseout', pointerLeave);
    body.addEventListener('touchleave', pointerLeave);

    function pointerDown(e) {
        var evt = makePointerEvent('down', e);
        var singleFinger = evt.mouse || (evt.touch && e.touches.length === 1);
        if (!isScrolling && singleFinger) {
            e.target.maybeClick = true;
            e.target.maybeClickX = evt.x;
            e.target.maybeClickY = evt.y;
        }
    }

    function pointerLeave(e) {
        e.target.maybeClick = false;
        makePointerEvent('leave', e);
    }

    function pointerMove(e) {
        var evt = makePointerEvent('move', e);
    }

    function pointerUp(e) {
        var evt = makePointerEvent('up', e);
        if (e.target.maybeClick) {
            // Have we moved too much?
            if (Math.abs(e.target.maybeClickX - evt.x) < 5 &&
                Math.abs(e.target.maybeClickY - evt.y) < 5) {
                // Have we scrolled too much?
                if (!isScrolling ||
                    (Math.abs(sDistX - window.pageXOffset) < 5 &&
                     Math.abs(sDistY - window.pageYOffset) < 5)) {
                    makePointerEvent('click', e);
                }
            }
        }
        e.target.maybeClick = false;
    }

    function makePointerEvent(type, e) {
        var tgt = e.target;
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('pointer' + type, true, true, {});
        evt.touch = e.type.indexOf('touch') === 0;
        evt.mouse = e.type.indexOf('mouse') === 0;
        if (evt.touch) {
            evt.x = e.changedTouches[0].pageX;
            evt.y = e.changedTouches[0].pageY;
        }
        if (evt.mouse) {
            evt.x = e.clientX + window.pageXOffset;
            evt.y = e.clientY + window.pageYOffset;
        }
        evt.maskedEvent = e;
        tgt.dispatchEvent(evt);
        return evt;
    }
}

initPointer();

function pointer(event, method) {
	if(!pointer.handler[event]) pointer.handler[event] = [];
	
	pointer.handler[event].push(method);
}

pointer.update = function() {
	if(pointer.button != 0) {
		if(!pointer.handler['down']) return;
	
		for (var i = 0; i < pointer.handler['down'].length; i++) {
	        pointer.handler['down'][i]({ x : pointer.x, y : pointer.y, button : pointer.button });
		}
	}
}

pointer.handler = {};
pointer.button = 0;
pointer.x = 0;
pointer.y = 0;

document.addEventListener('pointerdown', function(e) {
	pointer.button = e.buttons;
	pointer.x = e.x;
	pointer.y = e.y;
	
	if(!pointer.handler['down']) return;
	
	for (var i = 0; i < pointer.handler['down'].length; i++) {
        pointer.handler['down'][i]({ x : pointer.x, y : pointer.y, button : pointer.button });
	}
});

document.addEventListener('pointerup', function(e) {
	pointer.button = e.buttons;
	pointer.x = e.x;
	pointer.y = e.y;
	
	if(!pointer.handler['up']) return;
	
    for (var i = 0; i < pointer.handler['up'].length; i++) {
        pointer.handler['up'][i]({ x : pointer.x, y : pointer.y, button : pointer.button });
	}
});

document.addEventListener('pointermove', function(e) {
	pointer.button = e.buttons;
	pointer.x = e.x;
	pointer.y = e.y;
	
	if(!pointer.handler['move']) return;
	
	for (var i = 0; i < pointer.handler['move'].length; i++) {
        pointer.handler['move'][i]({ x : pointer.x, y : pointer.y, button : pointer.button });
	}
});

document.addEventListener('pointerleave', function(e) {
	pointer.button = e.buttons;
	pointer.x = e.x;
	pointer.y = e.y;
	
	if(!pointer.handler['leave']) return;
	
	for (var i = 0; i < pointer.handler['leave'].length; i++) {
        pointer.handler['leave'][i]({ x : pointer.x, y : pointer.y, button : pointer.button });
	}
});

document.addEventListener('pointerclick', function(e) {
	pointer.button = e.buttons;
	pointer.x = e.x;
	pointer.y = e.y;
	
	if(!pointer.handler['click']) return;
	
	for (var i = 0; i < pointer.handler['click'].length; i++) {
        pointer.handler['click'][i]({ x : pointer.x, y : pointer.y, button : pointer.button });
	}
});

if (typeof window !== 'undefined') {
  const _pointer = window.pointer;
  pointer.noConflict = function(deep) {
    if (deep && window.pointer === pointer) {
      window.pointer = _pointer;
    }
    return pointer;
  };
  window.pointer = pointer;
}
// src/poly2tri.min.js
/*! poly2tri v1.5.0 | (c) 2009-2017 Poly2Tri Contributors */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n;n="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,n.poly2tri=t()}}(function(){return function t(n,e,i){function o(s,p){if(!e[s]){if(!n[s]){var a="function"==typeof require&&require;if(!p&&a)return a(s,!0);if(r)return r(s,!0);var h=new Error("Cannot find module '"+s+"'");throw h.code="MODULE_NOT_FOUND",h}var u=e[s]={exports:{}};n[s][0].call(u.exports,function(t){var e=n[s][1][t];return o(e||t)},u,u.exports,t,n,e,i)}return e[s].exports}for(var r="function"==typeof require&&require,s=0;s<i.length;s++)o(i[s]);return o}({1:[function(t,n,e){n.exports={version:"1.5.0"}},{}],2:[function(t,n,e){"use strict";var i=function(t,n){this.point=t,this.triangle=n||null,this.next=null,this.prev=null,this.value=t.x},o=function(t,n){this.head_=t,this.tail_=n,this.search_node_=t};o.prototype.head=function(){return this.head_},o.prototype.setHead=function(t){this.head_=t},o.prototype.tail=function(){return this.tail_},o.prototype.setTail=function(t){this.tail_=t},o.prototype.search=function(){return this.search_node_},o.prototype.setSearch=function(t){this.search_node_=t},o.prototype.findSearchNode=function(){return this.search_node_},o.prototype.locateNode=function(t){var n=this.search_node_;if(t<n.value){for(;n=n.prev;)if(t>=n.value)return this.search_node_=n,n}else for(;n=n.next;)if(t<n.value)return this.search_node_=n.prev,n.prev;return null},o.prototype.locatePoint=function(t){var n=t.x,e=this.findSearchNode(n),i=e.point.x;if(n===i){if(t!==e.point)if(t===e.prev.point)e=e.prev;else{if(t!==e.next.point)throw new Error("poly2tri Invalid AdvancingFront.locatePoint() call");e=e.next}}else if(n<i)for(;(e=e.prev)&&t!==e.point;);else for(;(e=e.next)&&t!==e.point;);return e&&(this.search_node_=e),e},n.exports=o,n.exports.Node=i},{}],3:[function(t,n,e){"use strict";function i(t,n){if(!t)throw new Error(n||"Assert Failed")}n.exports=i},{}],4:[function(t,n,e){"use strict";var i=t("./xy"),o=function(t,n){this.x=+t||0,this.y=+n||0,this._p2t_edge_list=null};o.prototype.toString=function(){return i.toStringBase(this)},o.prototype.toJSON=function(){return{x:this.x,y:this.y}},o.prototype.clone=function(){return new o(this.x,this.y)},o.prototype.set_zero=function(){return this.x=0,this.y=0,this},o.prototype.set=function(t,n){return this.x=+t||0,this.y=+n||0,this},o.prototype.negate=function(){return this.x=-this.x,this.y=-this.y,this},o.prototype.add=function(t){return this.x+=t.x,this.y+=t.y,this},o.prototype.sub=function(t){return this.x-=t.x,this.y-=t.y,this},o.prototype.mul=function(t){return this.x*=t,this.y*=t,this},o.prototype.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)},o.prototype.normalize=function(){var t=this.length();return this.x/=t,this.y/=t,t},o.prototype.equals=function(t){return this.x===t.x&&this.y===t.y},o.negate=function(t){return new o(-t.x,-t.y)},o.add=function(t,n){return new o(t.x+n.x,t.y+n.y)},o.sub=function(t,n){return new o(t.x-n.x,t.y-n.y)},o.mul=function(t,n){return new o(t*n.x,t*n.y)},o.cross=function(t,n){return"number"==typeof t?"number"==typeof n?t*n:new o(-t*n.y,t*n.x):"number"==typeof n?new o(n*t.y,-n*t.x):t.x*n.y-t.y*n.x},o.toString=i.toString,o.compare=i.compare,o.cmp=i.compare,o.equals=i.equals,o.dot=function(t,n){return t.x*n.x+t.y*n.y},n.exports=o},{"./xy":11}],5:[function(t,n,e){"use strict";var i=t("./xy"),o=function(t,n){this.name="PointError",this.points=n=n||[],this.message=t||"Invalid Points!";for(var e=0;e<n.length;e++)this.message+=" "+i.toString(n[e])};o.prototype=new Error,o.prototype.constructor=o,n.exports=o},{"./xy":11}],6:[function(t,n,e){(function(n){"use strict";var i=n.poly2tri;e.noConflict=function(){return n.poly2tri=i,e},e.VERSION=t("../dist/version.json").version,e.PointError=t("./pointerror"),e.Point=t("./point"),e.Triangle=t("./triangle"),e.SweepContext=t("./sweepcontext");var o=t("./sweep");e.triangulate=o.triangulate,e.sweep={Triangulate:o.triangulate}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"../dist/version.json":1,"./point":4,"./pointerror":5,"./sweep":7,"./sweepcontext":8,"./triangle":9}],7:[function(t,n,e){"use strict";function i(t){t.initTriangulation(),t.createAdvancingFront(),o(t),r(t)}function o(t){var n,e=t.pointCount();for(n=1;n<e;++n)for(var i=t.getPoint(n),o=s(t,i),r=i._p2t_edge_list,a=0;r&&a<r.length;++a)p(t,r[a],o)}function r(t){for(var n=t.front().head().next.triangle,e=t.front().head().next.point;!n.getConstrainedEdgeCW(e);)n=n.neighborCCW(e);t.meshClean(n)}function s(t,n){var e=t.locateNode(n),i=u(t,n,e);return n.x<=e.point.x+F&&d(t,e),g(t,i),i}function p(t,n,e){t.edge_event.constrained_edge=n,t.edge_event.right=n.p.x>n.q.x,h(e.triangle,n.p,n.q)||(C(t,n,e),a(t,n.p,n.q,e.triangle,n.q))}function a(t,n,e,i,o){if(!h(i,n,e)){var r=i.pointCCW(o),s=z(e,r,n);if(s===M.COLLINEAR)throw new D("poly2tri EdgeEvent: Collinear not supported!",[e,r,n]);var p=i.pointCW(o),u=z(e,p,n);if(u===M.COLLINEAR)throw new D("poly2tri EdgeEvent: Collinear not supported!",[e,p,n]);s===u?(i=s===M.CW?i.neighborCCW(o):i.neighborCW(o),a(t,n,e,i,o)):q(t,n,e,i,o)}}function h(t,n,e){var i=t.edgeIndex(n,e);if(-1!==i){t.markConstrainedEdgeByIndex(i);var o=t.getNeighbor(i);return o&&o.markConstrainedEdgeByPoints(n,e),!0}return!1}function u(t,n,e){var i=new O(n,e.point,e.next.point);i.markNeighbor(e.triangle),t.addToMap(i);var o=new L(n);return o.next=e.next,o.prev=e,e.next.prev=o,e.next=o,l(t,i)||t.mapTriangleToNodes(i),o}function d(t,n){var e=new O(n.prev.point,n.point,n.next.point);e.markNeighbor(n.prev.triangle),e.markNeighbor(n.triangle),t.addToMap(e),n.prev.next=n.next,n.next.prev=n.prev,l(t,e)||t.mapTriangleToNodes(e)}function g(t,n){for(var e=n.next;e.next&&!j(e.point,e.next.point,e.prev.point);)d(t,e),e=e.next;for(e=n.prev;e.prev&&!j(e.point,e.next.point,e.prev.point);)d(t,e),e=e.prev;n.next&&n.next.next&&f(n)&&y(t,n)}function f(t){var n=t.point.x-t.next.next.point.x,e=t.point.y-t.next.next.point.y;return S(e>=0,"unordered y"),n>=0||Math.abs(n)<e}function l(t,n){for(var e=0;e<3;++e)if(!n.delaunay_edge[e]){var i=n.getNeighbor(e);if(i){var o=n.getPoint(e),r=i.oppositePoint(n,o),s=i.index(r);if(i.constrained_edge[s]||i.delaunay_edge[s]){n.constrained_edge[e]=i.constrained_edge[s];continue}var p=c(o,n.pointCCW(o),n.pointCW(o),r);if(p){n.delaunay_edge[e]=!0,i.delaunay_edge[s]=!0,_(n,o,i,r);var a=!l(t,n);return a&&t.mapTriangleToNodes(n),a=!l(t,i),a&&t.mapTriangleToNodes(i),n.delaunay_edge[e]=!1,i.delaunay_edge[s]=!1,!0}}}return!1}function c(t,n,e,i){var o=t.x-i.x,r=t.y-i.y,s=n.x-i.x,p=n.y-i.y,a=o*p,h=s*r,u=a-h;if(u<=0)return!1;var d=e.x-i.x,g=e.y-i.y,f=d*r,l=o*g,c=f-l;return!(c<=0)&&(o*o+r*r)*(s*g-d*p)+(s*s+p*p)*c+(d*d+g*g)*u>0}function _(t,n,e,i){var o,r,s,p;o=t.neighborCCW(n),r=t.neighborCW(n),s=e.neighborCCW(i),p=e.neighborCW(i);var a,h,u,d;a=t.getConstrainedEdgeCCW(n),h=t.getConstrainedEdgeCW(n),u=e.getConstrainedEdgeCCW(i),d=e.getConstrainedEdgeCW(i);var g,f,l,c;g=t.getDelaunayEdgeCCW(n),f=t.getDelaunayEdgeCW(n),l=e.getDelaunayEdgeCCW(i),c=e.getDelaunayEdgeCW(i),t.legalize(n,i),e.legalize(i,n),e.setDelaunayEdgeCCW(n,g),t.setDelaunayEdgeCW(n,f),t.setDelaunayEdgeCCW(i,l),e.setDelaunayEdgeCW(i,c),e.setConstrainedEdgeCCW(n,a),t.setConstrainedEdgeCW(n,h),t.setConstrainedEdgeCCW(i,u),e.setConstrainedEdgeCW(i,d),t.clearNeighbors(),e.clearNeighbors(),o&&e.markNeighbor(o),r&&t.markNeighbor(r),s&&t.markNeighbor(s),p&&e.markNeighbor(p),t.markNeighbor(e)}function y(t,n){for(z(n.point,n.next.point,n.next.next.point)===M.CCW?t.basin.left_node=n.next.next:t.basin.left_node=n.next,t.basin.bottom_node=t.basin.left_node;t.basin.bottom_node.next&&t.basin.bottom_node.point.y>=t.basin.bottom_node.next.point.y;)t.basin.bottom_node=t.basin.bottom_node.next;if(t.basin.bottom_node!==t.basin.left_node){for(t.basin.right_node=t.basin.bottom_node;t.basin.right_node.next&&t.basin.right_node.point.y<t.basin.right_node.next.point.y;)t.basin.right_node=t.basin.right_node.next;t.basin.right_node!==t.basin.bottom_node&&(t.basin.width=t.basin.right_node.point.x-t.basin.left_node.point.x,t.basin.left_highest=t.basin.left_node.point.y>t.basin.right_node.point.y,x(t,t.basin.bottom_node))}}function x(t,n){if(!v(t,n)){d(t,n);if(n.prev!==t.basin.left_node||n.next!==t.basin.right_node){if(n.prev===t.basin.left_node){if(z(n.point,n.next.point,n.next.next.point)===M.CW)return;n=n.next}else if(n.next===t.basin.right_node){if(z(n.point,n.prev.point,n.prev.prev.point)===M.CCW)return;n=n.prev}else n=n.prev.point.y<n.next.point.y?n.prev:n.next;x(t,n)}}}function v(t,n){var e;return e=t.basin.left_highest?t.basin.left_node.point.y-n.point.y:t.basin.right_node.point.y-n.point.y,t.basin.width>e}function C(t,n,e){t.edge_event.right?b(t,n,e):w(t,n,e)}function b(t,n,e){for(;e.next.point.x<n.p.x;)z(n.q,e.next.point,n.p)===M.CCW?m(t,n,e):e=e.next}function m(t,n,e){e.point.x<n.p.x&&(z(e.point,e.next.point,e.next.next.point)===M.CCW?W(t,n,e):(E(t,n,e),m(t,n,e)))}function W(t,n,e){d(t,e.next),e.next.point!==n.p&&z(n.q,e.next.point,n.p)===M.CCW&&z(e.point,e.next.point,e.next.next.point)===M.CCW&&W(t,n,e)}function E(t,n,e){z(e.next.point,e.next.next.point,e.next.next.next.point)===M.CCW?W(t,n,e.next):z(n.q,e.next.next.point,n.p)===M.CCW&&E(t,n,e.next)}function w(t,n,e){for(;e.prev.point.x>n.p.x;)z(n.q,e.prev.point,n.p)===M.CW?P(t,n,e):e=e.prev}function P(t,n,e){e.point.x>n.p.x&&(z(e.point,e.prev.point,e.prev.prev.point)===M.CW?T(t,n,e):(N(t,n,e),P(t,n,e)))}function N(t,n,e){z(e.prev.point,e.prev.prev.point,e.prev.prev.prev.point)===M.CW?T(t,n,e.prev):z(n.q,e.prev.prev.point,n.p)===M.CW&&N(t,n,e.prev)}function T(t,n,e){d(t,e.prev),e.prev.point!==n.p&&z(n.q,e.prev.point,n.p)===M.CW&&z(e.point,e.prev.point,e.prev.prev.point)===M.CW&&T(t,n,e)}function q(t,n,e,i,o){var r=i.neighborAcross(o);S(r,"FLIP failed due to missing triangle!");var s=r.oppositePoint(i,o);if(i.getConstrainedEdgeAcross(o)){var p=i.index(o);throw new D("poly2tri Intersecting Constraints",[o,s,i.getPoint((p+1)%3),i.getPoint((p+2)%3)])}if(H(o,i.pointCCW(o),i.pointCW(o),s))if(_(i,o,r,s),t.mapTriangleToNodes(i),t.mapTriangleToNodes(r),o===e&&s===n)e===t.edge_event.constrained_edge.q&&n===t.edge_event.constrained_edge.p&&(i.markConstrainedEdgeByPoints(n,e),r.markConstrainedEdgeByPoints(n,e),l(t,i),l(t,r));else{var h=z(e,s,n);i=I(t,h,i,r,o,s),q(t,n,e,i,o)}else{A(t,n,e,i,r,k(n,e,r,s)),a(t,n,e,i,o)}}function I(t,n,e,i,o,r){var s;return n===M.CCW?(s=i.edgeIndex(o,r),i.delaunay_edge[s]=!0,l(t,i),i.clearDelaunayEdges(),e):(s=e.edgeIndex(o,r),e.delaunay_edge[s]=!0,l(t,e),e.clearDelaunayEdges(),i)}function k(t,n,e,i){var o=z(n,i,t);if(o===M.CW)return e.pointCCW(i);if(o===M.CCW)return e.pointCW(i);throw new D("poly2tri [Unsupported] nextFlipPoint: opposing point on constrained edge!",[n,i,t])}function A(t,n,e,i,o,r){var s=o.neighborAcross(r);S(s,"FLIP failed due to missing triangle");var p=s.oppositePoint(o,r);if(H(e,i.pointCCW(e),i.pointCW(e),p))q(t,e,p,s,p);else{A(t,n,e,i,s,k(n,e,s,p))}}var S=t("./assert"),D=t("./pointerror"),O=t("./triangle"),L=t("./advancingfront").Node,B=t("./utils"),F=B.EPSILON,M=B.Orientation,z=B.orient2d,H=B.inScanArea,j=B.isAngleObtuse;e.triangulate=i},{"./advancingfront":2,"./assert":3,"./pointerror":5,"./triangle":9,"./utils":10}],8:[function(t,n,e){"use strict";var i=t("./pointerror"),o=t("./point"),r=t("./triangle"),s=t("./sweep"),p=t("./advancingfront"),a=p.Node,h=function(t,n){if(this.p=t,this.q=n,t.y>n.y)this.q=t,this.p=n;else if(t.y===n.y)if(t.x>n.x)this.q=t,this.p=n;else if(t.x===n.x)throw new i("poly2tri Invalid Edge constructor: repeated points!",[t]);this.q._p2t_edge_list||(this.q._p2t_edge_list=[]),this.q._p2t_edge_list.push(this)},u=function(){this.left_node=null,this.bottom_node=null,this.right_node=null,this.width=0,this.left_highest=!1};u.prototype.clear=function(){this.left_node=null,this.bottom_node=null,this.right_node=null,this.width=0,this.left_highest=!1};var d=function(){this.constrained_edge=null,this.right=!1},g=function(t,n){n=n||{},this.triangles_=[],this.map_=[],this.points_=n.cloneArrays?t.slice(0):t,this.edge_list=[],this.pmin_=this.pmax_=null,this.front_=null,this.head_=null,this.tail_=null,this.af_head_=null,this.af_middle_=null,this.af_tail_=null,this.basin=new u,this.edge_event=new d,this.initEdges(this.points_)};g.prototype.addHole=function(t){this.initEdges(t);var n,e=t.length;for(n=0;n<e;n++)this.points_.push(t[n]);return this},g.prototype.AddHole=g.prototype.addHole,g.prototype.addHoles=function(t){var n,e=t.length;for(n=0;n<e;n++)this.initEdges(t[n]);return this.points_=this.points_.concat.apply(this.points_,t),this},g.prototype.addPoint=function(t){return this.points_.push(t),this},g.prototype.AddPoint=g.prototype.addPoint,g.prototype.addPoints=function(t){return this.points_=this.points_.concat(t),this},g.prototype.triangulate=function(){return s.triangulate(this),this},g.prototype.getBoundingBox=function(){return{min:this.pmin_,max:this.pmax_}},g.prototype.getTriangles=function(){return this.triangles_},g.prototype.GetTriangles=g.prototype.getTriangles,g.prototype.front=function(){return this.front_},g.prototype.pointCount=function(){return this.points_.length},g.prototype.head=function(){return this.head_},g.prototype.setHead=function(t){this.head_=t},g.prototype.tail=function(){return this.tail_},g.prototype.setTail=function(t){this.tail_=t},g.prototype.getMap=function(){return this.map_},g.prototype.initTriangulation=function(){var t,n=this.points_[0].x,e=this.points_[0].x,i=this.points_[0].y,r=this.points_[0].y,s=this.points_.length;for(t=1;t<s;t++){var p=this.points_[t];p.x>n&&(n=p.x),p.x<e&&(e=p.x),p.y>i&&(i=p.y),p.y<r&&(r=p.y)}this.pmin_=new o(e,r),this.pmax_=new o(n,i);var a=.3*(n-e),h=.3*(i-r);this.head_=new o(n+a,r-h),this.tail_=new o(e-a,r-h),this.points_.sort(o.compare)},g.prototype.initEdges=function(t){var n,e=t.length;for(n=0;n<e;++n)this.edge_list.push(new h(t[n],t[(n+1)%e]))},g.prototype.getPoint=function(t){return this.points_[t]},g.prototype.addToMap=function(t){this.map_.push(t)},g.prototype.locateNode=function(t){return this.front_.locateNode(t.x)},g.prototype.createAdvancingFront=function(){var t,n,e,i=new r(this.points_[0],this.tail_,this.head_);this.map_.push(i),t=new a(i.getPoint(1),i),n=new a(i.getPoint(0),i),e=new a(i.getPoint(2)),this.front_=new p(t,e),t.next=n,n.next=e,n.prev=t,e.prev=n},g.prototype.removeNode=function(t){},g.prototype.mapTriangleToNodes=function(t){for(var n=0;n<3;++n)if(!t.getNeighbor(n)){var e=this.front_.locatePoint(t.pointCW(t.getPoint(n)));e&&(e.triangle=t)}},g.prototype.removeFromMap=function(t){var n,e=this.map_,i=e.length;for(n=0;n<i;n++)if(e[n]===t){e.splice(n,1);break}},g.prototype.meshClean=function(t){for(var n,e,i=[t];n=i.pop();)if(!n.isInterior())for(n.setInterior(!0),this.triangles_.push(n),e=0;e<3;e++)n.constrained_edge[e]||i.push(n.getNeighbor(e))},n.exports=g},{"./advancingfront":2,"./point":4,"./pointerror":5,"./sweep":7,"./triangle":9}],9:[function(t,n,e){"use strict";var i=t("./xy"),o=function(t,n,e){this.points_=[t,n,e],this.neighbors_=[null,null,null],this.interior_=!1,this.constrained_edge=[!1,!1,!1],this.delaunay_edge=[!1,!1,!1]},r=i.toString;o.prototype.toString=function(){return"["+r(this.points_[0])+r(this.points_[1])+r(this.points_[2])+"]"},o.prototype.getPoint=function(t){return this.points_[t]},o.prototype.GetPoint=o.prototype.getPoint,o.prototype.getPoints=function(){return this.points_},o.prototype.getNeighbor=function(t){return this.neighbors_[t]},o.prototype.containsPoint=function(t){var n=this.points_;return t===n[0]||t===n[1]||t===n[2]},o.prototype.containsEdge=function(t){return this.containsPoint(t.p)&&this.containsPoint(t.q)},o.prototype.containsPoints=function(t,n){return this.containsPoint(t)&&this.containsPoint(n)},o.prototype.isInterior=function(){return this.interior_},o.prototype.setInterior=function(t){return this.interior_=t,this},o.prototype.markNeighborPointers=function(t,n,e){var i=this.points_;if(t===i[2]&&n===i[1]||t===i[1]&&n===i[2])this.neighbors_[0]=e;else if(t===i[0]&&n===i[2]||t===i[2]&&n===i[0])this.neighbors_[1]=e;else{if(!(t===i[0]&&n===i[1]||t===i[1]&&n===i[0]))throw new Error("poly2tri Invalid Triangle.markNeighborPointers() call");this.neighbors_[2]=e}},o.prototype.markNeighbor=function(t){var n=this.points_;t.containsPoints(n[1],n[2])?(this.neighbors_[0]=t,t.markNeighborPointers(n[1],n[2],this)):t.containsPoints(n[0],n[2])?(this.neighbors_[1]=t,t.markNeighborPointers(n[0],n[2],this)):t.containsPoints(n[0],n[1])&&(this.neighbors_[2]=t,t.markNeighborPointers(n[0],n[1],this))},o.prototype.clearNeighbors=function(){this.neighbors_[0]=null,this.neighbors_[1]=null,this.neighbors_[2]=null},o.prototype.clearDelaunayEdges=function(){this.delaunay_edge[0]=!1,this.delaunay_edge[1]=!1,this.delaunay_edge[2]=!1},o.prototype.pointCW=function(t){var n=this.points_;return t===n[0]?n[2]:t===n[1]?n[0]:t===n[2]?n[1]:null},o.prototype.pointCCW=function(t){var n=this.points_;return t===n[0]?n[1]:t===n[1]?n[2]:t===n[2]?n[0]:null},o.prototype.neighborCW=function(t){return t===this.points_[0]?this.neighbors_[1]:t===this.points_[1]?this.neighbors_[2]:this.neighbors_[0]},o.prototype.neighborCCW=function(t){return t===this.points_[0]?this.neighbors_[2]:t===this.points_[1]?this.neighbors_[0]:this.neighbors_[1]},o.prototype.getConstrainedEdgeCW=function(t){return t===this.points_[0]?this.constrained_edge[1]:t===this.points_[1]?this.constrained_edge[2]:this.constrained_edge[0]},o.prototype.getConstrainedEdgeCCW=function(t){return t===this.points_[0]?this.constrained_edge[2]:t===this.points_[1]?this.constrained_edge[0]:this.constrained_edge[1]},o.prototype.getConstrainedEdgeAcross=function(t){return t===this.points_[0]?this.constrained_edge[0]:t===this.points_[1]?this.constrained_edge[1]:this.constrained_edge[2]},o.prototype.setConstrainedEdgeCW=function(t,n){t===this.points_[0]?this.constrained_edge[1]=n:t===this.points_[1]?this.constrained_edge[2]=n:this.constrained_edge[0]=n},o.prototype.setConstrainedEdgeCCW=function(t,n){t===this.points_[0]?this.constrained_edge[2]=n:t===this.points_[1]?this.constrained_edge[0]=n:this.constrained_edge[1]=n},o.prototype.getDelaunayEdgeCW=function(t){return t===this.points_[0]?this.delaunay_edge[1]:t===this.points_[1]?this.delaunay_edge[2]:this.delaunay_edge[0]},o.prototype.getDelaunayEdgeCCW=function(t){return t===this.points_[0]?this.delaunay_edge[2]:t===this.points_[1]?this.delaunay_edge[0]:this.delaunay_edge[1]},o.prototype.setDelaunayEdgeCW=function(t,n){t===this.points_[0]?this.delaunay_edge[1]=n:t===this.points_[1]?this.delaunay_edge[2]=n:this.delaunay_edge[0]=n},o.prototype.setDelaunayEdgeCCW=function(t,n){t===this.points_[0]?this.delaunay_edge[2]=n:t===this.points_[1]?this.delaunay_edge[0]=n:this.delaunay_edge[1]=n},o.prototype.neighborAcross=function(t){return t===this.points_[0]?this.neighbors_[0]:t===this.points_[1]?this.neighbors_[1]:this.neighbors_[2]},o.prototype.oppositePoint=function(t,n){var e=t.pointCW(n);return this.pointCW(e)},o.prototype.legalize=function(t,n){var e=this.points_;if(t===e[0])e[1]=e[0],e[0]=e[2],e[2]=n;else if(t===e[1])e[2]=e[1],e[1]=e[0],e[0]=n;else{if(t!==e[2])throw new Error("poly2tri Invalid Triangle.legalize() call");e[0]=e[2],e[2]=e[1],e[1]=n}},o.prototype.index=function(t){var n=this.points_;if(t===n[0])return 0;if(t===n[1])return 1;if(t===n[2])return 2;throw new Error("poly2tri Invalid Triangle.index() call")},o.prototype.edgeIndex=function(t,n){var e=this.points_;if(t===e[0]){if(n===e[1])return 2;if(n===e[2])return 1}else if(t===e[1]){if(n===e[2])return 0;if(n===e[0])return 2}else if(t===e[2]){if(n===e[0])return 1;if(n===e[1])return 0}return-1},o.prototype.markConstrainedEdgeByIndex=function(t){this.constrained_edge[t]=!0},o.prototype.markConstrainedEdgeByEdge=function(t){this.markConstrainedEdgeByPoints(t.p,t.q)},o.prototype.markConstrainedEdgeByPoints=function(t,n){var e=this.points_;n===e[0]&&t===e[1]||n===e[1]&&t===e[0]?this.constrained_edge[2]=!0:n===e[0]&&t===e[2]||n===e[2]&&t===e[0]?this.constrained_edge[1]=!0:(n===e[1]&&t===e[2]||n===e[2]&&t===e[1])&&(this.constrained_edge[0]=!0)},n.exports=o},{"./xy":11}],10:[function(t,n,e){"use strict";function i(t,n,e){var i=(t.x-e.x)*(n.y-e.y),o=(t.y-e.y)*(n.x-e.x),r=i-o;return r>-s&&r<s?p.COLLINEAR:r>0?p.CCW:p.CW}function o(t,n,e,i){return!((t.x-n.x)*(i.y-n.y)-(i.x-n.x)*(t.y-n.y)>=-s)&&!((t.x-e.x)*(i.y-e.y)-(i.x-e.x)*(t.y-e.y)<=s)}function r(t,n,e){var i=n.x-t.x,o=n.y-t.y;return i*(e.x-t.x)+o*(e.y-t.y)<0}var s=1e-12;e.EPSILON=s;var p={CW:1,CCW:-1,COLLINEAR:0};e.Orientation=p,e.orient2d=i,e.inScanArea=o,e.isAngleObtuse=r},{}],11:[function(t,n,e){"use strict";function i(t){return"("+t.x+";"+t.y+")"}function o(t){var n=t.toString();return"[object Object]"===n?i(t):n}function r(t,n){return t.y===n.y?t.x-n.x:t.y-n.y}function s(t,n){return t.x===n.x&&t.y===n.y}n.exports={toString:o,toStringBase:i,compare:r,equals:s}},{}]},{},[6])(6)});
// src/raytracer.js
// Provides a convenient raytracing interface.

// ### new GL.HitTest([t, hit, normal])
//
// This is the object used to return hit test results. If there are no
// arguments, the constructed argument represents a hit infinitely far
// away.
function HitTest(t, hit, normal) {
  this.t = arguments.length ? t : Number.MAX_VALUE;
  this.hit = hit;
  this.normal = normal;
}

// ### .mergeWith(other)
//
// Changes this object to be the closer of the two hit test results.
HitTest.prototype = {
  mergeWith: function(other) {
    if (other.t > 0 && other.t < this.t) {
      this.t = other.t;
      this.hit = other.hit;
      this.normal = other.normal;
    }
  }
};

// ### new GL.Raytracer()
//
// This will read the current modelview matrix, projection matrix, and viewport,
// reconstruct the eye position, and store enough information to later generate
// per-pixel rays using `getRayForPixel()`.
//
// Example usage:
//
//     var tracer = new GL.Raytracer();
//     var ray = tracer.getRayForPixel(
//       gl.canvas.width / 2,
//       gl.canvas.height / 2);
//     var result = GL.Raytracer.hitTestSphere(
//       tracer.eye, ray, new GL.Vector(0, 0, 0), 1);
function Raytracer() {
  var v = gl.getParameter(gl.VIEWPORT);
  var m = gl.modelviewMatrix.m;

  var axisX = new Vector(m[0], m[4], m[8]);
  var axisY = new Vector(m[1], m[5], m[9]);
  var axisZ = new Vector(m[2], m[6], m[10]);
  var offset = new Vector(m[3], m[7], m[11]);
  this.eye = new Vector(-offset.dot(axisX), -offset.dot(axisY), -offset.dot(axisZ));

  var minX = v[0], maxX = minX + v[2];
  var minY = v[1], maxY = minY + v[3];
  this.ray00 = gl.unProject(minX, minY, 1).subtract(this.eye);
  this.ray10 = gl.unProject(maxX, minY, 1).subtract(this.eye);
  this.ray01 = gl.unProject(minX, maxY, 1).subtract(this.eye);
  this.ray11 = gl.unProject(maxX, maxY, 1).subtract(this.eye);
  this.viewport = v;
}

Raytracer.prototype = {
  // ### .getRayForPixel(x, y)
  //
  // Returns the ray originating from the camera and traveling through the pixel `x, y`.
  getRayForPixel: function(x, y) {
    x = (x - this.viewport[0]) / this.viewport[2];
    y = 1 - (y - this.viewport[1]) / this.viewport[3];
    var ray0 = Vector.lerp(this.ray00, this.ray10, x);
    var ray1 = Vector.lerp(this.ray01, this.ray11, x);
    return Vector.lerp(ray0, ray1, y).unit();
  }
};

// ### GL.Raytracer.hitTestBox(origin, ray, min, max)
//
// Traces the ray starting from `origin` along `ray` against the axis-aligned box
// whose coordinates extend from `min` to `max`. Returns a `HitTest` with the
// information or `null` for no intersection.
//
// This implementation uses the [slab intersection method](http://www.siggraph.org/education/materials/HyperGraph/raytrace/rtinter3.htm).
Raytracer.hitTestBox = function(origin, ray, min, max) {
  var tMin = min.subtract(origin).divide(ray);
  var tMax = max.subtract(origin).divide(ray);
  var t1 = Vector.min(tMin, tMax);
  var t2 = Vector.max(tMin, tMax);
  var tNear = t1.max();
  var tFar = t2.min();

  if (tNear > 0 && tNear < tFar) {
    var epsilon = 1.0e-6, hit = origin.add(ray.multiply(tNear));
    min = min.add(epsilon);
    max = max.subtract(epsilon);
    return new HitTest(tNear, hit, new Vector(
      (hit.x > max.x) - (hit.x < min.x),
      (hit.y > max.y) - (hit.y < min.y),
      (hit.z > max.z) - (hit.z < min.z)
    ));
  }

  return null;
};

// ### GL.Raytracer.hitTestSphere(origin, ray, center, radius)
//
// Traces the ray starting from `origin` along `ray` against the sphere defined
// by `center` and `radius`. Returns a `HitTest` with the information or `null`
// for no intersection.
Raytracer.hitTestSphere = function(origin, ray, center, radius) {
  var offset = origin.subtract(center);
  var a = ray.dot(ray);
  var b = 2 * ray.dot(offset);
  var c = offset.dot(offset) - radius * radius;
  var discriminant = b * b - 4 * a * c;

  if (discriminant > 0) {
    var t = (-b - Math.sqrt(discriminant)) / (2 * a), hit = origin.add(ray.multiply(t));
    return new HitTest(t, hit, hit.subtract(center).divide(radius));
  }

  return null;
};

// ### GL.Raytracer.hitTestTriangle(origin, ray, a, b, c)
//
// Traces the ray starting from `origin` along `ray` against the triangle defined
// by the points `a`, `b`, and `c`. Returns a `HitTest` with the information or
// `null` for no intersection.
Raytracer.hitTestTriangle = function(origin, ray, a, b, c) {
  var ab = b.subtract(a);
  var ac = c.subtract(a);
  var normal = ab.cross(ac).unit();
  var t = normal.dot(a.subtract(origin)) / normal.dot(ray);

  if (t > 0) {
    var hit = origin.add(ray.multiply(t));
    var toHit = hit.subtract(a);
    var dot00 = ac.dot(ac);
    var dot01 = ac.dot(ab);
    var dot02 = ac.dot(toHit);
    var dot11 = ab.dot(ab);
    var dot12 = ab.dot(toHit);
    var divide = dot00 * dot11 - dot01 * dot01;
    var u = (dot11 * dot02 - dot01 * dot12) / divide;
    var v = (dot00 * dot12 - dot01 * dot02) / divide;
    if (u >= 0 && v >= 0 && u + v <= 1) return new HitTest(t, hit, normal);
  }

  return null;
};

// src/shader.js
// Example usage:
//
//     var shader = new GL.Shader('\
//       void main() {\
//         gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;\
//       }\
//     ', '\
//       uniform vec4 color;\
//       void main() {\
//         gl_FragColor = color;\
//       }\
//     ');
//
//     shader.uniforms({
//       color: [1, 0, 0, 1]
//     }).draw(mesh);

function regexMap(regex, text, callback) {
    while ((result = regex.exec(text)) != null) {
        callback(result);
    }
}

var LIGHTGL_PREFIX = 'LIGHTGL';

function Shader(vertexSource, fragmentSource) {
    function followScriptTagById(id) {
        var element = document.getElementById(id);
        return element ? element.text : id;
    }
    vertexSource = followScriptTagById(vertexSource);
    fragmentSource = followScriptTagById(fragmentSource);
    
    var header = '\
    uniform mat3 gl_NormalMatrix;\
    uniform mat4 gl_ModelViewMatrix;\
    uniform mat4 gl_ProjectionMatrix;\
    uniform mat4 gl_ModelViewProjectionMatrix;\
    uniform mat4 gl_ModelViewMatrixInverse;\
    uniform mat4 gl_ProjectionMatrixInverse;\
    uniform mat4 gl_ModelViewProjectionMatrixInverse;\
    ';
    var vertexHeader = header + '\
    attribute vec4 gl_Vertex;\
    attribute vec4 gl_TexCoord;\
    attribute vec3 gl_Normal;\
    attribute vec4 gl_Color;\
    vec4 ftransform() {\
        return gl_ModelViewProjectionMatrix * gl_Vertex;\
    }\
    ';
    var fragmentHeader = '\
    precision highp float;\
    ' + header;
    
    var source = vertexSource + fragmentSource;
    var usedMatrices = {};
    regexMap(/\b(gl_[^;]*)\b;/g, header, function(groups) {
        var name = groups[1];
        if (source.indexOf(name) != -1) {
            var capitalLetters = name.replace(/[a-z_]/g, '');
            usedMatrices[capitalLetters] = LIGHTGL_PREFIX + name;
        }
    });
    if (source.indexOf('ftransform') != -1) usedMatrices.MVPM = LIGHTGL_PREFIX + 'gl_ModelViewProjectionMatrix';
    this.usedMatrices = usedMatrices;
    
    function fix(header, source) {
        var replaced = {};
        var match = /^((\s*\/\/.*\n|\s*#extension.*\n)+)[^]*$/.exec(source);
        source = match ? match[1] + header + source.substr(match[1].length) : header + source;
        regexMap(/\bgl_\w+\b/g, header, function(result) {
            if (!(result in replaced)) {
                source = source.replace(new RegExp('\\b' + result + '\\b', 'g'), LIGHTGL_PREFIX + result);
                replaced[result] = true;
            }
        });
        return source;
    }
    vertexSource = fix(vertexHeader, vertexSource);
    fragmentSource = fix(fragmentHeader, fragmentSource);
    
    function compileSource(type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error('compile error: ' + gl.getShaderInfoLog(shader));
        }
        return shader;
    }
    this.program = gl.createProgram();
    gl.attachShader(this.program, compileSource(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(this.program, compileSource(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        throw new Error('link error: ' + gl.getProgramInfoLog(this.program));
    }
    this.attributes = {};
    this.uniformLocations = {};
    
    var isSampler = {};
    regexMap(/uniform\s+sampler(1D|2D|3D|Cube)\s+(\w+)\s*;/g, vertexSource + fragmentSource, function(groups) {
        isSampler[groups[2]] = 1;
    });
    this.isSampler = isSampler;
}

function isArray(obj) {
    var str = Object.prototype.toString.call(obj);
    return str == '[object Array]' || str == '[object Float32Array]';
}

function isNumber(obj) {
    var str = Object.prototype.toString.call(obj);
    return str == '[object Number]' || str == '[object Boolean]';
}

var tempMatrix = new Matrix();
var resultMatrix = new Matrix();

Shader.prototype = {
    uniforms: function(uniforms) {
        gl.useProgram(this.program);
        
        for (var name in uniforms) {
            var location = this.uniformLocations[name] || gl.getUniformLocation(this.program, name);
            if (!location) continue;
            this.uniformLocations[name] = location;
            var value = uniforms[name];
            if (value instanceof Vector) {
                value = [value.x, value.y, value.z];
            } else if (value instanceof Matrix) {
                value = value.m;
            }
            if (isArray(value)) {
                switch (value.length) {
                    case 1: gl.uniform1fv(location, new Float32Array(value)); break;
                    case 2: gl.uniform2fv(location, new Float32Array(value)); break;
                    case 3: gl.uniform3fv(location, new Float32Array(value)); break;
                    case 4: gl.uniform4fv(location, new Float32Array(value)); break;
                    case 9: gl.uniformMatrix3fv(location, false, new Float32Array([
                        value[0], value[3], value[6],
                        value[1], value[4], value[7],
                        value[2], value[5], value[8]
                        ])); break;
                    case 16: gl.uniformMatrix4fv(location, false, new Float32Array([
                        value[0], value[4], value[8], value[12],
                        value[1], value[5], value[9], value[13],
                        value[2], value[6], value[10], value[14],
                        value[3], value[7], value[11], value[15]
                        ])); break;
                    default: throw new Error('don\'t know how to load uniform "' + name + '" of length ' + value.length);
                    }
                } else if (isNumber(value)) {
                    (this.isSampler[name] ? gl.uniform1i : gl.uniform1f).call(gl, location, value);
                } else {
                    throw new Error('attempted to set uniform "' + name + '" to invalid value ' + value);
                }
            }
            
            return this;
        },
        
        draw: function(mesh, mode) {
            this.drawBuffers(mesh.vertexBuffers,
                mesh.indexBuffers[mode == gl.LINES ? 'lines' : 'triangles'],
                arguments.length < 2 ? gl.TRIANGLES : mode);
        },
        
        drawBuffers: function(vertexBuffers, indexBuffer, mode) {
            var used = this.usedMatrices;
            var MVM = gl.modelviewMatrix;
            var PM = gl.projectionMatrix;
            var MVMI = (used.MVMI || used.NM) ? MVM.inverse() : null;
            var PMI = (used.PMI) ? PM.inverse() : null;
            var MVPM = (used.MVPM || used.MVPMI) ? PM.multiply(MVM) : null;
            var matrices = {};
            if (used.MVM) matrices[used.MVM] = MVM;
            if (used.MVMI) matrices[used.MVMI] = MVMI;
            if (used.PM) matrices[used.PM] = PM;
            if (used.PMI) matrices[used.PMI] = PMI;
            if (used.MVPM) matrices[used.MVPM] = MVPM;
            if (used.MVPMI) matrices[used.MVPMI] = MVPM.inverse();
            if (used.NM) {
                var m = MVMI.m;
                matrices[used.NM] = [m[0], m[4], m[8], m[1], m[5], m[9], m[2], m[6], m[10]];
            }
            this.uniforms(matrices);
            
            var length = 0;
            for (var attribute in vertexBuffers) {
                var buffer = vertexBuffers[attribute];
                var location = this.attributes[attribute] ||
                gl.getAttribLocation(this.program, attribute.replace(/^(gl_.*)$/, LIGHTGL_PREFIX + '$1'));
                if (location == -1 || !buffer.buffer) continue;
                this.attributes[attribute] = location;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
                gl.enableVertexAttribArray(location);
                gl.vertexAttribPointer(location, buffer.buffer.spacing, gl.FLOAT, false, 0, 0);
                length = buffer.buffer.length / buffer.buffer.spacing;
            }
            
            for (var attribute in this.attributes) {
                if (!(attribute in vertexBuffers)) {
                    gl.disableVertexAttribArray(this.attributes[attribute]);
                }
            }
            
            if (length && (!indexBuffer || indexBuffer.buffer)) {
                if (indexBuffer) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
                    gl.drawElements(mode, indexBuffer.buffer.length, gl.UNSIGNED_SHORT, 0);
                } else {
                    gl.drawArrays(mode, 0, length);
                }
            }
            
            return this;
        }
    };
    
// src/texture.js
// Provides a simple wrapper around WebGL textures that supports render-to-texture.

// ### new GL.Texture(width, height[, options])
//
// The arguments `width` and `height` give the size of the texture in texels.
// WebGL texture dimensions must be powers of two unless `filter` is set to
// either `gl.NEAREST` or `gl.LINEAR` and `wrap` is set to `gl.CLAMP_TO_EDGE`
// (which they are by default).
//
// Texture parameters can be passed in via the `options` argument.
// Example usage:
//
//     var t = new GL.Texture(256, 256, {
//       // Defaults to gl.LINEAR, set both at once with "filter"
//       magFilter: gl.NEAREST,
//       minFilter: gl.LINEAR,
//
//       // Defaults to gl.CLAMP_TO_EDGE, set both at once with "wrap"
//       wrapS: gl.REPEAT,
//       wrapT: gl.REPEAT,
//
//       format: gl.RGB, // Defaults to gl.RGBA
//       type: gl.FLOAT // Defaults to gl.UNSIGNED_BYTE
//     });
function Texture(width, height, options) {
  this.oneOverWidth = 1.0 / width;
  this.oneOverHeight = 1.0 / height;
	
  options = options || {};
  this.id = gl.createTexture();
  this.width = width;
  this.height = height;
  this.format = options.format || gl.RGBA;
  this.type = options.type || gl.UNSIGNED_BYTE;
  var magFilter = options.filter || options.magFilter || gl.LINEAR;
  var minFilter = options.filter || options.minFilter || gl.LINEAR;
  if (this.type === gl.FLOAT) {
    if (!Texture.canUseFloatingPointTextures()) {
      throw new Error('OES_texture_float is required but not supported');
    }
    if ((minFilter !== gl.NEAREST || magFilter !== gl.NEAREST) &&
        !Texture.canUseFloatingPointLinearFiltering()) {
      throw new Error('OES_texture_float_linear is required but not supported');
    }
  } else if (this.type === gl.HALF_FLOAT_OES) {
    if (!Texture.canUseHalfFloatingPointTextures()) {
      throw new Error('OES_texture_half_float is required but not supported');
    }
    if ((minFilter !== gl.NEAREST || magFilter !== gl.NEAREST) &&
        !Texture.canUseHalfFloatingPointLinearFiltering()) {
      throw new Error('OES_texture_half_float_linear is required but not supported');
    }
  }
  gl.bindTexture(gl.TEXTURE_2D, this.id);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.wrap || options.wrapS || gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.wrap || options.wrapT || gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, options.data || null);
}

var framebuffer;
var renderbuffer;
var checkerboardCanvas;
var pixelTexture;

Texture.prototype = {
  // ### .bind([unit])
  //
  // Bind this texture to the given texture unit (0-7, defaults to 0).
  bind: function(unit) {
    gl.activeTexture(gl.TEXTURE0 + (unit || 0));
    gl.bindTexture(gl.TEXTURE_2D, this.id);
  },

  // ### .unbind([unit])
  //
  // Clear the given texture unit (0-7, defaults to 0).
  unbind: function(unit) {
    gl.activeTexture(gl.TEXTURE0 + (unit || 0));
    gl.bindTexture(gl.TEXTURE_2D, null);
  },

  // ### .canDrawTo()
  //
  // Check if rendering to this texture is supported. It may not be supported
  // for floating-point textures on some configurations.
  canDrawTo: function() {
    framebuffer = framebuffer || gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);
    var result = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return result;
  },

  // ### .drawTo(callback)
  //
  // Render all draw calls in `callback` to this texture. This method sets up
  // a framebuffer with this texture as the color attachment and a renderbuffer
  // as the depth attachment. It also temporarily changes the viewport to the
  // size of the texture.
  //
  // Example usage:
  //
  //     texture.drawTo(function() {
  //       gl.clearColor(1, 0, 0, 1);
  //       gl.clear(gl.COLOR_BUFFER_BIT);
  //     });
  drawTo: function(callback) {
    var v = gl.getParameter(gl.VIEWPORT);
    framebuffer = framebuffer || gl.createFramebuffer();
    renderbuffer = renderbuffer || gl.createRenderbuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    if (this.width != renderbuffer.width || this.height != renderbuffer.height) {
      renderbuffer.width = this.width;
      renderbuffer.height = this.height;
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
    }
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('Rendering to this texture is not supported (incomplete framebuffer)');
    }
    gl.viewport(0, 0, this.width, this.height);

    callback();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.viewport(v[0], v[1], v[2], v[3]);
  },

  // ### .swapWith(other)
  //
  // Switch this texture with `other`, useful for the ping-pong rendering
  // technique used in multi-stage rendering.
  swapWith: function(other) {
    var temp;
    temp = other.id; other.id = this.id; this.id = temp;
    temp = other.width; other.width = this.width; this.width = temp;
    temp = other.height; other.height = this.height; this.height = temp;
  }
};

// ### GL.Texture.fromImage(image[, options])
//
// Return a new image created from `image`, an `<img>` tag.
Texture.fromImage = function(image, options) {
  options = options || {};
  var texture = new Texture(image.width, image.height, options);
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.format, texture.type, image);
  } catch (e) {
    if (location.protocol == 'file:') {
      throw new Error('image not loaded for security reasons (serve this page over "http://" instead)');
    } else {
      throw new Error('image not loaded for security reasons (image must originate from the same ' +
        'domain as this page or use Cross-Origin Resource Sharing)');
    }
  }
  if (options.minFilter && options.minFilter != gl.NEAREST && options.minFilter != gl.LINEAR) {
    gl.generateMipmap(gl.TEXTURE_2D);
  }
  return texture;
};

Texture.getPixel = function() {
    pixelTexture = pixelTexture || (function() {	
	    var c = document.createElement('canvas').getContext('2d');
	    c.canvas.width = c.canvas.height = 2;
	    c.fillStyle = '#FFF';
	    c.fillRect(0, 0, 2, 2);
	    return Texture.fromImage(c.canvas);
	})();
    return pixelTexture;
};

// ### GL.Texture.fromURL(url[, options])
//
// Returns a checkerboard texture that will switch to the correct texture when
// it loads.
Texture.fromURL = function(url, options) {
  checkerboardCanvas = checkerboardCanvas || (function() {
    var c = document.createElement('canvas').getContext('2d');
    c.canvas.width = c.canvas.height = 128;
    for (var y = 0; y < c.canvas.height; y += 16) {
      for (var x = 0; x < c.canvas.width; x += 16) {
        c.fillStyle = (x ^ y) & 16 ? '#FFF' : '#DDD';
        c.fillRect(x, y, 16, 16);
      }
    }
    return c.canvas;
  })();
  var texture = Texture.fromImage(checkerboardCanvas, options);
  var image = new Image();
  var context = gl;
  image.onload = function() {
    context.makeCurrent();
    Texture.fromImage(image, options).swapWith(texture);
    if(texture.onloaded) texture.onloaded(texture.userToken);
  };
  image.src = url;
  return texture;
};

// ### GL.Texture.canUseFloatingPointTextures()
//
// Returns false if `gl.FLOAT` is not supported as a texture type. This is the
// `OES_texture_float` extension.
Texture.canUseFloatingPointTextures = function() {
  return !!gl.getExtension('OES_texture_float');
};

// ### GL.Texture.canUseFloatingPointLinearFiltering()
//
// Returns false if `gl.LINEAR` is not supported as a texture filter mode for
// textures of type `gl.FLOAT`. This is the `OES_texture_float_linear`
// extension.
Texture.canUseFloatingPointLinearFiltering = function() {
  return !!gl.getExtension('OES_texture_float_linear');
};

// ### GL.Texture.canUseFloatingPointTextures()
//
// Returns false if `gl.HALF_FLOAT_OES` is not supported as a texture type.
// This is the `OES_texture_half_float` extension.
Texture.canUseHalfFloatingPointTextures = function() {
  return !!gl.getExtension('OES_texture_half_float');
};

// ### GL.Texture.canUseFloatingPointLinearFiltering()
//
// Returns false if `gl.LINEAR` is not supported as a texture filter mode for
// textures of type `gl.HALF_FLOAT_OES`. This is the
// `OES_texture_half_float_linear` extension.
Texture.canUseHalfFloatingPointLinearFiltering = function() {
  return !!gl.getExtension('OES_texture_half_float_linear');
};

// src/tile.js
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
        
        data.sheets[name] = { x : left, y : top, width : Math.max(0, right - left), height : Math.max(0, bottom - top), texture : data, keypoints : keypoints }; 
    }
    
    return data;
}
// src/trigger.js
var triggers = {};
var triggerActions = {};

function Trigger() {
}

Trigger.eval = function(header) {
	if(triggers[header]) {
		var triggerCollection = triggers[header];
		for(var i = 0; i < triggerCollection.length; i++) {
			var level = triggerCollection[i].level;
			var trigger = triggerCollection[i].trigger;
			
			var loaded = true;
			if(trigger.loadedFiles) {
				var names = Object.getOwnPropertyNames(trigger.loadedFiles);
				for(var x = 0; x < names.length; x++) {
					if(!trigger.loadedFiles[names[x]]) {
						loaded = false;
						break;
					}
				}
			}
			else {
				loaded = false;
			}
			
			
			if(trigger.enabled && loaded) {
				var run = true;
				for(var x = 0; x < trigger.conditions.length; x++) {
					if(!Trigger.action(level, trigger.conditions[x])) {
						run = false;
						break;
					}
				}
				
				if(run) {
					for(var x = 0; x < trigger.actions.length; x++) {
						Trigger.action(level, trigger.actions[x]);
					}
				}
			}
		}
	}
}

Trigger.bind = function(token, header, callback) {
	triggerActions[header] = callback;
}

Trigger.load = function(level, trigger) {
	for(var i = 0; i < trigger.events.length; i++) {
		var event = trigger.events[i];
		var item = { level : level, trigger : trigger };
		
		var itemKey = null;
		for(var key in event.value) {
			itemKey = key;
    		break;
 		}
		
		if(!triggers[itemKey]) 
			triggers[itemKey] = [];
		
		triggers[itemKey].push(item);
	}
	
	trigger.loadedFiles = {};
    var inculdes = Trigger.parseInculde(trigger);
	if(inculdes.length == 0) {
		level.init();
	}
	else {
		for(var i = 0; i < inculdes.length; i++) {
			trigger.loadedFiles[inculdes[i]] = false;
			Module.load(inculdes[i], function(sender) {
				var inculde = sender.inculde;
				var trigger = sender.trigger;	
				trigger.loadedFiles[inculde] = true;
				
				var loaded = true;
				var names = Object.getOwnPropertyNames(trigger.loadedFiles);
				for(var x = 0; x < names.length; x++) {
					if(!trigger.loadedFiles[names[x]]) {
						loaded = false;
						break;
					}
				}
				
				if(loaded) {
					level.init();
				}
				
			}, { inculde : inculdes[i], trigger : trigger });
		}
	}
}

Trigger.unload = function(level) {
	for(var header in triggers) {
		for(var i = 0; i < triggers[header].length; i++) {
			var trigger = triggers[header][i];
			if(trigger.level == level) {
				triggers[header].splice(i, 1);
			}
		}
	}
}

Trigger.parseInculde = function(trigger) {
	var result = [];
	for(var i = 0; i < trigger.conditions.length; i++) {
		Trigger.parseInculdeItem(result, trigger.conditions[i]);
	}
	
	for(var i = 0; i < trigger.actions.length; i++) {
		Trigger.parseInculdeItem(result, trigger.actions[i]);
	}
	return result;
}

Trigger.parseInculdeItem = function(result, sender) {
	switch(sender.type) {
		case "action":
			result.push(sender.inculde);
			var item = null;
			for(var key in sender.value) {
	    		item = sender.value[key];
	    		break;
	 		}
	 		
	 		if(item != null) {
	 			Trigger.parseInculdeItem(result, item);
	 		}
	 		
			break;
	}
}

Trigger.action = function(level, act) {
	switch(act.type) {
		case "action":
			var action = null;
			var itemKey = null;
			var item = null;
			var value = null;
			//var inculde = act.inculde;
			for(var key in act.value) {
				itemKey = key;
        		item = act.value[key];
        		break;
     		}
            
            // 取值	
			var key = typeof item == 'object' ? itemKey : '__Unknown';
			if(key != '__Unknown') {
				action = triggerActions[key];
			}
			
			if(action != null) {
				var params = [];
				
				var names = Object.getOwnPropertyNames(item);
				for(var x = 0; x < names.length; x++) {
					params.push(Trigger.action(level, item[names[x]]));
				}

				value = action.apply(null, params);
			}
			
			return value;
		case "number":
			return parseFloat(act.value);
		case "string":
			return act.value;
		case "boolean":
			return Boolean(act.value);
		default:
			var obj = null;
			for(var i = 0; i < level.objects.length; i++) {
				var obj2 = level.objects[i];
				if(obj2.name == act.value) {
					obj = obj2;
					break;
				}
			}
			return obj;
	}
}
// src/vector.js
/**
 * 向量
 * @param 	{Number} 	x	向量X值
 * @param 	{Number} 	y	向量X值
 * @param 	{Number} 	z	向量X值
 */
function Vector(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

Vector.prototype = {
  /**
   * 返回一个负的向量
   */
  negative: function() {
    return new Vector(-this.x, -this.y, -this.z);
  },
  /**
   * 得到向量和
   * @param	{Vector}	v	求和的向量
   */
  add: function(v) {
    if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    else return new Vector(this.x + v, this.y + v, this.z + v);
  },
  subtract: function(v) {
    if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    else return new Vector(this.x - v, this.y - v, this.z - v);
  },
  multiply: function(v) {
    if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
    else return new Vector(this.x * v, this.y * v, this.z * v);
  },
  divide: function(v) {
    if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
    else return new Vector(this.x / v, this.y / v, this.z / v);
  },
  equals: function(v) {
    return this.x == v.x && this.y == v.y && this.z == v.z;
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
  cross: function(v) {
    return new Vector(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  },
  length: function() {
    return Math.sqrt(this.dot(this));
  },
  unit: function() {
    return this.divide(this.length());
  },
  min: function() {
    return Math.min(Math.min(this.x, this.y), this.z);
  },
  max: function() {
    return Math.max(Math.max(this.x, this.y), this.z);
  },
  toAngles: function() {
    return {
      theta: Math.atan2(this.z, this.x),
      phi: Math.asin(this.y / this.length())
    };
  },
  angleTo: function(a) {
    return Math.acos(this.dot(a) / (this.length() * a.length()));
  },
  toArray: function(n) {
    return [this.x, this.y, this.z].slice(0, n || 3);
  },
  clone: function() {
    return new Vector(this.x, this.y, this.z);
  },
  init: function(x, y, z) {
    this.x = x; this.y = y; this.z = z;
    return this;
  }
};

/**
 * 返回一个x、y、z为0的向量
 */
Vector.zero = new Vector(0,0);
Vector.one = new Vector(1,1);

Vector.negative = function(a, b) {
  b.x = -a.x; b.y = -a.y; b.z = -a.z;
  return b;
};

/**
 * 得到向量和
 * @param	{Number}	a	求和的向量
 * @param	{Number}	b	求和的向量
 * @param	{Number}	c	求和的向量
 * @return	Vector
 */
Vector.add = function(a, b, c) {
  if (b instanceof Vector) { c.x = a.x + b.x; c.y = a.y + b.y; c.z = a.z + b.z; }
  else { c.x = a.x + b; c.y = a.y + b; c.z = a.z + b; }
  return c;
};
Vector.subtract = function(a, b, c) {
  if (b instanceof Vector) { c.x = a.x - b.x; c.y = a.y - b.y; c.z = a.z - b.z; }
  else { c.x = a.x - b; c.y = a.y - b; c.z = a.z - b; }
  return c;
};
Vector.multiply = function(a, b, c) {
  if (b instanceof Vector) { c.x = a.x * b.x; c.y = a.y * b.y; c.z = a.z * b.z; }
  else { c.x = a.x * b; c.y = a.y * b; c.z = a.z * b; }
  return c;
};
Vector.divide = function(a, b, c) {
  if (b instanceof Vector) { c.x = a.x / b.x; c.y = a.y / b.y; c.z = a.z / b.z; }
  else { c.x = a.x / b; c.y = a.y / b; c.z = a.z / b; }
  return c;
};
Vector.cross = function(a, b, c) {
  c.x = a.y * b.z - a.z * b.y;
  c.y = a.z * b.x - a.x * b.z;
  c.z = a.x * b.y - a.y * b.x;
  return c;
};
Vector.unit = function(a, b) {
  var length = a.length();
  b.x = a.x / length;
  b.y = a.y / length;
  b.z = a.z / length;
  return b;
};
Vector.fromAngles = function(theta, phi) {
  return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
};
Vector.randomDirection = function() {
  return Vector.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
};
Vector.min = function(a, b) {
  return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
};
Vector.max = function(a, b) {
  return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
};
Vector.lerp = function(a, b, fraction) {
  return b.subtract(a).multiply(fraction).add(a);
};
Vector.fromArray = function(a) {
  return new Vector(a[0], a[1], a[2]);
};
Vector.angleBetween = function(a, b) {
  return a.angleTo(b);
};

// src/WebAudio.js
/**
 * @language=zh
 * WebAudio声音播放模块。它具有更好的声音播放和控制能力，适合在iOS6+平台使用。
 * 兼容情况：iOS6+、Chrome33+、Firefox28+支持，但Android浏览器均不支持。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module hilo/media/WebAudio
 */
function WebAudio(properties) {
    
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = AudioContext ? new AudioContext() : null;
    
    var obj = {
        src: null,
        loop: false,
        autoPlay: false,
        loaded: false,
        playing: false,
        duration: 0,
        volume: 1,
        muted: false,

        _context: null, //WebAudio上下文 the WebAudio Context
        _gainNode: null, //音量控制器 the volume controller
        _buffer: null, //音频缓冲文件 the audio file buffer
        _audioNode: null, //音频播放器 the audio playing node
        _startTime: 0, //开始播放时间戳 the start time to play the audio
        _offset: 0, //播放偏移量 the offset of current playing audio
        _listeners: null,

        /**
         * @language=zh
         * 增加一个事件监听。
         * @param {String} type 要监听的事件类型。
         * @param {Function} listener 事件监听回调函数。
         * @param {Boolean} once 是否是一次性监听，即回调函数响应一次后即删除，不再响应。
         * @returns {Object} 对象本身。链式调用支持。
         */
        on: function(type, listener, once){
            var listeners = (this._listeners = this._listeners || {});
            var eventListeners = (listeners[type] = listeners[type] || []);
            for(var i = 0, len = eventListeners.length; i < len; i++){
                var el = eventListeners[i];
                if(el.listener === listener) return;
            }
            eventListeners.push({listener:listener, once:once});
            return this;
        },

        /**
         * @language=zh
         * 删除一个事件监听。如果不传入任何参数，则删除所有的事件监听；如果不传入第二个参数，则删除指定类型的所有事件监听。
         * @param {String} type 要删除监听的事件类型。
         * @param {Function} listener 要删除监听的回调函数。
         * @returns {Object} 对象本身。链式调用支持。
         */
        off: function(type, listener){
            //remove all event listeners
            if(arguments.length == 0){
                this._listeners = null;
                return this;
            }

            var eventListeners = this._listeners && this._listeners[type];
            if(eventListeners){
                //remove event listeners by specified type
                if(arguments.length == 1){
                    delete this._listeners[type];
                    return this;
                }

                for(var i = 0, len = eventListeners.length; i < len; i++){
                    var el = eventListeners[i];
                    if(el.listener === listener){
                        eventListeners.splice(i, 1);
                        if(eventListeners.length === 0) delete this._listeners[type];
                        break;
                    }
                }
            }
            return this;
        },

        /**
         * @language=zh
         * 发送事件。当第一个参数类型为Object时，则把它作为一个整体事件对象。
         * @param {String} type 要发送的事件类型。
         * @param {Object} detail 要发送的事件的具体信息，即事件随带参数。
         * @returns {Boolean} 是否成功调度事件。
         */
        fire: function(type, detail){
            var event, eventType;
            if(typeof type === 'string'){
                eventType = type;
            }else{
                event = type;
                eventType = type.type;
            }

            var listeners = this._listeners;
            if(!listeners) return false;

            var eventListeners = listeners[eventType];
            if(eventListeners){
                var eventListenersCopy = eventListeners.slice(0);
                event = event || new EventObject(eventType, this, detail);
                if(event._stopped) return false;

                for(var i = 0; i < eventListenersCopy.length; i++){
                    var el = eventListenersCopy[i];
                    el.listener.call(this, event);
                    if(el.once) {
                        var index = eventListeners.indexOf(el);
                        if(index > -1){
                            eventListeners.splice(index, 1);
                        }
                    }
                }

                if(eventListeners.length == 0) delete listeners[eventType];
                return true;
            }
            return false;
        },
        /**
         * @language=zh
         * @private 初始化
         */
        _init:function(){
            this._context = context;
            this._gainNode = context.createGain ? context.createGain() : context.createGainNode();
            this._gainNode.connect(context.destination);

            this._onAudioEvent = this._onAudioEvent.bind(this);
            this._onDecodeComplete = this._onDecodeComplete.bind(this);
            this._onDecodeError = this._onDecodeError.bind(this);
        },
        /**
         * @language=zh
         * 加载音频文件。注意：我们使用XMLHttpRequest进行加载，因此需要注意跨域问题。
         */
        load: function(){
            if(!this._buffer){
                var buffer = WebAudio._bufferCache[this.src];
                if(buffer){
                    this._onDecodeComplete(buffer);
                }
                else{
                    var request = new XMLHttpRequest();
                    request.src = this.src;
                    request.open('GET', this.src, true);
                    request.responseType = 'arraybuffer';
                    request.onload = this._onAudioEvent;
                    request.onprogress = this._onAudioEvent;
                    request.onerror = this._onAudioEvent;
                    request.send();
                }
                this._buffer = true;
            }
            return this;
        },

        /**
         * @private
         */
        _onAudioEvent: function(e){
            // console.log('onAudioEvent:', e.type);
            var type = e.type;

            switch(type){
                case 'load':
                    var request = e.target;
                    request.onload = request.onprogress = request.onerror = null;
                    this._context.decodeAudioData(request.response, this._onDecodeComplete, this._onDecodeError);
                    request = null;
                    break;
                case 'ended':
                    this.playing = false;
                    this.fire('end');
                    if(this.loop) this._doPlay();
                    break;
                case 'progress':
                    this.fire(e);
                    break;
                case 'error':
                    this.fire(e);
                    break;
            }
        },

        /**
         * @private
         */
        _onDecodeComplete: function(audioBuffer){
            if(!WebAudio._bufferCache[this.src]){
                WebAudio._bufferCache[this.src] = audioBuffer;
            }

            this._buffer = audioBuffer;
            this.loaded = true;
            this.duration = audioBuffer.duration;

            this.fire('load');
            if(this.autoPlay) this._doPlay();
        },

        /**
         * @private
         */
        _onDecodeError: function(){
            this.fire('error');
        },

        /**
         * @private
         */
        _doPlay: function(){
            this._clearAudioNode();

            var audioNode = this._context.createBufferSource();

            //some old browser are noteOn/noteOff -> start/stop
            if(!audioNode.start){
                audioNode.start = audioNode.noteOn;
                audioNode.stop = audioNode.noteOff;
            }

            audioNode.buffer = this._buffer;
            audioNode.onended = this._onAudioEvent;
            this._gainNode.gain.value = this.muted ? 0 : this.volume;
            audioNode.connect(this._gainNode);
            audioNode.start(0, this._offset);

            this._audioNode = audioNode;
            this._startTime = this._context.currentTime;
            this.playing = true;
        },

        /**
         * @private
         */
        _clearAudioNode: function(){
            var audioNode = this._audioNode;
            if(audioNode){
                audioNode.onended = null;
                // audioNode.disconnect(this._gainNode);
                audioNode.disconnect(0);
                this._audioNode = null;
            }
        },

        /**
         * @language=zh
         * 播放音频。如果正在播放，则会重新开始。
         */
        play: function(){
            if(this.playing) this.stop();

            if(this.loaded){
                this._doPlay();
            }else if(!this._buffer){
                this.autoPlay = true;
                this.load();
            }

            return this;
        },

        /**
         * @language=zh
         * 暂停音频。
         */
        pause: function(){
            if(this.playing){
                this._audioNode.stop(0);
                this._offset += this._context.currentTime - this._startTime;
                this.playing = false;
            }
            return this;
        },

        /**
         * @language=zh
         * 恢复音频播放。
         */
        resume: function(){
            if(!this.playing){
                this._doPlay();
            }
            return this;
        },

        /**
         * @language=zh
         * 停止音频播放。
         */
        stop: function(){
            if(this.playing){
                this._audioNode.stop(0);
                this._audioNode.disconnect();
                this._offset = 0;
                this.playing = false;
            }
            return this;
        },

        /**
         * @language=zh
         * 设置音量。
         */
        setVolume: function(volume){
            if(this.volume != volume){
                this.volume = volume;
                this._gainNode.gain.value = volume;
            }
            return this;
        },

        /**
         * @language=zh
         * 设置是否静音。
         */
        setMute: function(muted){
            if(this.muted != muted){
                this.muted = muted;
                this._gainNode.gain.value = muted ? 0 : this.volume;
            }
            return this;
        }
    };
    
    Common.copy(obj, properties, true);
    obj._init();
    return obj;
}

/**
 * @language=zh
 * 浏览器是否支持WebAudio。
 */
WebAudio.isSupported = (window.AudioContext || window.webkitAudioContext) != null;

/**
 * @language=zh
 * 浏览器是否已激活WebAudio。
 */
WebAudio.enabled = false;

/**
 * @language=zh
 * 激活WebAudio。注意：需用户事件触发此方法才有效。激活后，无需用户事件也可播放音频。
 */
WebAudio.enable = function(){
    if(!this.enabled && context){
        var source = context.createBufferSource();
        source.buffer = context.createBuffer(1, 1, 22050);
        source.connect(context.destination);
        source.start ? source.start(0, 0, 0) : source.noteOn(0, 0, 0);
        this.enabled = true;
        return true;
    }
    return this.enabled;
};

/**
 * The audio buffer caches.
 * @private
 * @type {Object}
 */
WebAudio._bufferCache = {};
/**
 * @language=zh
 * 清除audio buffer 缓存。
 * @param  {String} url audio的网址，默认清除所有的缓存
 */
WebAudio.clearBufferCache = function(url){
    if(url){
        this._bufferCache[url] = null;
    }
    else{
        this._bufferCache = {};
    }
};
// src/WebSound.js
/**
 * @language=zh
 * <iframe src='../../../examples/WebSound.html?noHeader' width = '320' height = '310' scrolling='no'></iframe>
 * <br/>
 * 使用示例:
 * <pre>
 * var audio = WebSound.getAudio({
 *     src: 'test.mp3',
 *     loop: false,
 *     volume: 1
 * }).on('load', function(e){
 *     console.log('load');
 * }).on('end', function(e){
 *     console.log('end');
 * }).play();
 * </pre>
 * @class 声音播放管理器。
 * @static
 * @module iuiu/WebSound
 */
function WebSound() {
}
WebSound._audios = {},

/**
 * @language=zh
 * 激活音频功能。注意：需用户事件触发此方法才有效。目前仅对WebAudio有效。
 */
WebSound.enableAudio = function(){
    if(WebAudio.isSupported){
        WebAudio.enable();
    }
};

/**
 * @language=zh
 * 获取音频对象。默认优先使用 WebAudio
 * @param {String|Object} source 若source为String，则为音频src地址；若为Object，则需包含src属性。
 * @param {Boolean} [preferWebAudio=true] 是否优先使用WebAudio，默认 true 。
 * @returns {WebAudio|HTMLAudio} 音频播放对象实例。
 */
WebSound.getAudio = function(source, preferWebAudio){
    if(preferWebAudio === undefined){
        preferWebAudio = true;
    }

    source = this._normalizeSource(source);
    var audio = this._audios[source.src];
    if(!audio){
        if(preferWebAudio && WebAudio.isSupported){
            audio = new WebAudio(source);
        }else if(HTMLAudio.isSupported){
            audio = new HTMLAudio(source);
        }
        this._audios[source.src] = audio;
    }

    return audio;
};

/**
 * @language=zh
 * 删除音频对象。
 * @param {String|Object} source 若source为String，则为音频src地址；若为Object，则需包含src属性。
 */
WebSound.removeAudio = function(source){
    var src = typeof source === 'string' ? source : source.src;
    var audio = this._audios[src];
    if(audio){
        audio.stop();
        audio.off();
        this._audios[src] = null;
        delete this._audios[src];
    }
};

/**
 * @language=zh
 * @private
 */
WebSound._normalizeSource = function(source){
    var result = {};
    if(typeof source === 'string') result = {src:source};
    else Common.copy(result, source);
    return result;
}
return IUIU;
})();
