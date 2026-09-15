import {Tokenizer} from "./tokenizer.js";
import {Renderer} from "./renderer.js";
import {Parser} from "./parser.js";

export function parse(markdown) {
    const tokenizer = new Tokenizer();
    const parser = new Parser();
    const renderer = new Renderer();

    const tokens = tokenizer.tokenize(markdown);
    const node = parser.parse(tokens);
    const html = renderer.render(node);

    return html;
}