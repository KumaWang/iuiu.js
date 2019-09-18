// 新建渲染器
var gl = IUIU.create(null, { hittest : false, useGL : true });

// 通过加载器读取地图资源
var map = IUIU.Loader.load("res/demo0-5.map");

// 设置每帧更新
gl.onupdate = function(inv) {    
    gl.begin();
 
    // 绘制地图 
    map.update(gl, inv);
   
    gl.end();
};

// 设置全屏化
gl.fullscreen();

// 设置循环
gl.loop();