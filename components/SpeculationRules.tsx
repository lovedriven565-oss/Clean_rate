const SPECULATION_RULES = JSON.stringify({
  prefetch: [
    {
      where: {
        and: [
          { href_matches: "/*" },
          { not: { href_matches: "/api/*" } },
          { not: { href_matches: "/admin*" } },
          { not: { selector_matches: "[rel~=nofollow]" } },
          { not: { selector_matches: "[target=_blank]" } },
        ],
      },
      eagerness: "moderate",
    },
  ],
  prerender: [
    {
      where: {
        and: [
          {
            or: [
              { href_matches: "/solutions/*" },
              { href_matches: "/companies/*" },
              { href_matches: "/brands/*" },
              { href_matches: "/rating*" },
            ],
          },
          { not: { selector_matches: "[rel~=nofollow]" } },
          { not: { selector_matches: "[target=_blank]" } },
        ],
      },
      eagerness: "moderate",
    },
  ],
});

export function SpeculationRules() {
  return (
    <script
      type="speculationrules"
      dangerouslySetInnerHTML={{ __html: SPECULATION_RULES }}
    />
  );
}
