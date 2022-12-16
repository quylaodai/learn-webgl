
precision highp float;

uniform sampler2D u_image;

varying vec2 v_texCoord;

void main() {
   // vec4 tex1 = texture2D(u_image1, v_texCoord);
   vec4 tex2 = texture2D(u_image, v_texCoord);
   gl_FragColor = tex2;
   // gl_FragColor = texture2D(u_image1, v_texCoord);
   // gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}
