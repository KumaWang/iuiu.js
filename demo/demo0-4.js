// 通过加载器读取动画资源
var ani = IUIU.Loader.load("res/demo0-3.ani");
var state = ani.newState();

// 新建渲染器
var gl = IUIU.create(null, { hittest : false, useGL : true });

// 设置每帧更新
gl.onupdate = function(inv) {    
    gl.begin();
 
    // 绘制动画状态
    gl.state(state, new IUIU.Vector(300, 300));
    
    gl.end();
};

// 设置全屏化
gl.fullscreen();

// 设置循环
gl.loop();