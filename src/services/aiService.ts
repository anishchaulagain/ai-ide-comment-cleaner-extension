import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
import * as path from 'path';
import OpenAI from 'openai';
import { Groq } from 'groq-sdk';
import { CommentType } from '../commentDetector';

export class AIService {
    private static openAIClient: OpenAI | null = null;
    private static groqClient: Groq | null = null;
    private static isInitialized = false;

    public static async initialize() {
        if (this.isInitialized) return;

        // Try to load .env from workspace root
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            const envPath = path.join(workspaceFolders[0].uri.fsPath, '.env');
            dotenv.config({ path: envPath });
        }

        // Initialize OpenAI
        const openAIKey = process.env.OPENAI_API_KEY;
        if (openAIKey) {
            this.openAIClient = new OpenAI({ apiKey: openAIKey });
        }

        // Initialize Groq
        const groqKey = process.env.GROQ_API_KEY;
        if (groqKey) {
            this.groqClient = new Groq({ apiKey: groqKey });
        }

        this.isInitialized = true;
    }

    public static async analyzeComment(comment: string): Promise<CommentType> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // Try OpenAI first
        if (this.openAIClient) {
            try {
                return await this.classifyWithLLM(this.openAIClient, comment, 'openai');
            } catch (error) {
                console.warn('OpenAI call failed, falling back to Groq', error);
            }
        }

        // Fallback to Groq
        if (this.groqClient) {
            try {
                return await this.classifyWithLLM(this.groqClient, comment, 'groq');
            } catch (error) {
                console.error('Groq call failed', error);
            }
        }

        // Default if both fail or not configured
        return CommentType.Standard;
    }

    private static async classifyWithLLM(client: any, comment: string, provider: 'openai' | 'groq'): Promise<CommentType> {
        const systemPrompt = `You are an expert code analyst tool. Your task is to classify code comments into specific categories.
        
Categories:
1. Standard: Standard comments, old code, commented out debug code, or trivial comments that should be removed.
2. Documentation: JSDoc, docstrings, function descriptions, API documentation.
3. License: Copyright notices, license headers, legal disclaimers.
4. Annotation: TODOs, FIXMEs, BUGs, NOTE, HACK, and other developer annotations.
5. Pragma: Compiler directives, linter suppression (eslint-disable), types (ts-ignore).

Instructions:
- Analyze the user provided comment carefully.
- Return ONLY the category name from the list above.
- Do not provide any explanation or extra text.
- If unsure, default to "Standard".`;

        const userPrompt = `Comment to classify:\n"${comment}"`;

        let content = '';

        if (provider === 'openai') {
            const response = await (client as OpenAI).chat.completions.create({
                model: 'gpt-4o', // Or gpt-3.5-turbo if preferred for speed/cost
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0,
                max_tokens: 10
            });
            content = response.choices[0]?.message?.content?.trim() || '';
        } else {
            const response = await (client as Groq).chat.completions.create({
                model: 'llama3-70b-8192', // Example Groq model
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0,
                max_tokens: 10
            });
            content = response.choices[0]?.message?.content?.trim() || '';
        }

        return this.mapResponseToType(content);
    }

    private static mapResponseToType(response: string): CommentType {
        const lower = response.toLowerCase();
        if (lower.includes('documentation')) return CommentType.Documentation;
        if (lower.includes('license')) return CommentType.License;
        if (lower.includes('annotation')) return CommentType.Annotation;
        if (lower.includes('pragma')) return CommentType.Pragma;
        return CommentType.Standard;
    }
}
