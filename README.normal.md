# code-renderer

> Looking for the less readable version? Return to the [SpongeBob README](README.md).

Turn source code into clean, syntax-highlighted PNG images, because pasting raw
code into a laboratory report is apparently not fancy enough.

`code-renderer` reads code from a file or stdin, highlights it, wraps it in a
thin black frame, and exports the result as a PNG.

## Features

- Syntax highlighting powered by Shiki
- JetBrains Mono with a bundled Chinese monospace fallback
- Preserves indentation, consecutive spaces, and empty lines
- Optional right-aligned line numbers
- No automatic line wrapping
- Custom font and font-size support
- Configurable Shiki themes, including Catppuccin, Dracula, and Nord
- Scale by width or height while preserving the aspect ratio
- File input and stdin support
- One serious-looking black rectangular border

## Installation

Node.js 22 or newer is required.

Install from a packaged tarball:

```bash
npm install -g ./code-renderer-0.1.0.tgz
```

Or build and link the project locally:

```bash
npm install
npm run build
npm link
```

## Usage

Render a source file:

```bash
code-render main.rs
code-render src/main.ts --width 1200 --line-numbers
code-render src/main.ts --theme catppuccin-mocha
```

By default, file input produces a PNG beside the source file. For example,
`main.rs` becomes `main.png`.

Render code from stdin:

```bash
cat main.py | code-render --language python
printf 'console.log("hello");\n' | code-render --width 800 -o example.png
```

When reading from stdin, the default output is `code.png` in the current
directory.

The tool attempts to detect the language automatically. Use `--language` when
you would prefer certainty over adventure.

## Options

| Option | Description |
| --- | --- |
| `[input-file]` | Source file to render; reads stdin when omitted |
| `-o, --output <path>` | Output PNG path |
| `-l, --language <language>` | Override automatic language detection |
| `-t, --theme <theme>` | Select a Shiki theme; defaults to `github-light` |
| `--font-size <pixels>` | Font size; defaults to `16` |
| `--font <path>` | Use an external `.ttf`, `.otf`, `.woff`, or `.woff2` font |
| `--width <pixels>` | Set output width and scale height proportionally |
| `--height <pixels>` | Set output height and scale width proportionally |
| `--line-numbers` | Show right-aligned line numbers |
| `--help` | Display help |
| `--version` | Display version |

`--width` and `--height` cannot be used together. Existing output files are
overwritten without ceremony.

See the [theme guide](docs/themes.md) for popular themes, rendered examples,
and the complete list of available theme IDs.

## Rendering Rules

- Default font size: `16px`
- Code-frame padding: `20px`
- Border: square, black, and `1px` thick
- Tabs are displayed as four spaces
- Trailing newlines are removed
- Other whitespace is preserved
- Long lines remain long and refuse to wrap
- Maximum font size and image dimension: `32768px`

## Useful Tools

`useful-tools/markdown-code-images.mjs` converts every non-empty backtick-fenced
code block in a Markdown file into a PNG.

The script is independent from this repository's source code. It only needs
Node.js and a globally installed `code-render` command in `PATH`:

```bash
node useful-tools/markdown-code-images.mjs report.md
node useful-tools/markdown-code-images.mjs report.md output/report-images.md
```

By default, it creates:

```text
report.with-code-images.md
code-images/report-code-001.png
code-images/report-code-002.png
```

Language tags such as ```` ```rust ```` are passed to `code-render`. Unlabeled
code blocks are rendered as plain text, and empty code blocks are left
unchanged.

## Development

```bash
npm run check
npm test
npm run build
npm run test:all
```

`npm run test:all` runs type checking, ESLint, the build, unit tests, and
end-to-end tests.

## Font Licenses

JetBrains Mono and Sarasa Gothic SC are bundled under the SIL Open Font License
1.1.

Font attribution and license information are available in `assets/fonts/`.
