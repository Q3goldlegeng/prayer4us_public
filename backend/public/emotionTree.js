/**
 * EmotionTree - 心情互動樹元件
 * @param {Array<string>} emotions - 預設情緒陣列（多語）
 * @param {Function} onSelect - 選擇情緒時的回呼 (emotionText)
 * @param {string} containerId - 要插入的 DOM id
 */
function EmotionTree({ emotions, onSelect, containerId = 'mainEmotions' }) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.style.position = 'relative';

    // 響應式尺寸計算
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    let width, height, centerX, trunkY;
    let branchCoords;
    
    if (isSmallMobile) {
        // 超小手機
        width = 300;
        height = 280;
        centerX = width / 2;
        trunkY = height - 30;
        branchCoords = [
            { x: centerX, y: trunkY - 110 }, // 上
            { x: centerX - 80, y: trunkY - 55 }, // 左上
            { x: centerX + 80, y: trunkY - 55 }, // 右上
            { x: centerX - 50, y: trunkY + 8 }, // 左下
            { x: centerX + 50, y: trunkY + 8 }, // 右下
            { x: centerX, y: trunkY + 45 } // 自訂
        ];
    } else if (isMobile) {
        // 一般手機
        width = 350;
        height = 300;
        centerX = width / 2;
        trunkY = height - 35;
        branchCoords = [
            { x: centerX, y: trunkY - 120 }, // 上
            { x: centerX - 95, y: trunkY - 60 }, // 左上
            { x: centerX + 95, y: trunkY - 60 }, // 右上
            { x: centerX - 60, y: trunkY + 8 }, // 左下
            { x: centerX + 60, y: trunkY + 8 }, // 右下
            { x: centerX, y: trunkY + 50 } // 自訂
        ];
    } else {
        // 桌面/平板
        width = 400;
        height = 340;
        centerX = width / 2;
        trunkY = height - 40;
        branchCoords = [
            { x: centerX, y: trunkY - 140 }, // 上
            { x: centerX - 110, y: trunkY - 70 }, // 左上
            { x: centerX + 110, y: trunkY - 70 }, // 右上
            { x: centerX - 70, y: trunkY + 10 }, // 左下
            { x: centerX + 70, y: trunkY + 10 }, // 右下
            { x: centerX, y: trunkY + 60 } // 自訂
        ];
    }

    // SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // 響應式SVG樣式
    const svgStyle = isSmallMobile ? 
        'max-width:320px;display:block;margin:auto;' :
        isMobile ? 
        'max-width:380px;display:block;margin:auto;' :
        'max-width:420px;display:block;margin:auto;';
    
    svg.setAttribute('style', svgStyle);

    // 畫樹幹 - 響應式線條寬度
    const trunkWidth = isSmallMobile ? 14 : isMobile ? 16 : 18;
    const branchWidth = isSmallMobile ? 7 : isMobile ? 8 : 10;
    const smallBranchWidth = isSmallMobile ? 6 : isMobile ? 7 : 8;
    
    svg.innerHTML = `
      <path d="M${centerX},${trunkY} Q${centerX},${trunkY-60} ${centerX},${trunkY-160}" stroke="#8d5524" stroke-width="${trunkWidth}" fill="none"/>
      <path d="M${centerX},${trunkY-80} Q${centerX-60},${trunkY-120} ${centerX-110},${trunkY-70}" stroke="#8d5524" stroke-width="${branchWidth}" fill="none"/>
      <path d="M${centerX},${trunkY-80} Q${centerX+60},${trunkY-120} ${centerX+110},${trunkY-70}" stroke="#8d5524" stroke-width="${branchWidth}" fill="none"/>
      <path d="M${centerX},${trunkY-30} Q${centerX-30},${trunkY+10} ${centerX-70},${trunkY+10}" stroke="#8d5524" stroke-width="${smallBranchWidth}" fill="none"/>
      <path d="M${centerX},${trunkY-30} Q${centerX+30},${trunkY+10} ${centerX+70},${trunkY+10}" stroke="#8d5524" stroke-width="${smallBranchWidth}" fill="none"/>
    `;

    // 狀態
    let selectedIdx = null;
    let customInput = null;
    let dove = null;

    // 響應式按鈕尺寸
    const buttonRadius = isSmallMobile ? 26 : isMobile ? 28 : 32;
    const fontSize = isSmallMobile ? 12 : isMobile ? 14 : 16;

    // 建立情緒按鈕
    emotions.forEach((emotion, idx) => {
        const isCustom = idx === 5;
        const { x, y } = branchCoords[idx];
        // 圓形按鈕
        const btn = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        btn.setAttribute('cx', x);
        btn.setAttribute('cy', y);
        btn.setAttribute('r', buttonRadius);
        btn.setAttribute('tabindex', 0);
        btn.setAttribute('class', 'emotion-tree-btn');
        btn.setAttribute('fill', '#fff');
        btn.setAttribute('stroke', '#2196F3');
        btn.setAttribute('stroke-width', '3');
        btn.setAttribute('style', 'cursor:pointer;transition:all .2s;');
        btn.setAttribute('aria-label', emotion);

        // hover/active 效果
        btn.addEventListener('mouseenter', () => {
            if (selectedIdx !== idx) btn.setAttribute('fill', '#e3f2fd');
        });
        btn.addEventListener('mouseleave', () => {
            if (selectedIdx !== idx) btn.setAttribute('fill', '#fff');
        });

        // 點擊事件
        btn.addEventListener('click', () => {
            if (isCustom) {
                showCustomInput(x, y, idx);
            } else {
                selectEmotion(idx, emotion);
            }
        });
        // 鍵盤操作
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') btn.click();
        });

        svg.appendChild(btn);

        // 文字
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y + 6);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', fontSize);
        text.setAttribute('fill', '#1565c0');
        text.setAttribute('pointer-events', 'none');
        text.setAttribute('font-family', 'inherit');
        text.textContent = emotion;
        svg.appendChild(text);
    });

    // 插入SVG
    container.appendChild(svg);

    // 展開自訂心情輸入框
    function showCustomInput(x, y, idx) {
        // 移除舊的
        if (customInput) customInput.remove();
        if (dove) dove.remove();
        selectedIdx = idx;
        updateBtnStyle();

        // 響應式輸入框樣式
        const inputWidth = isSmallMobile ? 100 : isMobile ? 110 : 120;
        const inputPadding = isSmallMobile ? '8px 10px' : isMobile ? '8px 12px' : '6px 12px';
        const inputFontSize = isSmallMobile ? 14 : isMobile ? 15 : 16;
        const buttonPadding = isSmallMobile ? '8px 12px' : isMobile ? '8px 14px' : '6px 16px';
        const buttonFontSize = isSmallMobile ? 13 : isMobile ? 14 : 16;

        // 建立輸入框
        customInput = document.createElement('div');
        customInput.style.position = 'absolute';
        customInput.style.left = `calc(50% + ${x - width / 2}px)`;
        customInput.style.top = `${y + 60}px`;
        customInput.style.transform = 'translate(-50%,0)';
        customInput.style.zIndex = 10;
        
        // 響應式輸入框HTML
        customInput.innerHTML = `
            <input id="customEmotionInput" type="text" maxlength="12" placeholder="請輸入心情…" 
                   style="padding:${inputPadding};border-radius:18px;border:1.5px solid #2196F3;font-size:${inputFontSize}px;width:${inputWidth}px;min-height:44px;box-sizing:border-box;">
            <button id="customEmotionSubmit" 
                    style="margin-left:8px;padding:${buttonPadding};border-radius:18px;background:#1565c0;color:#fff;border:none;cursor:pointer;font-size:${buttonFontSize}px;min-height:44px;">送出</button>
        `;
        
        // 在手機上調整輸入框位置和樣式
        if (isMobile) {
            customInput.style.top = `${y + 50}px`;
            customInput.style.width = '100%';
            customInput.style.left = '0';
            customInput.style.transform = 'none';
            customInput.style.padding = '0 15px';
            customInput.style.boxSizing = 'border-box';
            
            // 手機上垂直排列
            const inputElement = customInput.querySelector('#customEmotionInput');
            const buttonElement = customInput.querySelector('#customEmotionSubmit');
            
            inputElement.style.width = '100%';
            inputElement.style.marginBottom = '8px';
            buttonElement.style.width = '100%';
            buttonElement.style.marginLeft = '0';
        }
        
        container.appendChild(customInput);

        // 送出事件
        customInput.querySelector('#customEmotionSubmit').onclick = () => {
            const val = customInput.querySelector('#customEmotionInput').value.trim();
            if (!val) {
                alert('請輸入您的心情');
                return;
            }
            selectEmotion(idx, val);
            customInput.remove();
        };
        // 鍵盤 Enter
        customInput.querySelector('#customEmotionInput').onkeydown = e => {
            if (e.key === 'Enter') customInput.querySelector('#customEmotionSubmit').click();
        };
        customInput.querySelector('#customEmotionInput').focus();
        showDove(x, y);
    }

    // 選擇情緒
    function selectEmotion(idx, emotionText) {
        selectedIdx = idx;
        updateBtnStyle();
        showDove(branchCoords[idx].x, branchCoords[idx].y);
        if (onSelect) onSelect(emotionText);
        if (customInput) customInput.remove();
    }

    // 更新按鈕樣式
    function updateBtnStyle() {
        svg.querySelectorAll('.emotion-tree-btn').forEach((btn, i) => {
            btn.setAttribute('fill', i === selectedIdx ? '#1565c0' : '#fff');
            btn.setAttribute('stroke', i === selectedIdx ? '#0d47a1' : '#2196F3');
        });
    }

    // 顯示白鴿動畫
    function showDove(x, y) {
        if (dove) dove.remove();
        
        // 響應式鴿子尺寸
        const doveSize = isSmallMobile ? 0.8 : isMobile ? 0.9 : 1;
        const doveX = x - (18 * doveSize);
        const doveY = y - (48 * doveSize);
        
        dove = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        dove.setAttribute('id', 'dove-anim');
        dove.setAttribute('transform', `translate(${doveX},${doveY}) scale(${doveSize})`);
        dove.innerHTML = `
          <g>
            <ellipse cx="18" cy="32" rx="18" ry="10" fill="#fff" opacity="0.7"/>
            <path d="M18 36 Q12 28 18 24 Q24 28 18 36" fill="#fff"/>
            <circle cx="18" cy="18" r="14" fill="#fff" stroke="#bbb" stroke-width="1"/>
            <circle cx="23" cy="18" r="2.5" fill="#222"/>
            <path d="M18 32 Q10 24 18 20 Q26 24 18 32" fill="#e3f2fd"/>
            <polygon points="30,18 38,14 30,22" fill="#fbc02d"/>
          </g>
          <animateTransform attributeName="transform" type="translate" from="${doveX},${doveY}" to="${doveX},${doveY - (6 * doveSize)}" dur="0.7s" repeatCount="indefinite" direction="alternate" />
        `;
        svg.appendChild(dove);
    }

    // 響應式定位和重新渲染
    function handleResize() {
        // 重新計算尺寸
        const newIsMobile = window.innerWidth <= 768;
        const newIsSmallMobile = window.innerWidth <= 480;
        
        if (newIsMobile !== isMobile || newIsSmallMobile !== isSmallMobile) {
            // 重新渲染整個情緒樹
            EmotionTree({ emotions, onSelect, containerId });
        } else if (customInput) {
            // 只調整輸入框位置
            const currentBranch = branchCoords[5];
            if (newIsMobile) {
                customInput.style.left = '0';
                customInput.style.transform = 'none';
            } else {
                customInput.style.left = `calc(50% + ${currentBranch.x - width / 2}px)`;
                customInput.style.transform = 'translate(-50%,0)';
            }
        }
    }

    // 監聽視窗大小改變
    window.addEventListener('resize', handleResize);
}

// 匯出
window.EmotionTree = EmotionTree;