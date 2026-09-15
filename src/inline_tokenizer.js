export class InlineTokenizer {

    tokenize(text) {
        const tokens = [];

        let remaining = text;

        while (remaining.length > 0) {

            const boldMatch = remaining.match(/^\*\*(.*?)\*\*/);
            if (boldMatch) {
                tokens.push({
                    type: "BOLD",
                    children: this.tokenize(boldMatch[1])
                });

                remaining = remaining.slice(boldMatch[0].length);
                continue;
            }

            const italicMatch = remaining.match(/^(?:\*(.*?)\*|_(.*?)_)/);
            if (italicMatch) {
                tokens.push({
                    type: "ITALIC",
                    children: this.tokenize(italicMatch[1] ?? italicMatch[2])
                });

                remaining = remaining.slice(italicMatch[0].length);
                continue;
            }

            const codeMatch = remaining.match(/^`(.*?)`/);
            if (codeMatch) {
                tokens.push({
                    type: "INLINE_CODE",
                    value: codeMatch[1]
                });

                remaining = remaining.slice(codeMatch[0].length);
                continue;
            }

            tokens.push({
                type: "TEXT",
                value: remaining[0]
            });

            remaining = remaining.slice(1);
        }

        return tokens;
    }

}