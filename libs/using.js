(function() {
	var getSiteRoot = function(isVirtual) {
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
	
	var getXmlHttpRequest = function () { 
	    if (window.XMLHttpRequest) // 除了IE外的其它浏览器
	    	return new XMLHttpRequest(); 
	    else if (window.ActiveXObject) // IE 
	  		return new ActiveXObject("MsXml2.XmlHttp");
 	}
	
	var controlStore = [];
	var controlIndex = -1;
	var urlReturnValue = {};
	
	var using = function(url) {
		if(!urlReturnValue[url]) {
			var root = getSiteRoot(false);
			var needAdd = true;
			// 检查脚本是否存在
			var eleList = document.querySelectorAll('script')
			for (var i = 0; i < eleList.length; i++) {
			  	// 遍历操作
			  	var ele = eleList[i];
			  	var src = ele.src.replace(root, '');
				if(src == url) {
					needAdd = false;
				}
			}
			
			if(needAdd) {
				controlIndex = controlStore.push(null) - 1;
				
				var oXmlHttp = getXmlHttpRequest();
            	oXmlHttp.open('GET', url, false);
           	 	oXmlHttp.send();
				
				eval(oXmlHttp.responseText + '//# sourceURL=' + oXmlHttp.responseURL);
				
				// 设置值
				urlReturnValue[url] = controlStore.pop();
			}
		}
		
		return urlReturnValue[url];
	};
	
	var control = function(obj) {
		controlStore[controlIndex] = obj;
	};
		
	window.using = using;
	window.control = control;	
})();