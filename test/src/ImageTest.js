import { Renderer } from "./Renderer.js";

export class ImageTest extends Renderer {

    _initConfig() {
        this.imgList = ["/img/img2.png", "img/img1.png"];
        this.vsUrl = "/shader/texture.vert";
        this.fsUrl = "/shader/texture.frag";
    }

    draw() {
        this.drawImage(this.images[0], 200, 200);
        this.drawImage(this.images[1], 0, 200);
    }
}

