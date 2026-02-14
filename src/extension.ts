import * as vscode from 'vscode';
import { CommentRemover } from './commentRemover';
import { DiffPreview } from './diffPreview';
import { WorkspaceProcessor } from './workspaceProcessor';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    console.log('Smart Comment Remover is active');

    const commentRemover = new CommentRemover();
    const diffPreview = new DiffPreview();
    const workspaceProcessor = new WorkspaceProcessor();

    // Command: Remove Comments (Current File)
    const removeCommentsDisposable = vscode.commands.registerCommand('smartCommentRemover.removeComments', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const selection = editor.selection;
        
        // Check if we should preview first (if configured)
        const showPreview = vscode.workspace.getConfiguration('smartCommentRemover').get('showDiffPreview', true);
        
        if (showPreview) {
             await diffPreview.showDiff(document);
             // The diff view allows users to apply changes manually or we could provide a button.
             // But valid standard flow is just showing diff.
             // If user wants to APPLY immediately without preview, they can disable setting.
             return;
        }
        
        applyRemoval(editor);
    });

    // Command: Remove Comments in Selection
    const removeSelectionDisposable = vscode.commands.registerCommand('smartCommentRemover.removeCommentsInSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        // For selection, we probably just act immediately
        applyRemoval(editor, true);
    });

    // Command: Preview Removal
    const previewDisposable = vscode.commands.registerCommand('smartCommentRemover.previewRemoval', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            await diffPreview.showDiff(editor.document);
        }
    });

    // Command: Workspace Batch
    const workspaceDisposable = vscode.commands.registerCommand('smartCommentRemover.removeCommentsInWorkspace', async () => {
        await workspaceProcessor.cleanWorkspace();
    });

    // Link Status Bar
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'smartCommentRemover.previewRemoval';
    context.subscriptions.push(statusBarItem);
    
    // Update status bar event listeners
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBar));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
        if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
            updateStatusBar();
        }
    }));
    
    updateStatusBar();

    context.subscriptions.push(
        removeCommentsDisposable,
        removeSelectionDisposable,
        previewDisposable,
        workspaceDisposable
    );
}

function updateStatusBar() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        // In a real implementation, we might count comments here.
        // For performance, maybe just show "Remove Comments" or count lazily.
        // Let's just show text.
        statusBarItem.text = '$(comment) Remove Comments';
        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }
}

async function applyRemoval(editor: vscode.TextEditor, selectionOnly: boolean = false) {
    const document = editor.document;
    const commentRemover = new CommentRemover();
    
    if (selectionOnly) {
        await editor.edit(editBuilder => {
            editor.selections.forEach(selection => {
                const text = document.getText(selection);
                const cleanText = commentRemover.removeComments(text, document.languageId);
                editBuilder.replace(selection, cleanText);
            });
        });
    } else {
        const text = document.getText();
        const cleanText = commentRemover.removeComments(text, document.languageId);
        if (text !== cleanText) {
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
            );
            await editor.edit(editBuilder => editBuilder.replace(fullRange, cleanText));
        } else {
             vscode.window.showInformationMessage('No comments found to remove.');
        }
    }
}

export function deactivate() {}
