// ����iuiu�ļ�
var iuiu = using("iuiu.js");

// �½���Ⱦ��
var gl = iuiu.create(null, { hittest : false, useGL : true });

var state = IUIU.Loader.load("res/ob.obj");

// ����ÿ֡����
gl.onupdate = function(inv) 
{   
    gl.begin(null, { location : new IUIU.Vector(0, 0), scale : 0.5, angle : 0 });
    
    gl.state(state, new IUIU.Vector(400, 600));
    //state.update(gl, inv);
    gl.end();
};

// ����ȫ����
gl.fullscreen();

// ����ѭ��
gl.loop(); 