import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeContent } from "../src/content.mjs";

test("normalizeContent derives heading and shapes captions", () => {
  const out = normalizeContent({
    title: "For breaking your trust",
    paragraphs: ["I'm sorry.", "I'll do better."],
    senderName: "Sam",
    captions: { default: "A heartfelt apology.", x: "x".repeat(400), linkedin: "Formal note", hashtags: ["#sorry", "#apology"] },
  }, "Mia");
  assert.equal(out.heading, "Dear Mia,");
  assert.ok(Array.isArray(out.paragraphs) && out.paragraphs.length === 2);
  assert.ok(out.captions.x.length <= 280);
  assert.deepEqual(out.captions.hashtags, ["#sorry", "#apology"]);
});

test("normalizeContent tolerates missing fields", () => {
  const out = normalizeContent({ title: "Sorry" }, "our customers");
  assert.equal(out.heading, "To our customers,");
  assert.deepEqual(out.paragraphs, []);
  assert.equal(typeof out.captions.default, "string");
});
