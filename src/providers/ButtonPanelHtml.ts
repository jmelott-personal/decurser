export function getHtmlForWebview() {
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    padding: 0;
                    margin: 0;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                }
                .controls {
                    padding: 10px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    position: sticky;
                    top: 0;
                    background: var(--vscode-editor-background);
                    z-index: 1;
                }
                .button-container {
                    padding: 10px;
                    overflow-y: auto;
                    max-height: calc(100vh - 100px);
                }
                .button {
                    display: block;
                    width: 100%;
                    padding: 8px;
                    margin: 4px 0;
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 2px;
                    cursor: pointer;
                    text-align: left;
                }
                .button:hover {
                    background: var(--vscode-button-hoverBackground);
                }
                .button.rearrange {
                    cursor: move;
                    opacity: 0.8;
                }
                .button.rearrange:hover {
                    opacity: 1;
                }
                .group-tabs {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 10px;
                    overflow-x: auto;
                    padding: 4px;
                }
                .group-tab {
                    padding: 4px 8px;
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: none;
                    border-radius: 2px;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .group-tab.active {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                .group-controls {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 8px;
                }
            </style>
        </head>
        <body>
            <div class="controls">
                <button class="button" id="rearrangeButton">Toggle Rearrange Mode</button>
                <button class="button" id="editQueriesButton">Edit Queries File</button>
            </div>
            <div class="button-container">
                <div class="group-tabs" id="groupTabs"></div>
                <div class="group-controls">
                    <button class="button" id="addGroupButton">Add Group</button>
                    <button class="button" id="removeGroupButton">Remove Group</button>
                </div>
                <div id="buttons"></div>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                let buttons = [];
                let groups = [];
                let isRearrangeMode = false;
                let activeGroupId = null;

                function updateButtons() {
                    const buttonsContainer = document.getElementById('buttons');
                    const groupTabs = document.getElementById('groupTabs');
                    
                    // Update group tabs
                    groupTabs.innerHTML = groups.map(group => \`
                        <button class="group-tab \${group.id === activeGroupId ? 'active' : ''}"
                                onclick="setActiveGroup('\${group.id}')">
                            \${group.name}
                        </button>
                    \`).join('');

                    // Filter buttons for active group
                    const groupButtons = activeGroupId 
                        ? buttons.filter(btn => groups.find(g => g.id === activeGroupId)?.buttonIds.includes(btn.id))
                        : buttons;

                    // Update buttons
                    buttonsContainer.innerHTML = groupButtons.map((button, index) => \`
                        <button class="button \${isRearrangeMode ? 'rearrange' : ''}"
                                draggable="\${isRearrangeMode}"
                                ondragstart="dragStart(event, \${index})"
                                ondragover="dragOver(event)"
                                ondrop="drop(event, \${index})"
                                onclick="\${isRearrangeMode ? '' : 'buttonClick(' + index + ')'}">
                            \${button.name}
                        </button>
                    \`).join('');
                }

                function setActiveGroup(groupId) {
                    activeGroupId = groupId;
                    updateButtons();
                }

                function buttonClick(index) {
                    vscode.postMessage({
                        type: 'buttonClick',
                        buttonIndex: index
                    });
                }

                function dragStart(event, index) {
                    event.dataTransfer.setData('text/plain', index);
                }

                function dragOver(event) {
                    event.preventDefault();
                }

                function drop(event, newIndex) {
                    event.preventDefault();
                    const oldIndex = parseInt(event.dataTransfer.getData('text/plain'));
                    vscode.postMessage({
                        type: 'moveButton',
                        buttonIndex: oldIndex,
                        newIndex: newIndex
                    });
                }

                document.getElementById('rearrangeButton').onclick = () => {
                    vscode.postMessage({ type: 'toggleRearrangeMode' });
                };

                document.getElementById('editQueriesButton').onclick = () => {
                    vscode.postMessage({ type: 'openQueriesFile' });
                };

                document.getElementById('addGroupButton').onclick = () => {
                    vscode.postMessage({ type: 'addGroup' });
                };

                document.getElementById('removeGroupButton').onclick = () => {
                    if (activeGroupId) {
                        vscode.postMessage({ type: 'removeGroup', groupId: activeGroupId });
                    }
                };

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'updateButtons':
                            buttons = message.buttons;
                            groups = message.groups;
                            isRearrangeMode = message.isRearrangeMode;
                            if (!activeGroupId && groups.length > 0) {
                                activeGroupId = groups[0].id;
                            }
                            updateButtons();
                            break;
                    }
                });
            </script>
        </body>
        </html>`;
} 