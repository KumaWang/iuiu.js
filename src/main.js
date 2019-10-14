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
        transformMatrix: Matrix.identity(),
        mapShader : new Shader('\
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
    * 渲染物体
    * @param   {IUIU.IObject}      obj         渲染的物体
    * @param   {int}               frame       所渲染的帧数
    * @param   {IUIU.Vector}       point       渲染的坐标
    * @param   {IUIU.Vector}       scale       渲染时采用的拉伸值
    * @param   {IUIU.Vector}       origin      渲染时采用的旋转锚点
    * @param   {int}               angle       渲染时采用的旋转值
    * @param   {IUIU.Color}        color       渲染时采用的颜色过滤
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.object = function(obj, frame, point, scale, origin, angle, color) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        for(var index = 0; index < obj.items.length; index++) {
            var item = obj.items[index];
            switch(item.type) {
              case "spline":
                gl.spline(item, frame, point, scale, origin, angle, color);
                break;
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
    * 渲染地形
    * @param   {IUIU.IObject}      obj         渲染的地形
    * @param   {int}               frame       所渲染的帧数
    * @param   {IUIU.Vector}       point       渲染的坐标
    * @param   {IUIU.Vector}       scale       渲染时采用的拉伸值
    * @param   {IUIU.Vector}       origin      渲染时采用的旋转锚点
    * @param   {int}               angle       渲染时采用的旋转值
    * @param   {IUIU.Color}        color       渲染时采用的颜色过滤
    * @date    2019-10-14
    * @author  KumaWang
    */
    gl.spline = function(obj, frame, point, scale, origin, angle, color) {
        var state = obj.getRealState(frame);
        if(state == null) return;
        
        point = point || IUIU.Vector.zero;
        scale = scale || IUIU.Vector.one;
        origin = origin || IUIU.Vector.zero;
        angle = angle || 0;
        color = color || IUIU.Color.white;
        
        point = { x: point.x + state.x, y: point.y + state.y };
        scale = { x: scale.x * state.scaleX, y: scale.y * state.scaleY };
        origin = { x: origin.x + state.originX, y: origin.y + state.originY };
        angle = (state.angle + angle) % 360;
        color = { r : state.r / 255 * color.r, g : state.g / 255 * color.g, b : state.b  / 255* color.b, a : state.a / 255 * color.a };
        
        if(obj.fill.texture) {
            gl.end();
            gl.begin(gl.blendState, gl.camera, displayBatchMode.mapShader);
            var states = obj.getFillDisplayStates(point, origin, scale, angle, color);
            if(states != null) {
                for(var x = 0; x < states.length; x++) {
                    gl.draw(states[x]);
                }
            }
            
            var endPoint = point; //MathTools.pointRotate(origin, point, angle);
            gl.end({
                TileOffset : [ endPoint.x, endPoint.y ],
                TileSize : [ obj.fill.texture.texture.image.width, obj.fill.texture.texture.image.height ],
                TileUvOffset : [ (obj.fill.texture.bounds.x - 1) / obj.fill.texture.texture.image.width, (obj.fill.texture.bounds.y - 1) / obj.fill.texture.texture.image.height ],
                TileUvSize : [ obj.fill.texture.bounds.width / obj.fill.texture.texture.image.width, obj.fill.texture.bounds.height / obj.fill.texture.texture.image.height ]
            });
            gl.begin();
        }
        
        states = obj.getEdgeDisplayStates(point, origin, scale, angle, color);
        if(states != null) {
            for(var x = 0; x < states.length; x++) {
                gl.draw(states[x]);
            }
        }
    };
    
    /**
    * 渲染动画状态
    * @param   {IUIU.ObjectState}      state       所渲染的状态
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
        
        //state.update(gl.elapsedTime);
        gl.object(state.object, state.frame, point, scale, origin, angle, color);
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
