/**
 * Site content and figures.
 *
 * Supplied by Jalan Projects (Sept 2026): year founded, the four headline
 * scale figures, the land sourcing range, plot availability and park road
 * widths. Everything else is still ⚠ GENERATED — plausible for a Howrah
 * industrial developer, but not fact. See docs/VERIFY-BEFORE-LAUNCH.md.
 */

export const COMPANY = {
  name: 'Jalan Projects',
  base: 'Howrah, West Bengal',
  founded: 1981,
  phone: '+91 98360 88855',
  whatsapp: '919836088855',
  email: 'enquiry@jalanprojects.in',
} as const;

/**
 * Leadership.
 *
 * The name and role are supplied and correct. Everything under `principles` is
 * written in the company's voice on purpose — no sentence on this site is
 * attributed to Mr Jalan personally, because a quotation put into a named
 * person's mouth by a website builder is not a placeholder that can be quietly
 * shipped. If a signed statement is wanted, get the words from him and add them
 * as `LEADERSHIP.ceo.statement`.
 */
export const LEADERSHIP = {
  ceo: {
    name: 'Brij Mohan Jalan',
    role: 'Chief Executive Officer',
    base: 'Howrah, West Bengal',
    /** Real words only. Leave null until they exist. */
    statement: null as string | null,
  },
  principles: [
    {
      title: 'Own the difficult stage',
      detail:
        'Conversion of land use and mutation of records are where most land deals stall. They sit inside our scope, before possession, not in a note handed to you afterwards.',
    },
    {
      title: 'Deal with the landholder directly',
      detail:
        'Terms are agreed with whoever holds the land. No intermediaries between us and the title, and no layered commissions arriving late in a transaction.',
    },
    {
      title: 'Build to the operation, not to a catalogue',
      detail:
        'Span, eave height, dock count and floor loading come from the racking, equipment and vehicles that will actually use the building.',
    },
    {
      title: 'One firm, start to finish',
      detail:
        'Sourcing, title, conversion, development and construction under one roof. A single point of responsibility from first brief to handover.',
    },
  ],
} as const;

/** Headline scale figures. Shown as counters in the scale band. */
export type ScaleFigure = {
  value: number;
  suffix: string;
  label: string;
  note: string;
  /** Decimal places to hold while counting. Omit for whole numbers. */
  decimals?: number;
  /** Shown as-is instead of a counter, for figures that are not numbers. */
  text?: string;
};

export const SCALE_FIGURES: ScaleFigure[] = [
  { value: 3000, suffix: '+', label: 'Acres transacted', note: 'Since 1981' },
  { value: 130, suffix: 'M', label: 'Sq ft delivered', note: 'Of land handed over to buyers' },
  { value: 45, suffix: '', label: 'Years in operation', note: 'Continuously, under the same family' },
  { value: 0, suffix: '', text: 'Howrah', label: 'District covered', note: 'Where our land and parks are' },
];

export type Park = {
  slug: string;
  name: string;
  place: string;
  totalAcres: number;
  availableAcres: number;
  power: string;
  roadWidth: string;
  highway: string;
  connectivity: { label: string; value: string }[];
  sectors: string[];
};

export const PARKS: Park[] = [
  {
    slug: 'sankrail',
    name: 'Sankrail Industrial Park',
    place: 'Dhulagori, Howrah',
    totalAcres: 110,
    availableAcres: 18,
    power: '5 MVA sanctioned',
    roadWidth: '10 m internal roads',
    highway: 'NH-16 · Kona Expressway',
    connectivity: [
      { label: 'Kolkata', value: '14 km' },
      { label: 'Haldia Port', value: '92 km' },
      { label: 'NSCBI Airport', value: '31 km' },
      { label: 'Rail siding', value: '6 km' },
    ],
    sectors: ['FMCG distribution', '3PL logistics', 'Light engineering'],
  },
  {
    slug: 'jalan-amta-road',
    name: 'Jalan Industrial Park',
    place: 'Amta Road, Howrah',
    totalAcres: 85,
    availableAcres: 22,
    power: '3 MVA sanctioned',
    roadWidth: '12 m internal roads',
    highway: 'Amta Road (SH-15)',
    connectivity: [
      { label: 'Kolkata', value: '22 km' },
      { label: 'Haldia Port', value: '104 km' },
      { label: 'NSCBI Airport', value: '39 km' },
      { label: 'Rail siding', value: '11 km' },
    ],
    sectors: ['Warehousing', 'Food processing', 'Packaging'],
  },
  {
    slug: 'amta',
    name: 'Amta Industrial Park',
    place: 'Amta Road, Howrah',
    totalAcres: 65,
    availableAcres: 26,
    power: '2.5 MVA sanctioned',
    roadWidth: '12 m internal roads',
    highway: 'Amta Road (SH-15)',
    connectivity: [
      { label: 'Kolkata', value: '31 km' },
      { label: 'Haldia Port', value: '112 km' },
      { label: 'NSCBI Airport', value: '48 km' },
      { label: 'Rail siding', value: '15 km' },
    ],
    sectors: ['Manufacturing', 'Cold chain', 'Distribution'],
  },
];

/** Ordered by weight of business. The order is the information; the ratio stays internal. */
export const CAPABILITIES = [
  {
    title: 'Land sourcing',
    lead: 'One acre to a hundred and more',
    detail:
      'We identify parcels across Howrah, verify title, negotiate directly with landholders, and complete conversion and mutation before handover.',
    figure: '1 – 100+ acres',
  },
  {
    title: 'Industrial park plots',
    lead: 'Developed and ready',
    detail:
      'Plots inside our three Howrah parks, with roads, power, water and drainage already in place. Build immediately or have us build for you.',
    figure: 'Plots in all 3 parks',
  },
  {
    title: 'Build-to-suit warehouses',
    lead: 'Built to your drawing',
    detail:
      'Clear-span steel structures sized around your racking, handling equipment and vehicle access. Delivered complete.',
    figure: '24 – 40 m span',
  },
  {
    title: 'Factory sheds',
    lead: 'Production-ready',
    detail:
      'Sheds designed around your process — crane gantries, utility routing, floor loading and ventilation to your specification.',
    figure: '5 – 10 T/sqm floor',
  },
  {
    title: 'Logistics warehousing',
    lead: 'Set by your fleet',
    detail:
      'Dock count, leveller capacity, apron depth and turning radius derived from the vehicles that will actually use them.',
    figure: '6 – 12 T levellers',
  },
  {
    title: 'Construction within our parks',
    lead: 'Ground up',
    detail:
      'Any building required on a park plot — office blocks, utility buildings, gatehouses — from foundation to handover.',
    figure: 'Full scope',
  },
] as const;

export const PROCESS = [
  { step: 'Requirement', duration: '1 week', detail: 'Area, location, power, access and timeline captured in a single brief.' },
  { step: 'Identification', duration: '2 – 4 weeks', detail: 'Parcels matched against the brief, in our parks or sourced across the state.' },
  { step: 'Title diligence', duration: '3 – 6 weeks', detail: 'Records, encumbrance certificate and boundary verified before any commitment.' },
  { step: 'Negotiation', duration: '2 – 4 weeks', detail: 'Terms agreed directly with the landholder. No intermediaries, no layered commissions.' },
  { step: 'Conversion & mutation', duration: '8 – 16 weeks', detail: 'Land use converted and records mutated into your name. The stage most buyers are warned about.' },
  { step: 'Possession', duration: '1 week', detail: 'Clear, developable land handed over with the complete document set.' },
] as const;

export const SECTORS = [
  'FMCG distribution',
  '3PL logistics',
  'E-commerce fulfilment',
  'Cold chain',
  'Food processing',
  'Light engineering',
  'Packaging',
  'Textiles',
  'Building materials',
  'Auto components',
] as const;

/** Answers to the questions buyers ask before they call. */
export const QUESTIONS = [
  {
    q: 'What is the smallest parcel you will work on?',
    a: 'One acre, whether inside our parks or sourced for you. At the other end we have put together parcels of a hundred acres and more.',
  },
  {
    q: 'Do you handle conversion and mutation?',
    a: 'Yes, both are included. Conversion of land use and mutation of records into your name are completed before possession, not left to you afterwards.',
  },
  {
    q: 'Can you find land outside your parks?',
    a: 'That is half of what we do. We source land across Howrah district, alongside plots in our own three parks.',
  },
  {
    q: 'How long from brief to possession?',
    a: 'For park plots, four to eight weeks. For sourced land, four to seven months, with conversion and mutation the longest stage.',
  },
  {
    q: 'Do you lease, or only sell?',
    a: 'Both. Park plots and built facilities are available on long lease or outright sale, depending on the parcel.',
  },
  {
    q: 'Can you build and then lease it to us?',
    a: 'Yes. Build-to-suit on a lease structure is common for logistics operators who would rather not hold the asset.',
  },
] as const;
