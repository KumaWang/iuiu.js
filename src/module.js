/**
 * 获取网站根地址，如果是虚拟目录则带有虚拟目录名
 * @param isVirtual 是否虚拟目录
 * @returns {String}
 */
function getSiteRoot(isVirtual) {
	var siteRoot = window.location.protocol +"//"+ window.location.host +"/";
	if(!isVirtual) return siteRoot;
	
	var relativePath = window.location.pathname;
	if(relativePath != "" && relativePath.substring(0,1) == "/"){
		//此处重要，不同的浏览器可能返回的relativePath不一样
		relativePath = relativePath.substring(1);
	}
	var virtualPath = (relativePath == "") ? "" : relativePath.substring(0, relativePath.indexOf("/") + 1);

	return siteRoot + virtualPath;
}

function Module() {
}

Module.load = function(path, callback, param) {
	var root = getSiteRoot(false);

	var needAdd = true;
	// 检查脚本是否存在
	var eleList = document.querySelectorAll('script')
	for (var i = 0; i < eleList.length; i++) {
	  	// 遍历操作
	  	var ele = eleList[i];
	  	var src = ele.src.replace(root, '');
		if(src == path) {
			needAdd = false;
		}
	}
	
	if(needAdd) {
		var script=document.createElement("script");
		script.type="text/javascript";
		script.src = path;
		document.getElementsByTagName('head')[0].appendChild(script); 
		script.onload = function(){
			script.loaded = true;
			if(callback) callback(param);
		}//js加载完成执行方法
	}
	else {
		if(callback) callback(param);
	}
}

Module.replace = function(path, callback) {
	var root = getSiteRoot(false);
	
	// 检查脚本是否存在
	var exist = false;
	var eleList = document.querySelectorAll('script')
	for (var i = 0; i < eleList.length; i++) {
	  	// 遍历操作
	  	var ele = eleList[i];
	  	var src = ele.src.replace(root, '');
		if(src == path) {
			ele.parentNode.removeChild(ele); 
			exist = true;
		}
	}
	
	if(exist) {
		var script=document.createElement("script");
		script.type="text/javascript";
		script.src=path;
		document.getElementsByTagName('head')[0].appendChild(script); 
		script.onload = function(){
			script.loaded = true;
			if(callback) callback();
		}//js加载完成执行方法
	}
}