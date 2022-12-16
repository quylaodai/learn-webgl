import Renderer from "./src/Renderer.js";
import ImageRenderer from "./src/ImageRenderer.js";

function getUrlParam (name){
    const url = new URL(window.location);
    return url.searchParams.get(name);
};

const Tests = {
    0: Renderer,
    1: ImageRenderer
}
const testCase = getUrlParam("testCase");
let Test = Tests[testCase];

const test = new Test();





