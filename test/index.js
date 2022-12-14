import {recPositions, fPositions} from "./samples.js";

class Renderer {
    constructor() {
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.width = 800;
        canvas.height = 600;
        this.gl = canvas.getContext("webgl");
        this.gl.uniform2fv
        const img = new Image();
        img.onload = () => {
            this.loadShaders("./vertex.vert", "./fragment.frag");
        };
        document.body.appendChild(img);
        img.src = "./img.png";
    }

    loadShaders(vsUrl, fsUrl){
        const loadPromises = [
            this.loadXHR(vsUrl),
            this.loadXHR(fsUrl)
        ];
        Promise.all(loadPromises)
            .then((results) => { // [vsSource, fsSource]
                this.initShader(results[0], results[1]);
                this.draw();
            });
    }

    loadXHR(url) {
        const promise = new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if ((xhr.readyState === 4) && (xhr.status === 200)) {
                    resolve(xhr.responseText);
                    console.log(url.split("/").pop(), xhr.responseText);
                }
                xhr.onerror = function(){
                    reject(xhr.statusText);
                }
            };
            xhr.open("GET", url, true);
            xhr.send(null);
        });
        return promise;
    }

    initShader(vsSource, fsSource) {
        const gl = this.gl;
        const vs = this._createShader(gl.VERTEX_SHADER, vsSource);
        const fs = this._createShader(gl.FRAGMENT_SHADER, fsSource);
        this.program = this._createProgram(vs, fs);
    }
    
    _createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    
    _createProgram( vertexShader, fragmentShader) {
        const gl = this.gl;
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    draw() {
        // this.drawTriangles(recPositions);
        const gl = this.gl;
        const program = this.program;
        gl.useProgram(program);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this._bindUniformData("u_resolution", "2fv", [gl.canvas.width, gl.canvas.height]);
        this.drawTriangles(fPositions);
        this.drawRect(100,100,200,100);
    }

    drawTriangles(positions, color) { 
        const gl = this.gl;
        const program = this.program;
        gl.useProgram(program);
        const positionBuffer = this._createArrayBuffer(positions, Float32Array, gl.STATIC_DRAW);
        this._bindBufferToAttribute("a_position", positionBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
    }

    drawRect(x, y, w, h) {
        const positions = [
            x, y,
            x + w, y,
            x, y + h,
            x, y + h,
            x + w, y,
            x + w, y + h
        ];
        this.drawTriangles(positions);
    }

    _createArrayBuffer(array, BinaryConstructor, usage){
        const gl = this.gl;
        usage = (usage === void 0) ? gl.STATIC_DRAW : usage;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new BinaryConstructor(array), usage);
        return buffer;
    }

    _bindBufferToAttribute(attributeName, buffer, options){
        const gl = this.gl;
        const program = this.program;
        const opt = { size: 2, type: gl.FLOAT, normalized: false, stride: 0, offset: 0 };
        if (options) {
            Object.assign(opt, options);
        }
        const { size, type, normalized, stride, offset } = opt;
        const attrLocation = gl.getAttribLocation(program, attributeName);
        gl.enableVertexAttribArray(attrLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(attrLocation, size, type, normalized, stride, offset);
    }

    _bindUniformData(uniformName, suffix, ...data) {
        // suffix: 3f => 3 params: float, float, float
        // 3fv => 1 param : <array> [ float, float, float ]
        // 3iv => 1 param: <array> [ int, int, int]
        const gl = this.gl;
        const program = this.program;
        gl.useProgram(program);
        const uniformLocation = gl.getUniformLocation(program, uniformName);
        gl["uniform"+ suffix](uniformLocation, ...data);
    }

    _bindUniformMatrix(uniformName, suffix, transpose, matrix) {
        // 2fv => 1 param: <array> 2 * 2 = 4 float
        // 3fv => 1 param: <array> 3 * 3 = 9 float
        // 4fv => 1 param: <array> 4 * 4 = 16 float
        const gl = this.gl;
        const program = this.program;
        gl.useProgram(program);
        const uniformLocation = gl.getUniformLocation(program, uniformName);
        gl["uniformMatrix" + suffix](uniformLocation, transpose, matrix);
    }

}

const renderer = new Renderer();




