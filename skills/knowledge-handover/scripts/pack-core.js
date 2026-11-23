/*
 * knowledge-handover pack core.
 * One implementation used by both the Node CLI (build_pack.js) and the
 * browser Pack Builder, so every channel produces the same Pack.
 * No dependencies.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KHCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ── Statuses ────────────────────────────────────────────────────────────
  var STATUSES = ['employee_provided', 'source_supported', 'ai_organized', 'ai_inferred',
    'validated', 'unverified', 'needs_update', 'open_question'];
  var BADGE = {
    validated: 'ok', ai_inferred: 'confirm', needs_update: 'confirm', open_question: 'open',
    employee_provided: 'wait', source_supported: 'wait', ai_organized: 'wait', unverified: 'wait'
  };

  var LABELS = {
    en: {
      ok: 'Confirmed', wait: 'Not yet reviewed', confirm: 'Needs confirmation', open: 'Open question',
      human_only: 'People only', ai_with_approval: 'AI with approval', ai_alone: 'AI can do it',
      safety: 'Safety', incomplete: 'Incomplete', complete: 'Complete'
    },
    th: {
      ok: 'ตรวจแล้ว', wait: 'ยังไม่ตรวจ', confirm: 'รอยืนยัน', open: 'คำถามค้าง',
      human_only: 'คนทำเท่านั้น', ai_with_approval: 'AI ทำ คนอนุมัติ', ai_alone: 'AI ทำเองได้',
      safety: 'ความปลอดภัย', incomplete: 'ยังไม่ครบ', complete: 'ครบแล้ว'
    }
  };

  function labels(k) {
    var base = LABELS[(k && k.language) || 'en'] || LABELS.en;
    var out = {};
    Object.keys(LABELS.en).forEach(function (key) { out[key] = base[key] || LABELS.en[key]; });
    if (k && k.ui_labels) Object.keys(k.ui_labels).forEach(function (key) { out[key] = k.ui_labels[key]; });
    return out;
  }

  // ── Parsing save blocks ─────────────────────────────────────────────────
  // Accepts raw JSON, a single save block, or several blocks pasted together.
  function extractJsonObjects(text) {
    var out = [], depth = 0, start = -1, inStr = false, esc = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inStr) {
        if (esc) esc = false;
        else if (c === '\\') esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') { if (depth > 0) inStr = true; continue; }
      if (c === '{') { if (depth === 0) start = i; depth++; }
      else if (c === '}' && depth > 0) {
        depth--;
        if (depth === 0 && start >= 0) { out.push(text.slice(start, i + 1)); start = -1; }
      }
    }
    return out;
  }

  function mergeById(a, b) {
    var map = {}, order = [];
    (a || []).concat(b || []).forEach(function (item) {
      if (!item || typeof item !== 'object') return;
      var key = item.id || JSON.stringify(item);
      if (!(key in map)) order.push(key);
      map[key] = item;
    });
    return order.map(function (k) { return map[k]; });
  }

  function mergePacks(list) {
    list = list.slice().sort(function (x, y) { return (x.version || 0) - (y.version || 0); });
    var out = {};
    list.forEach(function (p) {
      Object.keys(p).forEach(function (key) {
        var v = p[key];
        if (['processes', 'tasks', 'open_questions', 'change_log', 'glossary'].indexOf(key) >= 0) {
          out[key] = key === 'change_log' || key === 'glossary' ? (out[key] || []).concat(v || []) : mergeById(out[key], v);
        } else if (key === 'images' && v && typeof v === 'object') {
          out.images = Object.assign(out.images || {}, v);
        } else if (v !== undefined && v !== null && v !== '') {
          out[key] = v;
        }
      });
    });
    if (out.change_log) {
      var seen = {};
      out.change_log = out.change_log.filter(function (c) {
        var key = JSON.stringify(c); if (seen[key]) return false; seen[key] = 1; return true;
      });
    }
    if (out.glossary) out.glossary = mergeById([], out.glossary.map(function (g) { return Object.assign({ id: g.term }, g); }))
      .map(function (g) { var c = Object.assign({}, g); delete c.id; return c; });
    return out;
  }

  function parseSave(text) {
    var objs = extractJsonObjects(String(text || '')), packs = [], errors = [];
    objs.forEach(function (s) {
      try {
        var o = JSON.parse(s);
        if (o && typeof o === 'object' && (o.pack_id || o.processes || o.schema_version)) packs.push(o);
      } catch (e) { errors.push('Could not read one block: ' + e.message); }
    });
    if (!packs.length) throw new Error(errors[0] || 'No knowledge-handover data found. Paste the whole save block, including the { } part.');
    var ids = {};
    packs.forEach(function (p) { if (p.pack_id) ids[p.pack_id] = 1; });
    var idList = Object.keys(ids);
    if (idList.length > 1) throw new Error('These blocks belong to different packs: ' + idList.join(', '));
    return { pack: packs.length === 1 ? packs[0] : mergePacks(packs), blocks: packs.length, errors: errors };
  }

  // ── Task views ──────────────────────────────────────────────────────────
  // How a task is laid out in START-HERE.html. Keep in sync with viewOf() in the template.
  var VIEWS = ['steps', 'checklist', 'timeline', 'decision', 'troubleshoot'];
  var VIEW_NEEDS = {
    checklist: function (p) { return has(p.steps); },
    timeline: function (p) { return has(p.steps); },
    decision: function (p) { return (p.steps || []).some(function (s) { return has(s.branches); }) || has(p.rules); },
    troubleshoot: function (p) { return has(p.troubleshooting); }
  };
  var VIEW_MISSING = { checklist: 'steps', timeline: 'steps', decision: 'branching steps or rules', troubleshoot: 'troubleshooting entries' };
  function has(a) { return !!(a && a.length); }
  function effectiveView(p) {
    var v = p && p.view;
    if (VIEWS.indexOf(v) < 0 || v === 'steps') return 'steps';
    return VIEW_NEEDS[v](p) ? v : 'steps';
  }

  // ── Validation ──────────────────────────────────────────────────────────
  function validate(k, imageNames) {
    var w = [];
    var have = {};
    (imageNames || []).forEach(function (n) { have[n] = 1; });
    if (!k.pack_id) w.push('pack_id is missing; a temporary one will be used.');
    var stepIds = {};
    (k.processes || []).forEach(function (p) {
      (p.steps || []).forEach(function (s) { if (s.id) stepIds[s.id] = 1; });
    });
    (k.processes || []).forEach(function (p) {
      if (!p.id) w.push('A process has no id: "' + (p.name || '?') + '".');
      if (p.view && VIEWS.indexOf(p.view) < 0) w.push(p.id + ': unknown view "' + p.view + '"; showing steps instead.');
      else if (p.view && effectiveView(p) !== p.view) w.push(p.id + ': view "' + p.view + '" needs ' + VIEW_MISSING[p.view] + '; showing steps instead.');
      if (p.diagram_svg && /<script|<foreignObject|\son[a-z]+\s*=|javascript:|@import|url\(\s*['"]?\s*(?!#)/i.test(p.diagram_svg)) {
        w.push(p.id + ': the diagram contains scripts, event handlers or outside links; START-HERE.html removes them, so check the diagram still reads correctly.');
      }
      (p.steps || []).forEach(function (s) {
        if (s.status && STATUSES.indexOf(s.status) < 0) w.push(s.id + ': unknown status "' + s.status + '".');
        (s.branches || []).forEach(function (b) {
          if (b.goto && !stepIds[b.goto]) w.push(s.id + ': branch "' + b.label + '" points to missing step ' + b.goto + '.');
        });
        if (s.next && s.next !== 'end' && !stepIds[s.next]) w.push(s.id + ': next points to missing step ' + s.next + '.');
      });
      // A branch option that simply falls through into a sibling option is usually a missing `next`.
      var steps = p.steps || [];
      steps.forEach(function (s) {
        var targets = (s.branches || []).map(function (b) { return b.goto; });
        targets.forEach(function (t) {
          var i = steps.map(function (x) { return x.id; }).indexOf(t);
          var st = steps[i];
          if (!st || (st.branches && st.branches.length) || st.next || !steps[i + 1]) return;
          if (targets.indexOf(steps[i + 1].id) >= 0) w.push(t + ': after this branch option the walkthrough continues into ' + steps[i + 1].id + ', another option of ' + s.id + '. If that is not intended, set "next" on ' + t + '.');
        });
        if (s.image && imageNames && !have[s.image]) w.push(s.id + ': image ' + s.image + ' was not provided.');
        if (s.safety && s.status !== 'validated') w.push(s.id + ': safety step not yet confirmed.');
        if ((s.pins || []).some(function (pin) { return !pin.confirmed; })) w.push(s.id + ': pin positions not yet confirmed.');
      });
    });
    if (k.handover && k.handover.expires && k.handover.expires < today()) w.push('Handover status expired on ' + k.handover.expires + '.');
    return w;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  function today() { return new Date().toISOString().slice(0, 10); }
  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  }
  // Names from a save block become folder and file names, so they must not climb out of the pack.
  function safeSeg(s, fallback) {
    s = String(s == null ? '' : s).replace(/[\/\\:*?"<>|\x00-\x1f]+/g, '-').replace(/\.{2,}/g, '.').replace(/^[.\s-]+|[.\s]+$/g, '');
    return s.slice(0, 80) || fallback;
  }
  function folderFor(p) {
    var sl = slug(p.slug || p.name);
    return safeSeg(p.id, 'P00') + (sl ? '-' + sl : '');
  }
  function st(k, item) {
    var s = (item && item.status) || 'unverified';
    var L = labels(k);
    return '`' + s + ' · ' + L[BADGE[s] || 'wait'] + '`';
  }
  function line(label, v) {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return '';
    return '- **' + label + ':** ' + (Array.isArray(v) ? v.join(', ') : v) + '\n';
  }
  function mdEsc(s) { return String(s == null ? '' : s); }

  function autoMermaid(p) {
    var steps = p.steps || [];
    if (!steps.length) return '';
    var id = function (s) { return (s.id || '').replace(/[^A-Za-z0-9]/g, '_'); };
    var lab = function (s) { return String(s.title || s.id).replace(/"/g, "'"); };
    var out = ['flowchart TD'];
    steps.forEach(function (s) { out.push('  ' + id(s) + '["' + (s.id || '') + ' ' + lab(s) + '"]'); });
    steps.forEach(function (s, i) {
      if (s.branches && s.branches.length) {
        s.branches.forEach(function (b) {
          out.push('  ' + id(s) + ' -->|' + String(b.label || '').replace(/[|"]/g, "'") + '| ' + String(b.goto || '').replace(/[^A-Za-z0-9]/g, '_'));
        });
      } else if (s.next) {
        if (s.next !== 'end') out.push('  ' + id(s) + ' --> ' + String(s.next).replace(/[^A-Za-z0-9]/g, '_'));
      } else if (steps[i + 1]) {
        out.push('  ' + id(s) + ' --> ' + id(steps[i + 1]));
      }
    });
    return out.join('\n');
  }

  // ── Markdown renderers ──────────────────────────────────────────────────
  function mdHandover(k) {
    var h = k.handover || {};
    var o = '# Handover status\n\n';
    o += line('Snapshot date', h.snapshot_date) + line('Valid until', h.expires) + '\n';
    var sec = function (title, arr, fn) {
      if (!arr || !arr.length) return '';
      return '## ' + title + '\n\n' + arr.map(fn).join('') + '\n';
    };
    o += sec('Deadlines', h.deadlines, function (d) { return '- **' + mdEsc(d.when) + '** — ' + mdEsc(d.what) + ' ' + st(k, d) + '\n'; });
    o += sec('Work in progress', h.in_progress, function (d) {
      return '- **' + mdEsc(d.item) + '** — ' + mdEsc(d.state) + (d.next_step ? '. Next: ' + d.next_step : '') + (d.due ? ' (due ' + d.due + ')' : '') + ' ' + st(k, d) + '\n';
    });
    o += sec('People waiting on us', h.waiting_on_us, function (d) { return '- **' + mdEsc(d.who) + '** — ' + mdEsc(d.what) + ' ' + st(k, d) + '\n'; });
    o += sec('Watch list', h.watch, function (d) { return '- **' + mdEsc(d.what) + '** — ' + mdEsc(d.why) + ' ' + st(k, d) + '\n'; });
    o += sec('Accounts and access (no passwords)', h.access, function (d) {
      return '- **' + mdEsc(d.system) + '** · ' + mdEsc(d.account_or_role) + ' → ' + mdEsc(d.action) + ' ' + st(k, d) + '\n';
    });
    return o;
  }

  function mdProfile(k) {
    var r = k.role || {}, g = k.giver || {};
    var o = '# Role and context\n\n';
    o += line('Role', g.role_title) + line('Team', g.team) + line('Organisation', g.organization) + line('Prepared by', g.name) + line('Contact after leaving', g.contact_after_leaving);
    if (r.summary) o += '\n' + r.summary + ' ' + st(k, r) + '\n';
    if (r.context) o += '\n' + r.context + '\n';
    if (r.stakeholders && r.stakeholders.length) {
      o += '\n## People around this role\n\n' + r.stakeholders.map(function (s) { return '- **' + mdEsc(s.name) + '** — ' + mdEsc(s.relationship) + '\n'; }).join('');
    }
    if (k.tasks && k.tasks.length) {
      o += '\n## Task inventory\n\n| ID | Task | Frequency | Priority | Captured |\n|---|---|---|---|---|\n';
      o += k.tasks.slice().sort(function (a, b) { return (a.priority || 99) - (b.priority || 99); }).map(function (t) {
        return '| ' + [t.id, t.name, t.frequency, t.priority, t.captured].map(mdEsc).join(' | ') + ' |\n';
      }).join('');
    }
    return o;
  }

  function mdWorkflow(k, p) {
    var o = '# ' + p.id + ' · ' + mdEsc(p.name) + '\n\n';
    o += (p.summary ? p.summary + '\n\n' : '') + line('Starts when', p.trigger) + line('Frequency', p.frequency);
    o += line('Status', (p.complete ? 'complete' : 'incomplete — see open-questions.md'));
    o += line('View', effectiveView(p));
    if (p.coverage) {
      o += '\n## Coverage\n\n' + Object.keys(p.coverage).map(function (key) { return '- ' + key + ': ' + p.coverage[key] + '\n'; }).join('');
    }
    if (p.people && p.people.length) o += '\n## People\n\n' + p.people.map(function (x) { return '- **' + mdEsc(x.name_or_role) + '** — ' + mdEsc(x.involvement) + '\n'; }).join('');
    if (p.systems && p.systems.length) o += '\n## Systems and equipment\n\n' + p.systems.map(function (x) { return '- **' + mdEsc(x.name) + '** — ' + mdEsc(x.purpose) + (x.source_of_truth ? ' (source of truth)' : '') + '\n'; }).join('');
    var mm = p.mermaid || autoMermaid(p);
    if (mm) o += '\n## Flow\n\n```mermaid\n' + mm + '\n```\n';
    if (p.steps && p.steps.length) {
      o += '\n## Flow in words\n\n' + p.steps.map(function (s, i) {
        var nxt = (s.branches && s.branches.length)
          ? ' → ' + s.branches.map(function (b) { return 'if ' + b.label + ', go to ' + b.goto; }).join('; ')
          : s.next === 'end' ? ' → end of task'
          : s.next ? ' → then go to ' + s.next
          : '';
        return (i + 1) + '. **' + s.id + '** ' + mdEsc(s.title) + (s.when ? ' — when: ' + mdEsc(s.when) : '') + nxt + '\n';
      }).join('');
    }
    return o;
  }

  function mdProcedures(k, p) {
    var L = labels(k);
    var o = '# ' + p.id + ' · ' + mdEsc(p.name) + ' — procedures\n\n';
    (p.steps || []).forEach(function (s) {
      o += '## ' + s.id + ' · ' + mdEsc(s.title) + '\n\n' + st(k, s) + (s.safety ? ' `' + L.safety + '`' : '') + '\n\n';
      if (s.detail) o += s.detail + '\n\n';
      o += line('When', s.when) + line('Why', s.why) + line('Who does it', s.actor) + line('System / equipment', s.system) + line('Inputs', s.inputs) + line('Outputs', s.outputs) + line('How to check', s.check) + line('Risk', s.risk);
      if (s.who_can_do) o += line('Who can do it', L[s.who_can_do] + (s.who_can_do_confirmed ? '' : ' (proposed, not confirmed)'));
      if (s.image) o += line('Image', 'visuals/' + s.image);
      (s.pins || []).forEach(function (pin) { o += '  - Pin ' + pin.n + ': ' + mdEsc(pin.label) + (pin.confirmed ? '' : ' (position not confirmed)') + '\n'; });
      (s.branches || []).forEach(function (b) { o += '  - If **' + mdEsc(b.label) + '** → ' + b.goto + '\n'; });
      if (s.next) o += line('Next', s.next === 'end' ? 'end of task' : s.next);
      o += line('Source', s.source) + '\n';
    });
    return o;
  }

  function mdRules(k, p) {
    if (!p.rules || !p.rules.length) return '';
    return '# ' + p.id + ' · decisions, rules and exceptions\n\n' + p.rules.map(function (r) {
      return '## ' + r.id + '\n\n' + mdEsc(r.text) + '\n\n' + st(k, r) + '\n\n' + line('Why', r.why) + line('Applies when', r.applies_when) + line('Source', r.source) + '\n';
    }).join('');
  }

  function mdTrouble(k, p) {
    if (!p.troubleshooting || !p.troubleshooting.length) return '';
    return '# ' + p.id + ' · troubleshooting\n\n' + p.troubleshooting.map(function (t) {
      return '## ' + t.id + ' · ' + mdEsc(t.symptom) + '\n\n' + st(k, t) + '\n\n' + line('Likely cause', t.cause) + line('Fix', t.fix) + '\n';
    }).join('');
  }

  function mdScenarios(k, p) {
    if (!p.scenarios || !p.scenarios.length) return '';
    return '# ' + p.id + ' · practice scenarios\n\n' + p.scenarios.map(function (q) {
      return '## ' + q.id + '\n\n' + mdEsc(q.situation) + '\n\n**' + mdEsc(q.question) + '**\n\n' +
        (q.options || []).map(function (opt, i) { return (i === q.answer ? '- [x] ' : '- [ ] ') + opt + '\n'; }).join('') +
        '\n' + line('Why', q.explanation) + line('Refers to', q.refs) + '\n';
    }).join('');
  }

  function mdOpen(k) {
    var q = k.open_questions || [];
    if (!q.length) return '';
    return '# Open questions\n\n| ID | Question | Who to ask | Refers to |\n|---|---|---|---|\n' + q.map(function (x) {
      return '| ' + [x.id, x.question, x.who_to_ask, (x.refs || []).join(', ')].map(mdEsc).join(' | ') + ' |\n';
    }).join('');
  }

  function mdGlossary(k) {
    var g = k.glossary || [];
    if (!g.length) return '';
    return '# Glossary\n\n' + g.map(function (x) { return '- **' + mdEsc(x.term) + '** — ' + mdEsc(x.meaning) + '\n'; }).join('');
  }

  function mdChanges(k) {
    var c = k.change_log || [];
    if (!c.length) return '';
    return '# Change log\n\n| Date | Version | Change | By |\n|---|---|---|---|\n' + c.map(function (x) {
      return '| ' + [x.date, x.version, x.change, x.by].map(mdEsc).join(' | ') + ' |\n';
    }).join('');
  }

  function yamlStr(v) { return JSON.stringify(v == null ? '' : String(v)); }
  function manifest(k, imageNames) {
    return [
      'schema_version: ' + yamlStr(k.schema_version || '1.0'),
      'knowledge_pack_id: ' + yamlStr(k.pack_id),
      'version: ' + (k.version || 1),
      'title: ' + yamlStr(k.title),
      'language: ' + yamlStr(k.language),
      'organization: ' + yamlStr((k.giver || {}).organization),
      'role: ' + yamlStr((k.giver || {}).role_title),
      'processes: [' + (k.processes || []).map(function (p) { return yamlStr(p.id); }).join(', ') + ']',
      'updated_at: ' + yamlStr(k.saved_at),
      'created_by: ' + yamlStr((k.giver || {}).name),
      'review_status: ' + yamlStr(k.stage === 'complete' ? 'reviewed-by-giver' : 'draft'),
      'source_type: "interview"',
      'assets: [' + (imageNames || []).map(yamlStr).join(', ') + ']',
      'confidentiality: ' + yamlStr(k.confidentiality || 'unset'),
      ''
    ].join('\n');
  }

  var TEACH = [
    '# How to use this pack (instructions for the AI)',
    '',
    'You are teaching someone to take over the work described below. The person who did this work may no longer be available. Teach; do not just recite.',
    '',
    '1. First reply: introduce before giving any file, in one short message in the learner\'s language. (a) Welcome them and say in two or three plain lines what this handover is (who handed it over, when), what the work is for, how many tasks there are and which matters most. (b) List up to three urgent items from "Handover status", soonest first, with "in N days"; if the status is past its "valid until" date, say it may be out of date. (c) Only then introduce START-HERE.html: the handover in one page, opened in any browser, urgent items at the top, and a "Walk me through" button on each task. If you have the file and can send files, send it; otherwise tell them it is in the zip they received. Skip this if they already have it open. If their first message is a specific question, answer it first, then give a shorter introduction.',
    '2. Ask the learner\'s level with one quick choice: new to this work / done similar work / just reviewing. Suggest where to start (usually the most urgent task). Adjust depth and pace.',
    '3. Choose how to explain from the shape of the content — do not wait to be asked: work passed between people → swimlane; yes/no choices → flowchart; statuses → state diagram; a calendar → timeline; a problem → symptom → cause → fix. If you cannot draw, use numbered steps.',
    '4. Main method: guided walkthrough. One step at a time: what to do, why it matters, how to check it worked. Wait for "done" before the next step; at a branch, ask which case applies. Mention the step\'s image file (visuals/…) and its pins; the learner can open START-HERE.html to see the images, or send you their own screenshot or photo to check they are in the right place.',
    '5. Other methods when useful: overview, first-week plan, explain why, Q&A, troubleshooting, practice scenarios (below), two or three check questions after each task.',
    '6. Honesty: cite IDs (e.g. P01.S03, R-002). Items marked "Needs confirmation" (ai_inferred, needs_update) must be flagged every time you use them. Never present general knowledge as this organisation\'s practice. Safety steps: tell the learner to follow the official safety procedure and get supervision until confirmed.',
    '7. When this pack has no answer, say so, check "Open questions", and draft a short message to the person most likely to know.',
    '8. If the learner finds something outdated or new, propose the exact change against its ID (before and after). Do not treat it as fact yet: it needs confirmation from the owner (the person who handed over, if reachable; otherwise their manager or the process owner). Add it to a change list for the learner to pass on.',
    '',
    'Status meanings: validated = confirmed; employee_provided / source_supported / ai_organized / unverified = not yet reviewed; ai_inferred / needs_update = needs confirmation; open_question = unresolved.',
    ''
  ].join('\n');

  function mdForAI(k) {
    var parts = [TEACH, '---', '', '# ' + mdEsc(k.title || 'Knowledge pack') + ' (' + (k.pack_id || '') + ' · v' + (k.version || 1) + ' · ' + (k.saved_at || '') + ')', ''];
    parts.push(mdHandover(k).replace(/^# /, '## '));
    parts.push(mdProfile(k).replace(/^# /gm, '## '));
    (k.processes || []).forEach(function (p) {
      parts.push(mdWorkflow(k, p).replace(/^# /gm, '## ').replace(/^## (?!P\d)/gm, '### '));
      parts.push(mdProcedures(k, p).replace(/^# .*\n/, '').replace(/^## /gm, '### '));
      [mdRules(k, p), mdTrouble(k, p), mdScenarios(k, p)].forEach(function (s) {
        if (s) parts.push(s.replace(/^# /gm, '### ').replace(/^## /gm, '#### '));
      });
    });
    [mdOpen(k), mdGlossary(k)].forEach(function (s) { if (s) parts.push(s.replace(/^# /gm, '## ')); });
    return parts.join('\n');
  }

  function readme(k) {
    return [
      '# ' + (k.title || 'Knowledge pack'),
      '',
      'Knowledge pack ' + (k.pack_id || '') + ', version ' + (k.version || 1) + ', saved ' + (k.saved_at || '') + '.',
      '',
      '- **Easiest start:** attach this zip (or `PACK-FOR-AI.md`) to any AI chat and say "teach me from this pack". The AI explains the work and what is urgent first, then gives you `START-HERE.html`.',
      '- **Without an AI:** open `START-HERE.html` in any web browser. Urgent items are at the top, then the work map and a step-by-step walkthrough for each task. It works offline and can be sent on its own.',
      '- **Learn with an AI:** attach `PACK-FOR-AI.md` to any AI chat and ask it to teach you from the pack.',
      '- **Unanswered questions:** `open-questions.md`.',
      '- **Original images:** `visuals/` (unaltered).',
      '- **Keeping it current:** `knowledge.json` is the source of everything here. Paste it into a chat that has the knowledge-handover skill, or into the Pack Builder, to update and rebuild the pack.',
      '',
      'Confidentiality: ' + (k.confidentiality || 'unset') + '. Store and share this pack only through channels your organisation approves.',
      ''
    ].join('\n');
  }

  function defaultMessage(k) {
    if (k.handover_message) return k.handover_message;
    if ((k.language || '') === 'th') {
      return 'ส่งไฟล์ส่งต่องาน "' + (k.title || '') + '" ให้นะครับ/ค่ะ\n\n' +
        '1) แนบไฟล์ zip นี้ในแชต AI ตัวไหนก็ได้ (ถ้าแนบ zip ไม่ได้ ให้แนบ PACK-FOR-AI.md) แล้วพิมพ์ว่า "สอนงานจาก pack นี้" AI จะเล่าภาพรวมและเรื่องด่วนให้ก่อน แล้วส่งไฟล์ START-HERE.html ให้พร้อมพาทำทีละขั้น\n' +
        '2) ถ้าไม่ใช้ AI เปิด START-HERE.html ในเบราว์เซอร์ได้เลย เรื่องด่วนอยู่บนสุด\n' +
        '3) เรื่องที่ยังไม่มีคำตอบอยู่ใน open-questions.md\n';
    }
    return 'Here is the handover pack for "' + (k.title || '') + '".\n\n' +
      '1) Attach this zip to any AI chat (or PACK-FOR-AI.md if the chat will not take a zip) and say "teach me from this pack". The AI will explain the work and what is urgent first, then give you START-HERE.html and walk you through it.\n' +
      '2) No AI? Open START-HERE.html in your browser; urgent items are at the top.\n' +
      '3) Questions I couldn\'t answer are in open-questions.md.\n';
  }

  // ── START-HERE.html ─────────────────────────────────────────────────────
  function safeJson(o) {
    return JSON.stringify(o).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
      .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  }

  function renderStartHere(k, imageDataUrls, template, fontsCss) {
    return template
      .replace('/*__FONTS__*/', function () { return fontsCss || ''; })
      .replace('__TITLE__', function () { return String(k.title || 'Knowledge pack').replace(/[<>&"]/g, ''); })
      .replace('__LANG__', function () { return String(k.language || 'en').replace(/[^a-zA-Z-]/g, ''); })
      .replace('"__DATA__"', function () { return safeJson(k); })
      .replace('"__IMAGES__"', function () { return safeJson(imageDataUrls || {}); });
  }

  // ── Base64 + zip (store, no compression) ────────────────────────────────
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  function base64(bytes) {
    var out = '', i;
    for (i = 0; i + 2 < bytes.length; i += 3) {
      var n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
      out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + B64[(n >> 6) & 63] + B64[n & 63];
    }
    var rem = bytes.length - i;
    if (rem === 1) { var a = bytes[i] << 16; out += B64[(a >> 18) & 63] + B64[(a >> 12) & 63] + '=='; }
    else if (rem === 2) { var b = (bytes[i] << 16) | (bytes[i + 1] << 8); out += B64[(b >> 18) & 63] + B64[(b >> 12) & 63] + B64[(b >> 6) & 63] + '='; }
    return out;
  }
  function mimeFor(name) {
    var ext = String(name).split('.').pop().toLowerCase();
    return { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml' }[ext] || 'application/octet-stream';
  }

  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  var enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
  function toBytes(data) { return typeof data === 'string' ? enc.encode(data) : data; }

  function zip(files) {
    var d = new Date();
    var time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    var date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    var chunks = [], central = [], offset = 0;
    files.forEach(function (f) {
      var name = enc.encode(f.path), data = toBytes(f.data), crc = crc32(data);
      var h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true);
      h.setUint16(8, 0, true); h.setUint16(10, time, true); h.setUint16(12, date, true);
      h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true);
      h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
      chunks.push(new Uint8Array(h.buffer), name, data);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true);
      c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true); c.setUint16(12, time, true);
      c.setUint16(14, date, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true);
      c.setUint32(24, data.length, true); c.setUint16(28, name.length, true);
      c.setUint32(42, offset, true);
      central.push(new Uint8Array(c.buffer), name);
      offset += 30 + name.length + data.length;
    });
    var cdSize = central.reduce(function (s, x) { return s + x.length; }, 0);
    var e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
    e.setUint32(12, cdSize, true); e.setUint32(16, offset, true);
    var all = chunks.concat(central, [new Uint8Array(e.buffer)]);
    var total = all.reduce(function (s, x) { return s + x.length; }, 0);
    var out = new Uint8Array(total), pos = 0;
    all.forEach(function (x) { out.set(x, pos); pos += x.length; });
    return out;
  }

  // ── Build ───────────────────────────────────────────────────────────────
  // images: { "P01-S01.jpg": Uint8Array, ... }
  function build(pack, images, opts) {
    opts = opts || {};
    var k = JSON.parse(JSON.stringify(pack));
    if (!k.pack_id) k.pack_id = 'KP-DRAFT';
    if (!k.accent) k.accent = '#bf4520';
    if (!k.saved_at) k.saved_at = today();
    images = images || {};
    var names = Object.keys(images);
    var warnings = validate(k, names);
    var root = safeSeg(k.pack_id, 'KP-DRAFT') + '/';
    var files = [];
    var add = function (path, data) { if (data) files.push({ path: root + path, data: data }); };

    // START-HERE embeds display copies (e.g. downscaled) when given; visuals/ keeps the originals.
    var display = opts.displayImages || {};
    var urls = {};
    names.forEach(function (n) {
      var d = display[n];
      urls[n] = d ? 'data:' + (d.mime || mimeFor(n)) + ';base64,' + base64(d.bytes || d) : 'data:' + mimeFor(n) + ';base64,' + base64(images[n]);
    });

    add('START-HERE.html', renderStartHere(k, urls, opts.template, opts.fontsCss));
    add('PACK-FOR-AI.md', mdForAI(k));
    add('knowledge.json', JSON.stringify(k, null, 2) + '\n');
    add('README.md', readme(k));
    add('handover-message.txt', defaultMessage(k));
    add('handover-status.md', mdHandover(k));
    add('profile/role-and-context.md', mdProfile(k));
    (k.processes || []).forEach(function (p) {
      var dir = 'processes/' + folderFor(p) + '/';
      add(dir + 'workflow.md', mdWorkflow(k, p));
      add(dir + 'procedures.md', (p.steps || []).length ? mdProcedures(k, p) : '');
      add(dir + 'decisions.md', mdRules(k, p));
      add(dir + 'troubleshooting.md', mdTrouble(k, p));
      add(dir + 'scenarios.md', mdScenarios(k, p));
    });
    add('open-questions.md', mdOpen(k));
    add('glossary.md', mdGlossary(k));
    add('change-log.md', mdChanges(k));
    add('manifest.yaml', manifest(k, names));
    names.forEach(function (n) { add('visuals/' + safeSeg(n, 'image'), images[n]); });

    var zipName = 'knowledge-handover_' + safeSeg(k.pack_id, 'KP-DRAFT') + '_' + safeSeg(k.saved_at, today()) + '.zip';
    return { files: files, warnings: warnings, zipName: zipName, root: root.slice(0, -1), pack: k };
  }

  return {
    STATUSES: STATUSES, BADGE: BADGE, labels: labels, VIEWS: VIEWS, effectiveView: effectiveView,
    parseSave: parseSave, mergePacks: mergePacks, validate: validate,
    build: build, zip: zip, base64: base64, crc32: crc32,
    autoMermaid: autoMermaid, mdForAI: mdForAI, renderStartHere: renderStartHere
  };
});
