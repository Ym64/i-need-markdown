export class Renderer {

    render(node) {

        switch (node.type) {

            case "DOCUMENT":
                return `<div class="inmd-container">\n    ${node.children.map(child => this.render(child)).join("\n    ")}\n</div>`;

            case "HEADER":
                return `<h${node.level} class="inmd-header-${node.level}">${node.children.map(c => this.render(c)).join("")}</h${node.level}>`;

            case "PARAGRAPH":
                return `<p class="inmd-paragraph">${node.children.map(c => this.render(c)).join("")}</p>`;

            case "TEXT":
                return node.value;

            case "BOLD":
                return `<strong class="inmd-bold">${node.children.map(c => this.render(c)).join("")}</strong>`

            case "ITALIC":
                return `<i class="inmd-italic">${node.children.map(c => this.render(c)).join("")}</i>`

            case "UNDERLINE":
                return `<u class="inmd-underline">${node.children.map(c => this.render(c)).join("")}</u>`

            case "STRIKE_THROUGH":
                return `<s class="inmd-strike-through">${node.children.map(c => this.render(c)).join("")}</s>`

            case "HORIZONTAL_RULE":
                return `<hr class="inmd-horizontal-rule">`

            case "HYPERLINK":
                return `<a class="inmd-hyperlink" href="${node.link}">${node.children.map(c => this.render(c)).join("")}</a>`

            case "INLINE_CODE":
                return `<code class="inmd-inline-code">${node.value}</code>`

            case "UNORDERED_LIST":
                return `<ul class="inmd-unordered-list">\n    ${node.children.map(c => this.render(c)).join("\n    ")}\n    </ul>`;

            case "ORDERED_LIST":
                return `<ol class="inmd-ordered-list" start="${node.start}">\n    ${node.children.map(c => this.render(c)).join("\n    ")}\n    </ol>`;

            case "LIST_ITEM":
                return `<li class="inmd-list-item">${node.children.map(c => this.render(c)).join("")}</li>`;

            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }

    }

}