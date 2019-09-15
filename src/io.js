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