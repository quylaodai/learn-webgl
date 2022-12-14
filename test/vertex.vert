precision mediump float;

attribute vec2 a_position;
// attribute vec4 a_color;

uniform vec2 u_resolution;
// uniform vev4 u_color;

// varying vec4 v_color;
uniform vec4 u_color;

void main() {
    // v_color = a_color;
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    gl_Position = vec4(zeroToTwo, 0, 1);
}