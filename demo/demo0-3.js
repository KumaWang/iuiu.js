// 新建渲染器
var gl = IUIU.create(null, { hittest : false, useGL : true });

// 通过加载器读取动画资源
var ani = IUIU.Loader.load("res/demo0-3.ani");

// 设置每帧更新
gl.onupdate = function(inv) {
    gl.begin();
 
    // 绘制动画指定帧
    gl.animate(ani, 12, new IUIU.Vector(100, 100));
    
    gl.end();
};

// 设置全屏化
gl.fullscreen();

// 设置循环
gl.loop();