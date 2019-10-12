var parseINIString = function (data){ 
    var regex = { 
        section: /^\s*\[\s*([^\]]*)\s*\]\s*$/, 
        param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/, 
        comment: /^\s*;.*$/ 
    }; 
    var value = {}; 
    var lines = data.split(/\r\n|\r|\n/); 
    var section = null; 
    lines.forEach(function(line){ 
    if(regex.comment.test(line)){ 
        return; 
    }else if(regex.param.test(line)){ 
        var match = line.match(regex.param); 
        if(section){ 
            value[section][match[1]] = match[2]; 
        }else{ 
            value[match[1]] = match[2]; 
        } 
    }else if(regex.section.test(line)){ 
        var match = line.match(regex.section); 
        value[match[1]] = {}; 
        section = match[1]; 
    }else if(line.length == 0 && section){ 
        section = null; 
    }; 
    });
    
    return value; 
}

function IniLoader(loader) {
    this.loader = loader;
};
IniLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params) {
        return parseINIString(buffer);
    }
};

function PackageLoader(loader) {
    this.loader = loader;
}
PackageLoader.prototype = {
    responseType : 'arraybuffer',
    load : function(buffer, params) {
        if(buffer) {
            var content = {};
            var dataView = new DataView(buffer);
            var originalBuffer = readHeader(content, dataView);
            
            // ��ѹ���ļ�
            if(content.flags == 1) {
                var compressed = new Uint8Array(buffer, originalBuffer.position, originalBuffer.length);
                var decompressed = lz4.decompress(compressed)
                var arrayBuffer = new ArrayBuffer(decompressed.length);
                for(var i = 0; i < decompressed.length; i++) {
                    arrayBuffer[i] = decompressed[i];
                }
                
                originalBuffer = new BinaryReader(new DataView(arrayBuffer), 0, arrayBuffer.length);
            }

            // ��ȡʵ������
            readContent(content, originalBuffer);
        }
        else {
            // ʧЧ����Դ
            //content.valid = false;
            //content.errorMessage = '��Ч���ʲ�Դ:' + content.src;
        }
    },
    readHeader : function(content, buffer) {
        var br = new BinaryReader(buffer);
        // ͷУ��
        var r = br.readChar();
        var e = br.readChar();
        var s = br.readChar();

        if(r != 'm' || e != 'r' || s != 'f') {
            throw '������Ч���ļ�';
        }

        // ��ȡƽ̨
        var platform = br.readByte();
        
        // ��ȡ�ļ���ʽ
        var format = br.readByte();
        
        // ��ȡflags
        var flags = br.readByte();
        
        // ��ȡ���ݴ�С
        var contentSize = br.readInt32();

        // Ԥ������
        var holdSize = br.readInt32();

        content.platform = platform;
        content.format = format;
        content.flags = flags;
        content.contentSize = contentSize;

        // ����ѹ�����ݴ�С
        return new BinaryReader(buffer, br.position, content.contentSize);
    },
    readContent : function(content, buffer) {
        var header = {};
        header.name = buffer.readString();
        header.version = {};
        header.version.major = buffer.readInt32();
        header.version.minor = buffer.readInt32();
        header.version.build = buffer.readInt32();
        header.version.revision = buffer.readInt32();
        
        var iconData = buffer.readString();
        var description = buffer.readString();
        var references = [];
        var files = [];
        
        var count = buffer.readInt32();
        for(var i = 0; i < count; i++) {
            var header2 = {};
            header2.name = buffer.readString();
            header2.version = {};
            header2.version.major = buffer.readInt32();
            header2.version.minor = buffer.readInt32();
            header2.version.build = buffer.readInt32();
            header2.version.revision = buffer.readInt32();
            
            references.push({ header : header2 });
        }
        
        count = buffer.readInt32();
        for(var i = 0; i < count;i ++) {
            var inculde = buffer.readString();
            var data = buffer.readString();
            files.push({ inculde : inculde, data : data });
        }
        
        content.header = header;
        //content.description = description;
        //content.
        content.files = files;
        content.references = reference;
    }
};

function JsonLoader(loader) {
    this.loader = loader;
}
JsonLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return jsonObj;
    }
}

function AnimationLoader(loader) {
    this.loader = loader;
}
AnimationLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return Animation.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Animation.create();
    }
}

function SectionLoader(loader) {
    this.loader = loader;
}
SectionLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return Tile.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Tile.create();
    }
}

function LevelLoader(loader) {
    this.loader = loader;
}
LevelLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return Level.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Level.create();
    }
}

function MapLoader(loader) {
    this.loader = loader;
}

MapLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return Map.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Map.create();
    }
};

function FontLoader(loader) {
    this.loader = loader;
}

FontLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return Font.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Font.create();
    }
};

function Loader(domain) {
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
    this.addMode("map", new MapLoader(this));
    this.addMode("font", new FontLoader(this));
}

Loader.prototype = {
    // ### .addMode(name, loader)
    // @param loader
    //          method load
    addMode : function(name, loader) {
        this.loaders[name] = loader;
    },
    
    // ### .load(fileName[, type])
    // @param type
    //          content
    //          ini 
    //          image
    load : function(fileName, userToken, callback, params) {
        var scope = this;
        var fileNameExt = fileName.lastIndexOf(".");//ȡ���ļ�����ʼ�����һ����ĳ���
        var fileNameLength = fileName.length;//ȡ���ļ�������
        var fileFormat = fileName.substring(fileNameExt + 1, fileNameLength);//��
        
        var type = fileFormat;
        var loader = this.loaders[type];
        
        // object cache
        if(!this.loadedContents[fileName])
            this.loadedContents[fileName] = { status : 'error', params : params, callbacks : [], content : loader.create() };
        
        var content = this.loadedContents[fileName];            
        if(content.status == 'error') {            
            if(loader) {
                if(callback) content.callbacks.push(callback);
                
                content.src = fileName;
                content.status = 'loading';
                content.userToken = userToken;
                content.type = type;
                if(loader.responseType) {
                    var request = new XMLHttpRequest();
                    request.responseType = loader.responseType;
                    request.open("GET", (this.domain != null ? this.domain + '/' : '') + fileName); // + (cache ? '' : '?' + new Date().toString()), true);
                    request.content = content;
                    request.loader = loader;
                    if(!request.loader) {
                        throw 'no dencoder';
                    }
                    
                    request.onload = function(e) {
                        var loader = e.currentTarget.loader;
                        var content = e.currentTarget.content;
                        try {
                            //content.md5 = CryptoJS.MD5(e.currentTarget.response);
                            content.content = loader.load(e.currentTarget.response, content.params, content.content);
                            content.status = 'loaded';
                        }
                        catch(error) {
                            content.status = 'error';
                            if(content.onerror) 
                                content.onerror(content);
                        }
                            
                        if(content.status == 'loaded') {
                            for(var i = 0; i < content.callbacks.length; i++) {
                                content.callbacks[i](content);
                            }
                            content.callbacks = [];
                        }
                    };
                    request.onerror = function(e) {
                        var content = e.currentTarget.content;
                        content.status = 'error';
                        if(content.onerror) 
                            content.onerror(content);
                        //content.errorMessage = 'Error ' + e.target.status + ' occurred while receiving the document.'
                    };
                    request.send();
                    
                    // �����ͬ����Դ
                    if(request.loader.sync) {
                        // ��ͣѭ��
                        
                    }
                } else {
                    throw 'responseType';
                    //content.content = loader.load(fileName);
                }
            } else {
                throw 'unkonwn response type';
            }
        }
        else if(content.status == "loading") {
            if(callback) content.callbacks.push(callback);
        }
        else if(content.status == 'loaded') {
            if(callback) callback(content);
        }
        
        return content.content;
    }
};
