// 記錄訪問
async function recordVisit(language) {
    if (counterFunctionalityDisabled) {
        console.log('計數器功能已被禁用，跳過訪問記錄');
        return;
    }
    try {
        const apiUrl = `${window.location.origin}${counterApiPath}`;
        console.log('正在記錄訪問，API URL:', apiUrl);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'visit', language })
        });
        if (!response.ok) {
            console.warn(`無法記錄訪問，狀態碼: ${response.status}`);
            try {
                const errorData = await response.json();
                console.warn('錯誤詳情:', errorData);
            } catch (e) {
                console.warn('無法解析錯誤回應');
            }
        } else {
            console.log('成功記錄訪問');
        }
    } catch (error) {
        console.warn('記錄訪問時出錯:', error);
        if (error.message && error.message.includes('404')) {
            console.info('提示: 在本地開發中，請確保 Next.js API 路由正確設置並運行。');
        }
    }
}

// 語系網址參數優先：如網址有 ?lang=zh-Hant 會直接切換語系，不再自動偵測
function getLangFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang');
}
let apiKey = '';
let currentLanguage = '';
const counterApiPath = '/api/counter';
let counterFunctionalityDisabled = false;

function detectUserLanguage() {
    // 只有當用戶還沒有設置語言偏好時才自動檢測
    if (localStorage.getItem('preferredLanguage')) {
        return;
    }
    const supportedLanguages = ['zh-Hant', 'zh-Hans', 'en', 'ja', 'ko', 'de', 'fr', 'it', 'nl', 'es'];
    let browserLang = navigator.language || navigator.userLanguage || '';
    browserLang = browserLang.toLowerCase();
    if (supportedLanguages.includes(browserLang)) {
        localStorage.setItem('preferredLanguage', browserLang);
        return;
    }
    const langPrefix = browserLang.split('-')[0];
    if (langPrefix === 'zh') {
        if (browserLang.includes('cn') || browserLang.includes('sg')) {
            localStorage.setItem('preferredLanguage', 'zh-Hans');
        } else {
            localStorage.setItem('preferredLanguage', 'zh-Hant');
        }
        return;
    }
    switch (langPrefix) {
        case 'en': localStorage.setItem('preferredLanguage', 'en'); break;
        case 'ja': localStorage.setItem('preferredLanguage', 'ja'); break;
        case 'ko': localStorage.setItem('preferredLanguage', 'ko'); break;
        case 'de': localStorage.setItem('preferredLanguage', 'de'); break;
        case 'fr': localStorage.setItem('preferredLanguage', 'fr'); break;
        case 'it': localStorage.setItem('preferredLanguage', 'it'); break;
        case 'nl': localStorage.setItem('preferredLanguage', 'nl'); break;
        case 'es': localStorage.setItem('preferredLanguage', 'es'); break;
        default: localStorage.setItem('preferredLanguage', 'zh-Hant');
    }
}


// 優先處理網址語系參數
const urlLang = getLangFromUrl();
if (urlLang && typeof setCurrentLanguage === 'function') {
    setCurrentLanguage(urlLang);
    localStorage.setItem('preferredLanguage', urlLang);
}

// 記錄音頻生成
async function recordAudioGeneration(language) {
    if (counterFunctionalityDisabled) {
        console.log('計數器功能已被禁用，跳過音頻生成記錄');
        return;
    }
    console.log(`[recordAudioGeneration] Attempting to record audio generation for language: ${language}`);
    try {
        const apiUrl = `${window.location.origin}${counterApiPath}`;
        console.log('[recordAudioGeneration] Sending POST request to:', apiUrl);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'audio', language })
        });
        console.log(`[recordAudioGeneration] Received response status: ${response.status}`);
        if (!response.ok) {
            console.warn(`[recordAudioGeneration] Failed to record audio generation. Status: ${response.status}`);
            try {
                const errorData = await response.json();
                console.warn('[recordAudioGeneration] Error details:', errorData);
            } catch (e) {
                console.warn('[recordAudioGeneration] Could not parse error response.');
            }
        } else {
            const responseData = await response.json();
            console.log('[recordAudioGeneration] Successfully recorded audio generation. Response data:', responseData);
        }
    } catch (error) {
        console.error('[recordAudioGeneration] Error during fetch:', error);
        if (error.message && error.message.includes('404')) {
            console.info('提示: 在本地開發中，請確保 Next.js API 路由正確設置並運行，或已部署到 Vercel 。');
        }
    }
}
// 不再嘗試從前端取得 API 金鑰，所有金鑰僅由後端管理
async function loadApiKey() {
    // 移除 apiKey 相關邏輯，僅初始化語言
    // 檢測並設置用戶語言
    detectUserLanguage();
    // 獲取當前語言
    currentLanguage = getCurrentLanguage();
}

let emotionHistory = []; // 用於記錄情緒列表歷史
let usedEmotions = new Set(); // 記錄已使用過的情緒
let otherSituationClickCount = 0; // 追蹤「我有其他狀況」按鈕點擊次數

/**
 * 在主畫面下方持久顯示自定義情緒輸入框（不會清空情緒按鈕）
 */
function renderPersistentCustomEmotionInput() {
    // 檢查是否已經存在
    if (document.getElementById('persistentCustomEmotionInputContainer')) return;

    const container = document.getElementById('mainEmotions');
    // 創建輸入框容器
    const inputContainer = document.createElement('div');
    inputContainer.id = 'persistentCustomEmotionInputContainer';
    inputContainer.style.margin = '20px auto';
    inputContainer.style.maxWidth = '500px';
    inputContainer.style.borderTop = '1px solid #eee';
    inputContainer.style.paddingTop = '20px';

    const label = document.createElement('p');
    label.textContent = t('customEmotionLabel');
    label.style.marginBottom = '10px';
    label.style.fontWeight = 'bold';

    const textarea = document.createElement('textarea');
    textarea.id = 'persistentCustomEmotionInput';
    textarea.style.width = '100%';
    textarea.style.minHeight = '100px';
    textarea.style.padding = '10px';
    textarea.style.borderRadius = '8px';
    textarea.style.border = '1px solid #ccc';
    textarea.style.marginBottom = '15px';
    textarea.style.fontFamily = 'inherit';

    const submitBtn = document.createElement('button');
    submitBtn.textContent = t('submitButton');
    submitBtn.style.backgroundColor = '#2196F3';
    submitBtn.onclick = function() {
        const customEmotion = textarea.value.trim();
        if (customEmotion) {
            getEmotionalVerse(customEmotion);
        } else {
            alert('請輸入您的困難狀況');
        }
    };

    const resetBtn = document.createElement('button');
    resetBtn.textContent = t('resetButton');
    resetBtn.style.backgroundColor = '#666';
    resetBtn.onclick = resetEmotionSelection;

    inputContainer.appendChild(label);
    inputContainer.appendChild(textarea);
    inputContainer.appendChild(submitBtn);
    inputContainer.appendChild(resetBtn);

    container.appendChild(inputContainer);
}

// 初始化獲取首頁情緒
async function initEmotions() {
    await loadApiKey();

    // 創建語言選擇器
    createLanguageSelector();

    // 記錄訪問
    await recordVisit(currentLanguage);

    // 獲取情緒列表
    const promptByLang = {
        'zh-Hant': '首次訪問，請推薦5個常見的情緒狀態',
        'zh-Hans': '首次访问，请推荐5个常见的情绪状态',
        'en': 'First visit, please recommend 5 common emotional states',
        'ja': '初回訪問、一般的な感情状態を5つ推薦してください',
        'ko': '첫 방문, 일반적인 감정 상태 5가지를 추천해 주세요',
        'de': 'Erster Besuch, bitte empfehlen Sie 5 häufige emotionale Zustände',
        'fr': 'Première visite, veuillez recommander 5 états émotionnels courants',
        'it': 'Prima visita, si prega di consigliare 5 stati emotivi comuni',
        'nl': 'Eerste bezoek, adviseer alstublieft 5 veelvoorkomende emotionele toestanden',
        'es': 'Primera visita, por favor recomiende 5 estados emocionales comunes'
    };

    const prompt = promptByLang[currentLanguage] || promptByLang['zh-Hant'];
    const firstEmotions = await generateEmotions(prompt, true);
    emotionHistory.push(firstEmotions);
    createEmotionButtons(firstEmotions);
    renderPersistentCustomEmotionInput();
}

// 創建語言選擇器
function createLanguageSelector() {
    // 檢查是否已經存在語言選擇器
    if (document.getElementById('languageSelector')) return;
    
    // 創建語言選擇容器
    const langContainer = document.createElement('div');
    langContainer.id = 'languageContainer';
    langContainer.style.position = 'absolute';
    langContainer.style.top = '10px';
    langContainer.style.right = '10px';
    
    // 創建語言選擇標籤
    const langLabel = document.createElement('span');
    langLabel.textContent = t('languageSelector') + ': ';
    langLabel.style.marginRight = '5px';
    
    // 創建語言選擇下拉框
    const langSelector = document.createElement('select');
    langSelector.id = 'languageSelector';
    langSelector.style.padding = '5px';
    langSelector.style.borderRadius = '5px';
    
    // 添加語言選項
    const languages = [
        { code: 'zh-Hant', name: '繁體中文' },
        { code: 'zh-Hans', name: '简体中文' },
        { code: 'en', name: 'English' },
        { code: 'ja', name: '日本語' },
        { code: 'ko', name: '한국어' },
        { code: 'de', name: 'Deutsch' },
        { code: 'fr', name: 'Français' },
        { code: 'it', name: 'Italiano' },
        { code: 'nl', name: 'Nederlands' },
        { code: 'es', name: 'Español' }
    ];
    
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        option.selected = currentLanguage === lang.code;
        langSelector.appendChild(option);
    });
    
// 添加語言切換事件
langSelector.addEventListener('change', function() {
    const newLanguage = this.value;
    setCurrentLanguage(newLanguage);
    // 記錄新語言的訪問
    recordVisit(newLanguage);
    // 重新加載情緒按鈕
    resetEmotionSelection();
});
    
    // 組裝語言選擇器
    langContainer.appendChild(langLabel);
    langContainer.appendChild(langSelector);
    
    // 添加到頁面
    document.body.appendChild(langContainer);
}

// 用API生成情緒列表
async function generateEmotions(context, isFirst = false) {
    // 直接呼叫後端 API 產生情緒，不再由前端呼叫 Groq API 或檢查金鑰
    const fallbackEmotions = {
        'zh-Hant': ['焦慮', '悲傷', '孤獨', '壓力', '喜樂', t('otherSituation')],
        'zh-Hans': ['焦虑', '悲伤', '孤独', '压力', '喜乐', t('otherSituation')],
        'en': ['Anxiety', 'Sadness', 'Loneliness', 'Stress', 'Joy', t('otherSituation')],
        'ja': ['不安', '悲しみ', '孤独', 'ストレス', '喜び', t('otherSituation')],
        'ko': ['불안', '슬픔', '외로움', '스트레스', '기쁨', t('otherSituation')],
        'de': ['Angst', 'Traurigkeit', 'Einsamkeit', 'Stress', 'Freude', t('otherSituation')],
        'fr': ['Anxiété', 'Tristesse', 'Solitude', 'Stress', 'Joie', t('otherSituation')],
        'it': ['Ansia', 'Tristezza', 'Solitudine', 'Stress', 'Gioia', t('otherSituation')],
        'nl': ['Angst', 'Verdriet', 'Eenzaamheid', 'Stress', 'Vreugde', t('otherSituation')],
        'es': ['Ansiedad', 'Tristeza', 'Soledad', 'Estrés', 'Alegría', t('otherSituation')]
    };
    try {
        const response = await fetch('/api/prayer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: context })
        });
        if (response.ok) {
            const data = await response.json();
            // 假設後端回傳格式為 { result: [ ... ] }
            if (Array.isArray(data.result)) {
                return data.result;
            } else if (typeof data.result === 'string') {
                // 若後端回傳字串，嘗試以空格分割
                return data.result.split(' ');
            } else {
                return fallbackEmotions[currentLanguage] || fallbackEmotions['zh-Hant'];
            }
        } else {
            return fallbackEmotions[currentLanguage] || fallbackEmotions['zh-Hant'];
        }
    } catch (e) {
        return fallbackEmotions[currentLanguage] || fallbackEmotions['zh-Hant'];
    }
}


// 創建動態按鈕
function createEmotionButtons(emotions) {
    const container = document.getElementById('mainEmotions');
    container.innerHTML = '';
    
    emotions.forEach(emotion => {
        const btn = document.createElement('button');
        btn.textContent = emotion;
        btn.onclick = () => {
        if (emotion === t('otherSituation') || 
           emotion === '我有其他狀況' || 
           emotion === '我有其他状况' || 
           emotion === 'I have another situation' ||
           emotion === '他の状況があります' ||
           emotion === '다른 상황이 있어요' ||
           emotion === 'Ich habe eine andere Situation' ||
           emotion === 'J\'ai une autre situation' ||
           emotion === 'Ho un\'altra situazione' ||
           emotion === 'Ik heb een andere situatie' ||
           emotion === 'Tengo otra situación') {
                loadMoreEmotions();
            } else {
                getEmotionalVerse(emotion, true);
            }
        };
        if (emotion === t('otherSituation') || 
           emotion === '我有其他狀況' || 
           emotion === '我有其他状况' || 
           emotion === 'I have another situation' ||
           emotion === '他の状況があります' ||
           emotion === '다른 상황이 있어요' ||
           emotion === 'Ich habe eine andere Situation' ||
           emotion === 'J\'ai une autre situation' ||
           emotion === 'Ho un\'altra situazione' ||
           emotion === 'Ik heb een andere situatie' ||
           emotion === 'Tengo otra situación') {
            btn.style.backgroundColor = '#2196F3';
        }
        container.appendChild(btn);
    });
}

// 加載更多情緒
async function loadMoreEmotions() {
    try {
        otherSituationClickCount++; // 增加點擊計數
        
        // 第三次點擊時顯示輸入框
        if (otherSituationClickCount >= 3) {
            showCustomEmotionInput();
            return;
        }
        
        document.getElementById('mainEmotions').innerHTML = t('loadingEmotions');
        const newEmotions = await generateEmotions('需要不同於之前的情緒狀態');
        emotionHistory.push(newEmotions);
        createEmotionButtons(newEmotions);
        document.getElementById('backButton').style.display = 'inline-block';
    } catch (error) {
        alert('無法加載更多情緒');
    }
}

// 顯示自定義情緒輸入框
function showCustomEmotionInput() {
    const container = document.getElementById('mainEmotions');
    container.innerHTML = '';
    
    // 創建輸入框
    const inputContainer = document.createElement('div');
    inputContainer.style.margin = '20px auto';
    inputContainer.style.maxWidth = '500px';
    
    const label = document.createElement('p');
    label.textContent = t('customEmotionLabel');
    label.style.marginBottom = '10px';
    label.style.fontWeight = 'bold';
    
    const textarea = document.createElement('textarea');
    textarea.id = 'customEmotionInput';
    textarea.style.width = '100%';
    textarea.style.minHeight = '100px';
    textarea.style.padding = '10px';
    textarea.style.borderRadius = '8px';
    textarea.style.border = '1px solid #ccc';
    textarea.style.marginBottom = '15px';
    textarea.style.fontFamily = 'inherit';
    
    const submitBtn = document.createElement('button');
    submitBtn.textContent = t('submitButton');
    submitBtn.style.backgroundColor = '#2196F3';
    submitBtn.onclick = submitCustomEmotion;
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = t('resetButton');
    resetBtn.style.backgroundColor = '#666';
    resetBtn.onclick = resetEmotionSelection;
    
    inputContainer.appendChild(label);
    inputContainer.appendChild(textarea);
    inputContainer.appendChild(submitBtn);
    inputContainer.appendChild(resetBtn);
    
    container.appendChild(inputContainer);
}

// 提交自定義情緒
function submitCustomEmotion() {
    const customEmotion = document.getElementById('customEmotionInput').value.trim();
    if (customEmotion) {
        getEmotionalVerse(customEmotion, true);
    } else {
        alert('請輸入您的困難狀況');
    }
}

// 重置情緒選擇
function resetEmotionSelection() {
    otherSituationClickCount = 0; // 重置計數器
    initEmotions(); // 重新初始化情緒按鈕
    document.getElementById('backButton').style.display = 'none';
    document.getElementById('verse').innerHTML = ''; // 清空經文區域
}

// 返回上一個情緒列表
function showPreviousEmotions() {
    if (emotionHistory.length > 1) {
        emotionHistory.pop(); // 移除當前列表
        const prevEmotions = emotionHistory[emotionHistory.length-1];
        createEmotionButtons(prevEmotions);
        
        // 如果返回到第一個情緒列表，重置計數器
        if (emotionHistory.length === 1) {
            otherSituationClickCount = 0;
        } else {
            // 否則減少計數器
            otherSituationClickCount--;
            if (otherSituationClickCount < 0) otherSituationClickCount = 0;
        }
    }
    if (emotionHistory.length === 1) {
        document.getElementById('backButton').style.display = 'none';
    }
}

// 使用AI一次性選擇最適合情緒的語音和語音指令
async function getVoiceAndInstructions(emotion, prayerText = '') {
    try {
        if (!apiKey) {
            console.warn('API金鑰未設置，使用默認語音Alloy');
            return { voice: 'alloy', instructions: '' };
        }
        
        // 定義給AI的內容，根據是否有禱告文調整提示
        let content = '';
        if (prayerText) {
            // 如果有禱告文，生成音色選擇和語音指令
            content = `基於用戶情緒「${emotion}」及以下禱告文，請執行兩項任務：

1. 從以下六個OpenAI TTS語音中選擇最適合的一個：
   - Alloy: 平衡的聲音，適合一般用途，提供清晰度和溫暖感
   - Echo: 更動態的聲音，可以為通知增添興奮感
   - Fable: 講故事的聲音，非常適合讀睡前故事或敘述內容
   - Onyx: 深沉且豐富的聲音，適合權威性指令
   - Nova: 明亮且歡快的聲音，適合友好的互動
   - Shimmer: 柔和且舒緩的聲音，適合平靜的環境

2. 為這段禱告文生成適合的TTS指令：
"""
${prayerText}
"""

請按照以下格式回答：

VOICE: [選擇的語音名稱，小寫]

INSTRUCTIONS:
Voice Affect: [聲音情感描述]
Tone: [語調描述]
Pacing: [速度描述]
Emotions: [情緒描述]
Pronunciation: [發音重點描述]
Pauses: [停頓描述]`;
        } else {
            // 如果沒有禱告文，只選擇音色
            content = `基於用戶的情緒「${emotion}」，請從以下六個OpenAI TTS語音中選擇最適合的一個:
Alloy: 平衡的聲音，適合一般用途，提供清晰度和溫暖感
Echo: 更動態的聲音，可以為通知增添興奮感
Fable: 講故事的聲音，非常適合讀睡前故事或敘述內容
Onyx: 深沉且豐富的聲音，適合權威性指令
Nova: 明亮且歡快的聲音，適合友好的互動
Shimmer: 柔和且舒緩的聲音，適合平靜的環境

請按照以下格式回答：
VOICE: [選擇的語音名稱，小寫]`;
        }
        
        // 改為呼叫 Groq API 代理端點
        const response = await fetch('/api/groq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content,       // 你要傳給後端的內容
                prayerText     // 其他必要參數
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const groqData = await response.json();
        if (!groqData?.choices?.[0]?.message?.content) {
            throw new Error('Invalid API response structure');
        }
        // 解析回應
        const responseText = groqData.choices[0].message.content.trim();
        
        // 提取語音名稱
        const voiceMatch = responseText.match(/VOICE:\s*(\w+)/i);
        let voice = 'alloy'; // 默認值
        
        if (voiceMatch && voiceMatch[1]) {
            const extractedVoice = voiceMatch[1].toLowerCase().trim();
            // 確保回傳的是有效的語音選項
            const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
            if (validVoices.includes(extractedVoice)) {
                voice = extractedVoice;
            } else {
                console.warn('API返回了無效的語音名稱:', extractedVoice);
            }
        }
        
        // 提取指令（如果有）
        let instructions = '';
        if (prayerText) {
            const instructionsMatch = responseText.match(/INSTRUCTIONS:\s*([\s\S]+)/i);
            if (instructionsMatch && instructionsMatch[1]) {
                instructions = instructionsMatch[1].trim();
            }
        }
        
        return { voice, instructions };
    } catch (error) {
        console.error('獲取語音建議及指令失敗:', error);
        return { voice: 'alloy', instructions: '' }; // 出錯時使用默認語音
    }
}

/**
 * 多段禱告詞管理
 */
let prayerSegments = []; // 每段格式：{text, voice, instructions, number}
let prayerEmotion = '';  // 當前情緒
let prayerMaxSegments = 4; // 最多段數

// 倒數計時器變數
let countdownInterval = null;
let countdownSeconds = 0;

/**
 * 產生新禱告段落（prepend到最上方）
 * @param {string} emotion - 用戶情緒
 * @param {boolean} isFirst - 是否為第一段
 */
async function getEmotionalVerse(emotion, isFirst = false) {
    // 前端不再檢查 apiKey
    if (isFirst) {
        prayerSegments = [];
        prayerEmotion = emotion;
    }
    // 計算第幾段
    const segmentNumber = prayerSegments.length + 1;
    // 設定禱告詞長度
    let prayerLength = 100; // 預設100字以上
    if (segmentNumber === 1) prayerLength = 120; // 約1分鐘
    else if (segmentNumber === 2) prayerLength = 200; // 約1.5~2分鐘
    else prayerLength = 250; // 2~2.5分鐘

    // 初始時先設置默認語音，稍後會根據禱告文內容再做選擇
    let voiceData = { voice: 'alloy', instructions: '' };
    try {
        const verseElement = document.getElementById('verse');
        // loading區塊只顯示在最上方，舊禱告詞不消失
        renderPrayerLoading();

        // 開始倒數計時
        countdownSeconds = 0;
        clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            countdownSeconds++;
            const timerElement = document.getElementById('prayer-loading-timer');
            if (timerElement) {
                timerElement.textContent = `(${countdownSeconds})`;
            }
        }, 1000);

        // 產生禱告詞
        // 改為呼叫 Groq API 代理端點
        const response = await fetch('/api/groq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                emotion,
                currentLanguage,
                prayerLength
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (!data.choices || !Array.isArray(data.choices) || !data.choices[0]?.message?.content) {
            // 若有 error 屬性，顯示原始錯誤
            let errorMsg = '';
            if (data.error) {
                errorMsg = data.error + (data.detail ? `: ${data.detail}` : '');
            } else {
                errorMsg = JSON.stringify(data);
            }
            throw new Error('Invalid API response structure\n' + errorMsg);
        }
        const responseText = data.choices[0].message.content.trim();

        // 嘗試多種格式解析
        let scripture = '', explanation = '', prayerText = '';
        // 1. 標準格式
        const scriptureKey = t('scripture').replace('：', '');
        const explanationKey = t('explanation').replace('：', '');
        const prayerKey = t('prayer').replace('：', '');
        let verseMatch = responseText.match(new RegExp(`【${scriptureKey}】([\s\S]+?)\n【${explanationKey}】`));
        let comfortMatch = responseText.match(new RegExp(`【${explanationKey}】([\s\S]+?)\n【${prayerKey}】`));
        let prayerMatch = responseText.match(new RegExp(`【${prayerKey}】([\s\S]+)`));

        if (verseMatch && comfortMatch && prayerMatch) {
            scripture = verseMatch[1].trim();
            explanation = comfortMatch[1].trim();
            prayerText = prayerMatch[1].trim();
        } else {
            // 2. 嘗試解析 markdown/星號格式
            // 例如 prayer, verse, explanation 以 **title** 或 **標題** 開頭
            const prayerMd = responseText.match(/\*\*禱告\*\*[\s\S]+?\n([\s\S]+?)\n\*\*聖經經文\*\*/);
            const verseMd = responseText.match(/\*\*聖經經文\*\*[\s\S]+?\n([\s\S]+?)\n\*\*簡短解說\*\*/);
            const explanationMd = responseText.match(/\*\*簡短解說\*\*[\s\S]+?\n([\s\S]+?)(\n|$)/);
            if (prayerMd && verseMd && explanationMd) {
                prayerText = prayerMd[1].trim();
                scripture = verseMd[1].trim();
                explanation = explanationMd[1].trim();
            } else {
                // 3. fallback: 只要有 prayer/verse/explanation 關鍵字就分段
                const prayerIdx = responseText.indexOf('禱告');
                const verseIdx = responseText.indexOf('聖經經文');
                const explanationIdx = responseText.indexOf('簡短解說');
                if (prayerIdx !== -1 && verseIdx !== -1 && explanationIdx !== -1) {
                    prayerText = responseText.substring(prayerIdx + 2, verseIdx).trim();
                    scripture = responseText.substring(verseIdx + 4, explanationIdx).trim();
                    explanation = responseText.substring(explanationIdx + 4).trim();
                }
            }
        }

        if (prayerText && scripture && explanation) {
            // 取得語音建議
            try {
                voiceData = await getVoiceAndInstructions(emotion, prayerText);
            } catch (error) {
                console.error('選擇語音時出錯，使用默認語音:', error);
            }
            // prepend 新段落
            prayerSegments.unshift({
                text: prayerText,
                voice: voiceData.voice,
                instructions: voiceData.instructions,
                number: segmentNumber
            });
            // 清除倒數計時器
            clearInterval(countdownInterval);
            // 移除 loading 區塊並渲染所有段落
            renderPrayerSegments(scripture, explanation);
        } else {
            clearInterval(countdownInterval);
            // 移除 loading 區塊並渲染所有段落
            renderPrayerSegments();
            const verseElement = document.getElementById('verse');
            verseElement.classList.remove('loading-verse');
            let errorMsg = '';
            if (data.error) {
                errorMsg = data.error + (data.detail ? `: ${data.detail}` : '');
            } else {
                errorMsg = JSON.stringify(data);
            }
            verseElement.innerHTML = `${t('parseError')}<br>${errorMsg}<br><pre style="white-space:pre-wrap;text-align:left;max-width:600px;margin:10px auto;background:#f8f8f8;padding:8px;border-radius:6px;">${responseText}</pre>`;
        }
    } catch (error) {
        console.error('錯誤：', error);
        clearInterval(countdownInterval);
        // 移除 loading 區塊並渲染所有段落
        renderPrayerSegments();
        const verseElement = document.getElementById('verse');
        verseElement.classList.remove('loading-verse');
        verseElement.innerHTML = t('errorGettingVerse') + '<br>' + (error && error.message ? error.message : '');
    }
    }


/**
 * 渲染所有禱告段落
 * @param {string} scripture - 經文
 * @param {string} explanation - 解說
 */
function renderPrayerSegments(scripture, explanation) {
    const verseElement = document.getElementById('verse');
    // 段落區塊
    let html = '';
    // 如果有主題經文與解說，顯示在最上方
    if (typeof scripture === 'string' && typeof explanation === 'string') {
        html += `
            <div style="text-align: left; max-width: 600px; margin: 20px auto;">
                <h3 style="color: #2c3e50;">${t('verseForEmotion', { emotion: prayerEmotion })}</h3>
                <p style="font-size: 1.1em;">
                    <strong>${t('scripture')}</strong><br>
                    ${scripture.replace(/\n/g, '<br>')}
                </p>
                <p style="color: #27ae60; margin-top: 20px;">
                    <strong>${t('explanation')}</strong><br>
                    ${explanation.replace(/\n/g, '<br>')}
                </p>
            </div>
        `;
    }
    // 禱告段落（最新在上）
    prayerSegments.forEach((seg, idx) => {
        // 反向編號：最下方是#1，最上方是#N
        const displayNumber = prayerSegments.length - idx;
        html += `
        <div style="background:#f8f9fa;border-radius:10px;padding:18px 16px 12px 16px;margin-bottom:18px;box-shadow:0 2px 8px #0001;">
            <div style="font-weight:bold;color:#2c3e50;margin-bottom:8px;">${t('prayerLabel')}#${displayNumber}</div>
            <div style="color:#2980b9;line-height:1.7;margin-bottom:12px;">${seg.text.replace(/\n/g, '<br>')}</div>
            <div id="audio-player-${idx}" style="margin-bottom:8px;">
                <button onclick="playPrayerSegment(${idx})" id="play-button-${idx}">
                    <span id="play-text-${idx}">${t('playPrayer')}</span>
                    <span id="loading-spinner-${idx}" style="display:none;">${t('generatingAudio')}</span>
                </button>
                <span id="voice-selector-label-${idx}" style="margin-left:10px;">${t('voiceSelector')}:</span>
                <select id="voice-selector-${idx}" style="padding:5px;border-radius:5px;">
                    <option value="alloy" ${seg.voice === 'alloy' ? 'selected' : ''}>${t('alloy')}</option>
                    <option value="echo" ${seg.voice === 'echo' ? 'selected' : ''}>${t('echo')}</option>
                    <option value="fable" ${seg.voice === 'fable' ? 'selected' : ''}>${t('fable')}</option>
                    <option value="onyx" ${seg.voice === 'onyx' ? 'selected' : ''}>${t('onyx')}</option>
                    <option value="nova" ${seg.voice === 'nova' ? 'selected' : ''}>${t('nova')}</option>
                    <option value="shimmer" ${seg.voice === 'shimmer' ? 'selected' : ''}>${t('shimmer')}</option>
                </select>
                <audio id="prayer-audio-${idx}" controls style="display:none;margin-top:10px;width:100%;"></audio>
            </div>
            ${idx === 0 && prayerSegments.length < prayerMaxSegments ? `
                <div style="margin-top:8px;">
                    <button onclick="getEmotionalVerse(prayerEmotion)">${t('continuePrayer')}</button>
                </div>
            ` : ''}
        </div>
        `;
    });
    verseElement.innerHTML = html;
}

/**
 * 只渲染 loading 區塊（不清空舊禱告詞）
 */
function renderPrayerLoading() {
    const verseElement = document.getElementById('verse');
    // loading 區塊插在最上方
    let html = `
        <div id="prayer-loading-block" style="background:#fffbe6;border-radius:10px;padding:18px 16px 12px 16px;margin-bottom:18px;box-shadow:0 2px 8px #0001;">
            <div style="font-weight:bold;color:#b8860b;margin-bottom:8px;">${t('loadingVerse')} <span id="prayer-loading-timer">(0)</span></div>
        </div>
    `;
    // 舊禱告詞段落
    prayerSegments.forEach((seg, idx) => {
        const displayNumber = prayerSegments.length - idx;
        html += `
        <div style="background:#f8f9fa;border-radius:10px;padding:18px 16px 12px 16px;margin-bottom:18px;box-shadow:0 2px 8px #0001;">
            <div style="font-weight:bold;color:#2c3e50;margin-bottom:8px;">${t('prayerLabel')}#${displayNumber}</div>
            <div style="color:#2980b9;line-height:1.7;margin-bottom:12px;">${seg.text.replace(/\n/g, '<br>')}</div>
            <div id="audio-player-${idx}" style="margin-bottom:8px;">
                <button onclick="playPrayerSegment(${idx})" id="play-button-${idx}">
                    <span id="play-text-${idx}">${t('playPrayer')}</span>
                    <span id="loading-spinner-${idx}" style="display:none;">${t('generatingAudio')}</span>
                </button>
                <span id="voice-selector-label-${idx}" style="margin-left:10px;">${t('voiceSelector')}:</span>
                <select id="voice-selector-${idx}" style="padding:5px;border-radius:5px;">
                    <option value="alloy" ${seg.voice === 'alloy' ? 'selected' : ''}>${t('alloy')}</option>
                    <option value="echo" ${seg.voice === 'echo' ? 'selected' : ''}>${t('echo')}</option>
                    <option value="fable" ${seg.voice === 'fable' ? 'selected' : ''}>${t('fable')}</option>
                    <option value="onyx" ${seg.voice === 'onyx' ? 'selected' : ''}>${t('onyx')}</option>
                    <option value="nova" ${seg.voice === 'nova' ? 'selected' : ''}>${t('nova')}</option>
                    <option value="shimmer" ${seg.voice === 'shimmer' ? 'selected' : ''}>${t('shimmer')}</option>
                </select>
                <audio id="prayer-audio-${idx}" controls style="display:none;margin-top:10px;width:100%;"></audio>
            </div>
        </div>
        `;
    });
    verseElement.innerHTML = html;
}

/**
 * 播放指定段落的禱告詞
 */
async function playPrayerSegment(idx) {
    // 前端不再檢查 apiKey
    const seg = prayerSegments[idx];
    const button = document.getElementById(`play-button-${idx}`);
    const spinner = document.getElementById(`loading-spinner-${idx}`);
    const playText = document.getElementById(`play-text-${idx}`);
    const voiceSelector = document.getElementById(`voice-selector-${idx}`);
    const selectedVoice = voiceSelector ? voiceSelector.value : seg.voice;

    // 記錄音頻生成事件
    await recordAudioGeneration(currentLanguage);

    try {
        button.disabled = true;
        playText.style.display = 'none';
        spinner.style.display = 'inline';

        // 準備API請求體
        const requestBody = {
            model: "tts-1",
            voice: selectedVoice,
            input: seg.text,
            response_format: "mp3"
        };
        if (seg.instructions) {
            requestBody.instructions = seg.instructions;
        }
        const response = await fetch('/api/audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
// 處理回傳的音訊資料


        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(new Blob([audioBlob], { type: 'audio/mpeg' }));
        const audioElement = document.getElementById(`prayer-audio-${idx}`);
        audioElement.src = audioUrl;
        audioElement.style.display = 'block';
        audioElement.play();
    } catch (error) {
        console.error('播放失敗:', error);
        alert(t('audioPlayError'));
    } finally {
        button.disabled = false;
        playText.style.display = 'inline';
        spinner.style.display = 'none';
    }
}

// 修改playPrayer函數
async function playPrayer(encodedText, encodedInstructions = '') {
    // 前端不再檢查 apiKey
    
    const button = document.getElementById('play-button');
    const spinner = document.getElementById('loading-spinner');
    const playText = document.getElementById('play-text');
    const voiceSelector = document.getElementById('voice-selector');
    const selectedVoice = voiceSelector ? voiceSelector.value : 'alloy';
    
    // 記錄音頻生成事件
    await recordAudioGeneration(currentLanguage);
    
    try {
        button.disabled = true;
        playText.style.display = 'none';
        spinner.style.display = 'inline';
        
        const text = decodeURIComponent(encodedText);
        const instructions = encodedInstructions ? decodeURIComponent(encodedInstructions) : '';
        
        // 準備API請求體
        const requestBody = {
            model: "tts-1",
            voice: selectedVoice,
            input: text,
            response_format: "mp3"
        };
        
        // 如果有語音指令，添加到請求中
        if (instructions) {
            requestBody.instructions = instructions;
        }
        
        const response = await fetch('/api/audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
// 處理回傳的音訊資料


        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(new Blob([audioBlob], { type: 'audio/mpeg' }));
        const audioElement = document.getElementById('prayer-audio');
        audioElement.src = audioUrl;
        audioElement.style.display = 'block';
        audioElement.play();
    } catch (error) {
        console.error('播放失敗:', error);
        alert(t('audioPlayError'));
    } finally {
        button.disabled = false;
        playText.style.display = 'inline';
        spinner.style.display = 'none';
    }
}

// 檢查API端點是否可用，如果不可用，則禁用計數器功能
async function checkCounterEndpoint() {
    // 如果功能已被禁用，則不再進行檢查
    if (counterFunctionalityDisabled) return;

    try {
        console.log(`檢查 API 路徑: ${counterApiPath}`);
        const apiUrl = `${window.location.origin}${counterApiPath}`;
        const response = await fetch(apiUrl, { method: 'GET' });

        if (response.ok) {
            console.log(`計數器 API 可用: ${counterApiPath}`);
            counterFunctionalityDisabled = false; // Ensure it's enabled if check passes
        } else {
            console.warn(`計數器 API 路徑不可用，狀態碼: ${response.status}`);
            console.warn('禁用計數器功能');
            counterFunctionalityDisabled = true;
        }
    } catch (error) {
        console.warn(`檢查計數器 API 時出錯: ${error.message}`);
        console.warn('禁用計數器功能');
        counterFunctionalityDisabled = true;
    }
}

// 全域錯誤監聽，方便除錯
window.onerror = function(message, source, lineno, colno, error) {
    console.error('全域錯誤:', message, source, lineno, colno, error);
};
window.onunhandledrejection = function(event) {
    console.error('未捕捉的 Promise 拋出:', event.reason);
};

// 初始化
window.onload = async function() {
    try {
        // 先檢查計數器API是否可用
        await checkCounterEndpoint();
        // 初始化情緒按鈕
        await initEmotions();
    } catch (e) {
        console.error('初始化失敗:', e);
    }
};
