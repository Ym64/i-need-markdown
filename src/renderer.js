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