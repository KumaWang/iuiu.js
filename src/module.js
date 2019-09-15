/**
 * ��ȡ��վ����ַ�����������Ŀ¼���������Ŀ¼��
 * @param isVirtual �Ƿ�����Ŀ¼
 * @returns {String}
 */
function getSiteRoot(isVirtual) {
	var siteRoot = window.location.protocol +"//"+ window.location.host +"/";
	if(!isVirtual) return siteRoot;
	
	var relativePath = window.location.pathname;
	if(relativePath != "" && relativePath.substring(0,1) == "/"){
		//�˴���Ҫ����ͬ����������ܷ��ص�relativePath��һ��
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
	// ���ű��Ƿ����
	var eleList = document.querySelectorAll('script')
	for (var i = 0; i < eleList.length; i++) {
	  	// ��������
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
		}//js�������ִ�з���
	}
	else {
		if(callback) callback(param);
	}
}

Module.replace = function(path, callback) {
	var root = getSiteRoot(false);
	
	// ���ű��Ƿ����
	var exist = false;
	var eleList = document.querySelectorAll('script')
	for (var i = 0; i < eleList.length; i++) {
	  	// ��������
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
		}//js�������ִ�з���
	}
}