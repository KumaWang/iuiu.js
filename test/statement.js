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

var TEST = (function() {
    var foo                 = {};
    foo.aaa = 1;
    
    foo.create = function() {
        return {  bbb : 1 };
    };
    
    return foo;
    
})();

var k = TEST.create(); var kkc = TEST.aaa;