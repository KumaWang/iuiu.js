﻿// 新建渲染器
var gl = IUIU.create(null, { hittest : false, useGL : true });

// 通过加载器读取图片资源
var img = IUIU.Texture.fromURL("res/demo0-7.png");

// 设置每帧更新
gl.onupdate = function(inv) {
    gl.begin();
    
    // 绘制切片
    gl.texture(
        img,
        new IUIU.Vector(200, 200), 
        IUIU.Vector.one, 
        IUIU.Vector.zero, 
        0,  
        IUIU.Color.white, 
        { x : 0, y : 0, width : img.width, height : img.height });
    
    gl.end();
};

// 设置全屏化
gl.fullscreen();

// 设置循环
gl.loop();
