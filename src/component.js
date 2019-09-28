function Component() {
    this.components = {};
}

Component.prototype.create = function(name) {
    return this.components[name]();
}

Component.prototype.define = function(name, createFunc) {
    this.components[name] = createFunc;
}

