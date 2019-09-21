const isff = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase().indexOf('firefox') > 0 : false;

// ���¼�
function addEvent(object, event, method) {
  if (object.addEventListener) {
    object.addEventListener(event, method, false);
  } else if (object.attachEvent) {
    object.attachEvent(`on${event}`, () => { method(window.event); });
  }
}

// ���μ�ת���ɶ�Ӧ�ļ���
function getMods(modifier, key) {
  const mods = key.slice(0, key.length - 1);
  for (let i = 0; i < mods.length; i++) mods[i] = modifier[mods[i].toLowerCase()];
  return mods;
}

// ������key�ַ���ת��������
function getKeys(key) {
  if (!key) key = '';

  key = key.replace(/\s/g, ''); // ƥ���κοհ��ַ�,�����ո��Ʊ������ҳ���ȵ�
  const keys = key.split(','); // ͬʱ���ö����ݼ�����','�ָ�
  let index = keys.lastIndexOf('');

  // ��ݼ����ܰ���','�������⴦��
  for (; index >= 0;) {
    keys[index - 1] += ',';
    keys.splice(index, 1);
    index = keys.lastIndexOf('');
  }

  return keys;
}

// �Ƚ����μ�������
function compareArray(a1, a2) {
  const arr1 = a1.length >= a2.length ? a1 : a2;
  const arr2 = a1.length >= a2.length ? a2 : a1;
  let isIndex = true;

  for (let i = 0; i < arr1.length; i++) {
    if (arr2.indexOf(arr1[i]) === -1) isIndex = false;
  }
  return isIndex;
}

const _keyMap = { // �����
  backspace: 8,
  tab: 9,
  clear: 12,
  enter: 13,
  return: 13,
  esc: 27,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  del: 46,
  delete: 46,
  ins: 45,
  insert: 45,
  home: 36,
  end: 35,
  pageup: 33,
  pagedown: 34,
  capslock: 20,
  '?': 20,
  ',': 188,
  '.': 190,
  '/': 191,
  '`': 192,
  '-': isff ? 173 : 189,
  '=': isff ? 61 : 187,
  ';': isff ? 59 : 186,
  '\'': 222,
  '[': 219,
  ']': 221,
  '\\': 220,
};

const _modifier = { // ���μ�
  '?': 16,
  shift: 16,
  '?': 18,
  alt: 18,
  option: 18,
  '?': 17,
  ctrl: 17,
  control: 17,
  '?': isff ? 224 : 91,
  cmd: isff ? 224 : 91,
  command: isff ? 224 : 91,
};
const modifierMap = {
  16: 'shiftKey',
  18: 'altKey',
  17: 'ctrlKey',
};
const _mods = { 16: false, 18: false, 17: false };
const _handlers = {};

// F1~F12 �����
for (let k = 1; k < 20; k++) {
  _keyMap[`f${k}`] = 111 + k;
}

// ����Firefox����
modifierMap[isff ? 224 : 91] = 'metaKey';
_mods[isff ? 224 : 91] = false;


let _downKeys = []; // ��¼���µİ󶨼�

let _scope = 'all'; // Ĭ���ȼ���Χ
const elementHasBindEvent = []; // �Ѱ��¼��Ľڵ��¼

// ���ؼ���
const code = x => _keyMap[x.toLowerCase()] || _modifier[x.toLowerCase()] || x.toUpperCase().charCodeAt(0);

// ���û�ȡ��ǰ��Χ��Ĭ��Ϊ'����'��
function setScope(scope) { _scope = scope || 'all'; }
// ��ȡ��ǰ��Χ
function getScope() { return _scope || 'all'; }
// ��ȡ���°󶨼��ļ�ֵ
function getPressedKeyCodes() { return _downKeys.slice(0); }

// ���ؼ��ؼ��ж� ���� Boolean
// hotkey is effective only when filter return true
function filter(event) {
  const target = event.target || event.srcElement;
  const tagName = target.tagName;
  let flag = true;
  // ignore: isContentEditable === 'true', <input> and <textarea> when readOnly state is false, <select>
  if (
    target.isContentEditable ||
    tagName === 'TEXTAREA' ||
    ((tagName === 'INPUT' || tagName === 'TEXTAREA') && !target.readOnly)
  ) {
    flag = false;
  }
  return flag;
}

// �ж����µļ��Ƿ�Ϊĳ����������true����false
function isPressed(keyCode) {
  if (typeof (keyCode) === 'string') {
    keyCode = code(keyCode); // ת���ɼ���
  }
  return _downKeys.indexOf(keyCode) !== -1;
}


// ѭ��ɾ��handlers�е����� scope(��Χ)
function deleteScope(scope, newScope) {
  let handlers;
  let i;

  // û��ָ��scope����ȡscope
  if (!scope) scope = getScope();

  for (const key in _handlers) {
    if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
      handlers = _handlers[key];
      for (i = 0; i < handlers.length;) {
        if (handlers[i].scope === scope) handlers.splice(i, 1);
        else i++;
      }
    }
  }

  // ���scope��ɾ������scope����Ϊall
  if (getScope() === scope) setScope(newScope || 'all');
}

// ������μ�
function clearModifier(event) {
  let key = event.keyCode || event.which || event.charCode;
  const i = _downKeys.indexOf(key);

  // ���б��������ѹ���ļ�
  if (i >= 0) {
    _downKeys.splice(i, 1);
  }
  // ���⴦�� cmmand ������ cmmand ��Ͽ�ݼ� keyup ִֻ��һ�ε�����
  if (event.key && event.key.toLowerCase() === 'meta') {
    _downKeys.splice(0, _downKeys.length);
  }

  // ���μ� shiftKey altKey ctrlKey (command||metaKey) ���
  if (key === 93 || key === 224) key = 91;
  if (key in _mods) {
    _mods[key] = false;

    // �����μ�����Ϊfalse
    for (const k in _modifier) if (_modifier[k] === key) hotkeys[k] = false;
  }
}

// �����ĳ����Χ�Ŀ�ݼ�
function unbind(key, scope, method) {
  const multipleKeys = getKeys(key);
  let keys;
  let mods = [];
  let obj;
  // ͨ�������жϣ��Ƿ�����
  // https://github.com/jaywcjlove/hotkeys/issues/44
  if (typeof scope === 'function') {
    method = scope;
    scope = 'all';
  }

  for (let i = 0; i < multipleKeys.length; i++) {
    // ����Ͽ�ݼ����Ϊ����
    keys = multipleKeys[i].split('+');

    // ��¼ÿ����ϼ��е����μ��ļ��� ��������
    if (keys.length > 1) {
      mods = getMods(_modifier, keys);
    } else {
      mods = [];
    }

    // ��ȡ�����μ���ļ�ֵkey
    key = keys[keys.length - 1];
    key = key === '*' ? '*' : code(key);

    // �ж��Ƿ��뷶Χ��û�оͻ�ȡ��Χ
    if (!scope) scope = getScope();

    // ���key���� _handlers �з��ز�������
    if (!_handlers[key]) return;

    // ��� handlers �����ݣ�
    // �ô�����ݼ���֮��û���¼�ִ�е�������ݼ��󶨵�Ŀ��
    for (let r = 0; r < _handlers[key].length; r++) {
      obj = _handlers[key][r];
      // ͨ�������жϣ��Ƿ����󶨣��������ֱ�ӷ���
      const isMatchingMethod = method ? obj.method === method : true;

      // �ж��Ƿ��ڷ�Χ�ڲ��Ҽ�ֵ��ͬ
      if (
        isMatchingMethod &&
        obj.scope === scope &&
        compareArray(obj.mods, mods)
      ) {
        _handlers[key][r] = {};
      }
    }
  }
}

// �Լ�����Ӧ��ݼ��Ļص��������д���
function eventHandler(handler, scope) {
  let modifiersMatch;

  // �����Ƿ��ڵ�ǰ��Χ
  if (handler.scope === scope || handler.scope === 'all') {
    // ����Ƿ�ƥ�����η�������з���true��
    modifiersMatch = handler.mods.length > 0;

    for (const y in _mods) {
      if (Object.prototype.hasOwnProperty.call(_mods, y)) {
        if (
          (!_mods[y] && handler.mods.indexOf(+y) > -1) ||
          (_mods[y] && handler.mods.indexOf(+y) === -1)
        ) modifiersMatch = false;
      }
    }

    // ���ô��������������μ���������
    if (
      (handler.mods.length === 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) ||
      modifiersMatch ||
      handler.shortcut === '*'
    ) {
      handler.method(handler);
    }
  }
}


// ����keydown�¼�
function dispatch(event) {
  const asterisk = _handlers['*'];
  let key = event.keyCode || event.which || event.charCode;

  // ���ؼ����� Ĭ�ϱ��ؼ���������ݼ�
  if (!hotkeys.filter.call(this, event)) return;

  // Gecko(Firefox)��command��ֵ224����Webkit(Chrome)�б���һ��
  // Webkit����command��ֵ��һ��
  if (key === 93 || key === 224) key = 91;

  // Collect bound keys
  // If an Input Method Editor is processing key input and the event is keydown, return 229.
  // https://stackoverflow.com/questions/25043934/is-it-ok-to-ignore-keydown-events-with-keycode-229
  // http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
  if (_downKeys.indexOf(key) === -1 && key !== 229) _downKeys.push(key);

  if (key in _mods) {
    _mods[key] = true;

    // �������ַ���keyע�ᵽ hotkeys ��
    for (const k in _modifier) {
      if (_modifier[k] === key) hotkeys[k] = true;
    }

    if (!asterisk) return;
  }

  // ��modifierMap��������μ��󶨵�event��
  for (const e in _mods) {
    if (Object.prototype.hasOwnProperty.call(_mods, e)) {
      _mods[e] = event[modifierMap[e]];
    }
  }
}

// �ж� element �Ƿ��Ѿ����¼�
function isElementBind(element) {
  return elementHasBindEvent.indexOf(element) > -1;
}

function update() {
  const asterisk = _handlers['*'];
  
  if (!asterisk) return;
	
  // ��ȡ��Χ Ĭ��Ϊall
  const scope = getScope();

  // ���κο�ݼ�����Ҫ���Ĵ���
  if (asterisk) {
    for (let i = 0; i < asterisk.length; i++) {
      if (asterisk[i].scope === scope) {
        eventHandler(asterisk[i], scope);
      }
    }
  }
  // key ����_handlers�з���
  // if (!(key in _handlers)) return;
  for (const key in _handlers) {
    if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
      for (let i = 0; i < _handlers[key].length; i++) {
        if (_handlers[key][i].key) {
          const keyShortcut = _handlers[key][i].key.split('+');
          let _downKeysCurrent = []; // ��¼��ǰ������ֵ
          for (let a = 0; a < keyShortcut.length; a++) {
            _downKeysCurrent.push(code(keyShortcut[a]));
          }
          _downKeysCurrent = _downKeysCurrent.sort();
          if (_downKeysCurrent.join('') === _downKeys.sort().join('')) {
            // �ҵ���������
            eventHandler(_handlers[key][i], scope);
          }
        }
      }
    }
  }
}

function hotkeys(key, option, method) {
  const keys = getKeys(key); // ��Ҫ����Ŀ�ݼ��б�
  let mods = [];
  let scope = 'all'; // scopeĬ��Ϊall�����з�Χ����Ч
  let element = document; // ��ݼ��¼��󶨽ڵ�
  let i = 0;
  let keyup = false;
  let keydown = true;

  // ��Ϊ�趨��Χ���ж�
  if (method === undefined && typeof option === 'function') {
    method = option;
  }

  if (Object.prototype.toString.call(option) === '[object Object]') {
    if (option.scope) scope = option.scope; // eslint-disable-line
    if (option.element) element = option.element; // eslint-disable-line
    if (option.keyup) keyup = option.keyup; // eslint-disable-line
    if (option.keydown !== undefined) keydown = option.keydown; // eslint-disable-line
  }

  if (typeof option === 'string') scope = option;

  // ����ÿ����ݼ����д���
  for (; i < keys.length; i++) {
    key = keys[i].split('+'); // �����б�
    mods = [];

    // �������Ͽ�ݼ�ȡ����Ͽ�ݼ�
    if (key.length > 1) mods = getMods(_modifier, key);

    // �������μ�ת��Ϊ����
    key = key[key.length - 1];
    key = key === '*' ? '*' : code(key); // *��ʾƥ�����п�ݼ�

    // �ж�key�Ƿ���_handlers�У����ھ͸�һ��������
    if (!(key in _handlers)) _handlers[key] = [];
    _handlers[key].push({
      keyup,
      keydown,
      scope,
      mods,
      shortcut: keys[i],
      method,
      key: keys[i],
    });
  }
  // ��ȫ��document�����ÿ�ݼ�
  if (typeof element !== 'undefined' && !isElementBind(element) && window) {
    elementHasBindEvent.push(element);
    addEvent(element, 'keydown', (e) => {
      dispatch(e);
      event.preventDefault();
	  event.stopPropagation();
 	  event.cancelBubble = true;
    });
    addEvent(window, 'focus', () => {
      _downKeys = [];
    });
    addEvent(element, 'keyup', (e) => {
      dispatch(e);
      clearModifier(e);
    });
  }
}

const _api = {
  setScope,
  getScope,
  deleteScope,
  getPressedKeyCodes,
  isPressed,
  filter,
  unbind,
  update
};
for (const a in _api) {
  if (Object.prototype.hasOwnProperty.call(_api, a)) {
    hotkeys[a] = _api[a];
  }
}

if (typeof window !== 'undefined') {
  const _hotkeys = window.hotkeys;
  hotkeys.noConflict = (deep) => {
    if (deep && window.hotkeys === hotkeys) {
      window.hotkeys = _hotkeys;
    }
    return hotkeys;
  };
  window.hotkeys = hotkeys;
}