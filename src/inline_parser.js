export class InlineParser {
    parse(text) {
        this.text = text;
        this.position = 0;

        return this.parseNodes();
    }

    parseNodes(stopDelimiter = null) {
        const nodes = [];
        let textBuffer = "";

        const flushText = () => {
            if (textBuffer.length === 0) {
                return;
            }

            nodes.push({
                type: "TEXT",
                value: textBuffer
            });

            textBuffer = "";
        };

        while (!this.isAtEnd()) {
            if (stopDelimiter && this.startsWith(stopDelimiter)) {
                break;
            }

            // Start with inline code -> text inside shouldn't de parsed
            if (this.startsWith("`")) {
                const node = this.parseInlineCode();

                if (node) {
                    flushText();
                    nodes.push(node);
                    continue;
                }
            }

            // Images before hyperlinks!
            if (this.startsWith("![")) {
                const node = this.parseImage();

                if (node) {
                    flushText();
                    nodes.push(node);
                    continue;
                }
            }

            // Hyperlink
            if (this.startsWith("[")) {
                const node = this.parseHyperlink();

                if (node) {
                    flushText();
                    nodes.push(node);
                    continue;
                }
            }

            // Check double delimiters before single delimiters
            // Bold + italic
            if (this.startsWith("***")) {
                const node = this.parseDoubleDelimited("***", "BOLD", "ITALIC");

                if (node) {
                    flushText();
                    nodes.push(node);
                    continue;
                }
            }

            // Underline + italic
            if (this.startsWith("___")) {
                const node = this.parseDoubleDelimited("___", "UNDERLINE", "ITALIC");

                if (node) {
                    flushText();
                    nodes.push(node);
                    continue;
                }
            }

            // Check double char delimiters before single char delimiters
            // Bold
            if (this.startsWith("**")) {
                const node = this.parseDelimited("**", "BOLD");

                if (node) {
                    flushText();
                    nodes.push(node);
                    continue;
                }
            }

            // Underline
            if (this.startsWith("__")) {
                const node = this.parseDelimited("__", "UNDERLINE");

                if (node) {
                    flushText();
                    nodes.push(node);
                    continue;
                }
            }

            // Strike through
            if (this.startsWith("~~")) {
                const node = this.parseDelimited("~~", "STRIKE_THROUGH");

                if (node) {
                    flushText();
                    nodes.push(node);
                    continue;
                }
            }

            // Italic *
            if (this.startsWith("*")) {
                const node = this.parseDelimited("*", "ITALIC");

                if (node) {
                    flushText();
                    nodes.push(node);
                    continue;
                }
            }

            // Italic _
            if (this.startsWith("_")) {
                const node = this.parseDelimited("_", "ITALIC");

                if (node) {
                    flushText();
                    nodes.push(node);
                    continue;
                }
            }

            // Auto hyperlink
            const automaticLink = this.parseAutomaticLink();
            if (automaticLink) {
                flushText();
                nodes.push(automaticLink);
                continue;
            }

            // Backslash escaping
            if (this.currentCharacter() === "\\" && !this.isAtEnd(1)) {
                textBuffer += this.text[this.position + 1];
                this.position += 2;
                continue;
            }

            textBuffer += this.currentCharacter();
            this.position++;
        }

        flushText();

        return nodes;
    }

    parseDoubleDelimited(delimiter, type1, type2) {
        const content = this.consumeDelimitedContent(delimiter);
        if (content === null) return null;

        return {
            type: type1,
            children: [{
                type: type2,
                children: this.parseFragment(content)
            }]
        };
    }

    parseDelimited(delimiter, type) {
        const content = this.consumeDelimitedContent(delimiter);
        if (content === null) return null;

        return {
            type,
            children: this.parseFragment(content)
        };
    }

    // Just a function to avoid repetition
    consumeDelimitedContent(delimiter) {
        const startPosition = this.position;
        this.position += delimiter.length;
        const closingPosition = this.findClosingDelimiter(delimiter);

        // If closingPosition is equal to current position, text in delimiter is empty -> cancel
        if (closingPosition === -1 || closingPosition === this.position) {
            this.position = startPosition;
            return null;
        }

        const content = this.text.slice(
            this.position,
            closingPosition
        );

        this.position = closingPosition + delimiter.length;

        return content;
    }


    parseInlineCode() {
        const startPosition = this.position;
        const delimiterLength = this.countRepeatedCharacter("`");

        const delimiter = "`".repeat(delimiterLength);

        this.position += delimiterLength;

        const closingPosition = this.text.indexOf(
            delimiter,
            this.position
        );

        if (closingPosition === -1) {
            this.position = startPosition;
            return null;
        }

        const value = this.text.slice(
            this.position,
            closingPosition
        );

        this.position = closingPosition + delimiterLength;

        return {
            type: "INLINE_CODE",
            value
        };
    }

    parseImage() {
        const startPosition = this.position;

        this.position += 2;

        const alt = this.readBalancedContent("[", "]");

        if (alt === null || !this.startsWith("(")) {
            this.position = startPosition;
            return null;
        }

        const destination = this.parseDestination();

        if (!destination) {
            this.position = startPosition;
            return null;
        }

        return {
            type: "IMAGE",
            src: destination.url,
            alt,
            title: destination.title
        };
    }

    parseHyperlink() {
        const startPosition = this.position;

        this.position++;

        const label = this.readBalancedContent("[", "]");

        if (label === null || !this.startsWith("(")) {
            this.position = startPosition;
            return null;
        }

        const destination = this.parseDestination();

        if (!destination) {
            this.position = startPosition;
            return null;
        }

        const isMail = /^[\w.-]+@(?:[\w-]+\.)+[\w-]{2,}$/.test(
            destination.url
        );

        return {
            type: "HYPERLINK",
            link: destination.url,
            title: destination.title,
            isMail,
            children: this.parseFragment(label)
        };
    }

    parseDestination() {
        if (!this.startsWith("(")) {
            return null;
        }

        this.position++;

        const contentStart = this.position;
        let parenthesesDepth = 0;
        let quote = null;

        while (!this.isAtEnd()) {
            const character = this.currentCharacter();

            if (character === "\\" && !this.isAtEnd(1)) {
                this.position += 2;
                continue;
            }

            if (quote) {
                if (character === quote) {
                    quote = null;
                }

                this.position++;
                continue;
            }

            if (character === "\"" || character === "'") {
                quote = character;
                this.position++;
                continue;
            }

            if (character === "(") {
                parenthesesDepth++;
                this.position++;
                continue;
            }

            if (character === ")") {
                if (parenthesesDepth > 0) {
                    parenthesesDepth--;
                    this.position++;
                    continue;
                }

                const content = this.text
                    .slice(contentStart, this.position)
                    .trim();

                this.position++;

                return this.splitDestination(content);
            }

            this.position++;
        }

        return null;
    }

    splitDestination(content) {
        /*
         * Examples:
         *
         * https://example.com
         * https://example.com "Example title"
         * https://example.com 'Example title'
         */
        const titleMatch = content.match(
            /^(.*?)\s+(?:"([^"]*)"|'([^']*)')$/
        );

        if (!titleMatch) {
            return {
                url: this.removeAngleBrackets(content),
                title: undefined
            };
        }

        return {
            url: this.removeAngleBrackets(titleMatch[1].trim()),
            title: titleMatch[2] ?? titleMatch[3]
        };
    }

    readBalancedContent(opening, closing) {
        const contentStart = this.position;
        let depth = 0;

        while (!this.isAtEnd()) {
            const character = this.currentCharacter();

            if (character === "\\" && !this.isAtEnd(1)) {
                this.position += 2;
                continue;
            }

            if (character === opening) {
                depth++;
                this.position++;
                continue;
            }

            if (character === closing) {
                if (depth > 0) {
                    depth--;
                    this.position++;
                    continue;
                }

                const content = this.text.slice(
                    contentStart,
                    this.position
                );

                this.position++;

                return content;
            }

            this.position++;
        }

        return null;
    }

    parseAutomaticLink() {
        const remaining = this.text.slice(this.position);

        const match = remaining.match(
            /^(?:https?:\/\/|www\.)[^\s<]+/
        );

        if (!match) {
            return null;
        }

        let displayedUrl = match[0];

        while (
            displayedUrl.length > 0 &&
            /[.,!?;:]$/.test(displayedUrl)
            ) {
            displayedUrl = displayedUrl.slice(0, -1);
        }

        while (
            displayedUrl.endsWith(")") &&
            this.countCharacter(displayedUrl, ")") >
            this.countCharacter(displayedUrl, "(")
            ) {
            displayedUrl = displayedUrl.slice(0, -1);
        }

        if (displayedUrl.length === 0) {
            return null;
        }

        this.position += displayedUrl.length;

        const link = displayedUrl.startsWith("www.")
            ? `https://${displayedUrl}`
            : displayedUrl;

        return {
            type: "HYPERLINK",
            link,
            isMail: false,
            children: [
                {
                    type: "TEXT",
                    value: displayedUrl
                }
            ]
        };
    }

    parseFragment(content) {
        return new InlineParser().parse(content);
    }

    findClosingDelimiter(delimiter) {
        let searchPosition = this.position;

        while (searchPosition < this.text.length) {
            const closingPosition = this.text.indexOf(
                delimiter,
                searchPosition
            );

            if (closingPosition === -1) {
                return -1;
            }

            if (
                closingPosition === 0 ||
                this.text[closingPosition - 1] !== "\\"
            ) {
                return closingPosition;
            }

            searchPosition = closingPosition + delimiter.length;
        }

        return -1;
    }

    countRepeatedCharacter(character) {
        let count = 0;
        while (this.text[this.position + count] === character) count++;
        return count;
    }

    countCharacter(text, character) {
        let count = 0;

        for (const current of text) {
            if (current === character) {
                count++;
            }
        }

        return count;
    }

    removeAngleBrackets(value) {
        if (value.startsWith("<") && value.endsWith(">")) {
            return value.slice(1, -1);
        }

        return value;
    }

    startsWith(value) {
        return this.text.startsWith(value, this.position);
    }

    currentCharacter() {
        return this.text[this.position];
    }

    isAtEnd(offset = 0) {
        return this.position + offset >= this.text.length;
    }
}