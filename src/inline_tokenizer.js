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

            const underlineMatch = remaining.match(/^__(.*?)__/);
            if (underlineMatch) {
                tokens.push({
                    type: "UNDERLINE",
                    children: this.tokenize(underlineMatch[1])
                });

                remaining = remaining.slice(underlineMatch[0].length);
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

            const strikeThroughMatch = remaining.match(/^~~(.*?)~~/);
            if (strikeThroughMatch) {
                tokens.push({
                    type: "STRIKE_THROUGH",
                    children: this.tokenize(strikeThroughMatch[1])
                });

                remaining = remaining.slice(strikeThroughMatch[0].length);
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

            const hyperlinkMatch = remaining.match(/^\[(.*)]\((.*)\)/);
            if (hyperlinkMatch) {
                tokens.push({
                    type: "HYPERLINK",
                    link: hyperlinkMatch[2],
                    children: this.tokenize(hyperlinkMatch[1])
                });

                remaining = remaining.slice(hyperlinkMatch[0].length);
                continue;
            }

            const linkMatch = remaining.match(/^(https?:\/\/\S+|www\.\S+)/);
            if (linkMatch) {
                tokens.push({
                    type: "HYPERLINK",
                    link: linkMatch[0],
                    children: [{
                        type: "TEXT",
                        value: linkMatch[0]
                    }]
                });

                remaining = remaining.slice(linkMatch[0].length);
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