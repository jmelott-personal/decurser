import { QueryButton, ButtonGroup } from '../interfaces';
import { FileUtils } from '../utils/fileUtils';

export class ButtonManager {
    private _buttons: QueryButton[] = [];
    private _groups: ButtonGroup[] = [];

    constructor() {
        this.loadQueries();
    }

    private async loadQueries() {
        const { buttons, groups } = await FileUtils.loadQueries();
        this._buttons = buttons;
        this._groups = groups;
    }

    public get buttons(): QueryButton[] {
        return this._buttons;
    }

    public get groups(): ButtonGroup[] {
        return this._groups;
    }

    public async addButton(name: string, query: string): Promise<void> {
        this._buttons.push({
            id: Date.now().toString(),
            name,
            query
        });
        await this.saveQueries();
    }

    public async removeButton(index: number): Promise<void> {
        this._buttons.splice(index, 1);
        await this.saveQueries();
    }

    public async editButton(index: number, name: string, query: string): Promise<void> {
        this._buttons[index] = {
            ...this._buttons[index],
            name,
            query
        };
        await this.saveQueries();
    }

    public async moveButton(fromIndex: number, toIndex: number): Promise<void> {
        if (fromIndex === toIndex) return;
        
        const button = this._buttons[fromIndex];
        this._buttons.splice(fromIndex, 1);
        this._buttons.splice(toIndex, 0, button);
        await this.saveQueries();
    }

    public async addGroup(): Promise<void> {
        const group: ButtonGroup = {
            id: Date.now().toString(),
            name: `Group ${this._groups.length + 1}`,
            buttonIds: []
        };
        this._groups.push(group);
        await this.saveQueries();
    }

    public async removeGroup(groupId: string): Promise<void> {
        this._groups = this._groups.filter(g => g.id !== groupId);
        await this.saveQueries();
    }

    public async addButtonToGroup(groupId: string, buttonId: string): Promise<void> {
        const group = this._groups.find(g => g.id === groupId);
        if (group && !group.buttonIds.includes(buttonId)) {
            group.buttonIds.push(buttonId);
            await this.saveQueries();
        }
    }

    public async removeButtonFromGroup(groupId: string, buttonId: string): Promise<void> {
        const group = this._groups.find(g => g.id === groupId);
        if (group) {
            group.buttonIds = group.buttonIds.filter(id => id !== buttonId);
            await this.saveQueries();
        }
    }

    private async saveQueries(): Promise<void> {
        await FileUtils.saveQueries(this._buttons, this._groups);
    }
} 