precision mediump float;

attribute vec2 a_position;

uniform vec2 u_resolution;

void main() {
    vec2 zeroToOne = a_position / u_resolution;
 
    vec2 zeroToTwo = zeroToOne * 2.0;

    gl_Position = vec4(zeroToTwo, 0, 1);
}