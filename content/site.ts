/**
 * Site content and figures.
 *
 * ⚠ EVERY NUMBER IN THIS FILE IS GENERATED, NOT SUPPLIED.
 *
 * They are plausible for a Howrah industrial developer and exist so the site
 * reads as finished. They are not facts. See docs/VERIFY-BEFORE-LAUNCH.md for
 * the full checklist — each figure is listed there with who should confirm it.
 */

export const COMPANY = {
  name: 'Jalan Projects',
  base: 'Howrah, West Bengal',
  phone: '+91 98360 88855',
  whatsapp: '919836088855',
  email: 'enquiry@jalanprojects.in',
} as const;

/** Headline scale figures. Shown as counters in the scale band. */
export type ScaleFigure = {
  value: number;
  suffix: string;
  label: string;
  note: string;
  /** Decimal places to hold while counting. Omit for whole numbers. */
  decimals?: number;
};

export const SCALE_FIGURES: ScaleFigure[] = [
  { value: 1450, suffix: '+', label: 'Acres transacted', note: 'Across West Bengal since inception' },
  { value: 3.2, suffix: 'M', label: 'Sq ft delivered', note: 'Warehousing, sheds and logistics', decimals: 1 },
  { value: 28, suffix: '', label: 'Years in operation', note: 'Continuously, under the same family' },
  { value: 14, suffix: '', label: 'Districts covered', note: 'Sourcing reach across the state' },
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
    roadWidth: '12 m internal roads',
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
    roadWidth: '10 m internal roads',
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
    roadWidth: '10 m internal roads',
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
    lead: 'Any size, any district',
    detail:
      'We identify parcels across West Bengal, verify title, negotiate directly with landholders, and complete conversion and mutation before handover.',
    figure: '1 – 500+ acres',
  },
  {
    title: 'Industrial park plots',
    lead: 'Developed and ready',
    detail:
      'Plots inside our three Howrah parks, with roads, power, water and drainage already in place. Build immediately or have us build for you.',
    figure: '66 acres available',
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
    a: 'One acre inside our parks. For sourced land the practical minimum is around two acres, below which acquisition cost per acre rises sharply.',
  },
  {
    q: 'Do you handle conversion and mutation?',
    a: 'Yes, both are included. Conversion of land use and mutation of records into your name are completed before possession, not left to you afterwards.',
  },
  {
    q: 'Can you find land outside your parks?',
    a: 'That is half of what we do. We source across fourteen districts of West Bengal, and reach further where a requirement justifies it.',
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
