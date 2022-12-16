import Renderer from "./src/Renderer.js";
import ImageRenderer from "./src/ImageRenderer.js";

function getUrlParam (name){
    const url = new URL(window.location);
    return url.searchParams.get(name);
};

const testCase = getUrlParam("testCase");
console.log(testCase);
let Test = Renderer;
if (testCase == 1) Test = ImageRenderer;

const test = new Test();





