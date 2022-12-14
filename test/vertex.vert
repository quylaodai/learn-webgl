precision mediump float;

attribute vec2 a_position;

uniform vec2 u_resolution;

void main() {
    vec2 position = a_position / u_resolution;
    gl_Position = vec4(position, 0, 1);
}