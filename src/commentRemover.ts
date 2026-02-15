import * as vscode from 'vscode';
import { getLanguagePatterns, LanguagePatterns } from './utils/regexPatterns';
import { CommentDetector, CommentType } from './commentDetector';

export class CommentRemover {

    public async removeCommentsAsync(text: string, languageId: string): Promise<string> {
        const patterns = getLanguagePatterns(languageId);
        if (!patterns) {
            console.warn(`Language ${languageId} not supported.`);
            return text;
        }

        const safeRanges = this.findSafeRanges(text, patterns);
        let commentRanges = this.findCommentRanges(text, patterns);
        
        // Filter out comments that are inside safe ranges
        commentRanges = commentRanges.filter(comment => {
            return !safeRanges.some(safe => 
                (comment.start >= safe.start && comment.end <= safe.end)
            );
        });

        // Resolve overlapping comment ranges (e.g. /* // */)
        // Sort by start position
        commentRanges.sort((a, b) => a.start - b.start);
        
        const mergedRanges: {start: number, end: number}[] = [];
        if (commentRanges.length > 0) {
            let current = commentRanges[0];
            for (let i = 1; i < commentRanges.length; i++) {
                const next = commentRanges[i];
                if (next.start < current.end) {
                    if (next.end > current.end) {
                         current.end = next.end;
                    }
                } else {
                    mergedRanges.push(current);
                    current = next;
                }
            }
            mergedRanges.push(current);
        }

        let result = text;
        // Apply removals in reverse
        for (let i = mergedRanges.length - 1; i >= 0; i--) {
            const range = mergedRanges[i];
            const commentText = text.substring(range.start, range.end);
            
            const isFirst = (i === 0);

            // Use Async classification
            const type = await CommentDetector.classifyAsync(commentText, isFirst);
            
            if (type === CommentType.Standard) {
                 // Check if it's a full line comment
                 const lineStart = text.lastIndexOf('\n', range.start) + 1;
                 const prevLineBreak = text.lastIndexOf('\n', range.start);
                 const nextLineBreak = text.indexOf('\n', range.end);
                 
                 const prefix = text.substring(lineStart, range.start);
                 // If prefix is only whitespace, it might be a full line comment
                 if (prefix.trim() === '') {
                     // It is a candidate for full line removal.
                     // But we must check if there is code AFTER the comment on the same line.
                     const suffixEnd = (nextLineBreak === -1) ? text.length : nextLineBreak;
                     const suffix = text.substring(range.end, suffixEnd);
                     
                     if (suffix.trim() === '') {
                         // Full line comment: remove from lineStart to matches end (including newline if possible)
                         let removeEnd = suffixEnd;
                         if (nextLineBreak !== -1) {
                             removeEnd++; // Include \n
                         }
                         
                         result = result.substring(0, lineStart) + result.substring(removeEnd);
                         continue;
                     }
                 }
                 
                 // Inline comment logic
                 result = result.substring(0, range.start) + result.substring(range.end);
            }
        }

        return result;
    }

    public removeComments(text: string, languageId: string): string {
        // Sync version for compatibility or simple use cases
        // Just calls the sync logic (duplicate mostly, but simpler)
        // For now, let's just warn or replicate sync logic if we must keep it.
        // But our task is integration. I'll leave this method but with sync classify.

        const patterns = getLanguagePatterns(languageId);
        if (!patterns) return text;
        // ... (truncated reuse of logic for sync)
        // To avoid code duplication in a real codebase we'd extract the logic
        // For this tool call, I'll just keep the structure clean by only adding the Async one 
        // and optionally deprecating the sync one if not needed. 
        // But extension.ts uses it. I will update extension.ts to use Async.
        // So I can leave this as is (sync) or update it.
        // I will just add the async method and leave the sync method alone to minimize diff noise/risk, 
        // but `extension.ts` will switch to `removeCommentsAsync`.
        return this.removeCommentsSyncInternal(text, languageId);
    }
    
    private removeCommentsSyncInternal(text: string, languageId: string): string {
        const patterns = getLanguagePatterns(languageId);
        if (!patterns) return text;

        const safeRanges = this.findSafeRanges(text, patterns);
        let commentRanges = this.findCommentRanges(text, patterns);
        
        commentRanges = commentRanges.filter(comment => !safeRanges.some(safe => (comment.start >= safe.start && comment.end <= safe.end)));
        commentRanges.sort((a, b) => a.start - b.start);
        
        const mergedRanges: {start: number, end: number}[] = [];
        if (commentRanges.length > 0) {
            let current = commentRanges[0];
            for (let i = 1; i < commentRanges.length; i++) {
                const next = commentRanges[i];
                if (next.start < current.end) {
                    if (next.end > current.end) current.end = next.end;
                } else {
                    mergedRanges.push(current);
                    current = next;
                }
            }
            mergedRanges.push(current);
        }

        let result = text;
        for (let i = mergedRanges.length - 1; i >= 0; i--) {
            const range = mergedRanges[i];
            const commentText = text.substring(range.start, range.end);
            const isFirst = (i === 0);
            const type = CommentDetector.classify(commentText, isFirst);
            
            if (type === CommentType.Standard) {
                 const lineStart = text.lastIndexOf('\n', range.start) + 1;
                 const nextLineBreak = text.indexOf('\n', range.end);
                 const prefix = text.substring(lineStart, range.start);
                 if (prefix.trim() === '') {
                     const suffixEnd = (nextLineBreak === -1) ? text.length : nextLineBreak;
                     const suffix = text.substring(range.end, suffixEnd);
                     if (suffix.trim() === '') {
                         let removeEnd = suffixEnd;
                         if (nextLineBreak !== -1) removeEnd++;
                         result = result.substring(0, lineStart) + result.substring(removeEnd);
                         continue;
                     }
                 }
                 result = result.substring(0, range.start) + result.substring(range.end);
            }
        }
        return result;
    }

    private findSafeRanges(text: string, patterns: LanguagePatterns): {start: number, end: number}[] {
        const ranges: {start: number, end: number}[] = [];
        if (patterns.string) {
            patterns.string.lastIndex = 0; 
            let match;
            while ((match = patterns.string.exec(text)) !== null) {
                ranges.push({ start: match.index, end: match.index + match[0].length });
            }
        }
        return ranges;
    }

    private findCommentRanges(text: string, patterns: LanguagePatterns): {start: number, end: number}[] {
         const ranges: {start: number, end: number}[] = [];
         
         // Helper to add ranges
         const addRanges = (regex: RegExp) => {
             regex.lastIndex = 0;
             let match;
             while ((match = regex.exec(text)) !== null) {
                 ranges.push({ start: match.index, end: match.index + match[0].length });
             }
         };

         if (patterns.singleLine) addRanges(patterns.singleLine);
         if (patterns.multiLine) addRanges(patterns.multiLine);
        
         return ranges;
    }
}

