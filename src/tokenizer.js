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

        this.taskItems = [];

        this.lines = [];
    }

    flushAll() {
        this.flushParagraph();
        this.flushList();
        this.flushTaskList();
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

    flushTaskList() {
        if (this.taskItems.length === 0) {
            return;
        }

        this.tokens.push({
            type: "TASK_LIST",
            items: this.taskItems
        });

        this.taskItems = [];
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


            // Line: ---, ***, ___

            if (line.trim() === "---" || line.trim() === "___" || line.trim() === "***") {
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

            // Task list:
            // "- [ ] something" for undone,
            // "- [x] something" for done
            const taskMatch = line.match(/^[-*]\s+\[([ xX])]\s?(.*)$/);
            if (taskMatch) {
                this.flushParagraph();
                this.flushList();

                this.taskItems.push({
                    checked: taskMatch[1].toLowerCase() === "x",
                    text: taskMatch[2]
                });

                continue;
            }

            // Unordered list: "- something" or "* something"
            const unorderedMatch = line.match(/^[-*]\s+(.*)$/);
            if (unorderedMatch) {
                this.flushParagraph();
                this.flushTaskList();

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
                this.flushTaskList();

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