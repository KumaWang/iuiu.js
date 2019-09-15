/**
 * @language=zh
 * HTMLAudio声音播放模块。此模块使用HTMLAudioElement播放音频。
 * 使用限制：iOS平台需用户事件触发才能播放，很多Android浏览器仅能同时播放一个音频。
 * @param {Object} properties 创建对象的属性参数。可包含此类所有可写属性。
 * @module iuiu/HTMLAudio
 */
function HTMLAudio(properties) {   
	var obj = {
	    src: null,
	    loop: false,
	    autoPlay: false,
	    loaded: false,
	    playing: false,
	    duration: 0,
	    volume: 1,
	    muted: false,

	    _element: null, //HTMLAudioElement对象
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
	     * 加载音频文件。
	     */
	    load: function(){
	        if(!this._element){
	            var elem;
	            try{
	                elem = this._element = new Audio();
	                elem.addEventListener('canplaythrough', this._onAudioEvent, false);
	                elem.addEventListener('ended', this._onAudioEvent, false);
	                elem.addEventListener('error', this._onAudioEvent, false);
	                elem.src = this.src;
	                elem.volume = this.volume;
	                elem.load();
	            }
	            catch(err){
	                //ie9 某些版本有Audio对象，但是执行play,pause会报错！
	                elem = this._element = {};
	                elem.play = elem.pause = function(){

	                };
	            }
	        }
	        return this;
	    },

	    /**
	     * @language=zh
	     * @private
	     */
	    _onAudioEvent: function(e){
	        // console.log('onAudioEvent:', e.type);
	        var type = e.type;

	        switch(type){
	            case 'canplaythrough':
	                e.target.removeEventListener(type, this._onAudioEvent);
	                this.loaded = true;
	                this.duration = this._element.duration;
	                this.fire('load');
	                if(obj.autoPlay) this._doPlay();
	                break;
	            case 'ended':
	                this.playing = false;
	                this.fire('end');
	                if(this.loop) this._doPlay();
	                break;
	            case 'error':
	                this.fire('error');
	                break;
	        }
	    },

	    /**
	     * @language=zh
	     * @private
	     */
	    _doPlay: function(){
	        if(!this.playing){
	            this._element.volume = this.muted ? 0 : this.volume;
	            this._element.play();
	            this.playing = true;
	        }
	    },
	    /**
	     * @language=zh
	     * 播放音频。如果正在播放，则会重新开始。
	     * 注意：为了避免第一次播放不成功，建议在load音频后再播放。
	     */
	    play: function(){
	        if(this.playing) this.stop();

	        if(!this._element){
	            this.autoPlay = true;
	            this.load();
	        }else if(this.loaded){
	            this._doPlay();
	        }

	        return this;
	    },
	    /**
	     * @language=zh
	     * 暂停音频。
	     */
	    pause: function(){
	        if(this.playing){
	            this._element.pause();
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
	            this._element.pause();
	            this._element.currentTime = 0;
	            this.playing = false;
	        }
	        return this;
	    },
	    /**
	     * @language=zh
	     * 设置音量。注意: iOS设备无法设置音量。
	     */
	    setVolume: function(volume){
	        if(this.volume != volume){
	            this.volume = volume;
	            this._element.volume = volume;
	        }
	        return this;
	    },
	    /**
	     * @language=zh
	     * 设置静音模式。注意: iOS设备无法设置静音模式。
	     */
	    setMute: function(muted){
	        if(this.muted != muted){
	            this.muted = muted;
	            this._element.volume = muted ? 0 : this.volume;
	        }
	        return this;
	    }
	};
	
	Common.copy(obj, properties, true);
       obj._onAudioEvent = obj._onAudioEvent.bind(obj);
       return obj;
};
HTMLAudio.isSupported = window.Audio !== null;