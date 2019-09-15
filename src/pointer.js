function initPointer() {
    var body = document;

    var isScrolling = false;
    var timeout = false;
    var sDistX = 0;
    var sDistY = 0;
    window.addEventListener('scroll', function() {
        if (!isScrolling) {
            sDistX = window.pageXOffset;
            sDistY = window.pageYOffset;
        }
        isScrolling = true;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            isScrolling = false;
            sDistX = 0;
            sDistY = 0;
        }, 100);
    });

    body.addEventListener('mousedown', pointerDown);
    body.addEventListener('touchstart', pointerDown);
    body.addEventListener('mouseup', pointerUp);
    body.addEventListener('touchend', pointerUp);
    body.addEventListener('mousemove', pointerMove);
    body.addEventListener('touchmove', pointerMove);
    body.addEventListener('mouseout', pointerLeave);
    body.addEventListener('touchleave', pointerLeave);

    function pointerDown(e) {
        var evt = makePointerEvent('down', e);
        var singleFinger = evt.mouse || (evt.touch && e.touches.length === 1);
        if (!isScrolling && singleFinger) {
            e.target.maybeClick = true;
            e.target.maybeClickX = evt.x;
            e.target.maybeClickY = evt.y;
        }
    }

    function pointerLeave(e) {
        e.target.maybeClick = false;
        makePointerEvent('leave', e);
    }

    function pointerMove(e) {
        var evt = makePointerEvent('move', e);
    }

    function pointerUp(e) {
        var evt = makePointerEvent('up', e);
        if (e.target.maybeClick) {
            // Have we moved too much?
            if (Math.abs(e.target.maybeClickX - evt.x) < 5 &&
                Math.abs(e.target.maybeClickY - evt.y) < 5) {
                // Have we scrolled too much?
                if (!isScrolling ||
                    (Math.abs(sDistX - window.pageXOffset) < 5 &&
                     Math.abs(sDistY - window.pageYOffset) < 5)) {
                    makePointerEvent('click', e);
                }
            }
        }
        e.target.maybeClick = false;
    }

    function makePointerEvent(type, e) {
        var tgt = e.target;
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('pointer' + type, true, true, {});
        evt.touch = e.type.indexOf('touch') === 0;
        evt.mouse = e.type.indexOf('mouse') === 0;
        if (evt.touch) {
            evt.x = e.changedTouches[0].pageX;
            evt.y = e.changedTouches[0].pageY;
        }
        if (evt.mouse) {
            evt.x = e.clientX + window.pageXOffset;
            evt.y = e.clientY + window.pageYOffset;
        }
        evt.maskedEvent = e;
        tgt.dispatchEvent(evt);
        return evt;
    }
}

initPointer();

function pointer(event, method) {
	if(!pointer.handler[event]) pointer.handler[event] = [];
	
	pointer.handler[event].push(method);
}

pointer.update = function() {
	if(pointer.button != 0) {
		if(!pointer.handler['down']) return;
	
		for (var i = 0; i < pointer.handler['down'].length; i++) {
	        pointer.handler['down'][i]({ x : pointer.x, y : pointer.y, button : pointer.button });
		}
	}
}

pointer.handler = {};
pointer.button = 0;
pointer.x = 0;
pointer.y = 0;

document.addEventListener('pointerdown', function(e) {
	pointer.button = e.buttons;
	pointer.x = e.x;
	pointer.y = e.y;
	
	if(!pointer.handler['down']) return;
	
	for (var i = 0; i < pointer.handler['down'].length; i++) {
        pointer.handler['down'][i]({ x : pointer.x, y : pointer.y, button : pointer.button });
	}
});

document.addEventListener('pointerup', function(e) {
	pointer.button = e.buttons;
	pointer.x = e.x;
	pointer.y = e.y;
	
	if(!pointer.handler['up']) return;
	
    for (var i = 0; i < pointer.handler['up'].length; i++) {
        pointer.handler['up'][i]({ x : pointer.x, y : pointer.y, button : pointer.button });
	}
});

document.addEventListener('pointermove', function(e) {
	pointer.button = e.buttons;
	pointer.x = e.x;
	pointer.y = e.y;
	
	if(!pointer.handler['move']) return;
	
	for (var i = 0; i < pointer.handler['move'].length; i++) {
        pointer.handler['move'][i]({ x : pointer.x, y : pointer.y, button : pointer.button });
	}
});

document.addEventListener('pointerleave', function(e) {
	pointer.button = e.buttons;
	pointer.x = e.x;
	pointer.y = e.y;
	
	if(!pointer.handler['leave']) return;
	
	for (var i = 0; i < pointer.handler['leave'].length; i++) {
        pointer.handler['leave'][i]({ x : pointer.x, y : pointer.y, button : pointer.button });
	}
});

document.addEventListener('pointerclick', function(e) {
	pointer.button = e.buttons;
	pointer.x = e.x;
	pointer.y = e.y;
	
	if(!pointer.handler['click']) return;
	
	for (var i = 0; i < pointer.handler['click'].length; i++) {
        pointer.handler['click'][i]({ x : pointer.x, y : pointer.y, button : pointer.button });
	}
});

if (typeof window !== 'undefined') {
  const _pointer = window.pointer;
  pointer.noConflict = function(deep) {
    if (deep && window.pointer === pointer) {
      window.pointer = _pointer;
    }
    return pointer;
  };
  window.pointer = pointer;
}