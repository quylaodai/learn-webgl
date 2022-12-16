import { rectAlphas, rectPositions, fPositions } from "./samples.js";
import { initShader, createRectanglePositions, rgbaToFloatArray } from "./utils.js";

export class Renderer {
    constructor() {
        window.test = this;
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.style.background = "black";
        this.canvasColor = [0, 0, 0, 255]; 
        canvas.style.background = `rgba(${this.canvasColor.join(",")})`;
        canvas.width = 800;
        canvas.height = 600;
        this.gl = canvas.getContext("webgl", { premultipliedAlpha: false });

        this.preload();
        this.loadResource();
    }

    preload() {
        this.images = [];
        this.imgList = [];
        this.vsUrl = null;
        this.fsUrl = null;
        this._initConfig();
    }

    _initConfig() {
        this.vsUrl = "/shader/triangle/triangle.vert";
        this.fsUrl = "/shader/triangle/triangle.frag";
    }

    loadResource() {
        const loaders = this.imgList.map(src => this._loadImage(src));
        const vsLoader = this._loadXHR(this.vsUrl).then(vsSource => this.vsSource = vsSource);
        const fsLoader = this._loadXHR(this.fsUrl).then(fsSource => this.fsSource = fsSource);
        loaders.push(vsLoader, fsLoader);
        Promise.all(loaders).then(() => {
            this.program = initShader(this.gl, this.vsSource, this.fsSource);
            this.onLoad();
        });
    }

    _loadImage(src) {
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve(img);
            }
            img.onerror = function (evt) {
                reject(evt);
            }
            img.src = src;
            this.images.push(img);
        });
        return promise;
    }

    _loadXHR(url) {
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

    onLoad() {
        this._prepare();
        this.draw();
    }

    _prepare(){
        const gl = this.gl;
        const program = this.program;
        gl.useProgram(program);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor.apply(gl, rgbaToFloatArray(...this.canvasColor));
        gl.clear(gl.COLOR_BUFFER_BIT);
        this._bindUniformData("u_resolution", "2fv", [gl.canvas.width, gl.canvas.height]);
    }

    draw() {
        this.drawTriangles(fPositions);
        this.drawRect(-200, -200, 100, 100);
    }

    drawTriangles(positions) {
        const gl = this.gl;
        const positionBuffer = this._createArrayBuffer(positions, Float32Array, gl.STATIC_DRAW);
        this._bindBufferToAttribute("a_position", positionBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
    }

    drawRect(x, y, w, h) {
        const gl = this.gl;
        const alphaBuffer = this._createArrayBuffer(rectAlphas, Float32Array, gl.STATIC_DRAW);
        this._bindBufferToAttribute("a_alpha", alphaBuffer, { size: 1 });
        this.drawTriangles(createRectanglePositions(x, y, w, h));
    }

    drawImage(img, x = 0, y = 0, w, h) {
        w = w || img.width || 100;
        h = h || img.height || 100;
        console.log("drawImage", x, y, w, h);
        const gl = this.gl;
        const rectanglePositions = createRectanglePositions(x, y, w, h);
        const positionBuffer = this._createArrayBuffer(rectanglePositions, Float32Array, gl.STATIC_DRAW);
        this._bindBufferToAttribute("a_position", positionBuffer);

        const texCoordBuffer = this._createArrayBuffer(rectPositions, Float32Array, gl.STATIC_DRAW);
        this._bindBufferToAttribute("a_texCoord", texCoordBuffer);

        this._createTexture(img);
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
        //suffix: 2f => 2 float , 2fv => [float, float]
        const gl = this.gl;
        const program = this.program;
        const uniformLocation = gl.getUniformLocation(program, uniformName);
        gl["uniform" + suffix](uniformLocation, ...data);
    }

    _bindUniformMatrix(uniformName, suffix, transpose, matrix) {
        //suffix: 2fv => [2 * 2 = 4 float] ,  3fv => [3 * 3 = 9 float] 
        const gl = this.gl;
        const program = this.program;
        const uniformLocation = gl.getUniformLocation(program, uniformName);
        gl["uniformMatrix" + suffix](uniformLocation, transpose, matrix);
    }

}