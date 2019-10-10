/*
* lightgl.js
* http://github.com/evanw/lightgl.js/
*
* Copyright 2011 Evan Wallace
* Released under the MIT license
*/
var doc = (function(){
    /*
    * lightgl.js
    * http://github.com/evanw/lightgl.js/
    *
    * Copyright 2011 Evan Wallace
    * Released under the MIT license
    */
    function Vector3(d, k) {
    }
    
    function Loader2() {
        this.domain = domain;
        this.loadedContents = {};
        //this.checklist = window.localStorage.domain
        
        // modes
        this.loaders = {};
        this.addMode('pak', new PackageLoader(this));
        this.addMode('ini', new IniLoader(this));
        this.addMode('json', new JsonLoader(this));
        this.addMode("ani", new AnimationLoader(this));
        this.addMode("img", new SectionLoader(this));
        //this.addMode("level", new LevelLoader(this));
        //this.addMode("map", new MapLoader(this));
        this.addMode("font", new FontLoader(this));
    }

    Loader2.prototype = {
        // ### .addMode(name, loader)
        // @param loader
        //          method load
        addMode : function(name, loader) {
            this.loaders[name] = loader;
        }
    }
    
    var doc = {   
        Loader : new Loader2(),
        /*
        * lightgl.js
        * http://github.com/evanw/lightgl.js/
        *
        * Copyright 2011 Evan Wallace
        * Released under the MIT license
        */
        add : function(ss) {
            if (v instanceof Vector3) return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
            else return new Vector3(this.x + v, this.y + v, this.z + v);
            
            return { k : 1 };
        }
    };
    
    return doc;
    
})();  