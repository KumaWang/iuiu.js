/**
 * @language=zh
 * WebAudio��������ģ�顣�����и��õ��������źͿ����������ʺ���iOS6+ƽ̨ʹ�á�
 * ���������iOS6+��Chrome33+��Firefox28+֧�֣���Android���������֧�֡�
 * @param {Object} properties ������������Բ������ɰ����������п�д���ԡ�
 * @module hilo/media/WebAudio
 */
function WebAudio(properties) {
    
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = AudioContext ? new AudioContext() : null;
    
    var obj = {
        src: null,
        loop: false,
        autoPlay: false,
        loaded: false,
        playing: false,
        duration: 0,
        volume: 1,
        muted: false,

        _context: null, //WebAudio������ the WebAudio Context
        _gainNode: null, //���������� the volume controller
        _buffer: null, //��Ƶ�����ļ� the audio file buffer
        _audioNode: null, //��Ƶ������ the audio playing node
        _startTime: 0, //��ʼ����ʱ��� the start time to play the audio
        _offset: 0, //����ƫ���� the offset of current playing audio
        _listeners: null,

        /**
         * @language=zh
         * ����һ���¼�������
         * @param {String} type Ҫ�������¼����͡�
         * @param {Function} listener �¼������ص�������
         * @param {Boolean} once �Ƿ���һ���Լ��������ص�������Ӧһ�κ�ɾ����������Ӧ��
         * @returns {Object} ��������ʽ����֧�֡�
         */
        on: function(type, listener, once){
            var listeners = (this._listeners = this._listeners || {});
            var eventListeners = (listeners[type] = listeners[type] || []);
            for(var i = 0, len = eventListeners.length; i < len; i++){
                var el = eventListeners[i];
                if(el.listener === listener) return;
            }
            eventListeners.push({listener:listener, once:once});
            return this;
        },

        /**
         * @language=zh
         * ɾ��һ���¼�����������������κβ�������ɾ�����е��¼����������������ڶ�����������ɾ��ָ�����͵������¼�������
         * @param {String} type Ҫɾ���������¼����͡�
         * @param {Function} listener Ҫɾ�������Ļص�������
         * @returns {Object} ��������ʽ����֧�֡�
         */
        off: function(type, listener){
            //remove all event listeners
            if(arguments.length == 0){
                this._listeners = null;
                return this;
            }

            var eventListeners = this._listeners && this._listeners[type];
            if(eventListeners){
                //remove event listeners by specified type
                if(arguments.length == 1){
                    delete this._listeners[type];
                    return this;
                }

                for(var i = 0, len = eventListeners.length; i < len; i++){
                    var el = eventListeners[i];
                    if(el.listener === listener){
                        eventListeners.splice(i, 1);
                        if(eventListeners.length === 0) delete this._listeners[type];
                        break;
                    }
                }
            }
            return this;
        },

        /**
         * @language=zh
         * �����¼�������һ����������ΪObjectʱ���������Ϊһ�������¼�����
         * @param {String} type Ҫ���͵��¼����͡�
         * @param {Object} detail Ҫ���͵��¼��ľ�����Ϣ�����¼����������
         * @returns {Boolean} �Ƿ�ɹ������¼���
         */
        fire: function(type, detail){
            var event, eventType;
            if(typeof type === 'string'){
                eventType = type;
            }else{
                event = type;
                eventType = type.type;
            }

            var listeners = this._listeners;
            if(!listeners) return false;

            var eventListeners = listeners[eventType];
            if(eventListeners){
                var eventListenersCopy = eventListeners.slice(0);
                event = event || new EventObject(eventType, this, detail);
                if(event._stopped) return false;

                for(var i = 0; i < eventListenersCopy.length; i++){
                    var el = eventListenersCopy[i];
                    el.listener.call(this, event);
                    if(el.once) {
                        var index = eventListeners.indexOf(el);
                        if(index > -1){
                            eventListeners.splice(index, 1);
                        }
                    }
                }

                if(eventListeners.length == 0) delete listeners[eventType];
                return true;
            }
            return false;
        },
        /**
         * @language=zh
         * @private ��ʼ��
         */
        _init:function(){
            this._context = context;
            this._gainNode = context.createGain ? context.createGain() : context.createGainNode();
            this._gainNode.connect(context.destination);

            this._onAudioEvent = this._onAudioEvent.bind(this);
            this._onDecodeComplete = this._onDecodeComplete.bind(this);
            this._onDecodeError = this._onDecodeError.bind(this);
        },
        /**
         * @language=zh
         * ������Ƶ�ļ���ע�⣺����ʹ��XMLHttpRequest���м��أ������Ҫע��������⡣
         */
        load: function(){
            if(!this._buffer){
                var buffer = WebAudio._bufferCache[this.src];
                if(buffer){
                    this._onDecodeComplete(buffer);
                }
                else{
                    var request = new XMLHttpRequest();
                    request.src = this.src;
                    request.open('GET', this.src, true);
                    request.responseType = 'arraybuffer';
                    request.onload = this._onAudioEvent;
                    request.onprogress = this._onAudioEvent;
                    request.onerror = this._onAudioEvent;
                    request.send();
                }
                this._buffer = true;
            }
            return this;
        },

        /**
         * @private
         */
        _onAudioEvent: function(e){
            // console.log('onAudioEvent:', e.type);
            var type = e.type;

            switch(type){
                case 'load':
                    var request = e.target;
                    request.onload = request.onprogress = request.onerror = null;
                    this._context.decodeAudioData(request.response, this._onDecodeComplete, this._onDecodeError);
                    request = null;
                    break;
                case 'ended':
                    this.playing = false;
                    this.fire('end');
                    if(this.loop) this._doPlay();
                    break;
                case 'progress':
                    this.fire(e);
                    break;
                case 'error':
                    this.fire(e);
                    break;
            }
        },

        /**
         * @private
         */
        _onDecodeComplete: function(audioBuffer){
            if(!WebAudio._bufferCache[this.src]){
                WebAudio._bufferCache[this.src] = audioBuffer;
            }

            this._buffer = audioBuffer;
            this.loaded = true;
            this.duration = audioBuffer.duration;

            this.fire('load');
            if(this.autoPlay) this._doPlay();
        },

        /**
         * @private
         */
        _onDecodeError: function(){
            this.fire('error');
        },

        /**
         * @private
         */
        _doPlay: function(){
            this._clearAudioNode();

            var audioNode = this._context.createBufferSource();

            //some old browser are noteOn/noteOff -> start/stop
            if(!audioNode.start){
                audioNode.start = audioNode.noteOn;
                audioNode.stop = audioNode.noteOff;
            }

            audioNode.buffer = this._buffer;
            audioNode.onended = this._onAudioEvent;
            this._gainNode.gain.value = this.muted ? 0 : this.volume;
            audioNode.connect(this._gainNode);
            audioNode.start(0, this._offset);

            this._audioNode = audioNode;
            this._startTime = this._context.currentTime;
            this.playing = true;
        },

        /**
         * @private
         */
        _clearAudioNode: function(){
            var audioNode = this._audioNode;
            if(audioNode){
                audioNode.onended = null;
                // audioNode.disconnect(this._gainNode);
                audioNode.disconnect(0);
                this._audioNode = null;
            }
        },

        /**
         * @language=zh
         * ������Ƶ��������ڲ��ţ�������¿�ʼ��
         */
        play: function(){
            if(this.playing) this.stop();

            if(this.loaded){
                this._doPlay();
            }else if(!this._buffer){
                this.autoPlay = true;
                this.load();
            }

            return this;
        },

        /**
         * @language=zh
         * ��ͣ��Ƶ��
         */
        pause: function(){
            if(this.playing){
                this._audioNode.stop(0);
                this._offset += this._context.currentTime - this._startTime;
                this.playing = false;
            }
            return this;
        },

        /**
         * @language=zh
         * �ָ���Ƶ���š�
         */
        resume: function(){
            if(!this.playing){
                this._doPlay();
            }
            return this;
        },

        /**
         * @language=zh
         * ֹͣ��Ƶ���š�
         */
        stop: function(){
            if(this.playing){
                this._audioNode.stop(0);
                this._audioNode.disconnect();
                this._offset = 0;
                this.playing = false;
            }
            return this;
        },

        /**
         * @language=zh
         * ����������
         */
        setVolume: function(volume){
            if(this.volume != volume){
                this.volume = volume;
                this._gainNode.gain.value = volume;
            }
            return this;
        },

        /**
         * @language=zh
         * �����Ƿ�����
         */
        setMute: function(muted){
            if(this.muted != muted){
                this.muted = muted;
                this._gainNode.gain.value = muted ? 0 : this.volume;
            }
            return this;
        }
    };
    
    Common.copy(obj, properties, true);
    obj._init();
    return obj;
}

/**
 * @language=zh
 * ������Ƿ�֧��WebAudio��
 */
WebAudio.isSupported = (window.AudioContext || window.webkitAudioContext) != null;

/**
 * @language=zh
 * ������Ƿ��Ѽ���WebAudio��
 */
WebAudio.enabled = false;

/**
 * @language=zh
 * ����WebAudio��ע�⣺���û��¼������˷�������Ч������������û��¼�Ҳ�ɲ�����Ƶ��
 */
WebAudio.enable = function(){
    if(!this.enabled && context){
        var source = context.createBufferSource();
        source.buffer = context.createBuffer(1, 1, 22050);
        source.connect(context.destination);
        source.start ? source.start(0, 0, 0) : source.noteOn(0, 0, 0);
        this.enabled = true;
        return true;
    }
    return this.enabled;
};

/**
 * The audio buffer caches.
 * @private
 * @type {Object}
 */
WebAudio._bufferCache = {};
/**
 * @language=zh
 * ���audio buffer ���档
 * @param  {String} url audio����ַ��Ĭ��������еĻ���
 */
WebAudio.clearBufferCache = function(url){
    if(url){
        this._bufferCache[url] = null;
    }
    else{
        this._bufferCache = {};
    }
};