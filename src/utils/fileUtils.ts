import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { QueryButton, ButtonGroup } from '../interfaces';

export class FileUtils {
    private static _storagePath: string;

    public static get storagePath(): string {
        return this._storagePath;
    }

    public static initialize(context: vscode.ExtensionContext) {
        this._storagePath = path.join(context.globalStorageUri.fsPath, 'queries.json');
        this.ensureStorageExists();
    }

    private static ensureStorageExists() {
        const dir = path.dirname(this._storagePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(this._storagePath)) {
            fs.writeFileSync(this._storagePath, JSON.stringify({ buttons: [], groups: [] }, null, 2));
        }
    }

    public static async loadQueries(): Promise<{ buttons: QueryButton[], groups: ButtonGroup[] }> {
        try {
            const data = JSON.parse(fs.readFileSync(this._storagePath, 'utf8'));
            return {
                buttons: data.buttons || [],
                groups: data.groups || []
            };
        } catch (error) {
            return { buttons: [], groups: [] };
        }
    }

    public static async saveQueries(buttons: QueryButton[], groups: ButtonGroup[]): Promise<void> {
        const data = { buttons, groups };
        fs.writeFileSync(this._storagePath, JSON.stringify(data, null, 2));
    }

    public static validateQueries(buttons: QueryButton[]): boolean {
        if (!Array.isArray(buttons)) return false;

        return buttons.every(button => {
            return (
                typeof button === 'object' &&
                button !== null &&
                typeof button.id === 'string' &&
                typeof button.name === 'string' &&
                typeof button.query === 'string'
            );
        });
    }
} 