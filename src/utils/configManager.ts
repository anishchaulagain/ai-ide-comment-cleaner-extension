import * as vscode from 'vscode';

export class ConfigManager {
    static get preserveDocumentation(): boolean {
        return vscode.workspace.getConfiguration('smartCommentRemover').get('preserveDocumentation', true);
    }

    static get preserveLicenseHeaders(): boolean {
        return vscode.workspace.getConfiguration('smartCommentRemover').get('preserveLicenseHeaders', true);
    }

    static get preserveAnnotations(): string[] {
        return vscode.workspace.getConfiguration('smartCommentRemover').get('preserveAnnotations', ['TODO', 'FIXME', 'HACK', 'BUG']);
    }

    static get preservePragmas(): boolean {
        return vscode.workspace.getConfiguration('smartCommentRemover').get('preservePragmas', true);
    }
    
    static get excludePatterns(): string[] {
        return vscode.workspace.getConfiguration('smartCommentRemover').get('excludePatterns', []);
    }
}
