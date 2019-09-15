var triggers = {};
var triggerActions = {};

function Trigger() {
}

Trigger.eval = function(header) {
	if(triggers[header]) {
		var triggerCollection = triggers[header];
		for(var i = 0; i < triggerCollection.length; i++) {
			var level = triggerCollection[i].level;
			var trigger = triggerCollection[i].trigger;
			
			var loaded = true;
			if(trigger.loadedFiles) {
				var names = Object.getOwnPropertyNames(trigger.loadedFiles);
				for(var x = 0; x < names.length; x++) {
					if(!trigger.loadedFiles[names[x]]) {
						loaded = false;
						break;
					}
				}
			}
			else {
				loaded = false;
			}
			
			
			if(trigger.enabled && loaded) {
				var run = true;
				for(var x = 0; x < trigger.conditions.length; x++) {
					if(!Trigger.action(level, trigger.conditions[x])) {
						run = false;
						break;
					}
				}
				
				if(run) {
					for(var x = 0; x < trigger.actions.length; x++) {
						Trigger.action(level, trigger.actions[x]);
					}
				}
			}
		}
	}
}

Trigger.bind = function(token, header, callback) {
	triggerActions[header] = callback;
}

Trigger.load = function(level, trigger) {
	for(var i = 0; i < trigger.events.length; i++) {
		var event = trigger.events[i];
		var item = { level : level, trigger : trigger };
		
		var itemKey = null;
		for(var key in event.value) {
			itemKey = key;
    		break;
 		}
		
		if(!triggers[itemKey]) 
			triggers[itemKey] = [];
		
		triggers[itemKey].push(item);
	}
	
	trigger.loadedFiles = {};
    var inculdes = Trigger.parseInculde(trigger);
	if(inculdes.length == 0) {
		level.init();
	}
	else {
		for(var i = 0; i < inculdes.length; i++) {
			trigger.loadedFiles[inculdes[i]] = false;
			Module.load(inculdes[i], function(sender) {
				var inculde = sender.inculde;
				var trigger = sender.trigger;	
				trigger.loadedFiles[inculde] = true;
				
				var loaded = true;
				var names = Object.getOwnPropertyNames(trigger.loadedFiles);
				for(var x = 0; x < names.length; x++) {
					if(!trigger.loadedFiles[names[x]]) {
						loaded = false;
						break;
					}
				}
				
				if(loaded) {
					level.init();
				}
				
			}, { inculde : inculdes[i], trigger : trigger });
		}
	}
}

Trigger.unload = function(level) {
	for(var header in triggers) {
		for(var i = 0; i < triggers[header].length; i++) {
			var trigger = triggers[header][i];
			if(trigger.level == level) {
				triggers[header].splice(i, 1);
			}
		}
	}
}

Trigger.parseInculde = function(trigger) {
	var result = [];
	for(var i = 0; i < trigger.conditions.length; i++) {
		Trigger.parseInculdeItem(result, trigger.conditions[i]);
	}
	
	for(var i = 0; i < trigger.actions.length; i++) {
		Trigger.parseInculdeItem(result, trigger.actions[i]);
	}
	return result;
}

Trigger.parseInculdeItem = function(result, sender) {
	switch(sender.type) {
		case "action":
			result.push(sender.inculde);
			var item = null;
			for(var key in sender.value) {
	    		item = sender.value[key];
	    		break;
	 		}
	 		
	 		if(item != null) {
	 			Trigger.parseInculdeItem(result, item);
	 		}
	 		
			break;
	}
}

Trigger.action = function(level, act) {
	switch(act.type) {
		case "action":
			var action = null;
			var itemKey = null;
			var item = null;
			var value = null;
			//var inculde = act.inculde;
			for(var key in act.value) {
				itemKey = key;
        		item = act.value[key];
        		break;
     		}
            
            // ȡֵ	
			var key = typeof item == 'object' ? itemKey : '__Unknown';
			if(key != '__Unknown') {
				action = triggerActions[key];
			}
			
			if(action != null) {
				var params = [];
				
				var names = Object.getOwnPropertyNames(item);
				for(var x = 0; x < names.length; x++) {
					params.push(Trigger.action(level, item[names[x]]));
				}

				value = action.apply(null, params);
			}
			
			return value;
		case "number":
			return parseFloat(act.value);
		case "string":
			return act.value;
		case "boolean":
			return Boolean(act.value);
		default:
			var obj = null;
			for(var i = 0; i < level.objects.length; i++) {
				var obj2 = level.objects[i];
				if(obj2.name == act.value) {
					obj = obj2;
					break;
				}
			}
			return obj;
	}
}