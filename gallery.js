const params = new URLSearchParams(location.search);
const folder = params.get('p');

/* 语言相关：I18N 由 i18n.js（<head> 中同步加载）提供 */
function pickLang(obj, field) {
    return window.I18N ? I18N.pick(obj, field) : ((obj && obj[field]) || '');
}
function onLangChange(fn) {
    if (window.I18N) I18N.onChange(fn);
}

if (folder) {
    const base = `images/Artworks/${folder}`;
    let info = null;

    // 标题 / 年份 · 媒介 / 描述 都随语言变化，语言切换时重新渲染
    function renderInfo() {
        if (!info) return;
        const title = pickLang(info, 'title') || folder;

        document.title = `${title} | Element Lee`;
        document.getElementById('project-title').textContent = title;
        document.getElementById('project-meta').textContent =
            [pickLang(info, 'year'), pickLang(info, 'medium')].filter(Boolean).join('  ·  ');
        document.getElementById('project-desc').textContent = pickLang(info, 'description');
    }

    fetch(`${base}/info.json`)
        .then(r => r.json())
        .then(data => {
            info = data;
            renderInfo();

            if (info.cover) {
                const cover = document.getElementById('project-cover');
                cover.src = `${base}/${info.cover}`;
                cover.style.display = 'block';
            }
        })
        .catch(() => {});

    onLangChange(renderInfo);

    fetch(`${base}/manifest.json`)
        .then(r => r.json())
        .then(({ images }) => {
            const BATCH = 12;
            const grid = document.getElementById('gallery');
            const sentinel = document.getElementById('load-sentinel');
            let loaded = 0;

            function loadBatch() {
                const chunk = images.slice(loaded, loaded + BATCH);
                if (!chunk.length) {
                    observer.disconnect();
                    sentinel.style.display = 'none';
                    return;
                }
                chunk.forEach(f => {
                    const img = document.createElement('img');
                    img.src = `${base}/${encodeURIComponent(f)}`;
                    img.loading = 'lazy';
                    img.alt = '';
                    grid.appendChild(img);
                });
                loaded += chunk.length;
                if (loaded >= images.length) {
                    observer.disconnect();
                    sentinel.style.display = 'none';
                }
            }

            const observer = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) loadBatch();
            }, { rootMargin: '300px' });

            observer.observe(sentinel);
            loadBatch(); // 首批立即加载
        });
}
