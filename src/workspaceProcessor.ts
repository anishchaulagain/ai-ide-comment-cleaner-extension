import * as vscode from 'vscode';
import * as path from 'path';
import { CommentRemover } from './commentRemover';
import { ConfigManager } from './utils/configManager';
import { minimatch } from 'minimatch';

export class WorkspaceProcessor {
    private commentRemover: CommentRemover;

    constructor() {
        this.commentRemover = new CommentRemover();
    }

    public async cleanWorkspace() {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('No workspace opened.');
            return;
        }

        const confirm = await vscode.window.showWarningMessage(
            'Are you sure you want to remove comments from all files in the workspace? This cannot be easily undone via one "Undo".',
            { modal: true },
            'Yes', 'No'
        );

        if (confirm !== 'Yes') {
            return;
        }

        const excludePatterns = ConfigManager.excludePatterns;
        const globPattern = '**/*'; 
        
        // Find all files
        const files = await vscode.workspace.findFiles(globPattern);
        
        let processedCount = 0;
        
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Removing comments from workspace...",
            cancellable: true
        }, async (progress, token) => {
            const increment = 100 / files.length;
            
            for (const file of files) {
                if (token.isCancellationRequested) break;

                // Check excludes
                const relativePath = vscode.workspace.asRelativePath(file);
                if (excludePatterns.some(pattern => minimatch(relativePath, pattern))) {
                    continue;
                }

                try {
                    const document = await vscode.workspace.openTextDocument(file);
                    const originalContent = document.getText();
                    const cleanContent = this.commentRemover.removeComments(originalContent, document.languageId);
                    
                    if (originalContent !== cleanContent) {
                        const edit = new vscode.WorkspaceEdit();
                        edit.replace(file, new vscode.Range(0, 0, document.lineCount, 0), cleanContent);
                        await vscode.workspace.applyEdit(edit);
                        // Using WorkspaceEdit might open all files. 
                        // For large workspaces, doing this file-by-file and saving might be better?
                        // Or utilize 'fs' to write directly? 
                        // VS Code API is safer for encoding/eol/etc.
                        // But we should probably save the document.
                        await document.save(); 
                        processedCount++;
                    }
                } catch (error) {
                    console.error(`Error processing ${file.fsPath}:`, error);
                }

                progress.report({ increment: increment, message: `Processed ${processedCount} files` });
            }
        });

        vscode.window.showInformationMessage(`Comment removal complete. Processed ${processedCount} files.`);
    }
}
