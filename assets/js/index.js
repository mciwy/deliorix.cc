let sw = window.innerWidth - $(window).width();
let ww = $(window).innerWidth();
let wh = $(window).innerHeight();
let sct = $(window).scrollTop();
let hs = location.hash;

let onTop = false;
let onBack = false;
let onTopSw = true;
let onBackSw = true;

const animateCSS = (element, animation, prefix = 'animate__') =>
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        const node = document.querySelector(element);

        node.classList.add(`${prefix}animated`, animationName);

        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
        }

        node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });

$(document).ready(function () {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    document.addEventListener('keydown', (e) => {
        const bannedKeys = ['F12', 'KeyC', 'KeyS', 'KeyU'];
        if ((e.ctrlKey && e.shiftKey && e.code === 'KeyI') || bannedKeys.includes(e.code) || (e.code === 'Space' && e.target == document.body)) {
            e.preventDefault();
        }
    });

    let initialScrollTop = $(window).scrollTop();
    onTop = initialScrollTop === 0;

    let mousewheelevent = 'onwheel' in document ? 'wheel' : 'mousewheel';
    if (!('onwheel' in document)) {
        mousewheelevent = 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
    }

    document.addEventListener(mousewheelevent, handleScroll, { passive: false });

    function handleScroll(e) {
        e.preventDefault();

        if (!onTop) return;

        let delta = e.deltaY ? -e.deltaY : e.wheelDelta ? e.wheelDelta : -e.detail;
        if (delta < 0 && onTopSw) {
            $('.top-scroll a').click();
            onTopSw = false;
        } else if (delta > 0 && onTopSw) {
            $('.topcontwrap').removeClass('is-fvNone');
            $('html, body').animate({ scrollTop: 0 }, 800, 'easeInOutExpo', () => {
                onTopSw = true;
            });
            onTopSw = false;
        }
    }

    const links = [
        { link: 'https://vk.me/deliorix', arialabel: 'aria-label="vk"', icon: '<i class="fa-brands fa-vk"></i>' },
        { link: 'https://t.me/deliorix', arialabel: 'aria-label="telegram"', icon: '<i class="fa-brands fa-telegram"></i>' },
        { link: 'https://steamcommunity.com/profiles/76561199159080157', arialabel: 'aria-label="steam"', icon: '<i class="fa-brands fa-steam"></i>' },
        { link: 'https://github.com/mciwy', arialabel: 'aria-label="github"', icon: '<i class="fa-brands fa-github"></i>' }
    ];

    const linksHtml = links.map(link => `<a href="${link.link}" target="_blank" rel="noopener noreferrer" ${link.arialabel}>${link.icon}</a>`).join('');

    $('.links').append(linksHtml);
});

$(window).on('load', function () {
    setTimeout(() => {
        $('#loading-2').addClass('is-active');
        setTimeout(() => {
            $('.loading').fadeOut();
            animateCSS('.title', 'fadeInUp');
            animateCSS('.links', 'fadeInDown');
            animateCSS('.top-scroll', 'fadeIn');
            animateCSS('.mute-button', 'fadeIn');
        }, 800);
    });

    if (hs && $(hs).length) {
        const targetPosition = $(hs).offset().top;
        $('html, body').animate({ scrollTop: targetPosition }, 800, 'easeInOutExpo', () => {
            $('.topcontwrap').addClass('is-fvNone');
            onTopSw = true;
        });
    } else {
        $('html, body').animate({ scrollTop: 0 }, 10);
    }

    $('.bottom-anchor').on('click', function () {
        let href = $(this).attr("href");
        let target = $(href === "#" || href === "" ? 'html' : href);
        let position = target.offset().top + 1;

        $('.topcontwrap').addClass('is-fvNone');

        $('body, html').stop(true, false).animate({ scrollTop: position }, 800, 'easeInOutExpo', function () {
            onTopSw = true;
        });
        return false;
    });

    let isReplaced = false;

    function replaceElement() {
        if (ww < 1025 && !isReplaced) {
            $('#background').find('.video-container').replaceWith('<div class="img-container"></div>');
            $('.top-scroll, .mute-button, #progress-bar').hide();
            isReplaced = true;
        } else if (ww > 1024 && isReplaced) {
            $('#background').find('.img-container').replaceWith('<div class="video-container"><video id="video" disablepictureinpicture></video></div>');
            $('.top-scroll, .mute-button, #progress-bar').show();
            isReplaced = false;
        }
    }

    replaceElement();
    $(window).resize(replaceElement);

    let lastPlayedIndex = null;

    function playRandomPlaylist() {
        const playlists = [
            'assets/media/hls/1/master.m3u8',
            'assets/media/hls/2/master.m3u8',
            'assets/media/hls/3/master.m3u8',
            'assets/media/hls/4/master.m3u8',
            'assets/media/hls/5/master.m3u8',
            'assets/media/hls/6/master.m3u8'
        ];

        let randomPlaylistIndex;
        do {
            randomPlaylistIndex = Math.floor(Math.random() * playlists.length);
        } while (randomPlaylistIndex === lastPlayedIndex);

        lastPlayedIndex = randomPlaylistIndex;
        const randomPlaylist = playlists[randomPlaylistIndex];
        return randomPlaylist;
    }

    let hls;

    function initializeHLS() {
        const video = document.getElementById('video');
        if (!video) return;

        const randomPlaylist = playRandomPlaylist();

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = randomPlaylist;
            video.addEventListener('canplay', function () {
                startProgressBar();
                video.play();
            }, { once: true });
        } else if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferLength: 45,
                maxBufferSize: 90 * 1000 * 1000
            });

            hls.loadSource(randomPlaylist);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                startProgressBar();
                video.play();
            });
        }

        video.addEventListener('ended', function () {
            const newRandomPlaylist = playRandomPlaylist();
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = newRandomPlaylist;
                video.load();
            } else if (hls) {
                hls.loadSource(newRandomPlaylist);
                hls.detachMedia();
                hls.attachMedia(video);
            }
        });

        let isMuted = true;
        let targetVolume = 0.1;

        video.volume = 0;

        function toggleMute() {
            isMuted = !isMuted;
            fadeVolumeTo(isMuted ? 0 : targetVolume);
            updateMuteIcon(isMuted);
        }

        function updateMuteIcon(muted) {
            $('.mute-icon').fadeOut(function () {
                $(this).toggleClass('fa-volume-high', !muted)
                    .toggleClass('fa-volume-xmark', muted)
                    .fadeIn();
            });
        }

        function fadeVolumeTo(volume) {
            $({ vol: video.volume }).animate({ vol: volume }, {
                duration: 800,
                step: function (now) {
                    video.volume = now;
                }
            });
        }

        $('.mute-button').on('click', toggleMute);
        updateMuteIcon(isMuted);
    }

    function startProgressBar() {
        const video = document.getElementById('video');
        const progressBar = document.querySelector('.progress-bar-inner');
        const progressBarBuffer = document.querySelector('.progress-bar-buffer');
        let animationFrameId;
        let bufferAnimationFrameId;

        function updateProgress() {
            const percentage = video.currentTime / video.duration;
            progressBar.style.transform = `scaleX(${percentage})`;
            animationFrameId = requestAnimationFrame(updateProgress);
        }

        function updateBuffer() {
            if (video.buffered.length) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const duration = video.duration || 1;
                const bufferedPercent = bufferedEnd / duration;
                progressBarBuffer.style.transform = `scaleX(${bufferedPercent})`;
            }
            bufferAnimationFrameId = requestAnimationFrame(updateBuffer);
        }

        video.addEventListener('play', () => {
            cancelAnimationFrame(animationFrameId);
            cancelAnimationFrame(bufferAnimationFrameId);
            animationFrameId = requestAnimationFrame(updateProgress);
            bufferAnimationFrameId = requestAnimationFrame(updateBuffer);
        });

        video.addEventListener('ended', () => {
            cancelAnimationFrame(animationFrameId);
            cancelAnimationFrame(bufferAnimationFrameId);
        });
    }

    if (ww > 1024) {
        initializeHLS();
    }

    function resizescrollHandle() {
        if (ww > 1024) {
            let topContWrap = $('.js-topcontwrap');
            if (topContWrap.length > 0) {
                let firstBlockTop = topContWrap.offset().top;
                if (sct <= firstBlockTop) {
                    onTop = true;
                    onBack = false;
                } else {
                    onTop = false;
                    onBack = true;
                }
            }
        }
    }

    $(window).on('load resize scroll', function () {
        ww = $(window).innerWidth();
        sct = $(window).scrollTop();

        resizescrollHandle();
    });
});