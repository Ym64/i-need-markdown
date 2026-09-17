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
                return `<a class="inmd-hyperlink" href="${node.isMail ? "mailto:" + node.link : node.link}">${node.children.map(c => this.render(c)).join("")}${node.title ? ` title="${node.title}"` : ""}</a>`

            case "IMAGE":
                return `<img src="${node.src}" alt="${node.alt}"${node.title ? ` title="${node.title}"` : ""}>`;

            case "INLINE_CODE":
                return `<code class="inmd-inline-code">${this.escapeHtml(node.value)}</code>`

            case "CODE_BLOCK":
                return `<pre class="inmd-code-block"><code class="${node.language ? `language-${this.escapeHtml(node.language)}` : ""}">${node.lines.map(l => this.escapeHtml(l)).join("\n")}</code></pre>`

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

    escapeHtml(text) {
        return String(text)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

}