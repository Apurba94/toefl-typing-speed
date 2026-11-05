/* Typing for TOEFL: build typing speed and accuracy with academic sentences. */
(function () {
  'use strict';
  const KEY = 'toefl-typing-speed.runs';
  // Words per minute counts five characters as one word, the usual typing standard; accuracy compares word by word.
  const measure = (target, typed, seconds) => ({ wpm: Math.round(typed.length / 5 / Math.max(seconds / 60, 1 / 60)), acc: SK.text.diff(target, typed).accuracy });
  const App = {
    about: 'All TOEFL writing is typed, so slow typing costs ideas. Type original academic sentences as fast and accurately as you can. The app measures words per minute (five characters to a word) and word accuracy, and charts your progress.',
    how: ['Press **Start** in **Practice** and type the sentences shown.', 'Press **Done** when you finish. Accuracy matters more than speed at first.', 'Aim for 35 words per minute or more with 95% accuracy.'],
    tabs: [{ id: 'practice', label: 'Practice', render(el, ctx) {
      const run = () => {
        const text = SK.sample(SK.rng(SK.seedNow()), ctx.data.dictation.filter((d) => d.level >= 2), 3).map((d) => d.text).join(' ');
        const area = SK.h('textarea', { spellcheck: 'false', autocomplete: 'off', style: { minHeight: '120px' }, 'aria-label': 'Type here' });
        const out = SK.h('div', {});
        let t0 = 0;
        area.addEventListener('input', () => { if (!t0) t0 = Date.now(); });
        SK.clear(el);
        el.appendChild(SK.card('Type this', SK.h('div', { class: 'sk-passage', text: text }), SK.h('div', { style: { marginTop: '10px' } }, area),
          SK.h('div', { class: 'sk-row', style: { marginTop: '10px' } }, SK.btn('Done', () => {
            const m = measure(text, area.value, t0 ? (Date.now() - t0) / 1000 : 60);
            const runs = SK.store.get(KEY, []); runs.push({ day: SK.dayKey(), ...m }); SK.store.set(KEY, runs.slice(-200));
            SK.logPractice(t0 ? (Date.now() - t0) / 60000 : 1, 'Typing');
            SK.clear(out).appendChild(SK.stats([['Words per minute', m.wpm], ['Accuracy', Math.round(m.acc * 100) + '%']]));
          }, '', { 'data-auto': 'once' }), SK.btn('New text', run, 'ghost')), out));
        area.focus();
      };
      const runs = SK.store.get(KEY, []);
      el.appendChild(SK.card('Typing practice', SK.h('p', { class: 'sk-muted', text: 'The timer starts when you type the first letter.' }), SK.btn('Start', run, '', { 'data-auto': 'once' }),
        runs.length ? SK.chart.line(runs.slice(-20).map((r) => ({ y: r.wpm, label: r.day })), { label: 'Words per minute' }) : null));
    } }],
    measure,
    checks: { 'speed and accuracy are measured fairly': (data, assert) => {
      const t = 'The library opens at eight in the morning.';
      const m = measure(t, t, 60);
      assert.equal(m.acc, 1); assert.equal(m.wpm, Math.round(t.length / 5));
      assert.ok(measure(t, 'The library opens at nine.', 60).acc < 1);
    } },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = App; else SK.start(App);
})();
