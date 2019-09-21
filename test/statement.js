function Foo() {
}

Foo.prototype = {
    addMode : function(name, loader) {
    },
    load : function(fileName, userToken, callback, params) {
    }
};

var Test = (function() {
    var Test = {
        foo : new Foo()
    };
    
    return Test;  
})(); 