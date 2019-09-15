function Level() {
}

Level.create = function() {
	var level = new Level();
	level.objects = [];
	return level;
}

Level.prototype.init = function() {
	var json = this.json;
	for(var i = 0; i < json.items.length; i++) {
		var item = json.items[i];
		
	    IUIU.Module.load(item.fileName, function (sender) {
	    	var json2 = sender.data;
	    	var content = sender.src;
	    	
	        var obj = null;
	    	for(var x = 0; x < content.objects.length; x++) {
	    		var obj2 = content.objects[x];
	    		if(obj2.name == item.name) {
	    			obj = obj2;
	    		}
	    	}
	        	    	
			if(obj != null) {
				try {
	            	Common.copy(obj, IUIU.Component.create(json2.header), false);
	    		}
	        	catch(ex) {
	            	//obj = createErrorObject();
	    		}
				
		        obj.fileName = json2.fileName;
		        obj.header = json2.header;
		        
		        for (var property in json2) {
		            var value = json2[property];
		            var type = typeof value;
		            if (obj[property] && (type == "number" || type == "boolean" || type == "string")) {
		                obj[property] = json2[property];
		            }
		        }
		        
		        content.objects.push(obj);
		    }

	    }, { data : item, src : level });
	}
	
	delete this.json;
}

Level.fromJson = function(json, params, entry) {
	var level = entry;
	
	for(var i = 0; i < json.items.length; i++) {
		level.objects.push({ name : json.items[i].name });
	}
	
	level.json = json;
		
	for(var i = 0; i < json.trigger.length; i++) {
		Trigger.load(level, json.trigger[i]);
	}

	return level;
}