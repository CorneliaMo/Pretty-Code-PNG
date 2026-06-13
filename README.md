# code-renderer

将代码文件或 stdin 中的代码渲染为带语法高亮的 PNG 图片，适合插入实验报告。

## 特性

- 使用 Shiki 提供成熟的语法高亮。
- 默认使用 JetBrains Mono，并内置 Sarasa Gothic SC 作为中文等宽回退字体。
- 保留代码缩进和内部空行，禁止自动换行。
- 使用白色背景和黑色 `1px` 方形细框。
- 可指定输出宽度或高度，另一边自动等比缩放。
- 支持可选行号和外部字体覆盖。

## 安装

要求 Node.js 22 或更高版本。

```bash
npm install
npm run build
npm link
```

安装后可以使用 `code-render` 命令。

## 使用

渲染代码文件：

```bash
code-render main.rs
code-render src/main.ts --width 1200 --line-numbers
```

文件输入默认在代码文件旁生成同名 PNG，例如 `main.rs` 输出为 `main.png`。

从 stdin 读取：

```bash
cat main.py | code-render --language python
printf 'console.log("hello");\n' | code-render --width 800 -o example.png
```

stdin 模式默认输出当前目录下的 `code.png`。工具会尝试自动识别语言；使用
`--language` 可以获得更稳定的高亮结果。

### 参数

| 参数 | 说明 |
| --- | --- |
| `[input-file]` | 输入代码文件；省略时从 stdin 读取 |
| `-o, --output <path>` | PNG 输出路径 |
| `-l, --language <language>` | 覆盖自动识别的语言 |
| `--font-size <pixels>` | 字号，默认 `16` |
| `--font <path>` | 使用外部 `.ttf`、`.otf`、`.woff` 或 `.woff2` 字体 |
| `--width <pixels>` | 指定输出宽度并等比缩放高度 |
| `--height <pixels>` | 指定输出高度并等比缩放宽度 |
| `--line-numbers` | 显示行号 |
| `--help` | 显示帮助 |
| `--version` | 显示版本 |

`--width` 和 `--height` 不能同时使用。目标文件已存在时会直接覆盖。

## 渲染规则

- 默认字号为 `16px`，代码框内边距为 `20px`。
- Tab 按四个空格显示。
- 仅移除输入末尾的换行，其他首尾空格和内部空行保持不变。
- 未指定宽高时，图片按代码内容的自然尺寸输出。
- 单边尺寸、字号和自然渲染尺寸最大为 `32768px`。

## 开发

```bash
npm run check
npm test
npm run build
npm run test:all
```

`npm run test:all` 会执行类型检查、ESLint、构建、单元测试和构建产物端到端测试。

## 字体许可证

内置的 JetBrains Mono 与 Sarasa Gothic SC 按 SIL Open Font License 1.1
重新分发，许可证和来源说明位于 `assets/fonts/`。
