import * as vscode from 'vscode';
import { WebviewMessage } from '../interfaces';
import { getHtmlForWebview } from './ButtonPanelHtml';
import { ButtonManager } from './ButtonManager';
import { FileUtils } from '../utils/fileUtils';

export class ButtonPanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'decurser.buttonPanel';
    private _view?: vscode.WebviewView;
    private _isRearrangeMode: boolean = false;
    private _buttonManager: ButtonManager;
    private _disposables: vscode.Disposable[] = [];

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {
        this._buttonManager = new ButtonManager();
        this.setupFileWatcher();
    }

    public get buttonManager(): ButtonManager {
        return this._buttonManager;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = getHtmlForWebview();

        webviewView.webview.onDidReceiveMessage(async (data: WebviewMessage) => {
            switch (data.type) {
                case 'buttonClick':
                    if (typeof data.buttonIndex === 'number') {
                        await this.handleButtonClick(data.buttonIndex);
                    }
                    break;
                case 'toggleRearrangeMode':
                    this._isRearrangeMode = !this._isRearrangeMode;
                    this.updateButtons();
                    break;
                case 'moveButton':
                    if (typeof data.buttonIndex === 'number' && typeof data.newIndex === 'number') {
                        await this._buttonManager.moveButton(data.buttonIndex, data.newIndex);
                        this.updateButtons();
                    }
                    break;
                case 'addGroup':
                    await this._buttonManager.addGroup();
                    this.updateButtons();
                    break;
                case 'removeGroup':
                    if (typeof data.groupId === 'string') {
                        await this._buttonManager.removeGroup(data.groupId);
                        this.updateButtons();
                    }
                    break;
                case 'addButtonToGroup':
                    if (typeof data.groupId === 'string' && typeof data.buttonId === 'string') {
                        await this._buttonManager.addButtonToGroup(data.groupId, data.buttonId);
                        this.updateButtons();
                    }
                    break;
                case 'removeButtonFromGroup':
                    if (typeof data.groupId === 'string' && typeof data.buttonId === 'string') {
                        await this._buttonManager.removeButtonFromGroup(data.groupId, data.buttonId);
                        this.updateButtons();
                    }
                    break;
                case 'openQueriesFile':
                    this.openQueriesFile();
                    break;
            }
        });
    }

    private setupFileWatcher() {
        const fileWatcher = vscode.workspace.createFileSystemWatcher(FileUtils.storagePath);
        
        fileWatcher.onDidChange(async () => {
            try {
                const { buttons, groups } = await FileUtils.loadQueries();
                if (FileUtils.validateQueries(buttons)) {
                    this._buttonManager = new ButtonManager();
                    this.updateButtons();
                } else {
                    vscode.window.showErrorMessage('Invalid queries.json format. Reverting to previous state.');
                    await FileUtils.saveQueries(this._buttonManager.buttons, this._buttonManager.groups);
                }
            } catch (error) {
                vscode.window.showErrorMessage('Error loading queries.json. Reverting to previous state.');
                await FileUtils.saveQueries(this._buttonManager.buttons, this._buttonManager.groups);
            }
        });

        this._disposables.push(fileWatcher);
    }

    public async openQueriesFile() {
        const document = await vscode.workspace.openTextDocument(FileUtils.storagePath);
        await vscode.window.showTextDocument(document);
    }

    private async handleButtonClick(buttonIndex: number) {
        if (this._isRearrangeMode) return;
        
        const button = this._buttonManager.buttons[buttonIndex];
        if (!button) return;

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text) {
            vscode.window.showErrorMessage('No text selected');
            return;
        }

        const query = button.query.replace('${selectedText}', text);
        await vscode.commands.executeCommand('cursor.sendMessage', query);
    }

    public updateButtons() {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateButtons',
                buttons: this._buttonManager.buttons,
                groups: this._buttonManager.groups,
                isRearrangeMode: this._isRearrangeMode
            });
        }
    }

    public dispose() {
        this._disposables.forEach(d => d.dispose());
    }
} 