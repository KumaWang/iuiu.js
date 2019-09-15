Array.prototype.insert = function (index, item) {  
  this.splice(index, 0, item);  
};  

Array.prototype.removeAt=function(index) {
	this.splice(index, 1);
}

function Common() {
}
Common.clone = function (obj) {
   var str, newobj = obj.constructor === Array ? [] : {};
    if(typeof obj !== 'object'){
        return;
    } else if(window.JSON){
        str = JSON.stringify(obj), //系列化对象
        newobj = JSON.parse(str); //还原
    } else {
        for(var i in obj){
            newobj[i] = typeof obj[i] === 'object' ? 
            cloneObj(obj[i]) : obj[i]; 
        }
    }
    return newobj;
}

Common.copy = function(target, source, strict){
    for(var key in source){
        if(!strict || target.hasOwnProperty(key) || target[key] !== undefined){
            target[key] = source[key];
        }
    }
    return target;
}

function deepCopyObj(oldObj){
  var newObj={};
  if(oldObj &&  typeof oldObj=="object" ){
    for(var i in oldObj ) {
    	
      if(typeof oldObj[i]=="object"){//如果子还是对象那么循环调用值赋值
        newObj[i]=deepCopyObj(oldObj[i]);
      }else{//直接值赋值
        newObj[i]=oldObj[i];
      }
    }
    return newObj
  }
}

String.prototype.format = function () {
    var str = this
    for (var i = 0; i < arguments.length; i++) {
        var re = new RegExp('\\{' + i + '\\}', 'gm')
        str = str.replace(re, arguments[i])
    }
    return str
}