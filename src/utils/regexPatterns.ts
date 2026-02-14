export interface LanguagePatterns {
    singleLine?: RegExp;
    multiLine?: RegExp;
    string?: RegExp; // Matches string literals to avoid false positives
    docString?: RegExp; // Matches documentation comments
}

export const languagePatterns: { [key: string]: LanguagePatterns } = {
    // JavaScript, TypeScript, C, C++, C#, Java, Go, Rust, Scala, Dart, Kotlin
    'javascript': {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        docString: /\/\*\*[\s\S]*?\*\//gm
    },
    'typescript': {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        docString: /\/\*\*[\s\S]*?\*\//gm
    },
    'javascriptreact': {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        docString: /\/\*\*[\s\S]*?\*\//gm
    },
    'typescriptreact': {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        docString: /\/\*\*[\s\S]*?\*\//gm
    },
    'c': {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(")(?:(?=(\\?))\2.)*?\1/g,
        docString: /\/\*\*[\s\S]*?\*\//gm
    },
    'cpp': {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(")(?:(?=(\\?))\2.)*?\1/g,
        docString: /\/\*\*[\s\S]*?\*\//gm
    },
    'csharp': {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(@?"|')(?:(?=(\\?))\2.)*?\1/g,
        docString: /\/\/\/.*$/gm // XML documentation
    },
    'java': {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(")(?:(?=(\\?))\2.)*?\1/g,
        docString: /\/\*\*[\s\S]*?\*\//gm
    },
    'go': {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(")(?:(?=(\\?))\2.)*?\1|`[\s\S]*?`/g,
    },
    'rust': {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(")(?:(?=(\\?))\2.)*?\1/g,
        docString: /\/\/\/.*$/gm
    },
    // Python
    'python': {
        singleLine: /#.*$/gm,
        string: /(['"])(?:(?=(\\?))\2.)*?\1/g,
        docString: /'''[\s\S]*?'''|"""[\s\S]*?"""/g
    },
    // Ruby
    'ruby': {
        singleLine: /#.*$/gm,
        multiLine: /=begin[\s\S]*?=end/gm,
        string: /(['"])(?:(?=(\\?))\2.)*?\1/g
    },
    // PHP
    'php': {
        singleLine: /(\/\/|#).*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        docString: /\/\*\*[\s\S]*?\*\//gm
    },
    // HTML, XML
    'html': {
        singleLine: /<!--[\s\S]*?-->/gm, // HTML comments can be multi-line
        string: /(["'])(?:(?=(\\?))\2.)*?\1/g
    },
    'xml': {
        singleLine: /<!--[\s\S]*?-->/gm,
        string: /(["'])(?:(?=(\\?))\2.)*?\1/g
    },
    // CSS, SCSS, LESS
    'css': {
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(["'])(?:(?=(\\?))\2.)*?\1/g
    },
    'scss': {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(["'])(?:(?=(\\?))\2.)*?\1/g
    },
    'less': {
        singleLine: /\/\/.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(["'])(?:(?=(\\?))\2.)*?\1/g
    },
    // Shell/Bash
    'shellscript': {
        singleLine: /#.*$/gm,
        string: /(["'])(?:(?=(\\?))\2.)*?\1/g
    },
    // SQL
    'sql': {
        singleLine: /--.*$/gm,
        multiLine: /\/\*[\s\S]*?\*\//gm,
        string: /(['"])(?:(?=(\\?))\2.)*?\1/g
    }
};

export function getLanguagePatterns(languageId: string): LanguagePatterns | undefined {
    return languagePatterns[languageId];
}
