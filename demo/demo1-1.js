// �½���Ⱦ��
var gl = IUIU.create(null, { hittest : false, useGL : true });

// ͨ����������ȡ������Դ
var ani = IUIU.Loader.load("res/demo1-1.ani");
var state2 = ani.newState();

// ����ÿ֡����
gl.onupdate = function(inv) {    
    gl.begin(null, { location : new IUIU.Vector(10, 20), scale : 0.3, angle : 10 });
    
    // ���ƶ���״̬
    gl.state(state2, new IUIU.Vector(500, 100));
       
    gl.end();
};

// ����ȫ����
gl.fullscreen();

// ����ѭ��
gl.loop();