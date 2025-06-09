export interface QueryButton {
    id: string;
    name: string;
    query: string;
}

export interface ButtonGroup {
    id: string;
    name: string;
    buttonIds: string[];
}

export interface WebviewMessage {
    type: 'buttonClick' | 'toggleRearrangeMode' | 'moveButton' | 'addGroup' | 'removeGroup' | 'addButtonToGroup' | 'removeButtonFromGroup' | 'openQueriesFile';
    buttonIndex?: number;
    newIndex?: number;
    groups?: ButtonGroup[];
    groupId?: string;
    buttonId?: string;
} 