# Smart Comment Remover 🧹

[![Version](https://img.shields.io/visual-studio-marketplace/v/antigravity.smart-comment-remover)](https://marketplace.visualstudio.com/items?itemName=antigravity.smart-comment-remover)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/antigravity.smart-comment-remover)](https://marketplace.visualstudio.com/items?itemName=antigravity.smart-comment-remover)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/antigravity.smart-comment-remover)](https://marketplace.visualstudio.com/items?itemName=antigravity.smart-comment-remover)
[![License](https://img.shields.io/github/license/anishchaulagain/ai-ide-comment-cleaner-extension)](LICENSE)

**AI-Powered Comment Remover** is the ultimate tool for cleaning up your codebase. It intelligently distinguishes between clutter (commented-out code, TODOs) and value (documentation, licenses), ensuring your code remains clean without losing critical context. Now supercharged with **OpenAI (GPT-4o)** and **Groq (Llama 3)** for unparalleled accuracy.

## 🌟 Why Smart Comment Remover?

most comment removers are dumb—they delete everything. **Smart Comment Remover** understands your code.

| Feature | Detailed Description |
| :--- | :--- |
| **🧠 AI-Powered Analysis** | Uses advanced LLMs to detect the *intent* of a comment. ambiguos comments are no match for GPT-4o. |
| **🛡️ Safety First** | Built-in protection for JSDoc, Javadoc, Python docstrings, and License headers. Your documentation is safe. |
| **👀 Diff Preview** | Review every single change before it happens. Catch mistakes before they become commits. |
| **⚡ Blazing Fast** | Optimized for performance. Process large files or entire workspaces in seconds. |
| **🌍 Polyglot** | Supports JavaScript, TypeScript, Python, Java, C#, Go, Rust, PHP, Ruby, SQL, CSS, HTML, and more. |

## 📸 Demo

<!-- TODO: Add a GIF demo here -->
*(Coming Soon: A visual walkthrough of the extension in action)*

## 🔍 Before & After

See the difference for yourself.

**Before:**
```javascript
/**
 * Calculates the sum of two numbers.
 * @param a First number
 * @param b Second number
 */
function add(a, b) {
    // This is a simple addition
    // TODO: support infinite arguments
    return a + b; // returns the result
}
```

**After:**
```javascript
/**
 * Calculates the sum of two numbers.
 * @param a First number
 * @param b Second number
 */
function add(a, b) {
    // TODO: support infinite arguments
    return a + b;
}
```
*Note: The JSDoc and TODO were preserved, while the redundant inline comments were removed.*

## 📦 Usage

### Commands
- `Smart Comment Remover: Remove Comments`: Remove comments from the active file.
- `Smart Comment Remover: Remove Comments in Selection`: Remove comments only from the selected text.
- `Smart Comment Remover: Preview Removal`: Open a diff view to review changes before applying (Recommended).
- `Smart Comment Remover: Remove Comments in Workspace`: Process all files in the workspace (Requires confirmation).

### 🤖 AI Setup
To enable AI-powered classification for maximum accuracy:

1. Create a `.env` file in the root of your workspace.
2. Add your API key(s):
   ```env
   OPENAI_API_KEY=sk-your-openai-key-here
   # OR
   GROQ_API_KEY=gsk-your-groq-key-here
   ```
   *The extension will prioritize OpenAI if both keys are present.*

### Configuration
Customize the extension to fit your workflow in VS Code settings:

| Setting | Default | Description |
|---------|---------|-------------|
| `smartCommentRemover.excludePatterns` | `["**/node_modules/**", ...]` | Glob patterns for files/folders to exclude during workspace cleanup. |
| `smartCommentRemover.preserveDocumentation` | `true` | Preserves JSDoc, XML docs, and Python docstrings (`/** ... */`, `""" ... """`). |
| `smartCommentRemover.preserveLicenseHeaders` | `true` | Preserves copyright notices and license headers at the top of files. |
| `smartCommentRemover.preserveAnnotations` | `["TODO", "FIXME", ...]` | List of specific keywords/tags to preserve. |
| `smartCommentRemover.preservePragmas` | `true` | Preserves compiler directives like `@ts-ignore` or `eslint-disable`. |
| `smartCommentRemover.showDiffPreview` | `true` | Automatically show a diff preview before applying changes to a single file. |
| `smartCommentRemover.enableAI` | `true` | Toggles AI-powered comment classification (requires valid API key). |

## 🔒 Privacy & Data Usage

We take your privacy seriously.
- **Local Processing**: By default, simple regex-based detection runs entirely locally on your machine.
- **AI Processing**: When AI features are enabled, small snippets of comments (and their immediate context) are sent to OpenAI or Groq for classification.
  - **No Storage**: We do not store your code.
  - **No Training**: Data sent to the API is not used for training models (subject to OpenAI/Groq policies).

## ❓ Troubleshooting

**Q: The AI isn't working/comments aren't being removed smartly.**
A: Ensure you have a valid API key in your `.env` file and that `smartCommentRemover.enableAI` is set to `true`. Check the "Output" panel for any error messages.

**Q: It removed my documentation!**
A: Check `smartCommentRemover.preserveDocumentation` setting. If it's `true`, please open an issue with the specific comment style that failed.

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
