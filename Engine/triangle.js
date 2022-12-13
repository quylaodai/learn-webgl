const vsUrl = "./shader/vertex.vert";
const fsUrl = "./shader/fragment.frag";

class Renderer {
    constructor() {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 600;
        const gl = canvas.getContext("webgl");
        document.body.appendChild(canvas);
        this.gl = gl;
        this.isInit = false;

        this.loadImage("./moon.jpg",(img)=>{
            this.img = img;
            this.loadShaders(vsUrl, fsUrl);
        });
    }

    loadImage(src, callback){
        const img = new Image();
        img.onload = ()=>{
            callback && callback(img);
            document.body.appendChild(img);
        }
        img.src = src;
    }

    loadShaders(vertexUrl, fragmentUrl) {
        this._loadXHR(vertexUrl, (response) => {
            this.vsSource = response;
            if (this.fsSource) {
                this._initShader();
            }
        });
        this._loadXHR(fragmentUrl, (response) => {
            this.fsSource = response;
            if (this.vsSource) {
                this._initShader();
            }
        });
    }

    _loadXHR(url, callback){
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange =  ()=> {
            if ((xhr.readyState ===  4) && (xhr.status === 200)) {
                callback && callback(xhr.responseText);
            } 
        };
        xhr.open("GET", url, true);
        xhr.send(null);
    }

    _initShader() {
        if (this.isInit) return;
        this.isInit = true;
        const gl = this.gl;
        const vs = this._createShader(gl.VERTEX_SHADER, this.vsSource);
        const fs = this._createShader(gl.FRAGMENT_SHADER, this.fsSource);
        this.program = this._createProgram(vs, fs);
        this._draw();
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

    _draw() {
        const gl = this.gl;
        const program = this.program;

        gl.enable(gl.CULL_FACE);
        const indices = [
            0, 1, 2, 
            2, 3, 0,
        ]
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

        const vertexPosUvs = [
            0, 0, 0, 0,
            .5, 0, 1, 0,
            .5, .5, 0, 1,
            0, .5, 1, 1
        ];
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosUvs), gl.STATIC_DRAW);
        
        const positionAttribLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionAttribLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 16, 0);

        const colors = [
            255, 255, 0, 255,
            0, 255, 0, 255,
            255, 255, 0, 255,
            255, 0, 0, 255,
        ];

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors), gl.STATIC_DRAW);

        const colorAttribLocation = gl.getAttribLocation(program,"a_color");
        gl.enableVertexAttribArray(colorAttribLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorAttribLocation, 4, gl.UNSIGNED_BYTE, true, 0, 0);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
    }
}

const renderer = new Renderer();
