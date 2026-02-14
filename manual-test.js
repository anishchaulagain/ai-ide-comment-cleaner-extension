// Manual test script for CommentRemover
const { CommentRemover } = require('./out/commentRemover');
const { ConfigManager } = require('./out/utils/configManager');

// Mock vscode config
const vscode = {
    workspace: {
        getConfiguration: () => ({
            get: (key, defaultValue) => defaultValue
        })
    }
};
global.vscode = vscode;

// We need to inject the mock into configManager if it imports vscode.
// Since ConfigManager imports vscode, and we are in node, the import might fail if 'vscode' module is not found.
// However, 'vscode' module is usually not available at runtime in node unless we mock it via module alias or something.
// A simpler way: just mock the ConfigManager methods directly if we can, or use a testing harness.

// Actually, in compiled JS (CommonJS), 'vscode' is required. 
// If I run this with `node`, it will fail to find 'vscode'.
// I need shorter path: I can't easily run compiled code that depends on 'vscode' without a mock.

console.log("Skipping manual node test due to vscode dependency. Relying on unit tests via 'npm test' or manual extension usage.");
console.log("The unit tests in src/test/suite/commentRemover.test.ts are better suited for this if run within the VS Code test runner.");
