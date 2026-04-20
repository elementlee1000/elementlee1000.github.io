const params = new URLSearchParams(location.search);
const folder = params.get('p');

if (folder) {
    const base = `images/${folder}`;

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
        });

    fetch(`${base}/manifest.json`)
        .then(r => r.json())
        .then(({ images }) => {
            const grid = document.getElementById('gallery');
            grid.innerHTML = images
                .map(f => `<img src="${base}/${f}" loading="lazy" alt="">`)
                .join('');
        });
}
