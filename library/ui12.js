// VezeLang — библиотека ui12 v0.1
// Управляет стилями окна: цвет, размер, позиция, кнопки

class UI12 {
    constructor() {
        this.styles = {
            color:             '#000000',
            background:        '#ffffff',
            fontSize:          20,
            fontFamily:        'Arial',
            position:          'center',
            padding:           10,
            margin:            8,
            borderRadius:      0,
            buttonColor:       '#000000',
            buttonBackground:  '#e0e0e0',
            buttonFontSize:    16
        };
    }

    set(property, value) {
        this.styles[property] = value;
    }

    getCSS() {
        const s = this.styles;
        const align = s.position === 'center' ? 'center'
                    : s.position === 'left'   ? 'flex-start'
                    :                           'flex-end';
        return `
            body {
                background:      ${s.background};
                font-family:     ${s.fontFamily};
                font-size:       ${s.fontSize}px;
                color:           ${s.color};
                display:         flex;
                flex-direction:  column;
                align-items:     ${align};
                justify-content: center;
                min-height:      100vh;
                margin:          0;
                padding:         ${s.padding}px;
                box-sizing:      border-box;
            }
            .item {
                margin:    ${s.margin}px;
                color:     ${s.color};
                font-size: ${s.fontSize}px;
            }
            button {
                color:         ${s.buttonColor};
                background:    ${s.buttonBackground};
                font-size:     ${s.buttonFontSize}px;
                border:        none;
                padding:       10px 24px;
                border-radius: ${s.borderRadius}px;
                cursor:        pointer;
                margin:        ${s.margin}px;
                font-family:   ${s.fontFamily};
                transition:    opacity 0.15s;
            }
            button:hover  { opacity: 0.85; }
            button:active { opacity: 0.7;  }
        `;
    }
}

module.exports = new UI12();
