import { Renderer } from "./Renderer.js";
export class ColorTest extends Renderer {

    _initConfig() {
        this.imgList = ["/img/img2.png", "img/img1.png"];
        this.vsUrl = "/shader/color/color.vert";
        this.fsUrl = "/shader/color/color.frag";
    }

    draw() {
        const gl = this.gl;
        const positions = [
            0, 0,
            100, 0,
            0, 100
        ];
        const positionBuffer = this._createArrayBuffer(positions, Float32Array, gl.STATIC_DRAW);
        this._bindBufferToAttribute("a_position", positionBuffer);

        const colors = [
            255, 0, 0, 255,
            0, 255, 0, 255,
            0, 0, 255, 255
        ];
        const colorBuffer = this._createArrayBuffer(colors, Uint8Array, gl.STATIC_DRAW);
        this._bindBufferToAttribute("a_color", colorBuffer, { size: 4, type: gl.UNSIGNED_BYTE, normalized: true });

        gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
    }
}

