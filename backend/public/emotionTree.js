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

    // 樹幹與分枝座標
    const width = 400, height = 340, centerX = width / 2, trunkY = height - 40;
    const branchCoords = [
        { x: centerX, y: trunkY - 140 }, // 上
        { x: centerX - 110, y: trunkY - 70 }, // 左上
        { x: centerX + 110, y: trunkY - 70 }, // 右上
        { x: centerX - 70, y: trunkY + 10 }, // 左下
        { x: centerX + 70, y: trunkY + 10 }, // 右下
        { x: centerX, y: trunkY + 60 } // 自訂
    ];

    // SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('style', 'max-width:420px;display:block;margin:auto;');

    // 畫樹幹
    svg.innerHTML = `
      <path d="M${centerX},${trunkY} Q${centerX},${trunkY-60} ${centerX},${trunkY-160}" stroke="#8d5524" stroke-width="18" fill="none"/>
      <path d="M${centerX},${trunkY-80} Q${centerX-60},${trunkY-120} ${centerX-110},${trunkY-70}" stroke="#8d5524" stroke-width="10" fill="none"/>
      <path d="M${centerX},${trunkY-80} Q${centerX+60},${trunkY-120} ${centerX+110},${trunkY-70}" stroke="#8d5524" stroke-width="10" fill="none"/>
      <path d="M${centerX},${trunkY-30} Q${centerX-30},${trunkY+10} ${centerX-70},${trunkY+10}" stroke="#8d5524" stroke-width="8" fill="none"/>
      <path d="M${centerX},${trunkY-30} Q${centerX+30},${trunkY+10} ${centerX+70},${trunkY+10}" stroke="#8d5524" stroke-width="8" fill="none"/>
    `;

    // 狀態
    let selectedIdx = null;
    let customInput = null;
    let dove = null;

    // 建立情緒按鈕
    emotions.forEach((emotion, idx) => {
        const isCustom = idx === 5;
        const { x, y } = branchCoords[idx];
        // 圓形按鈕
        const btn = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        btn.setAttribute('cx', x);
        btn.setAttribute('cy', y);
        btn.setAttribute('r', 32);
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
        text.setAttribute('font-size', '16');
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

        // 建立輸入框
        customInput = document.createElement('div');
        customInput.style.position = 'absolute';
        customInput.style.left = `calc(50% + ${x - width / 2}px)`;
        customInput.style.top = `${y + 60}px`;
        customInput.style.transform = 'translate(-50%,0)';
        customInput.style.zIndex = 10;
        customInput.innerHTML = `
            <input id="customEmotionInput" type="text" maxlength="12" placeholder="請輸入心情…" style="padding:6px 12px;border-radius:18px;border:1.5px solid #2196F3;font-size:16px;width:120px;">
            <button id="customEmotionSubmit" style="margin-left:8px;padding:6px 16px;border-radius:18px;background:#1565c0;color:#fff;border:none;cursor:pointer;">送出</button>
        `;
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
        dove = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        dove.setAttribute('id', 'dove-anim');
        dove.setAttribute('transform', `translate(${x-18},${y-48})`);
        dove.innerHTML = `
          <g>
            <ellipse cx="18" cy="32" rx="18" ry="10" fill="#fff" opacity="0.7"/>
            <path d="M18 36 Q12 28 18 24 Q24 28 18 36" fill="#fff"/>
            <circle cx="18" cy="18" r="14" fill="#fff" stroke="#bbb" stroke-width="1"/>
            <circle cx="23" cy="18" r="2.5" fill="#222"/>
            <path d="M18 32 Q10 24 18 20 Q26 24 18 32" fill="#e3f2fd"/>
            <polygon points="30,18 38,14 30,22" fill="#fbc02d"/>
          </g>
          <animateTransform attributeName="transform" type="translate" from="${x-18},${y-48}" to="${x-18},${y-54}" dur="0.7s" repeatCount="indefinite" direction="alternate" />
        `;
        svg.appendChild(dove);
    }

    // 響應式定位
    window.addEventListener('resize', () => {
        if (customInput) customInput.style.left = `calc(50% + ${branchCoords[5].x - width / 2}px)`;
    });
}

// 匯出
window.EmotionTree = EmotionTree;