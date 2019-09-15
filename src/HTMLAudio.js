/**
 * @language=zh
 * HTMLAudio��������ģ�顣��ģ��ʹ��HTMLAudioElement������Ƶ��
 * ʹ�����ƣ�iOSƽ̨���û��¼��������ܲ��ţ��ܶ�Android���������ͬʱ����һ����Ƶ��
 * @param {Object} properties ������������Բ������ɰ����������п�д���ԡ�
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

	    _element: null, //HTMLAudioElement����
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
	     * ������Ƶ�ļ���
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
	                //ie9 ĳЩ�汾��Audio���󣬵���ִ��play,pause�ᱨ��
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
	     * ������Ƶ��������ڲ��ţ�������¿�ʼ��
	     * ע�⣺Ϊ�˱����һ�β��Ų��ɹ���������load��Ƶ���ٲ��š�
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
	     * ��ͣ��Ƶ��
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
	            this._element.pause();
	            this._element.currentTime = 0;
	            this.playing = false;
	        }
	        return this;
	    },
	    /**
	     * @language=zh
	     * ����������ע��: iOS�豸�޷�����������
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
	     * ���þ���ģʽ��ע��: iOS�豸�޷����þ���ģʽ��
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