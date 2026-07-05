import { test } from "node:test";
import assert from "node:assert/strict";
import { apologyHeading, apologyParagraphsHtml, looksLikeName } from "../src/text.mjs";

test("looksLikeName distinguishes names from phrases", () => {
  assert.equal(looksLikeName("Mia"), true);
  assert.equal(looksLikeName("my girlfriend"), false);
});

test("apologyHeading greets names and phrases correctly", () => {
  assert.equal(apologyHeading("Mia"), "Dear Mia,");
  assert.equal(apologyHeading("my mom"), "To my mom,");
  assert.equal(apologyHeading(""), null);
});

test("apologyParagraphsHtml escapes html and renders emphasis", () => {
  const out = apologyParagraphsHtml("I am **so** sorry <script>\n\nPlease forgive me");
  assert.equal(out.length, 2);
  assert.equal(out[0], "I am <strong>so</strong> sorry &lt;script&gt;");
  assert.equal(out[1], "Please forgive me");
});
