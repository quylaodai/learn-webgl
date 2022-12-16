import { rectPositions,fPositions } from "./samples.js";

class Renderer {
    constructor() {
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.width = 800;
        canvas.height = 600;
        this.gl = canvas.getContext("webgl");

        this.images = [];
        this.loadImages([ "./img2.png", "./img1.png"], () => {
            this.loadShaders("./texture.vert", "./texture.frag");
        })
    }

    loadImages(srcList, callback) {
        const loadPromises = srcList.map(src => this.loadImage(src));
        Promise.all(loadPromises)
            .then((images) => {
                images.forEach(img => this.images.push(img));
                callback && callback();
            });
    }

    loadImage(src){
        const promise = new Promise(function (resolve, reject) {
            const img = new Image();
            img.onload = () => {
                resolve(img);
            }
            img.onerror = function (evt) {
                reject(evt);
            }
            img.src = src;
        });
        return promise;
    }

    loadShaders(vsUrl, fsUrl) {
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
                    console.log(url.split("/").pop(), "\n", xhr.responseText);
                }
                xhr.onerror = function () {
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

    _createProgram(vertexShader, fragmentShader) {
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
        const gl = this.gl;
        const program = this.program;
        gl.useProgram(program);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this._bindUniformData("u_resolution", "2fv", [gl.canvas.width, gl.canvas.height]);
        this.drawTriangles(fPositions);
        this.drawRect(400,400,100,100);
        this.images.forEach((img, index) => this.drawImage(img, index * 250 + 100, 100, 200, 200));
    }

    drawTriangles(positions) {
        const gl = this.gl;
        const positionBuffer = this._createArrayBuffer(positions, Float32Array, gl.STATIC_DRAW);
        this._bindBufferToAttribute("a_position", positionBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
    }

    drawRect(x, y, w, h) {
        this.drawTriangles(this._getRectanglePositions(x, y, w, h));
    }

    drawImage(img, x, y, w ,h) {
        console.log("drawImage", x, y, w, h);
        w  = w || img.width;
        h  = h || img.height;
        const gl = this.gl;

        const rectanglePositions = this._getRectanglePositions(x, y, w ,h);
        const positionBuffer = this._createArrayBuffer(rectanglePositions, Float32Array, gl.STATIC_DRAW);
        this._bindBufferToAttribute("a_position", positionBuffer);

        const texCoordBuffer = this._createArrayBuffer(rectPositions, Float32Array, gl.STATIC_DRAW);
        this._bindBufferToAttribute("a_texCoord", texCoordBuffer);

        const texture = this._createTexture(img);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    _createTexture(img) {
        const gl = this.gl;
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        return texture;
    }

    loadImageAndCreateTextureInfo(url) {
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        // Fill the texture with a 1x1 blue pixel.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        // let's assume all images are not a power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        var textureInfo = {
            width: 1,   // we don't know the size until it loads
            height: 1,
            texture: tex,
        };
        var img = new Image();
        img.addEventListener('load', function () {
            textureInfo.width = img.width;
            textureInfo.height = img.height;

            gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        });
        img.src = url;

        return textureInfo;
    }

    _getRectanglePositions(x, y, w, h) {
        return [
            x, y,
            x + w, y,
            x, y + h,
            x, y + h,
            x + w, y,
            x + w, y + h,
        ];
    }
    _createArrayBuffer(array, BinaryConstructor, usage) {
        const gl = this.gl;
        usage = (usage === void 0) ? gl.STATIC_DRAW : usage;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new BinaryConstructor(array), usage);
        return buffer;
    }

    _bindBufferToAttribute(attributeName, buffer, options) {
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
        const uniformLocation = gl.getUniformLocation(program, uniformName);
        gl["uniform" + suffix](uniformLocation, ...data);
    }

    _bindUniformMatrix(uniformName, suffix, transpose, matrix) {
        // 2fv => 1 param: <array> 2 * 2 = 4 float
        // 3fv => 1 param: <array> 3 * 3 = 9 float
        // 4fv => 1 param: <array> 4 * 4 = 16 float
        const gl = this.gl;
        const program = this.program;
        const uniformLocation = gl.getUniformLocation(program, uniformName);
        gl["uniformMatrix" + suffix](uniformLocation, transpose, matrix);
    }

}

const renderer = new Renderer();




