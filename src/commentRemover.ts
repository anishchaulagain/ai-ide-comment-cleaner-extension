import * as vscode from 'vscode';
import { getLanguagePatterns, LanguagePatterns } from './utils/regexPatterns';
import { CommentDetector, CommentType } from './commentDetector';

export class CommentRemover {

    public removeComments(text: string, languageId: string): string {
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
                    // Overlap: take the larger one or merge? 
                    // Usually the one starting first is the "outer" one in valid code.
                    // If they start at the same time, take the longer one.
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
            
            // Re-calculate isFirst based on original text positions (approximate is fine)
            // A better way for "isFirst" is if it's the first in the merged list.
            const isFirst = (i === 0);

            const type = CommentDetector.classify(commentText, isFirst);
            
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
                         
                         // Re-slice the result based on current offsets? 
                         // No, we are modifying 'result' which is a copy.
                         // But we are iterating in reverse, so indices in 'text' (ranges) are valid for the *start* of the string relative to the end.
                         // Wait, if we use 'text' indices, they are static.
                         // We must cut from 'result'.
                         // BUT 'result' changes length.
                         // Standard approach: use a string builder or apply edits to a mutable structure.
                         // Since we are going reverse, indices > current point are invalid, but indices < current point are valid.
                         // Correct.
                         
                         // We need to apply the edit to 'result'.
                         // 'result' currently has the *original* content before this point (because we are moving backwards).
                         // Actually no, 'result' is being modified.
                         // If we modify tail, head indices are fine.
                         
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

