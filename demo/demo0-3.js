// ͨ����������ȡ������Դ
var ani = IUIU.Loader.load("res/demo0-3.ani");

// �½���Ⱦ��
var gl = IUIU.create(null, { hittest : false, useGL : true });

// ����ÿ֡����
gl.onupdate = function(inv) {
    gl.begin();
 
    // ���ƶ���ָ��֡
    gl.animate(ani, 12, new IUIU.Vector(100, 100));
    
    gl.end();
};

// ����ȫ����
gl.fullscreen();

// ����ѭ��
gl.loop();