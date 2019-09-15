/**
 * @language=zh
 * WebAudio声音播放模块。它具有更好的声音播放和控制能力，适合在iOS6+平台使用。
 * 兼容情况：iOS6+、Chrome33+、Firefox28+支持，但Android浏览器均不支持。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
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

        _context: null, //WebAudio上下文 the WebAudio Context
        _gainNode: null, //音量控制器 the volume controller
        _buffer: null, //音频缓冲文件 the audio file buffer
        _audioNode: null, //音频播放器 the audio playing node
        _startTime: 0, //开始播放时间戳 the start time to play the audio
        _offset: 0, //播放偏移量 the offset of current playing audio
        _listeners: null,

        /**
         * @language=zh
         * 增加一个事件监听。
         * @param {String} type 要监听的事件类型。
         * @param {Function} listener 事件监听回调函数。
         * @param {Boolean} once 是否是一次性监听，即回调函数响应一次后即删除，不再响应。
         * @returns {Object} 对象本身。链式调用支持。
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
         * 删除一个事件监听。如果不传入任何参数，则删除所有的事件监听；如果不传入第二个参数，则删除指定类型的所有事件监听。
         * @param {String} type 要删除监听的事件类型。
         * @param {Function} listener 要删除监听的回调函数。
         * @returns {Object} 对象本身。链式调用支持。
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
         * 发送事件。当第一个参数类型为Object时，则把它作为一个整体事件对象。
         * @param {String} type 要发送的事件类型。
         * @param {Object} detail 要发送的事件的具体信息，即事件随带参数。
         * @returns {Boolean} 是否成功调度事件。
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
         * @private 初始化
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
         * 加载音频文件。注意：我们使用XMLHttpRequest进行加载，因此需要注意跨域问题。
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
         * 播放音频。如果正在播放，则会重新开始。
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
         * 暂停音频。
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
         * 恢复音频播放。
         */
        resume: function(){
            if(!this.playing){
                this._doPlay();
            }
            return this;
        },

        /**
         * @language=zh
         * 停止音频播放。
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
         * 设置音量。
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
         * 设置是否静音。
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
 * 浏览器是否支持WebAudio。
 */
WebAudio.isSupported = (window.AudioContext || window.webkitAudioContext) != null;

/**
 * @language=zh
 * 浏览器是否已激活WebAudio。
 */
WebAudio.enabled = false;

/**
 * @language=zh
 * 激活WebAudio。注意：需用户事件触发此方法才有效。激活后，无需用户事件也可播放音频。
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
 * 清除audio buffer 缓存。
 * @param  {String} url audio的网址，默认清除所有的缓存
 */
WebAudio.clearBufferCache = function(url){
    if(url){
        this._bufferCache[url] = null;
    }
    else{
        this._bufferCache = {};
    }
};