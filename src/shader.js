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
    