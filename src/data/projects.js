export const PROJECTS = [
  {
    slug: "northwind-systems",
    id: "01",
    client: "Northwind Systems",
    role: "Product design · Web engineering",
    year: "2026",
    title: "A trading interface built for calm.",
    tag: "Financial infra",
    lede:
      "A ground-up interface for a fixed-income desk that had outgrown its Bloomberg terminals. We shipped a system that felt calmer while showing more.",
    problem:
      "Traders were stitching together seven tools and losing an average of nineteen seconds per decision. The desk wanted density without chaos.",
    approach:
      "A single canvas — quotes, book, PnL, and comms in one field of view — with motion tuned so nothing moves unless it matters.",
    metrics: [
      { label: "Median decision time", value: "-42%" },
      { label: "P95 render latency", value: "8 ms" },
      { label: "Tools consolidated", value: "7 → 1" },
      { label: "NPS with the desk", value: "84" },
    ],
    stack: ["Next.js", "TanStack Table", "WebSockets", "D3", "GSAP"],
    scope: "12 weeks · 2 designers · 3 engineers",
  },
  {
    slug: "lumen-health",
    id: "02",
    client: "Lumen Health",
    role: "Brand · Marketing site",
    year: "2025",
    title: "A patient-first system, expressed in code.",
    tag: "Healthcare",
    lede:
      "A cleartype identity and marketing site for a health-tech Series B that needed to read as clinical without reading as cold.",
    problem:
      "Their old site tested well with clinicians and poorly with patients. The brand had two personalities and no reason for either.",
    approach:
      "One system — clinical typography, patient-first photography, editorial motion — and a marketing site that resolved both audiences in the same scroll.",
    metrics: [
      { label: "Trial signups", value: "+38%" },
      { label: "CAC (paid)", value: "-24%" },
      { label: "Page weight", value: "42 kb" },
      { label: "Lighthouse (perf)", value: "99" },
    ],
    stack: ["Next.js", "Motion", "Sanity", "Vercel"],
    scope: "10 weeks · 1 designer · 2 engineers",
  },
  {
    slug: "halo-studios",
    id: "03",
    client: "Halo Studios",
    role: "Motion · Product tour",
    year: "2025",
    title: "One scroll from problem to conviction.",
    tag: "Creative tooling",
    lede:
      "A scroll-driven product tour for a creative tools startup — a single page that walked the reader from problem to demo to purchase in ninety seconds.",
    problem:
      "The product had ten reasons to buy and the marketing team could only defend three at a time. Sales calls kept re-explaining the demo.",
    approach:
      "A pinned narrative — problem, feel, proof — orchestrated with GSAP timelines. Every beat justified by an actual reduction in a demo call.",
    metrics: [
      { label: "Demo → trial", value: "+61%" },
      { label: "Avg. session", value: "3:12" },
      { label: "Scroll completion", value: "72%" },
      { label: "Sales objections", value: "-3" },
    ],
    stack: ["Next.js", "GSAP", "Three.js", "Rive"],
    scope: "8 weeks · 1 designer · 1 engineer · 1 motion",
  },
];

export const getProject = (slug) => PROJECTS.find((p) => p.slug === slug);
