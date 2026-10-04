// Run: npm test. The header menu must list every page exactly once, so nothing gets lost in a dropdown.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { NAV_TOP, NAV_MENUS, isActive } from "../lib/nav.js";

const entries = [...NAV_TOP, ...NAV_MENUS.flatMap(m => m.items)];
const routes = entries.map(e => e[0]);
// Pages that are part of the app but are not in the menu on purpose.
const NOT_IN_MENU = new Set(["login"]);

test("every menu entry points at a real page, once", () => {
  assert.equal(new Set(routes).size, routes.length, "a page is listed twice");
  for (const r of routes) {
    const file = r === "/" ? "../app/page.jsx" : `../app${r}/page.jsx`;
    assert.ok(fs.existsSync(new URL(file, import.meta.url)), `${r}: no page at ${file}`);
  }
});

test("every top-level page is in the menu", () => {
  const dir = new URL("../app/", import.meta.url);
  const pages = fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith("[") && !d.name.startsWith("_") && d.name !== "api" && fs.existsSync(new URL(`${d.name}/page.jsx`, dir)))
    .map(d => d.name).filter(n => !NOT_IN_MENU.has(n));
  assert.deepEqual(pages.filter(n => !routes.includes("/" + n)), [], "pages missing from the menu (add them to lib/nav.js)");
});

test("the bar stays short: at most 5 visible links, 2 dropdowns, every item has a hint", () => {
  assert.ok(NAV_TOP.length <= 5);
  assert.ok(NAV_MENUS.length <= 2);
  for (const m of NAV_MENUS) for (const [href, label, hint] of m.items) assert.ok(label && hint && hint.length < 45, `${href}: label and short hint`);
});

test("active link matching respects route boundaries", () => {
  assert.equal(isActive("/", "/"), true);
  assert.equal(isActive("/path", "/"), false);
  assert.equal(isActive("/lab/abc", "/lab"), true);
  assert.equal(isActive("/companies/google", "/companies"), true);
  assert.equal(isActive("/patterns", "/path"), false);
  assert.equal(isActive("/pathway", "/path"), false);
});
