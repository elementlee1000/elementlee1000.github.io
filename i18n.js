/* ============================================================
   站点语言切换
   - 默认英文
   - 检测到中国 IP 时自动切换为中文
   - 顶栏最后的按钮可手动切换（手动选择会记住，优先级高于 IP 检测）
   - 静态文本：靠 <html data-lang> + 元素上的 lang="en"/"zh" 属性，由 CSS 控制显示
   - 动态文本（作品标题、年份、媒介等）：用 I18N.pick(obj, field) 取 * 或 *_zh
   - 可用 ?lang=zh / ?lang=en 强制指定（便于预览与分享）
   ============================================================ */
(function () {
    var LANG_KEY = 'site-lang';      // 手动选择，持久保存
    var GEO_KEY = 'site-geo-cc';     // IP 检测结果，当前标签页内缓存
    var root = document.documentElement;
    var listeners = [];

    function currentLang() {
        return root.getAttribute('data-lang') || 'en';
    }

    function setLang(lang, persist) {
        lang = lang === 'zh' ? 'zh' : 'en';
        root.setAttribute('data-lang', lang);
        root.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');

        // <title data-en="..." data-zh="..."> 双语页面标题
        var titleEl = document.querySelector('title[data-zh]');
        if (titleEl) {
            titleEl.textContent = lang === 'zh' ? titleEl.getAttribute('data-zh') : titleEl.getAttribute('data-en');
        }

        if (persist) {
            try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
        }

        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    }

    /* 按当前语言从数据对象里取值：中文优先 *_zh，缺失时回退英文原值 */
    function pick(obj, field) {
        if (!obj) return '';
        if (currentLang() === 'zh') {
            var zh = obj[field + '_zh'];
            if (zh) return zh;
        }
        return obj[field] || '';
    }

    function onChange(fn) {
        listeners.push(fn);
    }

    document.addEventListener('langchange', function () {
        listeners.forEach(function (fn) { fn(); });
    });

    /* 顶栏语言按钮：用事件委托，不必等 DOM 就绪 */
    document.addEventListener('click', function (e) {
        if (!e.target || !e.target.closest) return;
        if (!e.target.closest('#lang-toggle')) return;
        e.preventDefault();
        setLang(currentLang() === 'zh' ? 'en' : 'zh', true);
    });

    /* ---------- 中国 IP 检测 ---------- */
    var SOURCES = [
        { url: 'https://api.country.is/', get: function (j) { return j.country; } },
        { url: 'https://ipwho.is/', get: function (j) { return j.country_code; } },
        { url: 'https://ipapi.co/json/', get: function (j) { return j.country_code; } }
    ];

    function fetchWithTimeout(url, ms) {
        return new Promise(function (resolve) {
            var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
            var timer = setTimeout(function () {
                if (ctrl) ctrl.abort();
                resolve(null);
            }, ms);
            var opt = ctrl ? { signal: ctrl.signal } : {};
            fetch(url, opt)
                .then(function (r) { return r.ok ? r.json() : null; })
                .then(function (j) { clearTimeout(timer); resolve(j); })
                .catch(function () { clearTimeout(timer); resolve(null); });
        });
    }

    function detectCountry() {
        var cached = null;
        try { cached = sessionStorage.getItem(GEO_KEY); } catch (e) {}
        if (cached) return Promise.resolve(cached);

        var i = 0;
        function next() {
            if (i >= SOURCES.length) return Promise.resolve('');
            var s = SOURCES[i++];
            return fetchWithTimeout(s.url, 2500).then(function (j) {
                var cc = j ? s.get(j) : '';
                if (cc) {
                    try { sessionStorage.setItem(GEO_KEY, cc); } catch (e) {}
                    return cc;
                }
                return next();
            }).catch(next);
        }
        return next();
    }

    /* ---------- 初始化 ---------- */
    var forced = new URLSearchParams(location.search).get('lang');
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}

    if (forced === 'zh' || forced === 'en') {
        try { localStorage.setItem(LANG_KEY, forced); } catch (e) {}
        setLang(forced, false);
    } else if (forced === 'auto') {
        // ?lang=auto 清除手动选择，恢复按 IP 自动判断
        try { localStorage.removeItem(LANG_KEY); } catch (e) {}
        detectCountry().then(function (cc) {
            setLang(cc === 'CN' ? 'zh' : 'en', false);
        });
    } else if (saved === 'zh' || saved === 'en') {
        setLang(saved, false);
    } else {
        // 首次访问：先按英文渲染，检测到中国 IP 再切成中文
        detectCountry().then(function (cc) {
            setLang(cc === 'CN' ? 'zh' : 'en', false);
        });
    }

    window.I18N = {
        pick: pick,
        onChange: onChange,
        set: setLang,
        get lang() { return currentLang(); }
    };
})();
