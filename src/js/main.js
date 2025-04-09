let videoData = [];
let currentPlatform = 'youtube'; // По умолчанию загружаем YouTube

// Функция загрузки видео с YouTube
async function loadYouTubeVideos() {
    try {
        const API_KEY = "AIzaSyA_9cvCWhgqGjrshIgGPSLFPw7Y-cXKK7k";
        const CHANNEL_ID = "UCkJ0iGUSIgdcQ7YiJjalX7g";
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&maxResults=20&type=video&key=${API_KEY}`);
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            throw new Error("Видео с YouTube не загружены!");
        }

        videoData = data.items;
        updateVideos();
    } catch (error) {
        console.error("Ошибка загрузки видео с YouTube:", error);
    }
}

// Функция загрузки видео с VK
async function loadVKVideos() {
    try {
        const ACCESS_TOKEN = "ваш_access_token"; // Замените на ваш токен
        const OWNER_ID = "-35905857";
        const response = await fetch(`https://api.vk.com/method/video.get?owner_id=${OWNER_ID}&count=20&access_token=${ACCESS_TOKEN}&v=5.131`);
        const data = await response.json();

        if (!data.response || !data.response.items || data.response.items.length === 0) {
            throw new Error("Видео с VK не загружены!");
        }

        videoData = data.response.items;
        updateVideos();
    } catch (error) {
        console.error("Ошибка загрузки видео с VK:", error);
    }
}

// Функция обновления классов play-button
function updatePlayButtonClasses() {
    const playButtons = document.querySelectorAll('.play-button');
    playButtons.forEach(button => {
        button.classList.remove('youtube', 'vk');
        button.classList.add(currentPlatform);
    });
}

// Функция обновления видео в интерфейсе
function updateVideos() {
    if (videoData.length < 2) return;

    setMainVideo(videoData[0]);

    const additionalContainer = document.getElementById('additional-videos');
    additionalContainer.innerHTML = '';

    for (let i = 1; i < videoData.length; i++) {
        const video = videoData[i];

        const videoItem = document.createElement('div');
        videoItem.classList.add('additional-video-item');
        videoItem.dataset.videoId = currentPlatform === 'youtube' ? video.id.videoId : `${video.owner_id}_${video.id}`;
        videoItem.onclick = () => swapVideo(i);

        const thumbnailWrapper = document.createElement('div');
        thumbnailWrapper.classList.add('additional-video-thumbnail');
        thumbnailWrapper.style.backgroundImage = currentPlatform === 'youtube' 
            ? `url(${video.snippet.thumbnails.high.url})` 
            : `url(${video.photo_320})`;
        thumbnailWrapper.style.display = 'flex';

        const playButton = document.createElement('span');
        playButton.classList.add('play-button', 'small', currentPlatform); // Добавляем класс платформы
        thumbnailWrapper.appendChild(playButton);

        const title = document.createElement('h3');
        title.classList.add('additional-video-title');
        title.textContent = currentPlatform === 'youtube' ? video.snippet.title : video.title;

        videoItem.appendChild(thumbnailWrapper);
        videoItem.appendChild(title);
        additionalContainer.appendChild(videoItem);
    }

    updatePlayButtonClasses(); // Обновляем классы для всех кнопок
}

// Установка главного видео
function setMainVideo(video) {
    if (!video || (currentPlatform === 'youtube' && (!video.id || !video.id.videoId)) || (currentPlatform === 'vk' && !video.id)) {
        return;
    }

    const videoId = currentPlatform === 'youtube' ? video.id.videoId : `${video.owner_id}_${video.id}`;
    const iframe = document.getElementById('video-player');
    const thumbnail = document.getElementById('main-video-thumbnail');
    const mainTitle = document.getElementById('main-video-title');
    const mainDescription = document.getElementById('video-description');

    if (currentPlatform === 'youtube') {
        iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
        thumbnail.style.backgroundImage = `url(${video.snippet.thumbnails.high.url})`;
        mainTitle.textContent = video.snippet.title;
        mainDescription.textContent = video.snippet.description.substring(0, 100) + "...";
    } else {
        iframe.src = `https://vk.com/video_ext.php?oid=${video.owner_id}&id=${video.id}&hash=${video.access_key || ''}`;
        thumbnail.style.backgroundImage = `url(${video.photo_320})`;
        mainTitle.textContent = video.title;
        mainDescription.textContent = video.description 
            ? video.description.substring(0, 100) + "..." 
            : "Описание отсутствует";
    }

    thumbnail.style.display = "flex";
    thumbnail.onclick = () => playMainVideo(videoId);
    updatePlayButtonClasses(); // Обновляем классы после установки главного видео
}

// Воспроизведение главного видео
function playMainVideo(videoId) {
    const iframe = document.getElementById('video-player');
    const thumbnail = document.getElementById('main-video-thumbnail');
    thumbnail.style.display = 'none';

    if (currentPlatform === 'youtube') {
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else {
        const [ownerId, id] = videoId.split('_');
        iframe.src = `https://vk.com/video_ext.php?oid=${ownerId}&id=${id}&autoplay=1`;
    }
}

// Переключение видео
function swapVideo(index) {
    if (index >= videoData.length) return;
    const newMainVideo = videoData[index];
    videoData.splice(index, 1);
    videoData.unshift(newMainVideo);
    updateVideos();
}

// Функция переключения платформы
function toggleVideo(isYouTube) {
    currentPlatform = isYouTube ? 'youtube' : 'vk';
    
    // Обновляем классы иконок
    const vkLink = document.querySelector('.vkLink');
    const ytLink = document.querySelector('.ytLink');
    
    if (isYouTube) {
        vkLink.classList.remove('active');
        vkLink.classList.add('inactive');
        ytLink.classList.remove('inactive');
        ytLink.classList.add('active');
    } else {
        vkLink.classList.remove('inactive');
        vkLink.classList.add('active');
        ytLink.classList.remove('active');
        ytLink.classList.add('inactive');
    }
    
    // Очищаем текущие видео
    videoData = [];
    const iframe = document.getElementById('video-player');
    iframe.src = ''; // Останавливаем воспроизведение
    const thumbnail = document.getElementById('main-video-thumbnail');
    thumbnail.style.display = 'flex';

    // Загружаем видео с выбранной платформы
    if (isYouTube) {
        loadYouTubeVideos();
    } else {
        loadVKVideos();
    }

    updatePlayButtonClasses(); // Обновляем классы кнопок воспроизведения
}

// Загружаем YouTube по умолчанию
loadYouTubeVideos();

        // Получаем элементы с проверкой на существование
        const burgerBtn = document.querySelector('.burger-menu');
        const socialBtn = document.querySelector('.social-menu');
        const mobileMenu = document.querySelector('.mobile-menu');
        const socialMenu = document.querySelector('.mobile-social');
        const overlay = document.querySelector('.overlay');
        
        // Функция закрытия всех меню
        function closeAllMenus() {
            if (mobileMenu) mobileMenu.classList.remove('active');
            if (socialMenu) socialMenu.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            if (burgerBtn) {
                burgerBtn.classList.remove('active');
                burgerBtn.querySelector('.open').style.display = 'inline'; // Показываем иконку открытия
                burgerBtn.querySelector('.close').style.display = 'none';   // Скрываем иконку закрытия
            }
            if (socialBtn) {
                socialBtn.classList.remove('active');
                socialBtn.querySelector('.open').style.display = 'inline'; // Показываем иконку открытия
                socialBtn.querySelector('.close').style.display = 'none';   // Скрываем иконку закрытия
            }
        }
        
        // Функция переключения меню
        function toggleMenu(menu, button, otherMenu) {
            const isOpen = menu.classList.contains('active');
            closeAllMenus(); // Закрываем все перед открытием нового
            if (!isOpen) {
                menu.classList.add('active');
                overlay.classList.add('active');
                button.classList.add('active');
                button.querySelector('.open').style.display = 'none';      // Скрываем иконку открытия
                button.querySelector('.close').style.display = 'inline';   // Показываем иконку закрытия
            }
        }
        
        // Обработчики для бургер-меню
        if (burgerBtn && mobileMenu && overlay) {
            burgerBtn.addEventListener('click', () => toggleMenu(mobileMenu, burgerBtn, socialMenu));
        }
        
        // Обработчики для соцменю
        if (socialBtn && socialMenu && overlay) {
            socialBtn.addEventListener('click', () => toggleMenu(socialMenu, socialBtn, mobileMenu));
        }
        
        // Закрытие по клику на overlay
        if (overlay) {
            overlay.addEventListener('click', closeAllMenus);
        }
        
        // Делегирование событий для ссылок в мобильном меню
        if (mobileMenu) {
            mobileMenu.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' && mobileMenu.classList.contains('active')) {
                    closeAllMenus();
                }
            });
        }
        
        // Закрытие по клавише Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && (mobileMenu?.classList.contains('active') || socialMenu?.classList.contains('active'))) {
                closeAllMenus();
            }
        });