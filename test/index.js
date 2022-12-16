import { Renderer } from "./src/Renderer.js";
import { ImageTest } from "./src/ImageTest.js";
import { ColorTest } from "./src/ColorTest.js";

function getUrlParam(name) {
    const url = new URL(window.location);
    return url.searchParams.get(name);
};

const Tests = {
    0: Renderer,
    1: ImageTest,
    2: ColorTest
}
const testCase = getUrlParam("testCase");
let Test = Tests[testCase] || Tests[0];

const test = new Test();





