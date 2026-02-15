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
             const answer = await vscode.window.showInformationMessage(
                 'Review the changes. Do you want to apply them?',
                 'Yes',
                 'No'
             );
             
             if (answer === 'Yes') {
                 await applyRemoval(editor);
                 // Optionally close the diff editor? Hard to specificially close just that one.
                 // But the user will see the original file update.
             }
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
    const edit = new vscode.WorkspaceEdit();
    
    if (selectionOnly) {
        for (const selection of editor.selections) {
            const text = document.getText(selection);
            const cleanText = await commentRemover.removeCommentsAsync(text, document.languageId);
            edit.replace(document.uri, selection, cleanText);
        }
    } else {
        const text = document.getText();
        const cleanText = await commentRemover.removeCommentsAsync(text, document.languageId);
        if (text !== cleanText) {
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
            );
            edit.replace(document.uri, fullRange, cleanText);
        } else {
             vscode.window.showInformationMessage('No comments found to remove.');
             return;
        }
    }

    await vscode.workspace.applyEdit(edit);
    // Explicitly save if it was a full file operation? 
    // Usually applyEdit doesn't save automatically. user can save.
}

export function deactivate() {}
