import * as vscode from 'vscode';

// Activate function is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('Chatbot extension is now active!');

    // Register a command to open the chatbot webview
    const disposable = vscode.commands.registerCommand('extension.openChatBot', () => {
        const panel = vscode.window.createWebviewPanel(
            'chatbot', // Identifies the type of the webview panel
            'ChatBot', // Title of the panel
            vscode.ViewColumn.One, // Editor column to show the new webview panel in
            {
                enableScripts: true // Enable JS in the webview
            }
        );

        // Set HTML content for the chatbot panel
        panel.webview.html = getWebviewContent();

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'message':
                    const userMessage = message.text;
                    const botResponse = getBotResponse(userMessage);
                    panel.webview.postMessage({ text: botResponse });
                    break;
            }
        }, undefined, context.subscriptions);
    });

    context.subscriptions.push(disposable);
}

// Deactivate function is called when the extension is deactivated
export function deactivate() {}

// Generate the chatbot webview HTML content
function getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ChatBot</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 10px; }
            #messages { border: 1px solid #ccc; height: 300px; overflow-y: scroll; padding: 10px; margin-bottom: 10px; }
            #input { width: calc(100% - 22px); padding: 10px; margin-bottom: 10px; }
            button { padding: 5px 10px; }
        </style>
    </head>
    <body>
        <h2>ChatBot</h2>
        <div id="messages"></div>
        <input id="input" type="text" placeholder="Type a message..." />
        <button onclick="sendMessage()">Send</button>

        <script>
            const vscode = acquireVsCodeApi();

            // Send a message to the VS Code extension
            function sendMessage() {
                const input = document.getElementById('input').value;
                if (!input) return;
                document.getElementById('messages').innerHTML += '<p><strong>You:</strong> ' + input + '</p>';
                vscode.postMessage({ command: 'message', text: input });
                document.getElementById('input').value = '';
            }

            // Receive messages from the VS Code extension
            window.addEventListener('message', event => {
                const message = event.data;
                document.getElementById('messages').innerHTML += '<p><strong>Bot:</strong> ' + message.text + '</p>';
            });
        </script>
    </body>
    </html>`;
}

// Simple chatbot logic to generate a response
function getBotResponse(userMessage: string): string {
    const lowercaseMessage = userMessage.toLowerCase();
    if (lowercaseMessage.includes('hello')) {
        return 'Hello! How can I assist you today?';
    }
    if (lowercaseMessage.includes('help')) {
        return 'I am here to help! Ask me anything.';
    }
    return "I'm not sure how to respond to that. Try saying 'hello' or 'help'.";
}
