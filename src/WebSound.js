/**
 * @language=zh
 * <iframe src='../../../examples/WebSound.html?noHeader' width = '320' height = '310' scrolling='no'></iframe>
 * <br/>
 * 使用示例:
 * <pre>
 * var audio = WebSound.getAudio({
 *     src: 'test.mp3',
 *     loop: false,
 *     volume: 1
 * }).on('load', function(e){
 *     console.log('load');
 * }).on('end', function(e){
 *     console.log('end');
 * }).play();
 * </pre>
 * @class 声音播放管理器。
 * @static
 * @module iuiu/WebSound
 */
function WebSound() {
}
WebSound._audios = {},

/**
 * @language=zh
 * 激活音频功能。注意：需用户事件触发此方法才有效。目前仅对WebAudio有效。
 */
WebSound.enableAudio = function(){
    if(WebAudio.isSupported){
        WebAudio.enable();
    }
};

/**
 * @language=zh
 * 获取音频对象。默认优先使用 WebAudio
 * @param {String|Object} source 若source为String，则为音频src地址；若为Object，则需包含src属性。
 * @param {Boolean} [preferWebAudio=true] 是否优先使用WebAudio，默认 true 。
 * @returns {WebAudio|HTMLAudio} 音频播放对象实例。
 */
WebSound.getAudio = function(source, preferWebAudio){
    if(preferWebAudio === undefined){
        preferWebAudio = true;
    }

    source = this._normalizeSource(source);
    var audio = this._audios[source.src];
    if(!audio){
        if(preferWebAudio && WebAudio.isSupported){
            audio = new WebAudio(source);
        }else if(HTMLAudio.isSupported){
            audio = new HTMLAudio(source);
        }
        this._audios[source.src] = audio;
    }

    return audio;
};

/**
 * @language=zh
 * 删除音频对象。
 * @param {String|Object} source 若source为String，则为音频src地址；若为Object，则需包含src属性。
 */
WebSound.removeAudio = function(source){
    var src = typeof source === 'string' ? source : source.src;
    var audio = this._audios[src];
    if(audio){
        audio.stop();
        audio.off();
        this._audios[src] = null;
        delete this._audios[src];
    }
};

/**
 * @language=zh
 * @private
 */
WebSound._normalizeSource = function(source){
    var result = {};
    if(typeof source === 'string') result = {src:source};
    else Common.copy(result, source);
    return result;
}