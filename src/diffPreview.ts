import * as vscode from 'vscode';
import { CommentRemover } from './commentRemover';

export class DiffPreview {
    private static readonly scheme = 'smart-comment-remover';
    private commentRemover: CommentRemover;

    constructor() {
        this.commentRemover = new CommentRemover();
    }

    public async showDiff(document: vscode.TextDocument) {
        const originalContent = document.getText();
        const cleanContent = this.commentRemover.removeComments(originalContent, document.languageId);

        if (originalContent === cleanContent) {
            vscode.window.showInformationMessage('No comments to remove.');
            return;
        }

        const originalUri = document.uri;
        const cleanUri = originalUri.with({ scheme: DiffPreview.scheme, path: originalUri.path + ' (Clean)' });

        // We can't easily register a provider for 'smart-comment-remover' scheme effectively for *arbitrary* content 
        // without storing it somewhere.
        // Alternative: Use an untitled document with content.
        
        const doc = await vscode.workspace.openTextDocument({ content: cleanContent, language: document.languageId });
        
        // Show diff
        await vscode.commands.executeCommand('vscode.diff', 
            originalUri, 
            doc.uri, 
            `Comment Removal Preview: ${document.fileName}`
        );
    }
}
