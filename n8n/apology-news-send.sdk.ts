import { workflow, node, trigger, sticky, ifElse, newCredential, expr } from '@n8n/workflow-sdk';

const REPO_API = 'https://api.github.com/repos/sotoplatero/apologify';
const GITHUB = { githubApi: { id: 'pbM8OihKiRpG7VjM', name: 'GitHub apologify' } };
const SMTP = { smtp: { id: '0Ejp2gUtzezDecQE', name: 'SMTP account' } };

const tuesdayTrigger = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.4,
  config: {
    name: 'Every Tuesday 08:00 ET',
    parameters: {
      rule: { interval: [{ field: 'weeks', weeksInterval: 1, triggerAtDay: [2], triggerAtHour: 8, triggerAtMinute: 0 }] },
    },
  },
  output: [{ timestamp: '2026-11-03T08:00:00.000-05:00' }],
});

const config = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: {
    name: 'Config',
    parameters: {
      mode: 'manual',
      includeOtherFields: false,
      assignments: {
        assignments: [
          { id: 'cfg-week', name: 'week', value: expr("{{ $now.toFormat(\"kkkk-'w'WW\") }}"), type: 'string' },
          { id: 'cfg-site', name: 'site', value: 'https://apologify.com', type: 'string' },
          { id: 'cfg-from', name: 'from', value: 'Apology News <news@apologify.com>', type: 'string' },
          { id: 'cfg-segment', name: 'segmentId', value: 'PASTE_RESEND_SEGMENT_ID', type: 'string' },
        ],
      },
    },
  },
  output: [{ week: '2026-w45', site: 'https://apologify.com', from: 'Apology News <news@apologify.com>', segmentId: 'seg_123' }],
});

const checkSent = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Already sent?',
    alwaysOutputData: true,
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'id', value: 'TyfhEAKkXG2KFiiL', cachedResultName: 'apology_news_sent' },
      matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'week', condition: 'eq', keyValue: expr('{{ $json.week }}') }] },
      returnAll: false,
      limit: 1,
    },
  },
  output: [{}],
});

const notSentYet = ifElse({
  version: 2.2,
  config: {
    name: 'Not sent yet?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
        conditions: [{ leftValue: expr('{{ $json.broadcast_id }}'), operator: { type: 'string', operation: 'empty', singleValue: true }, rightValue: '' }],
        combinator: 'and',
      },
    },
  },
});

const getIssue = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Get issue file from main',
    credentials: GITHUB,
    parameters: {
      method: 'GET',
      url: expr(REPO_API + '/contents/src/data/news/{{ $("Config").first().json.week }}/issue.json?ref=main'),
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'githubApi',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: { parameters: [{ name: 'Accept', value: 'application/vnd.github.raw+json' }, { name: 'X-GitHub-Api-Version', value: '2022-11-28' }] },
      options: { response: { response: { fullResponse: true, neverError: true, responseFormat: 'text' } } },
    },
  },
  output: [{ statusCode: 200, body: '{"week":"2026-w45","title":"Acme gets it right","items":[]}' }],
});

const issueMerged = ifElse({
  version: 2.2,
  config: {
    name: 'Issue merged?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
        conditions: [{ leftValue: expr('{{ $json.statusCode }}'), operator: { type: 'number', operation: 'equals' }, rightValue: 200 }],
        combinator: 'and',
      },
    },
  },
});

const getStatus = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Get deploy status',
    credentials: GITHUB,
    parameters: {
      method: 'GET',
      url: REPO_API + '/commits/main/status',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'githubApi',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: { parameters: [{ name: 'Accept', value: 'application/vnd.github+json' }, { name: 'X-GitHub-Api-Version', value: '2022-11-28' }] },
    },
  },
  output: [{ state: 'success', sha: 'abc123' }],
});

const deployed = ifElse({
  version: 2.2,
  config: {
    name: 'Deployed?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
        conditions: [{ leftValue: expr('{{ $json.state }}'), operator: { type: 'string', operation: 'equals' }, rightValue: 'success' }],
        combinator: 'and',
      },
    },
  },
});

const buildEmail = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build email HTML',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const cfg = $('Config').first().json;
let issue = $('Get issue file from main').first().json.body;
if (typeof issue === 'string') issue = JSON.parse(issue);
const utm = '?utm_source=newsletter&utm_medium=email&utm_campaign=' + issue.week;
const pageUrl = cfg.site + '/news/' + (issue.slug || issue.week);
function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function color(n) { return n >= 4 ? '#2F6B3A' : n >= 3 ? '#5B7F2E' : n >= 2 ? '#8A6D12' : n >= 1 ? '#B5562B' : '#C1272D'; }
function fmt(n) { return Number.isInteger(n) ? String(n) : n.toFixed(1); }
const labels = { best: 'Apology of the week', worst: 'Non-apology of the week', brief: '' };
const blocks = issue.items.map(function (i) {
  const badge = '<span style="display:inline-block;min-width:22px;padding:2px 8px;border-radius:4px;background:' + color(i.score) + ';color:#fff;font:700 16px Georgia,serif;text-align:center">' + fmt(i.score) + '</span>';
  const label = labels[i.slot] ? '<div style="font:600 11px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#C1272D;margin-bottom:6px">' + labels[i.slot] + '</div>' : '';
  const quote = i.quote ? '<div style="border-left:3px solid #C1272D;padding-left:12px;margin:10px 0;font:italic 15px Georgia,serif;color:#3A332C">' + esc(i.quote) + '</div>' : '';
  const src = i.statementUrl || i.sourceUrl;
  return '<tr><td style="padding:22px 0;border-top:1px solid #E2DACB">' + label
    + '<div style="font:700 19px/1.3 Georgia,serif;color:#241F1A">' + badge + ' ' + esc(i.headline) + '</div>'
    + '<div style="font:italic 16px/1.4 Georgia,serif;color:#2C4A6E;margin:8px 0">' + esc(i.verdict) + '</div>'
    + '<div style="font:15px/1.6 Georgia,serif;color:#3A332C">' + esc(i.summary) + '</div>' + quote
    + '<div style="font:13px Arial,sans-serif;margin-top:10px"><a style="color:#C1272D" href="' + esc(pageUrl + utm + '#' + i.id) + '">Read the analysis</a> &middot; <a style="color:#2C4A6E" href="' + esc(src) + '">' + esc(i.sourceName || 'Source') + '</a></div>'
    + '</td></tr>';
}).join('');
const intro = issue.intro ? '<p style="font:16px/1.6 Georgia,serif;color:#3A332C;margin:0 0 8px">' + esc(issue.intro) + '</p>' : '';
const html = '<!doctype html><html><body style="margin:0;background:#F5F1E8"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1E8"><tr><td align="center" style="padding:28px 16px">'
  + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">'
  + '<tr><td style="font:600 12px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#C1272D;padding-bottom:6px">Apology News &middot; ' + esc(issue.week) + '</td></tr>'
  + '<tr><td style="font:700 28px/1.2 Georgia,serif;color:#241F1A;padding-bottom:12px"><a style="color:#241F1A;text-decoration:none" href="' + esc(pageUrl + utm) + '">' + esc(issue.title) + '</a></td></tr>'
  + (issue.image ? '<tr><td style="padding-bottom:18px"><a href="' + esc(pageUrl + utm) + '"><img src="' + esc(cfg.site + issue.image.src) + '" width="600" alt="" style="display:block;width:100%;height:auto;border-radius:10px"></a></td></tr>' : '')
  + '<tr><td>' + intro + '<p style="font:13px Arial,sans-serif;color:#6B6157;margin:0">The public apologies of the week, scored on what they admit, explain and repair. Score them yourself on the site.</p></td></tr>'
  + blocks
  + '<tr><td style="padding:24px 0;border-top:1px solid #E2DACB;font:16px/1.5 Georgia,serif;color:#241F1A">Owe someone an apology yourself? <a style="color:#C1272D" href="' + esc(cfg.site + '/generator' + utm) + '">Write it on Apologify</a>.</td></tr>'
  + '<tr><td style="font:12px Arial,sans-serif;color:#8A7F73;padding-top:8px">You get this because you subscribed at apologify.com. <a style="color:#8A7F73" href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a>.</td></tr>'
  + '</table></td></tr></table></body></html>';
return [{ json: { week: issue.week, subject: issue.title, html: html, from: cfg.from, segmentId: cfg.segmentId, name: 'Apology News ' + issue.week } }];`,
    },
  },
  output: [{ week: '2026-w45', subject: 'Acme gets it right', html: '<html>...</html>', from: 'Apology News <news@apologify.com>', segmentId: 'seg_123', name: 'Apology News 2026-w45' }],
});

const sendBroadcast = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Send Resend broadcast',
    credentials: { httpTemplatedCustomAuth: newCredential('Resend API') },
    parameters: {
      method: 'POST',
      url: 'https://api.resend.com/broadcasts',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpTemplatedCustomAuth',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify({ segment_id: $json.segmentId, from: $json.from, subject: $json.subject, html: $json.html, name: $json.name, send: true }) }}'),
    },
  },
  output: [{ object: 'broadcast', id: '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794' }],
});

const recordSent = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Record sent issue',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'id', value: 'TyfhEAKkXG2KFiiL', cachedResultName: 'apology_news_sent' },
      columns: {
        mappingMode: 'defineBelow',
        value: { week: expr('{{ $("Build email HTML").first().json.week }}'), broadcast_id: expr('{{ $json.id }}') },
        schema: [
          { id: 'week', displayName: 'week', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'broadcast_id', displayName: 'broadcast_id', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
        ],
      },
    },
  },
  output: [{ id: 1, week: '2026-w45', broadcast_id: '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794' }],
});

const notifySent = node({
  type: 'n8n-nodes-base.emailSend',
  version: 2.1,
  config: {
    name: 'Email: issue sent',
    onError: 'continueRegularOutput',
    credentials: SMTP,
    parameters: {
      resource: 'email',
      operation: 'send',
      fromEmail: 'Apology News <news@apologify.com>',
      toEmail: 'soto.platero@gmail.com',
      subject: expr('Apology News {{ $("Build email HTML").first().json.week }} sent'),
      emailFormat: 'text',
      text: expr('Broadcast {{ $("Send Resend broadcast").first().json.id }} is on its way: "{{ $("Build email HTML").first().json.subject }}".'),
      options: { appendAttribution: false },
    },
  },
  output: [{ accepted: ['editor@example.com'] }],
});

const notifyNotMerged = node({
  type: 'n8n-nodes-base.emailSend',
  version: 2.1,
  config: {
    name: 'Email: issue not merged',
    credentials: SMTP,
    parameters: {
      resource: 'email',
      operation: 'send',
      fromEmail: 'Apology News <news@apologify.com>',
      toEmail: 'soto.platero@gmail.com',
      subject: expr('Apology News {{ $("Config").first().json.week }} NOT sent: issue not on main'),
      emailFormat: 'text',
      text: expr('src/data/news/{{ $("Config").first().json.week }}/issue.json is not on main yet. Merge the PR, wait for the deploy, then run "Apology News: Send" manually.'),
      options: { appendAttribution: false },
    },
  },
  output: [{ accepted: ['editor@example.com'] }],
});

const notifyNotDeployed = node({
  type: 'n8n-nodes-base.emailSend',
  version: 2.1,
  config: {
    name: 'Email: deploy not ready',
    credentials: SMTP,
    parameters: {
      resource: 'email',
      operation: 'send',
      fromEmail: 'Apology News <news@apologify.com>',
      toEmail: 'soto.platero@gmail.com',
      subject: expr('Apology News {{ $("Config").first().json.week }} NOT sent: deploy is {{ $json.state }}'),
      emailFormat: 'text',
      text: expr('The latest commit on main has status "{{ $json.state }}". Check Vercel, then run "Apology News: Send" manually.'),
      options: { appendAttribution: false },
    },
  },
  output: [{ accepted: ['editor@example.com'] }],
});

const setupNote = sticky('## Apology News: Send\nSends the merged issue of the current ISO week as a Resend broadcast.\n\n**Before activating**\n1. Credential "GitHub apologify" on the 2 GitHub nodes (same as the Draft workflow).\n2. Credential "Resend API": templated auth, header Authorization: Bearer <RESEND_API_KEY>.\n3. In **Config**, replace PASTE_RESEND_SEGMENT_ID with the newsletter segment id.\n4. Sender and editor email on the 3 email nodes.\n5. Workflow timezone: America/New_York.\n\nIdempotent: a week already in apology_news_sent is never sent twice.', [], { color: 4 });

export default workflow('apology-news-send', 'Apology News: Send (Tuesday broadcast)')
  .add(tuesdayTrigger)
  .to(config)
  .to(checkSent)
  .to(notSentYet.onTrue(getIssue.to(issueMerged
    .onTrue(getStatus.to(deployed
      .onTrue(buildEmail.to(sendBroadcast).to(recordSent).to(notifySent))
      .onFalse(notifyNotDeployed)))
    .onFalse(notifyNotMerged))))
  .add(setupNote)
  .group('Checks', [config, checkSent, notSentYet], { description: 'Current ISO week; stop if this week was already sent' })
  .group('Send', [buildEmail, sendBroadcast, recordSent, notifySent], { description: 'Builds the email from issue.json, sends the Resend broadcast, records it' });
