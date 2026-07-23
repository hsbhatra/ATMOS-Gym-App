# UI/UX Brief
## ATMOS Gym Web Application

---

## 1. Design Philosophy

ATMOS Gym's visual identity is built on three principles:

**Premium Dark Aesthetic**
The app uses a near-black background (#0a0a0a) with gold accents (#e8c44a). This combination signals luxury, seriousness, and strength — the same feeling you get walking into a high-end gym.

**Depth Through 3D**
Every page features a Three.js particle animation — floating gold dots connected by lines, with a rotating wireframe torus ring. The camera follows the mouse cursor, giving a sense of infinite depth. This makes the app feel alive rather than static.

**Motion With Purpose**
Framer Motion animations are not decorative — they guide the user's eye. Cards stagger in on scroll so the user reads them in sequence. Page transitions use a consistent direction (fade + slide). Hover states lift cards slightly to signal interactivity.

---

## 2. Color System

```
Primary Background:    #0a0a0a  (near black — main page background)
Secondary Background:  #111111  (slightly lighter — cards, modals)
Tertiary Background:   #1a1a1a  (input fields, secondary cards)
Quaternary Background: #222222  (hover states, subtle dividers)

Gold Primary:          #e8c44a  (CTAs, active states, accents)
Gold Dark:             #c9a832  (gold hover states)
Gold Light:            #f0d060  (gold focus states)

Text Primary:          #ffffff  (headings, important text)
Text Secondary:        rgba(255,255,255,0.55) (body text)
Text Muted:            rgba(255,255,255,0.35) (captions, placeholders)
Text Disabled:         rgba(255,255,255,0.2)  (disabled inputs)

Success:               #22c55e  (password checks, verified states)
Error:                 #ef4444  (error messages, danger buttons)
Warning:               #f97316  (medium password strength)
```

---

## 3. Typography

**Primary Font:** Inter, Segoe UI, system-ui (system stack — no Google Fonts dependency)

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| Hero Title | clamp(36px, 8vw, 104px) | 900 | Landing page main heading |
| Section Title | clamp(24px, 4vw, 46px) | 800 | Section headings |
| Card Title | 17–20px | 700 | Card and modal titles |
| Body | 14–15px | 400 | General text |
| Label | 12–13px | 500–600 | Form labels, badges |
| Caption | 11–12px | 400–500 | Helper text, metadata |

**Letter Spacing:**
- Hero titles: -2px to -3px (tight, impactful)
- Section labels: +2px to +3px (uppercase, spaced out)
- Body: default

---

## 4. Component Patterns

### Cards
All cards use the `.auth-card` or inline equivalent pattern:
```
background: rgba(255,255,255,0.02)
border: 1px solid rgba(255,255,255,0.06)
border-radius: 16–24px
backdrop-filter: blur(20–40px)
```
On hover: `y: -6px`, `border-color: rgba(232,196,74,0.25)`

### Buttons

**Primary (Gold)** — `.btn-gold`
```
background: #e8c44a
color: #0a0a0a
border-radius: 10px
font-weight: 600
padding: 12–15px 24–36px
hover: background #f0d060, box-shadow gold glow
```

**Ghost** — `.btn-ghost`
```
background: transparent
border: 1px solid rgba(255,255,255,0.1)
color: rgba(255,255,255,0.7)
hover: border-color #e8c44a, color #e8c44a
```

**Danger** — used in ConfirmDialog
```
background: #ef4444
color: white
hover: background #dc2626
```

### Inputs — `.input-dark`
```
background: rgba(255,255,255,0.04)
border: 1px solid rgba(255,255,255,0.08)
border-radius: 10px
padding: 12px 16px
color: white
focus: border-color #e8c44a, background rgba(232,196,74,0.04)
placeholder: rgba(255,255,255,0.25)
```

### Badges / Tags
```
Pill style: border-radius 100px
Gold: bg rgba(232,196,74,0.1), border rgba(232,196,74,0.2), text #e8c44a
Green: bg rgba(34,197,94,0.1), border rgba(34,197,94,0.2), text #22c55e
```

---

## 5. Layout System

### Navbar
- Fixed position, height 64px
- Transparent when at top of landing page → solid on scroll
- Logo left, nav links center (desktop), CTA buttons right
- Hamburger menu on mobile (<768px)
- backdrop-filter: blur(24px) always active

### Auth Pages
- Full viewport height, centered card
- Card max-width: 420px (register: 480px)
- Padding: 40px 36px desktop, 28px 20px mobile
- ParticleBackground fixed behind
- Radial gold glow behind card

### Landing Page Sections
- Each section: `padding: 60–120px 16–48px` (responsive)
- Max content width: 1100–1200px centered
- Section label → title → subtitle → content pattern

### Profile Page
- Fixed top navbar (60px)
- Sidebar (240px) left, sticky
- Main content right, max-width 900px
- Mobile: sidebar becomes horizontal tab bar at top

---

## 6. Animation System

### Timing Philosophy
All animations use the same easing curve: `[0.25, 0.46, 0.45, 0.94]`
This is a custom ease-out that starts fast and decelerates — feels natural, not bouncy.

### Animation Durations
| Type | Duration |
|------|----------|
| Fast (hover, color change) | 150–200ms |
| Standard (element entrance) | 350–500ms |
| Slow (hero, page reveal) | 500–600ms |
| Page transition | 250ms |

### Stagger Timing
- Card grids: 80ms between children
- Slower grids (trainers, pricing): 120ms between children
- Hero elements: 120ms between children

### Scroll Animations
- Trigger: `viewport: { once: true, margin: "-80px" }`
- "once: true" — elements don't re-animate on scroll up
- margin: -80px — animation triggers slightly before element is fully visible

---

## 7. Responsive Breakpoints

| Name | Width | Target Devices |
|------|-------|----------------|
| xs | 0–479px | Small phones |
| sm | 480–767px | Large phones |
| md | 768–1023px | Tablets, small laptops |
| lg | 1024–1279px | Standard laptops |
| xl | 1280px+ | Desktops, large monitors, TVs |

### Key Responsive Behaviors
- Hero text: `clamp()` functions for fluid sizing
- Card grids: 1 col → 2 col → 3 col as screen grows
- Navbar: hamburger on <768px
- Profile sidebar: horizontal tabs on mobile, fixed sidebar on desktop
- Auth cards: full width on mobile with reduced padding
- Pricing "featured" card: no scale transform on mobile