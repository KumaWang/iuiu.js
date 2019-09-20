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
                    //content.errorMessage = '��Ч���ʲ���,һ�㷢��������ȱ��ʱ';
                    return;
                }

                originalBuffer = new dataView(outStream.data);
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

        if(r != 'r' || e != 'e' || s != 's') {
            //content.errorMessage = '��Ч���ʲ�ͷ:' + content.src;
            return false;
        }

        // ��ȡУ��ֵ
        content.checksum = br.readString(16);

        // ���У��ֵ�뵱ǰ��Դ�б�������
        if(content.checksum != this.checklist[content.src]) {
            // ��������Դ��Ҫ���¸���,����״̬���Ϊerror�����������
            content.status = 'error';
            return;
        }

        // ��ȡ����
        content.author = br.readString();

        // �汾��ȡ
        var major = br.readUint32();
        var minor = br.readUint32();
        var revision = br.readUint32();
        var build = br.readUint32();
        content.version = new CVersion(major, minor, revision, build);

        // ԭʼ��С��ȡ
        content.originalSize = br.readUint32();

        // �ж��Ƿ�ѹ��
        content.isCompression = br.readBoolean();

        // ����ѹ�����ݴ�С
        return new BinaryReader(buffer, br.position, br.length());
    },
    readContent : function(content, buffer) {
        // У������
        var nowChecksum = MD5.compute(buffer);
        if(nowChecksum != content.checksum) {
            //content.errorMessage = '��Ч���ʲ�У����';
            return;
        }

        content.content = eval(buffer.readString());
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
    this.addMode('json', new JsonLoader(this));
    this.addMode("ani", new AnimationLoader(this));
    this.addMode("img", new ImageLoader(this));
    this.addMode("level", new LevelLoader(this));
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
        
        if(this.checklist[fileName])
            fileName = this.checklist[fileName];

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
