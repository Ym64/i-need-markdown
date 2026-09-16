# I Need Markdown

I Need Markdown is a simple, lightweight tool which turns markdown into html.


## Usage
```javascript
import { parse } from "i-need-markdown";
const html = parse("# Hello World!");
console.log(html);
```

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
- Hyperlinks

## To-do
This project isn't finished yet, there're still some markdown features that need to be implemented.
- [ ] Images
- [ ] Email links
- [ ] Blockquotes
- [ ] Code blocks
