/**
 * PROJECT REGISTRY — single source of truth for everything the ops command center monitors.
 *
 * Every project Fundy Logic Inc. runs is listed here. Health checks, the daily brief, and
 * the command-center UI all read from this file. To start monitoring a new project, add it here.
 *
 * Fields:
 * - id:        stable slug used as a key
 * - name:      display name
 * - area:      which bucket it lives in (matches the folder groupings)
 * - url:       the LIVE url to health-check (https://...). null if not deployed / unknown (fill in).
 * - supabaseUrl: the project's Supabase URL if it has a Supabase backend (used to detect pauses). null if none.
 * - repo:      github repo (owner/name) if known
 * - priority:  'revenue' | 'client' | 'demo' | 'personal' | 'game' | 'parked' — drives how loudly the brief flags it
 * - notes:     anything worth surfacing
 *
 * URLs marked TODO need Corey to confirm the real deployed domain.
 */

export type ProjectArea =
  | 'personal'
  | 'client'
  | 'potential-client'
  | 'demo'
  | 'game'

export type ProjectPriority =
  | 'revenue' // makes money now — flag loudest
  | 'client' // paid client work
  | 'demo' // portfolio / demo sites
  | 'personal' // internal tools / personal
  | 'game'
  | 'parked' // no active work

export interface Project {
  id: string
  name: string
  area: ProjectArea
  url: string | null
  supabaseUrl?: string | null
  repo?: string | null
  priority: ProjectPriority
  notes?: string
}

export const PROJECTS: Project[] = [
  // ---- REVENUE / FLAGSHIP (personal) ----
  {
    id: 'duelly',
    name: 'Duelly',
    area: 'personal',
    url: 'https://duelly.ai',
    supabaseUrl: 'https://lywtagruvefurzftoxiz.supabase.co',
    repo: 'coreyfmiller/seoaeogeo',
    priority: 'revenue',
    notes: 'AI search visibility SaaS. Live, accepting payments. Custom domain has detached before; Supabase free-tier has auto-paused before.',
  },
  {
    id: 'marketmojo',
    name: 'MarketMojo',
    area: 'personal',
    url: 'https://marketmojo.ai',
    supabaseUrl: 'https://qpbhvbubudlohgkvlmiv.supabase.co',
    repo: 'coreyfmiller/prospecting',
    priority: 'revenue',
    notes: 'Local business prospecting SaaS. MVP, needs marketing. Supabase-backed. Note: FundyLaunch has a keepalive route pinging MarketMojo + Duelly Supabase to prevent auto-pause.',
  },
  {
    id: 'fundylaunch',
    name: 'FundyLaunch',
    area: 'personal',
    url: 'https://fundylaunch.com',
    repo: 'coreyfmiller/FundyLaunch',
    priority: 'revenue',
    notes: 'Web design + marketing agency site. Live on fundylaunch.com (NOT .ca - that does not resolve). Has Gemini chat widget + Resend contact form.',
  },
  {
    id: 'fundylogic',
    name: 'FundyLogic',
    area: 'personal',
    url: 'https://fundylogic.com',
    repo: 'coreyfmiller/FundyLogic2',
    priority: 'revenue',
    notes: 'AI agent studio site (FundyLogic2 folder). Vapi voice+chat widget. Chat bot + Vapi voice bot.',
  },
  {
    id: 'quadropus',
    name: 'Quadropus',
    area: 'personal',
    url: 'https://quadropus.ai',
    repo: 'coreyfmiller/quadropus',
    priority: 'personal',
    notes: 'This ops command center. Client dashboard (future).',
  },

  // ---- PERSONAL TOOLS / OTHER ----
  {
    id: 'household-budget',
    name: 'Household Budget',
    area: 'personal',
    url: null, // TODO confirm deployed url
    repo: 'coreyfmiller/household-budget',
    priority: 'personal',
    notes: 'Family finance dashboard.',
  },
  {
    id: 'resp-max',
    name: 'RESP Max',
    area: 'personal',
    url: null, // TODO confirm deployed url
    repo: 'coreyfmiller/resp-max',
    priority: 'personal',
    notes: 'RESP growth calculator (public).',
  },
  {
    id: 'kvlaunch',
    name: 'KVLaunch',
    area: 'personal',
    url: 'https://kvlaunch.ca',
    priority: 'personal',
    notes: 'Free sites for young entrepreneurs/nonprofits in KV.',
  },
  {
    id: 'hiking-ridgeline',
    name: 'HIKING / Ridgeline (HikeMind)',
    area: 'personal',
    url: null, // TODO confirm deployed url
    priority: 'personal',
    notes: 'Hiking gear / pack tool. Has Supabase backend (kkncobvfavgyibisdevc). Uses Gemini.',
    supabaseUrl: 'https://kkncobvfavgyibisdevc.supabase.co',
  },
  {
    id: 'fundyadvantage',
    name: 'FundyAdvantage',
    area: 'personal',
    url: null, // TODO confirm
    priority: 'parked',
  },
  {
    id: 'mindfulmama',
    name: 'MindfulMama',
    area: 'personal',
    url: null,
    priority: 'parked',
    notes: 'Uses Gemini. Parked.',
  },
  {
    id: 'ideagen',
    name: 'IdeaGen',
    area: 'personal',
    url: null,
    priority: 'parked',
  },
  {
    id: 'refreshfactory',
    name: 'RefreshFactory',
    area: 'personal',
    url: null,
    priority: 'parked',
    notes: 'Two copies exist (Refresh Factory / RefreshFactory). Uses Gemini.',
  },
  {
    id: 'ron-rv',
    name: 'ron-rv',
    area: 'personal',
    url: null,
    priority: 'personal',
    notes: 'RV comparison site.',
  },

  // ---- GAMES ----
  {
    id: 'northshore',
    name: 'NorthShore',
    area: 'game',
    url: null, // Godot desktop game, may not have a web url
    priority: 'game',
    notes: 'Godot 4.7 survival game (rural NB). Desktop, likely no web deploy.',
  },
  {
    id: 'northshore3d',
    name: 'NorthShore3D',
    area: 'game',
    url: null, // TODO confirm if deployed
    priority: 'game',
    notes: 'React Three Fiber web survival game.',
  },

  // ---- CLIENTS ----
  {
    id: 'rpmiller',
    name: 'RP Miller Consulting',
    area: 'client',
    url: null, // TODO confirm deployed url
    priority: 'client',
    notes: 'Has Gemini chat. Client.',
  },
  {
    id: 'donovan',
    name: 'Donovan Home Solutions',
    area: 'client',
    url: null, // TODO confirm
    priority: 'client',
  },
  {
    id: 'kvadventure',
    name: 'KV Adventure Club',
    area: 'client',
    url: 'https://kvadventureclub.com',
    priority: 'client',
  },
  {
    id: 'sunrise',
    name: 'Sunrise Seedlings',
    area: 'client',
    url: 'https://www.sunriseseedlings.com',
    priority: 'client',
    notes: 'Kid-run plant nursery e-commerce.',
  },
  {
    id: 'port-city-kindness',
    name: 'Port City Kindness',
    area: 'client',
    url: null, // TODO confirm
    priority: 'client',
  },
  {
    id: 'fundyhockey',
    name: 'Fundy Female Hockey Association',
    area: 'client',
    url: 'https://fundykraken.ca',
    priority: 'client',
    notes: 'Community project. Active folder: CLIENTS/FundyHockey.',
  },

  // ---- POTENTIAL CLIENTS ----
  {
    id: 'cleancutcrew',
    name: 'Clean Cut Crew',
    area: 'potential-client',
    url: 'https://www.cleancutcrew.ca',
    priority: 'demo',
  },
  {
    id: 'coldspot',
    name: 'ColdSpot',
    area: 'potential-client',
    url: null, // TODO confirm
    priority: 'demo',
  },
  {
    id: 'pizzatwice',
    name: 'Pizza Twice',
    area: 'potential-client',
    url: null, // TODO confirm
    priority: 'demo',
    notes: 'Has Gemini chat.',
  },

  // ---- DEMO SITES (portfolio, deployed to Vercel) ----
  {
    id: 'demo-atlantic-plumbing',
    name: 'Atlantic Plumbing & Heating',
    area: 'demo',
    url: 'https://atlantic-plumbing.vercel.app',
    priority: 'demo',
  },
  {
    id: 'demo-summit-roofing',
    name: 'Summit Roofing NB',
    area: 'demo',
    url: 'https://summit-roofing-pied-nu.vercel.app',
    priority: 'demo',
  },
  {
    id: 'demo-spark-electric',
    name: 'Spark Electric',
    area: 'demo',
    url: 'https://spark-electric-two.vercel.app',
    priority: 'demo',
  },
  {
    id: 'demo-greenstone',
    name: 'Greenstone Landscaping',
    area: 'demo',
    url: 'https://greenstone-ruby.vercel.app',
    priority: 'demo',
  },
  {
    id: 'demo-pristine',
    name: 'Pristine Auto Detailing',
    area: 'demo',
    url: 'https://pristine-sooty-gamma.vercel.app',
    priority: 'demo',
  },
  {
    id: 'demo-crystal-clear',
    name: 'Crystal Clear Cleaning Co.',
    area: 'demo',
    url: 'https://crystal-clear-pink.vercel.app',
    priority: 'demo',
  },
  {
    id: 'demo-riverstone',
    name: 'Riverstone Renovations',
    area: 'demo',
    url: 'https://riverstone-five.vercel.app',
    priority: 'demo',
  },
  {
    id: 'demo-harbour',
    name: 'Harbour Realty',
    area: 'demo',
    url: 'https://harbour-phi.vercel.app',
    priority: 'demo',
  },
  {
    id: 'demo-maritime-pest',
    name: 'Maritime Pest Management',
    area: 'demo',
    url: 'https://maritime-pest.vercel.app',
    priority: 'demo',
  },
  {
    id: 'demo-fundy-climate',
    name: 'Fundy Climate Solutions',
    area: 'demo',
    url: null, // TODO confirm deployed url
    priority: 'demo',
  },
]

/** Projects that have a live URL we can actually health-check. */
export const MONITORABLE = PROJECTS.filter((p) => !!p.url)

/** Projects with a Supabase backend to watch for pauses. */
export const SUPABASE_BACKED = PROJECTS.filter((p) => !!p.supabaseUrl)

export const AREA_LABELS: Record<ProjectArea, string> = {
  personal: 'Personal Projects',
  client: 'Clients',
  'potential-client': 'Potential Clients',
  demo: 'Demo Sites',
  game: 'Games',
}
