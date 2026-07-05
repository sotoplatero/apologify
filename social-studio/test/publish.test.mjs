import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPostBody } from "../src/publish.mjs";

test("draft by default, no schedule", () => {
  const b = buildPostBody({ caption: "hi", mediaId: "m1", accountIds: [1, 2], captions: {}, publish: false });
  assert.equal(b.is_draft, true);
  assert.equal(b.scheduled_at, undefined);
  assert.deepEqual(b.social_accounts, [1, 2]);
  assert.deepEqual(b.media, ["m1"]);
});

test("publish sets is_draft false; schedule sets scheduled_at", () => {
  const b = buildPostBody({ caption: "hi", mediaId: "m1", accountIds: [1], captions: {}, publish: true, scheduleAt: "2026-07-06T14:00:00Z" });
  assert.equal(b.is_draft, false);
  assert.equal(b.scheduled_at, "2026-07-06T14:00:00Z");
});

test("per-platform caption overrides for x and linkedin", () => {
  const accounts = [{ id: 1, platform: "twitter" }, { id: 2, platform: "linkedin" }, { id: 3, platform: "instagram" }];
  const b = buildPostBody({ caption: "def", mediaId: "m", accountIds: [1, 2, 3],
    captions: { default: "def", x: "short tweet", linkedin: "polished" }, accounts });
  const cfgs = b.account_configurations.account_configurations;
  assert.deepEqual(cfgs.find((c) => c.account_id === 1).caption, "short tweet");
  assert.deepEqual(cfgs.find((c) => c.account_id === 2).caption, "polished");
  assert.equal(cfgs.find((c) => c.account_id === 3), undefined);
});
