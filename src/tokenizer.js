export class Tokenizer {

    reset() {
        this.tokens = [];

        this.paragraphLines = []

        this.inCodeBlock = false;
        this.codeLines = [];
        this.language = null;

        this.listItems = [];
        this.listType = null;

        this.lines = [];
    }

    flushAll() {
        this.flushParagraph();
        this.flushList();
    }

    flushParagraph() {
        if (this.paragraphLines.length > 0) {
            this.tokens.push({
                type: "PARAGRAPH",
                lines: this.paragraphLines
            });

            this.paragraphLines = [];
        }
    }

    flushList() {
        if (this.listItems.length > 0) {
            if (this.listType === "UNORDERED") {
                this.tokens.push({
                    type: this.listType,
                    items: this.listItems
                });
            } else {
                this.tokens.push({
                    type: this.listType,
                    items: this.listItems,
                    start: this.listStart
                });
            }

            this.listItems = [];
            this.listType = null;
        }
    }

    tokenize(markdown) {

        this.reset();

        this.lines = markdown.split("\n");

        for (const line of this.lines) {


            // Header: h1 - h6
            const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
            if (headerMatch) {
                this.flushAll();

                this.tokens.push({
                    type: "HEADER",
                    level: headerMatch[1].length,
                    text: headerMatch[2]
                });

                continue;
            }



            // Unordered list: "- something" or "* something"
            const unorderedMatch = line.match(/^[-*]\s+(.*)$/);
            if (unorderedMatch) {
                this.flushParagraph();

                if (this.listType !== "UNORDERED") {
                    this.flushList();
                    this.listType = "UNORDERED";
                }

                this.listItems.push(unorderedMatch[1]);
                continue;
            }


            // Ordered list: "1. something"
            const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
            if (orderedMatch) {
                this.flushParagraph();

                if (this.listType !== "ORDERED") {
                    this.flushList();
                    this.listType = "ORDERED";
                    this.listStart = Number(orderedMatch[1]);
                }

                this.listItems.push(orderedMatch[2]);
                continue;
            }


            // Empty line -> should flush paragraph to start new one
            if(line.trim() === "") {
                this.flushAll()
                continue;
            }


            // Default: paragraph
            this.paragraphLines.push(line);
        }

        this.flushParagraph();
        this.flushList()
        return this.tokens;
    }

}