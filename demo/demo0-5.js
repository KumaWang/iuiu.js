// �½���Ⱦ��
var gl = IUIU.create(null, { hittest : false, useGL : true });

var state = IUIU.Loader.load("res/test.obj").newState();

// ����ÿ֡����
gl.onupdate = function(inv) 
{   
    gl.begin(null, { location : new IUIU.Vector(0, 0), scale : 1, angle : 0 });
    
    gl.state(state, new IUIU.Vector(400, 400));
    
    gl.end();
};

// ����ȫ����
gl.fullscreen();

// ����ѭ��
gl.loop();