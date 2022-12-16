precision mediump float;

attribute vec2 a_position;
attribute float a_alpha;

uniform vec2 u_resolution;

varying float v_alpha;

void main() {
    v_alpha = a_alpha;
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    gl_Position = vec4(zeroToTwo, 0, 1);
}