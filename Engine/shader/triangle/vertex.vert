precision mediump float;

attribute vec2 a_position;
attribute vec4 a_color;

varying vec4 v_color;

void main() {
    v_color = a_color;
    gl_Position = vec4(a_position, 0.0, 1.0);
}