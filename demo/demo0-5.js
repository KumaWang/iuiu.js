// �½���Ⱦ��
var gl = IUIU.create(null, { hittest : false, useGL : true });

// ͨ����������ȡ��ͼ��Դ
var map = IUIU.Loader.load("res/demo0-5.map");

// ����ÿ֡����
gl.onupdate = function(inv) {    
    gl.begin(null, { location : new IUIU.Vector(0, 0), scale : 1, angle : 0 });
 
    // ���Ƶ�ͼ 
    map.update(gl, inv);
    
    gl.end();
};

// ����ȫ����
gl.fullscreen();

// ����ѭ��
gl.loop();