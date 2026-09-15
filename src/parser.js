export class Parser {

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
                    children: [
                        {
                            type: "TEXT",
                            value: token.text
                        }
                    ]
                };

            case "PARAGRAPH":
                return {
                    type: "PARAGRAPH",
                    children: [
                        {
                            type: "TEXT",
                            value: token.lines.join(" ")
                        }
                    ]
                };

            case "UNORDERED":
                return {
                    type: "UNORDERED_LIST",
                    children: token.items.map(item => ({
                        type: "LIST_ITEM",
                        children: [
                            {
                                type: "TEXT",
                                value: item
                            }
                        ]
                    }))
                };

            case "ORDERED":
                return {
                    type: "ORDERED_LIST",
                    start: token.start,
                    children: token.items.map(item => ({
                        type: "LIST_ITEM",
                        children: [
                            {
                                type: "TEXT",
                                value: item
                            }
                        ]
                    }))
                };

            default:
                throw new Error(`Unknown token type: ${token.type}`);
        }

    }

}