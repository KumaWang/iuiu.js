function Scene(id) {
    this.character = [];
    this.object = IUIU.Loader.load("res/object/" + id + ".obj").newState();
}

Scene.prototype.draw = function(gl) {
    gl.state(this.object);
    
    for(var i = 0; i < this.character.length; i++) {
        this.character[i].draw(gl);
    }
}

function Battle() {
    
}