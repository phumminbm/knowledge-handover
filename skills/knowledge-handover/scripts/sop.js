/*
 * knowledge-handover SOP documents.
 * Turns one task of knowledge.json into a standard operating procedure, as
 * a print-ready HTML page (save as PDF from the browser) and as the parts of
 * a Word .docx file (pack-core zips them). No dependencies; shared by the
 * Node CLI and the browser Pack Builder.
 *
 * Pack content is untrusted: every value is escaped, the diagram is only
 * ever an <img> data URL, and the page carries no script.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KHSop = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var L10N = {
    en: {
      sopTitle: 'Standard operating procedure', docNo: 'Document no.', version: 'Version', status: 'Status',
      owner: 'Owner', effective: 'Effective date', approvedBy: 'Approved by', source: 'Prepared from',
      draft: 'Draft', ready: 'Ready for approval', confirmedOf: '{a} of {b} items confirmed', fill: 'to be filled in',
      purpose: 'Purpose', scope: 'Scope and when to use', startsWhen: 'Starts when', frequency: 'Frequency',
      resp: 'Responsibilities', role: 'Role', involvement: 'What they do', defs: 'Definitions', term: 'Term', meaning: 'Meaning',
      systems: 'Systems and equipment', sot: 'source of truth', procedure: 'Procedure', flow: 'Flow diagram',
      rules: 'Rules and exceptions', rule: 'Rule', trouble: 'Troubleshooting', safetyRisk: 'Safety and risk',
      records: 'Records and outputs', openQ: 'Open questions about this task', ask: 'Ask', history: 'Revision history',
      date: 'Date', change: 'Change', by: 'By', why: 'Why', check: 'How to check', who: 'Who can do it', when: 'When',
      step: 'Step', ifGo: 'If {a}: go to step {b}', then: 'Then go to step {a}', endTask: 'End of task',
      needs: 'Needs confirmation', safety: 'Safety', highRisk: 'High risk', symptom: 'What you see', cause: 'Likely cause',
      fix: 'What to do', done: 'Done', item: 'Item', next: 'Next', none: 'None recorded', inputs: 'Inputs',
      outputs: 'Outputs', actor: 'Who does it', system: 'System', pinUnconfirmed: 'position not confirmed',
      printHint: 'To save as PDF: press Ctrl+P (⌘P on a Mac) and choose "Save as PDF".',
      footer: 'Generated from knowledge pack {a}. Items marked "Needs confirmation" must be confirmed before this SOP is approved.',
      diagramNote: 'The flow diagram is in the print version of this SOP (the .html file) and in START-HERE.html.',
      anyTime: 'Any time', doesSteps: 'Carries out steps {a}'
    },
    th: {
      sopTitle: 'วิธีปฏิบัติงานมาตรฐาน (SOP)', docNo: 'เลขที่เอกสาร', version: 'ฉบับที่', status: 'สถานะ',
      owner: 'ผู้รับผิดชอบเอกสาร', effective: 'วันที่มีผล', approvedBy: 'ผู้อนุมัติ', source: 'จัดทำจาก',
      draft: 'ฉบับร่าง', ready: 'พร้อมเสนออนุมัติ', confirmedOf: 'ยืนยันแล้ว {a} จาก {b} ข้อ', fill: 'รอกรอก',
      purpose: 'วัตถุประสงค์', scope: 'ขอบเขตและเมื่อใดที่ใช้', startsWhen: 'เริ่มเมื่อ', frequency: 'ความถี่',
      resp: 'ผู้รับผิดชอบ', role: 'ผู้เกี่ยวข้อง', involvement: 'หน้าที่', defs: 'คำนิยาม', term: 'คำ', meaning: 'ความหมาย',
      systems: 'ระบบและอุปกรณ์', sot: 'ข้อมูลหลัก', procedure: 'ขั้นตอนการปฏิบัติงาน', flow: 'แผนภาพขั้นตอน',
      rules: 'กฎและข้อยกเว้น', rule: 'กฎ', trouble: 'การแก้ปัญหา', safetyRisk: 'ความปลอดภัยและความเสี่ยง',
      records: 'บันทึกและเอกสารที่ได้', openQ: 'คำถามที่ยังไม่มีคำตอบ', ask: 'ถาม', history: 'ประวัติการแก้ไข',
      date: 'วันที่', change: 'การเปลี่ยนแปลง', by: 'โดย', why: 'เหตุผล', check: 'วิธีตรวจ', who: 'ใครทำได้', when: 'เมื่อ',
      step: 'ขั้นที่', ifGo: 'ถ้า {a}: ไปขั้นที่ {b}', then: 'จากนั้นไปขั้นที่ {a}', endTask: 'จบงาน',
      needs: 'รอยืนยัน', safety: 'ความปลอดภัย', highRisk: 'ความเสี่ยงสูง', symptom: 'อาการที่เห็น', cause: 'สาเหตุที่พบบ่อย',
      fix: 'วิธีแก้', done: 'เสร็จ', item: 'รายการ', next: 'ไปต่อ', none: 'ไม่มีบันทึก', inputs: 'สิ่งที่ต้องใช้',
      outputs: 'สิ่งที่ได้', actor: 'ผู้ทำ', system: 'ระบบ', pinUnconfirmed: 'ตำแหน่งยังไม่ยืนยัน',
      printHint: 'บันทึกเป็น PDF: กด Ctrl+P (Mac กด ⌘P) แล้วเลือก "บันทึกเป็น PDF"',
      footer: 'สร้างจาก knowledge pack {a} ข้อที่มีป้าย "รอยืนยัน" ต้องยืนยันก่อนอนุมัติ SOP นี้',
      diagramNote: 'แผนภาพขั้นตอนอยู่ในฉบับพิมพ์ของ SOP นี้ (ไฟล์ .html) และใน START-HERE.html',
      anyTime: 'เมื่อใดก็ได้', doesSteps: 'ทำขั้นที่ {a}'
    }
  };
  var CONFIRM = { ai_inferred: 1, needs_update: 1, open_question: 1 };

  function words(k) {
    var base = L10N[(k && k.language) || 'en'] || L10N.en, out = {};
    var over = (k && k.ui_labels) || {};
    Object.keys(L10N.en).forEach(function (key) {
      var o = over['sop_' + key];
      out[key] = typeof o === 'string' && o ? o : (base[key] || L10N.en[key]);
    });
    return out;
  }
  function fmt(s, a, b) { return String(s).replace('{a}', a).replace('{b}', b); }
  function str(v) { return v == null ? '' : String(v); }
  function live(list) { return (list || []).filter(function (x) { return x && !x.retired; }); }
  function own(o, key) { return !!o && Object.prototype.hasOwnProperty.call(o, key); }

  // ── One document model, two renderers ─────────────────────────────────
  // Block types: title, meta, h, p, note, list, table, step, diagram.
  // A cell is a string or { text, flag, muted, strong }.
  function model(k, p, ctx) {
    var W = words(k), L = ctx.labels || {}, view = ctx.view || 'steps';
    var steps = live(p.steps), rules = live(p.rules), trouble = live(p.troubleshooting);
    var num = {}; steps.forEach(function (s, i) { num[s.id] = i + 1; });
    var items = steps.concat(rules, trouble);
    var confirmed = items.filter(function (x) { return x.status === 'validated'; }).length;
    var flag = function (x) { return !!(x && CONFIRM[x.status]); };
    var goName = function (id) { return id === 'end' ? W.endTask : (num[id] ? String(num[id]) : str(id)); };
    var B = [];

    var status = (items.length && confirmed === items.length ? W.ready : W.draft) + ' · ' + fmt(W.confirmedOf, confirmed, items.length);
    B.push({ t: 'title', kicker: W.sopTitle, text: str(p.name) || str(p.id) });
    B.push({ t: 'meta', rows: [
      [W.docNo, '', true], [W.version, str(k.version || 1)], [W.status, status],
      [W.owner, str((k.giver && (k.giver.role_title || k.giver.team)) || '')], [W.effective, '', true],
      [W.approvedBy, '', true], [W.source, str(k.pack_id) + ' · v' + str(k.version || 1) + (k.saved_at ? ' · ' + str(k.saved_at) : '') + ' · ' + str(p.id)]
    ] });

    B.push({ t: 'h', text: '1. ' + W.purpose });
    B.push({ t: 'p', text: str(p.summary) || W.none, muted: !p.summary });

    B.push({ t: 'h', text: '2. ' + W.scope });
    var scope = [];
    if (p.trigger) scope.push(W.startsWhen + ': ' + str(p.trigger));
    if (p.frequency) scope.push(W.frequency + ': ' + str(p.frequency));
    B.push(scope.length ? { t: 'list', items: scope } : { t: 'p', text: W.none, muted: true });

    B.push({ t: 'h', text: '3. ' + W.resp });
    var people = (p.people || []).map(function (x) { return [{ text: str(x.name_or_role), strong: true }, str(x.involvement)]; });
    var named = {}; (p.people || []).forEach(function (x) { named[str(x.name_or_role).toLowerCase()] = 1; });
    var actors = [], actorSteps = {};
    steps.forEach(function (s) {
      var a = str(s.actor), key = a.toLowerCase();
      if (!a || own(named, key)) return;
      if (!own(actorSteps, key)) { actorSteps[key] = []; actors.push(a); }
      actorSteps[key].push(num[s.id]);
    });
    actors.forEach(function (a) { people.push([{ text: a, strong: true }, fmt(W.doesSteps, actorSteps[a.toLowerCase()].join(', '))]); });
    B.push(people.length ? { t: 'table', head: [W.role, W.involvement], rows: people, widths: [35, 65] } : { t: 'p', text: W.none, muted: true });

    var blob = JSON.stringify(p).toLowerCase();
    var defs = (k.glossary || []).filter(function (g) { return g && g.term && blob.indexOf(String(g.term).toLowerCase()) >= 0; });
    var n = 4;
    if (defs.length) {
      B.push({ t: 'h', text: (n++) + '. ' + W.defs });
      B.push({ t: 'table', head: [W.term, W.meaning], rows: defs.map(function (g) { return [{ text: str(g.term), strong: true }, str(g.meaning)]; }), widths: [30, 70] });
    }
    if ((p.systems || []).length) {
      B.push({ t: 'h', text: (n++) + '. ' + W.systems });
      B.push({ t: 'list', items: p.systems.map(function (x) { return str(x.name) + (x.purpose ? ' — ' + str(x.purpose) : '') + (x.source_of_truth ? ' (' + W.sot + ')' : ''); }) });
    }

    B.push({ t: 'h', text: (n++) + '. ' + W.procedure });
    if (p.diagram_svg && /^\s*<svg[\s>]/i.test(p.diagram_svg)) B.push({ t: 'diagram', svg: String(p.diagram_svg), label: W.flow, note: W.diagramNote });
    var whoLabel = function (s) { return s.who_can_do ? str(L[s.who_can_do] || s.who_can_do) : ''; };
    var nextText = function (s) {
      if ((s.branches || []).length) return s.branches.map(function (b) { return fmt(W.ifGo, str(b.label), goName(b.goto)); }).join('\n');
      if (s.next === 'end') return W.endTask;
      if (s.next) return fmt(W.then, goName(s.next));
      return '';
    };
    if (view === 'checklist') {
      var ordered = steps.filter(function (s) { return s.safety; }).concat(steps.filter(function (s) { return !s.safety; }));
      B.push({ t: 'table', head: ['☐', W.item, W.check], widths: [6, 60, 34], rows: ordered.map(function (s) {
        return ['☐', { text: str(s.title) + (s.detail ? '\n' + str(s.detail) : ''), flag: flag(s), tag: s.safety ? W.safety : '', lead: true }, str(s.check)];
      }) });
    } else if (view === 'timeline') {
      var groups = [], byWhen = {};
      steps.forEach(function (s) {
        var w = str(s.when) || W.anyTime;
        if (!own(byWhen, w)) { byWhen[w] = []; groups.push(w); }
        byWhen[w].push(s);
      });
      var rows = [];
      groups.forEach(function (w) {
        byWhen[w].forEach(function (s, i) {
          rows.push([i ? '' : { text: w, strong: true }, { text: str(s.title) + (s.detail ? '\n' + str(s.detail) : ''), flag: flag(s), lead: true }, str(s.check)]);
        });
      });
      B.push({ t: 'table', head: [W.when, W.step, W.check], widths: [22, 50, 28], rows: rows });
    } else if (view === 'decision') {
      if (rules.length) B.push({ t: 'table', head: [W.rule, W.why], widths: [60, 40], rows: rules.map(function (r) { return [{ text: str(r.text), flag: flag(r) }, str(r.why)]; }) });
      B.push({ t: 'table', head: ['#', W.step, W.next], widths: [6, 54, 40], rows: steps.map(function (s) {
        return [String(num[s.id]), { text: str(s.branch_question || s.title) + (s.branch_question && s.title ? '\n' + str(s.title) : '') + (s.detail ? '\n' + str(s.detail) : ''), flag: flag(s), lead: true }, nextText(s)];
      }) });
    } else if (view === 'troubleshoot') {
      B.push({ t: 'table', head: [W.symptom, W.cause, W.fix], widths: [30, 30, 40], rows: trouble.map(function (t) {
        return [{ text: str(t.symptom), strong: true, flag: flag(t) }, str(t.cause), str(t.fix)];
      }) });
      steps.forEach(function (s) { B.push(stepBlock(s)); });
    } else {
      steps.forEach(function (s) { B.push(stepBlock(s)); });
    }
    if (!steps.length && !trouble.length && !(view === 'decision' && rules.length)) B.push({ t: 'p', text: W.none, muted: true });

    function stepBlock(s) {
      var fields = [];
      if (s.when) fields.push([W.when, str(s.when)]);
      if (s.why) fields.push([W.why, str(s.why)]);
      if (s.actor) fields.push([W.actor, str(s.actor)]);
      if (s.system) fields.push([W.system, str(s.system)]);
      if ((s.inputs || []).length) fields.push([W.inputs, s.inputs.map(str).join(', ')]);
      if ((s.outputs || []).length) fields.push([W.outputs, s.outputs.map(str).join(', ')]);
      if (s.check) fields.push([W.check, str(s.check)]);
      if (whoLabel(s)) fields.push([W.who, whoLabel(s)]);
      var nx = nextText(s);
      if (nx) fields.push([W.next, nx]);
      var tags = [];
      if (s.safety) tags.push(W.safety);
      if (s.risk === 'high') tags.push(W.highRisk);
      var img = s.image && (own(ctx.images, s.image) || own(ctx.imageUrls, s.image)) ? s.image : null;
      return { t: 'step', n: num[s.id], id: str(s.id), title: str(s.title), detail: str(s.detail), fields: fields, tags: tags, flag: flag(s),
        image: img, pins: live(s.pins).map(function (pin) { return { n: str(pin.n), x: +pin.x, y: +pin.y, label: str(pin.label), confirmed: !!pin.confirmed }; }) };
    }

    if (view !== 'decision' && rules.length) {
      B.push({ t: 'h', text: (n++) + '. ' + W.rules });
      B.push({ t: 'table', head: [W.rule, W.why], widths: [60, 40], rows: rules.map(function (r) { return [{ text: str(r.text), flag: flag(r) }, str(r.why)]; }) });
    }
    if (view !== 'troubleshoot' && trouble.length) {
      B.push({ t: 'h', text: (n++) + '. ' + W.trouble });
      B.push({ t: 'table', head: [W.symptom, W.cause, W.fix], widths: [30, 30, 40], rows: trouble.map(function (t) { return [{ text: str(t.symptom), strong: true, flag: flag(t) }, str(t.cause), str(t.fix)]; }) });
    }
    var risky = steps.filter(function (s) { return s.safety || s.risk === 'high'; });
    if (risky.length) {
      B.push({ t: 'h', text: (n++) + '. ' + W.safetyRisk });
      B.push({ t: 'list', items: risky.map(function (s) {
        return W.step + ' ' + num[s.id] + ': ' + str(s.title) + ' (' + [s.safety ? W.safety : '', s.risk === 'high' ? W.highRisk : ''].filter(Boolean).join(', ') + ')' + (flag(s) ? ' — ' + W.needs : '');
      }) });
    }
    var outs = [];
    steps.forEach(function (s) { (s.outputs || []).forEach(function (o) { o = str(o); if (o && outs.indexOf(o) < 0) outs.push(o); }); });
    B.push({ t: 'h', text: (n++) + '. ' + W.records });
    B.push(outs.length ? { t: 'list', items: outs } : { t: 'p', text: W.none, muted: true });

    var ids = {}; ids[p.id] = 1; items.forEach(function (x) { if (x.id) ids[x.id] = 1; });
    var oq = (k.open_questions || []).filter(function (q) { return q && (q.refs || []).some(function (r) { return own(ids, r); }); });
    if (oq.length) {
      B.push({ t: 'h', text: (n++) + '. ' + W.openQ });
      B.push({ t: 'list', items: oq.map(function (q) { return str(q.question) + (q.who_to_ask ? ' — ' + W.ask + ': ' + str(q.who_to_ask) : ''); }) });
    }
    B.push({ t: 'h', text: (n++) + '. ' + W.history });
    var log = (k.change_log || []).filter(Boolean);
    B.push(log.length ? { t: 'table', head: [W.date, W.version, W.change, W.by], widths: [18, 10, 52, 20], rows: log.map(function (c) { return [str(c.date), str(c.version), str(c.change), str(c.by)]; }) } : { t: 'p', text: W.none, muted: true });
    B.push({ t: 'note', text: fmt(W.footer, str(k.pack_id) + ' v' + str(k.version || 1)) });
    return { W: W, blocks: B };
  }

  // ── HTML (print) ───────────────────────────────────────────────────────
  function esc(s) {
    return str(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function br(s) { return esc(s).replace(/\n/g, '<br>'); }
  function hcell(c, W, tag) {
    var o = typeof c === 'object' && c ? c : { text: c };
    var t = str(o.text), cut = t.indexOf('\n');
    var body = o.strong ? '<strong>' + br(t) + '</strong>' : o.lead && cut > 0 ? '<strong>' + br(t.slice(0, cut)) + '</strong><br>' + br(t.slice(cut + 1)) : br(t);
    if (o.tag) body = '<span class="tag">' + esc(o.tag) + '</span> ' + body;
    if (o.flag) body += ' <span class="flag">' + esc(W.needs) + '</span>';
    return '<' + tag + (o.text === '☐' ? ' class="box"' : '') + '>' + body + '</' + tag + '>';
  }
  function sopHtml(k, p, ctx) {
    ctx = ctx || {};
    var m = model(k, p, ctx), W = m.W, accent = /^#[0-9a-f]{6}$/i.test(str(k.accent)) ? k.accent : '#bf4520';
    var out = m.blocks.map(function (b) {
      if (b.t === 'title') return '<header><div class="kicker">' + esc(b.kicker) + '</div><h1>' + esc(b.text) + '</h1></header>';
      if (b.t === 'meta') return '<table class="meta">' + b.rows.map(function (r) { return '<tr><th>' + esc(r[0]) + '</th><td' + (r[2] ? ' class="blank"' : '') + '>' + (r[2] ? '<span>' + esc(W.fill) + '</span>' : esc(r[1])) + '</td></tr>'; }).join('') + '</table>';
      if (b.t === 'h') return '<h2>' + esc(b.text) + '</h2>';
      if (b.t === 'p') return '<p' + (b.muted ? ' class="muted"' : '') + '>' + br(b.text) + '</p>';
      if (b.t === 'note') return '<footer>' + esc(b.text) + '</footer>';
      if (b.t === 'list') return '<ul>' + b.items.map(function (x) { return '<li>' + br(x) + '</li>'; }).join('') + '</ul>';
      if (b.t === 'table') return '<table class="grid"><colgroup>' + b.widths.map(function (w) { return '<col style="width:' + (+w) + '%">'; }).join('') + '</colgroup><thead><tr>' + b.head.map(function (h) { return hcell(h, W, 'th'); }).join('') + '</tr></thead><tbody>' +
        b.rows.map(function (r) { return '<tr>' + r.map(function (c) { return hcell(c, W, 'td'); }).join('') + '</tr>'; }).join('') + '</tbody></table>';
      if (b.t === 'diagram') {
        var src = ctx.b64 ? 'data:image/svg+xml;base64,' + ctx.b64(b.svg) : '';
        return src ? '<figure class="diagram"><img src="' + esc(src) + '" alt="' + esc(b.label) + '"></figure>' : '';
      }
      if (b.t === 'step') {
        var url = b.image && own(ctx.imageUrls, b.image) ? String(ctx.imageUrls[b.image]) : '';
        if (!/^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(url)) url = '';
        var shot = url ? '<figure class="shot"><div class="frame"><img src="' + url + '" alt="">' +
          b.pins.filter(function (q) { return isFinite(q.x) && isFinite(q.y); }).map(function (q) {
            return '<span class="pin' + (q.confirmed ? '' : ' unsure') + '" style="left:' + Math.max(0, Math.min(1, q.x)) * 100 + '%;top:' + Math.max(0, Math.min(1, q.y)) * 100 + '%">' + esc(q.n) + '</span>';
          }).join('') + '</div>' + (b.pins.length ? '<ol class="pins">' + b.pins.map(function (q) { return '<li><b>' + esc(q.n) + '</b> ' + esc(q.label) + (q.confirmed ? '' : ' <i>(' + esc(W.pinUnconfirmed) + ')</i>') + '</li>'; }).join('') + '</ol>' : '') + '</figure>' : '';
        return '<section class="step"><h3><span class="n">' + esc(b.n) + '</span> ' + esc(b.title) + b.tags.map(function (t) { return ' <span class="tag">' + esc(t) + '</span>'; }).join('') +
          (b.flag ? ' <span class="flag">' + esc(W.needs) + '</span>' : '') + '<small>' + esc(b.id) + '</small></h3>' +
          (b.detail ? '<p>' + br(b.detail) + '</p>' : '') + shot +
          (b.fields.length ? '<dl>' + b.fields.map(function (f) { return '<dt>' + esc(f[0]) + '</dt><dd>' + br(f[1]) + '</dd>'; }).join('') + '</dl>' : '') + '</section>';
      }
      return '';
    }).join('\n');
    var lang = str(k.language || 'en').replace(/[^a-zA-Z-]/g, '') || 'en';
    return '<!doctype html>\n<html lang="' + lang + '"><head><meta charset="utf-8">' +
      '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\'">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>' + esc(W.sopTitle + ' · ' + (p.name || p.id)) + '</title><style>' + CSS.replace(/__ACCENT__/g, accent) + '</style></head><body>' +
      '<p class="hint">' + esc(W.printHint) + '</p><main>' + out + '</main></body></html>\n';
  }
  var CSS = [
    '@page{size:A4;margin:18mm 16mm}',
    ':root{--ink:#0b0b0b;--muted:#5f5f5c;--hair:#d9d9d6;--surf:#f6f6f5;--acc:__ACCENT__}',
    '*{box-sizing:border-box}',
    'body{margin:0;background:var(--surf);color:var(--ink);font:15px/1.55 Poppins,Prompt,"Segoe UI","Helvetica Neue",Arial,Tahoma,"Leelawadee UI",Thonburi,sans-serif}',
    'main{max-width:820px;margin:0 auto 48px;background:#fff;padding:48px 56px;border-radius:16px}',
    '.hint{max-width:820px;margin:20px auto 12px;color:var(--muted);font-size:13px;padding:0 8px}',
    'header{border-bottom:3px solid var(--acc);padding-bottom:12px;margin-bottom:16px}',
    '.kicker{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--acc);font-weight:600}',
    'h1{font-size:28px;line-height:1.2;margin:6px 0 0}',
    'h2{font-size:18px;margin:28px 0 10px;padding-bottom:4px;border-bottom:1px solid var(--hair);break-after:avoid}',
    'h3{font-size:15px;margin:0 0 6px;display:flex;flex-wrap:wrap;align-items:center;gap:6px}',
    'h3 small{margin-left:auto;color:var(--muted);font-weight:400;font-size:11px}',
    '.n{display:inline-flex;width:24px;height:24px;border-radius:50%;background:var(--ink);color:#fff;font-size:12px;align-items:center;justify-content:center}',
    'p{margin:0 0 8px}.muted{color:var(--muted)}',
    'ul{margin:0 0 8px;padding-left:20px}',
    'table{border-collapse:collapse;width:100%;margin:0 0 12px;font-size:13.5px}',
    'th,td{border:1px solid var(--hair);padding:7px 9px;text-align:left;vertical-align:top}',
    '.grid thead th{background:var(--surf);font-weight:600}',
    'td.box,th.box{text-align:center;font-size:16px}',
    'tr{break-inside:avoid}',
    '.meta th{width:30%;background:var(--surf);font-weight:600}',
    '.meta td.blank span{color:#9a9a96;font-style:italic}',
    '.meta td.blank{height:30px}',
    '.flag{display:inline-block;font-size:11px;font-weight:600;color:#7a4a00;background:#fff4e5;border:1px solid #f0d29c;border-radius:999px;padding:0 8px}',
    '.tag{display:inline-block;font-size:11px;font-weight:600;color:#fff;background:var(--acc);border-radius:999px;padding:0 8px}',
    '.step{border:1px solid var(--hair);border-radius:12px;padding:14px 16px;margin:0 0 10px;break-inside:avoid}',
    'dl{display:grid;grid-template-columns:150px 1fr;gap:4px 12px;margin:8px 0 0;font-size:13.5px}',
    'dt{color:var(--muted)}dd{margin:0}',
    '.shot{margin:8px 0}',
    '.frame{position:relative;display:inline-block;max-width:100%}',
    '.frame img{display:block;max-width:100%;border:1px solid var(--hair);border-radius:8px}',
    '.pin{position:absolute;transform:translate(-50%,-50%);width:24px;height:24px;border-radius:50%;background:var(--acc);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff}',
    '.pin.unsure{background:#fff;color:var(--acc);border:2px dashed var(--acc)}',
    '.pins{margin:6px 0 0;padding-left:0;list-style:none;font-size:13px}.pins b{color:var(--acc)}',
    '.diagram{margin:4px 0 14px;text-align:center}.diagram img{max-width:100%;max-height:140mm;height:auto}',
    'footer{margin-top:28px;padding-top:10px;border-top:1px solid var(--hair);color:var(--muted);font-size:12px}',
    '@media print{body{background:#fff}.hint{display:none}main{max-width:none;margin:0;padding:0;border-radius:0}}',
    '@media (max-width:640px){main{padding:24px 18px;border-radius:0}dl{grid-template-columns:1fr}}'
  ].join('\n');

  // ── Word (.docx) ───────────────────────────────────────────────────────
  function x(s) {
    return str(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
      .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '$1')
      .replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function run(text, o) {
    o = o || {};
    var pr = (o.b ? '<w:b/><w:bCs/>' : '') + (o.i ? '<w:i/><w:iCs/>' : '') + (o.color ? '<w:color w:val="' + o.color + '"/>' : '') + (o.sz ? '<w:sz w:val="' + o.sz + '"/><w:szCs w:val="' + o.sz + '"/>' : '') + (o.shd ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.shd + '"/>' : '');
    return str(text).split('\n').map(function (line, i) {
      return (i ? '<w:r><w:br/></w:r>' : '') + '<w:r>' + (pr ? '<w:rPr>' + pr + '</w:rPr>' : '') + '<w:t xml:space="preserve">' + x(line) + '</w:t></w:r>';
    }).join('');
  }
  function para(runs, style, extra) { return '<w:p>' + (style || extra ? '<w:pPr>' + (style ? '<w:pStyle w:val="' + style + '"/>' : '') + (extra || '') + '</w:pPr>' : '') + runs + '</w:p>'; }
  var TW = 9638;
  function dcell(c, W, w, head) {
    var o = typeof c === 'object' && c ? c : { text: c };
    var t = str(o.text), cut = t.indexOf('\n');
    var main = o.lead && cut > 0 ? run(t.slice(0, cut), { b: true }) + '<w:r><w:br/></w:r>' + run(t.slice(cut + 1)) : run(t, { b: head || o.strong });
    var r = (o.tag ? run(o.tag + ' ', { b: true, color: 'BF4520' }) : '') + main + (o.flag ? run('  ' + W.needs, { b: true, color: '7A4A00', shd: 'FFF4E5', sz: 18 }) : '');
    return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (head ? '<w:shd w:val="clear" w:color="auto" w:fill="F2F2F0"/>' : '') + '</w:tcPr>' + para(r, 'TableText', o.text === '☐' ? '<w:jc w:val="center"/>' : '') + '</w:tc>';
  }
  function dtable(head, rows, widths, W) {
    var ws = widths.map(function (p) { return Math.round(TW * p / 100); });
    return '<w:tbl><w:tblPr><w:tblStyle w:val="SopTable"/><w:tblW w:w="' + TW + '" w:type="dxa"/><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>' +
      ws.map(function (w) { return '<w:gridCol w:w="' + w + '"/>'; }).join('') + '</w:tblGrid>' +
      (head ? '<w:tr><w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>' + head.map(function (h, i) { return dcell(h, W, ws[i], true); }).join('') + '</w:tr>' : '') +
      rows.map(function (r) { return '<w:tr><w:trPr><w:cantSplit/></w:trPr>' + r.map(function (c, i) { return dcell(c, W, ws[i], false); }).join('') + '</w:tr>'; }).join('') +
      '</w:tbl>' + para('', null, '<w:spacing w:after="0"/>');
  }
  function imageSize(bytes) {
    var b = bytes, w = 0, h = 0, i;
    if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50) { w = (b[16] << 24 | b[17] << 16 | b[18] << 8 | b[19]) >>> 0; h = (b[20] << 24 | b[21] << 16 | b[22] << 8 | b[23]) >>> 0; return { ext: 'png', w: w, h: h }; }
    if (b.length > 10 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return { ext: 'gif', w: b[6] | b[7] << 8, h: b[8] | b[9] << 8 };
    if (b.length > 4 && b[0] === 0xFF && b[1] === 0xD8) {
      i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xFF) { i++; continue; }
        var mk = b[i + 1], len = b[i + 2] << 8 | b[i + 3];
        if (mk >= 0xC0 && mk <= 0xCF && mk !== 0xC4 && mk !== 0xC8 && mk !== 0xCC) return { ext: 'jpeg', h: b[i + 5] << 8 | b[i + 6], w: b[i + 7] << 8 | b[i + 8] };
        if (mk === 0xD8 || mk === 0x01 || (mk >= 0xD0 && mk <= 0xD7)) { i += 2; continue; }
        i += 2 + len;
      }
    }
    return null;
  }
  function sopDocxParts(k, p, ctx) {
    ctx = ctx || {};
    var m = model(k, p, ctx), W = m.W, body = [], media = [], rels = [];
    var NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
    function picture(bytes) {
      var size = imageSize(bytes);
      if (!size || !size.w || !size.h) return '';
      var id = media.length + 1, name = 'image' + id + '.' + (size.ext === 'jpeg' ? 'jpeg' : size.ext), rid = 'rIdImg' + id;
      media.push({ path: 'word/media/' + name, data: bytes });
      rels.push('<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/' + name + '"/>');
      var cx = Math.min(5486400, size.w * 9525), cy = Math.round(cx * size.h / size.w);
      return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:docPr id="' + id + '" name="Picture ' + id + '"/>' +
        '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
        '<pic:pic><pic:nvPicPr><pic:cNvPr id="' + id + '" name="' + name + '"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
        '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
    }
    m.blocks.forEach(function (b) {
      if (b.t === 'title') { body.push(para(run(b.kicker, { b: true, color: 'BF4520', sz: 18 }), 'Kicker'), para(run(b.text), 'Title')); return; }
      if (b.t === 'meta') { body.push(dtable(null, b.rows.map(function (r) { return [{ text: r[0], strong: true }, r[2] ? '' : r[1]]; }), [30, 70], W)); return; }
      if (b.t === 'h') { body.push(para(run(b.text), 'Heading1')); return; }
      if (b.t === 'p') { body.push(para(run(b.text, { color: b.muted ? '5F5F5C' : null }))); return; }
      if (b.t === 'note') { body.push(para(run(b.text, { i: true, color: '5F5F5C', sz: 18 }), null, '<w:spacing w:before="360"/>')); return; }
      if (b.t === 'list') { b.items.forEach(function (it) { body.push(para(run('•  ' + it), 'ListBullet')); }); return; }
      if (b.t === 'table') { body.push(dtable(b.head, b.rows, b.widths, W)); return; }
      if (b.t === 'diagram') { body.push(para(run(b.note, { i: true, color: '5F5F5C' }), null, '<w:keepNext/>')); return; }
      if (b.t === 'step') {
        body.push(para(run(W.step + ' ' + b.n + '  ') + run(b.title, { b: true }) + b.tags.map(function (t) { return run('  ' + t, { b: true, color: 'BF4520' }); }).join('') +
          (b.flag ? run('  ' + W.needs, { b: true, color: '7A4A00', shd: 'FFF4E5' }) : '') + run('   ' + b.id, { color: '8A8A86', sz: 16 }), 'Heading2'));
        var hasPic = b.image && own(ctx.images, b.image);
        if (b.detail) body.push(para(run(b.detail), null, hasPic ? '<w:keepNext/>' : ''));
        if (hasPic) {
          var pic = picture(ctx.images[b.image]);
          if (pic) body.push(para(pic, null, '<w:keepNext/>'));
          b.pins.forEach(function (q) { body.push(para(run(q.n + '  ', { b: true, color: 'BF4520' }) + run(q.label) + (q.confirmed ? '' : run(' (' + W.pinUnconfirmed + ')', { i: true, color: '5F5F5C' })), 'TableText')); });
        }
        if (b.fields.length) body.push(dtable(null, b.fields.map(function (f) { return [{ text: f[0], strong: true }, f[1]]; }), [26, 74], W));
      }
    });
    var doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ' + NS + '><w:body>' + body.join('') +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>';
    var font = '<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Tahoma"/>';
    var styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:docDefaults><w:rPrDefault><w:rPr>' + font + '<w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="en-GB" w:bidi="th-TH"/></w:rPr></w:rPrDefault>' +
      '<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="18" w:space="6" w:color="BF4520"/></w:pBdr><w:spacing w:after="240"/></w:pPr><w:rPr><w:b/><w:bCs/><w:sz w:val="40"/><w:szCs w:val="40"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Kicker"><w:name w:val="Kicker"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="0"/></w:pPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="320" w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="2" w:color="D9D9D6"/></w:pBdr><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:bCs/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:sz w:val="23"/><w:szCs w:val="23"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="TableText"><w:name w:val="Table Text"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="0" w:line="252" w:lineRule="auto"/></w:pPr><w:rPr><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="ListBullet"><w:name w:val="List Bullet"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="360" w:hanging="240"/><w:spacing w:after="60"/></w:pPr></w:style>' +
      '<w:style w:type="table" w:styleId="SopTable"><w:name w:val="SOP Table"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="D9D9D6"/><w:left w:val="single" w:sz="4" w:space="0" w:color="D9D9D6"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="D9D9D6"/><w:right w:val="single" w:sz="4" w:space="0" w:color="D9D9D6"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="D9D9D6"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="D9D9D6"/></w:tblBorders><w:tblCellMar><w:top w:w="70" w:type="dxa"/><w:left w:w="110" w:type="dxa"/><w:bottom w:w="70" w:type="dxa"/><w:right w:w="110" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>' +
      '</w:styles>';
    var title = x(W.sopTitle + ' · ' + (p.name || p.id));
    var exts = {};
    media.forEach(function (f) { exts[f.path.split('.').pop()] = 1; });
    return [
      { path: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
        Object.keys(exts).map(function (e) { return '<Default Extension="' + e + '" ContentType="image/' + e + '"/>'; }).join('') +
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
        '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>' },
      { path: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>' },
      { path: 'docProps/core.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">' +
        '<dc:title>' + title + '</dc:title><dc:subject>' + x(str(k.pack_id) + ' · ' + str(p.id)) + '</dc:subject></cp:coreProperties>' },
      { path: 'word/document.xml', data: doc },
      { path: 'word/styles.xml', data: styles },
      { path: 'word/_rels/document.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' + rels.join('') + '</Relationships>' }
    ].concat(media);
  }

  return { sopHtml: sopHtml, sopDocxParts: sopDocxParts, words: words };
});
