// 通过加载器读取动画资源
var ani = IUIU.Loader.load("res/demo0-3.ani");

// 新建渲染器
var gl = IUIU.create(null, { hittest : false, useGL : true });

// 设置每帧更新
gl.onupdate = function(inv) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.begin();
 
    // 绘制动画指定帧
    gl.animate(ani, 12);
    
    gl.end();
};

// 设置全屏化
gl.fullscreen();

// 设置循环
gl.loop();