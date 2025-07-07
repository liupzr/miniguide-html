// 全局变量
let currentAudio = null;

// 初始化页面内容
document.addEventListener('DOMContentLoaded', function() {
    // 设置网站标题
    document.title = siteConfig.siteInfo.title;
    document.getElementById('headerTitle').textContent = siteConfig.siteInfo.title;
    
    // 设置英雄区域
    document.getElementById('heroTitle').textContent = siteConfig.siteInfo.title;
    document.getElementById('heroDescription').textContent = siteConfig.siteInfo.description;
    document.getElementById('heroImage').style.backgroundImage = `url('pic/${siteConfig.siteInfo.heroImage}')`;
    
    // 设置概览部分
    document.getElementById('overviewTitle').textContent = siteConfig.overview.title;
    document.getElementById('overviewDescription').textContent = siteConfig.overview.description;
    
    // 生成概览卡片
    const overviewCardsContainer = document.getElementById('overviewCards');
    siteConfig.overview.cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'flex-none w-[280px] md:w-auto bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 snap-center';
        cardElement.innerHTML = `
            <div class="h-40 md:h-44 overflow-hidden">
                <img src="pic/${card.image}" alt="${card.title}" class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500">
            </div>
            <div class="p-4 md:p-5">
                <h3 class="text-xl font-bold text-primary mb-2">${card.title}</h3>
                <p class="text-dark/70">${card.description}</p>
            </div>
        `;
        overviewCardsContainer.appendChild(cardElement);
    });
    
    // 生成景点标签和内容
    const attractionTabsContainer = document.getElementById('attractionTabs');
    const attractionContentContainer = document.getElementById('attractionContent');
    const audioElementsContainer = document.getElementById('audioElements');
    
    // 添加概览音频
    const overviewAudio = document.createElement('audio');
    overviewAudio.id = 'overview-audio';
    overviewAudio.preload = 'metadata';
    overviewAudio.innerHTML = `<source src="audio/${siteConfig.overview.audio}" type="audio/mpeg">`;
    audioElementsContainer.appendChild(overviewAudio);
    
    // 生成景点内容
    siteConfig.attractions.forEach((attraction, index) => {
        // 创建景点标签
        const tab = document.createElement('button');
        tab.className = `attraction-tab ${index === 0 ? 'bg-primary text-white' : 'bg-secondary/30 text-dark'} px-6 py-3 rounded-full whitespace-nowrap snap-center shadow-md hover:shadow-lg transition-all`;
        tab.setAttribute('data-attraction', attraction.id);
        tab.textContent = attraction.title;
        attractionTabsContainer.appendChild(tab);
        
        // 创建景点内容
        const content = document.createElement('div');
        content.id = attraction.id;
        content.className = `attraction-item ${index === 0 ? 'active' : 'hidden'}`;
        content.innerHTML = `
            <div class="grid md:grid-cols-2">
                <div class="relative h-[200px] md:h-auto">
                    <img src="pic/${attraction.image}" alt="${attraction.title}" class="w-full h-full object-cover">
                    <div class="absolute top-4 left-4 bg-primary/80 text-white px-4 py-2 rounded-full text-sm font-medium">
                        ${attraction.title}
                    </div>
                </div>
                <div class="p-4 md:p-12 flex flex-col justify-between">
                    <div>
                        <h3 class="text-xl md:text-3xl font-bold text-primary mb-2 md:mb-4">${attraction.title}</h3>
                        <p class="text-sm md:text-base text-dark/80 mb-4 md:mb-6 leading-relaxed">
                            ${attraction.description}
                        </p>
                        <div class="flex flex-wrap gap-2 mb-4 md:mb-8">
                            ${attraction.tags.map(tag => `
                                <span class="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs md:text-sm">${tag}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- 音频播放器 -->
                    <div class="audio-player bg-white p-3 md:p-5 rounded-xl shadow-lg">
                        <div class="flex items-center justify-between mb-2 md:mb-3">
                            <h4 class="font-bold text-primary text-sm md:text-base">景点讲解</h4>
                        </div>
                        <div class="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                            <button class="play-pause-btn bg-primary text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all">
                                <i class="fa fa-play"></i>
                            </button>
                            <div class="flex-1">
                                <div class="relative h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div class="progress-bar absolute top-0 left-0 h-full bg-primary" style="width: 0%"></div>
                                </div>
                            </div>
                            <span class="text-xs md:text-sm text-dark/60 time-display">0:00</span>
                            <span class="text-xs md:text-sm text-dark/30 duration">/ 0:00</span>
                        </div>
                        <div class="audio-wave hidden">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        attractionContentContainer.appendChild(content);
        
        // 创建音频元素
        const audio = document.createElement('audio');
        audio.id = `${attraction.id}-audio`;
        audio.preload = 'metadata';
        audio.innerHTML = `<source src="audio/${attraction.audio}" type="audio/mpeg">`;
        audioElementsContainer.appendChild(audio);
    });
    
    // 初始化音频播放器和景点切换功能
    initAudioPlayers();
    initAttractionTabs();
});

// 初始化音频播放器
function initAudioPlayers() {
    const playPauseBtns = document.querySelectorAll('.play-pause-btn');
    const audioWaves = document.querySelectorAll('.audio-wave');
    
    // 预加载所有音频并设置时长
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        audio.load();
        audio.addEventListener('loadedmetadata', () => {
            let player;
            if (audio.id === 'overview-audio') {
                player = document.querySelector('#overview .audio-player');
            } else {
                const attractionId = audio.id.replace('-audio', '');
                player = document.querySelector(`#${attractionId} .audio-player`);
            }
            if (player) {
                const duration = player.querySelector('.duration');
                duration.textContent = `/ ${formatTime(audio.duration)}`;
            }
        });
    });
    
    playPauseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const audioWave = this.closest('.audio-player').querySelector('.audio-wave');
            const progressBar = this.closest('.audio-player').querySelector('.progress-bar');
            const timeDisplay = this.closest('.audio-player').querySelector('.time-display');
            
            let audio;
            if (this.closest('#overview')) {
                audio = document.getElementById('overview-audio');
            } else {
                const attractionId = this.closest('.attraction-item').id;
                audio = document.getElementById(`${attractionId}-audio`);
            }
            
            if (!audio.initialized) {
                initAudioPlayer(audio, this.closest('.audio-player'));
                audio.initialized = true;
            }
            
            if (icon.classList.contains('fa-play')) {
                stopAllAudio();
                audio.play();
                currentAudio = audio;
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
                audioWave.classList.remove('hidden');
            } else {
                audio.pause();
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
                audioWave.classList.add('hidden');
            }
        });
    });
}

// 初始化景点切换
function initAttractionTabs() {
    const attractionTabs = document.querySelectorAll('.attraction-tab');
    const attractionItems = document.querySelectorAll('.attraction-item');
    
    attractionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            stopAllAudio();
            
            attractionTabs.forEach(t => {
                t.classList.remove('bg-primary', 'text-white');
                t.classList.add('bg-secondary/30', 'text-dark');
            });
            
            tab.classList.remove('bg-secondary/30', 'text-dark');
            tab.classList.add('bg-primary', 'text-white');
            
            attractionItems.forEach(item => {
                item.classList.add('hidden');
                item.classList.remove('active');
            });
            
            const target = tab.getAttribute('data-attraction');
            const activeItem = document.getElementById(target);
            activeItem.classList.remove('hidden');
            activeItem.classList.add('active');
            
            activeItem.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// 停止所有音频播放
function stopAllAudio() {
    const playPauseBtns = document.querySelectorAll('.play-pause-btn');
    const audioWaves = document.querySelectorAll('.audio-wave');
    const audioElements = document.querySelectorAll('audio');
    
    audioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    
    playPauseBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    });
    
    audioWaves.forEach(wave => wave.classList.add('hidden'));
}

// 初始化音频播放器
function initAudioPlayer(audio, player) {
    const progressBar = player.querySelector('.progress-bar');
    const timeDisplay = player.querySelector('.time-display');
    const duration = player.querySelector('.duration');
    const progressContainer = player.querySelector('.relative');
    
    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progress}%`;
        timeDisplay.textContent = formatTime(audio.currentTime);
    });
    
    audio.addEventListener('ended', () => {
        const icon = player.querySelector('.play-pause-btn i');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        player.querySelector('.audio-wave').classList.add('hidden');
        progressBar.style.width = '0%';
        timeDisplay.textContent = '0:00';
    });
    
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pos * audio.duration;
    });
    
    let isDragging = false;
    
    progressContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pos * audio.duration;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const rect = progressContainer.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audio.currentTime = pos * audio.duration;
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    progressContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.touches[0].clientX - rect.left) / rect.width;
        audio.currentTime = pos * audio.duration;
    });
    
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const rect = progressContainer.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
            audio.currentTime = pos * audio.duration;
        }
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// 辅助函数：时间格式化
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 移动端菜单切换
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('hidden');
}); 