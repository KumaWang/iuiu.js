// 通过加载器读取图片资源
var img = IUIU.Loader.load("res/demo0-1.img");

// 新建渲染器
var gl = IUIU.create(null, { hittest : false, useGL : true });

// 设置每帧更新
gl.onupdate = function(inv) {
    gl.begin();
 
    // 绘制图片
    gl.image(img, "test", new IUIU.Vector(100, 100), IUIU.Vector.one);
    
    gl.end();
};

// 设置全屏化
gl.fullscreen();

// 设置循环
gl.loop();