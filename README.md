# Decurser

A Visual Studio Code extension that provides a customizable sidebar for managing and executing Cursor AI queries. This extension allows you to create, organize, and quickly access your frequently used Cursor AI queries.

## Features

- **Customizable Query Buttons**: Create buttons for your frequently used Cursor AI queries
- **Button Groups**: Organize your queries into groups with tabs
- **Rearrange Mode**: Easily reorder your buttons and groups
- **JSON Configuration**: Edit your queries directly in a JSON file
- **Selection Integration**: Use selected text in your queries with `${selectedText}` placeholder

## Usage

### Creating a Query Button

1. Click the "Add Query" button in the sidebar
2. Enter a name for your button
3. Enter your query (use `${selectedText}` to include selected text)

### Managing Buttons

- **Edit**: Click the "Edit Query" button to modify existing buttons
- **Remove**: Click the "Remove Query" button to delete buttons
- **Rearrange**: Toggle rearrange mode to drag and drop buttons into your preferred order

### Managing Groups

- **Create Group**: Click the "Add Group" button to create a new group
- **Remove Group**: Click the "Remove Group" button to delete a group
- **Add to Group**: Drag buttons into groups to organize them
- **Remove from Group**: Drag buttons out of groups to remove them

### Editing Queries File

Click the "Edit Queries" button to open the `queries.json` file directly in VS Code. The file structure is:

```json
{
  "buttons": [
    {
      "id": "unique-id",
      "name": "Button Name",
      "query": "Your query with ${selectedText} placeholder"
    }
  ],
  "groups": [
    {
      "id": "unique-id",
      "name": "Group Name",
      "buttonIds": ["button-id-1", "button-id-2"]
    }
  ]
}
```

## Requirements

- Visual Studio Code
- Cursor AI extension

## Extension Settings

This extension contributes the following settings:

* `decurser.addQuery`: Add a new query button
* `decurser.editQuery`: Edit an existing query button
* `decurser.removeQuery`: Remove a query button
* `decurser.openQueriesFile`: Open the queries configuration file

## Known Issues

- None at the moment

## Release Notes

### 0.0.1

Initial release of Decurser:
- Basic button management
- Group organization
- JSON configuration
- Selection integration

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile the extension
4. Press F5 in VS Code to start debugging

## Development

1. Make sure you have Node.js installed
2. Install dependencies: `npm install`
3. Compile the extension: `npm run compile`
4. Press F5 in VS Code to start debugging

## License

MIT
