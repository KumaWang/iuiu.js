// 新建渲染器
var gl = IUIU.create(null, { hittest : false, useGL : true });

// 通过加载器读取地图资源
var font = IUIU.Loader.load("res/demo0-6.font");

// 设置每帧更新
gl.onupdate = function(inv) {    
    gl.begin();
 
    // 绘制文字
    gl.text(font, "IUIU工作室", 22, new IUIU.Vector(100, 100));
    gl.end();
};

// 设置全屏化
gl.fullscreen();

// 设置循环
gl.loop();