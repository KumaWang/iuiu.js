/*
 * iuiu.js
 * http://github.com/KumaWang/iuiu.js/
 *
 * Copyright 2018 KumaWang
 * Released under the MIT license
 */
var IUIU = (function() {

// src/collide.js
function CreateBody(object) {
    var body = new Body();
    for(var i = 0; i < object.items.length; i++) {
        var item = object.items[i];
        if(item.type == "collide") {
            body.parts.push(new BodyPart(item));
        }
    }
}

function Body() {
    this.parts = [];
}

function BodyPart(item) {
    this.vertices = item.points;
}


// src/color.js
function Color(r, g, b, a) {
    if (((((r | g) | b) | a) & -256) != 0) {
        r = r < 0 ? 0 : (r > 255 ? 255 : r);
        g = g < 0 ? 0 : (g > 255 ? 255 : g);
        b = b < 0 ? 0 : (b > 255 ? 255 : b);
        a = a < 0 ? 0 : (a > 255 ? 255 : a);
    } else {
        r = r / 255;
        g = g / 255;
        b = b / 255;
        a = a / 255;
    }
    
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}
Color.prototype = {
    toArray : function(n) {
        return [this.r, this.g, this.b, this.a].slice(0, n || 4);
    },
    multiply : function multiply(other) {
        return new Color(
            Math.floor(this.r * other.r / 255.0),
            Math.floor(this.g * other.g / 255.0),
            Math.floor(this.b * other.b / 255.0),
            Math.floor(this.a * other.a / 255.0));
    },
    clone : function() {
        var result = new Color();
        result.r = this.r;
        result.g = this.g;
        result.b = this.b;
        result.a = this.a;
        return result;
    }
};

Color.multiply = function(value, scale) {
    var r = value.r;
    var g = value.g;
    var b = value.b;
    var a = value.a;
    
    var value = scale*65536;
    var min = 0;
    var max = 0xffffff;
    
    value = (value > max) ? max : value;
    value = (value < min) ? min : value;
    var uintScale = value < 0 ? 0 : value;
    
     r = (r*uintScale) >> 16;
     g = (g*uintScale) >> 16;
     b = (b*uintScale) >> 16;
     a = (a*uintScale) >> 16;
     
     r = r > 255 ? 255 : r;
     g = g > 255 ? 255 : g;
     b = b > 255 ? 255 : b;
     a = a > 255 ? 255 : a;
     
     return new Color(r, g, b, a);
};

Color.lerp = function(value1, value2, amount) {
    var r1 = value1.r;
    var g1 = valur1.g;
    var b1 = value1.b;
    var a1 = value1.a;
    
    var r2 = value2.r;
    var g2 = valur2.g;
    var b2 = value2.b;
    var a2 = value2.a;
    
    amount *= 65536;
    if(isNaN(amount) || amount < 0)
        amount = 0
    else if(amount == Number.POSITIVE_INFINITY)
        amount = amount == Number.NEGATIVE_INFINITY ? 0 : 65536;

    return new Color(r1 + (((r2 - r1)*factor) >> 16),
                     g1 + (((g2 - g1)*factor) >> 16),
                     b1 + (((b2 - b1)*factor) >> 16),
                     a1 + (((a2 - a1)*factor) >> 16));
};

Color.aliceBlue=new Color(240,248,255,255);
Color.antiqueWhite=new Color(250,235,215,255);
Color.aqua=new Color(0,255,255,255);
Color.aquamarine=new Color(127,255,212,255);
Color.azure=new Color(240,255,255,255);
Color.beige=new Color(245,245,220,255);
Color.bisque=new Color(255,228,196,255);
Color.black=new Color(0,0,0,255);
Color.blanchedAlmond=new Color(255,235,205,255);
Color.blue=new Color(0,0,255,255);
Color.blueViolet=new Color(138,43,226,255);
Color.brown=new Color(165,42,42,255);
Color.burlyWood=new Color(222,184,135,255);
Color.cadetBlue=new Color(95,158,160,255);
Color.chartreuse=new Color(127,255,0,255);
Color.chocolate=new Color(210,105,30,255);
Color.coral=new Color(255,127,80,255);
Color.cornflowerBlue=new Color(0xffed9564);
Color.cornsilk=new Color(255,248,220,255);
Color.crimson=new Color(220,20,60,255);
Color.cyan=new Color(0,255,255,255);
Color.darkBlue=new Color(0,0,139,255);
Color.darkCyan=new Color(0,139,139,255);
Color.darkGoldenrod=new Color(184,134,11,255);
Color.darkGray=new Color(169,169,169,255);
Color.darkGreen=new Color(0,100,0,255);
Color.darkKhaki=new Color(189,183,107,255);
Color.darkMagenta=new Color(139,0,139,255);
Color.darkOliveGreen=new Color(85,107,47,255);
Color.darkOrange=new Color(255,140,0,255);
Color.darkOrchid=new Color(153,50,204,255);
Color.darkRed=new Color(139,0,0,255);
Color.darkSalmon=new Color(233,150,122,255);
Color.darkSeaGreen=new Color(143,188,139,255);
Color.darkSlateBlue=new Color(72,61,139,255);
Color.darkSlateGray=new Color(47,79,79,255);
Color.darkTurquoise=new Color(0,206,209,255);
Color.darkViolet=new Color(148,0,211,255);
Color.deepPink=new Color(255,20,147,255);
Color.deepSkyBlue=new Color(0,191,255,255);
Color.dimGray=new Color(105,105,105,255);
Color.dodgerBlue=new Color(30,144,255,255);
Color.firebrick=new Color(178,34,34,255);
Color.floralWhite=new Color(255,250,240,255);
Color.forestGreen=new Color(34,139,34,255);
Color.fuchsia=new Color(255,0,255,255);
Color.gainsboro=new Color(220,220,220,255);
Color.ghostWhite=new Color(248,248,255,255);
Color.gold=new Color(255,215,0,255);
Color.goldenrod=new Color(218,165,32,255);
Color.gray=new Color(128,128,128,255);
Color.green=new Color(0,128,0,255);
Color.greenYellow=new Color(173,255,47,255);
Color.honeydew=new Color(240,255,240,255);
Color.hotPink=new Color(255,105,180,255);
Color.indianRed=new Color(205,92,92,255);
Color.indigo=new Color(75,0,130,255);
Color.ivory=new Color(255,255,240,255);
Color.khaki=new Color(240,230,140,255);
Color.lavender=new Color(230,230,250,255);
Color.lavenderBlush=new Color(255,240,245,255);
Color.lawnGreen=new Color(124,252,0,255);
Color.lemonChiffon=new Color(255,250,205,255);
Color.lightBlue=new Color(173,216,230,255);
Color.lightCoral=new Color(240,128,128,255);
Color.lightCyan=new Color(224,255,255,255);
Color.lightGoldenrodYellow=new Color(250,250,210,255);
Color.lightGray=new Color(211,211,211,255);
Color.lightGreen=new Color(144,238,144,255);
Color.lightPink=new Color(255,182,193,255);
Color.lightSalmon=new Color(255,160,122,255);
Color.lightSeaGreen=new Color(32,178,170,255);
Color.lightSkyBlue=new Color(135,206,250,255);
Color.lightSlateGray=new Color(119,136,153,255);
Color.lightSteelBlue=new Color(176,196,222,255);
Color.lightYellow=new Color(255,255,224,255);
Color.lime=new Color(0,255,0,255);
Color.limeGreen=new Color(50,205,50,255);
Color.linen=new Color(250,240,230,255);
Color.magenta=new Color(255,0,255,255);
Color.maroon=new Color(128,0,0,255);
Color.mediumAquamarine=new Color(102,205,170,255);
Color.mediumBlue=new Color(0,0,205,255);
Color.mediumOrchid=new Color(186,85,211,255);
Color.mediumPurple=new Color(147,112,219,255);
Color.mediumSeaGreen=new Color(60,179,113,255);
Color.mediumSlateBlue=new Color(123,104,238,255);
Color.mediumSpringGreen=new Color(0,250,154,255);
Color.mediumTurquoise=new Color(72,209,204,255);
Color.mediumVioletRed=new Color(199,21,133,255);
Color.midnightBlue=new Color(25,25,112,255);
Color.mintCream=new Color(245,255,250,255);
Color.mistyRose=new Color(255,228,225,255);
Color.moccasin=new Color(255,228,181,255);
Color.navajoWhite=new Color(255,222,173,255);
Color.navy=new Color(0,0,128,255);
Color.oldLace=new Color(253,245,230,255);
Color.olive=new Color(128,128,0,255);
Color.oliveDrab=new Color(107,142,35,255);
Color.orange=new Color(255,165,0,255);
Color.orangeRed=new Color(255,69,0,255);
Color.orchid=new Color(218,112,214,255);
Color.paleGoldenrod=new Color(238,232,170,255);
Color.paleGreen=new Color(152,251,152,255);
Color.paleTurquoise=new Color(175,238,238,255);
Color.paleVioletRed=new Color(219,112,147,255);
Color.papayaWhip=new Color(255,239,213,255);
Color.peachPuff=new Color(255,218,185,255);
Color.peru=new Color(205,133,63,255);
Color.pink=new Color(255,192,203,255);
Color.plum=new Color(221,160,221,255);
Color.powderBlue=new Color(176,224,230,255);
Color.purple=new Color(128,0,128,255);
Color.red=new Color(255,0,0,255);
Color.rosyBrown=new Color(188,143,143,255);
Color.royalBlue=new Color(65,105,225,255);
Color.saddleBrown=new Color(139,69,19,255);
Color.salmon=new Color(250,128,114,255);
Color.sandyBrown=new Color(244,164,96,255);
Color.seaGreen=new Color(46,139,87,255);
Color.seaShell=new Color(255,245,238,255);
Color.sienna=new Color(160,82,45,255);
Color.silver=new Color(192,192,192,255);
Color.skyBlue=new Color(135,206,235,255);
Color.slateBlue=new Color(106,90,205,255);
Color.slateGray=new Color(112,128,144,255);
Color.snow=new Color(255,250,250,255);
Color.springGreen=new Color(0,255,127,255);
Color.steelBlue=new Color(70,130,180,255);
Color.tan=new Color(210,180,140,255);
Color.teal=new Color(0,128,128,255);
Color.thistle=new Color(216,191,216,255);
Color.tomato=new Color(255,99,71,255);
Color.transparent=new Color(0,0,0,0);
Color.turquoise=new Color(64,224,208,255);
Color.violet=new Color(238,130,238,255);
Color.wheat=new Color(245,222,179,255);
Color.white=new Color(255,255,255,255);
Color.whiteSmoke=new Color(245,245,245,255);
Color.yellow=new Color(255,255,0,255);
Color.yellowGreen=new Color(154,205,50,255);
// src/common.js
Array.prototype.insert = function (index, item) {  
  this.splice(index, 0, item);  
};  

Array.prototype.removeAt=function(index) {
    this.splice(index, 1);
}

function Common() {
}
Common.clone = function (obj) {
   var str, newobj = obj.constructor === Array ? [] : {};
    if(typeof obj !== 'object'){
        return;
    } else if(window.JSON){
        str = JSON.stringify(obj), //ϵ�л�����
        newobj = JSON.parse(str); //��ԭ
    } else {
        for(var i in obj){
            newobj[i] = typeof obj[i] === 'object' ? 
            cloneObj(obj[i]) : obj[i]; 
        }
    }
    return newobj;
}

Common.copy = function(target, source, strict){
    for(var key in source){
        if(!strict || target.hasOwnProperty(key) || target[key] !== undefined){
            target[key] = source[key];
        }
    }
    return target;
}

function deepCopyObj(oldObj){
  var newObj={};
  if(oldObj &&  typeof oldObj=="object" ){
    for(var i in oldObj ) {
        
      if(typeof oldObj[i]=="object"){//����ӻ��Ƕ�����ôѭ������ֵ��ֵ
        newObj[i]=deepCopyObj(oldObj[i]);
      }else{//ֱ��ֵ��ֵ
        newObj[i]=oldObj[i];
      }
    }
    return newObj
  }
}

String.prototype.format = function () {
    var str = this
    for (var i = 0; i < arguments.length; i++) {
        var re = new RegExp('\\{' + i + '\\}', 'gm')
        str = str.replace(re, arguments[i])
    }
    return str
}
// src/component.js
function Component() {
    this.components = {};
}

Component.prototype.create = function(name) {
    return this.components[name]();
}

Component.prototype.define = function(name, createFunc) {
    this.components[name] = createFunc;
}


// src/delaunay.js
var Delaunay;

(function() {
  "use strict";

  var EPSILON = 1.0 / 1048576.0;

  function supertriangle(vertices) {
    var xmin = Number.POSITIVE_INFINITY,
        ymin = Number.POSITIVE_INFINITY,
        xmax = Number.NEGATIVE_INFINITY,
        ymax = Number.NEGATIVE_INFINITY,
        i, dx, dy, dmax, xmid, ymid;

    for(i = vertices.length; i--; ) {
      if(vertices[i][0] < xmin) xmin = vertices[i][0];
      if(vertices[i][0] > xmax) xmax = vertices[i][0];
      if(vertices[i][1] < ymin) ymin = vertices[i][1];
      if(vertices[i][1] > ymax) ymax = vertices[i][1];
    }

    dx = xmax - xmin;
    dy = ymax - ymin;
    dmax = Math.max(dx, dy);
    xmid = xmin + dx * 0.5;
    ymid = ymin + dy * 0.5;

    return [
      [xmid - 20 * dmax, ymid -      dmax],
      [xmid            , ymid + 20 * dmax],
      [xmid + 20 * dmax, ymid -      dmax]
    ];
  }

  function circumcircle(vertices, i, j, k) {
    var x1 = vertices[i][0],
        y1 = vertices[i][1],
        x2 = vertices[j][0],
        y2 = vertices[j][1],
        x3 = vertices[k][0],
        y3 = vertices[k][1],
        fabsy1y2 = Math.abs(y1 - y2),
        fabsy2y3 = Math.abs(y2 - y3),
        xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;

    /* Check for coincident points */
    if(fabsy1y2 < EPSILON && fabsy2y3 < EPSILON)
      throw new Error("Eek! Coincident points!");

    if(fabsy1y2 < EPSILON) {
      m2  = -((x3 - x2) / (y3 - y2));
      mx2 = (x2 + x3) / 2.0;
      my2 = (y2 + y3) / 2.0;
      xc  = (x2 + x1) / 2.0;
      yc  = m2 * (xc - mx2) + my2;
    }

    else if(fabsy2y3 < EPSILON) {
      m1  = -((x2 - x1) / (y2 - y1));
      mx1 = (x1 + x2) / 2.0;
      my1 = (y1 + y2) / 2.0;
      xc  = (x3 + x2) / 2.0;
      yc  = m1 * (xc - mx1) + my1;
    }

    else {
      m1  = -((x2 - x1) / (y2 - y1));
      m2  = -((x3 - x2) / (y3 - y2));
      mx1 = (x1 + x2) / 2.0;
      mx2 = (x2 + x3) / 2.0;
      my1 = (y1 + y2) / 2.0;
      my2 = (y2 + y3) / 2.0;
      xc  = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
      yc  = (fabsy1y2 > fabsy2y3) ?
        m1 * (xc - mx1) + my1 :
        m2 * (xc - mx2) + my2;
    }

    dx = x2 - xc;
    dy = y2 - yc;
    return {i: i, j: j, k: k, x: xc, y: yc, r: dx * dx + dy * dy};
  }

  function dedup(edges) {
    var i, j, a, b, m, n;

    for(j = edges.length; j; ) {
      b = edges[--j];
      a = edges[--j];

      for(i = j; i; ) {
        n = edges[--i];
        m = edges[--i];

        if((a === m && b === n) || (a === n && b === m)) {
          edges.splice(j, 2);
          edges.splice(i, 2);
          break;
        }
      }
    }
  }

  Delaunay = {
    triangulate: function(vertices, key) {
      var n = vertices.length,
          i, j, indices, st, open, closed, edges, dx, dy, a, b, c;

      /* Bail if there aren't enough vertices to form any triangles. */
      if(n < 3)
        return [];

      /* Slice out the actual vertices from the passed objects. (Duplicate the
       * array even if we don't, though, since we need to make a supertriangle
       * later on!) */
      vertices = vertices.slice(0);

      if(key)
        for(i = n; i--; )
          vertices[i] = vertices[i][key];

      /* Make an array of indices into the vertex array, sorted by the
       * vertices' x-position. Force stable sorting by comparing indices if
       * the x-positions are equal. */
      indices = new Array(n);

      for(i = n; i--; )
        indices[i] = i;

      indices.sort(function(i, j) {
        var diff = vertices[j][0] - vertices[i][0];
        return diff !== 0 ? diff : i - j;
      });

      /* Next, find the vertices of the supertriangle (which contains all other
       * triangles), and append them onto the end of a (copy of) the vertex
       * array. */
      st = supertriangle(vertices);
      vertices.push(st[0], st[1], st[2]);
      
      /* Initialize the open list (containing the supertriangle and nothing
       * else) and the closed list (which is empty since we havn't processed
       * any triangles yet). */
      open   = [circumcircle(vertices, n + 0, n + 1, n + 2)];
      closed = [];
      edges  = [];

      /* Incrementally add each vertex to the mesh. */
      for(i = indices.length; i--; edges.length = 0) {
        c = indices[i];

        /* For each open triangle, check to see if the current point is
         * inside it's circumcircle. If it is, remove the triangle and add
         * it's edges to an edge list. */
        for(j = open.length; j--; ) {
          /* If this point is to the right of this triangle's circumcircle,
           * then this triangle should never get checked again. Remove it
           * from the open list, add it to the closed list, and skip. */
          dx = vertices[c][0] - open[j].x;
          if(dx > 0.0 && dx * dx > open[j].r) {
            closed.push(open[j]);
            open.splice(j, 1);
            continue;
          }

          /* If we're outside the circumcircle, skip this triangle. */
          dy = vertices[c][1] - open[j].y;
          if(dx * dx + dy * dy - open[j].r > EPSILON)
            continue;

          /* Remove the triangle and add it's edges to the edge list. */
          edges.push(
            open[j].i, open[j].j,
            open[j].j, open[j].k,
            open[j].k, open[j].i
          );
          open.splice(j, 1);
        }

        /* Remove any doubled edges. */
        dedup(edges);

        /* Add a new triangle for each edge. */
        for(j = edges.length; j; ) {
          b = edges[--j];
          a = edges[--j];
          open.push(circumcircle(vertices, a, b, c));
        }
      }

      /* Copy any remaining open triangles to the closed list, and then
       * remove any triangles that share a vertex with the supertriangle,
       * building a list of triplets that represent triangles. */
      for(i = open.length; i--; )
        closed.push(open[i]);
      open.length = 0;

      for(i = closed.length; i--; )
        if(closed[i].i < n && closed[i].j < n && closed[i].k < n)
          open.push(closed[i].i, closed[i].j, closed[i].k);

      /* Yay, we're done! */
      return open;
    },
    contains: function(tri, p) {
      /* Bounding box test first, for quick rejections. */
      if((p[0] < tri[0][0] && p[0] < tri[1][0] && p[0] < tri[2][0]) ||
         (p[0] > tri[0][0] && p[0] > tri[1][0] && p[0] > tri[2][0]) ||
         (p[1] < tri[0][1] && p[1] < tri[1][1] && p[1] < tri[2][1]) ||
         (p[1] > tri[0][1] && p[1] > tri[1][1] && p[1] > tri[2][1]))
        return null;

      var a = tri[1][0] - tri[0][0],
          b = tri[2][0] - tri[0][0],
          c = tri[1][1] - tri[0][1],
          d = tri[2][1] - tri[0][1],
          i = a * d - b * c;

      /* Degenerate tri. */
      if(i === 0.0)
        return null;

      var u = (d * (p[0] - tri[0][0]) - b * (p[1] - tri[0][1])) / i,
          v = (a * (p[1] - tri[0][1]) - c * (p[0] - tri[0][0])) / i;

      /* If we're outside the tri, fail. */
      if(u < 0.0 || v < 0.0 || (u + v) > 1.0)
        return null;

      return [u, v];
    }
  };

  if(typeof module !== "undefined")
    module.exports = Delaunay;
})();

// src/font.js
function Font() {
    this.isLoaded = false;
}

Font.create = function() {
    return new Font();
}

Font.fromJson = function(json, params, entry) {
    var font = entry;
    for(var c in json.data) {
        var left = Number.MAX_VALUE, top = Number.MAX_VALUE, right = Number.MIN_VALUE, bottom = Number.MIN_VALUE;
        font[c] = { vertices : [] };
        var points = json.data[c].split(',');
        for(var i = 0; i < points.length; i = i + 2) {
            var x = parseFloat(points[i]);
            var y = parseFloat(points[i + 1]);
            font[c].vertices.push({ x : x, y : y });
            
            if(x < left) left = x;
            if(x > right) right = x;
            if(y < top) top = y;
            if(y > bottom) bottom = y;
        }
        
        font[c].size = { width : right - left, height : bottom - top };
    }
    font.isLoaded = true;
    return font;
}
// src/HTMLAudio.js
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
// src/io.js
function DefaultDecoder() {
}

DefaultDecoder.prototype = {
    getCharCode : function(charCode) {
        return String.fromCharCode(charCode);
    }
};

function BinaryReader(dataView, start, length, decoder) {
    if(!dataView)
        throw "data";
        
    this.data = dataView;
    this.position = start || 0;
    var up = start + length;
    this.length = up > dataView.byteLength ? dataView.byteLength - start : up;
    this.decoder = decoder || new DefaultDecoder();
}

BinaryReader.prototype = {
    readByte : function() {
        return this.data.getUint8(this.position++);
    },
    readSByte : function() {
        return this.data.getInt8(this.position++);
    },
    readInt16 : function() {
        var result = this.data.getInt16(this.position);
        this.position = this.position + 2;
        return result;
    },
    readUint16 : function() {
        var result = this.data.getUint16(this.position);
        this.position = this.position + 2;
        return result;
    },
    readInt32 : function() {
        var result = this.data.getInt32(this.position);
        this.position = this.position + 4;
        return result;
    },
    readUint32 : function() {
        var result = this.data.getUint32(this.position);
        this.position = this.position + 4;
        return result;
    },
    readSingle : function() {
        var result = this.data.getFloat32(this.position);
        this.position = this.position + 4;
        return result;
    },
    readDouble : function() {
        var result = this.data.getFloat64(this.position);
        this.position = this.position + 8;
        return result;
    },
    readBoolean : function() {
        return this.data.getInt8(this.position++) == 1;
    },
    readChar : function() {
        return this.decoder.getCharCode(this.readByte());
    },
    readString : function(length) {
        var result = "";
        var num = 0;        // int
        var capacity = length || this.read7BitEncodedInt();
        if (capacity < 0) {
            throw "IO.IO_InvalidStringLen_Len";
        }
        
        if (capacity == 0) {
            return result;
        }
        
        for(var i = 0; i < capacity; i++) {
            result += this.readChar();
        }
        
        return result;
    },
    read7BitEncodedInt : function() {
        var num3;           // byte
        var num = 0;        // int
        var num2 = 0;       // int
        do {
            if (num2 == 0x23) {
                throw "Format_Bad7BitInt32";
            }
            num3 = this.readByte();
            num |= (num3 & 0x7f) << num2;
            num2 += 7;
        } while ((num3 & 0x80) != 0);
        
        this.position = this.position + 7;
        return num;
    },
    readBytes : function(num) {
        var result = [];
        for (var i = 0; i < num; i++) {
            result[i] = this.readByte();
        }
        
        return result;
    },
    readFixed : function() {
        var val = this.readInt32() / 65536.0;
        return Math.ceil(val * 100000) / 100000;
    },
    readLongDateTime : function() {
        // 1970.1.1 - 1904.1.1
        var delta = -2080198800000;// (new Date(1904, 1, 1)).getTime();
        var date = new Date();
        this.position = this.position + 4;
        date.setTime(this.readUint32());
        return date;
    },
    getFixed : function(byteOffset) {
        var temp = this.position;
        this.position = byteOffset;
        var result = this.readFixed();
        this.position = temp;
        return result;
    },
    getLongDateTime : function(byteOffset) {
        var temp = this.position;
        this.position = byteOffset;
        var result = readLongDateTime();
        this.position = temp;
        return result;
    }
};
// src/keyboard.js
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
// src/level.js
function Level() {
}

Level.create = function() {
    var level = new Level();
    level.objects = [];
    return level;
}

Level.prototype.init = function() {
    var json = this.json;
    for(var i = 0; i < json.items.length; i++) {
        var item = json.items[i];
        
        IUIU.Module.load(item.fileName, function (sender) {
            var json2 = sender.data;
            var content = sender.src;
            
            var obj = null;
            for(var x = 0; x < content.objects.length; x++) {
                var obj2 = content.objects[x];
                if(obj2.name == item.name) {
                    obj = obj2;
                }
            }
                        
            if(obj != null) {
                try {
                    Common.copy(obj, IUIU.Component.create(json2.header), false);
                }
                catch(ex) {
                    //obj = createErrorObject();
                }
                
                obj.fileName = json2.fileName;
                obj.header = json2.header;
                
                for (var property in json2) {
                    var value = json2[property];
                    var type = typeof value;
                    if (obj[property] && (type == "number" || type == "boolean" || type == "string")) {
                        obj[property] = json2[property];
                    }
                }
                
                content.objects.push(obj);
            }

        }, { data : item, src : level });
    }
    
    delete this.json;
}

Level.fromJson = function(json, params, entry) {
    var level = entry;
    
    for(var i = 0; i < json.items.length; i++) {
        level.objects.push({ name : json.items[i].name });
    }
    
    level.json = json;
        
    for(var i = 0; i < json.trigger.length; i++) {
        Trigger.load(level, json.trigger[i]);
    }

    return level;
}
// src/loader.js
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

function PackageLoader(loader) {
    this.loader = loader;
}
PackageLoader.prototype = {
    responseType : 'arraybuffer',
    load : function(buffer, params) {
        if(buffer) {
            var content = {};
            var dataView = new DataView(buffer);
            var originalBuffer = readHeader(content, dataView);
            
            // ��ѹ���ļ�
            if(content.flags == 1) {
                var compressed = new Uint8Array(buffer, originalBuffer.position, originalBuffer.length);
                var decompressed = lz4.decompress(compressed)
                var arrayBuffer = new ArrayBuffer(decompressed.length);
                for(var i = 0; i < decompressed.length; i++) {
                    arrayBuffer[i] = decompressed[i];
                }
                
                originalBuffer = new BinaryReader(new DataView(arrayBuffer), 0, arrayBuffer.length);
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

        if(r != 'm' || e != 'r' || s != 'f') {
            throw '������Ч���ļ�';
        }

        // ��ȡƽ̨
        var platform = br.readByte();
        
        // ��ȡ�ļ���ʽ
        var format = br.readByte();
        
        // ��ȡflags
        var flags = br.readByte();
        
        // ��ȡ���ݴ�С
        var contentSize = br.readInt32();

        // Ԥ������
        var holdSize = br.readInt32();

        content.platform = platform;
        content.format = format;
        content.flags = flags;
        content.contentSize = contentSize;

        // ����ѹ�����ݴ�С
        return new BinaryReader(buffer, br.position, content.contentSize);
    },
    readContent : function(content, buffer) {
        var header = {};
        header.name = buffer.readString();
        header.version = {};
        header.version.major = buffer.readInt32();
        header.version.minor = buffer.readInt32();
        header.version.build = buffer.readInt32();
        header.version.revision = buffer.readInt32();
        
        var iconData = buffer.readString();
        var description = buffer.readString();
        var references = [];
        var files = [];
        
        var count = buffer.readInt32();
        for(var i = 0; i < count; i++) {
            var header2 = {};
            header2.name = buffer.readString();
            header2.version = {};
            header2.version.major = buffer.readInt32();
            header2.version.minor = buffer.readInt32();
            header2.version.build = buffer.readInt32();
            header2.version.revision = buffer.readInt32();
            
            references.push({ header : header2 });
        }
        
        count = buffer.readInt32();
        for(var i = 0; i < count;i ++) {
            var inculde = buffer.readString();
            var data = buffer.readString();
            files.push({ inculde : inculde, data : data });
        }
        
        content.header = header;
        //content.description = description;
        //content.
        content.files = files;
        content.references = reference;
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

function ObjectLoader(loader) {
    this.loader = loader;
}
ObjectLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return IObject.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return IObject.create();
    }
}

function TilesLoader(loader) {
    this.loader = loader;
}
TilesLoader.prototype = {
    responseType : 'text',
    load : function(buffer, params, entry) {
        var jsonObj = JSON.parse(buffer);
        return Tile.fromJson(jsonObj, params, entry);
    },
    create : function() {
        return Tile.create();
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
    this.addMode('pak', new PackageLoader(this));
    this.addMode('ini', new IniLoader(this));
    this.addMode('json', new JsonLoader(this));
    this.addMode("obj", new ObjectLoader(this));
    this.addMode("img", new TilesLoader(this));
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

// src/main.js
var gl;

var IUIU = {
    /**
    * ��������
    * @param     {Canvas}            canvas      ��ѡ�еĻ��������Ϊnull���½�һ������
    * @param     {object}            options     ����webglʱ���õ��Ĳ���ѡ��
    * @return    GraphiceDevice
    * @date      2019-9-4
    * @author    KumaWang
    */
    create: function(canvas, options) {
        options = options || {};
        var canvas2 = canvas || document.createElement('canvas');
        if(!canvas) canvas2.width = 800;
        if(!canvas) canvas2.height = 600;
        if (!('alpha' in options)) options.alpha = false;
        try { gl = canvas2.getContext('webgl', options); } catch (e) {}
        try { gl = gl || canvas2.getContext('experimental-webgl', options); } catch (e) {}
        if (!gl) throw new Error('WebGL not supported');
        //gl.HALF_FLOAT_OES = 0x8D61;
        addDisplayBatchMode();
        addOtherMethods();
        
        gl.defaultShader = new Shader('\
            uniform mat4 MatrixTransform;\
            varying vec4 diffuseColor;\
            varying vec4 diffuseTexCoord;\
            void main( )\
            {\
                gl_Position = MatrixTransform * gl_Vertex;\
                diffuseTexCoord = gl_TexCoord;\
                diffuseColor = gl_Color;\
            }\
            ', '\
            uniform sampler2D Texture;\
            varying vec4 diffuseColor;\
            varying vec4 diffuseTexCoord;\
            void main( )\
            {\
                gl_FragColor = texture2D(Texture, diffuseTexCoord.xy) * diffuseColor;\
            }\
            '
            );
        
        return gl;
    },
    
    //Matrix: Matrix,
    //Indexer: Indexer,
    //Buffer: Buffer,
    //Mesh: Mesh,
    //HitTest: HitTest,
    //Raytracer: Raytracer,
    /**
    * Shader
    */
    Shader: Shader,
    /**
    * ����
    */ 
    Texture: Texture,
    /**
    * ����
    */
    Vector: Vector,
    /**
    * ��ɫ
    */
    Color: Color,
    //Level : Level,
    
    /**
    * ��Դ������
    */
    Loader: new Loader(),
    /**
    * ��������һ����IDE���й���
    */
    Trigger : Trigger,
    /**
    * �����������һ����IDE���й���
    */
    // Component : new Component(),
    /**
    * ģ���������һ����IDE���й���
    */
    Module : Module
};

function addDisplayBatchMode() {
    var displayBatchMode = {
        steps : [],
        stepIndex : 0,
        mesh : new Mesh({ coords: true, colors: true, triangles: true }),
        blendState : 'none',
        hasBegun: false,
        hasClip : false,
        clipRect : null,
        transformMatrix: Matrix.identity(),
        mapShader : new Shader('\
            uniform mat4 MatrixTransform;\
            varying vec4 diffuseColor;\
            varying vec4 diffuseTexCoord;\
            varying vec2 TilePostion;\
            void main( )\
            {\
                gl_Position = MatrixTransform * gl_Vertex;\
                TilePostion = (gl_Vertex).xy;\
                diffuseTexCoord = gl_TexCoord;\
                diffuseColor = gl_Color;\
            }\
            ', '\
            uniform sampler2D Texture;\
            varying vec4 diffuseColor;\
            varying vec4 diffuseTexCoord;\
            varying vec2 TilePostion;\
            uniform vec2 TileOffset;\
            uniform vec2 TileSize;\
            uniform vec2 TileUvOffset;\
            uniform vec2 TileUvSize;\
            void main( )\
            {\
                vec2 uv = TileUvOffset + fract((TilePostion - TileOffset) / TileSize) * TileUvSize;\
                uv.y = 1.0 - uv.y;\
                gl_FragColor = texture2D(Texture, uv) * diffuseColor;\
            }\
            '
            )
    };
    
    Object.defineProperty(gl, 'camera', { get: function() { return displayBatchMode.camera; } });
    
    var systemClearFunc = gl.clear; 
    gl.clear = function(color) {    
        systemClearFunc.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(color.r, color.g, color.b, color.a);
    }
    
    /**
    * ֪ͨ��Ⱦ����ʼ�������ÿ�λ���ǰ�������
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.begin = function(blendState, transform, shader) {
        displayBatchMode.hasBegun = true;
        displayBatchMode.blendState = blendState || 'none';
        gl.camera = gl.camera || transform;
        gl.blendState = gl.blendState || blendState;
  
        // project matrix
        if (displayBatchMode.cachedTransformMatrix == null || 
            gl.drawingBufferWidth != displayBatchMode.viewportWidth ||
            gl.drawingBufferHeight != displayBatchMode.viewportHeight) {
            
            displayBatchMode.viewportWidth = gl.drawingBufferWidth;
            displayBatchMode.viewportHeight = gl.drawingBufferHeight;
            displayBatchMode.cachedTransformMatrix = new Matrix();
            var m = displayBatchMode.cachedTransformMatrix.m;
            m[0] = 2 * (displayBatchMode.viewportWidth > 0 ? 1 / displayBatchMode.viewportWidth : 0);
            m[5] = 2 * (displayBatchMode.viewportHeight > 0 ? -1 / displayBatchMode.viewportHeight : 0);
            m[10] = 1;
            m[15] = 1;
            m[12] = -1;
            m[13] = 1;
            
            displayBatchMode.cachedTransformMatrix.m[12] -= displayBatchMode.cachedTransformMatrix.m[0];
            displayBatchMode.cachedTransformMatrix.m[13] -= displayBatchMode.cachedTransformMatrix.m[5];
        }
        
        displayBatchMode.shader = shader || gl.defaultShader;
        transform = transform || { location : Vector.zero, scale : 1, origin : Vector.zero, angle : 0 };
        var location = transform.location || Vector.zero;
        var angle = transform.angle / 180 * Math.PI || 0;
        var origin = transform.origin || Vector.zero;
        var scale = transform.scale || 1;
        
        var transformMatrix = Matrix.identity();
        transformMatrix = Matrix.multiply2(transformMatrix, Matrix.translate2(location.x, location.y, 0));
        transformMatrix = Matrix.multiply(transformMatrix, Matrix.rotateZ(angle));
        transformMatrix = Matrix.multiply2(transformMatrix, Matrix.translate2(origin.x, origin.y, 0));
        transformMatrix = Matrix.multiply2(transformMatrix, Matrix.scale(scale, scale, scale));
        displayBatchMode.transformMatrix = transformMatrix;
        
        var uniformsMatrix = Matrix.multiply2(displayBatchMode.transformMatrix, displayBatchMode.cachedTransformMatrix);
        displayBatchMode.shader.uniforms({ MatrixTransform: uniformsMatrix });
        
        if(gl.enableHitTest) {
            gl.bindHitTestContext(displayBatchMode.steps);
        }
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    };
    
    /**
    * ��Ⱦ����
    * @param   {IUIU.Level}        level   ��Ⱦ�ĳ���
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.level = function(level) {
        for(var i = 0; i < level.objects.length; i++) {
            var obj = level.objects[i];
            if(obj.paint) {
                obj.paint(gl);
            }
        }
    };
    
    /**
    * ��Ⱦ����
    * @param   {IUIU.IObject}      obj         ��Ⱦ������
    * @param   {int}               frame       ����Ⱦ��֡��
    * @param   {IUIU.Vector}       point       ��Ⱦ������
    * @param   {IUIU.Vector}       scale       ��Ⱦʱ���õ�����ֵ
    * @param   {IUIU.Vector}       origin      ��Ⱦʱ���õ���תê��
    * @param   {int}               angle       ��Ⱦʱ���õ���תֵ
    * @param   {IUIU.Color}        color       ��Ⱦʱ���õ���ɫ����
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.object = function(obj, frame, point, scale, origin, angle, color) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        for(var index = 0; index < obj.items.length; index++) {
            var item = obj.items[index];
            switch(item.type) {
              case "spline":
                gl.spline(item, frame, point, scale, origin, angle, color);
                break;
              case "mesh":
                gl.mesh(item, frame, point, scale, origin, angle, color);
                break;
              case "text":
                var state = item.getRealState(frame);
                if(state != null) {
                    point = point || IUIU.Vector.zero;
                    scale = scale || IUIU.Vector.one;
                    origin = origin || IUIU.Vector.zero;
                    angle = angle || 0;
                    color = color || IUIU.Color.white;
                    
                    point = { x: point.x + state.x, y: point.y + state.y };
                    scale = { x: scale.x * state.scaleX, y: scale.y * state.scaleY };
                    origin = { x: origin.x + state.originX, y: origin.y + state.originY };
                    angle = (state.angle + angle) % 360;
                    color = { r : state.r * color.r, g : state.g * color.g, b : state.b * color.b, a : state.a * color.a };
                    
                    gl.text(item.font, item.text, item.size, point, scale, origin, angle, color);
                }
                break;
              case "collide":
                
                break;
              default:
                throw "not yet support";
            }
        }
    };
    
    /**
    * ��Ⱦ����
    * @param   {IUIU.IObject}      obj         ��Ⱦ�ĵ���
    * @param   {int}               frame       ����Ⱦ��֡��
    * @param   {IUIU.Vector}       point       ��Ⱦ������
    * @param   {IUIU.Vector}       scale       ��Ⱦʱ���õ�����ֵ
    * @param   {IUIU.Vector}       origin      ��Ⱦʱ���õ���תê��
    * @param   {int}               angle       ��Ⱦʱ���õ���תֵ
    * @param   {IUIU.Color}        color       ��Ⱦʱ���õ���ɫ����
    * @date    2019-10-14
    * @author  KumaWang
    */
    gl.spline = function(obj, frame, point, scale, origin, angle, color) {
        var state = obj.getRealState(frame);
        if(state == null) return;
        
        point = point || IUIU.Vector.zero;
        scale = scale || IUIU.Vector.one;
        origin = origin || IUIU.Vector.zero;
        angle = angle || 0;
        color = color || IUIU.Color.white;
        
        point = { x: point.x + state.x, y: point.y + state.y };
        scale = { x: scale.x * state.scaleX, y: scale.y * state.scaleY };
        origin = { x: origin.x + state.originX, y: origin.y + state.originY };
        angle = (state.angle + angle) % 360;
        color = { r : state.r / 255 * color.r, g : state.g / 255 * color.g, b : state.b  / 255* color.b, a : state.a / 255 * color.a };
        
        if(obj.fill.texture) {
            gl.end();
            gl.begin(gl.blendState, gl.camera, displayBatchMode.mapShader);
            var states = obj.getFillDisplayStates(point, origin, scale, angle, color);
            if(states != null) {
                for(var x = 0; x < states.length; x++) {
                    gl.draw(states[x]);
                }
            }
            
            var endPoint = point; //MathTools.pointRotate(origin, point, angle);
            gl.end({
                TileOffset : [ endPoint.x, endPoint.y ],
                TileSize : [ obj.fill.texture.texture.image.width, obj.fill.texture.texture.image.height ],
                TileUvOffset : [ (obj.fill.texture.bounds.x - 1) / obj.fill.texture.texture.image.width, (obj.fill.texture.bounds.y - 1) / obj.fill.texture.texture.image.height ],
                TileUvSize : [ obj.fill.texture.bounds.width / obj.fill.texture.texture.image.width, obj.fill.texture.bounds.height / obj.fill.texture.texture.image.height ]
            });
            gl.begin();
        }
        
        states = obj.getEdgeDisplayStates(point, origin, scale, angle, color);
        if(states != null) {
            for(var x = 0; x < states.length; x++) {
                gl.draw(states[x]);
            }
        }
    };
    
    /**
    * ��Ⱦ����״̬
    * @param   {IUIU.ObjectState}      state       ����Ⱦ��״̬
    * @param   {IUIU.Vector}           point       ��Ⱦ������
    * @param   {IUIU.Vector}           scale       ��Ⱦʱ���õ�����ֵ
    * @param   {IUIU.Vector}           origin      ��Ⱦʱ���õ���תê��
    * @param   {int}                   angle       ��Ⱦʱ���õ���תֵ
    * @param   {IUIU.Color}            color       ��Ⱦʱ���õ���ɫ����
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.state = function(state, point, scale, origin, angle, color) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        //state.update(gl.elapsedTime);
        gl.object(state.object, state.frame, point, scale, origin, angle, color);
    };
    
    /**
    * ��Ⱦģ��
    * @param   {IUIU.Mesh}         mesh        ��Ⱦ��ģ��
    * @param   {int}               frame       ����Ⱦ��֡��
    * @param   {IUIU.Vector}       point       ��Ⱦ������
    * @param   {IUIU.Vector}       scale       ��Ⱦʱ���õ�����ֵ
    * @param   {IUIU.Vector}       origin      ��Ⱦʱ���õ���תê��
    * @param   {int}               angle       ��Ⱦʱ���õ���תֵ
    * @param   {IUIU.Color}        color       ��Ⱦʱ���õ���ɫ����
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.mesh = function(mesh, frame, point, scale, origin, angle, color) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        var state = mesh.getRealState(frame);
        if(mesh.brush.texture) {
            var img = mesh.brush.texture.image;
            if (img != null && state != null && mesh.triangles) {
                point = point || IUIU.Vector.zero;
                scale = scale || IUIU.Vector.one;
                origin = origin || IUIU.Vector.zero;
                angle = angle || 0;
                color = color || IUIU.Color.white;
                
                // �����ڲ����
                var offset = { x : state.x + point.x, y : state.y + point.y };
                color = { r : state.r * color.r, g : state.g * color.g, b : state.b * color.b, a : state.a * color.a };
                origin = { x : offset.x + state.originX + origin.x, y : offset.y + state.originY + origin.y };
                angle = (state.angle + angle) % 360;
                scale = { x : state.scaleX * scale.x, y : state.scaleY * scale.y };
                var size = { x : img.width, y : img.height };
                
                for (var i = 0; i < mesh.triangles.length; i++)
                {
                    var triangle = mesh.triangles[i];
                    var p1 = triangle.p1.tracker.getPostion(frame);
                    var p2 = triangle.p2.tracker.getPostion(frame);
                    var p3 = triangle.p3.tracker.getPostion(frame);
                    
                    var point1 = { x : p1.x * scale.x + offset.x, y : p1.y * scale.y + offset.y };
                    var point2 = { x : p2.x * scale.x + offset.x, y : p2.y * scale.y + offset.y };
                    var point3 = { x : p3.x * scale.x + offset.x, y : p3.y * scale.y + offset.y };
                    
                    var point21 = MathTools.pointRotate(origin, point1, angle);
                    var point22 = MathTools.pointRotate(origin, point2, angle);
                    var point23 = MathTools.pointRotate(origin, point3, angle);
                    
                    var uv1 = triangle.p1.uv;
                    var uv2 = triangle.p2.uv;
                    var uv3 = triangle.p3.uv;
                    
                    gl.draw({
                        texture : mesh.brush.texture.image,
                        p1 : [ point21.x, point21.y ],
                        p2 : [ point22.x, point22.y ],
                        p3 : [ point23.x, point23.y ],
                        uv1: [ uv1.x, 1 - uv1.y ],
                        uv2: [ uv2.x, 1 - uv2.y ],
                        uv3: [ uv3.x, 1 - uv3.y ],
                        color: [ color.r / 255, color.g / 255, color.b / 255, color.a / 255 ]
                    });
                }
            }
        }
    };
    
    /**
    * ��ȾͼƬ
    * @param   {IUIU.Bitmap}       img         ��Ⱦ��λͼ
    * @param   {string}            name        ����Ⱦ����Ƭ��
    * @param   {IUIU.Vector}       point       ��Ⱦ������
    * @param   {IUIU.Vector}       scale       ��Ⱦʱ���õ�����ֵ
    * @param   {IUIU.Vector}       origin      ��Ⱦʱ���õ���תê��
    * @param   {int}               angle       ��Ⱦʱ���õ���תֵ
    * @param   {IUIU.Color}        color       ��Ⱦʱ���õ���ɫ����
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.image = function(img, name, point, scale, origin, angle, color) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        if(!img.isLoaded) return;
        if(!img.triangles[name]) img.triangulate(name);
        var triangles = img.triangles[name];
        if(!triangles) return;
        
        point = point || IUIU.Vector.zero;
        scale = scale || IUIU.Vector.one;
        origin = origin || IUIU.Vector.zero;
        angle = angle || 0;
        color = color || IUIU.Color.white;
        
        var size = { x : img.width, y : img.height };
        
        for (var i = 0; i < triangles.length; i++) {
            var triangle = triangles[i];
            var p1 = triangle.p1.tracker.getPostion(0);
            var p2 = triangle.p2.tracker.getPostion(0);
            var p3 = triangle.p3.tracker.getPostion(0);
            
            var point1 = { x : p1.x * scale.x + point.x, y : p1.y * scale.y + point.y };
            var point2 = { x : p2.x * scale.x + point.x, y : p2.y * scale.y + point.y };
            var point3 = { x : p3.x * scale.x + point.x, y : p3.y * scale.y + point.y };
            
            var point21 = MathTools.pointRotate(origin, point1, angle);
            var point22 = MathTools.pointRotate(origin, point2, angle);
            var point23 = MathTools.pointRotate(origin, point3, angle);
            
            var uv1 = triangle.p1.uv;
            var uv2 = triangle.p2.uv;
            var uv3 = triangle.p3.uv;
            
            gl.draw({
                texture : img.image,
                p1 : [ point21.x, point21.y ],
                p2 : [ point22.x, point22.y ],
                p3 : [ point23.x, point23.y ],
                uv1: [ uv1.x, 1 - uv1.y ],
                uv2: [ uv2.x, 1 - uv2.y ],
                uv3: [ uv3.x, 1 - uv3.y ],
                color: [ color.r, color.g, color.b, color.a ]
            });
        }
    };
    
    /**
    * ��ȾͼƬ
    * @param   {IUIU.Texture}      img             ��Ⱦ�Ĳ���
    * @param   {IUIU.Vector}       point           ��Ⱦ������
    * @param   {IUIU.Vector}       scale           ��Ⱦʱ���õ�����ֵ
    * @param   {IUIU.Vector}       origin          ��Ⱦʱ���õ���תê��
    * @param   {int}               angle           ��Ⱦʱ���õ���תֵ
    * @param   {IUIU.Color}        color           ��Ⱦʱ���õ���ɫ����
    * @param   {IUIU.Rect}         sourceRectangle ��Ⱦʱ��ȡ��ͼƬ����
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.texture = function(img, point, scale, origin, angle, color, sourceRectangle) {        
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        if (img == null)
            throw "texture";
        
        if(img.swapWith == null && !img.isLoaded) return;
        
        point = (point == undefined || point == null) ?  Vector.zero : point; 
        color = (color == undefined || color == null) ?  Color.white : color;
        origin = (origin == undefined || origin == null) ? Vector.zero : origin; 
        angle = (angle == undefined  || angle == null) ?  0 : angle; 
        scale = (scale == undefined || scale == null) ? Vector.one : scale; 
        sourceRectangle = (sourceRectangle == undefined || sourceRectangle == null) ?  { x : 0, y : 0, width : img.width, height : img.height } : sourceRectangle;
        
        var br = new Vector(point.x + (sourceRectangle.width * scale.x), point.y + (sourceRectangle.height * scale.y));
        
        var step1 = {};
        var step2 = {};
        
        var texture = img.swapWith == null ? img.image : img;
        step1.color   = [ color.r, color.g, color.b, color.a ];   
        step2.color   = [ color.r, color.g, color.b, color.a ];
        step1.texture = texture
        step2.texture = texture;
        
        if(sourceRectangle) {
            step1.uv1 = [ (sourceRectangle.x + 1) / texture.width, 1 - (sourceRectangle.y + 1) / texture.height ];
            step1.uv2 = [ (sourceRectangle.x + sourceRectangle.width - 1) / texture.width, 1 - (sourceRectangle.y + 1) / texture.height ];
            step1.uv3 = [ (sourceRectangle.x + 1) / texture.width, 1 - (sourceRectangle.y + sourceRectangle.height - 1) / texture.height ];
            
            step2.uv1 = [ (sourceRectangle.x + sourceRectangle.width - 1) / texture.width, 1 - (sourceRectangle.y + 1) / texture.height ];
            step2.uv2 = [ (sourceRectangle.x + sourceRectangle.width - 1) / texture.width, 1 - (sourceRectangle.y + sourceRectangle.height - 1) / texture.height ];
            step2.uv3 = [ (sourceRectangle.x + 1) / texture.width, 1 - (sourceRectangle.y + sourceRectangle.height - 1) / texture.height ];
            
        } else {
            step1.uv1 = [ 0, 0 ];
            step1.uv2 = [ 1, 0 ];
            step1.uv3 = [ 0, 1 ];
            
            step2.uv1 = [ 1, 0 ];
            step2.uv2 = [ 1, 1 ];
            step2.uv3 = [ 0, 1 ];
        }
        
        var v11 = MathTools.pointRotate(origin, { x : point.x, y : point.y }, angle);
        var v12 = MathTools.pointRotate(origin, { x : br.x, y : point.y }, angle);
        var v13 = MathTools.pointRotate(origin, { x : point.x, y : br.y }, angle);
        
        var v21 = MathTools.pointRotate(origin, { x : br.x, y : point.y }, angle);
        var v22 = MathTools.pointRotate(origin, { x : br.x, y : br.y }, angle);
        var v23 = MathTools.pointRotate(origin, { x : point.x, y : br.y }, angle);
        
        step1.p1 = [ v11.x, v11.y ];
        step1.p2 = [ v12.x, v12.y ];
        step1.p3 = [ v13.x, v13.y ];
        
        step2.p1 = [ v21.x, v21.y ];
        step2.p2 = [ v22.x, v22.y ];
        step2.p3 = [ v23.x, v23.y ];
        
        gl.draw(step1);
        gl.draw(step2);
    };
    
    /**
    * ��Ⱦ����
    * @param   {IUIU.Font}         font            ��Ⱦ�Ĳ��õ�����
    * @param   {string}            text            ����Ⱦ������
    * @param   {IUIU.Vector}       point           ��Ⱦ������
    * @param   {IUIU.Vector}       scale           ��Ⱦʱ���õ�����ֵ
    * @param   {IUIU.Vector}       origin          ��Ⱦʱ���õ���תê��
    * @param   {int}               angle           ��Ⱦʱ���õ���תֵ
    * @param   {IUIU.Color}        color           ��Ⱦʱ���õ���ɫ����
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.text = function(font, text, size, point, scale, origin, angle, color) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        if(!font.isLoaded) return;
        
        point = point || IUIU.Vector.zero;
        scale = scale || IUIU.Vector.one;
        origin = origin || IUIU.Vector.zero;
        angle = angle || 0;
        color = color || IUIU.Color.white;
        
        var fontScale = size / 1000;
        var xOffset = 0;
        for(var i = 0; i < text.length; i++) {
            var c = text[i];
            var info = font[c];
            
            if(info) {
                for(var x = 0; x < info.vertices.length; x = x + 3) {
                    var p1 = { x : info.vertices[x].x * fontScale * scale.x + point.x + xOffset, y : info.vertices[x].y * fontScale * scale.y + point.y };
                    var p2 = { x : info.vertices[x + 1].x * fontScale * scale.x + point.x + xOffset, y : info.vertices[x + 1].y * fontScale * scale.y + point.y };
                    var p3 = { x : info.vertices[x + 2].x * fontScale * scale.x + point.x + xOffset, y : info.vertices[x + 2].y * fontScale * scale.y + point.y };
                    
                    p1 = MathTools.pointRotate(origin, p1, angle);
                    p2 = MathTools.pointRotate(origin, p2, angle);
                    p3 = MathTools.pointRotate(origin, p3, angle);
                    
                    gl.draw({
                        p1 : [ p1.x, p1.y ],
                        p2 : [ p2.x, p2.y ],
                        p3 : [ p3.x, p3.y ],
                        uv1 : [ 0, 0 ],
                        uv2 : [ 0, 1 ],
                        uv3 : [ 1, 1 ],
                        color: [ color.r, color.g, color.b, color.a ],
                        texture : IUIU.Texture.getPixel()
                    });
                }
                
                xOffset = xOffset + info.size.width * fontScale * scale.x + 1;
            }
            else {
                xOffset = xOffset + (size / 2) * scale.x + 1;
            }
        }
    };
    
    /**
    * ��Ⱦֱ��
    * @param   {IUIU.Vector}       start           ��ʼ����
    * @param   {IUIU.Vector}       end             ��������
    * @param   {IUIU.Color}        color           ��Ⱦʱ���õ���ɫ����
    * @param   {int}               thickness       �ߴ�ϸ
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.line = function(start, end, color, thickness) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        var length = MathTools.getDistance(start, end);
        var angle = MathTools.getAngle(start, end);
        
        var v1 = new Vector(start.x, start.y);
        var v2 = new Vector(start.x + thickness, start.y);
        var v3 = new Vector(start.x + thickness, start.y - length);
        var v4 = new Vector(start.x, start.y - length);
        
        angle = angle % 360;
        v2 = MathTools.pointRotate(v1, v2, angle);
        v3 = MathTools.pointRotate(v1, v3, angle);
        v4 = MathTools.pointRotate(v1, v4, angle);
        
        gl.draw({
            texture : IUIU.Texture.getPixel(),
            color: [ color.r, color.g, color.b, color.a ],
            p1 : [ v1.x, v1.y ],
            p2 : [ v2.x, v2.y ],
            p3 : [ v3.x, v3.y ],
            uv1 : [ 0, 0 ],
            uv2 : [ 1, 0 ],
            uv3 : [ 1, 1 ]
        });
        
        gl.draw({
            texture : IUIU.Texture.getPixel(),
            color: [ color.r, color.g, color.b, color.a ],
            p1 : [ v1.x, v1.y ],
            p2 : [ v3.x, v3.y ],
            p3 : [ v4.x, v4.y ],
            uv1 : [ 0, 0 ],
            uv2 : [ 1, 1 ],
            uv3 : [ 0, 1 ]
        });
    };
    
    /**
    * ��Ⱦ����
    * @param   {IUIU.Vector}       lower           ��ʼ����
    * @param   {IUIU.Vector}       upper           ��������
    * @param   {IUIU.Color}        color           ��Ⱦʱ���õ���ɫ����
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.rect = function(lower, upper, color) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
        
        gl.draw({
            texture : IUIU.Texture.getPixel(),
            color: [ color.r, color.g, color.b, color.a ],
            p1 : [ lower.x, lower.y ],
            p2 : [ upper.x, lower.y ],
            p3 : [ lower.x, upper.y ],
            uv1 : [ 0, 0 ],
            uv2 : [ 1, 0 ],
            uv3 : [ 1, 1 ]
        });
        
        gl.draw({
            texture : IUIU.Texture.getPixel(),
            color: [ color.r, color.g, color.b, color.a ],
            p1 : [ upper.x, lower.y ],
            p2 : [ upper.x, upper.y ],
            p3 : [ lower.x, upper.y ],
            uv1 : [ 0, 0 ],
            uv2 : [ 1, 0 ],
            uv3 : [ 1, 1 ]
        });
        
    };
    
    gl.ellipse = function(lower, upper) {
        if (displayBatchMode.hasBegun == false)
            throw "begin() must be called before draw()";
    };
    
    gl.draw = function(state) {
        displayBatchMode.steps[displayBatchMode.stepIndex++] = state;
    };
    
    gl.flush = function(offset, count) {
        if(count > 0) {
            displayBatchMode.mesh.vertices = [];
            displayBatchMode.mesh.colors = [];
            displayBatchMode.mesh.coords = [];
            displayBatchMode.mesh.triangles = [];
            for(var i = 0; i < count; i++) {
                var step = displayBatchMode.steps[i + offset];
                
                // corners
                displayBatchMode.mesh.vertices.push(step.p1);
                displayBatchMode.mesh.vertices.push(step.p2);
                displayBatchMode.mesh.vertices.push(step.p3);
                
                // colors
                displayBatchMode.mesh.colors.push(step.color);
                displayBatchMode.mesh.colors.push(step.color);
                displayBatchMode.mesh.colors.push(step.color);
                
                // coords
                displayBatchMode.mesh.coords.push(step.uv1);
                displayBatchMode.mesh.coords.push(step.uv2);
                displayBatchMode.mesh.coords.push(step.uv3);
                
                // triangles
                displayBatchMode.mesh.triangles.push([i * 3, i * 3 + 1, i * 3 + 2]);
            }
            
            displayBatchMode.mesh.compile();
            displayBatchMode.steps[offset].texture.bind(0);
            displayBatchMode.shader.uniforms({
                Texture : 0
            }).draw(displayBatchMode.mesh);
            displayBatchMode.steps[offset].texture.unbind(0);
        }
    };
    
    /**
    * ֪ͨ��Ⱦ�����������������
    * @date    2019-9-4
    * @author  KumaWang
    */
    gl.end = function(uniforms) {
        if(uniforms != null) {
            displayBatchMode.shader.uniforms(uniforms);
        }
        var maxLenght = displayBatchMode.stepIndex;
        var endLenght = maxLenght - 1;
        // fist hit test
        if(gl.enableHitTest) {
            for(var i = 0; i < maxLenght; i++) {
                gl.innerHitTest(displayBatchMode.steps[i], i);
            }
        }
        
        // sec render any step
        var currentDrawnIndex = 0;
        for(var i = 0; i < maxLenght; i++) {
            var step = displayBatchMode.steps[i];
            if(i == endLenght) {
                gl.flush(currentDrawnIndex, i - currentDrawnIndex + 1);
            }
            else {
                var nextstep = displayBatchMode.steps[i + 1];
                if(step.texture != nextstep.texture) {
                    lastTexture = step.texture;
                    gl.flush(currentDrawnIndex, i + 1 - currentDrawnIndex);
                    currentDrawnIndex = i + 1;
                }
            }
        }
        
        displayBatchMode.stepIndex = 0;
        displayBatchMode.hasBegun = false;
    };
    
    gl.clip = function(x, y, width, height) {
        displayBatchMode.hasClip = true;
        displayBatchMode.clipArea = {
            x : x,
            y : y,
            width : width,
            height : height
        };
    };
    
    gl.endClip = function() {
        displayBatchMode.hasClip = false;
    };
}

function addOtherMethods() {    
    /**
    * ����ѭ��
    * @param     {int}           interval        ÿ֡��������룩
    * @date      2019-9-4
    * @author    KumaWang
    */
    gl.loop = function(interval) {
        interval = interval || 60;  
        
        var post =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function(callback) { setTimeout(callback, 1000 / interval); };
        var time = new Date().getTime();
        var context = gl;
        function update() {
            gl = context;
            var now = new Date().getTime();
            pointer.update();
            hotkeys.update();
            gl.elapsedTime = now - time;
            if (gl.onupdate) gl.onupdate(gl.elapsedTime);
            if (gl.ondraw) gl.ondraw();
            post(update);
            time = now;
        }
        update();
    };
    
    /**
    * ������ȫ����
    * @date      2019-9-4
    * @author    KumaWang
    */
    gl.fullscreen = function(options) {
        options = options || {};
        var top = options.paddingTop || 0;
        var left = options.paddingLeft || 0;
        var right = options.paddingRight || 0;
        var bottom = options.paddingBottom || 0;
        if (!document.body) {
            throw new Error('document.body doesn\'t exist yet (call gl.fullscreen() from ' +
                'window.onload() or from inside the <body> tag)');
        }
        document.body.appendChild(gl.canvas);
        document.body.style.overflow = 'hidden';
        gl.canvas.style.position = 'absolute';
        gl.canvas.style.left = left + 'px';
        gl.canvas.style.top = top + 'px';
        function resize() {
            gl.canvas.width = window.innerWidth - left - right;
            gl.canvas.height = window.innerHeight - top - bottom;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            if (gl.ondraw) gl.ondraw();
        }
        
        window.addEventListener('resize', resize);
        resize();
    };
    
    (function(context) {
        gl.makeCurrent = function() {
            gl = context;
        };
    })(gl);
}

var ENUM = 0x12340000;

// src/map.js
function Map() {
    
}
 
Map.prototype.update = function(gl, inv) {
    for(var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];        
        if(obj.type == "object") {
            if(!this.states[obj]) {
                this.states[obj] = obj.newState();
            }
            
            this.states[obj].update(inv);
            gl.state(this.states[obj], obj.location, obj.scale, obj.origin, obj.angle, obj.color);
        }
        else {
            if(obj.update) obj.update(inv);
        }
    }
}

Map.prototype.test = function(obj2, x, y) {
    var collisions = [];
    for(var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];
        if(obj2 == obj) continue;
        
        for(x = 0; x < obj.body.parts.length; x++) {
            for(var y = 0; y < obj2.body.parts.length; y++) {
                var part = obj2.body.parts[y];
                for(var l = 0; l < part.vertices.length; l++) {
                    var curr = part.vertices[l];
                    var next = part.vertices[l == part.vertices.length - 1 ? 0 : l + 1];
                    
                    curr = { x : curr.x * obj2.scale.x, y : curr.y * obj2.scale.y };
                    next = { x : next.x * obj2.scale.x, y : next.y * obj2.scale.y };
                    
                    curr = MathTools.pointRotate(obj2.origin, curr, obj2.angle) + obj2.location;
                    next = MathTools.pointRotate(obj2.origin, next, obj2.angle) + obj2.location;
                    
                    if(MathTools.collideLinePoly(curr.x, curr.y, next.x, next.y, obj.body.parts[x])) {
                        collisions.push({ bodyA : obj, bodyB : obj2, partA : obj.body.parts[x], partB : obj2.body.parts[y] });
                        
                        break;
                    }
                
                }
            }
        }
    }
    
    return collisions.length > 0 ? collisions : false;
}

Map.create = function() {
    var map = new Map();
    map.objects  = [];
    map.triggers = [];
    map.states = {};
    return map;
}

Map.fromJson = function(json, params, entry) {
    var map = entry;
    
    for(var x = 0; x < json.items.length; x++) {
        var itemJson = json.items[x];
        var obj = null;
        switch(itemJson.type) {
          case "object":
            obj = IUIU.Loader.load(itemJson.inculde);
            break;
          case "image":
            obj = Tile.fromName(itemJson.inculde);
            break;
          case "text":
            obj = IUIU.Loader.load(itemJson.inculde);
            obj.text = itemJson.text;
            obj.size = parseFloat(itemJson.size);
            break;
        }
        
        if(obj != null) {
            obj.type = itemJson.type;
            var locationStr = itemJson.location.split(',');
            var scaleStr = itemJson.scale.split(',');
            var originStr = itemJson.origin.split(',');
            var colorStr = itemJson.color.split(',');
            
            obj.location = { x : parseFloat(locationStr[0]), y : parseFloat(locationStr[1]) };
            obj.scale    = { x : parseFloat(scaleStr[0]), y : parseFloat(scaleStr[1]) };
            obj.origin   = { x : parseFloat(originStr[0]), y : parseFloat(originStr[1]) };
            obj.angle    = parseFloat(itemJson.angle);
            obj.color    = { 
                r : parseFloat(colorStr[0]) / 255,
                g : parseFloat(colorStr[1]) / 255,
                b : parseFloat(colorStr[2]) / 255,
                a : parseFloat(colorStr[3]) / 255
            };
            
            map.objects.push(obj);
        }
    }
    
    return map;
}
// src/math.js
function MathTools() {
}

MathTools.pointRotate = function(center, p1, angle) {
    var tmp = {};
    var angleHude = -angle * Math.PI / 180;/*�Ƕȱ�ɻ���*/
    var x1 = (p1.x - center.x) * Math.cos(angleHude) + (p1.y - center.y) * Math.sin(angleHude) + center.x;
    var y1 = -(p1.x - center.x) * Math.sin(angleHude) + (p1.y - center.y) * Math.cos(angleHude) + center.y;
    tmp.x = x1;
    tmp.y = y1;
    return tmp;
}

MathTools.getDistance = function(p1, p2) {
    var a = p1.x - p2.x;
    var b = p1.y - p2.y;
    var distance = Math.sqrt(a * a + b * b);
    return distance;
}

MathTools.getExtendPoint = function(p1, p2, length) {
    var rotation = MathTools.getAngle(p1, p2);
    var target = MathTools.pointRotate(p1, { x : p1.x, y : p1.y - length }, rotation);
    return target;
}

MathTools.getAngle = function(p1, p2) {
    var xDiff = p2.x - p1.x;
    var yDiff = p2.y - p1.y;

    if (xDiff == 0 && yDiff == 0) return 0;

    var angle = Math.atan2(xDiff, yDiff) * 180 / Math.PI;
    return ((180 - angle) % 360);
}

MathTools.maskPolygon = function(polygon, mask) {
    var v = new [];
    var intersectPoints = MathTools.intersectionPolygons(mask, polygon);
    if (intersectPoints.length % 2 == 0 && intersectPoints.length > 0) {
        for (var c = 0; c < polygon.length; c++) {
            for (var k = intersectPoints.length - 2; k >= 0; k = k - 2) {
                var start = intersectPoints[k];
                var end = intersectPoints[k + 1];

                if (start.reverse) {
                    if (c == start.index) {
                        v.push(end.point);
                    }

                    if (c > start.index && c < end.index + 1) {
                        v.push(polygon[c]);
                    }

                    if (c == start.index) {
                        v.push(start.point);
                    }
                }
                else {
                    if (c > start.index && c < end.index + 1) {
                    }
                    else {
                        v.push(polygon[c]);
                    }

                    if (c == start.index) {
                        v.push(start.point);
                        v.push(end.point);
                    }
                }
            }
        }
    }
    
    return v;
}

MathTools.intersectionPolygons = function(v1, v2) {
    var result = [];
    var temp = false;
    
    for(var i = 0; i < v2.length; i++) {
        var curr = v2[i];
        var next = v2[i == v2.length - 1 ? 0 : 1 ];
        
        var clipPoints = MathTools.clipLineWithPolygon(curr, next, v1);
        for(var x = 0; x < clipPoints.length; i++) {
            result.push({
                index : i,
                point : clipPoints[x].point,
                outside : clipPoints[x].outsdie
            });
        }
    }
    
    return result;
}

MathTools.clipLineWithPolygon = function(point1, point2, polygon_points) {
    // Make lists to hold points of
    // intersection and their t values.
    var intersections = [];
    var t_values = [];

    // Add the segment's starting point.
    //intersections.Add(point1);
    //t_values.Add(0f);
    var starts_outside_polygon =
        !PointIsInPolygon(point1.x, point1.y,
            polygon_points.ToArray());

    // Examine the polygon's edges.
    for (var i1 = 0; i1 < polygon_points.length; i1++)
    {
        // Get the end points for this edge.
        var i2 = (i1 + 1) % polygon_points.length;

        // See where the edge intersects the segment.
        var result = MathTools.findIntersection(point1, point2, polygon_points[i1], polygon_points[i2]);
        
        var lines_intersect = result.lines_intersect, segments_intersect = result.segments_intersect;
        var intersection = result.intersection, close_p1 = result.close_p1, close_p2 = result.close_p2;
        var t1 = result.t1, t2 = result.t2;

        // See if the segment intersects the edge.
        if (segments_intersect)
        {
            // See if we need to record this intersection.

            // Record this intersection.
            intersections.push(intersection);
            t_values.push(t1);
        }
    }

    // Add the segment's ending point.
    //intersections.Add(point2);
    //t_values.Add(1f);

    // Sort the points of intersection by t value.
    var s_array = [];
    for(var i = 0; i < intersections.length; i++) {
        s_array.push({ id : t_values[i], value : intersections[i] });
    }
    s_array.sort(function(a,b){
        return a.id - b.id;
    });
    
    var intersections_array = [];
    for(var i = 0; i < s_array.length; i++) {
        intersections_array.push(s_array[i].value);
    }
    
    // Return the intersections.
    return intersections_array;
}


MathTools.findIntersection = function(p1, p2, p3, p4) {
    var lines_intersect, segments_intersect, intersection, close_p1, close_p2, t1, t2;
    
    // Get the segments' parameters.
    var dx12 = p2.x - p1.x;
    var dy12 = p2.y - p1.y;
    var dx34 = p4.x - p3.x;
    var dy34 = p4.y - p3.y;

    // Solve for t1 and t2
    var denominator = (dy12 * dx34 - dx12 * dy34);
    t1 = ((p1.x - p3.x) * dy34 + (p3.y - p1.y) * dx34) / denominator;
    if (t1 == Number.NEGATIVE_INFINITY || t1 == Number.POSITIVE_INFINITY)
    {
        // The lines are parallel (or close enough to it).
        lines_intersect = false;
        segments_intersect = false;
        intersection = { x : Number.NaN, y : Number.NaN };
        close_p1 = { x : Number.NaN, y : Number.NaN };
        close_p2 = { x : Number.NaN, y : Number.NaN };
        t2 = Number.POSITIVE_INFINITY;
        return;
    }
    lines_intersect = true;

    t2 = ((p3.x - p1.x) * dy12 + (p1.y - p3.y) * dx12) / -denominator;

    // Find the point of intersection.
    intersection = { x : p1.x + dx12 * t1, y : p1.y + dy12 * t1 };

    // The segments intersect if t1 and t2 are between 0 and 1.
    segments_intersect = ((t1 >= 0) && (t1 <= 1) && (t2 >= 0) && (t2 <= 1));

    // Find the closest points on the segments.
    if (t1 < 0) t1 = 0;
    else if (t1 > 1) t1 = 1;

    if (t2 < 0) t2 = 0;
    else if (t2 > 1) t2 = 1;

    close_p1 = { x : p1.x + dx12 * t1, y : p1.y + dy12 * t1 };
    close_p2 = { x : p3.x + dx34 * t2, y : p3.y + dy34 * t2 };
    
    return {
        lines_intersect : lines_intersect,
        segments_intersect : segments_intersect,
        intersection : intersection,
        close_p1 : close_p1,
        close_p2 : close_p2,
        t1 : t1,
        t2 : t2
    };
}

MathTools.pointIsInPolygon = function(x, y, polygon_points) {
    // Get the angle between the point and the
    // first and last vertices.
    var max_point = polygon_points.length - 1;
    var total_angle = MathTool.getAngle2(
        polygon_points[max_point].x, polygon_points[max_point].y,
        x, y,
        polygon_points[0].x, polygon_points[0].y);

    // Add the angles from the point
    // to each other pair of vertices.
    for (var i = 0; i < max_point; i++)
    {
        total_angle += MathTool.getAngle2(
            polygon_points[i].x, polygon_points[i].y,
            x, y,
            polygon_points[i + 1].x, polygon_points[i + 1].y);
    }

    // The total angle should be 2 * PI or -2 * PI if
    // the point is in the polygon and close to zero
    // if the point is outside the polygon.
    return (Math.abs(total_angle) > 0.000001);
}

MathTools.getAngle2 = function(Ax, Ay, Bx, By, Cx, Cy) {
    // Get the dot product.
    var dot_product = MathTools.dotProduct(Ax, Ay, Bx, By, Cx, Cy);

    // Get the cross product.
    var cross_product = MathTools.crossProductLength(Ax, Ay, Bx, By, Cx, Cy);

    // Calculate the angle.
    return Math.atan2(cross_product, dot_product);
}

// Return the dot product AB �� BC.
// Note that AB �� BC = |AB| * |BC| * Cos(theta).
MathTools.dotProduct = function(Ax, Ay, Bx, By, Cx, Cy) {
    // Get the vectors' coordinates.
    var BAx = Ax - Bx;
    var BAy = Ay - By;
    var BCx = Cx - Bx;
    var BCy = Cy - By;

    // Calculate the dot product.
    return (BAx * BCx + BAy * BCy);
}

MathTools.crossProductLength = function(Ax, Ay, Bx, By, Cx, Cy)
{
    // Get the vectors' coordinates.
    var BAx = Ax - Bx;
    var BAy = Ay - By;
    var BCx = Cx - Bx;
    var BCy = Cy - By;

    // Calculate the Z coordinate of the cross product.
    return (BAx * BCy - BAy * BCx);
}

MathTools.collideLineLine = function(x1, y1, x2, y2, x3, y3, x4, y4,calcIntersection) {
    
    var intersection;
    
    // calculate the distance to intersection point
    var uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    var uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    
    // if uA and uB are between 0-1, lines are colliding
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        
        if(this._collideDebug || calcIntersection){
            // calc the point where the lines meet
            var intersectionX = x1 + (uA * (x2-x1));
            var intersectionY = y1 + (uA * (y2-y1));
        }
        
        if(calcIntersection){
            intersection = {
                "x":intersectionX,
                "y":intersectionY
            }
            return intersection;
        }else{
            return true;
        }
    }
    if(calcIntersection){
        intersection = {
            "x":false,
            "y":false
        }
        return intersection;
    }
    return false;
}

MathTools.collideLinePoly = function(x1, y1, x2, y2, vertices) {
    
    // go through each of the vertices, plus the next vertex in the list
    var next = 0;
    for (var current=0; current<vertices.length; current++) {
        
        // get next vertex in list if we've hit the end, wrap around to 0
        next = current+1;
        if (next == vertices.length) next = 0;
        
        // get the PVectors at our current position extract X/Y coordinates from each
        var x3 = vertices[current].x;
        var y3 = vertices[current].y;
        var x4 = vertices[next].x;
        var y4 = vertices[next].y;
        
        // do a Line/Line comparison if true, return 'true' immediately and stop testing (faster)
        var hit = MathTools.collideLineLine(x1, y1, x2, y2, x3, y3, x4, y4);
        if (hit) {
            return true;
        }
    }
    // never got a hit
    return false;
}

MathTools.collidePolyPoly = function(p1, p2, interior) {
    if (interior == undefined){
        interior = false;
    }
    
    // go through each of the vertices, plus the next vertex in the list
    var next = 0;
    for (var current=0; current<p1.length; current++) {
        
        // get next vertex in list, if we've hit the end, wrap around to 0
        next = current+1;
        if (next == p1.length) next = 0;
        
        // get the PVectors at our current position this makes our if statement a little cleaner
        var vc = p1[current];    // c for "current"
        var vn = p1[next];       // n for "next"
        
        //use these two points (a line) to compare to the other polygon's vertices using polyLine()
        var collision = this.collideLinePoly(vc.x,vc.y,vn.x,vn.y,p2);
        if (collision) return true;
        
        //check if the 2nd polygon is INSIDE the first
        if(interior == true){
            collision = this.collidePointPoly(p2[0].x, p2[0].y, p1);
            if (collision) return true;
        }
    }
    
    return false;
}

// src/matrix.js
// Represents a 4x4 matrix stored in row-major order that uses Float32Arrays
// when available. Matrix operations can either be done using convenient
// methods that return a new matrix for the result or optimized methods
// that store the result in an existing matrix to avoid generating garbage.

var hasFloat32Array = (typeof Float32Array != 'undefined');

// ### new GL.Matrix([elements])
//
// This constructor takes 16 arguments in row-major order, which can be passed
// individually, as a list, or even as four lists, one for each row. If the
// arguments are omitted then the identity matrix is constructed instead.
function Matrix() {
  var m = Array.prototype.concat.apply([], arguments);
  if (!m.length) {
    m = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }
  this.m = hasFloat32Array ? new Float32Array(m) : m;
}

Matrix.prototype = {
  // ### .inverse()
  //
  // Returns the matrix that when multiplied with this matrix results in the
  // identity matrix.
  inverse: function() {
    return Matrix.inverse(this, new Matrix());
  },

  // ### .transpose()
  //
  // Returns this matrix, exchanging columns for rows.
  transpose: function() {
    return Matrix.transpose(this, new Matrix());
  },

  // ### .multiply(matrix)
  //
  // Returns the concatenation of the transforms for this matrix and `matrix`.
  // This emulates the OpenGL function `glMultMatrix()`.
  multiply: function(matrix) {
    return Matrix.multiply(this, matrix, new Matrix());
  },

  // ### .transformPoint(point)
  //
  // Transforms the vector as a point with a w coordinate of 1. This
  // means translations will have an effect, for example.
  transformPoint: function(v) {
    var m = this.m;
    return new Vector(
      m[0] * v.x + m[1] * v.y + m[2] * v.z + m[3],
      m[4] * v.x + m[5] * v.y + m[6] * v.z + m[7],
      m[8] * v.x + m[9] * v.y + m[10] * v.z + m[11]
    ).divide(m[12] * v.x + m[13] * v.y + m[14] * v.z + m[15]);
  },

  // ### .transformPoint(vector)
  //
  // Transforms the vector as a vector with a w coordinate of 0. This
  // means translations will have no effect, for example.
  transformVector: function(v) {
    var m = this.m;
    return new Vector(
      m[0] * v.x + m[1] * v.y + m[2] * v.z,
      m[4] * v.x + m[5] * v.y + m[6] * v.z,
      m[8] * v.x + m[9] * v.y + m[10] * v.z
    );
  }
};

// ### GL.Matrix.inverse(matrix[, result])
//
// Returns the matrix that when multiplied with `matrix` results in the
// identity matrix. You can optionally pass an existing matrix in `result`
// to avoid allocating a new matrix. This implementation is from the Mesa
// OpenGL function `__gluInvertMatrixd()` found in `project.c`.
Matrix.inverse = function(matrix, result) {
  result = result || new Matrix();
  var m = matrix.m, r = result.m;

  r[0] = m[5]*m[10]*m[15] - m[5]*m[14]*m[11] - m[6]*m[9]*m[15] + m[6]*m[13]*m[11] + m[7]*m[9]*m[14] - m[7]*m[13]*m[10];
  r[1] = -m[1]*m[10]*m[15] + m[1]*m[14]*m[11] + m[2]*m[9]*m[15] - m[2]*m[13]*m[11] - m[3]*m[9]*m[14] + m[3]*m[13]*m[10];
  r[2] = m[1]*m[6]*m[15] - m[1]*m[14]*m[7] - m[2]*m[5]*m[15] + m[2]*m[13]*m[7] + m[3]*m[5]*m[14] - m[3]*m[13]*m[6];
  r[3] = -m[1]*m[6]*m[11] + m[1]*m[10]*m[7] + m[2]*m[5]*m[11] - m[2]*m[9]*m[7] - m[3]*m[5]*m[10] + m[3]*m[9]*m[6];

  r[4] = -m[4]*m[10]*m[15] + m[4]*m[14]*m[11] + m[6]*m[8]*m[15] - m[6]*m[12]*m[11] - m[7]*m[8]*m[14] + m[7]*m[12]*m[10];
  r[5] = m[0]*m[10]*m[15] - m[0]*m[14]*m[11] - m[2]*m[8]*m[15] + m[2]*m[12]*m[11] + m[3]*m[8]*m[14] - m[3]*m[12]*m[10];
  r[6] = -m[0]*m[6]*m[15] + m[0]*m[14]*m[7] + m[2]*m[4]*m[15] - m[2]*m[12]*m[7] - m[3]*m[4]*m[14] + m[3]*m[12]*m[6];
  r[7] = m[0]*m[6]*m[11] - m[0]*m[10]*m[7] - m[2]*m[4]*m[11] + m[2]*m[8]*m[7] + m[3]*m[4]*m[10] - m[3]*m[8]*m[6];

  r[8] = m[4]*m[9]*m[15] - m[4]*m[13]*m[11] - m[5]*m[8]*m[15] + m[5]*m[12]*m[11] + m[7]*m[8]*m[13] - m[7]*m[12]*m[9];
  r[9] = -m[0]*m[9]*m[15] + m[0]*m[13]*m[11] + m[1]*m[8]*m[15] - m[1]*m[12]*m[11] - m[3]*m[8]*m[13] + m[3]*m[12]*m[9];
  r[10] = m[0]*m[5]*m[15] - m[0]*m[13]*m[7] - m[1]*m[4]*m[15] + m[1]*m[12]*m[7] + m[3]*m[4]*m[13] - m[3]*m[12]*m[5];
  r[11] = -m[0]*m[5]*m[11] + m[0]*m[9]*m[7] + m[1]*m[4]*m[11] - m[1]*m[8]*m[7] - m[3]*m[4]*m[9] + m[3]*m[8]*m[5];

  r[12] = -m[4]*m[9]*m[14] + m[4]*m[13]*m[10] + m[5]*m[8]*m[14] - m[5]*m[12]*m[10] - m[6]*m[8]*m[13] + m[6]*m[12]*m[9];
  r[13] = m[0]*m[9]*m[14] - m[0]*m[13]*m[10] - m[1]*m[8]*m[14] + m[1]*m[12]*m[10] + m[2]*m[8]*m[13] - m[2]*m[12]*m[9];
  r[14] = -m[0]*m[5]*m[14] + m[0]*m[13]*m[6] + m[1]*m[4]*m[14] - m[1]*m[12]*m[6] - m[2]*m[4]*m[13] + m[2]*m[12]*m[5];
  r[15] = m[0]*m[5]*m[10] - m[0]*m[9]*m[6] - m[1]*m[4]*m[10] + m[1]*m[8]*m[6] + m[2]*m[4]*m[9] - m[2]*m[8]*m[5];

  var det = m[0]*r[0] + m[1]*r[4] + m[2]*r[8] + m[3]*r[12];
  for (var i = 0; i < 16; i++) r[i] /= det;
  return result;
};

// ### GL.Matrix.transpose(matrix[, result])
//
// Returns `matrix`, exchanging columns for rows. You can optionally pass an
// existing matrix in `result` to avoid allocating a new matrix.
Matrix.transpose = function(matrix, result) {
  result = result || new Matrix();
  var m = matrix.m, r = result.m;
  r[0] = m[0]; r[1] = m[4]; r[2] = m[8]; r[3] = m[12];
  r[4] = m[1]; r[5] = m[5]; r[6] = m[9]; r[7] = m[13];
  r[8] = m[2]; r[9] = m[6]; r[10] = m[10]; r[11] = m[14];
  r[12] = m[3]; r[13] = m[7]; r[14] = m[11]; r[15] = m[15];
  return result;
};

// ### GL.Matrix.multiply(left, right[, result])
//
// Returns the concatenation of the transforms for `left` and `right`. You can
// optionally pass an existing matrix in `result` to avoid allocating a new
// matrix. This emulates the OpenGL function `glMultMatrix()`.
Matrix.multiply = function(left, right, result) {
  result = result || new Matrix();
  var a = left.m, b = right.m, r = result.m;

  r[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
  r[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
  r[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
  r[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

  r[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
  r[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
  r[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
  r[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

  r[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
  r[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
  r[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
  r[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

  r[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
  r[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
  r[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
  r[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

  return result;
};

Matrix.multiply2 = function(matrix1, matrix2, result) {
    result = result || new Matrix();
    var m11 = (((matrix1.m[0] * matrix2.m[0]) + (matrix1.m[1] * matrix2.m[4])) + (matrix1.m[2] * matrix2.m[8])) + (matrix1.m[3] * matrix2.m[12]);
    var m12 = (((matrix1.m[0] * matrix2.m[1]) + (matrix1.m[1] * matrix2.m[5])) + (matrix1.m[2] * matrix2.m[9])) + (matrix1.m[3] * matrix2.m[13]);
    var m13 = (((matrix1.m[0] * matrix2.m[2]) + (matrix1.m[1] * matrix2.m[6])) + (matrix1.m[2] * matrix2.m[10])) + (matrix1.m[3] * matrix2.m[14]);
    var m14 = (((matrix1.m[0] * matrix2.m[3]) + (matrix1.m[1] * matrix2.m[7])) + (matrix1.m[2] * matrix2.m[11])) + (matrix1.m[3] * matrix2.m[15]);
    var m21 = (((matrix1.m[4] * matrix2.m[0]) + (matrix1.m[5] * matrix2.m[4])) + (matrix1.m[6] * matrix2.m[8])) + (matrix1.m[7] * matrix2.m[12]);
    var m22 = (((matrix1.m[4] * matrix2.m[1]) + (matrix1.m[5] * matrix2.m[5])) + (matrix1.m[6] * matrix2.m[9])) + (matrix1.m[7] * matrix2.m[13]);
    var m23 = (((matrix1.m[4] * matrix2.m[2]) + (matrix1.m[5] * matrix2.m[6])) + (matrix1.m[6] * matrix2.m[10])) + (matrix1.m[7] * matrix2.m[14]);
    var m24 = (((matrix1.m[4] * matrix2.m[3]) + (matrix1.m[5] * matrix2.m[7])) + (matrix1.m[6] * matrix2.m[11])) + (matrix1.m[7] * matrix2.m[15]);
    var m31 = (((matrix1.m[8] * matrix2.m[0]) + (matrix1.m[9] * matrix2.m[4])) + (matrix1.m[10] * matrix2.m[8])) + (matrix1.m[11] * matrix2.m[12]);
    var m32 = (((matrix1.m[8] * matrix2.m[1]) + (matrix1.m[9] * matrix2.m[5])) + (matrix1.m[10] * matrix2.m[9])) + (matrix1.m[11] * matrix2.m[13]);
    var m33 = (((matrix1.m[8] * matrix2.m[2]) + (matrix1.m[9] * matrix2.m[6])) + (matrix1.m[10] * matrix2.m[10])) + (matrix1.m[11] * matrix2.m[14]);
    var m34 = (((matrix1.m[8] * matrix2.m[3]) + (matrix1.m[9] * matrix2.m[7])) + (matrix1.m[10] * matrix2.m[11])) + (matrix1.m[11] * matrix2.m[15]);
    var m41 = (((matrix1.m[12] * matrix2.m[0]) + (matrix1.m[13] * matrix2.m[4])) + (matrix1.m[14] * matrix2.m[8])) + (matrix1.m[15] * matrix2.m[12]);
    var m42 = (((matrix1.m[12] * matrix2.m[1]) + (matrix1.m[13] * matrix2.m[5])) + (matrix1.m[14] * matrix2.m[9])) + (matrix1.m[15] * matrix2.m[13]);
    var m43 = (((matrix1.m[12] * matrix2.m[2]) + (matrix1.m[13] * matrix2.m[6])) + (matrix1.m[14] * matrix2.m[10])) + (matrix1.m[15] * matrix2.m[14]);
    var m44 = (((matrix1.m[12] * matrix2.m[3]) + (matrix1.m[13] * matrix2.m[7])) + (matrix1.m[14] * matrix2.m[11])) + (matrix1.m[15] * matrix2.m[15]);
    result.m[0] = m11;
    result.m[1] = m21;
    result.m[2] = m31;
    result.m[3] = m41;
    result.m[4] = m12;
    result.m[5] = m22;
    result.m[6] = m32;
    result.m[7] = m42;
    result.m[8] = m13;
    result.m[9] = m23;
    result.m[10] = m33;
    result.m[11] = m34;
    result.m[12] = m14;
    result.m[13] = m24;
    result.m[14] = m34;
    result.m[15] = m44;
    return result;
}

// ### GL.Matrix.identity([result])
//
// Returns an identity matrix. You can optionally pass an existing matrix in
// `result` to avoid allocating a new matrix. This emulates the OpenGL function
// `glLoadIdentity()`.
Matrix.identity = function(result) {
  result = result || new Matrix();
  var m = result.m;
  m[0] = m[5] = m[10] = m[15] = 1;
  m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = m[12] = m[13] = m[14] = 0;
  return result;
};

// ### GL.Matrix.perspective(fov, aspect, near, far[, result])
//
// Returns a perspective transform matrix, which makes far away objects appear
// smaller than nearby objects. The `aspect` argument should be the width
// divided by the height of your viewport and `fov` is the top-to-bottom angle
// of the field of view in degrees. You can optionally pass an existing matrix
// in `result` to avoid allocating a new matrix. This emulates the OpenGL
// function `gluPerspective()`.
Matrix.perspective = function(fov, aspect, near, far, result) {
  var y = Math.tan(fov * Math.PI / 360) * near;
  var x = y * aspect;
  return Matrix.frustum(-x, x, -y, y, near, far, result);
};

// ### GL.Matrix.frustum(left, right, bottom, top, near, far[, result])
//
// Sets up a viewing frustum, which is shaped like a truncated pyramid with the
// camera where the point of the pyramid would be. You can optionally pass an
// existing matrix in `result` to avoid allocating a new matrix. This emulates
// the OpenGL function `glFrustum()`.
Matrix.frustum = function(l, r, b, t, n, f, result) {
  result = result || new Matrix();
  var m = result.m;

  m[0] = 2 * n / (r - l);
  m[1] = 0;
  m[2] = (r + l) / (r - l);
  m[3] = 0;

  m[4] = 0;
  m[5] = 2 * n / (t - b);
  m[6] = (t + b) / (t - b);
  m[7] = 0;

  m[8] = 0;
  m[9] = 0;
  m[10] = -(f + n) / (f - n);
  m[11] = -2 * f * n / (f - n);

  m[12] = 0;
  m[13] = 0;
  m[14] = -1;
  m[15] = 0;

  return result;
};

// ### GL.Matrix.ortho(left, right, bottom, top, near, far[, result])
//
// Returns an orthographic projection, in which objects are the same size no
// matter how far away or nearby they are. You can optionally pass an existing
// matrix in `result` to avoid allocating a new matrix. This emulates the OpenGL
// function `glOrtho()`.
Matrix.ortho = function(l, r, b, t, n, f, result) {
  result = result || new Matrix();
  var m = result.m;

  m[0] = 2 / (r - l);
  m[1] = 0;
  m[2] = 0;
  m[3] = -(r + l) / (r - l);

  m[4] = 0;
  m[5] = 2 / (t - b);
  m[6] = 0;
  m[7] = -(t + b) / (t - b);

  m[8] = 0;
  m[9] = 0;
  m[10] = -2 / (f - n);
  m[11] = -(f + n) / (f - n);

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return result;
};

// ### GL.Matrix.scale(x, y, z[, result])
//
// This emulates the OpenGL function `glScale()`. You can optionally pass an
// existing matrix in `result` to avoid allocating a new matrix.
Matrix.scale = function(x, y, z, result) {
  result = result || new Matrix();
  var m = result.m;

  m[0] = x;
  m[1] = 0;
  m[2] = 0;
  m[3] = 0;

  m[4] = 0;
  m[5] = y;
  m[6] = 0;
  m[7] = 0;

  m[8] = 0;
  m[9] = 0;
  m[10] = z;
  m[11] = 0;

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return result;
};

// ### GL.Matrix.translate(x, y, z[, result])
//
// This emulates the OpenGL function `glTranslate()`. You can optionally pass
// an existing matrix in `result` to avoid allocating a new matrix.
Matrix.translate = function(x, y, z, result) {
  result = result || new Matrix();
  var m = result.m;

  m[0] = 1;
  m[1] = 0;
  m[2] = 0;
  m[3] = x;

  m[4] = 0;
  m[5] = 1;
  m[6] = 0;
  m[7] = y;

  m[8] = 0;
  m[9] = 0;
  m[10] = 1;
  m[11] = z;

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return result;
};

Matrix.translate2 = function(x, y, z) {
    var result = new Matrix();
    result.m[0] = 1;
    result.m[1] = 0;
    result.m[2] = 0;
    result.m[3] = x;
    result.m[4] = 0;
    result.m[5] = 1;
    result.m[6] = 0;
    result.m[7] = y;
    result.m[8] = 0;
    result.m[9] = 0;
    result.m[10] = 1;
    result.m[11] = z;
    result.m[12] = 0;
    result.m[13] = 0;
    result.m[14] = 0;
    result.m[15] = 1;
    return result;
}

// ### GL.Matrix.rotate(a, x, y, z[, result])
//
// Returns a matrix that rotates by `a` degrees around the vector `x, y, z`.
// You can optionally pass an existing matrix in `result` to avoid allocating
// a new matrix. This emulates the OpenGL function `glRotate()`.
Matrix.rotate = function(a, x, y, z, result) {
  if (!a || (!x && !y && !z)) {
    return Matrix.identity(result);
  }

  result = result || new Matrix();
  var m = result.m;

  var d = Math.sqrt(x*x + y*y + z*z);
  a *= Math.PI / 180; x /= d; y /= d; z /= d;
  var c = Math.cos(a), s = Math.sin(a), t = 1 - c;

  m[0] = x * x * t + c;
  m[1] = x * y * t - z * s;
  m[2] = x * z * t + y * s;
  m[3] = 0;

  m[4] = y * x * t + z * s;
  m[5] = y * y * t + c;
  m[6] = y * z * t - x * s;
  m[7] = 0;

  m[8] = z * x * t - y * s;
  m[9] = z * y * t + x * s;
  m[10] = z * z * t + c;
  m[11] = 0;

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return result;
};

Matrix.rotateZ = function(radians) {
    var result = Matrix.identity();
    var val1 = Math.cos(radians);
    var val2 = Math.sin(radians);
    
    result.m[0] = val1;
    result.m[4] = -val2;
    result.m[1] = val2;
    result.m[5] = val1;
    
    return result;
}

// ### GL.Matrix.lookAt(ex, ey, ez, cx, cy, cz, ux, uy, uz[, result])
//
// Returns a matrix that puts the camera at the eye point `ex, ey, ez` looking
// toward the center point `cx, cy, cz` with an up direction of `ux, uy, uz`.
// You can optionally pass an existing matrix in `result` to avoid allocating
// a new matrix. This emulates the OpenGL function `gluLookAt()`.
Matrix.lookAt = function(ex, ey, ez, cx, cy, cz, ux, uy, uz, result) {
  result = result || new Matrix();
  var m = result.m;

  var e = new Vector(ex, ey, ez);
  var c = new Vector(cx, cy, cz);
  var u = new Vector(ux, uy, uz);
  var f = e.subtract(c).unit();
  var s = u.cross(f).unit();
  var t = f.cross(s).unit();

  m[0] = s.x;
  m[1] = s.y;
  m[2] = s.z;
  m[3] = -s.dot(e);

  m[4] = t.x;
  m[5] = t.y;
  m[6] = t.z;
  m[7] = -t.dot(e);

  m[8] = f.x;
  m[9] = f.y;
  m[10] = f.z;
  m[11] = -f.dot(e);

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return result;
};

// src/md5.js
/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(o,q){var l={},m=l.lib={},n=m.Base=function(){function a(){}return{extend:function(e){a.prototype=this;var c=new a;e&&c.mixIn(e);c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.$super.extend(this)}}}(),j=m.WordArray=n.extend({init:function(a,e){a=
this.words=a||[];this.sigBytes=e!=q?e:4*a.length},toString:function(a){return(a||r).stringify(this)},concat:function(a){var e=this.words,c=a.words,d=this.sigBytes,a=a.sigBytes;this.clamp();if(d%4)for(var b=0;b<a;b++)e[d+b>>>2]|=(c[b>>>2]>>>24-8*(b%4)&255)<<24-8*((d+b)%4);else if(65535<c.length)for(b=0;b<a;b+=4)e[d+b>>>2]=c[b>>>2];else e.push.apply(e,c);this.sigBytes+=a;return this},clamp:function(){var a=this.words,e=this.sigBytes;a[e>>>2]&=4294967295<<32-8*(e%4);a.length=o.ceil(e/4)},clone:function(){var a=
n.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var e=[],c=0;c<a;c+=4)e.push(4294967296*o.random()|0);return j.create(e,a)}}),k=l.enc={},r=k.Hex={stringify:function(a){for(var e=a.words,a=a.sigBytes,c=[],d=0;d<a;d++){var b=e[d>>>2]>>>24-8*(d%4)&255;c.push((b>>>4).toString(16));c.push((b&15).toString(16))}return c.join("")},parse:function(a){for(var b=a.length,c=[],d=0;d<b;d+=2)c[d>>>3]|=parseInt(a.substr(d,2),16)<<24-4*(d%8);return j.create(c,b/2)}},p=k.Latin1={stringify:function(a){for(var b=
a.words,a=a.sigBytes,c=[],d=0;d<a;d++)c.push(String.fromCharCode(b[d>>>2]>>>24-8*(d%4)&255));return c.join("")},parse:function(a){for(var b=a.length,c=[],d=0;d<b;d++)c[d>>>2]|=(a.charCodeAt(d)&255)<<24-8*(d%4);return j.create(c,b)}},h=k.Utf8={stringify:function(a){try{return decodeURIComponent(escape(p.stringify(a)))}catch(b){throw Error("Malformed UTF-8 data");}},parse:function(a){return p.parse(unescape(encodeURIComponent(a)))}},b=m.BufferedBlockAlgorithm=n.extend({reset:function(){this._data=j.create();
this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=h.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var b=this._data,c=b.words,d=b.sigBytes,f=this.blockSize,i=d/(4*f),i=a?o.ceil(i):o.max((i|0)-this._minBufferSize,0),a=i*f,d=o.min(4*a,d);if(a){for(var h=0;h<a;h+=f)this._doProcessBlock(c,h);h=c.splice(0,a);b.sigBytes-=d}return j.create(h,d)},clone:function(){var a=n.clone.call(this);a._data=this._data.clone();return a},_minBufferSize:0});m.Hasher=b.extend({init:function(){this.reset()},
reset:function(){b.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);this._doFinalize();return this._hash},clone:function(){var a=b.clone.call(this);a._hash=this._hash.clone();return a},blockSize:16,_createHelper:function(a){return function(b,c){return a.create(c).finalize(b)}},_createHmacHelper:function(a){return function(b,c){return f.HMAC.create(a,c).finalize(b)}}});var f=l.algo={};return l}(Math);
(function(o){function q(b,f,a,e,c,d,g){b=b+(f&a|~f&e)+c+g;return(b<<d|b>>>32-d)+f}function l(b,f,a,e,c,d,g){b=b+(f&e|a&~e)+c+g;return(b<<d|b>>>32-d)+f}function m(b,f,a,e,c,d,g){b=b+(f^a^e)+c+g;return(b<<d|b>>>32-d)+f}function n(b,f,a,e,c,d,g){b=b+(a^(f|~e))+c+g;return(b<<d|b>>>32-d)+f}var j=CryptoJS,k=j.lib,r=k.WordArray,k=k.Hasher,p=j.algo,h=[];(function(){for(var b=0;64>b;b++)h[b]=4294967296*o.abs(o.sin(b+1))|0})();p=p.MD5=k.extend({_doReset:function(){this._hash=r.create([1732584193,4023233417,
2562383102,271733878])},_doProcessBlock:function(b,f){for(var a=0;16>a;a++){var e=f+a,c=b[e];b[e]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360}for(var e=this._hash.words,c=e[0],d=e[1],g=e[2],i=e[3],a=0;64>a;a+=4)16>a?(c=q(c,d,g,i,b[f+a],7,h[a]),i=q(i,c,d,g,b[f+a+1],12,h[a+1]),g=q(g,i,c,d,b[f+a+2],17,h[a+2]),d=q(d,g,i,c,b[f+a+3],22,h[a+3])):32>a?(c=l(c,d,g,i,b[f+(a+1)%16],5,h[a]),i=l(i,c,d,g,b[f+(a+6)%16],9,h[a+1]),g=l(g,i,c,d,b[f+(a+11)%16],14,h[a+2]),d=l(d,g,i,c,b[f+a%16],20,h[a+3])):48>a?(c=
m(c,d,g,i,b[f+(3*a+5)%16],4,h[a]),i=m(i,c,d,g,b[f+(3*a+8)%16],11,h[a+1]),g=m(g,i,c,d,b[f+(3*a+11)%16],16,h[a+2]),d=m(d,g,i,c,b[f+(3*a+14)%16],23,h[a+3])):(c=n(c,d,g,i,b[f+3*a%16],6,h[a]),i=n(i,c,d,g,b[f+(3*a+7)%16],10,h[a+1]),g=n(g,i,c,d,b[f+(3*a+14)%16],15,h[a+2]),d=n(d,g,i,c,b[f+(3*a+5)%16],21,h[a+3]));e[0]=e[0]+c|0;e[1]=e[1]+d|0;e[2]=e[2]+g|0;e[3]=e[3]+i|0},_doFinalize:function(){var b=this._data,f=b.words,a=8*this._nDataBytes,e=8*b.sigBytes;f[e>>>5]|=128<<24-e%32;f[(e+64>>>9<<4)+14]=(a<<8|a>>>
24)&16711935|(a<<24|a>>>8)&4278255360;b.sigBytes=4*(f.length+1);this._process();b=this._hash.words;for(f=0;4>f;f++)a=b[f],b[f]=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360}});j.MD5=k._createHelper(p);j.HmacMD5=k._createHmacHelper(p)})(Math);
// src/mesh.js
// Represents indexed triangle geometry with arbitrary additional attributes.
// You need a shader to draw a mesh; meshes can't draw themselves.
//
// A mesh is a collection of `GL.Buffer` objects which are either vertex buffers
// (holding per-vertex attributes) or index buffers (holding the order in which
// vertices are rendered). By default, a mesh has a position vertex buffer called
// `vertices` and a triangle index buffer called `triangles`. New buffers can be
// added using `addVertexBuffer()` and `addIndexBuffer()`. Two strings are
// required when adding a new vertex buffer, the name of the data array on the
// mesh instance and the name of the GLSL attribute in the vertex shader.
//
// Example usage:
//
//     var mesh = new GL.Mesh({ coords: true, lines: true });
//
//     // Default attribute "vertices", available as "gl_Vertex" in
//     // the vertex shader
//     mesh.vertices = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]];
//
//     // Optional attribute "coords" enabled in constructor,
//     // available as "gl_TexCoord" in the vertex shader
//     mesh.coords = [[0, 0], [1, 0], [0, 1], [1, 1]];
//
//     // Custom attribute "weights", available as "weight" in the
//     // vertex shader
//     mesh.addVertexBuffer('weights', 'weight');
//     mesh.weights = [1, 0, 0, 1];
//
//     // Default index buffer "triangles"
//     mesh.triangles = [[0, 1, 2], [2, 1, 3]];
//
//     // Optional index buffer "lines" enabled in constructor
//     mesh.lines = [[0, 1], [0, 2], [1, 3], [2, 3]];
//
//     // Upload provided data to GPU memory
//     mesh.compile();

// ### new GL.Indexer()
//
// Generates indices into a list of unique objects from a stream of objects
// that may contain duplicates. This is useful for generating compact indexed
// meshes from unindexed data.
function Indexer() {
  this.unique = [];
  this.indices = [];
  this.map = {};
}

Indexer.prototype = {
  // ### .add(v)
  //
  // Adds the object `obj` to `unique` if it hasn't already been added. Returns
  // the index of `obj` in `unique`.
  add: function(obj) {
    var key = JSON.stringify(obj);
    if (!(key in this.map)) {
      this.map[key] = this.unique.length;
      this.unique.push(obj);
    }
    return this.map[key];
  }
};

// ### new GL.Buffer(target, type)
//
// Provides a simple method of uploading data to a GPU buffer. Example usage:
//
//     var vertices = new GL.Buffer(gl.ARRAY_BUFFER, Float32Array);
//     var indices = new GL.Buffer(gl.ELEMENT_ARRAY_BUFFER, Uint16Array);
//     vertices.data = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]];
//     indices.data = [[0, 1, 2], [2, 1, 3]];
//     vertices.compile();
//     indices.compile();
//
function Buffer(target, type) {
  this.buffer = null;
  this.target = target;
  this.type = type;
  this.data = [];
}

Buffer.prototype = {
  // ### .compile(type)
  //
  // Upload the contents of `data` to the GPU in preparation for rendering. The
  // data must be a list of lists where each inner list has the same length. For
  // example, each element of data for vertex normals would be a list of length three.
  // This will remember the data length and element length for later use by shaders.
  // The type can be either `gl.STATIC_DRAW` or `gl.DYNAMIC_DRAW`, and defaults to
  // `gl.STATIC_DRAW`.
  //
  // This could have used `[].concat.apply([], this.data)` to flatten
  // the array but Google Chrome has a maximum number of arguments so the
  // concatenations are chunked to avoid that limit.
  compile: function(type) {
    var data = [];
    for (var i = 0, chunk = 10000; i < this.data.length; i += chunk) {
      data = Array.prototype.concat.apply(data, this.data.slice(i, i + chunk));
    }
    var spacing = this.data.length ? data.length / this.data.length : 0;
    if (spacing != Math.round(spacing)) throw new Error('buffer elements not of consistent size, average size is ' + spacing);
    this.buffer = this.buffer || gl.createBuffer();
    this.buffer.length = data.length;
    this.buffer.spacing = spacing;
    gl.bindBuffer(this.target, this.buffer);
    gl.bufferData(this.target, new this.type(data), type || gl.STATIC_DRAW);
  }
};

// ### new GL.Mesh([options])
//
// Represents a collection of vertex buffers and index buffers. Each vertex
// buffer maps to one attribute in GLSL and has a corresponding property set
// on the Mesh instance. There is one vertex buffer by default: `vertices`,
// which maps to `gl_Vertex`. The `coords`, `normals`, and `colors` vertex
// buffers map to `gl_TexCoord`, `gl_Normal`, and `gl_Color` respectively,
// and can be enabled by setting the corresponding options to true. There are
// two index buffers, `triangles` and `lines`, which are used for rendering
// `gl.TRIANGLES` and `gl.LINES`, respectively. Only `triangles` is enabled by
// default, although `computeWireframe()` will add a normal buffer if it wasn't
// initially enabled.
function Mesh(options) {
  options = options || {};
  this.vertexBuffers = {};
  this.indexBuffers = {};
  this.addVertexBuffer('vertices', 'gl_Vertex');
  if (options.coords) this.addVertexBuffer('coords', 'gl_TexCoord');
  if (options.normals) this.addVertexBuffer('normals', 'gl_Normal');
  if (options.colors) this.addVertexBuffer('colors', 'gl_Color');
  if (!('triangles' in options) || options.triangles) this.addIndexBuffer('triangles');
  if (options.lines) this.addIndexBuffer('lines');
}

Mesh.prototype = {
  // ### .addVertexBuffer(name, attribute)
  //
  // Add a new vertex buffer with a list as a property called `name` on this object
  // and map it to the attribute called `attribute` in all shaders that draw this mesh.
  addVertexBuffer: function(name, attribute) {
    var buffer = this.vertexBuffers[attribute] = new Buffer(gl.ARRAY_BUFFER, Float32Array);
    buffer.name = name;
    this[name] = [];
  },

  // ### .addIndexBuffer(name)
  //
  // Add a new index buffer with a list as a property called `name` on this object.
  addIndexBuffer: function(name) {
    var buffer = this.indexBuffers[name] = new Buffer(gl.ELEMENT_ARRAY_BUFFER, Uint16Array);
    this[name] = [];
  },

  // ### .compile()
  //
  // Upload all attached buffers to the GPU in preparation for rendering. This
  // doesn't need to be called every frame, only needs to be done when the data
  // changes.
  compile: function() {
    for (var attribute in this.vertexBuffers) {
      var buffer = this.vertexBuffers[attribute];
      buffer.data = this[buffer.name];
      buffer.compile();
    }

    for (var name in this.indexBuffers) {
      var buffer = this.indexBuffers[name];
      buffer.data = this[name];
      buffer.compile();
    }
  },

  // ### .transform(matrix)
  //
  // Transform all vertices by `matrix` and all normals by the inverse transpose
  // of `matrix`.
  transform: function(matrix) {
    this.vertices = this.vertices.map(function(v) {
      return matrix.transformPoint(Vector.fromArray(v)).toArray();
    });
    if (this.normals) {
      var invTrans = matrix.inverse().transpose();
      this.normals = this.normals.map(function(n) {
        return invTrans.transformVector(Vector.fromArray(n)).unit().toArray();
      });
    }
    this.compile();
    return this;
  },

  // ### .computeNormals()
  //
  // Computes a new normal for each vertex from the average normal of the
  // neighboring triangles. This means adjacent triangles must share vertices
  // for the resulting normals to be smooth.
  computeNormals: function() {
    if (!this.normals) this.addVertexBuffer('normals', 'gl_Normal');
    for (var i = 0; i < this.vertices.length; i++) {
      this.normals[i] = new Vector();
    }
    for (var i = 0; i < this.triangles.length; i++) {
      var t = this.triangles[i];
      var a = Vector.fromArray(this.vertices[t[0]]);
      var b = Vector.fromArray(this.vertices[t[1]]);
      var c = Vector.fromArray(this.vertices[t[2]]);
      var normal = b.subtract(a).cross(c.subtract(a)).unit();
      this.normals[t[0]] = this.normals[t[0]].add(normal);
      this.normals[t[1]] = this.normals[t[1]].add(normal);
      this.normals[t[2]] = this.normals[t[2]].add(normal);
    }
    for (var i = 0; i < this.vertices.length; i++) {
      this.normals[i] = this.normals[i].unit().toArray();
    }
    this.compile();
    return this;
  },

  // ### .computeWireframe()
  //
  // Populate the `lines` index buffer from the `triangles` index buffer.
  computeWireframe: function() {
    var indexer = new Indexer();
    for (var i = 0; i < this.triangles.length; i++) {
      var t = this.triangles[i];
      for (var j = 0; j < t.length; j++) {
        var a = t[j], b = t[(j + 1) % t.length];
        indexer.add([Math.min(a, b), Math.max(a, b)]);
      }
    }
    if (!this.lines) this.addIndexBuffer('lines');
    this.lines = indexer.unique;
    this.compile();
    return this;
  },

  // ### .getAABB()
  //
  // Computes the axis-aligned bounding box, which is an object whose `min` and
  // `max` properties contain the minimum and maximum coordinates of all vertices.
  getAABB: function() {
    var aabb = { min: new Vector(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE) };
    aabb.max = aabb.min.negative();
    for (var i = 0; i < this.vertices.length; i++) {
      var v = Vector.fromArray(this.vertices[i]);
      aabb.min = Vector.min(aabb.min, v);
      aabb.max = Vector.max(aabb.max, v);
    }
    return aabb;
  },

  // ### .getBoundingSphere()
  //
  // Computes a sphere that contains all vertices (not necessarily the smallest
  // sphere). The returned object has two properties, `center` and `radius`.
  getBoundingSphere: function() {
    var aabb = this.getAABB();
    var sphere = { center: aabb.min.add(aabb.max).divide(2), radius: 0 };
    for (var i = 0; i < this.vertices.length; i++) {
      sphere.radius = Math.max(sphere.radius,
        Vector.fromArray(this.vertices[i]).subtract(sphere.center).length());
    }
    return sphere;
  }
};

// ### GL.Mesh.plane([options])
//
// Generates a square 2x2 mesh the xy plane centered at the origin. The
// `options` argument specifies options to pass to the mesh constructor.
// Additional options include `detailX` and `detailY`, which set the tesselation
// in x and y, and `detail`, which sets both `detailX` and `detailY` at once.
// Two triangles are generated by default.
// Example usage:
//
//     var mesh1 = GL.Mesh.plane();
//     var mesh2 = GL.Mesh.plane({ detail: 5 });
//     var mesh3 = GL.Mesh.plane({ detailX: 20, detailY: 40 });
//
Mesh.plane = function(options) {
  options = options || {};
  var mesh = new Mesh(options);
  detailX = options.detailX || options.detail || 1;
  detailY = options.detailY || options.detail || 1;

  for (var y = 0; y <= detailY; y++) {
    var t = y / detailY;
    for (var x = 0; x <= detailX; x++) {
      var s = x / detailX;
      mesh.vertices.push([2 * s - 1, 2 * t - 1, 0]);
      if (mesh.coords) mesh.coords.push([s, t]);
      if (mesh.normals) mesh.normals.push([0, 0, 1]);
      if (x < detailX && y < detailY) {
        var i = x + y * (detailX + 1);
        mesh.triangles.push([i, i + 1, i + detailX + 1]);
        mesh.triangles.push([i + detailX + 1, i + 1, i + detailX + 2]);
      }
    }
  }

  mesh.compile();
  return mesh;
};

var cubeData = [
  [0, 4, 2, 6, -1, 0, 0], // -x
  [1, 3, 5, 7, +1, 0, 0], // +x
  [0, 1, 4, 5, 0, -1, 0], // -y
  [2, 6, 3, 7, 0, +1, 0], // +y
  [0, 2, 1, 3, 0, 0, -1], // -z
  [4, 5, 6, 7, 0, 0, +1]  // +z
];

function pickOctant(i) {
  return new Vector((i & 1) * 2 - 1, (i & 2) - 1, (i & 4) / 2 - 1);
}

// ### GL.Mesh.cube([options])
//
// Generates a 2x2x2 box centered at the origin. The `options` argument
// specifies options to pass to the mesh constructor.
Mesh.cube = function(options) {
  var mesh = new Mesh(options);

  for (var i = 0; i < cubeData.length; i++) {
    var data = cubeData[i], v = i * 4;
    for (var j = 0; j < 4; j++) {
      var d = data[j];
      mesh.vertices.push(pickOctant(d).toArray());
      if (mesh.coords) mesh.coords.push([j & 1, (j & 2) / 2]);
      if (mesh.normals) mesh.normals.push(data.slice(4, 7));
    }
    mesh.triangles.push([v, v + 1, v + 2]);
    mesh.triangles.push([v + 2, v + 1, v + 3]);
  }

  mesh.compile();
  return mesh;
};

// ### GL.Mesh.sphere([options])
//
// Generates a geodesic sphere of radius 1. The `options` argument specifies
// options to pass to the mesh constructor in addition to the `detail` option,
// which controls the tesselation level. The detail is `6` by default.
// Example usage:
//
//     var mesh1 = GL.Mesh.sphere();
//     var mesh2 = GL.Mesh.sphere({ detail: 2 });
//
Mesh.sphere = function(options) {
  function tri(a, b, c) { return flip ? [a, c, b] : [a, b, c]; }
  function fix(x) { return x + (x - x * x) / 2; }
  options = options || {};
  var mesh = new Mesh(options);
  var indexer = new Indexer();
  detail = options.detail || 6;

  for (var octant = 0; octant < 8; octant++) {
    var scale = pickOctant(octant);
    var flip = scale.x * scale.y * scale.z > 0;
    var data = [];
    for (var i = 0; i <= detail; i++) {
      // Generate a row of vertices on the surface of the sphere
      // using barycentric coordinates.
      for (var j = 0; i + j <= detail; j++) {
        var a = i / detail;
        var b = j / detail;
        var c = (detail - i - j) / detail;
        var vertex = { vertex: new Vector(fix(a), fix(b), fix(c)).unit().multiply(scale).toArray() };
        if (mesh.coords) vertex.coord = scale.y > 0 ? [1 - a, c] : [c, 1 - a];
        data.push(indexer.add(vertex));
      }

      // Generate triangles from this row and the previous row.
      if (i > 0) {
        for (var j = 0; i + j <= detail; j++) {
          var a = (i - 1) * (detail + 1) + ((i - 1) - (i - 1) * (i - 1)) / 2 + j;
          var b = i * (detail + 1) + (i - i * i) / 2 + j;
          mesh.triangles.push(tri(data[a], data[a + 1], data[b]));
          if (i + j < detail) {
            mesh.triangles.push(tri(data[b], data[a + 1], data[b + 1]));
          }
        }
      }
    }
  }

  // Reconstruct the geometry from the indexer.
  mesh.vertices = indexer.unique.map(function(v) { return v.vertex; });
  if (mesh.coords) mesh.coords = indexer.unique.map(function(v) { return v.coord; });
  if (mesh.normals) mesh.normals = mesh.vertices;
  mesh.compile();
  return mesh;
};

// ### GL.Mesh.load(json[, options])
//
// Creates a mesh from the JSON generated by the `convert/convert.py` script.
// Example usage:
//
//     var data = {
//       vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
//       triangles: [[0, 1, 2]]
//     };
//     var mesh = GL.Mesh.load(data);
//
Mesh.load = function(json, options) {
  options = options || {};
  if (!('coords' in options)) options.coords = !!json.coords;
  if (!('normals' in options)) options.normals = !!json.normals;
  if (!('colors' in options)) options.colors = !!json.colors;
  if (!('triangles' in options)) options.triangles = !!json.triangles;
  if (!('lines' in options)) options.lines = !!json.lines;
  var mesh = new Mesh(options);
  mesh.vertices = json.vertices;
  if (mesh.coords) mesh.coords = json.coords;
  if (mesh.normals) mesh.normals = json.normals;
  if (mesh.colors) mesh.colors = json.colors;
  if (mesh.triangles) mesh.triangles = json.triangles;
  if (mesh.lines) mesh.lines = json.lines;
  mesh.compile();
  return mesh;
};

// src/module.js
/**
 * ��ȡ��վ����ַ�����������Ŀ¼���������Ŀ¼��
 * @param isVirtual �Ƿ�����Ŀ¼
 * @returns {String}
 */
function getSiteRoot(isVirtual) {
    var siteRoot = window.location.protocol +"//"+ window.location.host +"/";
    if(!isVirtual) return siteRoot;
    
    var relativePath = window.location.pathname;
    if(relativePath != "" && relativePath.substring(0,1) == "/"){
        //�˴���Ҫ����ͬ����������ܷ��ص�relativePath��һ��
        relativePath = relativePath.substring(1);
    }
    var virtualPath = (relativePath == "") ? "" : relativePath.substring(0, relativePath.indexOf("/") + 1);

    return siteRoot + virtualPath;
}

function Module() {
}

Module.load = function(path, callback, param) {
    var root = getSiteRoot(false);

    var needAdd = true;
    // ���ű��Ƿ����
    var eleList = document.querySelectorAll('script')
    for (var i = 0; i < eleList.length; i++) {
        // ��������
        var ele = eleList[i];
        var src = ele.src.replace(root, '');
        if(src == path) {
            needAdd = false;
        }
    }
    
    if(needAdd) {
        var script=document.createElement("script");
        script.type="text/javascript";
        script.src = path;
        document.getElementsByTagName('head')[0].appendChild(script); 
        script.onload = function(){
            script.loaded = true;
            if(callback) callback(param);
        }//js�������ִ�з���
    }
    else {
        if(callback) callback(param);
    }
}

Module.replace = function(path, callback) {
    var root = getSiteRoot(false);
    
    // ���ű��Ƿ����
    var exist = false;
    var eleList = document.querySelectorAll('script')
    for (var i = 0; i < eleList.length; i++) {
        // ��������
        var ele = eleList[i];
        var src = ele.src.replace(root, '');
        if(src == path) {
            ele.parentNode.removeChild(ele); 
            exist = true;
        }
    }
    
    if(exist) {
        var script=document.createElement("script");
        script.type="text/javascript";
        script.src=path;
        document.getElementsByTagName('head')[0].appendChild(script); 
        script.onload = function(){
            script.loaded = true;
            if(callback) callback();
        }//js�������ִ�з���
    }
}
// src/object.js
function ObjectState(animation) {
    this.frame = 0;
    this.elaspedTime = 0;
    this.isPlaying = true;
    this.object = animation;
    this._init = false;
    this._state = null;
}

ObjectState.prototype = {
    update : function(inv) {
        if(!this.isPlaying) return;
        
        if(!this._init) {
            if(this.object.staties != null && this.object.staties[this.state]) {
                this.frame = this.object.staties[this.state];
                this.elaspedTime = 0;
                this._init = true;
            }
            else if(this.state == null) {
                this._init = true;
            }
        }
        
        var frameRate = Math.max(24, this.object.frameRate);
        this.elaspedTime = this.elaspedTime + inv;
        this.frame = this.frame + parseInt(this.elaspedTime / frameRate);
        this.elaspedTime = this.elaspedTime % frameRate;
        if(this.frame > this.object.getMaxFrame()) { 
            this.frame = this._state != null && this.object.staties && this.object.staties[this._state] ? this.object.staties[this._state] : 0;
        }
    },
    play : function() {
        this.isPlaying = true;
    },
    stop : function() {
        this.isPlaying = false;
    },
    get state() {
        return this._state;
    },
    set state(value) {
        if(this._state != value) {
            this._state = value;
            this._init = false;
        }
    }
}

function IObject() {
    this.isVisual = true;
}

IObject.prototype  = {
    getMaxFrame : function() {
        var maxFrame = 0;
        for(var i = 0; i < this.items.length; i++) {
            if(this.items[i].maxFrame > maxFrame) {
                maxFrame = this.items[i].maxFrame;
            }
        }
        return maxFrame;
    },
    
    newState : function() {
        return new ObjectState(this);
    }
}

function readKeyframe(json) {
    var locStr = json.location.split(',');
    var scaleStr = json.scale.split(',');
    var originStr = json.origin.split(',');
    var colorStr = json.color.split(',');
    
    var frame = { 
        frame : json.frame,
        value : json.value,
        x : parseFloat(locStr[0]),
        y : parseFloat(locStr[1]),
        originX : parseFloat(originStr[0]),
        originY : parseFloat(originStr[1]),
        angle : json.angle,
        r : parseFloat(colorStr[0]),
        g : parseFloat(colorStr[1]),
        b : parseFloat(colorStr[2]),
        a : parseFloat(colorStr[3]),
        smooth : json.smooth,
        scaleX : parseFloat(scaleStr[0]),
        scaleY : parseFloat(scaleStr[1]),
    };
    
    return frame;
}

IObject.create = function() {
    var ani = new IObject();
    ani.items = [];
    ani.frameRate = 24;
    ani.loop = true;
    return ani;
}

IObject.fromJson = function(json, params, entry) {
    var ani = entry;
    ani.staties = {};
    ani.frameRate = parseFloat(json.framerate);
    ani.loop = Boolean(json.loop);
    
    for(var index = 0; index < json.states.length; index++) {
        ani.staties[json.states[index].name] = json.states[index].frame;
    }
    
    for(var index = 0; index < json.items.length; index++) {
        var item = json.items[index];
        var baseItem = null;
        
        // �������
        switch(item.type) {
          case "mesh":
            var mesh = new ObjectItemMesh();
            mesh.keypoints = [];
            mesh.brush = new VoidBrush();
            
            Tile.fromName(item.inculde, { mesh : mesh }, function(sheet, userToken) {
                var mesh2 = userToken.mesh;
                mesh2.brush = sheet;
                var tb = mesh2.brush;
                var minX = Number.MAX_VALUE;
                var minY = Number.MAX_VALUE;
                var minX2 = Number.MAX_VALUE;
                var minY2 = Number.MAX_VALUE;
                
                for(var index2 = 0; index2 < mesh2.keypoints.length; index2++) {
                    var keypoint = mesh2.keypoints[index2];
                    var point = tb.keypoints[index2];
                    
                    if(minX2 > point.x + tb.bounds.x) minX2 = point.x + tb.bounds.x;
                    if(minY2 > point.y + tb.bounds.y) minY2 = point.y + tb.bounds.y;
                }
                
                for(var index2 = 0; index2 < mesh2.keypoints.length; index2++) {
                    var keypoint = mesh2.keypoints[index2];
                    var point = tb.keypoints[index2];
                    var drawOffset = { x : point.x + minX2, y : point.y + minY2 };
                    keypoint.drawOffset = drawOffset;
                    keypoint.bindingUV = [ drawOffset.x / tb.texture.image.width, drawOffset.y / tb.texture.image.height ];
                    
                    if(minX > drawOffset.x) minX = drawOffset.x;
                    if(minY > drawOffset.y) minY = drawOffset.y;
                }
                mesh2.drawOffset = { x : minX, y : minY };          
                mesh2.triangulate();
            });
            
            for(var index2 = 0; index2 < item.vertices.length; index2++) {
                var keypoint = item.vertices[index2];
                var key = {};
                key.index = keypoint.index;
                key.parent = mesh;
                key.keyframes = [];
                // ��ӷ���
                addObjectItemFunctions(key);
                for(var index3 = 0; index3 < keypoint.keyframes.length; index3++) {
                    var keyframe = keypoint.keyframes[index3];
                    key.keyframes.push(readKeyframe(keyframe));
                }
                mesh.keypoints.push(key);
                
            }
            
            baseItem = mesh;
            baseItem.type = "mesh";
            break;
            
          case "text":
            var label = new ObjectItemLabel();
            label.text = item.text;
            label.size = parseFloat(item.size);
            label.font = new Font();
            IUIU.Loader.load(item.inculde, { label : label }, function(c) {
                c.userToken.label.font = c.content;
            }); 
            
            baseItem = label;
            baseItem.type = "text";
            break;
            
          case "collide":
            var collide = ObjectItemCollideBox();
            collide.points = [];
            for(var index2 = 0; index2 < item.points.length; index2++) {
                var point = item.points[index2];
                var key = {};
                key.keyframes = [];
                addObjectItemFunctions(key);
                for(var index3 = 0; index3 < point.keyframes.length; index3++) {
                    var keyframe = point.keyframes[index3];
                    key.keyframes.push(readKeyframe(keyframe));
                }
                collide.points.push(key);
            }
            
            baseItem = collide;
            baseItem.type = "collide";
            break;
            
          case "spline":
            var spline = {};
            ObjectSpline.addSplineFunctions(spline);
            spline.type = "spline";
            spline.points = [];
            spline.splitCornersThreshold = 120;
            spline.streachThreshold = 0;
            spline.splitWhenDifferent = false;
            spline.smoothFactor = 5;
            for(var i = 0; i < item.points.length; i++) {
                var pointStr = item.points[i].split(',');
                var x = parseFloat(pointStr[0]);
                var y = parseFloat(pointStr[1]);
                spline.points.push({ x : x, y : y });
            }
            
            if(item.uvmapping.fill.inculde != null) spline.downloadCount = 1;
            if(item.uvmapping.left.inculde != null) spline.downloadCount++;
            if(item.uvmapping.top.inculde != null) spline.downloadCount++;
            if(item.uvmapping.right.inculde != null) spline.downloadCount++;
            if(item.uvmapping.bottom.inculde != null) spline.downloadCount++;
            
            spline.fill = Spline.readSegment(item.ObjectSplineing.fill, spline);
            spline.left = Spline.readSegment(item.ObjectSplineing.left, spline);
            spline.top = Spline.readSegment(item.ObjectSplineing.top, spline);
            spline.right = Spline.readSegment(item.ObjectSplineing.right, spline);
            spline.bottom = Spline.readSegment(item.ObjectSplineing.bottom, spline);
            
            baseItem = spline; 
            baseItem.type = "spline";
            break;
            
          default:
            throw "not support data type";
        }
        
        baseItem.isVisual = Boolean(item.visual);
        baseItem.isLocked = Boolean(item.locked);
        baseItem.keyframes = [];
        for(var index2 = 0; index2 < item.keyframes.length; index2++) {
            var keyframe = item.keyframes[index2];
            baseItem.keyframes.push(readKeyframe(keyframe));
        }
        
        // �������֡
        var maxFrame = 0;
        for(var i = 0; i < baseItem.keyframes.length; i++) {
            if(maxFrame < baseItem.keyframes[i].frame) {
                maxFrame = baseItem.keyframes[i].frame;
            }
        }
        baseItem.maxFrame = maxFrame;
        
        // ��ӷ���
        addObjectItemFunctions(baseItem);
        
        ani.items.push(baseItem);
    }
    
    ani.body = CreateBody(ani);
    
    return ani;
}

function addObjectItemFunctions(baseItem) {
    baseItem.getFirst = function() {
        var frame = Number.MAX_VALUE;
        var first = null;
        for (var i = 0; i < this.keyframes.length; i++) {
            var item = this.keyframes[i];
            if (item.frame < frame) {
                first = item;
                frame = item.frame;
            }
        }
        return first;
    },
    baseItem.evaluate = function(frame) {
        var first = null;  
        for (var i = 0; i < this.keyframes.length; i++) 
        {
            var item = this.keyframes[i];
            if (item.frame < frame && (first == null || item.frame > first.frame)) 
            {
                first = item;
            }
        }
        
        if (first != null)
        {
            if (frame == first.frame)
                return first.value;
            
            var next = this.getNextState(first.frame) || first;
            
            if (frame == next.frame)
                return next.value;
            
            var countTime = frame - first.frame;
            var totalTime = next.frame - first.frame;
            if (countTime > totalTime)
            {
                return 0;
            }
            else if (first.smooth)
            {
                return first.value + (next.value - first.value) * (countTime / totalTime);
            }
            else 
            {
                throw " NotImplementedException(); ";
            }
        }
        else 
        {
            return 0;
        }
    };
    
    baseItem.getState = function(frame) {
        for(var i = 0; i < this.keyframes.length; i++) {
            if(this.keyframes[i].frame == frame) {
                return this.keyframes[i];
            }
        }
    };
    
    baseItem.getLastState = function(frame) {
        var result = -1;
        var state = null;
        for(var i = 0; i < this.keyframes.length; i++) {
            var keyframe = this.keyframes[i];
            if(keyframe.frame < frame && keyframe.frame > result) {
                result = keyframe.frame;
                state = keyframe;
            }
        }
        
        return state;
    };
    
    baseItem.getNextState = function(frame) {
        var result = Number.MAX_VALUE;
        var state = null;
        for(var i = this.keyframes.length - 1; i > 0; i--) {
            var keyframe = this.keyframes[i];
            if(keyframe.frame > frame && keyframe.frame < result) {
                result = keyframe.frame;
                state = keyframe;
            }
        }
        
        return state;
    };
    
    baseItem.getRealState = function(frame) {
        var lastState = this.getState(frame) || this.getLastState(frame);
        if (lastState == null || (lastState.frame != frame && !lastState.smooth))
            return null;
        
        var nextState = this.getNextState(frame);
        var value = this.evaluate(frame);
        var x, y, scalex, scaley, rotateZ, originX, originY;
        var r, g, b, a;
        if (lastState == null) {
            if (nextState == null) {
                return null;
            }
            
            x = nextState.x;
            y = nextState.y;
            scalex = nextState.scaleX;
            scaley = nextState.scaleY;
            rotateZ = nextState.angle;
            r = nextState.r;
            g = nextState.g;
            b = nextState.b;
            a = nextState.a;
            originX = nextState.originX;
            originY = nextState.originY;
        }
        else if (nextState == null) {
            if (lastState == null || lastState.frame != frame) {
                return null;
            }
            
            x = lastState.x;
            y = lastState.y;
            scalex = lastState.scaleX;
            scaley = lastState.scaleY;
            rotateZ = lastState.angle;
            r = lastState.r;
            g = lastState.g;
            b = lastState.b;
            a = lastState.a;
            originX = lastState.originX;
            originY = lastState.originY;
        }
        else {
            value = value * (frame - lastState.frame) / (nextState.frame - lastState.frame);
            
            x = lastState.x + (nextState.x - lastState.x) * value;
            y = lastState.y + (nextState.y - lastState.y) * value;
            scalex = lastState.scaleX + (nextState.scaleX - lastState.scaleX) * value;
            scaley = lastState.scaleY + (nextState.scaleY - lastState.scaleY) * value;
            
            rotateZ = lastState.angle + (nextState.angle - lastState.angle) * value;
            
            r = parseInt(lastState.r + (nextState.r - lastState.r) * value);
            g = parseInt(lastState.g + (nextState.g - lastState.g) * value);
            b = parseInt(lastState.b + (nextState.b - lastState.b) * value);
            a = parseInt(lastState.a + (nextState.a - lastState.a) * value);
            
            originX = lastState.originX + (nextState.originX - lastState.originX) * value;
            originY = lastState.originY + (nextState.originY - lastState.originY) * value;
        }
        
        if (this.parent != null) {
            var ps = this.parent.getRealState(frame);
            if (ps != null) {
                return {
                    frame : frame,
                    value : value,
                    x : x + ps.x,
                    y : y + ps.y,
                    scaleX : scalex * ps.scaleX,
                    scaleY : scaley * ps.scaleY,
                    angle : rotateZ + ps.angle,
                    r : r / 255 * ps.r,
                    g : g / 255 * ps.g,
                    b : b / 255 * ps.b,
                    a : a / 255 * ps.a,
                    originX : originX + ps.originX,
                    originY : originY + ps.originY
                };
            }
        }
        else {
            return {
                frame : frame,
                value : value,
                x : x,
                y : y,
                scaleX : scalex,
                scaleY : scaley,
                angle : rotateZ,
                r : r,
                g : g,
                b : b,
                a : a,
                originX : originX,
                originY : originY
            };
        }
    };
}

function VoidBrush() {
    return {
        onupdate : function(frame, g) {
        }
    };
}

function MeshVertexTrackerDefault(position) {
    return {
        position : { x : position[0], y : position[1] },
        getPostion : function(frame) {
            return this.position;
        }
    };
}

function MeshVertexTrackerKeyPoint(key, offset) {
    return {
        key : key,
        offset : offset,
        getPostion : function(frame) {
            var ps = this.key.parent.getRealState(frame);
            var state = this.key.getRealState(frame);
            if (state != null) {
                return { x : state.x - ps.x - this.offset.x, y : state.y - ps.y - this.offset.y };
            }
            else {
                return { x : 0, y : 0 };
            }
        }
    };
}

function ObjectItemCollideBox() {
    return {};
}

function ObjectItemLabel() {
    return {};
}

function ObjectItemMesh() {
    return {
        triangles : null,
        fixedUVs : {},
        triangulate : function() {
            var vertices = [];
            this.fixedUVs = [];
            for(var i = 0; i < this.keypoints.length; i++) {
                var keypoint = this.keypoints[i];
                vertices.push([ keypoint.drawOffset.x - this.drawOffset.x, keypoint.drawOffset.y - this.drawOffset.y ]);
            }
            
            this.triangles = [];
            var delau_triangles = Delaunay.triangulate(vertices);
            for(var x = 0; x < delau_triangles.length; x += 3) {
                
                var v1 = vertices[delau_triangles[x]];
                var v2 = vertices[delau_triangles[x + 1]];
                var v3 = vertices[delau_triangles[x + 2]];
                
                var p1 = new MeshVertexTrackerDefault(v1);
                var p2 = new MeshVertexTrackerDefault(v2);
                var p3 = new MeshVertexTrackerDefault(v3);
                
                for(var i = 0; i < this.keypoints.length; i++) {
                    var keypoint = this.keypoints[i];
                    var real = { x : keypoint.drawOffset.x - this.drawOffset.x, y : keypoint.drawOffset.y - this.drawOffset.y };
                    
                    if (v1[0] == real.x && v1[1] == real.y) p1 = new MeshVertexTrackerKeyPoint(keypoint, this.drawOffset);
                    if (v2[0] == real.x && v2[1] == real.y) p2 = new MeshVertexTrackerKeyPoint(keypoint, this.drawOffset);
                    if (v3[0] == real.x && v3[1] == real.y) p3 = new MeshVertexTrackerKeyPoint(keypoint, this.drawOffset);
                }
                
                this.triangles.push({
                    p1 : { tracker : p1, uv : { x : (v1[0] + this.drawOffset.x) / this.brush.texture.image.width, y : (v1[1] + this.drawOffset.y) / this.brush.texture.image.height } },
                    p2 : { tracker : p2, uv : { x : (v2[0] + this.drawOffset.x) / this.brush.texture.image.width, y : (v2[1] + this.drawOffset.y) / this.brush.texture.image.height } },
                    p3 : { tracker : p3, uv : { x : (v3[0] + this.drawOffset.x) / this.brush.texture.image.width, y : (v3[1] + this.drawOffset.y) / this.brush.texture.image.height } },
                });
                
            }
        }
    };
}

function ObjectSpline() {
}

ObjectSpline.readSegment = function(json, spline) {
    var seg = {};
    if(json.inculde) {
        Tile.fromName(json.inculde, { segment : seg, spline : spline }, function(sheet, userToken) {
            var segment = userToken.segment;
            var spline = userToken.spline;
            segment.texture = sheet;
            spline.downloadCount--;
            if(spline.downloadCount <= 0)
            spline.generateMesh();
        });
    }
    seg.bodies = [];
    if(json.leftcap) {
        var aabbStr = json.leftcap.split(',');
        var x = parseFloat(aabbStr[0]);
        var y = parseFloat(aabbStr[1]);
        var width = parseFloat(aabbStr[2]);
        var height = parseFloat(aabbStr[3]);
        
        seg.leftcap = { x : x, y : y, width : width, height : height };
    }
    
    if(json.rightcap) {
        var aabbStr = json.rightcap.split(',');
        var x = parseFloat(aabbStr[0]);
        var y = parseFloat(aabbStr[1]);
        var width = parseFloat(aabbStr[2]);
        var height = parseFloat(aabbStr[3]);
        
        seg.rightcap = { x : x, y : y, width : width, height : height };
    }
    
    if(json.bodies) {
        for(var i = 0; i < json.bodies.length; i++) {
            var aabbStr = json.bodies[i].split(',');
            var x = parseFloat(aabbStr[0]);
            var y = parseFloat(aabbStr[1]);
            var width = parseFloat(aabbStr[2]);
            var height = parseFloat(aabbStr[3]);
            
            seg.bodies.push({ x : x, y : y, width : width, height : height });
        }
    }
    
    return seg;
}

ObjectSpline.addSplineFunctions = function(spline) {
    spline.shouldCloseSegment = function(segment, side) {
        if(this.splitWhenDifferent && (side == "left" && segment.direction != segment.prevDirection || (side == "right" && segment.direction != segment.nextDirection)))
            return true;
        
        var angle = side == "left" ? segment.angleWithPrev() : segment.angleWithNext();
        if(angle <= this.splitCornersThreshold || angle >= (360 - this.splitCornersThreshold))
            return true;
        
        return angle == 180 && !(side == "left" ? segment.prev != null : segment.next != null);
    };
    
    spline.hermite = function(v1, v2, v3, v4, aPercentage, aTension, aBias) {
        var mu2 = aPercentage * aPercentage;
        var mu3 = mu2 * aPercentage;
        var m0 = (v2 - v1) * (1 + aBias) * (1 - aTension) / 2;
        m0 += (v3 - v2) * (1 - aBias) * (1 - aTension) / 2;
        var m1 = (v3 - v2) * (1 + aBias) * (1 - aTension) / 2;
        m1 += (v4 - v3) * (1 - aBias) * (1 - aTension) / 2;
        var a0 = 2 * mu3 - 3 * mu2 + 1;
        var a1 = mu3 - 2 * mu2 + aPercentage;
        var a2 = mu3 - mu2;
        var a3 = -2 * mu3 + 3 * mu2;
        
        return (a0 * v2 + a1 * m0 + a2 * m1 + a3 * v3);
    };
    
    spline.hermiteLerp = function(a, b, c, d, percentage, tension, bias) {
        tension = tension || 0;
        bias = bias || 0;
        
        return { x : this.hermite(a.x, b.x, c.x, d.x, percentage, tension, bias),
        y : this.hermite(a.y, b.y, c.y, d.y, percentage, tension, bias) };
    };
    
    spline.normal = function(v) {
        var normal = { x : -v.y, y : v.x };
        var num = 1 / Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        normal.x *= num;
        normal.y *= num;
        return normal;
    };
    
    spline.circularIndex = function(source, i, looped) {
        looped = looped || false;
        
        var n = source.length;
        
        return i < 0 || i >= n ? (looped ? source[((i % n) + n) % n] : null) : source[i];
    };
    
    spline.calculateDirection = function(fst, snd) {
        if(fst.direction != null && fst.direction != "auto") 
            return fst.direction;
        
        var normal = this.normal({ x : fst.x - snd.x, y : fst.y - snd.y });
        if(Math.abs(normal.x) > Math.abs(normal.y)) {
            return normal.x < 0 ? "right" : "left";
        }
        
        return normal.y < 0 ? "top" : "down";
    };
    
    spline.getUvMappingOf = function(direction) {
        switch(direction) {
          case "top":
            return this.top;
          case "down":
            return this.bottom || this.top;
          case "left":
            return this.left || this.right || this.top;
          case "right":
            return this.right || this.left || this.top;
        }
        
        return null;
    }; 
    
    spline.drawSegment = function(segment, edgeList) {
        var segmentUvMapping = this.getUvMappingOf(segment.direction);
        
        if(segmentUvMapping == null || segmentUvMapping.bodies.length == 0) {
            return [ segment.begin, segment.end ];
        }
        
        var rect = segmentUvMapping.bodies[0];
        var width = segmentUvMapping.texture.texture.image.width;
        var height = segmentUvMapping.texture.texture.image.height;
        
        var x = rect.x / width;
        var y = rect.y / height;
        
        var width2 = rect.width / width;
        var height2 = rect.height / height;
        
        var bodyUvSize = { width : width2, height : height2 };
        var unitsPerEdgeUv = { width : segmentUvMapping.texture.texture.image.width, height : segmentUvMapping.texture.texture.image.height };
        var bodyWidthInUnits = bodyUvSize.width * unitsPerEdgeUv.width;
        var halfBodyHeightInUnits = bodyUvSize.height * unitsPerEdgeUv.height / 2;
        
        var bodyUv = {};
        var start = segment.begin;
        var smoothFactor = Math.max(1, this.smoothFactor);
        
        var doLeftCap = spline.shouldCloseSegment(segment, "left") && segmentUvMapping.leftcap != null;
        var doRightCap = spline.shouldCloseSegment(segment, "right") && segmentUvMapping.rightcap != null;
        
        if(doLeftCap)
            segment.prevprev = segment.prev = null;
        
        if(doRightCap)
            segment.nextnext = segment.next = null;
        
        if(segment.prevprev != null && segment.prev != null) {
            var seg2 = { prev : segment.prevprev, begin : segment.prev, end : segment.begin };
            SplineObjectSplinegmentFunctions(seg2);
            if(spline.shouldCloseSegment(seg2, "left")) {
                segment.prevprev = null;
            }
        }
        
        var last = segment.prev || segment.begin;
        var next = { x : segment.begin.x - last.x, y : segment.begin.y - last.y };
        var length = Math.sqrt(next.x * next.x + next.y * next.y);
        var prevNumOfCuts = Math.max(parseInt(Math.floor(length / (bodyWidthInUnits + spline.streachThreshold))), 1) * smoothFactor;
        var endPrevious = spline.hermiteLerp(segment.prevprev || segment.prev || segment.begin, segment.prev || segment.begin, segment.begin, segment.end, prevNumOfCuts == 1 ? 0.001 : ((prevNumOfCuts - 1) / prevNumOfCuts));
        var startOffset = spline.normal({ x : start.x - endPrevious.x, y : start.y - endPrevious.y }); // * halfBodyHeightInUnits;
        startOffset = { x : startOffset.x * halfBodyHeightInUnits, y : startOffset.y * halfBodyHeightInUnits };
        
        if(doLeftCap)
            spline.drawCap(
                segmentUvMapping.leftcap, 
                "left", 
                { x : segment.begin.x - startOffset.x, y : segment.begin.y - startOffset.y },
                { x : segment.begin.x + startOffset.x, y : segment.begin.y + startOffset.y },
                edgeList,
                segmentUvMapping.texture,
                segment.direction
                );
        
        if(doLeftCap && doRightCap) 
            smoothFactor = 1;
        
        next = { x : segment.end.x - segment.begin.x, y : segment.end.y - segment.begin.y };
        length = Math.sqrt(next.x * next.x + next.y * next.y);
        var numberOfCuts = Math.max(parseInt(Math.floor(length / (bodyWidthInUnits + spline.streachThreshold))), 1) * smoothFactor;
        var fillPoints = [];
        
        for(var i = 0; i < numberOfCuts; i++) {
            var percentEnd = (i + 1) / numberOfCuts;
            var end = spline.hermiteLerp(segment.prev || segment.begin, segment.begin, segment.end, segment.next || segment.end, percentEnd);
            var endOffset = spline.normal({ x : end.x - start.x, y : end.y - start.y }); // * halfBodyHeightInUnits;
            endOffset = { x : endOffset.x * halfBodyHeightInUnits, y : endOffset.y * halfBodyHeightInUnits };
            
            var localTopLeft = { x : start.x - startOffset.x, y : start.y - startOffset.y };
            var localTopRight = { x : end.x - endOffset.x, y : end.y - endOffset.y };
            var localBottomLeft = { x : start.x + startOffset.x, y : start.y + startOffset.y };
            var localBottomRight = { x : end.x + endOffset.x, y : end.y + endOffset.y };
            
            fillPoints.push(start);
            
            start = end;
            startOffset = endOffset;
            
            if(i % smoothFactor == 0) {
                rect = segmentUvMapping.bodies[Math.abs(percentEnd >> 32) % 1];
                width = segmentUvMapping.texture.texture.image.width;
                height = segmentUvMapping.texture.texture.image.height;
                
                x = rect.x / width;
                y = rect.y / height;
                
                width2 = rect.width / width;
                height2 = rect.height / height;
                
                bodyUv = { x : x, y : y, width : width2 / smoothFactor, height : height2 };
            }
            else {
                bodyUv = { x : bodyUv.x + bodyUv.width, y : bodyUv.y, width : bodyUv.width, height : bodyUv.height };
            }
            
            var p1 = [ localBottomLeft.x, localBottomLeft.y ];
            var p2 = [ localTopLeft.x, localTopLeft.y ];
            var p3 = [ localTopRight.x, localTopRight.y ];
            var p4 = [ localBottomRight.x, localBottomRight.y ];
            
            var uv1 = [ bodyUv.x, 1 - bodyUv.y - bodyUv.height ];
            var uv2 = [ bodyUv.x, 1 - bodyUv.y ];
            var uv3 = [ bodyUv.x + bodyUv.width, 1 - bodyUv.y ];
            var uv4 = [ bodyUv.x + bodyUv.width, 1 - bodyUv.y - bodyUv.height ];
            
            if(segment.direction == "top") {
                edgeList.push({
                    texture : segmentUvMapping.texture.texture.image,
                    p1 : p1,
                    p2 : p2,
                    p3 : p3,
                    uv1 : uv1,
                    uv2 : uv2,
                    uv3 : uv3
                });
                
                edgeList.push({
                    texture : segmentUvMapping.texture.texture.image,
                    p1 : p1,
                    p2 : p4,
                    p3 : p3,
                    uv1 : uv1,
                    uv2 : uv4,
                    uv3 : uv3
                });
            } else {
                edgeList.unshift({
                    texture : segmentUvMapping.texture.texture.image,
                    p1 : p1,
                    p2 : p2,
                    p3 : p3,
                    uv1 : uv1,
                    uv2 : uv2,
                    uv3 : uv3
                });
                
                edgeList.unshift({
                    texture : segmentUvMapping.texture.texture.image,
                    p1 : p1,
                    p2 : p4,
                    p3 : p3,
                    uv1 : uv1,
                    uv2 : uv4,
                    uv3 : uv3
                });
            }
        }
        
        if(doRightCap)
        spline.drawCap(
            segmentUvMapping.rightcap, 
            "right", 
            { x : segment.end.x - startOffset.x, y : segment.end.y - startOffset.y },
            { x : segment.end.x + startOffset.x, y : segment.end.y + startOffset.y },
            edgeList,
            segmentUvMapping.texture,
            segment.direction
            );
        
        return fillPoints;
    };
    
    spline.drawCap = function(rect, side, top, bottom, edges, texture, driection) {
        width = texture.texture.image.width;
        height = texture.texture.image.height;
        
        x = rect.x / width;
        y = rect.y / height;
        
        width2 = rect.width / width;
        height2 = rect.height / height;
        
        var capUv = { x : x, y : y, width : width2, height : height2 };
        var capOffset = this.normal({ x : bottom.x - top.x, y : bottom.y - top.y });
        capOffset = { x : capOffset.x * capUv.width * texture.width, y : capOffset.y * capUv.width * texture.width };
        
        var otherTop = side == "left" ? { x : top.x + capOffset.x, y : top.y + capOffset.y } : { x : top.x - capOffset.x, y : top.y - capOffset.y };
        var otherBottom = side == "left" ? { x : bottom.x + capOffset.x, y : bottom.y + capOffset.y } : { x : bottom.x - capOffset.x, y : bottom.y - capOffset.y };
        
        if(side == "left") {
            var temp = top;
            top = otherTop;
            otherTop = temp;
            
            var temp2 = bottom;
            bottom = otherBottom;
            otherBottom = temp2;
        }
        
        var p1 = [ bottom.x, bottom.y ];
        var p2 = [ top.x, top.y ];
        var p3 = [ otherTop.x, otherTop.y ];
        var p4 = [ otherBottom.x, otherBottom.y ];
        
        var uv1 = [ capUv.x, 1 - capUv.y - capUv.height ];
        var uv2 = [ capUv.x, 1 - capUv.y ];
        var uv3 = [ capUv.x + capUv.width, 1 - capUv.y ];
        var uv4 = [ capUv.x + capUv.width, 1 - capUv.y - capUv.height ];
        
        if(driection == "top") {
            edges.push({
                texture : texture.texture.image,
                p1 : p1,
                p2 : p2,
                p3 : p3,
                uv1 : uv1,
                uv2 : uv2,
                uv3 : uv3
            });
            
            edges.push({
                texture : texture.texture.image,
                p1 : p1,
                p2 : p4,
                p3 : p3,
                uv1 : uv1,
                uv2 : uv4,
                uv3 : uv3
            });
        } else {
            edges.unshift({
                texture : texture.texture.image,
                p1 : p1,
                p2 : p2,
                p3 : p3,
                uv1 : uv1,
                uv2 : uv2,
                uv3 : uv3
            });
            
            edges.unshift({
                texture : texture.texture.image,
                p1 : p1,
                p2 : p4,
                p3 : p3,
                uv1 : uv1,
                uv2 : uv4,
                uv3 : uv3
            });
        }
    };
    
    spline.generateSegments = function() {
        var result = []
        var size = spline.points.length + 1;
        
        for(var i = 1; i < size; i++) {
            var prev2 = spline.circularIndex(spline.points, i - 2, true);
            var next = spline.circularIndex(spline.points, i + 1, true);
            var prev = spline.circularIndex(spline.points, i - 1, true);
            var cur = spline.circularIndex(spline.points, i, true);
            
            var seg = {};
            seg.prevprev = spline.circularIndex(spline.points, i - 3, true);
            seg.prev = prev2;
            seg.begin = prev;
            seg.end = cur;
            seg.next = next;
            seg.nextnext = spline.circularIndex(spline.points, i + 2, true);
            seg.direction = spline.calculateDirection(prev, cur);
            seg.prevDirection = prev2 == null ? "none" : spline.calculateDirection(prev2, prev);
            seg.nextDirection = next == null ? "none" : spline.calculateDirection(cur, next);
            
            SplineObjectSplinegmentFunctions(seg);
            
            result.push(seg);
        }
        return result;
    };
    
    spline.generateMesh = function() {
        this.triangles = [];
        this.edgeTriangles = [];
        
        var segments = this.generateSegments();
        var vertices = [];
        var edgeVertices = [];
        for(var i = 0; i < segments.length; i++) {
            var points = this.drawSegment(segments[i], this.edgeTriangles);
            for(var x = 0; x < points.length; x++) {
                vertices.push(new poly2tri.Point(points[x].x, points[x].y));
            }
        }
        
        var swctx = new poly2tri.SweepContext(vertices);
        swctx.triangulate();
        var triangles = swctx.getTriangles();
        
        for(var x = 0; x < triangles.length; x++) {
            
            var v1 = triangles[x].points_[0];
            var v2 = triangles[x].points_[1];
            var v3 = triangles[x].points_[2];
            
            this.triangles.push({
                texture : this.fill.texture.texture.image,
                color : this.color,
                p1 : [ v1.x, v1.y ],
                p2 : [ v2.x, v2.y ],
                p3 : [ v3.x, v3.y ],
                uv1 : [ v1.x / this.fill.texture.texture.image.width, v1.y / this.fill.texture.texture.image.height ],
                uv2 : [ v2.x / this.fill.texture.texture.image.width, v2.y / this.fill.texture.texture.image.height ],
                uv3 : [ v3.x / this.fill.texture.texture.image.width, v3.y / this.fill.texture.texture.image.height ]
            });
        }
        
    };
    
    spline.getEdgeDisplayStates = function(location, origin, scale, angle, color) {
        var result = [];
        if(this.triangles != null) {
            for(var i = 0; i < this.edgeTriangles.length; i++) {
                var tri = this.edgeTriangles[i];
                //var origin = { x : origin.x + location.x, y : origin.y + location.y };
                var p1 = MathTools.pointRotate(origin, { x : tri.p1[0] * scale.x, y : tri.p1[1] * scale.y }, angle);
                var p2 = MathTools.pointRotate(origin, { x : tri.p2[0] * scale.x, y : tri.p2[1] * scale.y }, angle);
                var p3 = MathTools.pointRotate(origin, { x : tri.p3[0] * scale.x, y : tri.p3[1] * scale.y }, angle);
                
                p1 = [ p1.x + location.x, p1.y + location.y ];
                p2 = [ p2.x + location.x, p2.y + location.y ];
                p3 = [ p3.x + location.x, p3.y + location.y ];
                
                result.push({
                    texture : tri.texture,
                    color : [ color.r, color.g, color.b, color.a ],
                    p1 : p1,
                    p2 : p2,
                    p3 : p3,
                    uv1 : tri.uv1,
                    uv2 : tri.uv2,
                    uv3 : tri.uv3
                });
            }
        }
        return result;
    };
    
    spline.getFillDisplayStates = function(location, origin, scale, angle, color) {
        var result = [];
        if(this.triangles != null) {
            for(var i = 0; i < this.triangles.length; i++) {
                var tri = this.triangles[i];
                //var origin = { x : origin.x + location.x, y : origin.y + location.y };
                var p1 = MathTools.pointRotate(origin, { x : tri.p1[0] * scale.x, y : tri.p1[1] * scale.y }, angle);
                var p2 = MathTools.pointRotate(origin, { x : tri.p2[0] * scale.x, y : tri.p2[1] * scale.y }, angle);
                var p3 = MathTools.pointRotate(origin, { x : tri.p3[0] * scale.x, y : tri.p3[1] * scale.y }, angle);
                
                p1 = [ p1.x + location.x, p1.y + location.y ];
                p2 = [ p2.x + location.x, p2.y + location.y ];
                p3 = [ p3.x + location.x, p3.y + location.y ];
                
                result.push({
                    texture : tri.texture,
                    color : [ color.r, color.g, color.b, color.a ],
                    p1 : p1,
                    p2 : p2,
                    p3 : p3,
                    uv1 : tri.uv1,
                    uv2 : tri.uv2,
                    uv3 : tri.uv3
                });
            }
        }
        return result;
    };
}

ObjectSpline.addSegmentFunctions = function(seg) {
    seg.angleBetween = function(v1, v2) {
        var y = v1.x * v2.y - v2.x * v1.y;
        var x = v1.x * v2.x + v1.y * v2.y;
        return Math.atan2(y, x) * (180 / Math.PI);
    };
    
    seg.angleWithPrev = function() {
        if(this.prev == null) return 180;
        
        var angle = this.angleBetween(
            { x : this.end.x - this.begin.x, y : this.end.y - this.begin.y },
            { x : this.prev.x - this.begin.x, y : this.prev.y - this.begin.y });
        
        return angle < 0 ? angle + 360 : angle;
    };
    
    seg.angleWithNext = function() {
        if(this.next == null) return 180;
        
        var angle = this.angleBetween(
            { x : this.begin.x - this.end.x, y : this.begin.y - this.end.y },
            { x : this.next.x - this.end.x, y : this.next.y - this.end.y });
        
        return angle < 0 ? angle + 360 : angle;
    };
}

// src/pointer.js
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
// src/poly2tri.min.js
/*! poly2tri v1.5.0 | (c) 2009-2017 Poly2Tri Contributors */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n;n="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,n.poly2tri=t()}}(function(){return function t(n,e,i){function o(s,p){if(!e[s]){if(!n[s]){var a="function"==typeof require&&require;if(!p&&a)return a(s,!0);if(r)return r(s,!0);var h=new Error("Cannot find module '"+s+"'");throw h.code="MODULE_NOT_FOUND",h}var u=e[s]={exports:{}};n[s][0].call(u.exports,function(t){var e=n[s][1][t];return o(e||t)},u,u.exports,t,n,e,i)}return e[s].exports}for(var r="function"==typeof require&&require,s=0;s<i.length;s++)o(i[s]);return o}({1:[function(t,n,e){n.exports={version:"1.5.0"}},{}],2:[function(t,n,e){"use strict";var i=function(t,n){this.point=t,this.triangle=n||null,this.next=null,this.prev=null,this.value=t.x},o=function(t,n){this.head_=t,this.tail_=n,this.search_node_=t};o.prototype.head=function(){return this.head_},o.prototype.setHead=function(t){this.head_=t},o.prototype.tail=function(){return this.tail_},o.prototype.setTail=function(t){this.tail_=t},o.prototype.search=function(){return this.search_node_},o.prototype.setSearch=function(t){this.search_node_=t},o.prototype.findSearchNode=function(){return this.search_node_},o.prototype.locateNode=function(t){var n=this.search_node_;if(t<n.value){for(;n=n.prev;)if(t>=n.value)return this.search_node_=n,n}else for(;n=n.next;)if(t<n.value)return this.search_node_=n.prev,n.prev;return null},o.prototype.locatePoint=function(t){var n=t.x,e=this.findSearchNode(n),i=e.point.x;if(n===i){if(t!==e.point)if(t===e.prev.point)e=e.prev;else{if(t!==e.next.point)throw new Error("poly2tri Invalid AdvancingFront.locatePoint() call");e=e.next}}else if(n<i)for(;(e=e.prev)&&t!==e.point;);else for(;(e=e.next)&&t!==e.point;);return e&&(this.search_node_=e),e},n.exports=o,n.exports.Node=i},{}],3:[function(t,n,e){"use strict";function i(t,n){if(!t)throw new Error(n||"Assert Failed")}n.exports=i},{}],4:[function(t,n,e){"use strict";var i=t("./xy"),o=function(t,n){this.x=+t||0,this.y=+n||0,this._p2t_edge_list=null};o.prototype.toString=function(){return i.toStringBase(this)},o.prototype.toJSON=function(){return{x:this.x,y:this.y}},o.prototype.clone=function(){return new o(this.x,this.y)},o.prototype.set_zero=function(){return this.x=0,this.y=0,this},o.prototype.set=function(t,n){return this.x=+t||0,this.y=+n||0,this},o.prototype.negate=function(){return this.x=-this.x,this.y=-this.y,this},o.prototype.add=function(t){return this.x+=t.x,this.y+=t.y,this},o.prototype.sub=function(t){return this.x-=t.x,this.y-=t.y,this},o.prototype.mul=function(t){return this.x*=t,this.y*=t,this},o.prototype.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)},o.prototype.normalize=function(){var t=this.length();return this.x/=t,this.y/=t,t},o.prototype.equals=function(t){return this.x===t.x&&this.y===t.y},o.negate=function(t){return new o(-t.x,-t.y)},o.add=function(t,n){return new o(t.x+n.x,t.y+n.y)},o.sub=function(t,n){return new o(t.x-n.x,t.y-n.y)},o.mul=function(t,n){return new o(t*n.x,t*n.y)},o.cross=function(t,n){return"number"==typeof t?"number"==typeof n?t*n:new o(-t*n.y,t*n.x):"number"==typeof n?new o(n*t.y,-n*t.x):t.x*n.y-t.y*n.x},o.toString=i.toString,o.compare=i.compare,o.cmp=i.compare,o.equals=i.equals,o.dot=function(t,n){return t.x*n.x+t.y*n.y},n.exports=o},{"./xy":11}],5:[function(t,n,e){"use strict";var i=t("./xy"),o=function(t,n){this.name="PointError",this.points=n=n||[],this.message=t||"Invalid Points!";for(var e=0;e<n.length;e++)this.message+=" "+i.toString(n[e])};o.prototype=new Error,o.prototype.constructor=o,n.exports=o},{"./xy":11}],6:[function(t,n,e){(function(n){"use strict";var i=n.poly2tri;e.noConflict=function(){return n.poly2tri=i,e},e.VERSION=t("../dist/version.json").version,e.PointError=t("./pointerror"),e.Point=t("./point"),e.Triangle=t("./triangle"),e.SweepContext=t("./sweepcontext");var o=t("./sweep");e.triangulate=o.triangulate,e.sweep={Triangulate:o.triangulate}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"../dist/version.json":1,"./point":4,"./pointerror":5,"./sweep":7,"./sweepcontext":8,"./triangle":9}],7:[function(t,n,e){"use strict";function i(t){t.initTriangulation(),t.createAdvancingFront(),o(t),r(t)}function o(t){var n,e=t.pointCount();for(n=1;n<e;++n)for(var i=t.getPoint(n),o=s(t,i),r=i._p2t_edge_list,a=0;r&&a<r.length;++a)p(t,r[a],o)}function r(t){for(var n=t.front().head().next.triangle,e=t.front().head().next.point;!n.getConstrainedEdgeCW(e);)n=n.neighborCCW(e);t.meshClean(n)}function s(t,n){var e=t.locateNode(n),i=u(t,n,e);return n.x<=e.point.x+F&&d(t,e),g(t,i),i}function p(t,n,e){t.edge_event.constrained_edge=n,t.edge_event.right=n.p.x>n.q.x,h(e.triangle,n.p,n.q)||(C(t,n,e),a(t,n.p,n.q,e.triangle,n.q))}function a(t,n,e,i,o){if(!h(i,n,e)){var r=i.pointCCW(o),s=z(e,r,n);if(s===M.COLLINEAR)throw new D("poly2tri EdgeEvent: Collinear not supported!",[e,r,n]);var p=i.pointCW(o),u=z(e,p,n);if(u===M.COLLINEAR)throw new D("poly2tri EdgeEvent: Collinear not supported!",[e,p,n]);s===u?(i=s===M.CW?i.neighborCCW(o):i.neighborCW(o),a(t,n,e,i,o)):q(t,n,e,i,o)}}function h(t,n,e){var i=t.edgeIndex(n,e);if(-1!==i){t.markConstrainedEdgeByIndex(i);var o=t.getNeighbor(i);return o&&o.markConstrainedEdgeByPoints(n,e),!0}return!1}function u(t,n,e){var i=new O(n,e.point,e.next.point);i.markNeighbor(e.triangle),t.addToMap(i);var o=new L(n);return o.next=e.next,o.prev=e,e.next.prev=o,e.next=o,l(t,i)||t.mapTriangleToNodes(i),o}function d(t,n){var e=new O(n.prev.point,n.point,n.next.point);e.markNeighbor(n.prev.triangle),e.markNeighbor(n.triangle),t.addToMap(e),n.prev.next=n.next,n.next.prev=n.prev,l(t,e)||t.mapTriangleToNodes(e)}function g(t,n){for(var e=n.next;e.next&&!j(e.point,e.next.point,e.prev.point);)d(t,e),e=e.next;for(e=n.prev;e.prev&&!j(e.point,e.next.point,e.prev.point);)d(t,e),e=e.prev;n.next&&n.next.next&&f(n)&&y(t,n)}function f(t){var n=t.point.x-t.next.next.point.x,e=t.point.y-t.next.next.point.y;return S(e>=0,"unordered y"),n>=0||Math.abs(n)<e}function l(t,n){for(var e=0;e<3;++e)if(!n.delaunay_edge[e]){var i=n.getNeighbor(e);if(i){var o=n.getPoint(e),r=i.oppositePoint(n,o),s=i.index(r);if(i.constrained_edge[s]||i.delaunay_edge[s]){n.constrained_edge[e]=i.constrained_edge[s];continue}var p=c(o,n.pointCCW(o),n.pointCW(o),r);if(p){n.delaunay_edge[e]=!0,i.delaunay_edge[s]=!0,_(n,o,i,r);var a=!l(t,n);return a&&t.mapTriangleToNodes(n),a=!l(t,i),a&&t.mapTriangleToNodes(i),n.delaunay_edge[e]=!1,i.delaunay_edge[s]=!1,!0}}}return!1}function c(t,n,e,i){var o=t.x-i.x,r=t.y-i.y,s=n.x-i.x,p=n.y-i.y,a=o*p,h=s*r,u=a-h;if(u<=0)return!1;var d=e.x-i.x,g=e.y-i.y,f=d*r,l=o*g,c=f-l;return!(c<=0)&&(o*o+r*r)*(s*g-d*p)+(s*s+p*p)*c+(d*d+g*g)*u>0}function _(t,n,e,i){var o,r,s,p;o=t.neighborCCW(n),r=t.neighborCW(n),s=e.neighborCCW(i),p=e.neighborCW(i);var a,h,u,d;a=t.getConstrainedEdgeCCW(n),h=t.getConstrainedEdgeCW(n),u=e.getConstrainedEdgeCCW(i),d=e.getConstrainedEdgeCW(i);var g,f,l,c;g=t.getDelaunayEdgeCCW(n),f=t.getDelaunayEdgeCW(n),l=e.getDelaunayEdgeCCW(i),c=e.getDelaunayEdgeCW(i),t.legalize(n,i),e.legalize(i,n),e.setDelaunayEdgeCCW(n,g),t.setDelaunayEdgeCW(n,f),t.setDelaunayEdgeCCW(i,l),e.setDelaunayEdgeCW(i,c),e.setConstrainedEdgeCCW(n,a),t.setConstrainedEdgeCW(n,h),t.setConstrainedEdgeCCW(i,u),e.setConstrainedEdgeCW(i,d),t.clearNeighbors(),e.clearNeighbors(),o&&e.markNeighbor(o),r&&t.markNeighbor(r),s&&t.markNeighbor(s),p&&e.markNeighbor(p),t.markNeighbor(e)}function y(t,n){for(z(n.point,n.next.point,n.next.next.point)===M.CCW?t.basin.left_node=n.next.next:t.basin.left_node=n.next,t.basin.bottom_node=t.basin.left_node;t.basin.bottom_node.next&&t.basin.bottom_node.point.y>=t.basin.bottom_node.next.point.y;)t.basin.bottom_node=t.basin.bottom_node.next;if(t.basin.bottom_node!==t.basin.left_node){for(t.basin.right_node=t.basin.bottom_node;t.basin.right_node.next&&t.basin.right_node.point.y<t.basin.right_node.next.point.y;)t.basin.right_node=t.basin.right_node.next;t.basin.right_node!==t.basin.bottom_node&&(t.basin.width=t.basin.right_node.point.x-t.basin.left_node.point.x,t.basin.left_highest=t.basin.left_node.point.y>t.basin.right_node.point.y,x(t,t.basin.bottom_node))}}function x(t,n){if(!v(t,n)){d(t,n);if(n.prev!==t.basin.left_node||n.next!==t.basin.right_node){if(n.prev===t.basin.left_node){if(z(n.point,n.next.point,n.next.next.point)===M.CW)return;n=n.next}else if(n.next===t.basin.right_node){if(z(n.point,n.prev.point,n.prev.prev.point)===M.CCW)return;n=n.prev}else n=n.prev.point.y<n.next.point.y?n.prev:n.next;x(t,n)}}}function v(t,n){var e;return e=t.basin.left_highest?t.basin.left_node.point.y-n.point.y:t.basin.right_node.point.y-n.point.y,t.basin.width>e}function C(t,n,e){t.edge_event.right?b(t,n,e):w(t,n,e)}function b(t,n,e){for(;e.next.point.x<n.p.x;)z(n.q,e.next.point,n.p)===M.CCW?m(t,n,e):e=e.next}function m(t,n,e){e.point.x<n.p.x&&(z(e.point,e.next.point,e.next.next.point)===M.CCW?W(t,n,e):(E(t,n,e),m(t,n,e)))}function W(t,n,e){d(t,e.next),e.next.point!==n.p&&z(n.q,e.next.point,n.p)===M.CCW&&z(e.point,e.next.point,e.next.next.point)===M.CCW&&W(t,n,e)}function E(t,n,e){z(e.next.point,e.next.next.point,e.next.next.next.point)===M.CCW?W(t,n,e.next):z(n.q,e.next.next.point,n.p)===M.CCW&&E(t,n,e.next)}function w(t,n,e){for(;e.prev.point.x>n.p.x;)z(n.q,e.prev.point,n.p)===M.CW?P(t,n,e):e=e.prev}function P(t,n,e){e.point.x>n.p.x&&(z(e.point,e.prev.point,e.prev.prev.point)===M.CW?T(t,n,e):(N(t,n,e),P(t,n,e)))}function N(t,n,e){z(e.prev.point,e.prev.prev.point,e.prev.prev.prev.point)===M.CW?T(t,n,e.prev):z(n.q,e.prev.prev.point,n.p)===M.CW&&N(t,n,e.prev)}function T(t,n,e){d(t,e.prev),e.prev.point!==n.p&&z(n.q,e.prev.point,n.p)===M.CW&&z(e.point,e.prev.point,e.prev.prev.point)===M.CW&&T(t,n,e)}function q(t,n,e,i,o){var r=i.neighborAcross(o);S(r,"FLIP failed due to missing triangle!");var s=r.oppositePoint(i,o);if(i.getConstrainedEdgeAcross(o)){var p=i.index(o);throw new D("poly2tri Intersecting Constraints",[o,s,i.getPoint((p+1)%3),i.getPoint((p+2)%3)])}if(H(o,i.pointCCW(o),i.pointCW(o),s))if(_(i,o,r,s),t.mapTriangleToNodes(i),t.mapTriangleToNodes(r),o===e&&s===n)e===t.edge_event.constrained_edge.q&&n===t.edge_event.constrained_edge.p&&(i.markConstrainedEdgeByPoints(n,e),r.markConstrainedEdgeByPoints(n,e),l(t,i),l(t,r));else{var h=z(e,s,n);i=I(t,h,i,r,o,s),q(t,n,e,i,o)}else{A(t,n,e,i,r,k(n,e,r,s)),a(t,n,e,i,o)}}function I(t,n,e,i,o,r){var s;return n===M.CCW?(s=i.edgeIndex(o,r),i.delaunay_edge[s]=!0,l(t,i),i.clearDelaunayEdges(),e):(s=e.edgeIndex(o,r),e.delaunay_edge[s]=!0,l(t,e),e.clearDelaunayEdges(),i)}function k(t,n,e,i){var o=z(n,i,t);if(o===M.CW)return e.pointCCW(i);if(o===M.CCW)return e.pointCW(i);throw new D("poly2tri [Unsupported] nextFlipPoint: opposing point on constrained edge!",[n,i,t])}function A(t,n,e,i,o,r){var s=o.neighborAcross(r);S(s,"FLIP failed due to missing triangle");var p=s.oppositePoint(o,r);if(H(e,i.pointCCW(e),i.pointCW(e),p))q(t,e,p,s,p);else{A(t,n,e,i,s,k(n,e,s,p))}}var S=t("./assert"),D=t("./pointerror"),O=t("./triangle"),L=t("./advancingfront").Node,B=t("./utils"),F=B.EPSILON,M=B.Orientation,z=B.orient2d,H=B.inScanArea,j=B.isAngleObtuse;e.triangulate=i},{"./advancingfront":2,"./assert":3,"./pointerror":5,"./triangle":9,"./utils":10}],8:[function(t,n,e){"use strict";var i=t("./pointerror"),o=t("./point"),r=t("./triangle"),s=t("./sweep"),p=t("./advancingfront"),a=p.Node,h=function(t,n){if(this.p=t,this.q=n,t.y>n.y)this.q=t,this.p=n;else if(t.y===n.y)if(t.x>n.x)this.q=t,this.p=n;else if(t.x===n.x)throw new i("poly2tri Invalid Edge constructor: repeated points!",[t]);this.q._p2t_edge_list||(this.q._p2t_edge_list=[]),this.q._p2t_edge_list.push(this)},u=function(){this.left_node=null,this.bottom_node=null,this.right_node=null,this.width=0,this.left_highest=!1};u.prototype.clear=function(){this.left_node=null,this.bottom_node=null,this.right_node=null,this.width=0,this.left_highest=!1};var d=function(){this.constrained_edge=null,this.right=!1},g=function(t,n){n=n||{},this.triangles_=[],this.map_=[],this.points_=n.cloneArrays?t.slice(0):t,this.edge_list=[],this.pmin_=this.pmax_=null,this.front_=null,this.head_=null,this.tail_=null,this.af_head_=null,this.af_middle_=null,this.af_tail_=null,this.basin=new u,this.edge_event=new d,this.initEdges(this.points_)};g.prototype.addHole=function(t){this.initEdges(t);var n,e=t.length;for(n=0;n<e;n++)this.points_.push(t[n]);return this},g.prototype.AddHole=g.prototype.addHole,g.prototype.addHoles=function(t){var n,e=t.length;for(n=0;n<e;n++)this.initEdges(t[n]);return this.points_=this.points_.concat.apply(this.points_,t),this},g.prototype.addPoint=function(t){return this.points_.push(t),this},g.prototype.AddPoint=g.prototype.addPoint,g.prototype.addPoints=function(t){return this.points_=this.points_.concat(t),this},g.prototype.triangulate=function(){return s.triangulate(this),this},g.prototype.getBoundingBox=function(){return{min:this.pmin_,max:this.pmax_}},g.prototype.getTriangles=function(){return this.triangles_},g.prototype.GetTriangles=g.prototype.getTriangles,g.prototype.front=function(){return this.front_},g.prototype.pointCount=function(){return this.points_.length},g.prototype.head=function(){return this.head_},g.prototype.setHead=function(t){this.head_=t},g.prototype.tail=function(){return this.tail_},g.prototype.setTail=function(t){this.tail_=t},g.prototype.getMap=function(){return this.map_},g.prototype.initTriangulation=function(){var t,n=this.points_[0].x,e=this.points_[0].x,i=this.points_[0].y,r=this.points_[0].y,s=this.points_.length;for(t=1;t<s;t++){var p=this.points_[t];p.x>n&&(n=p.x),p.x<e&&(e=p.x),p.y>i&&(i=p.y),p.y<r&&(r=p.y)}this.pmin_=new o(e,r),this.pmax_=new o(n,i);var a=.3*(n-e),h=.3*(i-r);this.head_=new o(n+a,r-h),this.tail_=new o(e-a,r-h),this.points_.sort(o.compare)},g.prototype.initEdges=function(t){var n,e=t.length;for(n=0;n<e;++n)this.edge_list.push(new h(t[n],t[(n+1)%e]))},g.prototype.getPoint=function(t){return this.points_[t]},g.prototype.addToMap=function(t){this.map_.push(t)},g.prototype.locateNode=function(t){return this.front_.locateNode(t.x)},g.prototype.createAdvancingFront=function(){var t,n,e,i=new r(this.points_[0],this.tail_,this.head_);this.map_.push(i),t=new a(i.getPoint(1),i),n=new a(i.getPoint(0),i),e=new a(i.getPoint(2)),this.front_=new p(t,e),t.next=n,n.next=e,n.prev=t,e.prev=n},g.prototype.removeNode=function(t){},g.prototype.mapTriangleToNodes=function(t){for(var n=0;n<3;++n)if(!t.getNeighbor(n)){var e=this.front_.locatePoint(t.pointCW(t.getPoint(n)));e&&(e.triangle=t)}},g.prototype.removeFromMap=function(t){var n,e=this.map_,i=e.length;for(n=0;n<i;n++)if(e[n]===t){e.splice(n,1);break}},g.prototype.meshClean=function(t){for(var n,e,i=[t];n=i.pop();)if(!n.isInterior())for(n.setInterior(!0),this.triangles_.push(n),e=0;e<3;e++)n.constrained_edge[e]||i.push(n.getNeighbor(e))},n.exports=g},{"./advancingfront":2,"./point":4,"./pointerror":5,"./sweep":7,"./triangle":9}],9:[function(t,n,e){"use strict";var i=t("./xy"),o=function(t,n,e){this.points_=[t,n,e],this.neighbors_=[null,null,null],this.interior_=!1,this.constrained_edge=[!1,!1,!1],this.delaunay_edge=[!1,!1,!1]},r=i.toString;o.prototype.toString=function(){return"["+r(this.points_[0])+r(this.points_[1])+r(this.points_[2])+"]"},o.prototype.getPoint=function(t){return this.points_[t]},o.prototype.GetPoint=o.prototype.getPoint,o.prototype.getPoints=function(){return this.points_},o.prototype.getNeighbor=function(t){return this.neighbors_[t]},o.prototype.containsPoint=function(t){var n=this.points_;return t===n[0]||t===n[1]||t===n[2]},o.prototype.containsEdge=function(t){return this.containsPoint(t.p)&&this.containsPoint(t.q)},o.prototype.containsPoints=function(t,n){return this.containsPoint(t)&&this.containsPoint(n)},o.prototype.isInterior=function(){return this.interior_},o.prototype.setInterior=function(t){return this.interior_=t,this},o.prototype.markNeighborPointers=function(t,n,e){var i=this.points_;if(t===i[2]&&n===i[1]||t===i[1]&&n===i[2])this.neighbors_[0]=e;else if(t===i[0]&&n===i[2]||t===i[2]&&n===i[0])this.neighbors_[1]=e;else{if(!(t===i[0]&&n===i[1]||t===i[1]&&n===i[0]))throw new Error("poly2tri Invalid Triangle.markNeighborPointers() call");this.neighbors_[2]=e}},o.prototype.markNeighbor=function(t){var n=this.points_;t.containsPoints(n[1],n[2])?(this.neighbors_[0]=t,t.markNeighborPointers(n[1],n[2],this)):t.containsPoints(n[0],n[2])?(this.neighbors_[1]=t,t.markNeighborPointers(n[0],n[2],this)):t.containsPoints(n[0],n[1])&&(this.neighbors_[2]=t,t.markNeighborPointers(n[0],n[1],this))},o.prototype.clearNeighbors=function(){this.neighbors_[0]=null,this.neighbors_[1]=null,this.neighbors_[2]=null},o.prototype.clearDelaunayEdges=function(){this.delaunay_edge[0]=!1,this.delaunay_edge[1]=!1,this.delaunay_edge[2]=!1},o.prototype.pointCW=function(t){var n=this.points_;return t===n[0]?n[2]:t===n[1]?n[0]:t===n[2]?n[1]:null},o.prototype.pointCCW=function(t){var n=this.points_;return t===n[0]?n[1]:t===n[1]?n[2]:t===n[2]?n[0]:null},o.prototype.neighborCW=function(t){return t===this.points_[0]?this.neighbors_[1]:t===this.points_[1]?this.neighbors_[2]:this.neighbors_[0]},o.prototype.neighborCCW=function(t){return t===this.points_[0]?this.neighbors_[2]:t===this.points_[1]?this.neighbors_[0]:this.neighbors_[1]},o.prototype.getConstrainedEdgeCW=function(t){return t===this.points_[0]?this.constrained_edge[1]:t===this.points_[1]?this.constrained_edge[2]:this.constrained_edge[0]},o.prototype.getConstrainedEdgeCCW=function(t){return t===this.points_[0]?this.constrained_edge[2]:t===this.points_[1]?this.constrained_edge[0]:this.constrained_edge[1]},o.prototype.getConstrainedEdgeAcross=function(t){return t===this.points_[0]?this.constrained_edge[0]:t===this.points_[1]?this.constrained_edge[1]:this.constrained_edge[2]},o.prototype.setConstrainedEdgeCW=function(t,n){t===this.points_[0]?this.constrained_edge[1]=n:t===this.points_[1]?this.constrained_edge[2]=n:this.constrained_edge[0]=n},o.prototype.setConstrainedEdgeCCW=function(t,n){t===this.points_[0]?this.constrained_edge[2]=n:t===this.points_[1]?this.constrained_edge[0]=n:this.constrained_edge[1]=n},o.prototype.getDelaunayEdgeCW=function(t){return t===this.points_[0]?this.delaunay_edge[1]:t===this.points_[1]?this.delaunay_edge[2]:this.delaunay_edge[0]},o.prototype.getDelaunayEdgeCCW=function(t){return t===this.points_[0]?this.delaunay_edge[2]:t===this.points_[1]?this.delaunay_edge[0]:this.delaunay_edge[1]},o.prototype.setDelaunayEdgeCW=function(t,n){t===this.points_[0]?this.delaunay_edge[1]=n:t===this.points_[1]?this.delaunay_edge[2]=n:this.delaunay_edge[0]=n},o.prototype.setDelaunayEdgeCCW=function(t,n){t===this.points_[0]?this.delaunay_edge[2]=n:t===this.points_[1]?this.delaunay_edge[0]=n:this.delaunay_edge[1]=n},o.prototype.neighborAcross=function(t){return t===this.points_[0]?this.neighbors_[0]:t===this.points_[1]?this.neighbors_[1]:this.neighbors_[2]},o.prototype.oppositePoint=function(t,n){var e=t.pointCW(n);return this.pointCW(e)},o.prototype.legalize=function(t,n){var e=this.points_;if(t===e[0])e[1]=e[0],e[0]=e[2],e[2]=n;else if(t===e[1])e[2]=e[1],e[1]=e[0],e[0]=n;else{if(t!==e[2])throw new Error("poly2tri Invalid Triangle.legalize() call");e[0]=e[2],e[2]=e[1],e[1]=n}},o.prototype.index=function(t){var n=this.points_;if(t===n[0])return 0;if(t===n[1])return 1;if(t===n[2])return 2;throw new Error("poly2tri Invalid Triangle.index() call")},o.prototype.edgeIndex=function(t,n){var e=this.points_;if(t===e[0]){if(n===e[1])return 2;if(n===e[2])return 1}else if(t===e[1]){if(n===e[2])return 0;if(n===e[0])return 2}else if(t===e[2]){if(n===e[0])return 1;if(n===e[1])return 0}return-1},o.prototype.markConstrainedEdgeByIndex=function(t){this.constrained_edge[t]=!0},o.prototype.markConstrainedEdgeByEdge=function(t){this.markConstrainedEdgeByPoints(t.p,t.q)},o.prototype.markConstrainedEdgeByPoints=function(t,n){var e=this.points_;n===e[0]&&t===e[1]||n===e[1]&&t===e[0]?this.constrained_edge[2]=!0:n===e[0]&&t===e[2]||n===e[2]&&t===e[0]?this.constrained_edge[1]=!0:(n===e[1]&&t===e[2]||n===e[2]&&t===e[1])&&(this.constrained_edge[0]=!0)},n.exports=o},{"./xy":11}],10:[function(t,n,e){"use strict";function i(t,n,e){var i=(t.x-e.x)*(n.y-e.y),o=(t.y-e.y)*(n.x-e.x),r=i-o;return r>-s&&r<s?p.COLLINEAR:r>0?p.CCW:p.CW}function o(t,n,e,i){return!((t.x-n.x)*(i.y-n.y)-(i.x-n.x)*(t.y-n.y)>=-s)&&!((t.x-e.x)*(i.y-e.y)-(i.x-e.x)*(t.y-e.y)<=s)}function r(t,n,e){var i=n.x-t.x,o=n.y-t.y;return i*(e.x-t.x)+o*(e.y-t.y)<0}var s=1e-12;e.EPSILON=s;var p={CW:1,CCW:-1,COLLINEAR:0};e.Orientation=p,e.orient2d=i,e.inScanArea=o,e.isAngleObtuse=r},{}],11:[function(t,n,e){"use strict";function i(t){return"("+t.x+";"+t.y+")"}function o(t){var n=t.toString();return"[object Object]"===n?i(t):n}function r(t,n){return t.y===n.y?t.x-n.x:t.y-n.y}function s(t,n){return t.x===n.x&&t.y===n.y}n.exports={toString:o,toStringBase:i,compare:r,equals:s}},{}]},{},[6])(6)});
// src/raytracer.js
// Provides a convenient raytracing interface.

// ### new GL.HitTest([t, hit, normal])
//
// This is the object used to return hit test results. If there are no
// arguments, the constructed argument represents a hit infinitely far
// away.
function HitTest(t, hit, normal) {
  this.t = arguments.length ? t : Number.MAX_VALUE;
  this.hit = hit;
  this.normal = normal;
}

// ### .mergeWith(other)
//
// Changes this object to be the closer of the two hit test results.
HitTest.prototype = {
  mergeWith: function(other) {
    if (other.t > 0 && other.t < this.t) {
      this.t = other.t;
      this.hit = other.hit;
      this.normal = other.normal;
    }
  }
};

// ### new GL.Raytracer()
//
// This will read the current modelview matrix, projection matrix, and viewport,
// reconstruct the eye position, and store enough information to later generate
// per-pixel rays using `getRayForPixel()`.
//
// Example usage:
//
//     var tracer = new GL.Raytracer();
//     var ray = tracer.getRayForPixel(
//       gl.canvas.width / 2,
//       gl.canvas.height / 2);
//     var result = GL.Raytracer.hitTestSphere(
//       tracer.eye, ray, new GL.Vector(0, 0, 0), 1);
function Raytracer() {
  var v = gl.getParameter(gl.VIEWPORT);
  var m = gl.modelviewMatrix.m;

  var axisX = new Vector(m[0], m[4], m[8]);
  var axisY = new Vector(m[1], m[5], m[9]);
  var axisZ = new Vector(m[2], m[6], m[10]);
  var offset = new Vector(m[3], m[7], m[11]);
  this.eye = new Vector(-offset.dot(axisX), -offset.dot(axisY), -offset.dot(axisZ));

  var minX = v[0], maxX = minX + v[2];
  var minY = v[1], maxY = minY + v[3];
  this.ray00 = gl.unProject(minX, minY, 1).subtract(this.eye);
  this.ray10 = gl.unProject(maxX, minY, 1).subtract(this.eye);
  this.ray01 = gl.unProject(minX, maxY, 1).subtract(this.eye);
  this.ray11 = gl.unProject(maxX, maxY, 1).subtract(this.eye);
  this.viewport = v;
}

Raytracer.prototype = {
  // ### .getRayForPixel(x, y)
  //
  // Returns the ray originating from the camera and traveling through the pixel `x, y`.
  getRayForPixel: function(x, y) {
    x = (x - this.viewport[0]) / this.viewport[2];
    y = 1 - (y - this.viewport[1]) / this.viewport[3];
    var ray0 = Vector.lerp(this.ray00, this.ray10, x);
    var ray1 = Vector.lerp(this.ray01, this.ray11, x);
    return Vector.lerp(ray0, ray1, y).unit();
  }
};

// ### GL.Raytracer.hitTestBox(origin, ray, min, max)
//
// Traces the ray starting from `origin` along `ray` against the axis-aligned box
// whose coordinates extend from `min` to `max`. Returns a `HitTest` with the
// information or `null` for no intersection.
//
// This implementation uses the [slab intersection method](http://www.siggraph.org/education/materials/HyperGraph/raytrace/rtinter3.htm).
Raytracer.hitTestBox = function(origin, ray, min, max) {
  var tMin = min.subtract(origin).divide(ray);
  var tMax = max.subtract(origin).divide(ray);
  var t1 = Vector.min(tMin, tMax);
  var t2 = Vector.max(tMin, tMax);
  var tNear = t1.max();
  var tFar = t2.min();

  if (tNear > 0 && tNear < tFar) {
    var epsilon = 1.0e-6, hit = origin.add(ray.multiply(tNear));
    min = min.add(epsilon);
    max = max.subtract(epsilon);
    return new HitTest(tNear, hit, new Vector(
      (hit.x > max.x) - (hit.x < min.x),
      (hit.y > max.y) - (hit.y < min.y),
      (hit.z > max.z) - (hit.z < min.z)
    ));
  }

  return null;
};

// ### GL.Raytracer.hitTestSphere(origin, ray, center, radius)
//
// Traces the ray starting from `origin` along `ray` against the sphere defined
// by `center` and `radius`. Returns a `HitTest` with the information or `null`
// for no intersection.
Raytracer.hitTestSphere = function(origin, ray, center, radius) {
  var offset = origin.subtract(center);
  var a = ray.dot(ray);
  var b = 2 * ray.dot(offset);
  var c = offset.dot(offset) - radius * radius;
  var discriminant = b * b - 4 * a * c;

  if (discriminant > 0) {
    var t = (-b - Math.sqrt(discriminant)) / (2 * a), hit = origin.add(ray.multiply(t));
    return new HitTest(t, hit, hit.subtract(center).divide(radius));
  }

  return null;
};

// ### GL.Raytracer.hitTestTriangle(origin, ray, a, b, c)
//
// Traces the ray starting from `origin` along `ray` against the triangle defined
// by the points `a`, `b`, and `c`. Returns a `HitTest` with the information or
// `null` for no intersection.
Raytracer.hitTestTriangle = function(origin, ray, a, b, c) {
  var ab = b.subtract(a);
  var ac = c.subtract(a);
  var normal = ab.cross(ac).unit();
  var t = normal.dot(a.subtract(origin)) / normal.dot(ray);

  if (t > 0) {
    var hit = origin.add(ray.multiply(t));
    var toHit = hit.subtract(a);
    var dot00 = ac.dot(ac);
    var dot01 = ac.dot(ab);
    var dot02 = ac.dot(toHit);
    var dot11 = ab.dot(ab);
    var dot12 = ab.dot(toHit);
    var divide = dot00 * dot11 - dot01 * dot01;
    var u = (dot11 * dot02 - dot01 * dot12) / divide;
    var v = (dot00 * dot12 - dot01 * dot02) / divide;
    if (u >= 0 && v >= 0 && u + v <= 1) return new HitTest(t, hit, normal);
  }

  return null;
};

// src/shader.js
// Example usage:
//
//     var shader = new GL.Shader('\
//       void main() {\
//         gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;\
//       }\
//     ', '\
//       uniform vec4 color;\
//       void main() {\
//         gl_FragColor = color;\
//       }\
//     ');
//
//     shader.uniforms({
//       color: [1, 0, 0, 1]
//     }).draw(mesh);

function regexMap(regex, text, callback) {
    while ((result = regex.exec(text)) != null) {
        callback(result);
    }
}

var LIGHTGL_PREFIX = 'LIGHTGL';

function Shader(vertexSource, fragmentSource) {
    function followScriptTagById(id) {
        var element = document.getElementById(id);
        return element ? element.text : id;
    }
    vertexSource = followScriptTagById(vertexSource);
    fragmentSource = followScriptTagById(fragmentSource);
    
    var header = '\
    uniform mat3 gl_NormalMatrix;\
    uniform mat4 gl_ModelViewMatrix;\
    uniform mat4 gl_ProjectionMatrix;\
    uniform mat4 gl_ModelViewProjectionMatrix;\
    uniform mat4 gl_ModelViewMatrixInverse;\
    uniform mat4 gl_ProjectionMatrixInverse;\
    uniform mat4 gl_ModelViewProjectionMatrixInverse;\
    ';
    var vertexHeader = header + '\
    attribute vec4 gl_Vertex;\
    attribute vec4 gl_TexCoord;\
    attribute vec3 gl_Normal;\
    attribute vec4 gl_Color;\
    vec4 ftransform() {\
        return gl_ModelViewProjectionMatrix * gl_Vertex;\
    }\
    ';
    var fragmentHeader = '\
    precision highp float;\
    ' + header;
    
    var source = vertexSource + fragmentSource;
    var usedMatrices = {};
    regexMap(/\b(gl_[^;]*)\b;/g, header, function(groups) {
        var name = groups[1];
        if (source.indexOf(name) != -1) {
            var capitalLetters = name.replace(/[a-z_]/g, '');
            usedMatrices[capitalLetters] = LIGHTGL_PREFIX + name;
        }
    });
    if (source.indexOf('ftransform') != -1) usedMatrices.MVPM = LIGHTGL_PREFIX + 'gl_ModelViewProjectionMatrix';
    this.usedMatrices = usedMatrices;
    
    function fix(header, source) {
        var replaced = {};
        var match = /^((\s*\/\/.*\n|\s*#extension.*\n)+)[^]*$/.exec(source);
        source = match ? match[1] + header + source.substr(match[1].length) : header + source;
        regexMap(/\bgl_\w+\b/g, header, function(result) {
            if (!(result in replaced)) {
                source = source.replace(new RegExp('\\b' + result + '\\b', 'g'), LIGHTGL_PREFIX + result);
                replaced[result] = true;
            }
        });
        return source;
    }
    vertexSource = fix(vertexHeader, vertexSource);
    fragmentSource = fix(fragmentHeader, fragmentSource);
    
    function compileSource(type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error('compile error: ' + gl.getShaderInfoLog(shader));
        }
        return shader;
    }
    this.program = gl.createProgram();
    gl.attachShader(this.program, compileSource(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(this.program, compileSource(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        throw new Error('link error: ' + gl.getProgramInfoLog(this.program));
    }
    this.attributes = {};
    this.uniformLocations = {};
    
    var isSampler = {};
    regexMap(/uniform\s+sampler(1D|2D|3D|Cube)\s+(\w+)\s*;/g, vertexSource + fragmentSource, function(groups) {
        isSampler[groups[2]] = 1;
    });
    this.isSampler = isSampler;
}

function isArray(obj) {
    var str = Object.prototype.toString.call(obj);
    return str == '[object Array]' || str == '[object Float32Array]';
}

function isNumber(obj) {
    var str = Object.prototype.toString.call(obj);
    return str == '[object Number]' || str == '[object Boolean]';
}

var tempMatrix = new Matrix();
var resultMatrix = new Matrix();

Shader.prototype = {
    uniforms: function(uniforms) {
        gl.useProgram(this.program);
        
        for (var name in uniforms) {
            var location = this.uniformLocations[name] || gl.getUniformLocation(this.program, name);
            if (!location) continue;
            this.uniformLocations[name] = location;
            var value = uniforms[name];
            if (value instanceof Vector) {
                value = [value.x, value.y, value.z];
            } else if (value instanceof Matrix) {
                value = value.m;
            }
            if (isArray(value)) {
                switch (value.length) {
                    case 1: gl.uniform1fv(location, new Float32Array(value)); break;
                    case 2: gl.uniform2fv(location, new Float32Array(value)); break;
                    case 3: gl.uniform3fv(location, new Float32Array(value)); break;
                    case 4: gl.uniform4fv(location, new Float32Array(value)); break;
                    case 9: gl.uniformMatrix3fv(location, false, new Float32Array([
                        value[0], value[3], value[6],
                        value[1], value[4], value[7],
                        value[2], value[5], value[8]
                        ])); break;
                    case 16: gl.uniformMatrix4fv(location, false, new Float32Array([
                        value[0], value[4], value[8], value[12],
                        value[1], value[5], value[9], value[13],
                        value[2], value[6], value[10], value[14],
                        value[3], value[7], value[11], value[15]
                        ])); break;
                    default: throw new Error('don\'t know how to load uniform "' + name + '" of length ' + value.length);
                    }
                } else if (isNumber(value)) {
                    (this.isSampler[name] ? gl.uniform1i : gl.uniform1f).call(gl, location, value);
                } else {
                    throw new Error('attempted to set uniform "' + name + '" to invalid value ' + value);
                }
            }
            
            return this;
        },
        
        draw: function(mesh, mode) {
            this.drawBuffers(mesh.vertexBuffers,
                mesh.indexBuffers[mode == gl.LINES ? 'lines' : 'triangles'],
                arguments.length < 2 ? gl.TRIANGLES : mode);
        },
        
        drawBuffers: function(vertexBuffers, indexBuffer, mode) {
            var used = this.usedMatrices;
            var MVM = gl.modelviewMatrix;
            var PM = gl.projectionMatrix;
            var MVMI = (used.MVMI || used.NM) ? MVM.inverse() : null;
            var PMI = (used.PMI) ? PM.inverse() : null;
            var MVPM = (used.MVPM || used.MVPMI) ? PM.multiply(MVM) : null;
            var matrices = {};
            if (used.MVM) matrices[used.MVM] = MVM;
            if (used.MVMI) matrices[used.MVMI] = MVMI;
            if (used.PM) matrices[used.PM] = PM;
            if (used.PMI) matrices[used.PMI] = PMI;
            if (used.MVPM) matrices[used.MVPM] = MVPM;
            if (used.MVPMI) matrices[used.MVPMI] = MVPM.inverse();
            if (used.NM) {
                var m = MVMI.m;
                matrices[used.NM] = [m[0], m[4], m[8], m[1], m[5], m[9], m[2], m[6], m[10]];
            }
            this.uniforms(matrices);
            
            var length = 0;
            for (var attribute in vertexBuffers) {
                var buffer = vertexBuffers[attribute];
                var location = this.attributes[attribute] ||
                gl.getAttribLocation(this.program, attribute.replace(/^(gl_.*)$/, LIGHTGL_PREFIX + '$1'));
                if (location == -1 || !buffer.buffer) continue;
                this.attributes[attribute] = location;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
                gl.enableVertexAttribArray(location);
                gl.vertexAttribPointer(location, buffer.buffer.spacing, gl.FLOAT, false, 0, 0);
                length = buffer.buffer.length / buffer.buffer.spacing;
            }
            
            for (var attribute in this.attributes) {
                if (!(attribute in vertexBuffers)) {
                    gl.disableVertexAttribArray(this.attributes[attribute]);
                }
            }
            
            if (length && (!indexBuffer || indexBuffer.buffer)) {
                if (indexBuffer) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
                    gl.drawElements(mode, indexBuffer.buffer.length, gl.UNSIGNED_SHORT, 0);
                } else {
                    gl.drawArrays(mode, 0, length);
                }
            }
            
            return this;
        }
    };
    
// src/texture.js
// Provides a simple wrapper around WebGL textures that supports render-to-texture.

// ### new GL.Texture(width, height[, options])
//
// The arguments `width` and `height` give the size of the texture in texels.
// WebGL texture dimensions must be powers of two unless `filter` is set to
// either `gl.NEAREST` or `gl.LINEAR` and `wrap` is set to `gl.CLAMP_TO_EDGE`
// (which they are by default).
//
// Texture parameters can be passed in via the `options` argument.
// Example usage:
//
//     var t = new GL.Texture(256, 256, {
//       // Defaults to gl.LINEAR, set both at once with "filter"
//       magFilter: gl.NEAREST,
//       minFilter: gl.LINEAR,
//
//       // Defaults to gl.CLAMP_TO_EDGE, set both at once with "wrap"
//       wrapS: gl.REPEAT,
//       wrapT: gl.REPEAT,
//
//       format: gl.RGB, // Defaults to gl.RGBA
//       type: gl.FLOAT // Defaults to gl.UNSIGNED_BYTE
//     });
function Texture(width, height, options) {
  this.oneOverWidth = 1.0 / width;
  this.oneOverHeight = 1.0 / height;
    
  options = options || {};
  this.id = gl.createTexture();
  this.width = width;
  this.height = height;
  this.format = options.format || gl.RGBA;
  this.type = options.type || gl.UNSIGNED_BYTE;
  var magFilter = options.filter || options.magFilter || gl.LINEAR;
  var minFilter = options.filter || options.minFilter || gl.LINEAR;
  if (this.type === gl.FLOAT) {
    if (!Texture.canUseFloatingPointTextures()) {
      throw new Error('OES_texture_float is required but not supported');
    }
    if ((minFilter !== gl.NEAREST || magFilter !== gl.NEAREST) &&
        !Texture.canUseFloatingPointLinearFiltering()) {
      throw new Error('OES_texture_float_linear is required but not supported');
    }
  } else if (this.type === gl.HALF_FLOAT_OES) {
    if (!Texture.canUseHalfFloatingPointTextures()) {
      throw new Error('OES_texture_half_float is required but not supported');
    }
    if ((minFilter !== gl.NEAREST || magFilter !== gl.NEAREST) &&
        !Texture.canUseHalfFloatingPointLinearFiltering()) {
      throw new Error('OES_texture_half_float_linear is required but not supported');
    }
  }
  gl.bindTexture(gl.TEXTURE_2D, this.id);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.wrap || options.wrapS || gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.wrap || options.wrapT || gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, options.data || null);
}

var framebuffer;
var renderbuffer;
var checkerboardCanvas;
var pixelTexture;

Texture.prototype = {
  // ### .bind([unit])
  //
  // Bind this texture to the given texture unit (0-7, defaults to 0).
  bind: function(unit) {
    gl.activeTexture(gl.TEXTURE0 + (unit || 0));
    gl.bindTexture(gl.TEXTURE_2D, this.id);
  },

  // ### .unbind([unit])
  //
  // Clear the given texture unit (0-7, defaults to 0).
  unbind: function(unit) {
    gl.activeTexture(gl.TEXTURE0 + (unit || 0));
    gl.bindTexture(gl.TEXTURE_2D, null);
  },

  // ### .canDrawTo()
  //
  // Check if rendering to this texture is supported. It may not be supported
  // for floating-point textures on some configurations.
  canDrawTo: function() {
    framebuffer = framebuffer || gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);
    var result = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return result;
  },

  // ### .drawTo(callback)
  //
  // Render all draw calls in `callback` to this texture. This method sets up
  // a framebuffer with this texture as the color attachment and a renderbuffer
  // as the depth attachment. It also temporarily changes the viewport to the
  // size of the texture.
  //
  // Example usage:
  //
  //     texture.drawTo(function() {
  //       gl.clearColor(1, 0, 0, 1);
  //       gl.clear(gl.COLOR_BUFFER_BIT);
  //     });
  drawTo: function(callback) {
    var v = gl.getParameter(gl.VIEWPORT);
    framebuffer = framebuffer || gl.createFramebuffer();
    renderbuffer = renderbuffer || gl.createRenderbuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    if (this.width != renderbuffer.width || this.height != renderbuffer.height) {
      renderbuffer.width = this.width;
      renderbuffer.height = this.height;
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
    }
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('Rendering to this texture is not supported (incomplete framebuffer)');
    }
    gl.viewport(0, 0, this.width, this.height);

    callback();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.viewport(v[0], v[1], v[2], v[3]);
  },

  // ### .swapWith(other)
  //
  // Switch this texture with `other`, useful for the ping-pong rendering
  // technique used in multi-stage rendering.
  swapWith: function(other) {
    var temp;
    temp = other.id; other.id = this.id; this.id = temp;
    temp = other.width; other.width = this.width; this.width = temp;
    temp = other.height; other.height = this.height; this.height = temp;
  }
};

// ### GL.Texture.fromImage(image[, options])
//
// Return a new image created from `image`, an `<img>` tag.
Texture.fromImage = function(image, options) {
  options = options || {};
  var texture = new Texture(image.width, image.height, options);
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.format, texture.type, image);
  } catch (e) {
    if (location.protocol == 'file:') {
      throw new Error('image not loaded for security reasons (serve this page over "http://" instead)');
    } else {
      throw new Error('image not loaded for security reasons (image must originate from the same ' +
        'domain as this page or use Cross-Origin Resource Sharing)');
    }
  }
  if (options.minFilter && options.minFilter != gl.NEAREST && options.minFilter != gl.LINEAR) {
    gl.generateMipmap(gl.TEXTURE_2D);
  }
  return texture;
};

Texture.getPixel = function() {
    pixelTexture = pixelTexture || (function() {    
        var c = document.createElement('canvas').getContext('2d');
        c.canvas.width = c.canvas.height = 2;
        c.fillStyle = '#FFF';
        c.fillRect(0, 0, 2, 2);
        return Texture.fromImage(c.canvas);
    })();
    return pixelTexture;
};

// ### GL.Texture.fromURL(url[, options])
//
// Returns a checkerboard texture that will switch to the correct texture when
// it loads.
Texture.fromURL = function(url, options) {
  checkerboardCanvas = checkerboardCanvas || (function() {
    var c = document.createElement('canvas').getContext('2d');
    c.canvas.width = c.canvas.height = 128;
    for (var y = 0; y < c.canvas.height; y += 16) {
      for (var x = 0; x < c.canvas.width; x += 16) {
        c.fillStyle = (x ^ y) & 16 ? '#FFF' : '#DDD';
        c.fillRect(x, y, 16, 16);
      }
    }
    return c.canvas;
  })();
  var texture = Texture.fromImage(checkerboardCanvas, options);
  var image = new Image();
  var context = gl;
  image.onload = function() {
    context.makeCurrent();
    Texture.fromImage(image, options).swapWith(texture);
    if(texture.onloaded) texture.onloaded(texture.userToken);
  };
  image.src = url;
  return texture;
};

// ### GL.Texture.canUseFloatingPointTextures()
//
// Returns false if `gl.FLOAT` is not supported as a texture type. This is the
// `OES_texture_float` extension.
Texture.canUseFloatingPointTextures = function() {
  return !!gl.getExtension('OES_texture_float');
};

// ### GL.Texture.canUseFloatingPointLinearFiltering()
//
// Returns false if `gl.LINEAR` is not supported as a texture filter mode for
// textures of type `gl.FLOAT`. This is the `OES_texture_float_linear`
// extension.
Texture.canUseFloatingPointLinearFiltering = function() {
  return !!gl.getExtension('OES_texture_float_linear');
};

// ### GL.Texture.canUseFloatingPointTextures()
//
// Returns false if `gl.HALF_FLOAT_OES` is not supported as a texture type.
// This is the `OES_texture_half_float` extension.
Texture.canUseHalfFloatingPointTextures = function() {
  return !!gl.getExtension('OES_texture_half_float');
};

// ### GL.Texture.canUseFloatingPointLinearFiltering()
//
// Returns false if `gl.LINEAR` is not supported as a texture filter mode for
// textures of type `gl.HALF_FLOAT_OES`. This is the
// `OES_texture_half_float_linear` extension.
Texture.canUseHalfFloatingPointLinearFiltering = function() {
  return !!gl.getExtension('OES_texture_half_float_linear');
};

// src/tile.js
function Tile() {
    this.isVisual = true;
}
Tile.items = {};
Tile.callbacks = [];

Tile.prototype.triangulate = function(name) {
    var sheet = this.sheets[name];
    if(sheet == null) return;
    
    var minX = Number.MAX_VALUE;
    var minY = Number.MAX_VALUE;
    for(var index2 in sheet.keypoints) {
        var drawOffset = { x : sheet.keypoints[index2].x, y : sheet.keypoints[index2].y };
        sheet.keypoints[index2].drawOffset = drawOffset;
        sheet.keypoints[index2].bindingUV = [ sheet.keypoints[index2].x / this.image.width, sheet.keypoints[index2].y / this.image.height ];
        
        if(minX > drawOffset.x) minX = drawOffset.x;
        if(minY > drawOffset.y) minY = drawOffset.y;
    }
    sheet.drawOffset = { x : minX, y : minY };
    
    this.triangles[name] = [];
    var vertices = [];
    this.fixedUVs = [];
    for(var i in sheet.keypoints) {
        var keypoint = sheet.keypoints[i];
        vertices.push([ keypoint.drawOffset.x - sheet.drawOffset.x, keypoint.drawOffset.y - sheet.drawOffset.y ]);
    }
    
    
    var delau_triangles = Delaunay.triangulate(vertices);
    for(var x = 0; x < delau_triangles.length; x += 3) {
        
        var v1 = vertices[delau_triangles[x]];
        var v2 = vertices[delau_triangles[x + 1]];
        var v3 = vertices[delau_triangles[x + 2]];
        
        var p1 = new MeshVertexTrackerDefault(v1);
        var p2 = new MeshVertexTrackerDefault(v2);
        var p3 = new MeshVertexTrackerDefault(v3);
        
        this.triangles[name].push({
            p1 : { tracker : p1, uv : { x : (v1[0] + sheet.drawOffset.x) / this.image.width, y : (v1[1] + sheet.drawOffset.y) / this.image.height } },
            p2 : { tracker : p2, uv : { x : (v2[0] + sheet.drawOffset.x) / this.image.width, y : (v2[1] + sheet.drawOffset.y) / this.image.height } },
            p3 : { tracker : p3, uv : { x : (v3[0] + sheet.drawOffset.x) / this.image.width, y : (v3[1] + sheet.drawOffset.y) / this.image.height } },
        });     
    }
}

Tile.fromName = function(fullName, userToken, callback) {
    var inculde;
    var name;
    if(fullName.indexOf('&') != -1) {
        var sd = fullName.split('&');
        inculde = sd[0];
        name = sd[1];
    }
    
    if(!Tile.items[inculde]) {
        Tile.callbacks.push({ inculde : inculde, name : name, userToken : userToken, func : callback });
        IUIU.Loader.load(inculde, { inculde : inculde, name : name, userToken : userToken }, function(c) {
            c.content.isLoaded = true;
            c.content.image.userToken = c.userToken.inculde;
            c.content.image.onloaded = function(userToken) { 
                for(var i = 0; i < Tile.callbacks.length; i++) {
                    var callback = Tile.callbacks[i];
                    if(callback.inculde == userToken) {
                        callback.func(c.content.sheets[callback.name], callback.userToken);
                        Tile.callbacks.splice(i, 1);
                        i--;
                    }
                }
            }
            Tile.items[inculde] = c.content;
        });     
    } else {
        callback(Tile.items[inculde].sheets[name], userToken);
    }
}

Tile.create = function() {
    var data = new Tile();
    data.sheets = {};
    data.triangles = {};
    return data;
}

Tile.fromJson = function(json, param, entry) {
    var data = entry;
    var texture = new Texture.fromURL('data:image/png;base64,' + json.data);
    texture.userToken = data;
    texture.onloaded = function(userToken) {
        userToken.isLoaded = true;
    };
    data.isLoaded = false;
    data.image = texture;

    for(var index2 = 0; index2 < json.sheets.length; index2++) {
        var sheetJson = json.sheets[index2];
        var name = sheetJson.name;
        
        var boundsStr = sheetJson.bounds.split(',');
        var bx = parseFloat(boundsStr[0]);
        var by = parseFloat(boundsStr[1]);
        var bwidth = parseFloat(boundsStr[2]);
        var bheight = parseFloat(boundsStr[3]);
        var bounds = { x : bx, y : by, width : bwidth, height : bheight };
        
        var keypoints = []; 
        var left = Number.MAX_VALUE, top = Number.MAX_VALUE, right = Number.MIN_VALUE, bottom = Number.MIN_VALUE;
        for(var i = 0; i < sheetJson.out.length; i++) {
            var values = sheetJson.out[i].split(',');
            var x = parseFloat(values[0]);
            var y = parseFloat(values[1]);
            var point = { x : x, y : y };
            keypoints.push(point);
            
            if(x < left) left = x;
            if(x > right) right = x;
            if(y < top) top = y;
            if(y > bottom) bottom = y;
        }
        
        for(var i = 0; i < sheetJson.in.length; i++) {
            var values = sheetJson.in[i].split(',');
            var x = parseFloat(values[0]);
            var y = parseFloat(values[1]);
            var point = { x : x, y : y };
            keypoints.push(point);
        }
        
        data.sheets[name] = { bounds : bounds, x : left, y : top, width : Math.max(0, right - left), height : Math.max(0, bottom - top), texture : data, keypoints : keypoints }; 
    }
    
    return data;
}
// src/trigger.js
var triggers = {};
var triggerActions = {};

function Trigger() {
}

Trigger.eval = function(header) {
    if(triggers[header]) {
        var triggerCollection = triggers[header];
        for(var i = 0; i < triggerCollection.length; i++) {
            var level = triggerCollection[i].level;
            var trigger = triggerCollection[i].trigger;
            
            var loaded = true;
            if(trigger.loadedFiles) {
                var names = Object.getOwnPropertyNames(trigger.loadedFiles);
                for(var x = 0; x < names.length; x++) {
                    if(!trigger.loadedFiles[names[x]]) {
                        loaded = false;
                        break;
                    }
                }
            }
            else {
                loaded = false;
            }
            
            
            if(trigger.enabled && loaded) {
                var run = true;
                for(var x = 0; x < trigger.conditions.length; x++) {
                    if(!Trigger.action(level, trigger.conditions[x])) {
                        run = false;
                        break;
                    }
                }
                
                if(run) {
                    for(var x = 0; x < trigger.actions.length; x++) {
                        Trigger.action(level, trigger.actions[x]);
                    }
                }
            }
        }
    }
}

Trigger.bind = function(token, header, callback) {
    triggerActions[header] = callback;
}

Trigger.load = function(level, trigger) {
    for(var i = 0; i < trigger.events.length; i++) {
        var event = trigger.events[i];
        var item = { level : level, trigger : trigger };
        
        var itemKey = null;
        for(var key in event.value) {
            itemKey = key;
            break;
        }
        
        if(!triggers[itemKey]) 
            triggers[itemKey] = [];
        
        triggers[itemKey].push(item);
    }
    
    trigger.loadedFiles = {};
    var inculdes = Trigger.parseInculde(trigger);
    if(inculdes.length == 0) {
        level.init();
    }
    else {
        for(var i = 0; i < inculdes.length; i++) {
            trigger.loadedFiles[inculdes[i]] = false;
            Module.load(inculdes[i], function(sender) {
                var inculde = sender.inculde;
                var trigger = sender.trigger;   
                trigger.loadedFiles[inculde] = true;
                
                var loaded = true;
                var names = Object.getOwnPropertyNames(trigger.loadedFiles);
                for(var x = 0; x < names.length; x++) {
                    if(!trigger.loadedFiles[names[x]]) {
                        loaded = false;
                        break;
                    }
                }
                
                if(loaded) {
                    level.init();
                }
                
            }, { inculde : inculdes[i], trigger : trigger });
        }
    }
}

Trigger.unload = function(level) {
    for(var header in triggers) {
        for(var i = 0; i < triggers[header].length; i++) {
            var trigger = triggers[header][i];
            if(trigger.level == level) {
                triggers[header].splice(i, 1);
            }
        }
    }
}

Trigger.parseInculde = function(trigger) {
    var result = [];
    for(var i = 0; i < trigger.conditions.length; i++) {
        Trigger.parseInculdeItem(result, trigger.conditions[i]);
    }
    
    for(var i = 0; i < trigger.actions.length; i++) {
        Trigger.parseInculdeItem(result, trigger.actions[i]);
    }
    return result;
}

Trigger.parseInculdeItem = function(result, sender) {
    switch(sender.type) {
        case "action":
            result.push(sender.inculde);
            var item = null;
            for(var key in sender.value) {
                item = sender.value[key];
                break;
            }
            
            if(item != null) {
                Trigger.parseInculdeItem(result, item);
            }
            
            break;
    }
}

Trigger.action = function(level, act) {
    switch(act.type) {
        case "action":
            var action = null;
            var itemKey = null;
            var item = null;
            var value = null;
            //var inculde = act.inculde;
            for(var key in act.value) {
                itemKey = key;
                item = act.value[key];
                break;
            }
            
            // ȡֵ   
            var key = typeof item == 'object' ? itemKey : '__Unknown';
            if(key != '__Unknown') {
                action = triggerActions[key];
            }
            
            if(action != null) {
                var params = [];
                
                var names = Object.getOwnPropertyNames(item);
                for(var x = 0; x < names.length; x++) {
                    params.push(Trigger.action(level, item[names[x]]));
                }

                value = action.apply(null, params);
            }
            
            return value;
        case "number":
            return parseFloat(act.value);
        case "string":
            return act.value;
        case "boolean":
            return Boolean(act.value);
        default:
            var obj = null;
            for(var i = 0; i < level.objects.length; i++) {
                var obj2 = level.objects[i];
                if(obj2.name == act.value) {
                    obj = obj2;
                    break;
                }
            }
            return obj;
    }
}
// src/vector.js
/**
 * ����
 * @param   {Number}    x   ����Xֵ
 * @param   {Number}    y   ����Xֵ
 * @param   {Number}    z   ����Xֵ
 */
function Vector(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

Vector.prototype = {
  /**
   * ����һ����������
   */
  negative: function() {
    return new Vector(-this.x, -this.y, -this.z);
  },
  /**
   * �õ�������
   * @param {Vector}    v   ��͵�����
   */
  add: function(v) {
    if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    else return new Vector(this.x + v, this.y + v, this.z + v);
  },
  subtract: function(v) {
    if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    else return new Vector(this.x - v, this.y - v, this.z - v);
  },
  multiply: function(v) {
    if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
    else return new Vector(this.x * v, this.y * v, this.z * v);
  },
  divide: function(v) {
    if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
    else return new Vector(this.x / v, this.y / v, this.z / v);
  },
  equals: function(v) {
    return this.x == v.x && this.y == v.y && this.z == v.z;
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
  cross: function(v) {
    return new Vector(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  },
  length: function() {
    return Math.sqrt(this.dot(this));
  },
  unit: function() {
    return this.divide(this.length());
  },
  min: function() {
    return Math.min(Math.min(this.x, this.y), this.z);
  },
  max: function() {
    return Math.max(Math.max(this.x, this.y), this.z);
  },
  toAngles: function() {
    return {
      theta: Math.atan2(this.z, this.x),
      phi: Math.asin(this.y / this.length())
    };
  },
  angleTo: function(a) {
    return Math.acos(this.dot(a) / (this.length() * a.length()));
  },
  toArray: function(n) {
    return [this.x, this.y, this.z].slice(0, n || 3);
  },
  clone: function() {
    return new Vector(this.x, this.y, this.z);
  },
  init: function(x, y, z) {
    this.x = x; this.y = y; this.z = z;
    return this;
  }
};

/**
 * ����һ��x��y��zΪ0������
 */
Vector.zero = new Vector(0,0);
Vector.one = new Vector(1,1);

Vector.negative = function(a, b) {
  b.x = -a.x; b.y = -a.y; b.z = -a.z;
  return b;
};

/**
 * �õ�������
 * @param   {Number}    a   ��͵�����
 * @param   {Number}    b   ��͵�����
 * @param   {Number}    c   ��͵�����
 * @return  Vector
 */
Vector.add = function(a, b, c) {
  if (b instanceof Vector) { c.x = a.x + b.x; c.y = a.y + b.y; c.z = a.z + b.z; }
  else { c.x = a.x + b; c.y = a.y + b; c.z = a.z + b; }
  return c;
};
Vector.subtract = function(a, b, c) {
  if (b instanceof Vector) { c.x = a.x - b.x; c.y = a.y - b.y; c.z = a.z - b.z; }
  else { c.x = a.x - b; c.y = a.y - b; c.z = a.z - b; }
  return c;
};
Vector.multiply = function(a, b, c) {
  if (b instanceof Vector) { c.x = a.x * b.x; c.y = a.y * b.y; c.z = a.z * b.z; }
  else { c.x = a.x * b; c.y = a.y * b; c.z = a.z * b; }
  return c;
};
Vector.divide = function(a, b, c) {
  if (b instanceof Vector) { c.x = a.x / b.x; c.y = a.y / b.y; c.z = a.z / b.z; }
  else { c.x = a.x / b; c.y = a.y / b; c.z = a.z / b; }
  return c;
};
Vector.cross = function(a, b, c) {
  c.x = a.y * b.z - a.z * b.y;
  c.y = a.z * b.x - a.x * b.z;
  c.z = a.x * b.y - a.y * b.x;
  return c;
};
Vector.unit = function(a, b) {
  var length = a.length();
  b.x = a.x / length;
  b.y = a.y / length;
  b.z = a.z / length;
  return b;
};
Vector.fromAngles = function(theta, phi) {
  return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
};
Vector.randomDirection = function() {
  return Vector.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
};
Vector.min = function(a, b) {
  return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
};
Vector.max = function(a, b) {
  return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
};
Vector.lerp = function(a, b, fraction) {
  return b.subtract(a).multiply(fraction).add(a);
};
Vector.fromArray = function(a) {
  return new Vector(a[0], a[1], a[2]);
};
Vector.angleBetween = function(a, b) {
  return a.angleTo(b);
};

// src/WebAudio.js
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
// src/WebSound.js
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
return IUIU;
})();
