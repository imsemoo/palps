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
     4) مودال الفيديو
     ---------------------------------------------------------------------- */
  var VIDEOS = [
    { x: 'فضيحة منصة الكود.. تمويل حملات تشويه وابتزاز ضد رجال أعمال غزة', cat: 'تحقيق', dur: '١٢:٤٠' },
    { x: 'مسؤولو العصابات العميلة في غزة.. ضباط بأجهزة السلطة', cat: 'وثائقي', dur: '٠٨:١٥' },
    { x: 'الاعتراف بإقليم صوماليلاند.. خطوة تكشف مشروع إسرائيل الإقليمي', cat: 'تحليل', dur: '٠٦:٣٢' },
    { x: 'شهد الشرفا.. بوق فتح الناعم لتشويه المقاومة وتبييض الاحتلال', cat: 'ميديا', dur: '٠٥:٥٠' }
  ];
  VIDEOS.forEach(function (v, i) { v.img = 'https://picsum.photos/seed/npp-vid' + i + '/700/900'; });

  var SCRIPT_LINES = [
    'في هذه الحلقة نتتبّع خيوط التمويل التي تقف خلف حملات التشويه المنظّمة، ونكشف الأسماء والأدوار.',
    'الوثائق التي حصلت عليها الشبكة تشير إلى شبكة علاقات تمتدّ بين أجهزة السلطة وعدد من المنصّات.',
    'نعرض شهادات حصرية وتسلسلاً زمنياً يوضّح كيف تطوّرت الحملة خلال الأشهر الماضية.'
  ];

  var modal = document.querySelector('[data-modal]');

  function openVideo(index) {
    if (!modal) return;
    var v = VIDEOS[index];
    if (!v) return;
    modal.querySelector('[data-modal-img]').src = 'https://picsum.photos/seed/npp-vid' + index + '/1100/620';
    modal.querySelector('[data-modal-cat]').textContent = v.cat;
    modal.querySelector('[data-modal-dur]').textContent = v.dur;
    modal.querySelector('[data-modal-title]').textContent = v.x;

    // النص الكامل
    var scriptBox = modal.querySelector('[data-modal-script]');
    scriptBox.innerHTML = '';
    SCRIPT_LINES.forEach(function (line) {
      var p = document.createElement('p');
      p.textContent = line;
      scriptBox.appendChild(p);
    });

    // المقاطع ذات الصلة (باقي الفيديوهات)
    var rel = modal.querySelector('[data-modal-related]');
    rel.innerHTML = '';
    VIDEOS.forEach(function (other, j) {
      if (j === index) return;
      var card = document.createElement('article');
      card.className = 'relcard';
      card.setAttribute('data-video-index', j);
      card.innerHTML =
        '<div class="relcard__media">' +
          '<img class="relcard__img" src="https://picsum.photos/seed/npp-vid' + j + '/700/440" alt="">' +
          '<span class="play-circle play-circle--sm"><svg class="play-circle__icon" width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M7 5v14l12-7z"/></svg></span>' +
          '<span class="relcard__dur">' + other.dur + '</span>' +
        '</div>' +
        '<h4 class="relcard__title"></h4>';
      card.querySelector('.relcard__title').textContent = other.x;
      rel.appendChild(card);
    });

    setTab('watch');
    modal.classList.add('is-open');
    try { document.body.style.overflow = 'hidden'; } catch (e) {}
  }

  function closeVideo() {
    if (!modal) return;
    modal.classList.remove('is-open');
    try { document.body.style.overflow = ''; } catch (e) {}
  }

  function setTab(tab) {
    if (!modal) return;
    var isScript = tab === 'script';
    modal.querySelector('[data-modal-script]').classList.toggle('is-active', isScript);
    modal.querySelectorAll('[data-tab]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-tab') === tab);
    });
  }

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

    // فتح الفيديو (التفويض على مستوى المستند ليشمل المقاطع ذات الصلة المُولّدة)
    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-video-index]');
      if (opener) { e.preventDefault(); openVideo(parseInt(opener.getAttribute('data-video-index'), 10)); }
    });

    // قفل المودال
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.closest('[data-modal-close]')) closeVideo();
      });
      modal.querySelectorAll('[data-tab]').forEach(function (btn) {
        btn.addEventListener('click', function () { setTab(btn.getAttribute('data-tab')); });
      });
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeVideo(); });
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
