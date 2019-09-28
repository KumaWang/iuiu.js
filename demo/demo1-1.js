// 新建渲染器
var gl = IUIU.create(null, { hittest : false, useGL : true });

// 通过加载器读取动画资源
var ani = IUIU.Loader.load("res/demo1-1.ani");
var state2 = ani.newState();

// 设置每帧更新
gl.onupdate = function(inv) {    
    gl.begin(null, { location : new IUIU.Vector(10, 20), scale : 0.3, angle : 0 });
    
    // 绘制动画状态
    gl.state(state2, new IUIU.Vector(600, 300));
       
    gl.end();
};

// 设置全屏化
gl.fullscreen();

// 设置循环
gl.loop();