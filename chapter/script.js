// ==========================================
// グローバル状態・定数
// ==========================================
const CATEGORIES = [
    "オープニング", "ビタミンメッセージ", "KBC情報", "お知らせ",
    "教育唱歌", "パロディ", "国内ニュース", "海外ニュース",
    "ゲストコーナー", "インタビュー", "励ましソング", "クライマックストーク", "エンディングソング"
];
let parsedChapters = []; // チャプター変換ツール用

let mode = 'none'; // プレイヤーモード: 'local', 'embed', 'remote'
let timeDisplayMode = 'normal'; // 'normal' or 'remaining'
let clickTimer = null; // ダブルクリック検知用
let isExtensionConnected = false;

// ==========================================
// DOM要素の取得
// ==========================================
// --- 共通 / 変換ツール ---
const convertBtn = document.getElementById('convert-btn');
const clearBtn = document.getElementById('clear-btn');
const uploadBtn = document.getElementById('upload-btn');
const uploadRawCsv = document.getElementById('upload-raw-csv');
const copyBtn = document.getElementById('copy-btn');
const downloadCsvBtn = document.getElementById('download-csv-btn');
const downloadTsBtn = document.getElementById('download-ts-btn');
const downloadRawCsvBtn = document.getElementById('download-raw-csv-btn');
const chapterInput = document.getElementById('chapter-input');
const chapterListOutput = document.getElementById('chapter-list-output');
const typescriptOutput = document.getElementById('typescript-output');
const outputSection = document.getElementById('output-section');
const detailedOutputSection = document.getElementById('detailed-output-section');
const rawDataSection = document.getElementById('raw-data-section');
const detailedTableBody = document.getElementById('detailed-table-body');
const episodeInfoOutput = document.getElementById('episode-info-output');
const rawChapterOutput = document.getElementById('raw-chapter-output');
const errorMessage = document.getElementById('error-message');
const episodeNumberInput = document.getElementById('episode-number');
const publishDateInput = document.getElementById('publish-date');
const chatTimeInput = document.getElementById('chat-time');
const youtubeLinkInput = document.getElementById('youtube-link');
const youtubeStartInput = document.getElementById('youtube-start');
const rumbleLinkInput = document.getElementById('rumble-link');
const rumbleStartInput = document.getElementById('rumble-start');
const rumbleOffsetsContainer = document.getElementById('rumble-offsets-container');
const addOffsetBtn = document.getElementById('add-offset-btn');
const backToTopButton = document.getElementById('back-to-top');
const incrementEpisodeBtn = document.getElementById('increment-episode');
const decrementEpisodeBtn = document.getElementById('decrement-episode');
const syncClimaxTimeBtn = document.getElementById('sync-climax-time-btn');
const toggleAdditionalData = document.getElementById('toggle-additional-data');

// --- 拡張機能連携 ---
const extStatus = document.getElementById('ext-status');
const extIndicator = document.getElementById('ext-indicator');
const captureTabBtn = document.getElementById('capture-tab-btn');
const extensionStatusNotice = document.getElementById('extensionStatus');

// --- サムネイル・プレイヤー ---
const playerSection = document.getElementById('playerSection');
const videoFileInput = document.getElementById('videoFile');
const clearVideoFileBtn = document.getElementById('clear-video-file');

const videoPlayer = document.getElementById('videoPlayer');
const youtubeEmbed = document.getElementById('youtubeEmbed');
const remotePlaceholder = document.getElementById('remotePlaceholder');
const localControls = document.getElementById('localControls');
const embedNotice = document.getElementById('embedNotice');

// プレイヤーコントロール
const btnPlayPause = document.getElementById('btnPlayPause');
const iconPlay = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressThumb = document.getElementById('progressThumb');
const progressPreview = document.getElementById('progressPreview');
const previewCanvas = document.getElementById('previewCanvas');
const previewTime = document.getElementById('previewTime');
const previewCtx = previewCanvas.getContext('2d');
const timeDisplay = document.getElementById('timeDisplay');
const volumeButton = document.getElementById('volumeButton');
const iconVolHigh = document.getElementById('iconVolHigh');
const iconVolLow = document.getElementById('iconVolLow');
const iconVolMute = document.getElementById('iconVolMute');
const volumeSlider = document.getElementById('volumeSlider');
const playbackRateButton = document.getElementById('playbackRateButton');
const playbackRateMenu = document.getElementById('playbackRateMenu');
const fullscreenButton = document.getElementById('fullscreenButton');
const skipOverlayLeft = document.getElementById('skipOverlayLeft');
const skipOverlayRight = document.getElementById('skipOverlayRight');
const togglePlayOverlay = document.getElementById('togglePlayOverlay');
const centralPlayContainer = document.getElementById('centralPlayContainer');
const captureCurrentFrameButton = document.getElementById('captureCurrentFrameButton');

// ギャラリー・チャプターリスト
const currentChapterTitle = document.getElementById('currentChapterTitle');
const chapterListDiv = document.getElementById('chapterList');
const countDisplay = document.getElementById('countDisplay');
const resultDiv = document.getElementById('result');
const emptyState = document.getElementById('emptyState');
const clearScreenshotsBtn = document.getElementById('clear-screenshots-btn');

// ダウンロードアクション
const downloadAllContainer = document.getElementById('downloadAllContainer');
const downloadWidthInput = document.getElementById('downloadWidth');
const exportJsonButton = document.getElementById('exportJsonButton');
const importJsonInput = document.getElementById('importJsonInput');
const importJsonWrapper = document.getElementById('importJsonWrapper');
const downloadAllButton = document.getElementById('downloadAllButton');

// サムネイル生成用の非表示動画プレイヤー
const thumbnailVideoPlayer = document.createElement('video');
thumbnailVideoPlayer.muted = true;
thumbnailVideoPlayer.playsInline = true;
thumbnailVideoPlayer.preload = 'auto';


// ==========================================
// ユーティリティ関数
// ==========================================
function copyExtensionUrl(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand("copy");
        alert(`URLをコピーしました: ${text}\nブラウザのアドレスバーに貼り付けて移動してください。`);
    } catch (err) {
        prompt("以下のURLをコピーしてください:", text);
    }
    document.body.removeChild(textarea);
}

// H:M:S -> Seconds
function timeToSeconds(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':').map(part => parseInt(part.trim(), 10));
    let seconds = 0;
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
    return isNaN(seconds) ? 0 : seconds;
}

// Seconds -> H:M:S (チャプターツール用, 常にH:M:S)
function secondsToTime(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
}

// Seconds -> M:S or H:M:S (サムネイルツール表示用)
function thumbSecondsToTimecode(totalSeconds) {
    if (isNaN(totalSeconds)) return "0:00";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeJsString(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
}

function sanitizeTag(str) {
    if (typeof str !== 'string') return '';
    let s = str.replace(/‼️/g, '!!').replace(/❗️/g, '!').replace(/⁉️/g, '!?').replace(/❓/g, '?');
    const emojiRegex = /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{FE0F}]/gu;
    const leftoversRegex = /[\u{200D}]/gu;
    return s.replace(emojiRegex, '').replace(leftoversRegex, '').trim();
}

const resizeImage = (dataUrl, width) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ratio = img.height / img.width;
            canvas.width = width;
            canvas.height = width * ratio;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png'));
        };
        img.src = dataUrl;
    });
};

// ==========================================
// 初期化
// ==========================================
publishDateInput.value = new Date().toISOString().split('T')[0];

// ==========================================
// 拡張機能連携
// ==========================================
window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    // 接続確認
    if (event.data.type === "EXTENSION_CONNECTED") {
        isExtensionConnected = true;
        extStatus.querySelector('span:last-child').textContent = "拡張機能: 接続済み";
        extStatus.classList.replace('bg-gray-200', 'bg-green-100');
        extStatus.classList.replace('text-gray-600', 'text-green-800');
        extIndicator.classList.replace('bg-gray-400', 'bg-green-500');
        captureTabBtn.classList.remove('hidden');
        extensionStatusNotice.classList.remove('hidden');
        
        // 接続を分かりやすくするアニメーション
        const mainContainer = document.getElementById('main-container');
        if(mainContainer) {
            mainContainer.classList.add('connection-active');
            setTimeout(() => mainContainer.classList.remove('connection-active'), 2000);
        }
    }

    // 画像受信
    if (event.data.type === "NEW_SCREENSHOT") {
        const payload = event.data.payload;
        processAndAddScreenshot(payload.dataUrl, payload.timecode, payload.sourceTitle);
    }
    
    // エラー受信
    if (event.data.type === "CAPTURE_ERROR") {
        alert("スクリーンショットの取得に失敗しました。\n対象のタブが見つからないか、動画が読み込まれていません。");
    }
});

// 撮影トリガー
captureCurrentFrameButton.addEventListener('click', () => {
    if (mode === 'embed') {
        if (!isExtensionConnected) {
            alert("拡張機能が接続されていません。\nChrome等に拡張機能をインストールしてください。");
            return;
        }
        window.postMessage({ type: "TRIGGER_EMBEDDED_CAPTURE" }, "*");
    } else if (mode === 'remote') {
        if (!isExtensionConnected) {
            alert("拡張機能が接続されていません。");
            return;
        }
        window.postMessage({ type: "TRIGGER_EXTENSION_CAPTURE", targetUrl: youtubeLinkInput.value || rumbleLinkInput.value }, "*");
    } else if (mode === 'local') {
        if (!videoPlayer.src || videoPlayer.readyState < 2) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoPlayer.videoWidth;
        canvas.height = videoPlayer.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
        processAndAddScreenshot(canvas.toDataURL('image/png'), thumbSecondsToTimecode(videoPlayer.currentTime), "Local");
    }
});

captureTabBtn.addEventListener('click', () => {
    if (isExtensionConnected) {
        const targetUrl = youtubeLinkInput.value || rumbleLinkInput.value;
        if (!targetUrl) {
            alert("YouTubeまたはRumbleのリンクを入力してください。");
            return;
        }
        window.postMessage({ type: "TRIGGER_EXTENSION_CAPTURE", targetUrl: targetUrl }, "*");
    }
});


// ==========================================
// 動画ソース・プレイヤーの制御
// ==========================================

function updatePlayerSource() {
    // ローカルファイルが優先
    if (videoFileInput.files.length > 0) {
        return; // ローカルモード維持
    }

    const url = youtubeLinkInput.value.trim();
    const rumbleUrl = rumbleLinkInput.value.trim();

    if (!url && !rumbleUrl) {
        playerSection.classList.add('hidden');
        mode = 'none';
        return;
    }

    playerSection.classList.remove('hidden');
    videoPlayer.classList.add('hidden');
    videoPlayer.pause();
    localControls.classList.add('hidden');
    skipOverlayLeft.classList.add('hidden');
    skipOverlayRight.classList.add('hidden');
    togglePlayOverlay.classList.add('hidden');
    centralPlayContainer.classList.add('hidden');

    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const ytMatch = url.match(ytRegExp);

    if (ytMatch && ytMatch[2].length == 11) {
        const videoId = ytMatch[2];
        mode = 'embed';
        youtubeEmbed.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
        youtubeEmbed.classList.remove('hidden');
        remotePlaceholder.classList.add('hidden');
        embedNotice.textContent = "※ YouTube埋め込み動画の撮影には拡張機能が必要です。";
        embedNotice.classList.remove('hidden');
    } else if (rumbleUrl.includes('rumble.com') || url.includes('rumble.com')) {
        mode = 'remote';
        youtubeEmbed.classList.add('hidden');
        remotePlaceholder.classList.remove('hidden');
        embedNotice.textContent = "※ 連携モードの撮影には拡張機能が必要です。別タブを撮影してください。";
        embedNotice.classList.remove('hidden');
    } else {
        youtubeEmbed.classList.add('hidden');
        remotePlaceholder.classList.add('hidden');
        mode = 'none';
    }
}

youtubeLinkInput.addEventListener('input', updatePlayerSource);
rumbleLinkInput.addEventListener('input', updatePlayerSource);

videoFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        mode = 'local';
        const videoUrl = URL.createObjectURL(file);
        videoPlayer.src = videoUrl;
        thumbnailVideoPlayer.src = videoUrl;

        playerSection.classList.remove('hidden');
        videoPlayer.classList.remove('hidden');
        youtubeEmbed.classList.add('hidden');
        remotePlaceholder.classList.add('hidden');

        localControls.classList.remove('hidden');
        skipOverlayLeft.classList.remove('hidden');
        skipOverlayRight.classList.remove('hidden');
        togglePlayOverlay.classList.remove('hidden');
        centralPlayContainer.classList.remove('hidden');

        embedNotice.classList.add('hidden');
        clearVideoFileBtn.classList.remove('hidden');
        updateCurrentChapterDisplay();
    }
});

clearVideoFileBtn.addEventListener('click', () => {
    videoFileInput.value = '';
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    thumbnailVideoPlayer.removeAttribute('src');
    clearVideoFileBtn.classList.add('hidden');
    updatePlayerSource(); // YouTubeプレビューに戻る
});


// --- プレイヤーUIの更新関数 ---
const updatePlayPauseUI = () => {
    if (videoPlayer.paused) {
        iconPlay.classList.remove('hidden');
        iconPause.classList.add('hidden');
        centralPlayContainer.classList.remove('hidden');
    } else {
        iconPlay.classList.add('hidden');
        iconPause.classList.remove('hidden');
        centralPlayContainer.classList.add('hidden');
    }
};

const updateVolumeIcon = () => {
    if (!iconVolHigh || !iconVolMute) return;
    iconVolHigh.classList.add('hidden');
    iconVolLow.classList.add('hidden');
    iconVolMute.classList.add('hidden');

    if (videoPlayer.muted || videoPlayer.volume === 0) {
        iconVolMute.classList.remove('hidden');
    } else if (videoPlayer.volume > 0.5) {
        iconVolHigh.classList.remove('hidden');
    } else {
        iconVolLow.classList.remove('hidden');
    }
};

const updateTimeDisplay = () => {
    if (isNaN(videoPlayer.duration)) {
        timeDisplay.textContent = '0:00 / 0:00';
        return;
    }
    if (timeDisplayMode === 'normal') {
        timeDisplay.textContent = `${thumbSecondsToTimecode(videoPlayer.currentTime)} / ${thumbSecondsToTimecode(videoPlayer.duration)}`;
    } else {
        timeDisplay.textContent = `-${thumbSecondsToTimecode(videoPlayer.duration - videoPlayer.currentTime)}`;
    }
    const progressPercent = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    progressFill.style.width = `${progressPercent}%`;
    progressThumb.style.left = `calc(${progressPercent}% - 8px)`;
};

// --- プレイヤーインタラクション ---
const togglePlay = () => { if (videoPlayer.paused) videoPlayer.play(); else videoPlayer.pause(); };
const handleSkip = (delta) => { if (videoPlayer.src && !isNaN(videoPlayer.duration)) videoPlayer.currentTime = Math.max(0, Math.min(videoPlayer.duration, videoPlayer.currentTime + delta)); };
const handleDoubleClick = (delta) => { clearTimeout(clickTimer); clickTimer = null; handleSkip(delta); };

btnPlayPause.addEventListener('click', togglePlay);
centralPlayContainer.addEventListener('click', togglePlay);
togglePlayOverlay.addEventListener('click', togglePlay);
videoPlayer.addEventListener('play', updatePlayPauseUI);
videoPlayer.addEventListener('pause', updatePlayPauseUI);
videoPlayer.addEventListener('timeupdate', () => { updateTimeDisplay(); updateCurrentChapterDisplay(); });
videoPlayer.addEventListener('loadedmetadata', () => { updatePlayPauseUI(); updateVolumeIcon(); updateCurrentChapterDisplay(); updateTimeDisplay(); });
timeDisplay.addEventListener('click', () => { timeDisplayMode = timeDisplayMode === 'normal' ? 'remaining' : 'normal'; updateTimeDisplay(); });

progressContainer.addEventListener('click', (e) => {
    if (!videoPlayer.src) return;
    const rect = progressContainer.getBoundingClientRect();
    videoPlayer.currentTime = ((e.clientX - rect.left) / rect.width) * videoPlayer.duration;
});

skipOverlayLeft.addEventListener('dblclick', () => handleDoubleClick(-10));
skipOverlayRight.addEventListener('dblclick', () => handleDoubleClick(10));
skipOverlayLeft.addEventListener('click', () => { if (!clickTimer) clickTimer = setTimeout(() => { clickTimer = null; togglePlay(); }, 250); });
skipOverlayRight.addEventListener('click', () => { if (!clickTimer) clickTimer = setTimeout(() => { clickTimer = null; togglePlay(); }, 250); });

document.getElementById('skipBack30s').addEventListener('click', () => handleSkip(-30));
document.getElementById('skipBack10s').addEventListener('click', () => handleSkip(-10));
document.getElementById('skipBack1f').addEventListener('click', () => handleSkip(-1 / 30));
document.getElementById('skipForward1f').addEventListener('click', () => handleSkip(1 / 30));
document.getElementById('skipForward10s').addEventListener('click', () => handleSkip(10));
document.getElementById('skipForward30s').addEventListener('click', () => handleSkip(30));

volumeButton.addEventListener('click', () => { videoPlayer.muted = !videoPlayer.muted; });
volumeSlider.addEventListener('input', (e) => { videoPlayer.volume = e.target.value; videoPlayer.muted = false; });
videoPlayer.addEventListener('volumechange', () => { volumeSlider.value = videoPlayer.muted ? 0 : videoPlayer.volume; updateVolumeIcon(); });

playbackRateButton.addEventListener('click', (e) => { e.stopPropagation(); playbackRateMenu.classList.toggle('hidden'); });
playbackRateMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        videoPlayer.playbackRate = parseFloat(e.target.dataset.speed);
        playbackRateButton.innerText = e.target.innerText;
        playbackRateMenu.classList.add('hidden');
    }
});
document.addEventListener('click', () => { if (!playbackRateMenu.classList.contains('hidden')) playbackRateMenu.classList.add('hidden'); });

fullscreenButton.addEventListener('click', () => {
    const container = document.getElementById('playerContainer');
    if (!document.fullscreenElement) container.requestFullscreen();
    else document.exitFullscreen();
});


// ==========================================
// チャプターリストとシーク機能
// ==========================================

// テキストエリアからタイムコードとタイトルを抽出 (サムネイル・シーク用)
function getThumbChaptersFromText() {
    const text = chapterInput.value;
    const lines = text.split('\n');
    const chapters = [];
    const timecodeRegex = /((?:\d{1,2}:)?\d{1,2}:\d{2})/;

    for (const line of lines) {
        // サニタイズ（全角英数を半角にするなど）を簡易的に行う
        const normalizedLine = line.replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)).replace(/\u3000/g, ' ');
        const match = normalizedLine.match(timecodeRegex);

        if (match) {
            const timecode = match[1];
            const seconds = timeToSeconds(timecode);

            if (seconds > 0 || timecode === "0:00" || timecode === "00:00") {
                const titleStartIdx = match.index + timecode.length;
                let title = normalizedLine.substring(titleStartIdx).trim();
                // 変換ツールのロジックに合わせ、不要なプレフィックスを消す
                title = title.replace(/^(chapter|チャプター)\s*\d+\s*[:：]?\s*/i, '').trim();

                chapters.push({
                    timecode: thumbSecondsToTimecode(seconds),
                    title: title,
                    seconds: seconds
                });
            }
        } else if (chapters.length > 0 && line.trim() && !CATEGORIES.includes(line.trim())) {
            // タイムコードがなく、カテゴリ名でもない場合は前のタイトルに追記
            chapters[chapters.length - 1].title += ' ' + line.trim();
        }
    }
    return chapters;
}

const getChapterIndex = (currentSeconds) => {
    const chapters = getThumbChaptersFromText();
    if (chapters.length === 0) return null;

    let chapterIndex = -1;
    for (let i = chapters.length - 1; i >= 0; i--) {
        if (currentSeconds >= chapters[i].seconds) {
            chapterIndex = i;
            break;
        }
    }
    if (chapterIndex === -1 && currentSeconds < chapters[0].seconds) return -1;
    if (chapterIndex === -1) return 0;
    return chapterIndex;
};

const updateCurrentChapterDisplay = () => {
    if (mode !== 'local' || !videoPlayer.src) return;

    const currentTime = videoPlayer.currentTime;
    const chapters = getThumbChaptersFromText();

    if (chapters.length === 0) {
        currentChapterTitle.textContent = '---';
        return;
    }

    const idx = getChapterIndex(currentTime);
    if (idx !== null && idx >= 0) {
        const indexPadded = idx.toString().padStart(2, '0');
        currentChapterTitle.textContent = `${indexPadded}. ${chapters[idx].title}`;
    } else {
        currentChapterTitle.textContent = '---';
    }
};

const renderChapterList = () => {
    const chapters = getThumbChaptersFromText();
    chapterListDiv.innerHTML = '';

    if (chapters.length === 0) {
        chapterListDiv.innerHTML = '<p class="text-xs text-gray-400">下のチャプター文章に入力してください</p>';
        return;
    }

    chapters.forEach((c, index) => {
        const btn = document.createElement('button');
        btn.className = "w-full text-left text-xs p-1 hover:bg-blue-100 rounded flex gap-2 items-center transition-colors";
        btn.dataset.seconds = c.seconds;
        const idxStr = index.toString().padStart(2, '0');
        btn.innerHTML = `<span class="text-gray-500 font-mono">${idxStr}.</span> <span class="font-mono text-blue-600 font-bold">${c.timecode}</span> <span class="truncate">${c.title}</span>`;
        chapterListDiv.appendChild(btn);
    });
    updateCurrentChapterDisplay();
};

chapterInput.addEventListener('input', renderChapterList);

chapterListDiv.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-seconds]');
    if (!button) return;
    const seconds = parseFloat(button.dataset.seconds);
    if (isNaN(seconds)) return;

    if (mode === 'local') {
        videoPlayer.currentTime = seconds;
        videoPlayer.play();
    } else if (mode === 'embed') {
        if (youtubeEmbed.contentWindow) {
            youtubeEmbed.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] }), '*');
            youtubeEmbed.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
        }
    }
});


// ==========================================
// スクリーンショットギャラリー機能
// ==========================================
function insertTimecodeToTextarea(timecode) {
    const pos = chapterInput.selectionStart;
    const text = chapterInput.value;
    const newText = text.substring(0, pos) + timecode + ' ' + text.substring(pos);
    chapterInput.value = newText;
    chapterInput.focus();
    chapterInput.selectionStart = pos + timecode.length + 1;
    chapterInput.selectionEnd = pos + timecode.length + 1;
    renderChapterList(); // 追加した時間を反映
}

const updateScreenshotCount = () => {
    const count = resultDiv.querySelectorAll('.screenshot-item-container').length;
    countDisplay.textContent = `${count} 枚`;
    if (count === 0) {
        if(emptyState) emptyState.classList.remove('hidden');
        downloadAllContainer.classList.add('hidden');
        importJsonWrapper.style.display = 'block';
    } else {
        if(emptyState) emptyState.classList.add('hidden');
        downloadAllContainer.classList.remove('hidden');
        importJsonWrapper.style.display = 'none';
    }
};

const addScreenshotToGrid = (dataUrl, filename, title, timecode) => {
    if (emptyState) emptyState.classList.add('hidden');
    downloadAllContainer.classList.remove('hidden');
    importJsonWrapper.style.display = 'none';

    // 同一ファイル名があれば上書き（点滅エフェクト）
    const existingItem = document.querySelector(`.screenshot-item-container[data-filename="${filename}"]`);
    if (existingItem) {
        const imgElement = existingItem.querySelector('img');
        imgElement.src = dataUrl;
        existingItem.dataset.dataUrl = dataUrl;
        
        // タイムコードの更新
        const timeBadge = existingItem.querySelector('.time-badge');
        if(timeBadge) timeBadge.textContent = timecode;

        existingItem.classList.remove('fade-in-anim');
        void existingItem.offsetWidth;
        existingItem.classList.add('ring-4', 'ring-green-400', 'transition-all', 'duration-300');
        setTimeout(() => existingItem.classList.remove('ring-4', 'ring-green-400'), 1000);
        return;
    }

    const itemContainer = document.createElement('div');
    itemContainer.className = 'screenshot-item-container flex flex-col gap-1 p-1 bg-white rounded border border-gray-200 fade-in-anim relative group';
    itemContainer.dataset.filename = filename;
    itemContainer.dataset.dataUrl = dataUrl;

    const imgContainer = document.createElement('div');
    imgContainer.className = 'aspect-video bg-gray-100 rounded screenshot-img-container';

    const imgElement = document.createElement('img');
    imgElement.src = dataUrl;
    imgElement.className = 'w-full h-full object-cover';

    // オーバーレイ (ホバー時に表示されるボタン群)
    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 hover-overlay';
    
    const timeBadge = document.createElement('div');
    timeBadge.className = 'time-badge absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1.5 py-0.5 rounded font-mono pointer-events-none z-10';
    timeBadge.textContent = timecode;

    const insertBtn = document.createElement('button');
    insertBtn.className = 'bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold py-1.5 px-3 rounded shadow';
    insertBtn.textContent = '時間を挿入';
    insertBtn.onclick = (e) => {
        e.stopPropagation();
        insertTimecodeToTextarea(timecode);
    };

    const delBtn = document.createElement('button');
    delBtn.className = 'absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shadow';
    delBtn.innerHTML = '×';
    delBtn.onclick = (e) => {
        e.stopPropagation();
        itemContainer.remove();
        updateScreenshotCount();
    };

    overlay.appendChild(insertBtn);
    overlay.appendChild(delBtn);

    const metaContainer = document.createElement('div');
    metaContainer.className = 'flex flex-col gap-1 w-full';

    const filenameLabel = document.createElement('input');
    filenameLabel.type = "text";
    filenameLabel.value = filename.replace('.png', '');
    filenameLabel.className = 'text-[10px] text-gray-600 bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none w-full truncate px-1 rounded';
    filenameLabel.addEventListener('change', (e) => { itemContainer.dataset.filename = e.target.value + '.png'; });

    const downloadButton = document.createElement('button');
    downloadButton.className = 'w-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-[10px] font-bold py-1 rounded transition-colors';
    downloadButton.innerText = "保存する";
    downloadButton.addEventListener('click', async () => {
        const targetWidth = parseInt(downloadWidthInput.value, 10);
        let finalUrl = dataUrl;
        if (targetWidth > 0) finalUrl = await resizeImage(dataUrl, targetWidth);
        const link = document.createElement('a');
        link.href = finalUrl;
        link.download = itemContainer.dataset.filename;
        link.click();
    });

    imgContainer.appendChild(imgElement);
    imgContainer.appendChild(overlay);
    imgContainer.appendChild(timeBadge);
    
    metaContainer.appendChild(filenameLabel);
    metaContainer.appendChild(downloadButton);
    
    itemContainer.appendChild(imgContainer);
    itemContainer.appendChild(metaContainer);

    // アルファベット順（ファイル名順）に挿入
    const items = Array.from(resultDiv.children).filter(el => el.id !== 'emptyState');
    let inserted = false;
    for (let i = 0; i < items.length; i++) {
        if (filename.localeCompare(items[i].dataset.filename) < 0) {
            resultDiv.insertBefore(itemContainer, items[i]);
            inserted = true;
            break;
        }
    }
    if (!inserted) resultDiv.appendChild(itemContainer);

    updateScreenshotCount();
};

const processAndAddScreenshot = (dataUrl, timecode, sourceTitle) => {
    const episodeNum = episodeNumberInput.value || "1";
    const epPadded = episodeNum.toString().padStart(3, '0');
    const seconds = timeToSeconds(timecode);
    const chapterIdx = getChapterIndex(seconds);

    let indexPadded;
    if (chapterIdx !== null && chapterIdx !== -1) {
        indexPadded = chapterIdx.toString().padStart(2, '0');
    } else {
        const items = resultDiv.querySelectorAll('.screenshot-item-container');
        indexPadded = items.length.toString().padStart(2, '0');
    }
    const filename = `cha-tmb-1${epPadded}-${indexPadded}.png`;
    addScreenshotToGrid(dataUrl, filename, `${sourceTitle} @ ${timecode}`, timecode);
};

clearScreenshotsBtn.addEventListener('click', () => {
    if (confirm('すべてのスクリーンショットを削除しますか？')) {
        const items = resultDiv.querySelectorAll('.screenshot-item-container');
        items.forEach(item => item.remove());
        updateScreenshotCount();
    }
});

// ダウンロード・エクスポート
const exportData = () => {
    const items = Array.from(document.querySelectorAll('.screenshot-item-container')).map(i => ({
        filename: i.dataset.filename,
        dataUrl: i.dataset.dataUrl
    }));
    const data = {
        episodeNumber: episodeNumberInput.value,
        chapterInfo: chapterInput.value, // チャプター文章を含める
        screenshots: items
    };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
    const ep = (data.episodeNumber || "000").toString().padStart(3, '0');
    a.download = `thumbnailCF-${ep}.json`;
    a.click();
};

exportJsonButton.addEventListener('click', exportData);

importJsonInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const data = JSON.parse(ev.target.result);
        if(data.episodeNumber) episodeNumberInput.value = data.episodeNumber;
        if(data.chapterInfo) {
            chapterInput.value = data.chapterInfo;
            renderChapterList();
        }
        
        // Clear existing
        const items = resultDiv.querySelectorAll('.screenshot-item-container');
        items.forEach(item => item.remove());
        
        if (data.screenshots && data.screenshots.length > 0) {
            data.screenshots.forEach(s => {
                // Restore timecode from filename if possible, else empty
                const m = s.filename.match(/-(\d{2})\.png$/);
                let tc = "";
                if(m) tc = "idx: " + m[1]; 
                addScreenshotToGrid(s.dataUrl, s.filename, "Imported", tc);
            });
        }
        updateScreenshotCount();
    };
    reader.readAsText(file);
    importJsonInput.value = ""; // reset
});

downloadAllButton.addEventListener('click', async () => {
    const items = document.querySelectorAll('.screenshot-item-container');
    if (items.length === 0) return;
    
    const btn = downloadAllButton;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>作成中...</span>';
    btn.disabled = true;
    
    try {
        const zip = new JSZip();
        const targetWidth = parseInt(downloadWidthInput.value, 10);
        
        for (const item of items) {
            let data = item.dataset.dataUrl;
            if (targetWidth > 0) data = await resizeImage(data, targetWidth);
            // dataUrl の base64部分だけを取り出す
            const base64Data = data.split(',')[1];
            zip.file(item.dataset.filename, base64Data, { base64: true });
        }
        
        const blob = await zip.generateAsync({ type: "blob" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        const ep = (episodeNumberInput.value || "000").toString().padStart(3, '0');
        a.download = `cha-tmb-1${ep}-all.zip`;
        a.click();
    } catch(e) {
        console.error(e);
        alert("Zip作成中にエラーが発生しました。");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});


// ==========================================
// チャプター変換ツールの主要ロジック
// ==========================================

convertBtn.addEventListener('click', () => {
    // Auto-sync climax talk time on convert
    const chapterText = chapterInput.value;
    const lines = chapterText.split('\n');
    const chapterStartRegex = /^\s*(?:\(?(\d{1,2}:\d{2}(?::\d{2})?)\)?)\s*(.*)/;
    let climaxTime = null;
    const chapterStartIndices = [];
    lines.forEach((line, index) => {
        if (chapterStartRegex.test(line.trim())) {
            chapterStartIndices.push(index);
        }
    });

    for (let i = 0; i < chapterStartIndices.length; i++) {
        const start = chapterStartIndices[i];
        const end = (i + 1 < chapterStartIndices.length) ? chapterStartIndices[i + 1] : lines.length;
        const chapterBlock = lines.slice(start, end).join('\n');

        if (chapterBlock.includes('クライマックストーク')) {
            const match = lines[start].match(chapterStartRegex);
            if (match) {
                climaxTime = match[1];
                break;
            }
        }
    }

    if (climaxTime) {
        youtubeStartInput.value = climaxTime;
    }

    // 変換処理
    const rawChapters = parseChapterTextForTool();
    if (rawChapters.length === 0) {
        showError();
        return;
    }
    processAndStoreChapters(rawChapters);
    refreshAllOutputs();
    showAllOutputs();
});

clearBtn.addEventListener('click', () => {
    episodeNumberInput.value = '';
    publishDateInput.value = new Date().toISOString().split('T')[0];
    chatTimeInput.value = '';
    youtubeLinkInput.value = '';
    youtubeStartInput.value = '';
    rumbleLinkInput.value = '';
    rumbleStartInput.value = '';

    // Reset rumble offsets
    rumbleOffsetsContainer.innerHTML = '';
    addOffsetRow(0, 0, true);

    chapterInput.value = '';
    renderChapterList(); // update thumb list

    updatePlayerSource();

    outputSection.classList.add('hidden');
    detailedOutputSection.classList.add('hidden');
    rawDataSection.classList.add('hidden');
    errorMessage.classList.add('hidden');

    parsedChapters = [];
});

uploadBtn.addEventListener('click', () => {
    uploadRawCsv.click();
});

uploadRawCsv.addEventListener('change', handleRawCsvUpload);

copyBtn.addEventListener('click', () => {
    const codeToCopy = typescriptOutput.innerText;
    navigator.clipboard.writeText(codeToCopy).then(() => {
        copyBtn.textContent = 'コピー完了!';
        setTimeout(() => { copyBtn.textContent = 'コピー'; }, 2000);
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = codeToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            copyBtn.textContent = 'コピー完了!';
            setTimeout(() => { copyBtn.textContent = 'コピー'; }, 2000);
        } catch (err) {
            alert('申し訳ありませんが、コピーに失敗しました。');
        }
        document.body.removeChild(textArea);
    });
});

downloadCsvBtn.addEventListener('click', handleCsvDownload);
downloadTsBtn.addEventListener('click', handleTsDownload);
downloadRawCsvBtn.addEventListener('click', handleRawCsvDownload);

toggleAdditionalData.addEventListener('change', () => {
    if (parsedChapters.length > 0) refreshAllOutputs();
});

window.onscroll = function () {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        backToTopButton.classList.remove('hidden');
    } else {
        backToTopButton.classList.add('hidden');
    }
};

backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

incrementEpisodeBtn.addEventListener('click', () => {
    let currentValue = parseInt(episodeNumberInput.value, 10);
    if (isNaN(currentValue)) currentValue = 0;
    episodeNumberInput.value = currentValue + 1;
});

decrementEpisodeBtn.addEventListener('click', () => {
    let currentValue = parseInt(episodeNumberInput.value, 10);
    if (isNaN(currentValue)) currentValue = 1;
    if (currentValue > 0) {
        episodeNumberInput.value = currentValue - 1;
    }
});

syncClimaxTimeBtn.addEventListener('click', () => {
    const chapterText = chapterInput.value;
    const lines = chapterText.split('\n');
    const chapterStartRegex = /^\s*(?:\(?(\d{1,2}:\d{2}(?::\d{2})?)\)?)\s*(.*)/;

    let climaxTime = null;
    const chapterStartIndices = [];
    lines.forEach((line, index) => {
        if (chapterStartRegex.test(line.trim())) {
            chapterStartIndices.push(index);
        }
    });

    for (let i = 0; i < chapterStartIndices.length; i++) {
        const start = chapterStartIndices[i];
        const end = (i + 1 < chapterStartIndices.length) ? chapterStartIndices[i + 1] : lines.length;
        const chapterBlock = lines.slice(start, end).join('\n');
        
        if (chapterBlock.includes('クライマックストーク')) {
            const match = lines[start].match(chapterStartRegex);
            if (match) {
                climaxTime = match[1];
                break;
            }
        }
    }

    if (climaxTime) {
        youtubeStartInput.value = climaxTime;
        syncClimaxTimeBtn.textContent = '完了!';
        setTimeout(() => { syncClimaxTimeBtn.textContent = '同期'; }, 1500);
    } else {
        syncClimaxTimeBtn.textContent = 'なし';
        setTimeout(() => { syncClimaxTimeBtn.textContent = '同期'; }, 1500);
    }
});

addOffsetBtn.addEventListener('click', () => {
    addOffsetRow('', '');
});

rumbleOffsetsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-offset-btn')) {
        e.target.closest('.offset-row').remove();
    }
});

function addOffsetRow(chapter = '', seconds = '', isInitial = false) {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 offset-row';
    const hideRemoveBtn = isInitial ? 'hidden' : '';
    div.innerHTML = `
        <span class="text-xs text-gray-500 whitespace-nowrap">Ch.</span>
        <input type="number" class="form-input h-8 text-sm w-16 offset-chapter" value="${chapter}" min="0" placeholder="0" onclick="this.select()">
        <span class="text-xs text-gray-500 whitespace-nowrap">から</span>
        <input type="number" class="form-input h-8 text-sm w-20 offset-seconds" value="${seconds}" placeholder="sec" onclick="this.select()">
        <span class="text-xs text-gray-500 whitespace-nowrap">秒加算</span>
        <button class="remove-offset-btn text-red-500 hover:text-red-700 ml-1 font-bold ${hideRemoveBtn}">×</button>
    `;
    rumbleOffsetsContainer.appendChild(div);
}

function getRumbleOffsets() {
    const offsets = [];
    const rows = rumbleOffsetsContainer.querySelectorAll('.offset-row');
    rows.forEach(row => {
        const chapterInput = row.querySelector('.offset-chapter');
        const secondsInput = row.querySelector('.offset-seconds');
        const chapter = parseInt(chapterInput.value, 10);
        const seconds = parseInt(secondsInput.value, 10);

        if (!isNaN(chapter) && !isNaN(seconds)) {
            offsets.push({ chapter, seconds });
        }
    });
    return offsets.sort((a, b) => a.chapter - b.chapter);
}

function updateChapterInputWithNewCategory(chapterIndex, newCategory) {
    const lines = chapterInput.value.split('\n');
    const chapterStartRegex = /^\s*(?:\(?(\d{1,2}:\d{2}(?::\d{2})?)\)?)\s*(.*)/;

    const chapterStartLineIndices = [];
    lines.forEach((line, i) => {
        if (chapterStartRegex.test(line.trim())) {
            chapterStartLineIndices.push(i);
        }
    });

    if (chapterIndex >= chapterStartLineIndices.length) return;

    const startLineIndex = chapterStartLineIndices[chapterIndex];
    const endLineIndex = (chapterIndex + 1 < chapterStartLineIndices.length) ? chapterStartLineIndices[chapterIndex + 1] : lines.length;

    let chapterBlockLines = lines.slice(startLineIndex, endLineIndex);

    let categoryRemoved = false;
    chapterBlockLines = chapterBlockLines.filter(line => {
        if (CATEGORIES.includes(line.trim())) {
            categoryRemoved = true;
            return false;
        }
        return true;
    });

    if (newCategory) {
        let lastLineIndexInBlock = -1;
        for (let i = chapterBlockLines.length - 1; i >= 0; i--) {
            if (chapterBlockLines[i].trim() !== '') {
                lastLineIndexInBlock = i;
                break;
            }
        }
        if (lastLineIndexInBlock !== -1) {
            chapterBlockLines.splice(lastLineIndexInBlock + 1, 0, newCategory);
        } else {
            chapterBlockLines.push(newCategory);
        }
    }

    const newLines = [
        ...lines.slice(0, startLineIndex),
        ...chapterBlockLines,
        ...lines.slice(endLineIndex)
    ];

    chapterInput.value = newLines.join('\n');
}

function parseChapterTextForTool() {
    const inputText = chapterInput.value.trim();
    if (!inputText) return [];

    const lines = inputText.split('\n');
    const chapters = [];
    const chapterStartRegex = /^\s*(?:\(?(\d{1,2}:\d{2}(?::\d{2})?)\)?)\s*(.*)/;

    let currentChapter = null;
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const match = trimmedLine.match(chapterStartRegex);

        if (match) {
            if (currentChapter) {
                currentChapter.title = currentChapter.title.trim();
                chapters.push(currentChapter);
            }
            const timestamp = match[1];
            const title = match[2].replace(/^(chapter|チャプター)\s*\d+\s*[:：]?\s*/i, '').trim();
            currentChapter = { timestamp, title, category: null };
        } else if (currentChapter) {
            if (CATEGORIES.includes(trimmedLine)) {
                currentChapter.category = trimmedLine;
            } else {
                currentChapter.title += '\n' + trimmedLine;
            }
        }
    });

    if (currentChapter) {
        currentChapter.title = currentChapter.title.trim();
        chapters.push(currentChapter);
    }
    return chapters;
}

function processAndStoreChapters(rawChapters) {
    const youtubeStartSeconds = timeToSeconds(youtubeStartInput.value);
    const rumbleStartSeconds = timeToSeconds(rumbleStartInput.value);
    const rumbleOffsets = getRumbleOffsets();

    parsedChapters = rawChapters.map((c, index) => {
        const titleLines = c.title ? c.title.split('\n') : [''];
        let subtitle = '';
        let title = '';

        if (titleLines.length === 1) {
            subtitle = '';
            title = titleLines[0] || '';
        } else {
            subtitle = titleLines[0] || '';
            title = titleLines.slice(1).join('\n');
        }

        const youtubeSeconds = timeToSeconds(c.timestamp);

        let currentOffset = 0;
        rumbleOffsets.forEach(o => {
            if (index >= o.chapter) currentOffset += o.seconds;
        });

        const rumbleTotalSeconds = (youtubeSeconds - youtubeStartSeconds) + rumbleStartSeconds + currentOffset;

        return {
            ...c, 
            youtubeTime: secondsToTime(youtubeSeconds),
            youtubeSeconds: youtubeSeconds,
            rumbleTime: secondsToTime(rumbleTotalSeconds),
            rumbleSeconds: rumbleTotalSeconds > 0 ? rumbleTotalSeconds : 0,
            concatenatedTitle: (subtitle + ' ' + title).trim(),
            subtitle: subtitle,
            titleProper: title,
            subtitleNoEmoji: sanitizeTag(subtitle),
            titleProperNoEmoji: sanitizeTag(title)
        };
    });
}

window.handleCategoryChange = function (index) {
    const selectEl = document.getElementById(`category-select-${index}`);
    const newCategory = selectEl.value;

    if (parsedChapters[index]) {
        parsedChapters[index].category = newCategory === "" ? null : newCategory;
    }
    updateChapterInputWithNewCategory(index, newCategory);
    refreshAllOutputs();
}

function refreshAllOutputs() {
    displayChapterList(parsedChapters);
    displayTypeScriptData(parsedChapters);
    displayDetailedTable(parsedChapters);
    displayRawData();
}

function displayChapterList(chapters) {
    chapterListOutput.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'space-y-4';
    const baseYoutubeUrl = youtubeLinkInput.value;

    chapters.forEach((chapter, index) => {
        const li = document.createElement('li');
        li.className = 'p-2 rounded-md hover:bg-gray-100 transition';
        const titleWithBreaks = escapeHtml(chapter.title).replace(/\n/g, '<br>');

        let finalYoutubeLink = '#';
        let videoId = null;
        try {
            if (baseYoutubeUrl) {
                const url = new URL(baseYoutubeUrl);
                if (url.hostname === '[www.youtube.com](https://www.youtube.com)' || url.hostname === 'youtube.com') videoId = url.searchParams.get('v');
                else if (url.hostname === 'youtu.be') videoId = url.pathname.substring(1).split('/')[0];
            }
        } catch (e) { }

        if (videoId) finalYoutubeLink = `https://www.youtube.com/watch?v=${videoId}&t=${chapter.youtubeSeconds}s`;

        const timestampDisplay = `<a href="${finalYoutubeLink}" ${videoId ? 'target="_blank" rel="noopener noreferrer"' : ''} class="bg-blue-100 text-blue-800 text-xs font-semibold mr-3 px-2.5 py-0.5 rounded mt-1 flex-shrink-0 hover:bg-blue-200 hover:text-blue-900 transition-colors">${chapter.timestamp}</a>`;
        const options = CATEGORIES.map(cat => `<option value="${escapeHtml(cat)}" ${chapter.category === cat ? 'selected' : ''}>${escapeHtml(cat)}</option>`).join('');
        const categoryDisplay = `<div class="mt-2"><select id="category-select-${index}" onchange="handleCategoryChange(${index})" class="form-input text-sm"><option value="">カテゴリーを選択...</option>${options}</select></div>`;

        li.innerHTML = `<div class="flex items-start"><span class="bg-gray-200 text-gray-800 text-xs font-bold mr-2 px-2 py-0.5 rounded mt-1 flex-shrink-0">${index}</span>${timestampDisplay}<span class="text-gray-700">${titleWithBreaks}</span></div>${categoryDisplay}`;
        ul.appendChild(li);
    });
    chapterListOutput.appendChild(ul);
}

function displayTypeScriptData(chapters) {
    const data = {
        episodeNumber: episodeNumberInput.value ? parseInt(episodeNumberInput.value, 10) : null,
        publicationDate: publishDateInput.value,
        chatTime: chatTimeInput.value || ''
    };

    const showAdditional = toggleAdditionalData.checked;
    const chatTimeSeconds = data.chatTime ? timeToSeconds(data.chatTime) : "";
    const chatTimeFormatted = data.chatTime ? secondsToTime(timeToSeconds(data.chatTime)) : "";

    const chaptersObjects = chapters.map((c, index) => {
        const programId = "1" + (data.episodeNumber || 0);
        const chapterCategory = c.category || '';
        const formattedPublishDate = data.publicationDate ? data.publicationDate.replace(/-/g, '.') : "";
        const allTags = c.title.split('\n');

        let lines = [
            `    program_id: ${programId}`,
            `    chapter_num: ${index}`,
            `    category: "heavenesestyle"`,
            `    category_id: 10`,
            `    chapter_time: "${c.youtubeTime}"`,
            `    chapter_time_rumble: "${c.rumbleTime}"`,
            `    chapter_time_rec: "${chatTimeFormatted}"`,
            `    chapter_subtitle: "${escapeJsString(c.subtitle)}"`,
            `    chapter_title: "${escapeJsString(c.titleProper)}"`,
            `    chapter_thumbnail: "./assets/image/thumbnail/cha-tmb-${programId}-${String(index).padStart(2, '0')}.png"`,
            `    chapter_timecode: "?autoplay=1&t=${c.youtubeSeconds}"`,
            `    chapter_timecode_rumble: "?autoplay=1&start=${c.rumbleSeconds}"`,
            `    chapter_timecode_rec: "${chatTimeSeconds}"`,
            `    chapter_link: "?autoplay=1&t=${c.youtubeSeconds}"`
        ];

        if (showAdditional) {
            lines.push(`    chapter_category: "${escapeJsString(chapterCategory)}"`);
            lines.push(`    chapter_tags: [${allTags.map(tag => `"${escapeJsString(sanitizeTag(tag.trim()))}"`).join(', ')}]`);
            lines.push(`    episode_from: "${data.episodeNumber || 0}"`);
            lines.push(`    episode_publish_date: "${formattedPublishDate}"`);
        }

        const formattedLines = lines.map(line => `${line},`).join('\n');
        return `  {\n${formattedLines}\n  },`;
    }).join('\n');

    typescriptOutput.textContent = `const _programChapters = [\n${chaptersObjects}\n];`;
}

function displayDetailedTable(chapters) {
    detailedTableBody.innerHTML = '';
    chapters.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="table-cell">${escapeHtml(c.youtubeTime)}</td>
            <td class="table-cell">${c.youtubeSeconds}</td>
            <td class="table-cell">${escapeHtml(c.rumbleTime)}</td>
            <td class="table-cell">${c.rumbleSeconds}</td>
            <td class="table-cell">${escapeHtml(c.concatenatedTitle)}</td>
            <td class="table-cell">${escapeHtml(c.subtitle)}</td>
            <td class="table-cell">${escapeHtml(c.titleProper)}</td>
            <td class="table-cell">${escapeHtml(c.subtitleNoEmoji)}</td>
            <td class="table-cell">${escapeHtml(c.titleProperNoEmoji)}</td>
            <td class="table-cell">${escapeHtml(c.category)}</td>
        `;
        detailedTableBody.appendChild(row);
    });
}

function displayRawData() {
    const offsets = getRumbleOffsets();
    const offsetString = offsets.map(o => `${o.chapter}:${o.seconds}`).join('|');
    const episodeInfo = `エピソード数: ${episodeNumberInput.value}\n公開日: ${publishDateInput.value}\nチャット時間: ${chatTimeInput.value}\nYouTubeリンク: ${youtubeLinkInput.value}\nYouTube開始時間: ${youtubeStartInput.value}\nRumbleリンク: ${rumbleLinkInput.value}\nRumble開始時間: ${rumbleStartInput.value}\nRumble調整: ${offsetString}`;
    episodeInfoOutput.textContent = episodeInfo;
    rawChapterOutput.textContent = chapterInput.value;
}

function handleCsvDownload() {
    if (parsedChapters.length === 0) return;
    const escapeCsvField = (field) => {
        let str = String(field === null || field === undefined ? '' : field);
        str = str.replace(/"/g, '""');
        return `"${str}"`;
    };
    const episodeNumValue = episodeNumberInput.value || '';
    const youtubeLink = youtubeLinkInput.value;
    const youtubeStart = secondsToTime(timeToSeconds(youtubeStartInput.value));
    const rumbleLink = rumbleLinkInput.value;
    const rumbleStart = secondsToTime(timeToSeconds(rumbleStartInput.value));
    const offsets = getRumbleOffsets();
    const offsetString = offsets.map(o => `${o.chapter}:${o.seconds}`).join('|');

    const row1 = ['', youtubeLink, youtubeStart, '', episodeNumValue].map(escapeCsvField).join(',');
    const row2 = ['', rumbleLink, rumbleStart, offsetString].map(escapeCsvField).join(',');
    const headers = ["YT時間", "YT秒", "Rumble時間", "Rumble秒", "連結タイトル", "1行目", "2行目", "1行目(絵文字無)", "2行目(絵文字無)", "カテゴリ"];
    const headerRow = headers.join(',');

    const csvRows = [row1, row2, headerRow];
    parsedChapters.forEach(c => {
        const row = [
            c.youtubeTime, c.youtubeSeconds, c.rumbleTime, c.rumbleSeconds,
            c.concatenatedTitle, c.subtitle, c.titleProper,
            c.subtitleNoEmoji, c.titleProperNoEmoji, c.category
        ].map(escapeCsvField);
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const episodeNum = episodeNumberInput.value || 'data';
    link.download = `detailed_data_ep${episodeNum}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleTsDownload() {
    const tsContent = typescriptOutput.innerText;
    if (!tsContent) return;
    const blob = new Blob([tsContent], { type: 'application/typescript;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const episodeNum = episodeNumberInput.value || 'data';
    const showAdditional = toggleAdditionalData.checked;
    link.download = showAdditional ? `EP${episodeNum}_NEW.ts` : `EP${episodeNum}.ts`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleRawCsvDownload() {
    const escapeCsvField = (field) => {
        let str = String(field === null || field === undefined ? '' : field);
        str = str.replace(/"/g, '""');
        return `"${str}"`;
    };
    const offsets = getRumbleOffsets();
    const offsetString = offsets.map(o => `${o.chapter}:${o.seconds}`).join('|');

    const info = [
        { key: "エピソード数", value: episodeNumberInput.value },
        { key: "公開日", value: publishDateInput.value },
        { key: "チャット時間", value: chatTimeInput.value },
        { key: "YouTubeリンク", value: youtubeLinkInput.value },
        { key: "YouTube開始時間", value: youtubeStartInput.value },
        { key: "Rumbleリンク", value: rumbleLinkInput.value },
        { key: "Rumble開始時間", value: rumbleStartInput.value },
        { key: "Rumble調整", value: offsetString },
    ];

    const csvRows = [["項目", "値"].join(',')];
    info.forEach(item => csvRows.push([escapeCsvField(item.key), escapeCsvField(item.value)].join(',')));
    csvRows.push(['--- チャプター文章 ---', ''].join(','));
    chapterInput.value.split('\n').forEach(line => csvRows.push(escapeCsvField(line)));

    const csvString = csvRows.join('\n');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const episodeNum = episodeNumberInput.value || 'data';
    link.download = `raw_data_ep${episodeNum}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleRawCsvUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        parseRawCsv(e.target.result);
    };
    reader.readAsText(file);
}

function parseRawCsv(csvText) {
    const lines = csvText.split('\n').map(line => line.trim());
    const infoMap = {};
    let isChapterSection = false;
    const chapterLines = [];

    const cleanCsvField = (field) => {
        if (field.startsWith('"') && field.endsWith('"')) {
            return field.substring(1, field.length - 1).replace(/""/g, '"');
        }
        return field;
    };

    for (const line of lines) {
        const parts = line.split(',');
        if (parts.length > 0) {
            const key = cleanCsvField(parts[0]);
            if (key === "--- チャプター文章 ---") {
                isChapterSection = true;
                continue;
            }
            if (isChapterSection) {
                chapterLines.push(key);
            } else if (parts.length > 1) {
                const value = cleanCsvField(parts[1]);
                infoMap[key] = value;
            }
        }
    }

    episodeNumberInput.value = infoMap["エピソード数"] || '';
    publishDateInput.value = infoMap["公開日"] || new Date().toISOString().split('T')[0];
    chatTimeInput.value = infoMap["チャット時間"] || '';
    youtubeLinkInput.value = infoMap["YouTubeリンク"] || '';
    youtubeStartInput.value = infoMap["YouTube開始時間"] || '';
    rumbleLinkInput.value = infoMap["Rumbleリンク"] || '';
    rumbleStartInput.value = infoMap["Rumble開始時間"] || '';
    chapterInput.value = chapterLines.join('\n');

    rumbleOffsetsContainer.innerHTML = '';
    const offsetString = infoMap["Rumble調整"] || infoMap["Rumble調整時間"] || '';
    if (!offsetString || offsetString === '0') {
        addOffsetRow(0, 0, true);
    } else {
        const offsetPairs = offsetString.split('|');
        offsetPairs.forEach((pair, index) => {
            const [ch, sec] = pair.split(':');
            addOffsetRow(ch, sec, index === 0);
        });
    }

    updatePlayerSource();
    renderChapterList(); // update thumb list
}

function showError() {
    outputSection.classList.add('hidden');
    detailedOutputSection.classList.add('hidden');
    rawDataSection.classList.add('hidden');
    errorMessage.classList.remove('hidden');
}

function showAllOutputs() {
    errorMessage.classList.add('hidden');
    outputSection.classList.remove('hidden');
    detailedOutputSection.classList.remove('hidden');
    rawDataSection.classList.remove('hidden');
}

// ==========================================
// キーボードショートカット (プレイヤー操作用)
// ==========================================
document.addEventListener('keydown', (e) => {
    const activeElement = document.activeElement;
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') return;
    if (mode !== 'local') return;
    
    switch (e.key) {
        case ' ':
        case 'Spacebar': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); handleSkip(-5); break;
        case 'ArrowRight': e.preventDefault(); handleSkip(5); break;
    }
});

// ==========================================
// 初回ロード時の処理
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updatePlayerSource();
    renderChapterList();
});
