import { ConfigManager } from './utils/configManager';

export enum CommentType {
    Standard,
    Documentation,
    License,
    Annotation,
    Pragma
}

export class CommentDetector {
    
    static classify(commentText: string, isFirstComment: boolean = false): CommentType {
        // Check for Pragma
        if (ConfigManager.preservePragmas && this.isPragma(commentText)) {
            return CommentType.Pragma;
        }

        // Check for Annotation
        if (this.isAnnotation(commentText)) {
            return CommentType.Annotation;
        }

        // Check for License
        if (isFirstComment && ConfigManager.preserveLicenseHeaders && this.isLicense(commentText)) {
            return CommentType.License;
        }

        // Check for Documentation
        if (ConfigManager.preserveDocumentation && this.isDocumentation(commentText)) {
            return CommentType.Documentation;
        }

        return CommentType.Standard;
    }

    static async classifyAsync(commentText: string, isFirstComment: boolean = false): Promise<CommentType> {
        // First, try fast regex-based classification
        const syncResult = this.classify(commentText, isFirstComment);

        // If regex identified it as a specific type, return it immediately to save tokens/time
        if (syncResult !== CommentType.Standard) {
            return syncResult;
        }

        // If it's "Standard", it might be a subtle documentation or just code.
        // Use AI to verify if enabled.
        // We need to import AIService dynamically or at top level.
        // Since this file is used by CommentRemover, which is used by extension...
        
        // Check if AI is enabled in config
        const enableAI = ConfigManager.enableAI;
        if (!enableAI) {
            return CommentType.Standard;
        }

        // Dynamic import to avoid circular dependency if any (AIService imports CommentType from here)
        const { AIService } = await import('./services/aiService');
        
        return await AIService.analyzeComment(commentText);
    }

    private static isPragma(text: string): boolean {
        // Matches @ts-ignore, eslint-disable, etc.
        return /@ts-ignore|@ts-expect-error|@ts-nocheck|eslint-disable|eslint-enable|stylelint-disable|tslint:disable/.test(text);
    }

    private static isAnnotation(text: string): boolean {
        const annotations = ConfigManager.preserveAnnotations;
        return annotations.some(annotation => text.includes(annotation));
    }

    private static isLicense(text: string): boolean {
        const lower = text.toLowerCase();
        return lower.includes('license') || lower.includes('copyright') || lower.includes('(c)');
    }

    private static isDocumentation(text: string): boolean {
        // JSDoc, XML Doc, or Python Docstring patterns are usually handled by regex distinction
        // But double check simplistic markers if needed
        return text.startsWith('/**') || text.startsWith('///') || text.startsWith('"""') || text.startsWith("'''");
    }
}
