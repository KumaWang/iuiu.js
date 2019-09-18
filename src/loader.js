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

function ContentLoader(loader) {
    this.loader = loader;
}
ContentLoader.prototype = {
    responseType : 'arraybuffer',
    load : function(buffer, params) {
        if(buffer) {
            var content = {};
            var dataView = new DataView(buffer);
            var originalBuffer = readHeader(content, dataView);
            if(!originalBuffer) {
                return;
            }

            if(content.isCompression) {
                var inStream = {
                    data: originalBuffer,
                    offset: 0,
                    readByte: function(){
                        return this.data.getUint8(this.offset++);
                    }
                };

                var outStream = {
                    data: new Uint8Array(content.originalSize),
                    offset: 0,
                    writeByte: function(value){
                        this.data.set(this.offset++, value);
                    }
                };

                LZMA.decompress(null, inStream, outStream, content.originalSize);

                if(outStream.data.byteLength != content.originalSize) {
                    //content.valid = false;
                    //content.errorMessage = '无效的资产流,一般发生在数据缺损时';
                    return;
                }

                originalBuffer = new dataView(outStream.data);
            }

            // 读取实际内容
            readContent(content, originalBuffer);
        }
        else {
            // 失效的资源
            //content.valid = false;
            //content.errorMessage = '无效的资产源:' + content.src;
        }
    },
    readHeader : function(content, buffer) {
        var br = new BinaryReader(buffer);
        // 头校验
        var r = br.readChar();
        var e = br.readChar();
        var s = br.readChar();

        if(r != 'r' || e != 'e' || s != 's') {
            //content.errorMessage = '无效的资产头:' + content.src;
            return false;
        }

        // 读取校验值
        content.checksum = br.readString(16);

        // 检查校验值与当前资源列表中区别
        if(content.checksum != this.checklist[content.src]) {
            // 废弃的资源需要重新更新,将其状态标记为error则会重新下载
            content.status = 'error';
            return;
        }

        // 读取作者
        content.author = br.readString();

        // 版本读取
        var major = br.readUint32();
        var minor = br.readUint32();
        var revision = br.readUint32();
        var build = br.readUint32();
        content.version = new CVersion(major, minor, revision, build);

        // 原始大小读取
        content.originalSize = br.readUint32();

        // 判断是否压缩
        content.isCompression = br.readBoolean();

        // 返回压缩数据大小
        return new BinaryReader(buffer, br.position, br.length());
    },
    readContent : function(content, buffer) {
        // 校验内容
        var nowChecksum = MD5.compute(buffer);
        if(nowChecksum != content.checksum) {
            //content.errorMessage = '无效的资产校验码';
            return;
        }

        content.content = eval(buffer.readString());
    }
};

function ScriptLoader(loader) {
    this.loader = loader;
}
ScriptLoader.prototype = {
    sync : true,
    responseType : 'text',
    load : function(buffer, params, entry) {
        return eval('\'' + Format(buffer, params) + '\'');
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

function ImageLoader(loader) {
    this.loader = loader;
}
ImageLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return Bitmap.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Bitmap.create();
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
    this.addMode('content', new ContentLoader(this));
    this.addMode('ini', new IniLoader(this));
    this.addMode('script', new ScriptLoader(this));
    this.addMode('json', new JsonLoader(this));
    this.addMode("ani", new AnimationLoader(this));
    this.addMode("img", new ImageLoader(this));
    this.addMode("level", new LevelLoader(this));
    this.addMode("map", new MapLoader(this));
    this.addMode("font", new FontLoader(this));
    // load checklist
    /*
    var content = this.load('checklist.ini', 'ini', null, false);
    content.onloaded = function(c) {
        this.checklist = c.content;
    };
    content.onerror = function(c) {
        // no cache
    };
    
    // load entry
    */
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

        var fileNameExt = fileName.lastIndexOf(".");//取到文件名开始到最后一个点的长度
        var fileNameLength = fileName.length;//取到文件名长度
        var fileFormat = fileName.substring(fileNameExt + 1, fileNameLength);//截
        
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
                    
                    // 如果是同步资源
                    if(request.loader.sync) {
                        // 暂停循环
                        
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
