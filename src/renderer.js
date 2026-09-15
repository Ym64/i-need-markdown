export class Renderer {

    render(node) {

        switch (node.type) {

            case "DOCUMENT":
                return node.children
                    .map(child => this.render(child))
                    .join("\n");

            case "HEADER":
                return `<h${node.level}>${node.children.map(c => this.render(c)).join("")}</h${node.level}>`;

            case "PARAGRAPH":
                return `<p>${node.children.map(c => this.render(c)).join("")}</p>`;

            case "TEXT":
                return node.value;

            case "BOLD":
                return `<strong>${node.children.map(c => this.render(c)).join("")}</strong>`

            case "ITALIC":
                return `<i>${node.children.map(c => this.render(c)).join("")}</i>`

            case "UNDERLINE":
                return `<u>${node.children.map(c => this.render(c)).join("")}</u>`

            case "STRIKE_THROUGH":
                return `<s>${node.children.map(c => this.render(c)).join("")}</s>`

            case "HORIZONTAL_RULE":
                return `<hr>`

            case "HYPERLINK":
                return `<a href="${node.link}">${node.children.map(c => this.render(c)).join("")}</a>`

            case "INLINE_CODE":
                return `<span class="inline-code">${node.value}</span>`

            case "UNORDERED_LIST":
                return `<ul>\n${node.children.map(c => this.render(c)).join("\n")}\n</ul>`;

            case "ORDERED_LIST":
                return `<ol start="${node.start}">\n${node.children.map(c => this.render(c)).join("\n")}\n</ol>`;

            case "LIST_ITEM":
                return `<li>${node.children.map(c => this.render(c)).join("")}</li>`;

            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }

    }

}