function createProgram(gl, vertexShader, fragmentShader) {
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

function createShader(gl, type, source) {
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

export function initShader(gl, vsSource, fsSource) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    return createProgram(gl, vs, fs);
}

export function rgbaToFloatArray(...values){
    return values.map(value => clamp(value / 255, 0, 1));
}

export function clamp(target, min, max){
    return Math.min(Math.max(target, min), max);
}

export function createRectanglePositions(x, y, w, h) {
    return [
        x, y,
        x + w, y,
        x, y + h,
        x, y + h,
        x + w, y,
        x + w, y + h,
    ];
}