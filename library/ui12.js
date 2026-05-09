// VezeLang — библиотека ui12 v0.3
// Управляет стилями окна: цвет, размер, позиция, кнопки, input, card, alert, анимации

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
            buttonFontSize:    16,
            inputBackground:   '#ffffff',
            inputColor:        '#000000',
            inputBorderColor:  '#cccccc',
            inputFontSize:     16,
            cardBackground:    '#ffffff',
            cardColor:         '#000000',
            cardBorderRadius:  8,
            cardPadding:       16,
            alertBackground:      '#ff4444',
            alertColor:           '#ffffff',
            alertBorderRadius:    4,
            hoverButtonBackground:'#6a9fd8',
            hoverButtonScale:     1.05,
            activeButtonScale:    0.95,
            fadeInDuration:       0.3,
            fadeOutDuration:      0.3,
            zoomDuration:         0.3,
            zoomScale:            1.1,
            animationEasing:      'ease'
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
            .input-group {
                display:        flex;
                align-items:    center;
                margin:         ${s.margin}px;
            }
            .input-group input {
                background:     ${s.inputBackground};
                color:          ${s.inputColor};
                border:         1px solid ${s.inputBorderColor};
                font-size:      ${s.inputFontSize}px;
                padding:        8px 12px;
                border-radius:  ${s.borderRadius}px 0 0 ${s.borderRadius}px;
                font-family:    ${s.fontFamily};
                outline:        none;
                min-width:      200px;
            }
            .input-btn {
                border-radius: 0 ${s.borderRadius}px ${s.borderRadius}px 0 !important;
                margin: 0 !important;
            }
            .card {
                background:    ${s.cardBackground};
                color:         ${s.cardColor};
                border-radius: ${s.cardBorderRadius}px;
                padding:       ${s.cardPadding}px;
                margin:        ${s.margin}px;
                cursor:        pointer;
                transition:    opacity 0.15s;
                min-width:     220px;
                text-align:    left;
            }
            .card-title { font-weight: bold; font-size: ${s.fontSize}px; margin-bottom: 4px; }
            .card-text  { font-size: ${Math.round(s.fontSize * 0.8)}px; opacity: 0.75; }
            .alert {
                background:    ${s.alertBackground};
                color:         ${s.alertColor};
                border-radius: ${s.alertBorderRadius}px;
                padding:       10px 20px;
                margin:        ${s.margin}px;
                cursor:        pointer;
                transition:    opacity 0.15s;
                min-width:     200px;
                text-align:    center;
            }
            .alert:hover { opacity: 0.85; }
        ` + this.getAnimationCSS();
    }

    getAnimationCSS() {
        const s = this.styles;
        return `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to   { opacity: 0; transform: translateY(-10px); }
            }
            @keyframes zoomIn {
                from { transform: scale(0.8); opacity: 0; }
                to   { transform: scale(1);   opacity: 1; }
            }
            .fade-in  { animation: fadeIn  ${s.fadeInDuration}s  ${s.animationEasing}; }
            .fade-out { animation: fadeOut ${s.fadeOutDuration}s ${s.animationEasing}; }
            .zoom-in  { animation: zoomIn  ${s.zoomDuration}s    ${s.animationEasing}; }
            button {
                transition: transform ${s.zoomDuration}s ${s.animationEasing},
                            background ${s.fadeInDuration}s ${s.animationEasing},
                            opacity 0.15s;
            }
            button:hover {
                background: ${s.hoverButtonBackground} !important;
                transform:  scale(${s.hoverButtonScale});
                opacity:    1;
            }
            button:active {
                transform: scale(${s.activeButtonScale});
                opacity:   1;
            }
            .card {
                transition: transform ${s.zoomDuration}s ${s.animationEasing};
            }
            .card:hover {
                transform: scale(${s.hoverButtonScale});
                opacity:   1;
            }
            .item {
                animation: fadeIn ${s.fadeInDuration}s ${s.animationEasing};
            }
        `;
    }
}

module.exports = new UI12();
