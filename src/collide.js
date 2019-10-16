function CreateBody(object) {
    var body = new Body();
    for(var i = 0; i < object.items.length; i++) {
        var item = object.items[i];
        if(item.type == "collide") {
            body.parts.push(new BodyPart(item));
        }
    }
}

function Body() {
    this.parts = [];
}

function BodyPart(item) {
    this.vertices = item.points;
}

