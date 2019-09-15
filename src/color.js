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