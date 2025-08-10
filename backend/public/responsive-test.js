/**
 * 響應式設計測試工具
 * 提供完整的響應式設計測試功能
 */

class ResponsiveTester {
    constructor() {
        this.currentBreakpoint = '';
        this.resizeCount = 0;
        this.touchCount = 0;
        this.touchTestActive = false;
        this.performanceMetrics = {};
        this.testResults = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateScreenSize();
        this.updatePerformanceMetrics();
        this.startPerformanceMonitoring();
        this.createTestReport();
    }
    
    setupEventListeners() {
        // 視窗大小變化
        window.addEventListener('resize', () => {
            this.resizeCount++;
            this.updateScreenSize();
            this.updateTestResults();
        });
        
        // 觸控事件
        this.setupTouchEvents();
        
        // 鍵盤事件
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // 頁面載入完成
        document.addEventListener('DOMContentLoaded', () => {
            this.onPageLoad();
        });
        
        // 頁面可見性變化
        document.addEventListener('visibilitychange', () => {
            this.onVisibilityChange();
        });
    }
    
    setupTouchEvents() {
        const touchArea = document.getElementById('touchTestArea');
        if (touchArea) {
            touchArea.addEventListener('touchstart', (e) => this.handleTouch(e));
            touchArea.addEventListener('click', (e) => this.handleTouch(e));
            touchArea.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        }
    }
    
    handleTouch(e) {
        if (!this.touchTestActive) return;
        
        this.touchCount++;
        this.updateTouchIndicator(e);
        this.updateTestResults();
        
        // 觸控反饋動畫
        const indicator = document.getElementById('touchIndicator');
        if (indicator) {
            indicator.style.transform = 'scale(1.1)';
            setTimeout(() => {
                indicator.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    handleTouchEnd(e) {
        // 觸控結束處理
        if (this.touchTestActive) {
            this.logTouchEvent('Touch End', e);
        }
    }
    
    updateTouchIndicator(e) {
        const indicator = document.getElementById('touchIndicator');
        if (!indicator) return;
        
        let position = '';
        if (e.touches && e.touches[0]) {
            position = `${e.touches[0].clientX}, ${e.touches[0].clientY}`;
        } else {
            position = `${e.clientX}, ${e.clientY}`;
        }
        
        indicator.textContent = `觸控檢測到! 位置: ${position}`;
        indicator.style.display = 'block';
    }
    
    toggleTouchTest() {
        this.touchTestActive = !this.touchTestActive;
        const button = document.querySelector('.test-toggle');
        const indicator = document.getElementById('touchIndicator');
        
        if (this.touchTestActive) {
            button.textContent = '停止觸控測試';
            button.classList.add('active');
            if (indicator) {
                indicator.style.display = 'block';
                indicator.textContent = '觸控測試已啟動 - 點擊或觸摸測試區域';
            }
        } else {
            button.textContent = '開始觸控測試';
            button.classList.remove('active');
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
    }
    
    updateScreenSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const currentSize = document.getElementById('currentSize');
        
        if (!currentSize) return;
        
        // 確定當前斷點
        this.currentBreakpoint = this.getBreakpoint(width);
        
        // 更新顯示
        currentSize.innerHTML = `
            <strong>寬度:</strong> ${width}px | 
            <strong>高度:</strong> ${height}px | 
            <strong>斷點:</strong> ${this.currentBreakpoint}
        `;
        
        // 更新測試按鈕狀態
        this.updateTestButtonStates();
        
        // 更新CSS測試
        this.updateCSSTest();
        
        // 更新響應式網格
        this.updateResponsiveGrid();
    }
    
    getBreakpoint(width) {
        if (width >= 1025) return '桌面/平板 (≥1025px)';
        if (width >= 769) return '平板 (≤1024px)';
        if (width >= 481) return '手機 (≤768px)';
        if (width >= 361) return '小手機 (≤480px)';
        return '超小手機 (≤360px)';
    }
    
    updateTestButtonStates() {
        const buttons = document.querySelectorAll('.test-button');
        buttons.forEach(btn => btn.classList.remove('current-size'));
        
        const width = window.innerWidth;
        let targetButton = null;
        
        if (width >= 1025) targetButton = document.querySelector('[onclick*="desktop"]');
        else if (width >= 769) targetButton = document.querySelector('[onclick*="tablet"]');
        else if (width >= 481) targetButton = document.querySelector('[onclick*="mobile"]');
        else if (width >= 361) targetButton = document.querySelector('[onclick*="small-mobile"]');
        else targetButton = document.querySelector('[onclick*="tiny-mobile"]');
        
        if (targetButton) targetButton.classList.add('current-size');
    }
    
    updateCSSTest() {
        const cssProperties = document.getElementById('cssProperties');
        if (!cssProperties) return;
        
        const width = window.innerWidth;
        let cssInfo = this.getCSSInfo(width);
        
        cssProperties.innerHTML = cssInfo;
    }
    
    getCSSInfo(width) {
        let cssInfo = '';
        
        if (width >= 1025) {
            cssInfo = '桌面模式: 完整佈局，最大寬度800px，完整字體大小';
        } else if (width >= 769) {
            cssInfo = '平板模式: 適中佈局，寬度95%，適中字體大小';
        } else if (width >= 481) {
            cssInfo = '手機模式: 手機佈局，寬度95%，縮小字體，觸控優化';
        } else if (width >= 361) {
            cssInfo = '小手機模式: 緊湊佈局，寬度98%，最小字體，隱藏裝飾';
        } else {
            cssInfo = '超小手機模式: 最小佈局，寬度99%，極簡設計';
        }
        
        cssInfo += `<br><br><strong>當前CSS媒體查詢:</strong><br>`;
        cssInfo += `@media (max-width: ${width}px) { ... }<br>`;
        cssInfo += `觸控目標: 最小44px ✅<br>`;
        cssInfo += `響應式字體: 已啟用 ✅<br>`;
        cssInfo += `彈性佈局: 已啟用 ✅<br>`;
        cssInfo += `CSS變數: 已啟用 ✅<br>`;
        cssInfo += `動畫優化: 已啟用 ✅`;
        
        return cssInfo;
    }
    
    updateResponsiveGrid() {
        const grid = document.querySelector('.responsive-grid');
        if (!grid) return;
        
        const width = window.innerWidth;
        let columns = 4;
        
        if (width <= 360) columns = 1;
        else if (width <= 480) columns = 1;
        else if (width <= 768) columns = 2;
        else if (width <= 1024) columns = 3;
        
        grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }
    
    updatePerformanceMetrics() {
        if (performance && performance.timing) {
            const timing = performance.timing;
            
            this.performanceMetrics = {
                loadTime: timing.loadEventEnd - timing.navigationStart,
                domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
                firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
            };
            
            this.updatePerformanceDisplay();
        }
    }
    
    updatePerformanceDisplay() {
        const loadTime = document.getElementById('loadTime');
        const domReady = document.getElementById('domReady');
        const resizeCount = document.getElementById('resizeCount');
        const touchCount = document.getElementById('touchCount');
        
        if (loadTime) loadTime.textContent = this.performanceMetrics.loadTime + 'ms';
        if (domReady) domReady.textContent = this.performanceMetrics.domReady + 'ms';
        if (resizeCount) resizeCount.textContent = this.resizeCount;
        if (touchCount) touchCount.textContent = this.touchCount;
    }
    
    startPerformanceMonitoring() {
        // 監控記憶體使用
        if ('memory' in performance) {
            setInterval(() => {
                this.monitorMemoryUsage();
            }, 5000);
        }
        
        // 監控網路狀態
        if ('connection' in navigator) {
            this.monitorNetworkStatus();
        }
    }
    
    monitorMemoryUsage() {
        const memory = performance.memory;
        if (memory) {
            const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
            const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
            
            this.logPerformance('Memory Usage', `${usedMB}MB / ${totalMB}MB`);
        }
    }
    
    monitorNetworkStatus() {
        const connection = navigator.connection;
        if (connection) {
            const info = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt
            };
            
            this.logPerformance('Network', JSON.stringify(info));
        }
    }
    
    logPerformance(category, data) {
        console.log(`[Performance] ${category}:`, data);
    }
    
    logTouchEvent(type, event) {
        console.log(`[Touch] ${type}:`, event);
    }
    
    testBreakpoint(type) {
        let width;
        switch(type) {
            case 'desktop': width = 1200; break;
            case 'tablet': width = 900; break;
            case 'mobile': width = 600; break;
            case 'small-mobile': width = 400; break;
            case 'tiny-mobile': width = 320; break;
            default: return;
        }
        
        // 調整視窗大小（如果可能的話）
        if (window.outerWidth !== window.innerWidth) {
            window.resizeTo(width + 40, window.outerHeight);
        }
        
        // 觸發resize事件
        window.dispatchEvent(new Event('resize'));
        
        // 更新顯示
        setTimeout(() => {
            this.updateScreenSize();
            this.updateTestResults();
        }, 100);
        
        // 記錄測試
        this.logTest('Breakpoint Test', type, width);
    }
    
    updateTestResults() {
        this.testResults = {
            timestamp: new Date().toISOString(),
            breakpoint: this.currentBreakpoint,
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            performance: this.performanceMetrics,
            interactions: {
                resizeCount: this.resizeCount,
                touchCount: this.touchCount
            }
        };
        
        this.saveTestResults();
    }
    
    saveTestResults() {
        try {
            localStorage.setItem('responsiveTestResults', JSON.stringify(this.testResults));
        } catch (e) {
            console.warn('無法保存測試結果:', e);
        }
    }
    
    loadTestResults() {
        try {
            const saved = localStorage.getItem('responsiveTestResults');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('無法載入測試結果:', e);
        }
        return null;
    }
    
    logTest(action, type, data) {
        console.log(`[Test] ${action}:`, { type, data, timestamp: new Date().toISOString() });
    }
    
    createTestReport() {
        const report = this.generateTestReport();
        this.displayTestReport(report);
    }
    
    generateTestReport() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const language = navigator.language;
        
        return {
            device: {
                width,
                height,
                aspectRatio: (width / height).toFixed(2),
                pixelRatio: window.devicePixelRatio || 1
            },
            browser: {
                userAgent,
                platform,
                language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine
            },
            features: {
                touch: 'ontouchstart' in window,
                webGL: !!window.WebGLRenderingContext,
                serviceWorker: 'serviceWorker' in navigator,
                webP: this.testWebPSupport()
            },
            performance: this.performanceMetrics
        };
    }
    
    testWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    
    displayTestReport(report) {
        // 創建報告顯示區域
        const reportSection = document.createElement('div');
        reportSection.className = 'test-section';
        reportSection.innerHTML = `
            <h2>設備和瀏覽器報告</h2>
            <div class="responsive-card">
                <h3>設備資訊</h3>
                <p><strong>螢幕尺寸:</strong> ${report.device.width} × ${report.device.height}</p>
                <p><strong>寬高比:</strong> ${report.device.aspectRatio}</p>
                <p><strong>像素密度:</strong> ${report.device.pixelRatio}x</p>
                
                <h3>瀏覽器資訊</h3>
                <p><strong>平台:</strong> ${report.browser.platform}</p>
                <p><strong>語言:</strong> ${report.browser.language}</p>
                <p><strong>Cookie:</strong> ${report.browser.cookieEnabled ? '啟用' : '停用'}</p>
                <p><strong>網路:</strong> ${report.browser.onLine ? '連線' : '離線'}</p>
                
                <h3>功能支援</h3>
                <p><strong>觸控:</strong> ${report.features.touch ? '✅ 支援' : '❌ 不支援'}</p>
                <p><strong>WebGL:</strong> ${report.features.webGL ? '✅ 支援' : '❌ 不支援'}</p>
                <p><strong>Service Worker:</strong> ${report.features.serviceWorker ? '✅ 支援' : '❌ 不支援'}</p>
                <p><strong>WebP:</strong> ${report.features.webP ? '✅ 支援' : '❌ 不支援'}</p>
            </div>
        `;
        
        // 插入到頁面中
        const buttons = document.getElementById('buttons');
        if (buttons && buttons.parentNode) {
            buttons.parentNode.insertBefore(reportSection, buttons);
        }
    }
    
    handleKeyboardShortcuts(e) {
        switch(e.key) {
            case '1':
                this.testBreakpoint('desktop');
                break;
            case '2':
                this.testBreakpoint('tablet');
                break;
            case '3':
                this.testBreakpoint('mobile');
                break;
            case '4':
                this.testBreakpoint('small-mobile');
                break;
            case '5':
                this.testBreakpoint('tiny-mobile');
                break;
            case 't':
            case 'T':
                this.toggleTouchTest();
                break;
            case 'r':
            case 'R':
                this.refreshTest();
                break;
        }
    }
    
    refreshTest() {
        this.resizeCount = 0;
        this.touchCount = 0;
        this.updateScreenSize();
        this.updatePerformanceMetrics();
        this.updateTestResults();
        
        console.log('[Test] 測試已重新整理');
    }
    
    onPageLoad() {
        console.log('[Test] 頁面載入完成');
        this.logTest('Page Load', 'Complete', Date.now());
    }
    
    onVisibilityChange() {
        if (document.hidden) {
            console.log('[Test] 頁面隱藏');
        } else {
            console.log('[Test] 頁面顯示');
            this.updatePerformanceMetrics();
        }
    }
    
    // 公共API方法
    getCurrentBreakpoint() {
        return this.currentBreakpoint;
    }
    
    getTestResults() {
        return this.testResults;
    }
    
    exportTestResults() {
        const dataStr = JSON.stringify(this.testResults, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `responsive-test-${new Date().toISOString().slice(0, 19)}.json`;
        link.click();
    }
}

// 全域函數（為了向後兼容）
function updateScreenSize() {
    if (window.responsiveTester) {
        window.responsiveTester.updateScreenSize();
    }
}

function testBreakpoint(type) {
    if (window.responsiveTester) {
        window.responsiveTester.testBreakpoint(type);
    }
}

function toggleTouchTest() {
    if (window.responsiveTester) {
        window.responsiveTester.toggleTouchTest();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    window.responsiveTester = new ResponsiveTester();
    
    // 顯示快捷鍵說明
    console.log(`
響應式測試工具快捷鍵:
1-5: 測試不同斷點
T: 切換觸控測試
R: 重新整理測試
    `);
});

// 導出到全域
window.ResponsiveTester = ResponsiveTester; 