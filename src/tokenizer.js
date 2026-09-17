export class Tokenizer {

    reset() {
        this.tokens = [];

        this.paragraphLines = [];

        this.quoteLines = [];

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
        this.flushBlockquote();
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

    flushBlockquote() {
        if (this.quoteLines.length > 0) {
            this.tokens.push({
                type: "BLOCK_QUOTE",
                lines: this.quoteLines
            });

            this.quoteLines = [];
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

    flushCodeBlock() {
        if (this.inCodeBlock) {
            this.tokens.push({
                type: "CODE_BLOCK",
                language: this.language,
                lines: this.codeLines
            });

            this.inCodeBlock = false;
            this.codeLines = [];
            this.language = null;
        }
    }

    tokenize(markdown) {

        this.reset();

        this.lines = markdown.split("\n");

        for (const line of this.lines) {

            if (this.inCodeBlock) {
                // Code block end: ```
                if (line.trim() === "```") {
                    this.flushCodeBlock();
                }

                // Default code line
                else {
                    this.codeLines.push(line);
                }

                continue;
            }


            // Code block start: ```<lang>
            const codeBlockMatch = line.trim().match(/^```([A-Za-z0-9_+-]*)\s*$/);
            if (codeBlockMatch) {
                this.flushAll();

                this.inCodeBlock = true;
                this.language = codeBlockMatch[1];
                continue;
            }


            // Blockquote
            const blockQuoteMatch = line.match(/^ {0,3}>\s?(.*)$/);
            if (blockQuoteMatch) {
                this.flushParagraph();
                this.flushList();

                this.quoteLines.push(blockQuoteMatch[1]);
                continue;
            }

            this.flushBlockquote(); // Line not quoted, so flush


            // Line: ---
            if (line.trim().match("---")) {
                this.flushAll();

                this.tokens.push({
                    type: "HORIZONTAL_RULE",
                });

                continue;
            }



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

        if (this.inCodeBlock) {
            this.flushCodeBlock();
        }

        this.flushAll()
        return this.tokens;
    }

}