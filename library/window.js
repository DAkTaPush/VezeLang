// VezeLang — библиотека window

class WindowLibrary {
    constructor() {
        this.content    = [];
        this.buttons    = [];
        this.inputs     = [];
        this.cards      = [];
        this.alerts     = [];
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

    registerInput(prompt) {
        if (!this.inputs.includes(prompt)) this.inputs.push(prompt);
    }

    registerCard(title, text) {
        if (!this.cards.find(c => c.title === title)) this.cards.push({ title, text: text || '' });
    }

    registerAlert(text) {
        if (!this.alerts.includes(text)) this.alerts.push(text);
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
        ipcMain.on('veze-input', (event, data) => {
            if (self.callback) self.callback('input', data.prompt);
        });
        ipcMain.on('veze-card', (event, id) => {
            if (self.callback) self.callback('card', id);
        });
        ipcMain.on('veze-alert', (event, id) => {
            if (self.callback) self.callback('alert', id);
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
                .item { font-size: 24px; margin: 8px; }
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
                .input-group {
                    display: flex;
                    align-items: center;
                    margin: 8px;
                }
                .input-group input {
                    font-size: 16px;
                    padding: 8px 12px;
                    border: 1px solid #cccccc;
                    border-radius: 8px 0 0 8px;
                    outline: none;
                    min-width: 200px;
                }
                .input-btn {
                    border-radius: 0 8px 8px 0 !important;
                    margin: 0 !important;
                    padding: 9px 18px !important;
                    font-size: 16px !important;
                }
                .card {
                    background: #f5f5f5;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 8px;
                    cursor: pointer;
                    transition: opacity 0.15s;
                    min-width: 220px;
                    text-align: left;
                }
                .card:hover { opacity: 0.85; }
                .card-title { font-weight: bold; font-size: 20px; margin-bottom: 4px; }
                .card-text  { font-size: 15px; opacity: 0.75; }
                .alert {
                    background: #ff4444;
                    color: #ffffff;
                    border-radius: 4px;
                    padding: 10px 20px;
                    margin: 8px;
                    cursor: pointer;
                    transition: opacity 0.15s;
                    min-width: 200px;
                    text-align: center;
                }
                .alert:hover { opacity: 0.85; }
            `;

            const css = self.customCSS || defaultCSS;

            const escapeHtml = s => String(s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');

            const contentHtml = self.content
                .map(item => `<div class="item fade-in">${escapeHtml(item)}</div>`)
                .join('\n        ');

            const buttonsHtml = self.buttons
                .map(id => `<button class="btn" data-id="${escapeHtml(id)}">${escapeHtml(id)}</button>`)
                .join('\n        ');

            const inputsHtml = self.inputs
                .map(prompt => `
        <div class="input-group">
            <input type="text" data-prompt="${escapeHtml(prompt)}" placeholder="${escapeHtml(prompt)}">
            <button class="btn input-btn" data-prompt="${escapeHtml(prompt)}">OK</button>
        </div>`).join('');

            const cardsHtml = self.cards
                .map(c => `
        <div class="card" data-id="${escapeHtml(c.title)}">
            <div class="card-title">${escapeHtml(c.title)}</div>
            <div class="card-text">${escapeHtml(c.text)}</div>
        </div>`).join('');

            const alertsHtml = self.alerts
                .map(text => `
        <div class="alert" data-id="${escapeHtml(text)}">${escapeHtml(text)}</div>`).join('');

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
    ${alertsHtml}
    <div id="content">
        ${contentHtml}
    </div>
    ${cardsHtml}
    ${inputsHtml}
    ${buttonsHtml}
    <script>
        const { ipcRenderer } = require('electron');

        document.querySelectorAll('.btn[data-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                ipcRenderer.send('veze-click', btn.dataset.id);
            });
        });

        document.querySelectorAll('.input-btn[data-prompt]').forEach(btn => {
            btn.addEventListener('click', () => {
                const group = btn.closest('.input-group');
                const inp = group ? group.querySelector('input') : null;
                ipcRenderer.send('veze-input', { prompt: btn.dataset.prompt, value: inp ? inp.value : '' });
            });
        });

        document.querySelectorAll('.input-group input').forEach(inp => {
            inp.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    const btn = inp.closest('.input-group').querySelector('.input-btn');
                    if (btn) btn.click();
                }
            });
        });

        document.querySelectorAll('.card[data-id]').forEach(card => {
            card.addEventListener('click', () => {
                ipcRenderer.send('veze-card', card.dataset.id);
            });
        });

        document.querySelectorAll('.alert[data-id]').forEach(al => {
            al.addEventListener('click', () => {
                ipcRenderer.send('veze-alert', al.dataset.id);
            });
        });

        ipcRenderer.on('veze-show', (event, value) => {
            const div = document.createElement('div');
            div.className = 'item fade-in';
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
