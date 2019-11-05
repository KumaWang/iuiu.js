function Character(id) {
    var config = IUIU.Loader.load("res/config/character/" + id + ".json");
    
    this.equies = [];
    this.modules = [];
    for(var i = 0; i < config.moudules.length; i++) {
        this.modules.push(
            new CharacterModule(
                this,
                config.modules[i].id, 
                config.modules[i].offset,
                config.modules[i].layer));
    }
}

Character.prototype.idea = function() {
    this.state("idea");
}

Character.prototype.move = function() {
    this.state("move");
}

Character.prototype.attack = function() {
    this.state("attack");
}

Character.prototype.state = function (state) {
    for(var i = 0; i < this.modules.length; i++) {
        this.modules[i].state = state;
    }
    
    for(var i = 0; i < this.equies.length; i++) {
        this.equies[i].state = state;
    }
}

Character.prototype.draw = function(gl) {
    var items = [];
    for(var i = 0; i < this.modules.length; i++) {
        items.push(this.modules[i]);
    }
    
    for(var i = 0; i < this.equies.length; i++) {
        items.push(this.equies[i]);
    }
    
    items.sort(function (a, b) {
        return a.layer - b.layer;
    });
    
    for(var i = 0; i < items.length; i++) {
        items[i].draw(gl);
    }
}

function CharacterModule(character, id, offset, layer) {
    return {
        character : character,
        offset : offset,
        layer : layer,
        object : IUIU.Loader.load("res/object/" + id + ".obj").newState(),
        get state() {
            return this.object.state;
        },
        set state(value) {
            this.object.state = value;
        },
        draw : function (gl) {
            IUIU.create().state(
                this.object, 
                this.character.point + this.offset, 
                this.character.scale, 
                this.character.origin, 
                this.character.angle);
        }
    };
}

