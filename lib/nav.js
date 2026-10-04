// The header menu. Four everyday links stay visible; everything else lives in two dropdowns so the bar isn't crowded.
// Each entry is [route, label, hint]. `npm test` checks every page has exactly one entry here.
export const NAV_TOP = [
  ["/", "Today"],
  ["/path", "DSA path"],
  ["/patterns", "Patterns"],
  ["/practice", "More questions"],
];

export const NAV_MENUS = [
  {
    label: "Prepare",
    items: [
      ["/topics", "Topics", "Every topic explained simply"],
      ["/companies", "Companies", "Questions asked by each company"],
      ["/cp", "CP training", "AtCoder and Codeforces ladders"],
      ["/system-design", "System design", "Roadmap, HLD and LLD questions"],
      ["/cs", "CS subjects", "DBMS, OS, networks, OOPs, SQL"],
      ["/lab", "Lab", "Engineering reasoning challenges"],
    ],
  },
  {
    label: "You",
    items: [
      ["/profile", "Profile", "Your solves, ratings and evidence"],
      ["/history", "History", "Everything you solved or revised"],
      ["/settings", "Settings", "Language, goals, repo folder"],
    ],
  },
];

// "/lab" is active on "/lab" and "/lab/some-id", but "/path" is not active on "/pathway".
export const isActive = (path, href) => href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
