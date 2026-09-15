import {InlineTokenizer} from "./inline_tokenizer.js";

export class Parser {

    inlineTokenizer = new InlineTokenizer();

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
                    children: this.inlineTokenizer.tokenize(token.text)
                };

            case "PARAGRAPH":
                return {
                    type: "PARAGRAPH",
                    children: this.inlineTokenizer.tokenize(token.lines.join(" "))
                };

            case "UNORDERED":
                return {
                    type: "UNORDERED_LIST",
                    children: token.items.map(item => ({
                        type: "LIST_ITEM",
                        children: this.inlineTokenizer.tokenize(item)
                    }))
                };

            case "ORDERED":
                return {
                    type: "ORDERED_LIST",
                    start: token.start,
                    children: token.items.map(item => ({
                        type: "LIST_ITEM",
                        children: this.inlineTokenizer.tokenize(item)
                    }))
                };

            case "HORIZONTAL_RULE":
                return {
                    type: "HORIZONTAL_RULE"
                }

            default:
                throw new Error(`Unknown token type: ${token.type}`);
        }

    }

}