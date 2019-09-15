/**
 * @language=zh
 * <iframe src='../../../examples/WebSound.html?noHeader' width = '320' height = '310' scrolling='no'></iframe>
 * <br/>
 * ʹ��ʾ��:
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
 * @class �������Ź�������
 * @static
 * @module iuiu/WebSound
 */
function WebSound() {
}
WebSound._audios = {},

/**
 * @language=zh
 * ������Ƶ���ܡ�ע�⣺���û��¼������˷�������Ч��Ŀǰ����WebAudio��Ч��
 */
WebSound.enableAudio = function(){
    if(WebAudio.isSupported){
        WebAudio.enable();
    }
};

/**
 * @language=zh
 * ��ȡ��Ƶ����Ĭ������ʹ�� WebAudio
 * @param {String|Object} source ��sourceΪString����Ϊ��Ƶsrc��ַ����ΪObject���������src���ԡ�
 * @param {Boolean} [preferWebAudio=true] �Ƿ�����ʹ��WebAudio��Ĭ�� true ��
 * @returns {WebAudio|HTMLAudio} ��Ƶ���Ŷ���ʵ����
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
 * ɾ����Ƶ����
 * @param {String|Object} source ��sourceΪString����Ϊ��Ƶsrc��ַ����ΪObject���������src���ԡ�
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