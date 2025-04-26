// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

export async function activate(context: vscode.ExtensionContext) {
    const suggest_dict: { [key: string]: string } = { "un": "22" };
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage("ワークスペースが開かれていません");
        return;
    }

    const filePath = vscode.Uri.joinPath(workspaceFolder.uri, 'atcoder_template.txt');
    try {
        const contentBytes = await vscode.workspace.fs.readFile(filePath);
        const content = Buffer.from(contentBytes).toString('utf8');
        vscode.window.showInformationMessage("テンプレートファイルを読み込みました");
        const lines = content.split('\n');
        let temp_content: string = "";
        let before_title: string = "";
        for (const line of lines) {
            const temp_title = line.slice(0, 2);
            if (temp_title === '/@') {
                if (temp_content) {
                    suggest_dict[before_title] = temp_content;
                    temp_content = "";
                }
                const temp_name = line.slice(2).replace(/\r$/, "");
                if (temp_name) {
                    suggest_dict[temp_name] = "";
                    before_title = temp_name;
                }
            } else {
                temp_content += line + "\n";
            }
        }
        if (temp_content) {
            suggest_dict[before_title] = temp_content;
        }

        // 入力補完機能を登録
        const provider = vscode.languages.registerCompletionItemProvider(
            { scheme: 'file', language: 'python' }, // 対象の言語を指定
            {
                provideCompletionItems(document, position) {
                    const completionItems: vscode.CompletionItem[] = [];
                    for (const key in suggest_dict) {
                        const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Text);
                        item.detail = "AtCoder Suggestion";
                        item.documentation = suggest_dict[key];
                        item.insertText = suggest_dict[key];
                        completionItems.push(item);
                    }
                    return completionItems;
                }
            },
        );

        context.subscriptions.push(provider);

    } catch (err) {
        vscode.window.showErrorMessage("テンプレートファイルの読み込みに失敗しました");
    }
}

export function deactivate() {}
