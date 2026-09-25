// Reads an AI review you pasted (Markdown from a chat's copy button, or plain text copied from the
// page) into blocks for display. The pasted text itself is always stored unchanged; this only
// decides how it looks, so an unusual format can never lose anything.
//
// Blocks: { type: "h", level, text } | { type: "p", text } | { type: "code", lang, text }
//       | { type: "list", ordered, items: [{ text, depth }] } | { type: "table", rows: [[cell]] }
//       | { type: "quote", text } | { type: "hr" }

const FENCE = /^\s*(`{3,}|~{3,})\s*([^`\s]*)[^`]*$/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;
const ITEM = /^(\s*)([-*+•]|\d{1,3}[.)])\s+(.*)$/;
const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_RULE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const HR = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;

const cells = line => line.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());

export function parseReview(raw) {
  const lines = String(raw ?? "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let para = [];
  const flush = () => { if (para.length) { blocks.push({ type: "p", text: para.join("\n") }); para = []; } };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = FENCE.exec(line);
    if (fence) {
      flush();
      const mark = fence[1];
      const close = new RegExp(`^\\s*\\${mark[0]}{${mark.length},}\\s*$`);
      const body = [];
      for (i++; i < lines.length && !close.test(lines[i]); i++) body.push(lines[i]);
      blocks.push({ type: "code", lang: fence[2] || "", text: body.join("\n") }); // an unclosed fence runs to the end
      continue;
    }
    if (!line.trim()) { flush(); continue; }
    const h = HEADING.exec(line);
    if (h) { flush(); blocks.push({ type: "h", level: h[1].length, text: h[2] }); continue; }
    if (HR.test(line)) { flush(); blocks.push({ type: "hr" }); continue; }
    if (TABLE_ROW.test(line) && i + 1 < lines.length && TABLE_RULE.test(lines[i + 1])) {
      flush();
      const rows = [cells(line)];
      for (i += 2; i < lines.length && TABLE_ROW.test(lines[i]); i++) rows.push(cells(lines[i]));
      i--;
      blocks.push({ type: "table", rows });
      continue;
    }
    const item = ITEM.exec(line);
    if (item) {
      flush();
      const ordered = /\d/.test(item[2]);
      const list = { type: "list", ordered, items: [] };
      for (; i < lines.length; i++) {
        const m = ITEM.exec(lines[i]);
        if (m) { list.items.push({ text: m[3], depth: Math.min(3, Math.floor(m[1].replace(/\t/g, "  ").length / 2)) }); continue; }
        // An indented line right under an item continues that item.
        if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && !FENCE.test(lines[i])) { list.items[list.items.length - 1].text += `\n${lines[i].trim()}`; continue; }
        break;
      }
      i--;
      blocks.push(list);
      continue;
    }
    if (/^\s*>/.test(line)) {
      flush();
      const q = [];
      for (; i < lines.length && /^\s*>/.test(lines[i]); i++) q.push(lines[i].replace(/^\s*>\s?/, ""));
      i--;
      blocks.push({ type: "quote", text: q.join("\n") });
      continue;
    }
    para.push(line);
  }
  flush();
  return blocks;
}

// The last code block in a review: with PrepBoard's review prompt, that's the best solution.
export function lastCodeBlock(raw) {
  const code = parseReview(raw).filter(b => b.type === "code" && b.text.trim());
  return code.length ? code[code.length - 1] : null;
}

// Inline formatting inside a block: `code` and **bold**. Returns plain pieces for React to escape.
export function inlineParts(text) {
  const out = [];
  const re = /(`[^`\n]+`|\*\*[^*\n]+\*\*)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ t: "text", v: text.slice(last, m.index) });
    out.push(m[0][0] === "`" ? { t: "code", v: m[0].slice(1, -1) } : { t: "b", v: m[0].slice(2, -2) });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}
