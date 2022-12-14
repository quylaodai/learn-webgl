precision mediump float;

attribute vec2 a_position;
attribute vec3 a_color;

uniform vec2 u_resolution;

varying vec4 v_color;

void main() {
    v_color = vec4(a_color, 1.0);
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    gl_Position = vec4(zeroToTwo, 0, 1);
}