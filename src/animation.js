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

				Bitmap.fromName(item.brush, { mesh : mesh }, function(sheet, userToken) {
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
				label.text = json.text;
				label.size = parseFloat(json.size);

				IUIU.loader.load(item.inculde, { label : label }, function(c) {
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