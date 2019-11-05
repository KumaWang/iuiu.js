// 新建渲染器
var gl = IUIU.create(null, { hittest : false, useGL : true });

var state = IUIU.Loader.load("res/base.obj").newState();

// 设置每帧更新
gl.onupdate = function(inv) 
{   
    gl.begin(null, { location : new IUIU.Vector(0, 0), scale : 1, angle : 0 });
    
    gl.state(state, new IUIU.Vector(400, 400));
    
    gl.end();
};

// 设置全屏化
gl.fullscreen();

// 设置循环
gl.loop();