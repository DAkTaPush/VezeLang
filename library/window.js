// VezeLang — библиотека window

class WindowLibrary {
    constructor() {
        this.content    = [];
        this.buttons    = [];
        this.callback   = null;
        this.win        = null;
        this.isOpen     = false;
        this.customCSS  = null;
    }

    show(value) {
        if (this.isOpen && this.win) {
            this.win.webContents.send('veze-show', String(value));
        } else {
            this.content.push(String(value));
        }
    }

    registerButton(id) {
        if (!this.buttons.includes(id)) this.buttons.push(id);
    }

    setCallback(fn) {
        this.callback = fn;
    }

    setStyles(css) {
        this.customCSS = css;
    }

    open() {
        const { app, BrowserWindow, ipcMain, Menu } = require('electron');
        const self = this;

        ipcMain.on('veze-click', (event, id) => {
            if (self.callback) self.callback('click', id);
        });

        app.whenReady().then(() => {
            const win = new BrowserWindow({
                width: 800,
                height: 600,
                title: 'VezeLang',
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false
                }
            });

            self.win    = win;
            self.isOpen = true;

            Menu.setApplicationMenu(null);

            const defaultCSS = `
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    padding: 20px;
                    box-sizing: border-box;
                }
                .item {
                    font-size: 24px;
                    margin: 8px;
                }
                button {
                    font-size: 18px;
                    padding: 10px 28px;
                    margin: 12px;
                    cursor: pointer;
                    background: #89b4fa;
                    color: #1e1e2e;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    transition: opacity 0.15s;
                }
                button:hover  { opacity: 0.85; }
                button:active { opacity: 0.7;  }
            `;

            const css = self.customCSS || defaultCSS;

            const contentHtml = self.content
                .map(item => `<div class="item">${item}</div>`)
                .join('\n        ');

            const buttonsHtml = self.buttons
                .map(id => `<button class="btn" data-id="${id}">${id}</button>`)
                .join('\n        ');

            const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${css}
        .title {
            color: inherit;
            font-size: 11px;
            position: fixed;
            top: 8px;
            left: 12px;
            opacity: 0.4;
        }
    </style>
</head>
<body>
    <div class="title">VezeLang v0.1.0</div>
    <div id="content">
        ${contentHtml}
    </div>
    ${buttonsHtml}
    <script>
        const { ipcRenderer } = require('electron');

        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => {
                ipcRenderer.send('veze-click', btn.dataset.id);
            });
        });

        ipcRenderer.on('veze-show', (event, value) => {
            const div = document.createElement('div');
            div.className = 'item';
            div.textContent = value;
            document.getElementById('content').appendChild(div);
        });
    </script>
</body>
</html>`;

            win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
        });
    }
}

module.exports = new WindowLibrary();
