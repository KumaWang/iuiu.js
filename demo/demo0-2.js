// 通过加载器读取图片资源
var img = IUIU.Loader.load("res/demo0-1.img");

// 新建渲染器
var gl = IUIU.create(null, { hittest : false, useGL : true });

// 设置每帧更新
gl.onupdate = function(inv) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.begin();
 
    // 绘制切片
    gl.texture(
        img, 
        new IUIU.Vector(200, 200), 
        IUIU.Vector.one, 
        IUIU.Vector.zero, 
        0, 
        IUIU.Color.white, 
        { x : 0, y : 0, width : 30, height : 30 });
    
    gl.end();
};

// 设置全屏化
gl.fullscreen();

// 设置循环
gl.loop();