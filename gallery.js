const params = new URLSearchParams(location.search);
const folder = params.get('p');

if (folder) {
    const base = `images/Artworks/${folder}`;

    fetch(`${base}/info.json`)
        .then(r => r.json())
        .then(info => {
            document.title = `${info.title} | Element Lee`;
            document.getElementById('project-title').textContent = info.title;
            if (info.year || info.medium) {
                document.getElementById('project-meta').textContent =
                    [info.year, info.medium].filter(Boolean).join('  ·  ');
            }
            if (info.description) {
                document.getElementById('project-desc').textContent = info.description;
            }
            if (info.cover) {
                const cover = document.getElementById('project-cover');
                cover.src = `${base}/${info.cover}`;
                cover.style.display = 'block';
            }
        })
        .catch(() => {});

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
