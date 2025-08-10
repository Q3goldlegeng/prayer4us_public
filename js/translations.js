// Translations for the website
const translations = {
    // Traditional Chinese (Default)
    'zh-Hant': {
        title: '我陪您禱告',
        backButton: '↩ 上一個情緒列表',
        loadingEmotions: '⏳ 正在尋找更多情緒...',
        customEmotionLabel: '請描述您目前的困難狀況：',
        submitButton: '提交',
        resetButton: '重新選擇情緒',
        otherSituation: '我有其他狀況',
        loadingVerse: '⏳ 正在尋找合適的經文...',
        verseForEmotion: '📖 給正在經歷「{emotion}」的你：',
        scripture: '經文：',
        explanation: '說明：',
        prayer: '禱告詞：',
        playPrayer: '▶ 播放禱告詞',
        generatingAudio: '⏳ 生成音頻中...',
        voiceSelector: '選擇聲音',
        alloy: 'Alloy (平衡)',
        echo: 'Echo (深沉)',
        fable: 'Fable (溫暖)',
        onyx: 'Onyx (強勁)',
        nova: 'Nova (友善)',
        shimmer: 'Shimmer (明亮)',
        apiKeyNotSet: '❌ API金鑰未設置，無法獲取經文',
        errorGettingVerse: '❌ 獲取經文時出錯，請稍後再試',
        audioPlayError: '無法播放音頻，請稍後再試',
        parseError: '⚠️ 未能解析回應，以下是原始內容：',
        apiKeyNotSetAudio: 'API金鑰未設置，無法播放音頻',
        languageSelector: 'Language',
        continuePrayer: '接續更長的禱告',
        prayerLabel: '禱告詞'
    },
    // Simplified Chinese
    'zh-Hans': {
        title: '我陪您祷告',
        backButton: '↩ 上一个情绪列表',
        loadingEmotions: '⏳ 正在寻找更多情绪...',
        customEmotionLabel: '请描述您目前的困难状况：',
        submitButton: '提交',
        resetButton: '重新选择情绪',
        otherSituation: '我有其他状况',
        loadingVerse: '⏳ 正在寻找合适的经文...',
        verseForEmotion: '📖 给正在经历「{emotion}」的你：',
        scripture: '经文：',
        explanation: '说明：',
        prayer: '祷告词：',
        playPrayer: '▶ 播放祷告词',
        generatingAudio: '⏳ 生成音频中...',
        voiceSelector: '选择声音',
        alloy: 'Alloy (平衡)',
        echo: 'Echo (深沉)',
        fable: 'Fable (温暖)',
        onyx: 'Onyx (强劲)',
        nova: 'Nova (友善)',
        shimmer: 'Shimmer (明亮)',
        apiKeyNotSet: '❌ API密钥未设置，无法获取经文',
        errorGettingVerse: '❌ 获取经文时出错，请稍后再试',
        audioPlayError: '无法播放音频，请稍后再试',
        parseError: '⚠️ 未能解析响应，以下是原始内容：',
        apiKeyNotSetAudio: 'API密钥未设置，无法播放音频',
        languageSelector: 'Language',
        continuePrayer: '继续更长的祷告',
        prayerLabel: '祷告词'
    },
    // English
    'en': {
        title: 'Let me Pray With You',
        backButton: '↩ Previous Emotions',
        loadingEmotions: '⏳ Finding more emotions...',
        customEmotionLabel: 'Please describe your current situation:',
        submitButton: 'Submit',
        resetButton: 'Reset Emotion Selection',
        otherSituation: 'I have another situation',
        loadingVerse: '⏳ Finding appropriate scripture...',
        verseForEmotion: '📖 For those experiencing "{emotion}":',
        scripture: 'Scripture:',
        explanation: 'Explanation:',
        prayer: 'Prayer:',
        playPrayer: '▶ Play Prayer',
        generatingAudio: '⏳ Generating audio...',
        voiceSelector: 'Select Voice',
        alloy: 'Alloy (Balanced)',
        echo: 'Echo (Deep)',
        fable: 'Fable (Warm)',
        onyx: 'Onyx (Strong)',
        nova: 'Nova (Friendly)',
        shimmer: 'Shimmer (Bright)',
        apiKeyNotSet: '❌ API key not set, cannot retrieve scripture',
        errorGettingVerse: '❌ Error getting scripture, please try again later',
        audioPlayError: 'Cannot play audio, please try again later',
        parseError: '⚠️ Could not parse response, here is the original content:',
        apiKeyNotSetAudio: 'API key not set, cannot play audio',
        languageSelector: 'Language',
        continuePrayer: 'Continue with a longer prayer',
        prayerLabel: 'Prayer'
    },
    // Japanese
    'ja': {
        title: '一緒に祈りましょう',
        backButton: '↩ 前の感情リスト',
        loadingEmotions: '⏳ 感情を探しています...',
        customEmotionLabel: '現在の状況を説明してください：',
        submitButton: '送信',
        resetButton: '感情選択をリセット',
        otherSituation: '他の状況があります',
        loadingVerse: '⏳ 適切な聖書の言葉を探しています...',
        verseForEmotion: '📖 「{emotion}」を経験している方へ：',
        scripture: '聖書：',
        explanation: '説明：',
        prayer: '祈り：',
        playPrayer: '▶ 祈りを再生',
        generatingAudio: '⏳ 音声を生成中...',
        voiceSelector: '音声を選択',
        alloy: 'Alloy (バランス)',
        echo: 'Echo (深い)',
        fable: 'Fable (温かい)',
        onyx: 'Onyx (力強い)',
        nova: 'Nova (親しみやすい)',
        shimmer: 'Shimmer (明るい)',
        apiKeyNotSet: '❌ APIキーが設定されていません、聖書の言葉を取得できません',
        errorGettingVerse: '❌ 聖書の言葉の取得中にエラーが発生しました、後でもう一度お試しください',
        audioPlayError: '音声を再生できません、後でもう一度お試しください',
        parseError: '⚠️ 応答を解析できませんでした、以下は元のコンテンツです：',
        apiKeyNotSetAudio: 'APIキーが設定されていません、音声を再生できません',
        languageSelector: 'Language',
        continuePrayer: 'さらに長い祈りを続ける',
        prayerLabel: '祈り'
    },
    // Korean
    'ko': {
        title: '함께 기도해요',
        backButton: '↩ 이전 감정 목록',
        loadingEmotions: '⏳ 감정을 찾는 중...',
        customEmotionLabel: '현재 상황을 설명해 주세요:',
        submitButton: '제출',
        resetButton: '감정 선택 초기화',
        otherSituation: '다른 상황이 있어요',
        loadingVerse: '⏳ 적절한 성경 구절을 찾는 중...',
        verseForEmotion: '📖 "{emotion}"을(를) 경험하고 있는 당신에게:',
        scripture: '성경 구절:',
        explanation: '설명:',
        prayer: '기도:',
        playPrayer: '▶ 기도 재생',
        generatingAudio: '⏳ 오디오 생성 중...',
        voiceSelector: '음성 선택',
        alloy: 'Alloy (균형)',
        echo: 'Echo (깊은)',
        fable: 'Fable (따뜻한)',
        onyx: 'Onyx (강한)',
        nova: 'Nova (친근한)',
        shimmer: 'Shimmer (밝은)',
        apiKeyNotSet: '❌ API 키가 설정되지 않았습니다. 성경 구절을 가져올 수 없습니다',
        errorGettingVerse: '❌ 성경 구절을 가져오는 중 오류가 발생했습니다. 나중에 다시 시도해 주세요',
        audioPlayError: '오디오를 재생할 수 없습니다. 나중에 다시 시도해 주세요',
        parseError: '⚠️ 응답을 분석할 수 없습니다. 다음은 원본 내용입니다:',
        apiKeyNotSetAudio: 'API 키가 설정되지 않았습니다. 오디오를 재생할 수 없습니다',
        languageSelector: 'Language',
        continuePrayer: '더 긴 기도를 이어가기',
        prayerLabel: '기도'
    },
    // German
    'de': {
        title: 'Lass mich mit dir beten',
        backButton: '↩ Vorherige Emotionen',
        loadingEmotions: '⏳ Suche nach weiteren Emotionen...',
        customEmotionLabel: 'Bitte beschreibe deine aktuelle Situation:',
        submitButton: 'Absenden',
        resetButton: 'Emotionsauswahl zurücksetzen',
        otherSituation: 'Ich habe eine andere Situation',
        loadingVerse: '⏳ Suche nach passender Bibelstelle...',
        verseForEmotion: '📖 Für diejenigen, die "{emotion}" erleben:',
        scripture: 'Bibelstelle:',
        explanation: 'Erklärung:',
        prayer: 'Gebet:',
        playPrayer: '▶ Gebet abspielen',
        generatingAudio: '⏳ Audio wird generiert...',
        voiceSelector: 'Stimme auswählen',
        alloy: 'Alloy (Ausgeglichen)',
        echo: 'Echo (Tief)',
        fable: 'Fable (Warm)',
        onyx: 'Onyx (Stark)',
        nova: 'Nova (Freundlich)',
        shimmer: 'Shimmer (Hell)',
        apiKeyNotSet: '❌ API-Schlüssel nicht gesetzt, Bibelstelle kann nicht abgerufen werden',
        errorGettingVerse: '❌ Fehler beim Abrufen der Bibelstelle, bitte versuche es später erneut',
        audioPlayError: 'Audio kann nicht abgespielt werden, bitte versuche es später erneut',
        parseError: '⚠️ Antwort konnte nicht analysiert werden, hier ist der ursprüngliche Inhalt:',
        apiKeyNotSetAudio: 'API-Schlüssel nicht gesetzt, Audio kann nicht abgespielt werden',
        languageSelector: 'Sprache',
        continuePrayer: 'Mit einem längeren Gebet fortfahren',
        prayerLabel: 'Gebet'
    },
    // French
    'fr': {
        title: 'Prions ensemble',
        backButton: '↩ Émotions précédentes',
        loadingEmotions: '⏳ Recherche d\'émotions supplémentaires...',
        customEmotionLabel: 'Veuillez décrire votre situation actuelle:',
        submitButton: 'Soumettre',
        resetButton: 'Réinitialiser la sélection d\'émotions',
        otherSituation: 'J\'ai une autre situation',
        loadingVerse: '⏳ Recherche d\'un verset approprié...',
        verseForEmotion: '📖 Pour ceux qui ressentent "{emotion}":',
        scripture: 'Écriture:',
        explanation: 'Explication:',
        prayer: 'Prière:',
        playPrayer: '▶ Écouter la prière',
        generatingAudio: '⏳ Génération de l\'audio...',
        voiceSelector: 'Sélectionner une voix',
        alloy: 'Alloy (Équilibrée)',
        echo: 'Echo (Profonde)',
        fable: 'Fable (Chaleureuse)',
        onyx: 'Onyx (Forte)',
        nova: 'Nova (Amicale)',
        shimmer: 'Shimmer (Claire)',
        apiKeyNotSet: '❌ Clé API non définie, impossible de récupérer les écritures',
        errorGettingVerse: '❌ Erreur lors de la récupération des écritures, veuillez réessayer plus tard',
        audioPlayError: 'Impossible de lire l\'audio, veuillez réessayer plus tard',
        parseError: '⚠️ Impossible d\'analyser la réponse, voici le contenu original:',
        apiKeyNotSetAudio: 'Clé API non définie, impossible de lire l\'audio',
        languageSelector: 'Langue',
        continuePrayer: 'Continuer avec une prière plus longue',
        prayerLabel: 'Prière'
    },
    // Italian
    'it': {
        title: 'Preghiamo insieme',
        backButton: '↩ Emozioni precedenti',
        loadingEmotions: '⏳ Ricerca di altre emozioni...',
        customEmotionLabel: 'Per favore descrivi la tua situazione attuale:',
        submitButton: 'Invia',
        resetButton: 'Reimposta selezione emozioni',
        otherSituation: 'Ho un\'altra situazione',
        loadingVerse: '⏳ Ricerca di un versetto appropriato...',
        verseForEmotion: '📖 Per coloro che provano "{emotion}":',
        scripture: 'Scrittura:',
        explanation: 'Spiegazione:',
        prayer: 'Preghiera:',
        playPrayer: '▶ Ascolta la preghiera',
        generatingAudio: '⏳ Generazione dell\'audio...',
        voiceSelector: 'Seleziona voce',
        alloy: 'Alloy (Equilibrata)',
        echo: 'Echo (Profonda)',
        fable: 'Fable (Calda)',
        onyx: 'Onyx (Forte)',
        nova: 'Nova (Amichevole)',
        shimmer: 'Shimmer (Chiara)',
        apiKeyNotSet: '❌ Chiave API non impostata, impossibile recuperare le scritture',
        errorGettingVerse: '❌ Errore durante il recupero delle scritture, riprova più tardi',
        audioPlayError: 'Impossibile riprodurre l\'audio, riprova più tardi',
        parseError: '⚠️ Impossibile analizzare la risposta, ecco il contenuto originale:',
        apiKeyNotSetAudio: 'Chiave API non impostata, impossibile riprodurre l\'audio',
        languageSelector: 'Lingua',
        continuePrayer: 'Continua con una preghiera più lunga',
        prayerLabel: 'Preghiera'
    },
    // Dutch
    'nl': {
        title: 'Laten we samen bidden',
        backButton: '↩ Vorige emoties',
        loadingEmotions: '⏳ Zoeken naar meer emoties...',
        customEmotionLabel: 'Beschrijf alstublieft uw huidige situatie:',
        submitButton: 'Verzenden',
        resetButton: 'Emotieselectie resetten',
        otherSituation: 'Ik heb een andere situatie',
        loadingVerse: '⏳ Zoeken naar een passend vers...',
        verseForEmotion: '📖 Voor degenen die "{emotion}" ervaren:',
        scripture: 'Schrift:',
        explanation: 'Uitleg:',
        prayer: 'Gebed:',
        playPrayer: '▶ Gebed afspelen',
        generatingAudio: '⏳ Audio genereren...',
        voiceSelector: 'Stem selecteren',
        alloy: 'Alloy (Gebalanceerd)',
        echo: 'Echo (Diep)',
        fable: 'Fable (Warm)',
        onyx: 'Onyx (Sterk)',
        nova: 'Nova (Vriendelijk)',
        shimmer: 'Shimmer (Helder)',
        apiKeyNotSet: '❌ API-sleutel niet ingesteld, kan geen schrift ophalen',
        errorGettingVerse: '❌ Fout bij het ophalen van schrift, probeer het later opnieuw',
        audioPlayError: 'Kan audio niet afspelen, probeer het later opnieuw',
        parseError: '⚠️ Kon het antwoord niet analyseren, hier is de originele inhoud:',
        apiKeyNotSetAudio: 'API-sleutel niet ingesteld, kan audio niet afspelen',
        languageSelector: 'Taal',
        continuePrayer: 'Doorgaan met een langer gebed',
        prayerLabel: 'Gebed'
    },
    // Spanish
    'es': {
        title: 'Oremos juntos',
        backButton: '↩ Emociones anteriores',
        loadingEmotions: '⏳ Buscando más emociones...',
        customEmotionLabel: 'Por favor describe tu situación actual:',
        submitButton: 'Enviar',
        resetButton: 'Reiniciar selección de emoción',
        otherSituation: 'Tengo otra situación',
        loadingVerse: '⏳ Buscando escritura apropiada...',
        verseForEmotion: '📖 Para aquellos que experimentan "{emotion}":',
        scripture: 'Escritura:',
        explanation: 'Explicación:',
        prayer: 'Oración:',
        playPrayer: '▶ Reproducir oración',
        generatingAudio: '⏳ Generando audio...',
        voiceSelector: 'Seleccionar voz',
        alloy: 'Alloy (Equilibrada)',
        echo: 'Echo (Profunda)',
        fable: 'Fable (Cálida)',
        onyx: 'Onyx (Fuerte)',
        nova: 'Nova (Amigable)',
        shimmer: 'Shimmer (Brillante)',
        apiKeyNotSet: '❌ Clave API no configurada, no se puede recuperar la escritura',
        errorGettingVerse: '❌ Error al obtener la escritura, por favor intenta más tarde',
        audioPlayError: 'No se puede reproducir el audio, por favor intenta más tarde',
        parseError: '⚠️ No se pudo analizar la respuesta, aquí está el contenido original:',
        apiKeyNotSetAudio: 'Clave API no configurada, no se puede reproducir el audio',
        languageSelector: 'Idioma',
        continuePrayer: 'Continuar con una oración más larga',
        prayerLabel: 'Oración'
    }
};

// Get the current language or default to Traditional Chinese
function getCurrentLanguage() {
    return localStorage.getItem('preferredLanguage') || 'zh-Hant';
}

// Set the current language
function setCurrentLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    updatePageLanguage();
}

// Get a translated string
function t(key, replacements = {}) {
    const lang = getCurrentLanguage();
    const text = translations[lang][key] || translations['zh-Hant'][key] || key;
    
    // Replace any placeholders in the text
    return Object.keys(replacements).reduce((str, placeholder) => {
        return str.replace(`{${placeholder}}`, replacements[placeholder]);
    }, text);
}

// Update the page language
function updatePageLanguage() {
    const lang = getCurrentLanguage();
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update page title
    document.title = t('title');
    
    // Update main heading
    const mainHeading = document.querySelector('h1');
    if (mainHeading) {
        mainHeading.textContent = t('title');
    }
    
    // Update back button
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.textContent = t('backButton');
    }
    
    // Update any existing emotion buttons
    updateEmotionButtons();
    
    // Update verse content if it exists
    updateVerseContent();
    
    // Update voice selector if it exists
    updateVoiceSelector();
    //c3
    updateMusicButton();
  updateMusicTypeOptions(currentLanguage);
   updateMusicTitle(currentLanguage);
    updateMusicTypeLabel(currentLanguage);
    updateVolumeLabel(currentLanguage);
    updatePlayPauseButton(currentLanguage);
    updateTTSVoiceOptions(currentLanguage);
    updateMusicControlsLanguage(currentLanguage);
}

// Update emotion buttons with translated text
function updateEmotionButtons() {
    const mainEmotions = document.getElementById('mainEmotions');
    if (!mainEmotions) return;
    
    // Check if we're in the custom emotion input view
    const customInput = document.getElementById('customEmotionInput');
    if (customInput) {
        // Update the custom emotion input view
        const label = mainEmotions.querySelector('p');
        if (label) label.textContent = t('customEmotionLabel');
        
        const submitBtn = mainEmotions.querySelector('button:nth-of-type(1)');
        if (submitBtn) submitBtn.textContent = t('submitButton');
        
        const resetBtn = mainEmotions.querySelector('button:nth-of-type(2)');
        if (resetBtn) resetBtn.textContent = t('resetButton');
        
        return;
    }
    
    // Update regular emotion buttons
    const buttons = mainEmotions.querySelectorAll('button');
    buttons.forEach(btn => {
        if (btn.textContent === '我有其他狀況' || 
            btn.textContent === '我有其他状况' || 
            btn.textContent === 'I have another situation' ||
            btn.textContent === '他の状況があります' ||
            btn.textContent === '다른 상황이 있어요' ||
            btn.textContent === 'Ich habe eine andere Situation' ||
            btn.textContent === 'J\'ai une autre situation' ||
            btn.textContent === 'Ho un\'altra situazione' ||
            btn.textContent === 'Ik heb een andere situatie') {
            btn.textContent = t('otherSituation');
        }
    });
}

// Update verse content with translated text
function updateVerseContent() {
    const verseElement = document.getElementById('verse');
    if (!verseElement || verseElement.innerHTML.trim() === '') return;
    
    // Check if we're in the loading state
    if (verseElement.textContent.includes('正在尋找合適的經文') || 
        verseElement.textContent.includes('正在寻找合适的经文') || 
        verseElement.textContent.includes('Finding appropriate scripture') ||
        verseElement.textContent.includes('適切な聖書の言葉を探しています') ||
        verseElement.textContent.includes('적절한 성경 구절을 찾는 중') ||
        verseElement.textContent.includes('Suche nach passender Bibelstelle') ||
        verseElement.textContent.includes('Recherche d\'un verset approprié') ||
        verseElement.textContent.includes('Ricerca di un versetto appropriato') ||
        verseElement.textContent.includes('Zoeken naar een passend vers')) {
        verseElement.innerHTML = t('loadingVerse');
        return;
    }
    
    // Check if we're in the error state
    if (verseElement.textContent.includes('API金鑰未設置') || 
        verseElement.textContent.includes('API密钥未设置') || 
        verseElement.textContent.includes('API key not set') ||
        verseElement.textContent.includes('APIキーが設定されていません') ||
        verseElement.textContent.includes('API 키가 설정되지 않았습니다') ||
        verseElement.textContent.includes('API-Schlüssel nicht gesetzt') ||
        verseElement.textContent.includes('Clé API non définie') ||
        verseElement.textContent.includes('Chiave API non impostata') ||
        verseElement.textContent.includes('API-sleutel niet ingesteld')) {
        verseElement.innerHTML = t('apiKeyNotSet');
        return;
    }
    
    if (verseElement.textContent.includes('獲取經文時出錯') || 
        verseElement.textContent.includes('获取经文时出错') || 
        verseElement.textContent.includes('Error getting scripture') ||
        verseElement.textContent.includes('聖書の言葉の取得中にエラーが発生しました') ||
        verseElement.textContent.includes('성경 구절을 가져오는 중 오류가 발생했습니다') ||
        verseElement.textContent.includes('Fehler beim Abrufen der Bibelstelle') ||
        verseElement.textContent.includes('Erreur lors de la récupération des écritures') ||
        verseElement.textContent.includes('Errore durante il recupero delle scritture') ||
        verseElement.textContent.includes('Fout bij het ophalen van schrift')) {
        verseElement.innerHTML = t('errorGettingVerse');
        return;
    }
    
    // If we have a full verse display, update the labels but keep the content
    const h3 = verseElement.querySelector('h3');
    if (h3) {
        // Extract the emotion from the heading
        const emotionMatch = h3.textContent.match(/「(.+?)」/) || h3.textContent.match(/"(.+?)"/);
        const emotion = emotionMatch ? emotionMatch[1] : '';
        
        h3.textContent = t('verseForEmotion', { emotion });
    }
    
    // Update the scripture, explanation, and prayer labels
    const paragraphs = verseElement.querySelectorAll('p');
    if (paragraphs.length >= 3) {
        const scriptureStrong = paragraphs[0].querySelector('strong');
        if (scriptureStrong) scriptureStrong.textContent = t('scripture');
        
        const explanationStrong = paragraphs[1].querySelector('strong');
        if (explanationStrong) explanationStrong.textContent = t('explanation');
        
        const prayerStrong = paragraphs[2].querySelector('strong');
        if (prayerStrong) prayerStrong.textContent = t('prayer');
    }
    
    // Update the play button text
    const playButton = document.getElementById('play-text');
    if (playButton) playButton.textContent = t('playPrayer');
    
    const loadingSpinner = document.getElementById('loading-spinner');
    if (loadingSpinner) loadingSpinner.textContent = t('generatingAudio');
    
    // Update voice selector label
    const voiceSelectorLabel = document.getElementById('voice-selector-label');
    if (voiceSelectorLabel) voiceSelectorLabel.textContent = t('voiceSelector') + ':';
}

// Update voice selector with translated text
function updateVoiceSelector() {
    const voiceSelector = document.getElementById('voice-selector');
    if (!voiceSelector) return;
    
    // Update voice options
    Array.from(voiceSelector.options).forEach(option => {
        const voiceKey = option.value.toLowerCase();
        if (translations[getCurrentLanguage()][voiceKey]) {
            option.textContent = translations[getCurrentLanguage()][voiceKey];
        }
    });
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', updatePageLanguage);
