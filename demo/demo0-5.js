// �½���Ⱦ��
var gl = IUIU.create(null, { hittest : false, useGL : true });

var font = IUIU.Loader.load("res/simhei.font");

function createGrid() {
}

var grid = createGrid();

// ����ÿ֡����
gl.onupdate = function(inv) 
{   
    console.log("aaaabbbbddsadasddas");
    
    gl.begin(null, { location : new IUIU.Vector(0, 0), scale : 1, angle : 0 });
    
    gl.line(IUIU.Vector.zero,new IUIU.Vector(200,200),IUIU.Color.red,10);
    
    gl.rect(new IUIU.Vector(200,200),new IUIU.Vector(300,300),IUIU.Color.white);
    
    gl.text(font,"IUIU",20,new IUIU.Vector(50,50),IUIU.Vector.one,IUIU.Vector.one,0,IUIU.Color.white);
    
    gl.end();
};

// ����ȫ����
gl.fullscreen();

// ����ѭ��
gl.loop();