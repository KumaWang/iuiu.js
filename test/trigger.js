IUIU.Trigger.bind("Action", "日志{String}", function(value) {
    // 回调函数
    //Editor.log(value);
    //alert('1');
});

var TEST = (function() {
    var foo = {};
    foo.aaa = 1;
    
    foo.create = function() {
        return {  bbb : 1 };
    };
     
    return foo;
    
})();

var k = TEST.create();

