export const BRAND = 'Adviciya';
export const BRAND_FULL = 'Adviciya Solutions';
export const BRAND_TAGLINE = 'Design Team';

export const CONTACT_EMAIL = 'info@adviciya.com';
export const CONTACT_HREF = `mailto:${CONTACT_EMAIL}`;

/** TODO: replace with the real project / all-work page URLs when they exist. */
export const ALL_WORK_HREF = '#projects';

export const NAV_LINKS = [
  { label: 'Work', href: '#projects' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
] as const;

export const HERO = {
  eyebrow: 'Adviciya Solutions · Creative studio',
  headline: 'Where bold ideas *catch light.*',
  sub: 'We shape brands, digital products and immersive web experiences with the precision of engineers and the nerve of designers.',
  primary: 'Explore Our Work',
  secondary: "Let's Talk",
} as const;

export const ABOUT = {
  eyebrow: 'About Adviciya',
  headline: 'Design for people who *refuse to blend in.*',
  text: 'Adviciya Solutions is a creative and digital studio where designers and engineers share one table. We build identities, interfaces and immersive web experiences with a single belief: every pixel should earn its place.',
} as const;

/**
 * Selected works. Each project is named after its generated image file.
 * TODO: confirm the image <-> project pairing; `alt` describes the picture itself.
 */
export const WORK = {
  eyebrow: 'Selected Works',
  headline: 'Selected *Works.*',
  sub: 'Identities, interfaces and immersive builds, crafted end to end.',
  items: [
    {
      title: 'Gravel Banks Villas',
      subtitle: 'Branding',
      year: '2025',
      categories: 'Branding',
      description: 'A visual identity built around light, warmth and quiet confidence.',
      tags: ['Brand strategy', 'Logo design', 'Visual system'],
      image: '/gravel-banks-villas.webp',
      alt: 'Modern villa glowing at dusk',
      gallery: [
        { image: '/gravel-banks-villas-detail-01.webp', alt: 'Limestone villa terrace beside a tropical pool' },
        { image: '/gravel-banks-villas-detail-02.webp', alt: 'Villa courtyard with a reflecting pool and garden' },
      ],
    },
    {
      title: 'Sienna Leily Salon',
      subtitle: 'Website Design',
      year: '2025',
      categories: 'Website Design / UI/UX',
      description: 'A responsive marketing site designed around one clear story.',
      tags: ['Website design', 'UI/UX', 'Responsive design'],
      image: '/sienna-leily-salon.webp',
      alt: 'Marble salon with arched, lit mirrors',
      gallery: [
        { image: '/sienna-leily-salon-detail-01.webp', alt: 'Salon styling chair and mirror beside haircare products' },
        { image: '/sienna-leily-salon-detail-02.webp', alt: 'Luxury salon wash area with stone basins and walnut details' },
      ],
    },
    {
      title: 'Starknox',
      subtitle: 'Campaigns',
      year: '2024',
      categories: 'Campaigns / Graphic Design',
      description: 'Campaign visuals with a single bold idea, adapted across every channel.',
      tags: ['Campaign concept', 'Social design', 'Advertising creatives'],
      image: '/starknox.webp',
      alt: 'Neon-lit arcade and gaming venue',
      gallery: [
        { image: '/starknox-detail-01.webp', alt: 'Hands playing an arcade game on a colourful cabinet' },
        { image: '/starknox-detail-02.webp', alt: 'Interactive game installation in a bright family entertainment venue' },
      ],
    },
    {
      title: 'Skillax',
      subtitle: 'UI/UX',
      year: '2025',
      categories: 'UI/UX',
      description: 'A dashboard and mobile companion designed for clarity at a glance.',
      tags: ['Product design', 'Interface design', 'Design system'],
      image: '/skillax.webp',
      alt: 'Team reviewing analytics on a large screen',
      gallery: [
        { image: '/skillax-detail-01.webp', alt: 'Analytics charts displayed on a laptop and tablet in a bright studio' },
        { image: '/skillax-detail-02.webp', alt: 'Analyst reviewing a wall display of business charts' },
      ],
    },
    {
      title: 'Bean Brew',
      subtitle: 'Motion & 3D',
      year: '2024',
      categories: 'Motion & 3D',
      description: 'Product visuals and motion explorations that give objects a pulse.',
      tags: ['3D visualisation', 'Motion graphics', 'Product visuals'],
      image: '/coffee-brand.webp',
      alt: 'Barista making pour-over coffee',
      gallery: [
        { image: '/coffee-brand-detail-01.webp', alt: 'Roasted coffee beans, a ceramic cup and brass scoop' },
        { image: '/coffee-brand-detail-02.webp', alt: 'Fresh pour-over coffee beside a cup and coffee plant' },
      ],
    },
    {
      title: 'Startmarine Solutions',
      subtitle: 'Branding',
      year: '2024',
      categories: 'Branding / Website Design',
      description: 'A rebrand and website that finally match the ambition of the business.',
      tags: ['Rebrand', 'Website design', 'Brand guidelines'],
      image: '/startmarine-solutions.webp',
      alt: 'Container ship at a night-time port',
      gallery: [
        { image: '/startmarine-solutions-detail-01.webp', alt: 'Cargo ship bridge overlooking a misty harbor' },
        { image: '/startmarine-solutions-detail-02.webp', alt: 'Container terminal equipment moving freight at sunrise' },
      ],
    },
  ],
  viewProject: 'View project',
  viewAll: 'View all work',
} as const;

export const slugify = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Every project with its URL slug (e.g. "gravel-banks-villas"). */
export const PROJECTS = WORK.items.map((p) => ({ ...p, slug: slugify(p.title) }));
export type Project = (typeof PROJECTS)[number];

export const projectPath = (slug: string): string => `/work/${slug}`;
export const findProject = (slug?: string): Project | undefined => PROJECTS.find((p) => p.slug === slug);

/** Copy for the project detail page. Everything else on that page comes from the project's own fields. */
export const PROJECT_PAGE = {
  back: 'All work',
  overview: 'Overview',
  scope: 'Scope of work',
  details: 'Project details',
  gallery: 'In detail',
  next: 'Next project',
  ctaHeadline: 'Have a project like *this?*',
  ctaText: 'Tell us about your brand and what you want to build. We will take it from first idea to final form.',
  ctaButton: 'Start a project',
  studio: 'Adviciya Solutions',
} as const;

/** Third section: endless 3D gallery. */
export const INFINITE = {
  eyebrow: 'The work, in motion',
  headline: 'Drift through *everything* we make.',
  hint: 'Scroll to fly through · click a picture to open the project',
} as const;

/**
 * Cards whose background colour is chosen by hand instead of read from the picture.
 * Value is "r,g,b". Keyed by project slug.
 */
export const MOOD_OVERRIDES: Record<string, string> = {
  'gravel-banks-villas': '28,196,104', // green
};

export const GALLERY = {
  eyebrow: 'In motion',
  headline: 'Drag through the *glow.*',
  hint: 'Drag, swipe or use the arrow keys',
  backdropWord: 'Gallery',
} as const;

export const MARQUEE_WORDS = ['Branding', 'UI/UX Design', 'Web Development', 'Digital Solutions'] as const;

export const PROCESS = {
  eyebrow: 'Process',
  headline: 'From first thought to *final form.*',
  steps: [
    {
      index: '01',
      title: 'Discover',
      text: 'Understand the brand, audience, goals, and challenges.',
      image: '/process-discover.webp',
      imageAlt: 'Creative team reviewing research and references together',
    },
    {
      index: '02',
      title: 'Explore',
      text: 'Explore ideas, visual directions, moodboards, and concepts.',
      image: '/process-explore.webp',
      imageAlt: 'Designer arranging visual references and material swatches',
    },
    {
      index: '03',
      title: 'Design',
      text: 'Transform concepts into refined and meaningful experiences.',
      image: '/process-design.webp',
      imageAlt: 'Digital product designer working on interface prototypes',
    },
    {
      index: '04',
      title: 'Deliver',
      text: 'Bring the work to life with attention to every detail.',
      image: '/process-deliver.webp',
      imageAlt: 'Creative team presenting finished digital work',
    },
  ],
} as const;

export const EXPERTISE = {
  eyebrow: 'Expertise',
  headline: 'Creative nerve. *Technical depth.*',
  groups: [
    {
      title: 'Creative',
      items: [
        'Brand identity & art direction',
        'UI/UX & interaction design',
        'Motion graphics & 3D',
        'Campaign & social creative',
        'Design systems',
      ],
    },
    {
      title: 'Technical',
      items: [
        'React & Next.js engineering',
        'WebGL & Three.js experiences',
        'Headless CMS & e-commerce',
        'Performance, SEO & accessibility',
        'Cloud deployment & automation',
      ],
    },
  ],
} as const;

/** Placeholder testimonials, exactly as supplied. Replace with real client quotes. */
export const CONTACT = {
  eyebrow: 'Contact',
  headline: "Have an idea? Let's make it *unforgettable.*",
  text: 'A brand to build, a product to rethink or an experience that needs a creative direction? Tell us about it.',
  cta: 'Start a project',
  secondary: 'View our work',
} as const;

export const FOOTER = {
  links: [
    { label: 'Work', href: '#projects' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],
  /** TODO: replace the '#' placeholders with the studio's real profile URLs. */
  socials: [
    { label: 'Behance', href: '#' },
    { label: 'Instagram', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'X', href: '#' },
  ],
  backToTop: 'Back to top',
} as const;
