import { InlineParser } from "./inline_parser.js";
import {Tokenizer} from "./tokenizer.js";

export class Parser {

    inlineParser = new InlineParser();

    parse(tokens) {
        return {
            type: "DOCUMENT",
            children: tokens.map(token => this.parseToken(token))
        };
    }

    parseToken(token) {

        switch (token.type) {

            case "HEADER":
                return {
                    type: "HEADER",
                    level: token.level,
                    children: this.inlineParser.parse(token.text)
                };

            case "PARAGRAPH":
                return {
                    type: "PARAGRAPH",
                    children: this.inlineParser.parse(token.lines.join(" "))
                };

            case "UNORDERED":
                return {
                    type: "UNORDERED_LIST",
                    children: token.items.map(item => ({
                        type: "LIST_ITEM",
                        children: this.inlineParser.parse(item)
                    }))
                };

            case "ORDERED":
                return {
                    type: "ORDERED_LIST",
                    start: token.start,
                    children: token.items.map(item => ({
                        type: "LIST_ITEM",
                        children: this.inlineParser.parse(item)
                    }))
                };

            case "HORIZONTAL_RULE":
                return {
                    type: "HORIZONTAL_RULE"
                };

            case "CODE_BLOCK":
                return {
                    type: "CODE_BLOCK",
                    language: token.language,
                    lines: token.lines
                };

            case "BLOCK_QUOTE": {
                const lines = token.lines.join("\n");
                const tokens = new Tokenizer().tokenize(lines);

                return {
                    type: "BLOCK_QUOTE",
                    children: tokens.map(token => this.parseToken(token))
                };
            }

            default:
                throw new Error(`Unknown token type: ${token.type}`);
        }

    }

}