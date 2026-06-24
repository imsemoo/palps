/* ==========================================================================
   شبكة الصحافة الفلسطينية — NPP News Theme
   كل تفاعلات الثيم (فانيلا JS، من غير أي مكتبات):
     1) قاموس اللغتين + التبديل عربي/إنجليزي
     2) الساعة اللحظية
     3) المشغّل الصوتي (تشغيل/سرعة/تقدّم/موجة) + المشغّل العائم
     4) مودال الفيديو (فتح/قفل/تبويبات/مقاطع ذات صلة)
   البيانات هنا تجريبية (placeholders) — لوحة الـ CMS هي اللي تحقن المحتوى الحقيقي.
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     1) اللغة — نصوص الواجهة فقط (المحتوى التحريري عربي ثابت في الـ HTML)
     ---------------------------------------------------------------------- */
  var I18N = {
    ar: {
      date: 'الثلاثاء، ٢٣ يونيو ٢٠٢٦', weather: 'القدس ٢٩°', signin: 'تسجيل الدخول', langBtn: 'EN',
      nav0: 'معالجات اخبارية', nav1: 'تحليلات وآراء', nav2: 'القصة في أرقام', nav3: 'القصة في صور', nav4: 'ميديا',
      breaking: 'عاجل', viewAll: 'عرض الكل', read: 'دقائق قراءة', minRead: 'د قراءة',
      ic: 'مركز المعلومات', icLive: 'مباشر', feedTitle: 'مركز الرصد المباشر',
      s_latest: 'أحدث المعالجات', s_analysis: 'تحليلات وآراء', s_numbers: 'القصة في أرقام',
      s_pictures: 'القصة في صور', s_most: 'الأكثر قراءة', s_audio: 'الموجز الصوتي اليومي',
      s_video: 'قصص مرئية', s_cover: 'تغطية تفاعلية', s_trend: 'الأكثر تداولاً',
      audioKicker: 'مُولّد بالذكاء الاصطناعي',
      audioDesc: 'موجز صوتي يومي يلخّص أبرز ما نشرته الشبكة خلال الساعات الأربع والعشرين الماضية، بصوتٍ اصطناعي واضح.',
      coverDesc: 'تتبّع الأحداث على الخريطة وعبر الخط الزمني، مع مؤشرات محدّثة لحظياً.',
      transcript: 'النصّ الكامل', download: 'تحميل', share: 'مشاركة', nowPlaying: 'يُبثّ الآن',
      watch: 'مشاهدة', script: 'النص', related: 'مقاطع ذات صلة',
      nl: 'النشرة البريدية', nlDesc: 'أبرز المعالجات والتحليلات في بريدك صباح كل يوم.',
      subscribe: 'اشتراك', emailPh: 'بريدك الإلكتروني',
      f_about: 'عن الشبكة', f_policy: 'السياسة التحريرية', f_sections: 'الأقسام', f_contact: 'تواصل',
      rights: '© ٢٠٢٦ شبكة الصحافة الفلسطينية. جميع الحقوق محفوظة.'
    },
    en: {
      date: 'Tuesday, 23 June 2026', weather: 'Jerusalem 29°', signin: 'Sign in', langBtn: 'ع',
      nav0: 'News', nav1: 'Analysis', nav2: 'In Numbers', nav3: 'In Pictures', nav4: 'Media',
      breaking: 'BREAKING', viewAll: 'View all', read: 'min read', minRead: 'min',
      ic: 'Intelligence Center', icLive: 'Live', feedTitle: 'Live Monitoring Desk',
      s_latest: 'Latest Coverage', s_analysis: 'Analysis & Opinion', s_numbers: 'The Story in Numbers',
      s_pictures: 'The Story in Pictures', s_most: 'Most Read', s_audio: 'Daily Audio Brief',
      s_video: 'Visual Stories', s_cover: 'Interactive Coverage', s_trend: 'Trending',
      audioKicker: 'AI-generated',
      audioDesc: "A daily spoken brief summarising the network's key reporting from the past 24 hours in a clear synthetic voice.",
      coverDesc: 'Follow events across the map and along the timeline, with indicators updated in real time.',
      transcript: 'Full transcript', download: 'Download', share: 'Share', nowPlaying: 'Now playing',
      watch: 'Watch', script: 'Transcript', related: 'Related clips',
      nl: 'Newsletter', nlDesc: 'Top coverage and analysis in your inbox every morning.',
      subscribe: 'Subscribe', emailPh: 'Your email',
      f_about: 'About', f_policy: 'Editorial policy', f_sections: 'Sections', f_contact: 'Contact',
      rights: '© 2026 Palestinian Press Network. All rights reserved.'
    }
  };

  var root = document.querySelector('.npp');
  var state = { lang: 'ar', playing: false, progress: 0.34, speedIdx: 1 };
  var SPEEDS = [0.75, 1, 1.25, 1.5];
  var AUDIO_TOTAL = 522; // 8:42 بالثواني

  function applyLang(lang) {
    state.lang = lang;
    var dict = I18N[lang];
    var dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (root) root.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-ph');
      if (dict[key] != null) el.setAttribute('placeholder', dict[key]);
    });
    updateClock();
  }

  /* ----------------------------------------------------------------------
     2) الساعة اللحظية
     ---------------------------------------------------------------------- */
  function updateClock() {
    var locale = state.lang === 'ar' ? 'ar-EG' : 'en-GB';
    var txt = new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.querySelectorAll('[data-clock]').forEach(function (el) { el.textContent = txt; });
  }

  /* ----------------------------------------------------------------------
     3) المشغّل الصوتي
     ---------------------------------------------------------------------- */
  // موجة صوتية محسوبة (76 عمود) — نفس معادلة التصميم الأصلي
  var WAVE = [];
  for (var i = 0; i < 76; i++) {
    WAVE.push(0.22 + 0.78 * Math.abs(Math.sin(i * 0.45) * Math.cos(i * 0.12) + 0.25 * Math.sin(i * 0.9)));
  }

  var waveEl = document.querySelector('[data-waveform]');
  var audioTimer = null;

  function buildWaveform() {
    if (!waveEl) return;
    WAVE.forEach(function (h) {
      var bar = document.createElement('span');
      bar.className = 'waveform__bar';
      bar.style.height = (h * 100).toFixed(1) + '%';
      waveEl.appendChild(bar);
    });
  }

  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function renderAudio() {
    var prog = state.progress;
    // أعمدة الموجة: قبل المؤشر أحمر، بعده رمادي
    if (waveEl) {
      var bars = waveEl.children;
      for (var i = 0; i < bars.length; i++) {
        bars[i].style.background = (i / bars.length) <= prog ? '#B0122A' : '#D8D3CA';
      }
    }
    var pct = (prog * 100).toFixed(1) + '%';
    document.querySelectorAll('[data-audio-fill]').forEach(function (el) { el.style.width = pct; });
    document.querySelectorAll('[data-audio-cur]').forEach(function (el) { el.textContent = fmt(prog * AUDIO_TOTAL); });
    document.querySelectorAll('[data-audio-rem]').forEach(function (el) { el.textContent = '-' + fmt(AUDIO_TOTAL - prog * AUDIO_TOTAL); });
    document.querySelectorAll('[data-audio-speed]').forEach(function (el) { el.textContent = '×' + SPEEDS[state.speedIdx]; });
  }

  function setPlaying(playing) {
    state.playing = playing;
    if (root) root.classList.toggle('is-playing', playing);
    clearInterval(audioTimer);
    if (playing) {
      audioTimer = setInterval(function () {
        var step = (0.45 * SPEEDS[state.speedIdx]) / AUDIO_TOTAL;
        state.progress += step;
        if (state.progress >= 1) { state.progress = 1; renderAudio(); setPlaying(false); return; }
        renderAudio();
      }, 100);
    }
  }

  function togglePlay() { setPlaying(!state.playing); }

  function seekFromEvent(e) {
    var r = e.currentTarget.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width;
    if (state.lang === 'ar') x = 1 - x; // الواجهة من اليمين لليسار
    state.progress = Math.max(0, Math.min(1, x));
    renderAudio();
  }

  function cycleSpeed() {
    state.speedIdx = (state.speedIdx + 1) % SPEEDS.length;
    renderAudio();
  }

  /* ----------------------------------------------------------------------
     4) مشغّل الفيديو (بوب أب نظيف) + لايت‌بوكس الصور
     ---------------------------------------------------------------------- */
  // صور حقيقية من palps.net (محليّة في assets/img/news) — تتبدّل بصور الـ CMS عند التركيب
  var IMG = [
    'assets/img/news/ghzh-7.jpg', 'assets/img/news/photo-2026-06-23-12-56-55.jpg', 'assets/img/news/almqawmh.webp',
    'assets/img/news/mstshfyat.webp', 'assets/img/news/rfh.jpg', 'assets/img/news/photo-2026-02-06-10-39-29.jpg',
    'assets/img/news/jrghwn.jpg', 'assets/img/news/abd-alaaty.jpg', 'assets/img/news/photo-2026-03-31-10-16-37.jpg',
    'assets/img/news/alaml.jpg', 'assets/img/news/photo_2025-12-01_11-18-59.jpg', 'assets/img/news/amjd-5.png',
    'assets/img/news/photo-2026-01-13-13-33-02.jpg', 'assets/img/news/7bd23523-0bad-426f-88e9-8ed230105d3c_16x9_1200x676.webp',
    'assets/img/news/photo-2026-01-10-11-14-53.jpg', 'assets/img/news/f0a24783-ba06-4435-8a45-0f16a4c4be91.jpg',
    'assets/img/news/102946-mpg-00-19-30-16-still003.webp', 'assets/img/news/photo-2026-01-09-21-10-45.jpg',
    'assets/img/news/vxgjw.webp', 'assets/img/news/thumbs-b-c-a0e7fa30afe671de3b70ba1ede15467f.jpg',
    'assets/img/news/mgfzb.jpeg', 'assets/img/news/img_20240814_131221_687.jpg'
  ];

  var VIDEOS = [
    { x: 'فضيحة منصة الكود.. تمويل حملات تشويه وابتزاز ضد رجال أعمال غزة', cat: 'تحقيق', dur: '١٢:٤٠' },
    { x: 'مسؤولو العصابات العميلة في غزة.. ضباط بأجهزة السلطة', cat: 'وثائقي', dur: '٠٨:١٥' },
    { x: 'الاعتراف بإقليم صوماليلاند.. خطوة تكشف مشروع إسرائيل الإقليمي', cat: 'تحليل', dur: '٠٦:٣٢' },
    { x: 'شهد الشرفا.. بوق فتح الناعم لتشويه المقاومة وتبييض الاحتلال', cat: 'ميديا', dur: '٠٥:٥٠' }
  ];

  // مساعدات الأرقام والوقت
  function toAr(n) { return String(n).replace(/[0-9]/g, function (d) { return String.fromCharCode(0x660 + (+d)); }); }
  function toLat(s) { return String(s).replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x660); }); }
  function durToSec(d) { var p = toLat(d).split(':'); return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0); }
  function fmtT(sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return toAr(m + ':' + (s < 10 ? '0' + s : s)); }
  function lockScroll(on) { try { document.body.style.overflow = on ? 'hidden' : ''; } catch (e) {} }

  // ── المشغّل ──
  var player = document.querySelector('[data-player]');
  var pl = { total: 0, cur: 0, playing: false, timer: null };
  function pq(sel) { return player ? player.querySelector(sel) : null; }
  function playerRender() {
    var fill = pq('[data-player-fill]'); if (fill) fill.style.width = (pl.total ? (pl.cur / pl.total * 100) : 0) + '%';
    var cur = pq('[data-player-cur]'); if (cur) cur.textContent = fmtT(pl.cur);
  }
  function playerSetPlaying(on) {
    pl.playing = on; if (player) player.classList.toggle('is-playing', on);
    clearInterval(pl.timer);
    if (on) {
      pl.timer = setInterval(function () {
        pl.cur += 1;
        if (pl.cur >= pl.total) { pl.cur = pl.total; playerRender(); playerSetPlaying(false); return; }
        playerRender();
      }, 1000);
    }
  }
  function openPlayer(index) {
    if (!player) return; var v = VIDEOS[index]; if (!v) return;
    var img = pq('[data-player-img]'); if (img) img.src = IMG[index % IMG.length];
    var cat = pq('[data-player-cat]'); if (cat) cat.textContent = v.cat;
    var md = pq('[data-player-meta-dur]'); if (md) md.textContent = v.dur;
    var t = pq('[data-player-title]'); if (t) t.textContent = v.x;
    var dur = pq('[data-player-dur]'); if (dur) dur.textContent = v.dur;
    pl.total = durToSec(v.dur); pl.cur = 0; playerSetPlaying(false); playerRender();
    player.classList.add('is-open'); lockScroll(true);
  }
  function closePlayer() { if (!player) return; playerSetPlaying(false); player.classList.remove('is-open'); lockScroll(false); }
  function playerToggle() { playerSetPlaying(!pl.playing); }
  function playerSeek(e) {
    var bar = pq('[data-player-bar]'); if (!bar) return;
    var r = bar.getBoundingClientRect(); var x = (e.clientX - r.left) / r.width;
    pl.cur = Math.max(0, Math.min(1, x)) * pl.total; playerRender();
  }

  // ── اللايت‌بوكس (معرض الصور) ──
  var GAL = {
    jenin: { title: 'أهالي المعتقلين السياسيين في جنين يفضحون التعذيب داخل سجون السلطة', date: '٣١ مارس ٢٠٢٦', n: 14, seed: 'npp-jenin' },
    teachers: { title: 'المعلمون في الضفة.. حقوق مسلوبة وأمل ضائع بين وعود الإصلاح وواقع الفساد', date: '١ ديسمبر ٢٠٢٥', n: 9, seed: 'npp-teachers' }
  };
  var lb = document.querySelector('[data-lightbox]');
  var lbState = { key: null, i: 0 };
  function lq(sel) { return lb ? lb.querySelector(sel) : null; }
  function lbRender() {
    var g = GAL[lbState.key]; if (!g) return;
    var img = lq('[data-lb-img]');
    if (img) {
      var src = IMG[(lbState.i + (lbState.key === 'teachers' ? 11 : 0)) % IMG.length];
      img.style.opacity = '0';
      var pre = new Image();
      pre.onload = pre.onerror = function () { img.src = src; img.style.opacity = ''; };
      pre.src = src;
    }
    var cur = lq('[data-lb-cur]'); if (cur) cur.textContent = toAr(lbState.i + 1);
    var tot = lq('[data-lb-total]'); if (tot) tot.textContent = toAr(g.n);
    var t = lq('[data-lb-title]'); if (t) t.textContent = g.title;
    var d = lq('[data-lb-date]'); if (d) d.textContent = g.date;
  }
  function openLightbox(key, index) {
    if (!lb || !GAL[key]) return;
    lbState.key = key; lbState.i = Math.max(0, Math.min(GAL[key].n - 1, index || 0));
    lbRender(); lb.classList.add('is-open'); lockScroll(true);
  }
  function closeLightbox() { if (!lb) return; lb.classList.remove('is-open'); lockScroll(false); }
  function lbStep(delta) { var g = GAL[lbState.key]; if (!g) return; lbState.i = (lbState.i + delta + g.n) % g.n; lbRender(); }

  /* ----------------------------------------------------------------------
     ربط الأحداث (Event wiring)
     ---------------------------------------------------------------------- */
  function wire() {
    // اللغة
    document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () { applyLang(state.lang === 'ar' ? 'en' : 'ar'); });
    });

    // الصوت
    document.querySelectorAll('[data-audio-toggle]').forEach(function (btn) {
      btn.addEventListener('click', togglePlay);
    });
    document.querySelectorAll('[data-audio-speed-btn]').forEach(function (btn) {
      btn.addEventListener('click', cycleSpeed);
    });
    if (waveEl) waveEl.addEventListener('click', seekFromEvent);

    // فتح الفيديو في المشغّل + فتح المعرض في اللايت‌بوكس (تفويض على المستند)
    document.addEventListener('click', function (e) {
      var v = e.target.closest('[data-video-index]');
      if (v) { e.preventDefault(); openPlayer(parseInt(v.getAttribute('data-video-index'), 10)); return; }
      var g = e.target.closest('[data-open-gallery]');
      if (g) { e.preventDefault(); openLightbox(g.getAttribute('data-open-gallery'), parseInt(g.getAttribute('data-open-index'), 10) || 0); }
    });

    // تحكّم المشغّل
    if (player) {
      player.addEventListener('click', function (e) {
        if (e.target.closest('[data-player-close]')) return closePlayer();
        if (e.target.closest('[data-player-toggle]')) return playerToggle();
        if (e.target.closest('[data-player-bar]')) return playerSeek(e);
        if (!e.target.closest('.player__dialog')) closePlayer();
      });
    }

    // تحكّم اللايت‌بوكس
    if (lb) {
      lb.addEventListener('click', function (e) {
        if (e.target.closest('[data-lb-close]')) return closeLightbox();
        if (e.target.closest('[data-lb-prev]')) return lbStep(-1);
        if (e.target.closest('[data-lb-next]')) return lbStep(1);
        if (!e.target.closest('[data-lb-img]')) closeLightbox();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closePlayer(); closeLightbox(); }
      if (lb && lb.classList.contains('is-open')) {
        if (e.key === 'ArrowLeft') lbStep(1);
        else if (e.key === 'ArrowRight') lbStep(-1);
      }
    });
  }

  /* ----------------------------------------------------------------------
     الإقلاع
     ---------------------------------------------------------------------- */
  function init() {
    buildWaveform();
    wire();
    applyLang('ar');
    renderAudio();
    updateClock();
    setInterval(updateClock, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


/* ======================================================================
   تفاعلات الصفحات الداخلية (كل بلوك IIFE مستقل، يتحرّس بوجود عناصره)
   ====================================================================== */

/* --- article.html --- */
/* ===== article.html — تفاعلات الصفحة ===== */
(function () {
  'use strict';
  var prog = document.querySelector('[data-read-progress]');
  var body = document.querySelector('[data-article-body]');
  var listen = document.querySelector('[data-listen]');
  var toast = document.querySelector('[data-toast]');
  var shareBtns = document.querySelectorAll('[data-share]');
  var saveBtn = document.querySelector('[data-save-toggle]');
  var incBtn = document.querySelector('[data-font-inc]');
  var decBtn = document.querySelector('[data-font-dec]');
  if (!prog && !listen && !toast && !shareBtns.length && !saveBtn && !incBtn && !decBtn) return;

  /* شريط تقدّم القراءة */
  if (prog && body) {
    var fill = prog.querySelector('.article__progress-fill');
    var onScroll = function () {
      var r = body.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = Math.max(r.height - vh + 240, 1);
      var passed = Math.min(Math.max(-r.top + vh * 0.4, 0), total);
      if (fill) fill.style.width = Math.min(100, (passed / total) * 100) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* إشعار منبثق */
  var toastTimer = null;
  function flashToast(msg) {
    if (!toast) return;
    var t = toast.querySelector('[data-toast-text]');
    if (t) t.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
  }

  /* أزرار المشاركة */
  var SHARE_MSG = {
    facebook: 'تمت المشاركة على فيسبوك',
    x: 'تمت المشاركة على إكس',
    whatsapp: 'تمت المشاركة على واتساب',
    telegram: 'تمت المشاركة على تيليجرام',
    copy: 'تم نسخ الرابط'
  };
  Array.prototype.forEach.call(shareBtns, function (btn) {
    btn.addEventListener('click', function () {
      var kind = btn.getAttribute('data-share');
      if (kind === 'copy') {
        try { if (navigator.clipboard) navigator.clipboard.writeText(window.location.href); } catch (e) {}
      }
      flashToast(SHARE_MSG[kind] || 'تمت المشاركة');
    });
  });

  /* حفظ المقال */
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      var saved = saveBtn.classList.toggle('is-saved');
      flashToast(saved ? 'تم حفظ المقال' : 'أُزيل من المحفوظات');
    });
  }

  /* تكبير/تصغير الخط */
  if (body && (incBtn || decBtn)) {
    var fs = 18.5;
    var apply = function () { body.style.fontSize = fs.toFixed(1) + 'px'; };
    if (incBtn) incBtn.addEventListener('click', function () { fs = Math.min(24.95, fs + 1.85); apply(); });
    if (decBtn) decBtn.addEventListener('click', function () { fs = Math.max(15.7, fs - 1.85); apply(); });
  }

  /* مشغّل الاستماع للمقال */
  if (listen) {
    var toggle = listen.querySelector('[data-listen-toggle]');
    var waveEl = listen.querySelector('[data-listen-wave]');
    var speedBtn = listen.querySelector('[data-listen-speed]');
    var curEl = listen.querySelector('[data-listen-cur]');
    var durEl = listen.querySelector('[data-listen-dur]');
    var SPEEDS = [0.75, 1, 1.25, 1.5];
    var TOTAL = 372;
    var st = { playing: false, progress: 0, speedIdx: 1 };
    var timer = null;
    var bars = [];

    var WAVE = [];
    for (var i = 0; i < 54; i++) {
      WAVE.push(0.25 + 0.75 * Math.abs(Math.sin(i * 0.5) * Math.cos(i * 0.13) + 0.3 * Math.sin(i * 0.9)));
    }
    if (waveEl) {
      WAVE.forEach(function (h) {
        var bar = document.createElement('span');
        bar.className = 'article__wave-bar';
        bar.style.height = (h * 100).toFixed(1) + '%';
        waveEl.appendChild(bar);
        bars.push(bar);
      });
    }

    function fmt(sec) {
      sec = Math.max(0, Math.round(sec));
      var m = Math.floor(sec / 60), s = sec % 60;
      return m + ':' + String(s).padStart(2, '0');
    }
    function render() {
      for (var i = 0; i < bars.length; i++) {
        bars[i].style.background = (i / bars.length) <= st.progress ? '#cdbf6a' : '#3a372f';
      }
      if (curEl) curEl.textContent = fmt(st.progress * TOTAL);
      if (durEl) durEl.textContent = fmt(TOTAL);
      if (speedBtn) speedBtn.textContent = '×' + SPEEDS[st.speedIdx];
    }
    function setPlaying(p) {
      st.playing = p;
      listen.classList.toggle('is-playing', p);
      if (toggle) toggle.classList.toggle('is-playing', p);
      clearInterval(timer);
      if (p) {
        timer = setInterval(function () {
          st.progress += (0.4 * SPEEDS[st.speedIdx]) / TOTAL;
          if (st.progress >= 1) { st.progress = 1; render(); setPlaying(false); return; }
          render();
        }, 100);
      }
    }
    if (toggle) toggle.addEventListener('click', function () { setPlaying(!st.playing); });
    if (speedBtn) speedBtn.addEventListener('click', function () { st.speedIdx = (st.speedIdx + 1) % SPEEDS.length; render(); });
    if (waveEl) waveEl.addEventListener('click', function (e) {
      var r = waveEl.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      if (document.documentElement.getAttribute('dir') !== 'ltr') x = 1 - x;
      st.progress = Math.max(0, Math.min(1, x));
      render();
    });
    render();
  }
})();

/* --- articles.html --- */
/* ===== articles.html — تصفية وفرز الأرشيف الحيّ ===== */
(function () {
  'use strict';
  var root = document.querySelector('[data-articles-root]');
  if (!root) return; // مش موجود في الصفحة الحالية

  var listEl   = root.querySelector('[data-articles-list]');
  var items    = Array.prototype.slice.call(root.querySelectorAll('[data-articles-item]'));
  var totalEl  = root.querySelector('[data-articles-total]');
  var emptyEl  = root.querySelector('[data-articles-empty]');
  var chipsEl  = root.querySelector('[data-articles-chips]');
  var queryEl  = document.querySelector('[data-articles-query]');
  var clearEl  = document.querySelector('[data-articles-clear]');
  if (!listEl || !items.length) return;

  var CAT_LABEL = {
    all: 'كل التصنيفات', news: 'معالجات اخبارية', analysis: 'تحليلات وآراء',
    numbers: 'القصة في أرقام', pictures: 'القصة في صور', media: 'ميديا'
  };
  var TYPE_LABEL = { article: 'مقال', video: 'فيديو', audio: 'صوتي', graphic: 'رسم بياني' };
  var TIME_LABEL = { any: 'أي وقت', today: 'اليوم', week: 'هذا الأسبوع', month: 'هذا الشهر' };
  var TIME_LIMIT = { today: 0, week: 7, month: 31 };

  var state = { query: '', cat: 'all', types: [], time: 'any', sort: 'new' };

  // فهرس أصلي للحفاظ على ترتيب «الأحدث» بدون الاعتماد على الـ DOM وحده
  items.forEach(function (el, i) {
    el._order = i;
    el._days = parseInt(el.getAttribute('data-days'), 10) || 0;
    el._reads = parseInt(el.getAttribute('data-reads'), 10) || 0;
    el._cat = el.getAttribute('data-cat');
    el._type = el.getAttribute('data-type');
    el._text = (el.getAttribute('data-text') || '');
  });

  function matches(el) {
    if (state.cat !== 'all' && el._cat !== state.cat) return false;
    if (state.types.length && state.types.indexOf(el._type) === -1) return false;
    if (state.time !== 'any' && el._days > TIME_LIMIT[state.time]) return false;
    var q = state.query.trim();
    if (q && el._text.indexOf(q) === -1) return false;
    return true;
  }

  function sortItems(list) {
    var arr = list.slice();
    if (state.sort === 'new') arr.sort(function (a, b) { return a._days - b._days || a._order - b._order; });
    else arr.sort(function (a, b) { return b._reads - a._reads; }); // read + rel
    return arr;
  }

  function renderChips() {
    if (!chipsEl) return;
    var chips = [];
    if (state.query.trim()) chips.push({ label: '«' + state.query.trim() + '»', clear: function () { setQuery(''); } });
    if (state.cat !== 'all') chips.push({ label: CAT_LABEL[state.cat], clear: function () { pickCat('all'); } });
    state.types.forEach(function (t) { chips.push({ label: TYPE_LABEL[t], clear: function () { toggleType(t); } }); });
    if (state.time !== 'any') chips.push({ label: TIME_LABEL[state.time], clear: function () { pickTime('any'); } });

    chipsEl.innerHTML = '';
    if (!chips.length) { chipsEl.hidden = true; return; }
    chipsEl.hidden = false;
    chips.forEach(function (c) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'articles__chip';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#8A857E" stroke-width="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>';
      btn.insertBefore(document.createTextNode(c.label), btn.firstChild);
      btn.addEventListener('click', c.clear);
      chipsEl.appendChild(btn);
    });
  }

  function updateCounts() {
    // عدّ لكل تصنيف مع تطبيق باقي الفلاتر (عدا التصنيف نفسه)
    root.querySelectorAll('[data-articles-count-for]').forEach(function (el) {
      var key = el.getAttribute('data-articles-count-for');
      var n = items.filter(function (it) {
        if (state.types.length && state.types.indexOf(it._type) === -1) return false;
        if (state.time !== 'any' && it._days > TIME_LIMIT[state.time]) return false;
        var q = state.query.trim();
        if (q && it._text.indexOf(q) === -1) return false;
        return key === 'all' || it._cat === key;
      }).length;
      el.textContent = toArabic(n);
    });
  }

  function toArabic(n) {
    var map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(n).replace(/\d/g, function (d) { return map[+d]; });
  }

  function render() {
    var visible = items.filter(matches);
    var ordered = sortItems(visible);
    // إعادة الترتيب في الـ DOM
    ordered.forEach(function (el) { listEl.appendChild(el); });
    items.forEach(function (el) { el.hidden = visible.indexOf(el) === -1; });

    if (totalEl) totalEl.textContent = toArabic(visible.length);
    if (emptyEl) emptyEl.hidden = visible.length !== 0;
    listEl.hidden = visible.length === 0;
    renderChips();
    updateCounts();
  }

  function setActive(nodes, attr, val) {
    nodes.forEach(function (n) { n.classList.toggle('is-active', n.getAttribute(attr) === val); });
  }

  function setQuery(v) {
    state.query = v;
    if (queryEl) queryEl.value = v;
    if (clearEl) clearEl.hidden = !v;
    render();
  }
  function pickCat(k) {
    state.cat = k;
    setActive(root.querySelectorAll('[data-articles-cat]'), 'data-articles-cat', k);
    render();
  }
  function toggleType(k) {
    var i = state.types.indexOf(k);
    if (i === -1) state.types.push(k); else state.types.splice(i, 1);
    var box = root.querySelector('[data-articles-type="' + k + '"]');
    if (box) box.checked = state.types.indexOf(k) !== -1;
    render();
  }
  function pickTime(k) {
    state.time = k;
    setActive(root.querySelectorAll('[data-articles-time]'), 'data-articles-time', k);
    render();
  }
  function pickSort(k) {
    state.sort = k;
    setActive(root.querySelectorAll('[data-articles-sort]'), 'data-articles-sort', k);
    render();
  }
  function pickView(v) {
    setActive(root.querySelectorAll('[data-articles-view]'), 'data-articles-view', v);
    listEl.classList.toggle('is-list', v === 'list');
  }
  function reset() {
    state.types = [];
    root.querySelectorAll('[data-articles-type]').forEach(function (b) { b.checked = false; });
    pickCat('all');
    pickTime('any');
    setQuery('');
  }

  // ربط الأحداث
  if (queryEl) queryEl.addEventListener('input', function () { setQuery(queryEl.value); });
  if (clearEl) clearEl.addEventListener('click', function () { setQuery(''); if (queryEl) queryEl.focus(); });
  document.querySelectorAll('[data-articles-suggest]').forEach(function (b) {
    b.addEventListener('click', function () { setQuery(b.getAttribute('data-articles-suggest')); });
  });
  root.querySelectorAll('[data-articles-cat]').forEach(function (b) {
    b.addEventListener('click', function () { pickCat(b.getAttribute('data-articles-cat')); });
  });
  root.querySelectorAll('[data-articles-type]').forEach(function (b) {
    b.addEventListener('change', function () { toggleType(b.getAttribute('data-articles-type')); });
  });
  root.querySelectorAll('[data-articles-time]').forEach(function (b) {
    b.addEventListener('click', function () { pickTime(b.getAttribute('data-articles-time')); });
  });
  root.querySelectorAll('[data-articles-sort]').forEach(function (b) {
    b.addEventListener('click', function () { pickSort(b.getAttribute('data-articles-sort')); });
  });
  root.querySelectorAll('[data-articles-view]').forEach(function (b) {
    b.addEventListener('click', function () { pickView(b.getAttribute('data-articles-view')); });
  });
  root.querySelectorAll('[data-articles-reset]').forEach(function (b) {
    b.addEventListener('click', reset);
  });

  render();
})();

/* --- author.html --- */
/* ===== author.html — تفاعلات صفحة الكاتب (متابعة + تبويبات + خريطة نشاط) ===== */
(function () {
  'use strict';
  var tabsBar = document.querySelector('[data-author-tabs]');
  var followBtn = document.querySelector('[data-author-follow]');
  var heatBox = document.querySelector('[data-author-heat]');
  if (!tabsBar && !followBtn && !heatBox) return; // مش صفحة الكاتب

  /* زر المتابعة: يبدّل الحالة + عدّاد المتابعين */
  if (followBtn) {
    var labelEl = followBtn.querySelector('[data-author-follow-label]');
    var followersEl = document.querySelector('[data-author-followers]');
    var following = false;
    followBtn.addEventListener('click', function () {
      following = !following;
      followBtn.classList.toggle('is-following', following);
      if (labelEl) labelEl.textContent = following ? 'تتابعه' : 'متابعة';
      if (followersEl) followersEl.textContent = following ? '٣٢٫١ ألف' : '٣٢٫٠ ألف';
    });
  }

  /* التبويبات: إظهار اللوح المطابق */
  if (tabsBar) {
    var btns = tabsBar.querySelectorAll('[data-author-tab]');
    var panels = document.querySelectorAll('[data-author-panel]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-author-tab');
        btns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        panels.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-author-panel') === key); });
      });
    });
  }

  /* خريطة نشاط النشر: ١٨×٧ خلية بمولّد شبه-عشوائي ثابت (نفس بذرة التصميم) */
  if (heatBox && !heatBox.children.length) {
    var seed = 7;
    var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (var i = 0; i < 18 * 7; i++) {
      var r = rnd();
      var lvl = r > 0.82 ? 3 : r > 0.62 ? 2 : r > 0.34 ? 1 : 0;
      var cell = document.createElement('span');
      cell.className = 'author-heat__cell author-heat__cell--' + lvl;
      cell.title = lvl === 0 ? 'لا نشر' : lvl + ' مقال';
      heatBox.appendChild(cell);
    }
  }
})();

/* --- about.html --- */
/* ===== about.html — count-up للأرقام عند ظهور القسم ===== */
(function () {
  'use strict';
  var band = document.querySelector('[data-counters]');
  if (!band) return;
  var nodes = band.querySelectorAll('[data-count-to]');
  if (!nodes.length) return;

  function toAr(n) {
    var f = Math.round(n).toLocaleString('en-US');
    return f.replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }).replace(/,/g, '٬');
  }

  var done = false;
  function run() {
    if (done) return;
    done = true;
    var start = Date.now(), dur = 1300, timer;
    timer = setInterval(function () {
      var p = Math.min((Date.now() - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      nodes.forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-count-to')) || 0;
        el.textContent = toAr(target * e);
      });
      if (p >= 1) clearInterval(timer);
    }, 40);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(); io.disconnect(); } });
    }, { threshold: 0.15 });
    io.observe(band);
    setTimeout(function () { if (!done) { run(); io.disconnect(); } }, 1400);
  } else {
    run();
  }
})();

/* --- contact.html --- */
/* ===== contact.html ===== */
/* تفاعلات صفحة «تواصل»: نوع الرسالة + مفتاح السرّية + تحقّق الفورم + النجاح + FAQ.
   IIFE قائمة بذاتها، تتحرّس بوجود عناصرها وترجع بدري لو مش موجودة. */
(function () {
  'use strict';

  var formCard = document.querySelector('[data-contact-form]');
  var faqList = document.querySelector('[data-contact-faq]');
  if (!formCard && !faqList) return;

  /* ---- الفورم ---- */
  if (formCard) {
    var formView = formCard.querySelector('[data-contact-form-view]');
    var successView = formCard.querySelector('[data-contact-success]');
    var purposesWrap = formCard.querySelector('[data-contact-purposes]');
    var secureBtn = formCard.querySelector('[data-contact-secure]');
    var identity = formCard.querySelector('[data-contact-identity]');
    var secureNote = formCard.querySelector('[data-contact-secure-note]');
    var submitBtn = formCard.querySelector('[data-contact-submit]');
    var resetBtn = formCard.querySelector('[data-contact-reset]');
    var refEl = formCard.querySelector('[data-contact-ref]');

    var fields = {};
    ['name', 'email', 'subject', 'message'].forEach(function (f) {
      fields[f] = formCard.querySelector('[data-f="' + f + '"]');
    });

    var secure = false;

    function setSecure(on) {
      secure = on;
      if (secureBtn) secureBtn.setAttribute('aria-checked', on ? 'true' : 'false');
      if (identity) identity.hidden = on;
      if (secureNote) secureNote.hidden = !on;
      if (on) { clearError('name'); clearError('email'); }
    }

    function clearError(f) {
      var box = formCard.querySelector('[data-error="' + f + '"]');
      if (box) box.textContent = '';
      if (fields[f]) fields[f].classList.remove('is-invalid');
    }

    function setError(f, msg) {
      var box = formCard.querySelector('[data-error="' + f + '"]');
      if (box) box.textContent = msg;
      if (fields[f]) fields[f].classList.add('is-invalid');
    }

    /* نوع الرسالة — اختيار «بلاغ سرّي» يفعّل الوضع السرّي */
    if (purposesWrap) {
      purposesWrap.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-purpose]');
        if (!btn) return;
        purposesWrap.querySelectorAll('[data-purpose]').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        if (btn.getAttribute('data-purpose') === 'tip') setSecure(true);
      });
    }

    if (secureBtn) {
      secureBtn.addEventListener('click', function () { setSecure(!secure); });
    }

    /* إزالة الخطأ عند الكتابة */
    Object.keys(fields).forEach(function (f) {
      if (fields[f]) fields[f].addEventListener('input', function () { clearError(f); });
    });

    function val(f) { return fields[f] && fields[f].value ? fields[f].value.trim() : ''; }

    if (submitBtn) {
      submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var ok = true;
        ['name', 'email', 'subject', 'message'].forEach(clearError);

        if (!secure) {
          if (!val('name')) { setError('name', 'الرجاء إدخال الاسم.'); ok = false; }
          var em = val('email');
          if (!em) { setError('email', 'الرجاء إدخال البريد.'); ok = false; }
          else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setError('email', 'صيغة البريد غير صحيحة.'); ok = false; }
        }
        if (!val('subject')) { setError('subject', 'الرجاء إدخال الموضوع.'); ok = false; }
        var msg = val('message');
        if (!msg) { setError('message', 'الرجاء كتابة الرسالة.'); ok = false; }
        else if (msg.length < 10) { setError('message', 'الرسالة قصيرة جداً (١٠ أحرف على الأقل).'); ok = false; }

        if (!ok) return;

        var ref = 'NPP-2026-' + Math.floor(1000 + Math.random() * 9000);
        if (refEl) refEl.textContent = ref;
        if (formView) formView.hidden = true;
        if (successView) successView.hidden = false;
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        Object.keys(fields).forEach(function (f) {
          if (fields[f]) fields[f].value = '';
          clearError(f);
        });
        if (successView) successView.hidden = true;
        if (formView) formView.hidden = false;
      });
    }
  }

  /* ---- FAQ (accordion) ---- */
  if (faqList) {
    faqList.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-faq-toggle]');
      if (!btn) return;
      var item = btn.closest('.contact__faq-item');
      if (!item) return;
      var isOpen = item.classList.contains('is-open');
      faqList.querySelectorAll('.contact__faq-item').forEach(function (it) {
        it.classList.remove('is-open');
      });
      if (!isOpen) item.classList.add('is-open');
    });
  }
})();


/* ======================================================================
   "القصة في أرقام" — لوحة بيانات: يبني الرسم البياني الشهري + عدّاد تصاعدي
   للمؤشرات، ويظهر بالحركة عند دخول القسم. يحترم prefers-reduced-motion.
   ====================================================================== */
(function () {
  'use strict';
  var bars = document.querySelector('[data-figbars]');
  var monthsEl = document.querySelector('[data-figmonths]');
  var panel = bars ? bars.closest('.datapanel') : null;
  if (!bars || !monthsEl || !panel) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function toAr(n) { return String(n).replace(/[0-9]/g, function (d) { return String.fromCharCode(0x660 + (+d)); }); }

  // خروقات موثّقة شهرياً (تجريبية) — المجموع ٣٢٦٩، الذروة في أبريل
  var MONTHS = ['نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
  var DATA = [261, 318, 366, 402, 470, 612, 525, 315];
  var peak = DATA.indexOf(Math.max.apply(null, DATA));
  var max = DATA[peak];

  var fills = [];
  DATA.forEach(function (v, i) {
    var bar = document.createElement('div');
    bar.className = 'fbar' + (i === peak ? ' fbar--peak' : '');
    var fill = document.createElement('span');
    fill.className = 'fbar__fill';
    fill.setAttribute('title', MONTHS[i] + '：' + toAr(v) + ' خرقاً');
    var val = document.createElement('span');
    val.className = 'fbar__val';
    val.textContent = toAr(v);
    fill.appendChild(val);
    bar.appendChild(fill);
    bars.appendChild(bar);
    fills.push({ el: fill, pct: (v / max) * 100 });

    var m = document.createElement('span');
    m.className = 'fmonth' + (i === peak ? ' fmonth--peak' : '');
    m.textContent = MONTHS[i];
    monthsEl.appendChild(m);
  });

  var nums = panel.querySelectorAll('[data-countup][data-to]');
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-to'), 10) || 0;
    if (reduce) { el.textContent = toAr(to); return; }
    var dur = 1400, start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = toAr(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function reveal() {
    fills.forEach(function (f) { f.el.style.height = f.pct + '%'; });
    nums.forEach(countUp);
  }

  if (reduce || !('IntersectionObserver' in window)) { reveal(); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { reveal(); io.disconnect(); } });
  }, { threshold: 0.3 });
  io.observe(panel);
})();


/* ======================================================================
   "القصة في صور" — film-strip gallery: hover/click a frame to enlarge it
   in the stage, with the frame counter following. Scoped to [data-essay].
   ====================================================================== */
(function () {
  'use strict';
  var roots = document.querySelectorAll('[data-essay]');
  if (!roots.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  roots.forEach(function (root) {
    var hero = root.querySelector('[data-essay-hero]');
    var count = root.querySelector('[data-essay-count]');
    var frames = root.querySelectorAll('[data-essay-frame]');
    if (!hero || !frames.length) return;
    var swapTimer = null;

    function select(btn) {
      var src = btn.getAttribute('data-src');
      if (src && hero.getAttribute('src') !== src) {
        clearTimeout(swapTimer);
        if (reduce) {
          hero.setAttribute('src', src);
        } else {
          hero.style.opacity = '0';
          swapTimer = setTimeout(function () {
            hero.setAttribute('src', src);
            hero.style.opacity = '';
          }, 180);
        }
      }
      for (var i = 0; i < frames.length; i++) {
        frames[i].classList.toggle('is-active', frames[i] === btn);
      }
      if (count) {
        var no = btn.querySelector('.frame__no');
        if (no) count.textContent = no.textContent;
      }
    }

    // المرور/التركيز يعاين الإطار في المنصّة؛ الضغط يفتح المعرض (لايت‌بوكس) عبر data-open-gallery
    frames.forEach(function (btn) {
      btn.addEventListener('mouseenter', function () { select(btn); });
      btn.addEventListener('focus', function () { select(btn); });
    });
  });
})();


/* ======================================================================
   "تغطية تفاعلية" — خريطة حيّة (Leaflet) ببلاطات داكنة وعلامات تفتح كارت
   الموقع الجانبي. Scoped to [data-geomap-canvas] + [data-loc-card].
   ====================================================================== */
(function () {
  'use strict';
  var canvas = document.querySelector('[data-geomap-canvas]');
  var card = document.querySelector('[data-loc-card]');
  if (!canvas || !card || typeof L === 'undefined') return;

  var LOC = {
    gaza:  { name: 'قطاع غزة', short: 'غزة', value: '٣٢٦٩', tag: 'حرج', tone: 'red', note: 'الأعلى تسجيلاً للخروقات الموثّقة على مستوى الضفة والقطاع.', ll: [31.50, 34.47] },
    ram:   { name: 'رام الله', short: 'رام الله', value: '٤١٢', tag: 'متابعة', tone: 'green', note: 'وقفات احتجاجية وخروقات متفرّقة موثّقة خلال الأسبوع.', ll: [31.90, 35.20] },
    jenin: { name: 'جنين', short: 'جنين', value: '٣٧٧', tag: 'متابعة', tone: 'green', note: 'تصاعد ملحوظ في الاقتحامات خلال الأسابيع الأخيرة.', ll: [32.46, 35.30] }
  };

  var elName = card.querySelector('[data-locard-name]');
  var elValue = card.querySelector('[data-locard-value]');
  var elTag = card.querySelector('[data-locard-tag]');
  var elNote = card.querySelector('[data-locard-note]');
  var elPin = card.querySelector('[data-locard-pin]');

  var map = L.map(canvas, { zoomControl: true, scrollWheelZoom: false, attributionControl: true });
  map.setView([31.95, 35.0], 7);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 18, subdomains: 'abcd', attribution: '© OpenStreetMap · © CARTO'
  }).addTo(map);

  function select(key) {
    var d = LOC[key]; if (!d) return;
    document.querySelectorAll('.geopin').forEach(function (p) {
      p.classList.toggle('is-active', p.getAttribute('data-loc') === key);
    });
    if (elName) elName.textContent = d.name;
    if (elValue) elValue.textContent = d.value;
    if (elTag) { elTag.textContent = d.tag; elTag.className = 'locard__tag locard__tag--' + d.tone; }
    if (elNote) elNote.textContent = d.note;
    if (elPin) elPin.className = 'locard__pin locard__pin--' + d.tone;
  }

  var group = [];
  Object.keys(LOC).forEach(function (key) {
    var d = LOC[key];
    var icon = L.divIcon({
      className: '', iconSize: [14, 14], iconAnchor: [7, 7],
      html: '<span class="geopin geopin--' + d.tone + '" data-loc="' + key + '">' +
            '<span class="geopin__pulse"></span><span class="geopin__dot"></span>' +
            '<span class="geopin__label">' + d.short + '</span></span>'
    });
    var m = L.marker(d.ll, { icon: icon, title: d.name, riseOnHover: true }).addTo(map);
    m.on('click', function () { select(key); });
    group.push(m);
  });

  select('gaza');
  setTimeout(function () {
    map.invalidateSize();
    map.fitBounds(L.featureGroup(group).getBounds().pad(0.55), { padding: [20, 20] });
  }, 90);
})();


/* ======================================================================
   صفحة المقال — مشاركة الاقتباس عند تحديد النص + فهرس المحاور (TOC)
   تمرير سلس وإبراز القسم النشط. كل العناصر تتحرّس بوجودها.
   ====================================================================== */
(function () {
  'use strict';

  // --- مشاركة الاقتباس عند التحديد ---
  var body = document.querySelector('[data-article-body]');
  if (body) {
    var btn = document.createElement('button');
    btn.className = 'quote-share';
    btn.type = 'button';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5"/></svg> شارك الاقتباس';
    document.body.appendChild(btn);
    var quote = '';
    function hide() { btn.classList.remove('is-visible'); }
    document.addEventListener('selectionchange', function () {
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed) { return hide(); }
      var txt = sel.toString().trim();
      var node = sel.anchorNode;
      var host = node && (node.nodeType === 1 ? node : node.parentNode);
      if (txt.length < 12 || !host || !body.contains(host)) { return hide(); }
      quote = txt;
      var rect = sel.getRangeAt(0).getBoundingClientRect();
      if (!rect.width) { return hide(); }
      btn.style.top = (rect.top + window.scrollY - 12) + 'px';
      btn.style.left = (rect.left + rect.width / 2) + 'px';
      btn.classList.add('is-visible');
    });
    btn.addEventListener('mousedown', function (e) { e.preventDefault(); });
    btn.addEventListener('click', function () {
      var text = '«' + quote + '»';
      var url = location.href;
      if (navigator.share) { navigator.share({ text: text, url: url }).catch(function () {}); }
      else if (navigator.clipboard) { navigator.clipboard.writeText(text + ' — ' + url).catch(function () {}); }
      hide();
    });
    document.addEventListener('scroll', hide, { passive: true });
  }

  // --- فهرس المحاور: تمرير سلس + إبراز النشط ---
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('[data-toc-link]'));
  if (tocLinks.length) {
    var targets = tocLinks.map(function (l) { return document.querySelector(l.getAttribute('href')); });
    tocLinks.forEach(function (l, i) {
      l.addEventListener('click', function (e) {
        var t = targets[i];
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var idx = targets.indexOf(e.target);
            if (idx > -1) tocLinks.forEach(function (l, j) { l.classList.toggle('article__toc-link--active', j === idx); });
          }
        });
      }, { rootMargin: '-100px 0px -68% 0px' });
      targets.forEach(function (t) { if (t) io.observe(t); });
    }
  }
})();

/* ===== about.html — scroll reveal (CSS-driven, guarded, honors reduced-motion) ===== */
(function () {
  'use strict';
  var nodes = document.querySelectorAll('.about__reveal');
  if (!nodes.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    nodes.forEach(function (n) { n.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        var el = en.target;
        var sibs = el.parentNode ? el.parentNode.querySelectorAll('.about__reveal') : [el];
        var idx = Array.prototype.indexOf.call(sibs, el);
        el.style.transitionDelay = (idx > 0 ? Math.min(idx, 5) * 0.08 : 0) + 's';
        el.classList.add('is-in');
        io.unobserve(el);
      }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  nodes.forEach(function (n) { io.observe(n); });
})();
