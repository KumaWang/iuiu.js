// �½���Ⱦ��
var gl = IUIU.create(null, { hittest : false, useGL : true });

// ͨ����������ȡ��ͼ��Դ
var font = IUIU.Loader.load("res/demo0-6.font");

// ����ÿ֡����
gl.onupdate = function(inv) {    
    gl.begin();
 
    // ��������
    gl.text(font, "IUIU������", 22, new IUIU.Vector(100, 100));
    gl.end();
};

// ����ȫ����
gl.fullscreen();

// ����ѭ��
gl.loop();