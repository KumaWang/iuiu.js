
// �½���Ⱦ��
var gl = IUIU.create(null, { hittest : false, useGL : true });

// ͨ����������ȡ������Դ
var ani = IUIU.Loader.load("res/demo1-1.img");

// ����ÿ֡����
gl.onupdate = function(inv) {    
    gl.begin(); //null, { location : new IUIU.Vector(10, 20), scale : 0.3, angle : 0 });
    
    // ���ƶ���״̬
    gl.image(ani, "new", new IUIU.Vector(0, 0));
    
    gl.end();
};

// ����ȫ����
gl.fullscreen();

// ����ѭ��
gl.loop();