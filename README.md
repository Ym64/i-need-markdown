# I Need Markdown ![NPM Version](https://img.shields.io/npm/v/i-need-markdown)


I Need Markdown is a simple, lightweight tool which turns markdown into html.


## Usage

#### 1. Using npm with a build tool (like Vite)

Install the package first
```bash
npm install i-need-markdown
```
Then use it in your code
```javascript
import { parse } from "i-need-markdown";
const html = parse("# Hello World!");
console.log(html);
```

---

#### 2. Import directly from a CDN
Import using [esm.sh](https://esm.sh/i-need-markdown)
```javascript
import { parse } from "https://esm.sh/i-need-markdown@<version>";
const html = parse("# Hello World!");
console.log(html);
```
Replace `<version>` with the latest package version (![NPM Version](https://img.shields.io/npm/v/i-need-markdown))

---

For an example of how it can be used on a webpage, check the [markdown viewer](https://github.com/Ym64/i-need-markdown/blob/master/viewer/index.html).

## Supported Markdown features
- Headers (h1 - h6)
- Paragraphs
- Ordered lists
- Unordered lists
- Text styling
  - Bold
  - Italic
  - Underline
  - Strike through
- Inline code
- Hyperlinks (including emails)
- Images

## To-do
This project isn't finished yet, there're still some markdown features that need to be implemented.
- [ ] Blockquotes
- [ ] Code blocks
