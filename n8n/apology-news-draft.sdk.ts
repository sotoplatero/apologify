import { workflow, node, trigger, sticky, merge, ifElse, expr } from '@n8n/workflow-sdk';

const FAST_MODEL = 'gpt-6-luna';
const SMART_MODEL = 'gpt-6.1-sol';
const OPENAI = { openAiApi: { id: 'dZUOz3Do5TNJl79b', name: 'OpenAi account' } };
const REPO_API = 'https://api.github.com/repos/sotoplatero/apologify';

const PARSE_HELPERS = `
function textOf(j) {
  if (Array.isArray(j.choices) && j.choices[0] && j.choices[0].message) return String(j.choices[0].message.content || '');
  if (typeof j.merged_response === 'string') return j.merged_response;
  if (Array.isArray(j.content)) return j.content.map(function (c) { return c.text || ''; }).join('');
  if (typeof j.text === 'string') return j.text;
  if (j.message && typeof j.message.content === 'string') return j.message.content;
  return JSON.stringify(j);
}
function parseJson(s) {
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a < 0 || b < 0) return null;
  try { return JSON.parse(s.slice(a, b + 1)); } catch (e) { return null; }
}
`;

const OPENAI_FN = `
function openAiBody(system, user, maxTokens) {
  return { model: MODEL, reasoning_effort: EFFORT, max_completion_tokens: maxTokens, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] };
}
`;

const CLASSIFY_SYSTEM = `You triage news headlines for a weekly roundup of PUBLIC APOLOGIES.
For each item decide:
- "apology": a public figure, brand, institution or government ISSUED an apology (statement, post, video, letter, press conference).
- "non_apology": they explicitly REFUSED to apologize, issued an "if anyone was offended" style non-apology, or retracted an apology.
- "not_relevant": calls or demands for an apology, rumors of a coming apology, private individuals, minors, "sorry" as a figure of speech, product or film names, apologies for losing a game or a poor sporting result (no wrongdoing), anything else.
Use the issuer's full canonical name in "who" (e.g. "Michael Robinson", not "NFL Network analyst"), always the same spelling for the same issuer.
Exclude private individuals and minors even if viral.
Return JSON only, one entry per input item:
{"items":[{"i":<index from input>,"label":"apology|non_apology|not_relevant","who":"<issuer, canonical name>","category":"brand|celebrity|sports|politics|government|other","country":"<ISO2 or empty>","event":"<what they apologized for, max 8 words>"}]}`;

const SCORE_SYSTEM = `You grade public apologies for the editor of a weekly newsletter. Judge ONLY the apology text and conduct, never whether the issuer is guilty of what they are accused of.

First decide if the evidence shows the issuer actually issued a public apology recently (or explicitly refused / issued a non-apology). If not, return {"keep": false}.

Score each component 0, 1 or 2:
- responsibility (weight 3): 0 denies or deflects, 1 vague ("we fell short"), 2 clear first person "I/we did X"
- repair (weight 2): 0 none, 1 generic ("we'll do better"), 2 concrete and checkable (refunds, donation, policy change, date)
- names_act (weight 2): 0 never says what happened, 1 euphemism ("the incident"), 2 says exactly what was done
- regret (weight 1): 0 absent, 1 formulaic, 2 sincere and specific to who was hurt
- forbearance (weight 1): 0 absent, 1 promise only, 2 promise plus a verifiable step
- asks_forgiveness (weight 1): 0 absent, 1 implied, 2 explicit "I'm sorry" / "we apologize"
total = weighted sum (max 20). Penalties, -2 each, floor 0: passive_voice ("mistakes were made"), conditional ("if anyone was offended"), blame_shift, late (only once it went viral), forced (only after legal or commercial pressure), lawyered (PR boilerplate that says nothing).
A refusal or non-apology totals 0.

Writing rules:
- headline: max 12 words, factual, no clickbait.
- summary: 2-3 sentences in your own words: what happened and what they said. Never copy sentences from the sources.
- quote: the single most telling line of the apology itself, exact, max 25 words; "" if the apology text is not in the evidence.
- verdict: one sentence, max 15 words, concrete, explains the score, no empty adjectives (heartfelt, powerful). It must name a specific detail of THIS case (what they did, said or offered). Never start with "Clearly". Be strict: a plain "sorry" with a vague promise is mediocre, not excellent. Examples: "Names the failure, refunds everyone, no small print." / "Says sorry twice, never says for what." / "Three lawyer paragraphs and not one admission."
- statement_url: URL from the evidence that holds the apology itself (issuer's own site or post, or an article quoting it in full); "" if none.
- source_url and source_name: the most reputable news outlet URL from the evidence, and the outlet's name.
- Never return news.google.com URLs: they are redirects, not articles.
- statement_date: YYYY-MM-DD if known, else "".
- sensitive: true if the case involves recent deaths, abuse victims or minors.

Return JSON only:
{"keep":true,"headline":"","summary":"","quote":"","scores":{"responsibility":0,"repair":0,"names_act":0,"regret":0,"forbearance":0,"asks_forgiveness":0},"penalties":[],"total":0,"verdict":"","statement_url":"","source_url":"","source_name":"","statement_date":"","sensitive":false}`;

const LINEUP_SYSTEM = `You propose the lineup of this week's issue of a newsletter that grades public apologies.
From the graded cases pick 6 or 7 (fewer only if there are not enough):
- exactly 1 "best": the highest score that teaches something about apologizing well
- exactly 1 "worst": the lowest score or a non-apology
- the rest "brief"
Max 2 per category. Prefer geographic variety. Never use a case with "sensitive": true as best or worst.
Write the issue title: a hook naming the best and the worst case, max 10 words. Intro: max 2 sentences.
Return JSON only: {"title":"","intro":"","lineup":[{"id":"","slot":"best|worst|brief"}]}`;

const weeklyTrigger = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.4,
  config: {
    name: 'Every Monday 07:00',
    parameters: {
      rule: { interval: [{ field: 'weeks', weeksInterval: 1, triggerAtDay: [1], triggerAtHour: 7, triggerAtMinute: 0 }] },
    },
  },
  output: [{ timestamp: '2026-11-02T07:00:00.000+01:00' }],
});

const getSeen = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get seen cases',
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: '1wiueO8HTZCwyxuZ', cachedResultName: 'apology_news_seen' },
      returnAll: true,
    },
  },
  output: [{ id: 1, cluster_key: 'acme-airlines', who: 'Acme Airlines', week: '2026-w44', createdAt: '2026-10-27T08:00:00.000Z' }],
});

const buildQueries = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build news queries',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const queries = ['apologizes', 'apologised', '"issued an apology"', '"we apologize"', '"says sorry"', '"refuses to apologize"', '"apology statement"', '"public apology"'];
return queries.map(function (q) {
  return { json: { query: q, url: 'https://news.google.com/rss/search?q=' + encodeURIComponent(q + ' when:7d') + '&hl=en-US&gl=US&ceid=US:en' } };
});`,
    },
  },
  output: [{ query: 'apologizes', url: 'https://news.google.com/rss/search?q=apologizes%20when%3A7d&hl=en-US&gl=US&ceid=US:en' }],
});

const readNews = node({
  type: 'n8n-nodes-base.rssFeedRead',
  version: 1.2,
  config: {
    name: 'Read Google News RSS',
    onError: 'continueRegularOutput',
    retryOnFail: true,
    maxTries: 3,
    waitBetweenTries: 3000,
    parameters: { url: expr('{{ $json.url }}') },
  },
  output: [{ title: 'Acme Airlines apologizes after stranding 4,000 passengers - Reuters', link: 'https://news.google.com/rss/articles/abc', isoDate: '2026-10-29T10:00:00.000Z', contentSnippet: 'Acme Airlines apologizes after stranding 4,000 passengers Reuters' }],
});

const fetchGdelt = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Search GDELT',
    executeOnce: true,
    onError: 'continueRegularOutput',
    retryOnFail: true,
    maxTries: 3,
    waitBetweenTries: 5000,
    parameters: {
      method: 'GET',
      url: 'https://api.gdeltproject.org/api/v2/doc/doc',
      sendQuery: true,
      specifyQuery: 'keypair',
      queryParameters: {
        parameters: [
          { name: 'query', value: '(apologizes OR apologized OR "issued an apology" OR "we apologize" OR "refuses to apologize") sourcelang:english' },
          { name: 'mode', value: 'artlist' },
          { name: 'maxrecords', value: '250' },
          { name: 'timespan', value: '7d' },
          { name: 'sort', value: 'hybridrel' },
          { name: 'format', value: 'json' },
        ],
      },
      options: { response: { response: { responseFormat: 'json' } }, timeout: 30000 },
    },
  },
  output: [{ articles: [{ url: 'https://www.bbc.com/news/acme', title: 'Acme Airlines says sorry', seendate: '20261029T100000Z', domain: 'bbc.com', sourcecountry: 'United Kingdom' }] }],
});

const allHeadlines = merge({
  version: 3.2,
  config: { name: 'All headlines', parameters: { mode: 'append' } },
});

const normalize = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Normalize headlines',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: 'const MODEL = ' + JSON.stringify(FAST_MODEL) + ';\nconst EFFORT = "none";\nconst SYSTEM = ' + JSON.stringify(CLASSIFY_SYSTEM) + ';\n' + OPENAI_FN + `const now = Date.now();
const maxAge = 8 * 24 * 3600 * 1000;
function clean(s) { return String(s || '').split(/\\s+/).join(' ').trim(); }
const out = [];
for (const it of $input.all()) {
  const j = it.json;
  if (Array.isArray(j.articles)) {
    for (const a of j.articles) {
      const m = String(a.seendate || '').match(/^(\\d{4})(\\d{2})(\\d{2})T(\\d{2})(\\d{2})(\\d{2})Z$/);
      const ts = m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) : now;
      out.push({ title: clean(a.title), url: a.url, source: a.domain || '', publishedAt: new Date(ts).toISOString(), snippet: '' });
    }
  } else if (j.title && j.link) {
    let title = clean(j.title);
    let source = '';
    const k = title.lastIndexOf(' - ');
    if (k > 20) { source = title.slice(k + 3); title = title.slice(0, k); }
    const ts = Date.parse(j.isoDate || j.pubDate || '') || now;
    out.push({ title: title, url: j.link, source: source, publishedAt: new Date(ts).toISOString(), snippet: clean(j.contentSnippet).slice(0, 200) });
  }
}
const seen = {};
const fresh = out.filter(function (h) {
  if (!h.title || !h.url || now - Date.parse(h.publishedAt) > maxAge) return false;
  const key = h.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (seen[key]) return false;
  seen[key] = 1;
  return true;
}).slice(0, 240);
const batches = [];
for (let i = 0; i < fresh.length; i += 40) {
  const chunk = fresh.slice(i, i + 40);
  const prompt = chunk.map(function (h, n) { return { i: i + n, title: h.title, source: h.source, snippet: h.snippet }; });
  batches.push({ json: { offset: i, headlines: chunk, body: openAiBody(SYSTEM, JSON.stringify(prompt), 8000) } });
}
return batches;`,
    },
  },
  output: [{ offset: 0, headlines: [{ title: 'Acme Airlines apologizes after stranding 4,000 passengers', url: 'https://news.google.com/rss/articles/abc', source: 'Reuters', publishedAt: '2026-10-29T10:00:00.000Z', snippet: '' }], body: { model: 'gpt-6-luna', messages: [] } }],
});

const classify = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Classify headlines',
    retryOnFail: true,
    maxTries: 3,
    waitBetweenTries: 5000,
    credentials: OPENAI,
    parameters: {
      method: 'POST',
      url: 'https://api.openai.com/v1/chat/completions',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'openAiApi',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.body) }}'),
      options: { timeout: 120000 },
    },
  },
  output: [{ choices: [{ message: { role: 'assistant', content: '{"items":[{"i":0,"label":"apology","who":"Acme Airlines","category":"brand","country":"US","event":"stranding 4,000 passengers"}]}' } }] }],
});

const clusterCases = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Cluster cases',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: PARSE_HELPERS + `
const all = [];
for (const b of $('Normalize headlines').all()) for (const h of b.json.headlines) all.push(h);
const cutoff = Date.now() - 21 * 24 * 3600 * 1000;
const seen = {};
for (const r of $('Get seen cases').all()) {
  if (r.json.cluster_key && Date.parse(r.json.createdAt || 0) >= cutoff) seen[r.json.cluster_key] = 1;
}
function slug(s) { return String(s || '').normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
const clusters = {};
for (const it of $input.all()) {
  const parsed = parseJson(textOf(it.json));
  if (!parsed || !Array.isArray(parsed.items)) continue;
  for (const c of parsed.items) {
    if (c.label !== 'apology' && c.label !== 'non_apology') continue;
    const h = all[c.i];
    const key = slug(c.who);
    if (!h || !key || seen[key]) continue;
    if (!clusters[key]) clusters[key] = { key: key, who: c.who, category: c.category || 'other', country: c.country || '', event: c.event || '', votes: { apology: 0, non_apology: 0 }, sources: [], outlets: {} };
    const cl = clusters[key];
    cl.votes[c.label] += 1;
    const outlet = (h.source || h.url).toLowerCase();
    if (!cl.outlets[outlet]) { cl.outlets[outlet] = 1; cl.sources.push({ title: h.title, url: h.url, source: h.source, publishedAt: h.publishedAt }); }
  }
}
const STOP = { apologizes: 1, apologises: 1, apologized: 1, apologised: 1, apology: 1, apologise: 1, apologize: 1, after: 1, over: 1, with: 1, from: 1, says: 1, sorry: 1, their: 1, they: 1, this: 1, that: 1, about: 1, into: 1, amid: 1, for: 1, the: 1, and: 1 };
function bag(c) {
  const out = {};
  [c.who, c.event].concat(c.sources.map(function (s) { return s.title; })).forEach(function (t) {
    slug(t).split('-').forEach(function (w) { if (w.length >= 4 && !STOP[w]) out[w] = 1; });
  });
  return out;
}
const order = Object.keys(clusters).sort(function (a, b) { return Object.keys(clusters[b].outlets).length - Object.keys(clusters[a].outlets).length; });
const kept = [];
order.forEach(function (k) {
  const c = clusters[k];
  const words = bag(c);
  const target = kept.find(function (t) {
    const tw = bag(t);
    return Object.keys(words).filter(function (w) { return tw[w]; }).length >= 3;
  });
  if (!target) { kept.push(c); return; }
  target.votes.apology += c.votes.apology;
  target.votes.non_apology += c.votes.non_apology;
  if (!target.country && c.country) target.country = c.country;
  c.sources.forEach(function (s) {
    const o = (s.source || s.url).toLowerCase();
    if (!target.outlets[o]) { target.outlets[o] = 1; target.sources.push(s); }
  });
});
const list = kept.map(function (c) {
  return { key: c.key, who: c.who, category: c.category, country: c.country, event: c.event, label: c.votes.non_apology > c.votes.apology ? 'non_apology' : 'apology', coverage: Object.keys(c.outlets).length, sources: c.sources.slice(0, 6) };
});
list.sort(function (a, b) { return b.coverage - a.coverage; });
const strong = list.filter(function (c) { return c.coverage >= 2; });
const picked = (strong.length >= 8 ? strong : strong.concat(list.filter(function (c) { return c.coverage < 2; }))).slice(0, 12);
return picked.map(function (c) { return { json: c }; });`,
    },
  },
  output: [{ key: 'acme-airlines', who: 'Acme Airlines', category: 'brand', country: 'US', event: 'stranding 4,000 passengers', label: 'apology', coverage: 4, sources: [{ title: 'Acme Airlines apologizes after stranding 4,000 passengers', url: 'https://news.google.com/rss/articles/abc', source: 'Reuters', publishedAt: '2026-10-29T10:00:00.000Z' }] }],
});

const research = node({
  type: '@tavily/n8n-nodes-tavily.tavily',
  version: 1,
  config: {
    name: 'Find apology statement',
    onError: 'continueRegularOutput',
    retryOnFail: true,
    maxTries: 2,
    waitBetweenTries: 3000,
    credentials: { tavilyApi: { id: 'wzQt6pNR4ks7VztN', name: 'Tavily account' } },
    parameters: {
      resource: 'search',
      operation: 'query',
      query: expr('{{ $json.who }} apology statement {{ $json.event }}'),
      options: { topic: 'news', days: 10, search_depth: 'advanced', chunks_per_source: 3, max_results: 5 },
    },
  },
  output: [{ query: 'Acme Airlines apology statement stranding 4,000 passengers', results: [{ title: 'Acme CEO: We failed you', url: 'https://news.acme.com/statement', content: 'We failed you, and we are refunding every ticket...', score: 0.9 }] }],
});

const buildScorePrompts = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build score prompts',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: 'const MODEL = ' + JSON.stringify(SMART_MODEL) + ';\nconst EFFORT = "low";\nconst SYSTEM = ' + JSON.stringify(SCORE_SYSTEM) + ';\n' + OPENAI_FN + `const cases = $('Cluster cases').all();
return $input.all().map(function (it, idx) {
  const c = cases[idx].json;
  const results = (it.json.results || []).slice(0, 5);
  const evidence = results.map(function (r) { return 'URL: ' + r.url + '\\nTITLE: ' + r.title + '\\nTEXT: ' + String(r.content || '').slice(0, 1500); }).join('\\n---\\n');
  const headlines = c.sources.map(function (s) { return '- ' + s.title + ' (' + s.source + ') ' + s.url; }).join('\\n');
  const user = 'Issuer: ' + c.who + ' (' + c.category + ', ' + (c.country || '?') + ')\\nType: ' + c.label + '\\nEvent: ' + c.event + '\\n\\nCoverage headlines:\\n' + headlines + '\\n\\nEvidence (search results, may include the apology text):\\n' + (evidence || '(none)');
  return { json: Object.assign({}, c, { evidence: results.map(function (r) { return { url: r.url, title: r.title }; }), body: openAiBody(SYSTEM, user, 6000) }) };
});`,
    },
  },
  output: [{ key: 'acme-airlines', who: 'Acme Airlines', category: 'brand', country: 'US', event: 'stranding 4,000 passengers', label: 'apology', coverage: 4, sources: [], body: { model: 'gpt-6-luna', messages: [] } }],
});

const score = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Grade apology',
    retryOnFail: true,
    maxTries: 3,
    waitBetweenTries: 5000,
    credentials: OPENAI,
    parameters: {
      method: 'POST',
      url: 'https://api.openai.com/v1/chat/completions',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'openAiApi',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.body) }}'),
      options: { timeout: 120000 },
    },
  },
  output: [{ choices: [{ message: { role: 'assistant', content: '{"keep":true,"grade":"A","verdict":"Names the failure, refunds everyone, no small print."}' } }] }],
});

const collectScores = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Collect graded cases',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: 'const MODEL = ' + JSON.stringify(SMART_MODEL) + ';\nconst EFFORT = "low";\nconst SYSTEM = ' + JSON.stringify(LINEUP_SYSTEM) + ';\n' + OPENAI_FN + PARSE_HELPERS + `
const base = $('Build score prompts').all();
const cases = [];
function realUrl(u) { return typeof u === 'string' && /^https?:/.test(u) && u.indexOf('news.google.com') < 0 ? u : ''; }
function hostOf(u) { const m = String(u || '').match(/^https?:[/][/]([^/?#]+)/i); return m ? m[1].toLowerCase().replace(/^www[.]/, '') : ''; }
const KEYS = ['responsibility', 'repair', 'names_act', 'regret', 'forbearance', 'asks_forgiveness'];
function scoreOf(s, label) {
  if (label === 'non_apology') return 0;
  const sc = s.scores || {};
  if (!KEYS.every(function (k) { return typeof sc[k] === 'number'; })) return typeof s.total === 'number' ? Math.round(Math.min(20, Math.max(0, s.total)) / 2) / 2 : 2.5;
  const penalties = Array.isArray(s.penalties) ? s.penalties.length : 0;
  const t = Math.max(0, 3 * sc.responsibility + 2 * sc.repair + 2 * sc.names_act + sc.regret + sc.forbearance + sc.asks_forgiveness - 2 * penalties);
  return Math.round(Math.min(20, t) / 2) / 2;
}
$input.all().forEach(function (it, idx) {
  const c = base[idx].json;
  const s = parseJson(textOf(it.json));
  if (!s || s.keep === false) return;
  const score = scoreOf(s, c.label);
  const evidenceUrls = (c.evidence || []).map(function (e) { return realUrl(e.url); }).filter(Boolean);
  const statementUrl = realUrl(s.statement_url);
  const llmSource = realUrl(s.source_url);
  const sourceUrl = llmSource || evidenceUrls.find(function (u) { return u !== statementUrl; }) || evidenceUrls[0] || statementUrl;
  const sourceName = llmSource ? (s.source_name || hostOf(sourceUrl)) : hostOf(sourceUrl);
  cases.push({
    id: c.key, who: c.who, category: c.category, country: c.country, label: c.label, coverage: c.coverage, event: c.event,
    headline: s.headline || c.event, summary: s.summary || '', quote: s.quote || '',
    score: score, scores: s.scores || {}, penalties: s.penalties || [],
    verdict: s.verdict || '', sensitive: !!s.sensitive,
    statementUrl: statementUrl, sourceUrl: sourceUrl, sourceName: sourceName, statementDate: s.statement_date || ''
  });
});
if (!cases.length) return [];
const week = $now.toFormat("kkkk-'w'WW");
const brief = cases.map(function (c) { return { id: c.id, who: c.who, category: c.category, country: c.country, label: c.label, score: c.score, verdict: c.verdict, sensitive: c.sensitive, coverage: c.coverage }; });
return [{ json: { week: week, cases: cases, body: openAiBody(SYSTEM, JSON.stringify(brief), 4000) } }];`,
    },
  },
  output: [{ week: '2026-w45', cases: [{ id: 'acme-airlines', who: 'Acme Airlines', score: 4.5, verdict: 'Names the failure, refunds everyone, no small print.' }], body: { model: 'gpt-6-luna', messages: [] } }],
});

const lineup = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Propose lineup',
    retryOnFail: true,
    maxTries: 3,
    waitBetweenTries: 5000,
    credentials: OPENAI,
    parameters: {
      method: 'POST',
      url: 'https://api.openai.com/v1/chat/completions',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'openAiApi',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.body) }}'),
      options: { timeout: 120000 },
    },
  },
  output: [{ choices: [{ message: { role: 'assistant', content: '{"title":"Acme gets it right","intro":"","lineup":[{"id":"acme-airlines","slot":"best"}]}' } }] }],
});

const buildReview = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build review form',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: PARSE_HELPERS + `
const d = $('Collect graded cases').first().json;
const lu = parseJson(textOf($input.first().json)) || {};
const slotOf = {};
(lu.lineup || []).forEach(function (x) { slotOf[x.id] = x.slot; });
function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
const fields = [
  { fieldLabel: 'Issue title', fieldType: 'text', defaultValue: lu.title || '', requiredField: true },
  { fieldLabel: 'Intro', fieldType: 'textarea', defaultValue: lu.intro || '' }
];
d.cases.forEach(function (c, n) {
  const k = n + 1;
  const links = '<a href="' + esc(c.statementUrl || c.sourceUrl) + '">statement</a> · <a href="' + esc(c.sourceUrl) + '">' + esc(c.sourceName || 'source') + '</a>';
  fields.push({ fieldType: 'html', html: '<hr><h3>' + k + '. ' + esc(c.who) + ' · ' + c.score + '/5' + (c.sensitive ? ' · SENSITIVE' : '') + '</h3><p><b>' + esc(c.headline) + '</b></p><p>' + esc(c.summary) + '</p>' + (c.quote ? '<blockquote>' + esc(c.quote) + '</blockquote>' : '') + '<p>' + links + ' · coverage ' + c.coverage + ' · ' + esc(c.category) + ' ' + esc(c.country) + ' · ' + esc(c.label) + '</p>' });
  fields.push({ fieldLabel: k + '. Slot', fieldType: 'dropdown', fieldOptions: { values: [{ option: 'skip' }, { option: 'best' }, { option: 'worst' }, { option: 'brief' }] }, defaultValue: slotOf[c.id] || 'skip', requiredField: true });
  fields.push({ fieldLabel: k + '. Score (0-5)', fieldType: 'number', defaultValue: String(c.score), requiredField: true });
  fields.push({ fieldLabel: k + '. Verdict', fieldType: 'text', defaultValue: c.verdict, requiredField: true });
  fields.push({ fieldLabel: k + '. Headline', fieldType: 'text', defaultValue: c.headline });
  fields.push({ fieldLabel: k + '. Summary', fieldType: 'textarea', defaultValue: c.summary });
});
return [{ json: { week: d.week, count: d.cases.length, title: lu.title || '', intro: lu.intro || '', cases: d.cases, formFields: fields } }];`,
    },
  },
  output: [{ week: '2026-w45', count: 1, title: 'Acme gets it right', intro: '', cases: [], formFields: [] }],
});

const reviewEmail = node({
  type: 'n8n-nodes-base.emailSend',
  version: 2.1,
  config: {
    name: 'Email review form',
    credentials: { smtp: { id: '0Ejp2gUtzezDecQE', name: 'SMTP account' } },
    parameters: {
      resource: 'email',
      operation: 'sendAndWait',
      fromEmail: 'Apology News <news@apologify.com>',
      toEmail: 'soto.platero@gmail.com',
      subject: expr('Apology News {{ $json.week }}: review {{ $json.count }} candidates'),
      message: expr('{{ $json.count }} graded candidates for {{ $json.week }}. Proposed title: "{{ $json.title }}". Open the form, pick the slots (1 best, 1 worst, 4-5 brief), fix scores and verdicts, and submit to open the pull request.'),
      responseType: 'customForm',
      defineForm: 'json',
      jsonOutput: expr('{{ JSON.stringify($json.formFields) }}'),
      options: {
        messageButtonLabel: 'Review this issue',
        responseFormTitle: expr('Apology News {{ $json.week }}'),
        responseFormButtonLabel: 'Open pull request',
        limitWaitTime: { values: { limitType: 'afterTimeInterval', resumeAmount: 3, resumeUnit: 'days' } },
      },
    },
  },
  output: [{ data: { 'Issue title': 'Acme gets it right', Intro: '', '1. Slot': 'best', '1. Score (0-5)': '4.5', '1. Verdict': 'Names the failure, refunds everyone, no small print.', '1. Headline': 'Acme refunds 4,000 stranded passengers', '1. Summary': '...' } }],
});

const buildIssue = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build issue file',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const r = $input.first().json;
const resp = r.data || r;
const d = $('Build review form').first().json;
const items = [];
const warnings = [];
function toScore(v, fallback) {
  const n = parseFloat(String(v === undefined || v === null ? '' : v).replace(',', '.'));
  return isNaN(n) ? fallback : Math.round(Math.min(5, Math.max(0, n)) * 2) / 2;
}
d.cases.forEach(function (c, n) {
  const k = n + 1;
  const slot = resp[k + '. Slot'] || 'skip';
  if (slot === 'skip') return;
  const verdict = String(resp[k + '. Verdict'] || c.verdict).trim();
  if (verdict.split(' ').length > 15) warnings.push(c.who + ': verdict over 15 words');
  if (!c.statementUrl) warnings.push(c.who + ': no primary statement URL found');
  items.push({
    id: c.id, slot: slot, who: c.who, category: c.category, country: c.country || undefined,
    headline: String(resp[k + '. Headline'] || c.headline).trim(),
    summary: String(resp[k + '. Summary'] || c.summary).trim(),
    quote: c.quote || undefined,
    score: toScore(resp[k + '. Score (0-5)'], c.score),
    verdict: verdict,
    statementUrl: c.statementUrl || undefined,
    sourceUrl: c.sourceUrl, sourceName: c.sourceName,
    statementDate: c.statementDate || undefined
  });
});
if (!items.length) throw new Error('No cases selected in the review form, or the form timed out.');
const order = { best: 0, worst: 1, brief: 2 };
items.sort(function (a, b) { return order[a.slot] - order[b.slot]; });
function count(s) { return items.filter(function (i) { return i.slot === s; }).length; }
if (count('best') !== 1) warnings.push('expected exactly 1 best, got ' + count('best'));
if (count('worst') !== 1) warnings.push('expected exactly 1 worst, got ' + count('worst'));
if (items.length < 4 || items.length > 7) warnings.push('expected 4 to 7 cases, got ' + items.length);
const cats = {};
items.forEach(function (i) { cats[i.category] = (cats[i.category] || 0) + 1; });
Object.keys(cats).forEach(function (k) { if (cats[k] > 2) warnings.push('more than 2 cases in ' + k); });
const issueTitle = String(resp['Issue title'] || d.title).trim();
const slug = issueTitle.normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '');
const issue = {
  week: d.week,
  slug: slug,
  title: issueTitle,
  description: 'The public apologies of the week, scored.',
  date: $now.toISODate(),
  intro: String(resp['Intro'] || '').trim() || undefined,
  items: items
};
const path = 'src/data/news/' + d.week + '/issue.json';
const best = items.find(function (i) { return i.slot === 'best'; });
const worst = items.find(function (i) { return i.slot === 'worst'; });
const coverPrompt = [
  'Editorial cover photograph for a weekly newsletter that scores public apologies.',
  "This week's stories: " + [best, worst].filter(Boolean).map(function (i) { return i.headline; }).join('; ') + '.',
  'Show the stories through one or two symbolic objects only (a folded handwritten note, a fountain pen, a sealed envelope, a vintage microphone, a typed press statement, a single cut flower), never people.',
  'Style: luxury fashion-magazine still life photograph on pure white seamless paper, soft directional daylight with crisp long shadows, minimal composition with vast empty white space, the objects slightly off-centre, refined and glamorous, restrained natural colour, medium-format photography.',
  'Absolutely no text, letters, numbers, logos, brand marks or recognizable real people.'
].join(' ');
const branch = 'news/' + d.week + '-' + $execution.id;
const table = items.map(function (i) { return '| ' + i.slot + ' | ' + i.who + ' | ' + i.score + ' | ' + i.verdict.split('|').join('/') + ' |'; }).join('\\n');
const skipped = d.cases.filter(function (c) { return !items.some(function (i) { return i.id === c.id; }); })
  .map(function (c) { return '- ' + c.who + ' (' + c.score + '): ' + c.headline + ' ' + (c.sourceUrl || ''); }).join('\\n');
const body = '## ' + issue.title + '\\n\\n| Slot | Who | Score | Verdict |\\n|---|---|---|---|\\n' + table + '\\n\\n'
  + (warnings.length ? '### Warnings\\n' + warnings.map(function (w) { return '- ' + w; }).join('\\n') + '\\n\\n' : '')
  + '### Not included\\n' + (skipped || '- none') + '\\n\\n'
  + 'Edit ' + path + ' on this branch if needed, check the Vercel preview, then merge to publish. The email goes out on Tuesday (Apology News: Send).\\n\\n_Generated by n8n: Apology News: Draft_';
return [{ json: { week: d.week, slug: slug, branch: branch, path: path, coverPath: 'public/news/' + slug + '.webp', title: issue.title, issue: issue, items: items, prTitle: 'news: ' + d.week + ' - ' + issue.title, prBody: body, coverBody: { model: 'gpt-image-2.5-flare', prompt: coverPrompt, size: '1536x1024', quality: 'medium', output_format: 'webp', output_compression: 70, n: 1 } } }];`,
    },
  },
  output: [{ week: '2026-w45', slug: 'acme-gets-it-right', branch: 'news/2026-w45-123', path: 'src/data/news/2026-w45/issue.json', coverPath: 'public/news/acme-gets-it-right.webp', title: 'Acme gets it right', issue: { week: '2026-w45' }, items: [{ id: 'acme-airlines', who: 'Acme Airlines' }], prTitle: 'news: 2026-w45 - Acme gets it right', prBody: '...', coverBody: { model: 'gpt-image-2.5-flare' } }],
});

const listSources = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'List news pages',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const d = $('Build issue file').first().json;
function hostOf(u) { const m = String(u || '').match(/^https?:[/][/]([^/?#]+)/i); return m ? m[1].toLowerCase().replace(/^www[.]/, '') : ''; }
const out = [];
d.issue.items.forEach(function (i) {
  out.push({ json: { id: i.id, url: i.sourceUrl, credit: i.sourceName, rank: 0 } });
  if (i.statementUrl) out.push({ json: { id: i.id, url: i.statementUrl, credit: hostOf(i.statementUrl), rank: 1 } });
});
return out;`,
    },
  },
  output: [{ id: 'acme-airlines', url: 'https://www.reuters.com/x', credit: 'Reuters', rank: 0 }],
});

const fetchPage = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Fetch news page',
    onError: 'continueRegularOutput',
    parameters: {
      method: 'GET',
      url: expr('{{ $json.url }}'),
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: { parameters: [{ name: 'User-Agent', value: 'Mozilla/5.0 (compatible; ApologifyBot/1.0; +https://apologify.com/news)' }, { name: 'Accept', value: 'text/html' }] },
      options: { response: { response: { responseFormat: 'text', neverError: true } }, timeout: 15000 },
    },
  },
  output: [{ data: '<html><head><meta property="og:image" content="https://www.reuters.com/x.jpg"></head></html>' }],
});

const attachPhotos = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Attach news photos',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const d = $('Build issue file').first().json;
const pages = $('List news pages').all();
function absolute(src, pageUrl) {
  src = String(src).split('&amp;').join('&').trim();
  if (/^https:[/][/]/i.test(src)) return src;
  if (/^[/][/]/.test(src)) return 'https:' + src;
  const origin = (String(pageUrl).match(/^https?:[/][/][^/?#]+/i) || [])[0];
  if (origin && src.charAt(0) === '/') return origin.replace(/^http:/i, 'https:') + src;
  return '';
}
function ogImage(html, pageUrl) {
  const metas = String(html || '').match(/<meta[^>]+>/gi) || [];
  const keys = ['og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src'];
  for (let k = 0; k < keys.length; k++) {
    for (let m = 0; m < metas.length; m++) {
      const prop = (metas[m].match(/(?:property|name)[ ]*=[ ]*["']([^"']+)["']/i) || [])[1];
      const content = (metas[m].match(/content[ ]*=[ ]*["']([^"']+)["']/i) || [])[1];
      if (prop && prop.toLowerCase() === keys[k] && content) {
        const abs = absolute(content, pageUrl);
        if (abs) return abs;
      }
    }
  }
  return '';
}
const found = {};
$input.all().forEach(function (it, idx) {
  const page = pages[idx] && pages[idx].json;
  if (!page) return;
  const src = ogImage(it.json.data, page.url);
  if (!src) return;
  const prev = found[page.id];
  if (!prev || page.rank < prev.rank) found[page.id] = { src: src, credit: page.credit, rank: page.rank };
});
const issue = JSON.parse(JSON.stringify(d.issue));
issue.items.forEach(function (i) { if (found[i.id]) i.image = { src: found[i.id].src, credit: found[i.id].credit }; });
return [{ json: Object.assign({}, d, { issue: issue, photos: Object.keys(found).length }) }];`,
    },
  },
  output: [{ week: '2026-w45', slug: 'acme-gets-it-right', issue: { week: '2026-w45' }, photos: 1, coverBody: { model: 'gpt-image-2.5-flare' } }],
});

const generateCover = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Generate cover',
    onError: 'continueRegularOutput',
    retryOnFail: true,
    maxTries: 2,
    waitBetweenTries: 5000,
    credentials: OPENAI,
    parameters: {
      method: 'POST',
      url: 'https://api.openai.com/v1/images/generations',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'openAiApi',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.coverBody) }}'),
      options: { timeout: 240000 },
    },
  },
  output: [{ data: [{ b64_json: 'UklGRg==' }] }],
});

const finalizeIssue = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Finalize issue',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const d = $('Build issue file').first().json;
const r = $input.first().json;
const b64 = r && Array.isArray(r.data) && r.data[0] ? r.data[0].b64_json : '';
const issue = Object.assign({}, $('Attach news photos').first().json.issue);
const best = d.items.find(function (i) { return i.slot === 'best'; });
if (b64) issue.image = { src: '/news/' + d.slug + '.webp', alt: 'Cover photograph for Apology News: ' + (best ? best.headline : issue.title) };
const prBody = d.prBody + (b64 ? '\\n\\nCover: ' + d.coverPath : '\\n\\n**No cover**: image generation failed; run node scripts/news-cover.mjs ' + d.week + ' on this branch.');
const content = JSON.stringify(issue, null, 2) + '\\n';
return [{ json: { hasCover: !!b64, coverB64: b64, contentB64: Buffer.from(content, 'utf8').toString('base64'), prBody: prBody } }];`,
    },
  },
  output: [{ hasCover: true, coverB64: 'UklGRg==', contentB64: 'e30K', prBody: '...' }],
});

const GITHUB = { githubApi: { id: 'pbM8OihKiRpG7VjM', name: 'GitHub apologify' } };
const GITHUB_HEADERS = { parameters: [{ name: 'Accept', value: 'application/vnd.github+json' }, { name: 'X-GitHub-Api-Version', value: '2022-11-28' }] };

const getMainRef = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Get main commit',
    credentials: GITHUB,
    parameters: {
      method: 'GET',
      url: REPO_API + '/git/ref/heads/main',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'githubApi',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: GITHUB_HEADERS,
    },
  },
  output: [{ ref: 'refs/heads/main', object: { sha: 'abc123', type: 'commit' } }],
});

const createBranch = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Create branch',
    credentials: GITHUB,
    parameters: {
      method: 'POST',
      url: REPO_API + '/git/refs',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'githubApi',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: GITHUB_HEADERS,
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify({ ref: "refs/heads/" + $("Build issue file").first().json.branch, sha: $json.object.sha }) }}'),
    },
  },
  output: [{ ref: 'refs/heads/news/2026-w45-123', object: { sha: 'abc123' } }],
});

const putFile = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Commit issue file',
    credentials: GITHUB,
    parameters: {
      method: 'PUT',
      url: expr(REPO_API + '/contents/{{ $("Build issue file").first().json.path }}'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'githubApi',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: GITHUB_HEADERS,
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify({ message: "news: draft " + $("Build issue file").first().json.week, content: $("Finalize issue").first().json.contentB64, branch: $("Build issue file").first().json.branch }) }}'),
    },
  },
  output: [{ content: { path: 'src/data/news/2026-w45/issue.json' }, commit: { sha: 'def456' } }],
});

const hasCover = ifElse({
  version: 2.2,
  config: {
    name: 'Has cover?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
        conditions: [{ leftValue: expr('{{ $("Finalize issue").first().json.hasCover }}'), operator: { type: 'boolean', operation: 'true', singleValue: true }, rightValue: '' }],
        combinator: 'and',
      },
    },
  },
});

const putCover = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Commit cover',
    credentials: GITHUB,
    parameters: {
      method: 'PUT',
      url: expr(REPO_API + '/contents/{{ $("Build issue file").first().json.coverPath }}'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'githubApi',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: GITHUB_HEADERS,
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify({ message: "news: cover " + $("Build issue file").first().json.week, content: $("Finalize issue").first().json.coverB64, branch: $("Build issue file").first().json.branch }) }}'),
    },
  },
  output: [{ content: { path: 'public/news/acme-gets-it-right.webp' } }],
});

const openPr = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Open pull request',
    credentials: GITHUB,
    parameters: {
      method: 'POST',
      url: REPO_API + '/pulls',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'githubApi',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: GITHUB_HEADERS,
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify({ title: $("Build issue file").first().json.prTitle, head: $("Build issue file").first().json.branch, base: "main", body: $("Finalize issue").first().json.prBody }) }}'),
    },
  },
  output: [{ number: 42, html_url: 'https://github.com/sotoplatero/apologify/pull/42' }],
});

const notifyPr = node({
  type: 'n8n-nodes-base.emailSend',
  version: 2.1,
  config: {
    name: 'Email PR link',
    onError: 'continueRegularOutput',
    credentials: { smtp: { id: '0Ejp2gUtzezDecQE', name: 'SMTP account' } },
    parameters: {
      resource: 'email',
      operation: 'send',
      fromEmail: 'Apology News <news@apologify.com>',
      toEmail: 'soto.platero@gmail.com',
      subject: expr('Apology News {{ $("Build issue file").first().json.week }}: PR #{{ $json.number }} ready'),
      emailFormat: 'html',
      html: expr('<p>The issue <b>{{ $("Build issue file").first().json.title }}</b> is ready for review.</p><p><a href="{{ $json.html_url }}">{{ $json.html_url }}</a></p><p>Check the Vercel preview on the PR, then merge to publish. The email goes out on Tuesday.</p>'),
      options: { appendAttribution: false },
    },
  },
  output: [{ accepted: ['editor@example.com'] }],
});

const explodeCases = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'List published cases',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const d = $('Build issue file').first().json;
return d.items.map(function (i) { return { json: { cluster_key: i.id, who: i.who, week: d.week } }; });`,
    },
  },
  output: [{ cluster_key: 'acme-airlines', who: 'Acme Airlines', week: '2026-w45' }],
});

const saveSeen = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Remember published cases',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'id', value: '1wiueO8HTZCwyxuZ', cachedResultName: 'apology_news_seen' },
      columns: {
        mappingMode: 'defineBelow',
        value: { cluster_key: expr('{{ $json.cluster_key }}'), who: expr('{{ $json.who }}'), week: expr('{{ $json.week }}') },
        schema: [
          { id: 'cluster_key', displayName: 'cluster_key', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'who', displayName: 'who', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'week', displayName: 'week', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
        ],
      },
    },
  },
  output: [{ id: 1, cluster_key: 'acme-airlines', who: 'Acme Airlines', week: '2026-w45' }],
});

const setupNote = sticky('## Apology News: Draft\nPlan: docs/newsletter/PLAN.md in the apologify repo.\n\nEvery Monday: find, grade, email the editor a review form, then open a PR with src/data/news/<week>/issue.json (slug + AI cover in public/news/<slug>.webp). Merge = publish.\n\nModels: gpt-6-luna (classify), gpt-6.1-sol (grade, lineup), gpt-image-2.5-flare (cover). Timezone Europe/Madrid.', [], { color: 4 });

export default workflow('apology-news-draft', 'Apology News: Draft (discover, grade, review, PR)')
  .add(weeklyTrigger)
  .to(getSeen)
  .to(buildQueries)
  .to(readNews)
  .to(allHeadlines.input(0))
  .add(getSeen)
  .to(fetchGdelt)
  .to(allHeadlines.input(1))
  .add(allHeadlines)
  .to(normalize)
  .to(classify)
  .to(clusterCases)
  .to(research)
  .to(buildScorePrompts)
  .to(score)
  .to(collectScores)
  .to(lineup)
  .to(buildReview)
  .to(reviewEmail)
  .to(buildIssue)
  .to(listSources)
  .to(fetchPage)
  .to(attachPhotos)
  .to(generateCover)
  .to(finalizeIssue)
  .to(getMainRef)
  .to(createBranch)
  .to(hasCover.onTrue(putCover.to(putFile)).onFalse(putFile))
  .add(putFile)
  .to(openPr)
  .to(notifyPr)
  .add(openPr)
  .to(explodeCases)
  .to(saveSeen)
  .add(setupNote)
  .group('Discover', [getSeen, buildQueries, readNews, fetchGdelt, allHeadlines, normalize], { description: 'Google News RSS + GDELT for the last 7 days, deduplicated into batches of 40 headlines' })
  .group('Classify & cluster', [classify, clusterCases], { description: 'GPT labels apology / non-apology, groups by issuer, skips cases published in the last 3 weeks, keeps top 12' })
  .group('Research & grade', [research, buildScorePrompts, score, collectScores, lineup, buildReview], { description: 'Tavily finds the statement, GPT scores 0-5 with the rubric and proposes the lineup' })
  .group('Editor review', [reviewEmail, buildIssue], { description: 'Email with a pre-filled form; you choose slots and fix verdicts; builds issue.json' })
  .group('Images', [listSources, fetchPage, attachPhotos, generateCover, finalizeIssue], { description: 'News photo per case (og:image of the article) + AI cover; builds the final issue.json' })
  .group('Remember', [explodeCases, saveSeen], { description: 'Stores the published issuers so the next 3 weeks skip them' });
