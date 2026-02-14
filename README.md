# Smart Comment Remover 🧹

**AI-Powered Comment Remover** is a VS Code extension that intelligently cleans up your code by removing comments while preserving important documentation, license headers, and special annotations.

## 🚀 Features

- **Intelligent Removal**: Distinguishes between code comments, documentation (JSDoc, etc.), and license headers.
- **Language Support**: Works with JavaScript, TypeScript, Python, Java, C#, C++, Go, Rust, PHP, Ruby, HTML, CSS, SQL, and more.
- **Safety First**: 
  - Preserves **Documentation** (`/** ... */`, `""" ... """`) by default.
  - Preserves **License Headers** (Copyright/License).
  - Preserves **Annotations** (`TODO`, `FIXME`, `HACK`).
  - Preserves **Pragmas** (`@ts-ignore`, `eslint-disable`).
  - Protects strings and regex literals from accidental modification.
- **Diff Preview**: See exactly what will happen before it happens with a built-in diff view.
- **Batch Processing**: Clean up your entire workspace in one go.

## 📦 Usage

### Commands
- `Smart Comment Remover: Remove Comments`: remove comments from the active file.
- `Smart Comment Remover: Remove Comments in Selection`: remove comments only from the selected text.
- `Smart Comment Remover: Preview Removal`: Open a diff view to review changes.
- `Smart Comment Remover: Remove Comments in Workspace`: Process all files in the workspace (with confirmation).

### Configuration
You can customize the behavior in VS Code settings:

| Setting | Default | Description |
|---------|---------|-------------|
| `smartCommentRemover.preserveDocumentation` | `true` | Keep JSDoc, XML docs, and Python docstrings. |
| `smartCommentRemover.preserveLicenseHeaders` | `true` | Keep copyright and license headers at the top of files. |
| `smartCommentRemover.preserveAnnotations` | `["TODO", "FIXME", ...]` | List of keywords to preserve. |
| `smartCommentRemover.preservePragmas` | `true` | Keep compiler/linter directives. |
| `smartCommentRemover.showDiffPreview` | `true` | Show diff before applying changes (for single file). |
| `smartCommentRemover.excludePatterns` | `["**/node_modules/**", ...]` | Files to exclude during workspace cleanup. |

## 🔧 Installation

1. Open **VS Code**.
2. Go to the **Extensions** view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3. Search for "Smart Comment Remover".
4. Click **Install**.

## 🤝 Contributing

Found a bug or want to add a language? Issues and Pull Requests are welcome!

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
