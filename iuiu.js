/*
 * lightgl.js
 * http://github.com/evanw/lightgl.js/
 *
 * Copyright 2011 Evan Wallace
 * Released under the MIT license
 */
var IUIU = (function() {

// src/animation.js
function AnimationState(animation) {
    this.frame = 0;
    this.elaspedTime = 0;
    this.isPlaying = true;
    this.animation = animation;
    this._init = false;
    this._state = null;
}

AnimationState.prototype = {
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

function Animation() {
    this.isVisual = true;
}

Animation.prototype  = {
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
        return new AnimationState(this);
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

Animation.create = function() {
    var ani = new Animation();
    ani.items = [];
    ani.frameRate = 24;
    ani.loop = true;
    return ani;
}

Animation.fromJson = function(json, params, entry) {
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

                Section.fromName(item.inculde, { mesh : mesh }, function(sheet, userToken) {
                    var mesh2 = userToken.mesh;
                    mesh2.brush = sheet;
                    var tb = mesh2.brush;
                    var minX = Number.MAX_VALUE;
                    var minY = Number.MAX_VALUE;
                    for(var index2 = 0; index2 < tb.keypoints.length; index2++) {
                        var drawOffset = { x : tb.keypoints[index2].x, y : tb.keypoints[index2].y };
                        mesh2.keypoints[index2].drawOffset = drawOffset;
                        mesh2.keypoints[index2].bindingUV = [ tb.keypoints[index2].x / tb.texture.image.width, tb.keypoints[index2].y / tb.texture.image.height ];
                        
                        if(minX > drawOffset.x) minX = drawOffset.x;
                        if(minY > drawOffset.y) minY = drawOffset.y;
                    }
                    mesh2.drawOffset = { x : minX, y : minY };          
                    mesh2.triangulate();
                });
                        
                for(var index2 = 0; index2 < item.vertices.length; index2++) {
                    var keypoint = item.vertices[index2];
                    var key = {};
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
                var collide = AnimationItemCollideBox();
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

function AnimationItemCollideBox() {
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

function ContentLoader(loader) {
    this.loader = loader;
}
ContentLoader.prototype = {
    responseType : 'arraybuffer',
    load : function(buffer, params) {
        if(buffer) {
            var content = {};
            var dataView = new DataView(buffer);
            var originalBuffer = readHeader(content, dataView);
            if(!originalBuffer) {
                return;
            }

            if(content.isCompression) {
                var inStream = {
                    data: originalBuffer,
                    offset: 0,
                    readByte: function(){
                        return this.data.getUint8(this.offset++);
                    }
                };

                var outStream = {
                    data: new Uint8Array(content.originalSize),
                    offset: 0,
                    writeByte: function(value){
                        this.data.set(this.offset++, value);
                    }
                };

                LZMA.decompress(null, inStream, outStream, content.originalSize);

                if(outStream.data.byteLength != content.originalSize) {
                    //content.valid = false;
                    //content.errorMessage = '无效的资产流,一般发生在数据缺损时';
                    return;
                }

                originalBuffer = new dataView(outStream.data);
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

        if(r != 'r' || e != 'e' || s != 's') {
            //content.errorMessage = '无效的资产头:' + content.src;
            return false;
        }

        // 读取校验值
        content.checksum = br.readString(16);

        // 检查校验值与当前资源列表中区别
        if(content.checksum != this.checklist[content.src]) {
            // 废弃的资源需要重新更新,将其状态标记为error则会重新下载
            content.status = 'error';
            return;
        }

        // 读取作者
        content.author = br.readString();

        // 版本读取
        var major = br.readUint32();
        var minor = br.readUint32();
        var revision = br.readUint32();
        var build = br.readUint32();
        content.version = new CVersion(major, minor, revision, build);

        // 原始大小读取
        content.originalSize = br.readUint32();

        // 判断是否压缩
        content.isCompression = br.readBoolean();

        // 返回压缩数据大小
        return new BinaryReader(buffer, br.position, br.length());
    },
    readContent : function(content, buffer) {
        // 校验内容
        var nowChecksum = MD5.compute(buffer);
        if(nowChecksum != content.checksum) {
            //content.errorMessage = '无效的资产校验码';
            return;
        }

        content.content = eval(buffer.readString());
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
        return Animation.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Animation.create();
    }
}

function SectionLoader(loader) {
    this.loader = loader;
}
SectionLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return Section.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Section.create();
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
    this.addMode('content', new ContentLoader(this));
    this.addMode('ini', new IniLoader(this));
    this.addMode('json', new JsonLoader(this));
    this.addMode("ani", new AnimationLoader(this));
    this.addMode("img", new SectionLoader(this));
    this.addMode("level", new LevelLoader(this));
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
    //Shader: Shader,
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
        camera : { location : Vector.zero, scale : Vector.one, origin : Vector.zero, angle : 0 },
        transformMatrix: Matrix.identity(),
        shader: new Shader('\
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
            )
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
    gl.begin = function(blendState, transform) {
        displayBatchMode.hasBegun = true;
        displayBatchMode.blendState = blendState || 'none';
        
        // project matrix
        if (displayBatchMode.cachedTransformMatrix == null              || 
                gl.drawingBufferWidth != displayBatchMode.viewportWidth     ||
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
    gl.end = function() {
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
        
        //displayBatchMode.steps = [];
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
function Map() {
}

Map.prototype.update = function(gl, inv) {
if(this.terrain == null || this.terrain.image == null) return;
    
    var bitmapColumn = this.terrain.image.width / 16;
    
    for(var i = 0; i < this.layers.length; i++) {
        var layer = this.layers[i];
        for(var x = 0; x < layer.tiles.length; x++) {
            var tile = layer.tiles[x];
            
            var step1 = {};
            var step2 = {};
            
            step1.color = [ 1, 1, 1, 1 ];
            step2.color = [ 1, 1, 1, 1 ];
            
            step1.texture = this.terrain.image;
            step2.texture = this.terrain.image;
            
            step1.p1 = [ tile.x * 16, tile.y * 16 ];
            step1.p2 = [ tile.x * 16 + 16, tile.y * 16 ];
            step1.p3 = [ tile.x * 16 + 16, tile.y * 16 + 16 ];
            
            step2.p1 = [ tile.x * 16, tile.y * 16 ];
            step2.p2 = [ tile.x * 16 + 16, tile.y * 16 + 16 ];
            step2.p3 = [ tile.x * 16, tile.y * 16 + 16 ];
            
            var uvLeft = (tile.index % bitmapColumn) / bitmapColumn;
            var uvTop = (tile.index / bitmapColumn * 16) / this.terrain.image.height;
            var uvRight = uvLeft + 15 / this.terrain.image.width;
            var uvBottom = uvTop + 15 / this.terrain.image.height;
            
            step1.uv1 = [ uvLeft, 1 - uvTop ];
            step1.uv2 = [ uvRight, 1 - uvTop ];
            step1.uv3 = [ uvRight, 1 - uvBottom ];
            
            step2.uv1 = [ uvLeft, 1 - uvTop ];
            step2.uv2 = [ uvRight, 1 - uvBottom ];
            step2.uv3 = [ uvLeft, 1 - uvBottom ];
            
            gl.draw(step1);
            gl.draw(step2);
        }
    }
} 

Map.create = function() {
    var map = new Map();
    map.mask     = [];
    map.layers   = [];
    map.triggers = [];
    return map;
}

Map.fromJson = function(json, params, entry) {
    var map = entry;
    
    //for(var i = 0; i < json.mask.length; i++) {
    //    
    //}

    if(json["terrain"]) {
        map.terrain = IUIU.Loader.load(json.terrain);
    }

    for(var i = 0; i < json.layers.length; i++) {
        var layer = {};
        layer.tiles   = [];
        layer.spirtes = [];
        var layerJson = json.layers[i];
        
        for(var x = 0; x < layerJson.tiles.length; x++) {
            layer.tiles.push({ 
                x : layerJson.tiles[x].x,
                y : layerJson.tiles[x].y,
                index : layerJson.tiles[x].index
            });
        }
        
        for(var x = 0; x < layerJson.sprites.length; x++) {
            var obj = null;
            switch(layerJson.sprites[x].type) {
              case "ani":
                obj = IUIU.Loader.load(layerJson.sprites[x].inculde);
                break;
              case "image":
                obj = IUIU.Loader.load(layerJson.sprites[x].inculde);
                break;
              case "text":
                obj = IUIU.Loader.load(layerJson.sprites[x].inculde);
                break;
            }
            
            if(obj != null) {
                var spriteJson = layerJson.sprites[x];
                var locationStr = spriteJson.location.split(',');
                var scaleStr = spriteJson.scale.split(',');
                var originStr = spriteJson.origin.split(',');
                var colorStr = spriteJson.color.sprlit(',');
                
                obj.location = { x : parseFloat(locationStr[0]), y : parseFloat(locationStr[1]) };
                obj.scale    = { x : parseFloat(scaleStr[0]), y : parseFloat(scaleStr[1]) };
                obj.origin   = { x : parseFloat(originStr[0]), y : parseFloat(originStr[1]) };
                obj.angle    = parseFloat(spriteJson.angle);
                obj.color    = { 
                    r : parseFloat(spriteJson.color[0]),
                    g : parseFloat(spriteJson.color[1]),
                    b : parseFloat(spriteJson.color[2]),
                    a : parseFloat(spriteJson.color[3])
                };
            }
        }
        
        map.layers.push(layer);
    }

    return map;
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

// src/section.js
function Section() {
    this.isVisual = true;
}
Section.items = {};
Section.callbacks = [];

Section.prototype.triangulate = function(name) {
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

Section.fromName = function(fullName, userToken, callback) {
    var inculde;
    var name;
    if(fullName.indexOf('&') != -1) {
        var sd = fullName.split('&');
        inculde = sd[0];
        name = sd[1];
    }
    
    if(!Section.items[inculde]) {
        Section.callbacks.push({ inculde : inculde, name : name, userToken : userToken, func : callback });
        IUIU.Loader.load(inculde, { inculde : inculde, name : name, userToken : userToken }, function(c) {
            c.content.isLoaded = true;
            c.content.image.userToken = c.userToken.inculde;
            c.content.image.onloaded = function(userToken) { 
                for(var i = 0; i < Section.callbacks.length; i++) {
                    var callback = Section.callbacks[i];
                    if(callback.inculde == userToken) {
                        callback.func(c.content.sheets[callback.name], callback.userToken);
                        Section.callbacks.splice(i, 1);
                        i--;
                    }
                }
            }
            Section.items[inculde] = c.content;
        });     
    } else {
        callback(Section.items[inculde].sheets[name], userToken);
    }
}

Section.create = function() {
    var data = new Section();
    data.sheets = {};
    data.triangles = {};
    return data;
}

Section.fromJson = function(json, param, entry) {
    var data = entry;
    var texture = new Texture.fromURL('data:image/png;base64,' + json.data);
    texture.userToken = data;
    texture.onloaded = function(userToken) {
        userToken.isLoaded = true;
    };
    data.isLoaded = false;
    data.image = texture;
    data.points = [];
    
    for(var index2 = 0; index2 < json.points.length; index2++) {
        var values = json.points[index2].split(',');
        var x = parseFloat(values[0]);
        var y = parseFloat(values[1]);
        data.points.push({ x : x, y : y });
    }
    
    for(var index2 = 0; index2 < json.sheets.length; index2++) {
        var sheetJson = json.sheets[index2];
        var name = sheetJson.name; 
        var keypoints = [];
        
        var left = Number.MAX_VALUE, top = Number.MAX_VALUE, right = Number.MIN_VALUE, bottom = Number.MIN_VALUE;
        for(var i = 0; i < sheetJson.indexs.length; i++) {
            var index3 = parseFloat(sheetJson.indexs[i]);
            var point = data.points[index3];
            var x = point.x;
            var y = point.y;
            keypoints.push({ x : x, y : y });
            
            if(x < left) left = x;
            if(x > right) right = x;
            if(y < top) top = y;
            if(y > bottom) bottom = y;
        }
        
        data.sheets[name] = { width : Math.max(0, right - left), height : Math.max(0, bottom - top), texture : data, keypoints : keypoints }; 
    }
    
    return data;
}
// src/shader.js
// Provides a convenient wrapper for WebGL shaders. A few uniforms and attributes,
// prefixed with `gl_`, are automatically added to all shader sources to make
// simple shaders easier to write.
//
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

// Non-standard names beginning with `gl_` must be mangled because they will
// otherwise cause a compiler error.
var LIGHTGL_PREFIX = 'LIGHTGL';

// ### new GL.Shader(vertexSource, fragmentSource)
//
// Compiles a shader program using the provided vertex and fragment shaders.
function Shader(vertexSource, fragmentSource) {
  // Allow passing in the id of an HTML script tag with the source
  function followScriptTagById(id) {
    var element = document.getElementById(id);
    return element ? element.text : id;
  }
  vertexSource = followScriptTagById(vertexSource);
  fragmentSource = followScriptTagById(fragmentSource);

  // Headers are prepended to the sources to provide some automatic functionality.
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

  // Check for the use of built-in matrices that require expensive matrix
  // multiplications to compute, and record these in `usedMatrices`.
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

  // The `gl_` prefix must be substituted for something else to avoid compile
  // errors, since it's a reserved prefix. This prefixes all reserved names with
  // `_`. The header is inserted after any extensions, since those must come
  // first.
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

  // Compile and link errors are thrown as strings.
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

  // Sampler uniforms need to be uploaded using `gl.uniform1i()` instead of `gl.uniform1f()`.
  // To do this automatically, we detect and remember all uniform samplers in the source code.
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
  // ### .uniforms(uniforms)
  //
  // Set a uniform for each property of `uniforms`. The correct `gl.uniform*()` method is
  // inferred from the value types and from the stored uniform sampler flags.
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
          // Matrices are automatically transposed, since WebGL uses column-major
          // indices instead of row-major indices.
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

  // ### .draw(mesh[, mode])
  //
  // Sets all uniform matrix attributes, binds all relevant buffers, and draws the
  // mesh geometry as indexed triangles or indexed lines. Set `mode` to `gl.LINES`
  // (and either add indices to `lines` or call `computeWireframe()`) to draw the
  // mesh in wireframe.
  draw: function(mesh, mode) {
    this.drawBuffers(mesh.vertexBuffers,
      mesh.indexBuffers[mode == gl.LINES ? 'lines' : 'triangles'],
      arguments.length < 2 ? gl.TRIANGLES : mode);
  },

  // ### .drawBuffers(vertexBuffers, indexBuffer, mode)
  //
  // Sets all uniform matrix attributes, binds all relevant buffers, and draws the
  // indexed mesh geometry. The `vertexBuffers` argument is a map from attribute
  // names to `Buffer` objects of type `gl.ARRAY_BUFFER`, `indexBuffer` is a `Buffer`
  // object of type `gl.ELEMENT_ARRAY_BUFFER`, and `mode` is a WebGL primitive mode
  // like `gl.TRIANGLES` or `gl.LINES`. This method automatically creates and caches
  // vertex attribute pointers for attributes as needed.
  drawBuffers: function(vertexBuffers, indexBuffer, mode) {
    // Only construct up the built-in matrices we need for this shader.
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

    // Create and enable attribute pointers as necessary.
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

    // Disable unused attribute pointers.
    for (var attribute in this.attributes) {
      if (!(attribute in vertexBuffers)) {
        gl.disableVertexAttribArray(this.attributes[attribute]);
      }
    }

    // Draw the geometry.
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
