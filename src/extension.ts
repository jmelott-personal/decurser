import * as vscode from 'vscode';
import { ButtonPanelProvider } from './providers/ButtonPanelProvider';
import { FileUtils } from './utils/fileUtils';
import { QueryButton } from './interfaces';

interface ButtonQuickPickItem extends vscode.QuickPickItem {
    index: number;
}

export function activate(context: vscode.ExtensionContext) {
    FileUtils.initialize(context);

    const buttonPanelProvider = new ButtonPanelProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ButtonPanelProvider.viewType, buttonPanelProvider)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('decurser.addQuery', async () => {
            const name = await vscode.window.showInputBox({
                prompt: 'Enter button name',
                placeHolder: 'Button name'
            });
            if (!name) return;

            const query = await vscode.window.showInputBox({
                prompt: 'Enter query (use ${selectedText} for selected text)',
                placeHolder: 'Query'
            });
            if (!query) return;

            await buttonPanelProvider.buttonManager.addButton(name, query);
            buttonPanelProvider.updateButtons();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('decurser.editQuery', async () => {
            const buttons = buttonPanelProvider.buttonManager.buttons;
            if (!buttons.length) {
                vscode.window.showInformationMessage('No buttons to edit');
                return;
            }

            const items: ButtonQuickPickItem[] = buttons.map((btn: QueryButton, index: number) => ({
                label: btn.name,
                description: btn.query,
                index
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select button to edit'
            });
            if (!selected) return;

            const name = await vscode.window.showInputBox({
                prompt: 'Enter new button name',
                placeHolder: 'Button name',
                value: buttons[selected.index].name
            });
            if (!name) return;

            const query = await vscode.window.showInputBox({
                prompt: 'Enter new query (use ${selectedText} for selected text)',
                placeHolder: 'Query',
                value: buttons[selected.index].query
            });
            if (!query) return;

            await buttonPanelProvider.buttonManager.editButton(selected.index, name, query);
            buttonPanelProvider.updateButtons();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('decurser.removeQuery', async () => {
            const buttons = buttonPanelProvider.buttonManager.buttons;
            if (!buttons.length) {
                vscode.window.showInformationMessage('No buttons to remove');
                return;
            }

            const items: ButtonQuickPickItem[] = buttons.map((btn: QueryButton, index: number) => ({
                label: btn.name,
                description: btn.query,
                index
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select button to remove'
            });
            if (!selected) return;

            await buttonPanelProvider.buttonManager.removeButton(selected.index);
            buttonPanelProvider.updateButtons();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('decurser.openQueriesFile', () => {
            buttonPanelProvider.openQueriesFile();
        })
    );
}

export function deactivate() {} 