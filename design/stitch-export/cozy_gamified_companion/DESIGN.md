---
name: Cozy Gamified Companion
colors:
  surface: '#faf8ff'
  surface-dim: '#d6d9ef'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f2ff'
  surface-container: '#ebedff'
  surface-container-high: '#e4e7fe'
  surface-container-highest: '#dee1f8'
  on-surface: '#171b2b'
  on-surface-variant: '#57423e'
  inverse-surface: '#2c3041'
  inverse-on-surface: '#eff0ff'
  outline: '#8b716d'
  outline-variant: '#dec0ba'
  surface-tint: '#a53b29'
  primary: '#a53b29'
  on-primary: '#ffffff'
  primary-container: '#ff7e67'
  on-primary-container: '#731709'
  inverse-primary: '#ffb4a6'
  secondary: '#006d41'
  on-secondary: '#ffffff'
  secondary-container: '#95f7bb'
  on-secondary-container: '#007346'
  tertiary: '#785a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c89f39'
  on-tertiary-container: '#4b3700'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a6'
  on-primary-fixed: '#3f0300'
  on-primary-fixed-variant: '#842415'
  secondary-fixed: '#95f7bb'
  secondary-fixed-dim: '#7adaa1'
  on-secondary-fixed: '#002110'
  on-secondary-fixed-variant: '#005230'
  tertiary-fixed: '#ffdf9b'
  tertiary-fixed-dim: '#edc157'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5b4300'
  background: '#faf8ff'
  on-background: '#171b2b'
  surface-variant: '#dee1f8'
typography:
  headline-xl:
    fontFamily: Quicksand
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Quicksand
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Quicksand
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-sm:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-lg:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: Quicksand
    fontSize: 10px
    fontWeight: '800'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  spacing-2xs: 0.25rem
  spacing-xs: 0.5rem
  spacing-sm: 0.75rem
  spacing-md: 1rem
  spacing-lg: 1.25rem
  spacing-xl: 1.5rem
  spacing-2xl: 2rem
  spacing-3xl: 2.5rem
  screen-gutter: 1.25rem
  card-gap: 0.875rem
---

## Brand & Style

This design system delivers an endearing, warm, and hyper-tactile interface engineered for shared living environments like families, co-living spaces, and roommates. The emotional foundation is grounded in delight, low-friction motivation, and gentle camaraderie. Household maintenance and chore delegation are reimagined from a site of passive-aggressive friction into an affectionate, shared micro-game.

The visual direction combines **Tactile / Skeuomorphic Micro-Affordances** with **Cute Chibi Pop-Illustration Dynamics**. Key characteristics include:
- Soft clay-like buttons featuring chunky physical drop surfaces (dual-layer "squish" depth).
- Bouncy, elastic physics on active states (gentle scale compression on tap: `scale(0.96)`).
- Generous, organic corner geometry with pill-form containers and cards.
- A luminous pastel palette grounded by deep cocoa-charcoal typography to sustain visual clarity and accessibility without looking clinical or corporate.

## Colors

The palette uses a warm confectionery schema that replaces standard sterile utility tones with appetizing, approachable hues.

### Palette Architecture
- **Primary (`#FF7E67`, Peach Coral):** Drives key actions, primary state triggers, active navigational tab highlights, and urgent task milestones.
- **Secondary (`#6FCF97`, Fresh Mint):** Validates task completion, positive streak retention, resource collection, and cooperative balance checks.
- **Tertiary Accent (`#FFD166`, Sunshine Yellow):** Reserved for rewards, XP bursts, star bonuses, active trophy states, and celebratory micro-pills.
- **Support Accents:** 
  - **Pastel Lavender (`#BDB2FF`):** Roommate assignment indicators and personal vanity badges.
  - **Soft Sky Blue (`#A0C4FF`):** Passive routine tasks and cyclical chore tracking (e.g., water plants, restock pantry).
- **Backgrounds:** Canvas surfaces operate on `#FFFDF9` (Whipped Cream) fading down to `#FDF8F5` (Soft Powder Blush). Pure pure cold whites (`#FFFFFF`) are strictly designated for floating interactive cards and nested container tiles.
- **Typography / Neutrals:** Absolute black is prohibited. `#2D3142` (Deep Cocoa Slate) serves as the primary text color, with `#4F5D73` (Muted Pebble) for secondary labels and metadata. Soft structural borders utilize `#F0EAE1` or low-opacity tints of the dominant module accent.

## Typography

The type system blends the organic roundness of **Quicksand** for prominent titles, numerals, and badges with the functional clarity of **Nunito Sans** for longer descriptive chore notes, sub-labels, and activity history.

### Application Standards
- **Headlines (`headline-xl`, `headline-lg`, `headline-md`):** Must use rounded geometric tracking with tight, punchy vertical line metrics to maintain a tight visual envelope around playful chore nicknames and point counters.
- **Body (`body-lg`, `body-md`, `body-sm`):** Set at medium to semi-bold weights (`500`-`600`) to guarantee legibility against pastel card backgrounds, avoiding hairline weights entirely.
- **Labels & Micro-Tags (`label-lg`, `label-md`, `label-sm`):** Rendered in high-weight uppercase or capitalized title form to frame gamified counters (e.g., "+50 XP", "STREAK 7D", "YOUR TURN").

## Layout & Spacing

The spatial architecture is calibrated for a single-hand, thumb-driven mobile device footprint (optimized for a 375pt viewport baseline).

### Layout System
- **Grid Structure:** Fluid single-column stack with dynamic multi-column module splits (2-column chore grids, 3-column leaderboard podiums).
- **Horizontal Screen Padding:** Fixed at `1.25rem` (20px), ensuring components do not hit screen boundaries during bouncy haptic transitions.
- **Card Spacing:** Standardized to `0.875rem` (14px) vertical guttering between independent interactive tasks to maintain clean card distinction.
- **Vertical Stack Rhythm:** Modular `0.5rem` (8px) grid cadence. Vertical padding within cards ranges from `1rem` (16px) to `1.25rem` (20px) to give icons, user avatars, and progress rings ample internal cushion.
- **Safe Area Insets:** Generous bottom clearance (`5.5rem` / 88px) to account for the floating curved dock navigation.

## Elevation & Depth

Visual depth avoids cold, sterile cast shadows in favor of colorful, tactile 3D extrusion aesthetics reminiscent of toy construction blocks and plush vinyl stickers.

### Elevation Levels
- **Ground Floor (Base Canvas):** `#FFFDF9`. No shadow. Flat warm canvas base.
- **Level 1 (Resting Cards & Module Tiles):** Solid `#FFFFFF` fill with a dual-step soft cushion:
  - Ambient: `0 4px 14px rgba(45, 49, 66, 0.04)`
  - Direct Rim: `0 2px 0 #F0EAE1`
- **Level 2 (Tactile Buttons & Interactive Pills):** Designed to look physically pressable:
  - Base Resting: `box-shadow: 0 4px 0 rgba(0, 0, 0, 0.08), 0 8px 18px rgba(255, 126, 103, 0.18)`
  - Active Press: `transform: translateY(3px); box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1), 0 2px 6px rgba(255, 126, 103, 0.12)`
- **Level 3 (Modals, Sparkle Sheets & Floating Dock):**
  - Ambient: `0 12px 32px rgba(45, 49, 66, 0.12)`
  - Secondary Glow: `0 4px 12px rgba(255, 126, 103, 0.08)`
  - Border: `1.5px solid rgba(255, 255, 255, 0.8)` with backdrop blur (`16px`).

## Shapes

The shape system is strictly pill-driven, bulbous, and friendly. Sharp vertices are forbidden.

### Geometry Specifications
- **Standard Task Cards:** `1.5rem` (24px) to `1.75rem` (28px) border radius.
- **Buttons & Interactive Tags:** Fully rounded pill radius (`9999px`).
- **Avatar Frames & Progress Rings:** True circular forms (`50%`) enclosed with a `2px` to `3px` white isolation rim.
- **Mini Badges & Counters:** Pill radius (`9999px`) with generous horizontal padding to retain capsule silhouette.
- **Inner Nested Containers:** Always inherit a radius proportional to their parent container (e.g., parent `24px` -> child `16px`).

## Components

### Buttons
- **Chunky Primary Button:** Solid `#FF7E67` fill, text in `#FFFFFF`, font weight `700`, `9999px` pill border-radius. Height: `52px`. Bottom bevel: `box-shadow: 0 4px 0 #E2634D, 0 8px 20px rgba(255, 126, 103, 0.25)`. Pressed state: translate down by `3px`, reducing shadow height to `1px`.
- **Secondary Bubble Button:** White surface with an internal tint of `#FFF5F2`, `2px` border in `#FF9E8B`, font color `#FF7E67`.
- **Tertiary Soft Button:** `#FFFDF9` surface with `1.5px` border in `#F0EAE1`, text in `#4F5D73`.

### Gamified Chips & Badges
- **XP Pill:** Pill-shaped badge with `#FFEAA7` fill, text and star icon in `#D48806`, font `label-md`. Border: `1px solid rgba(255, 209, 102, 0.6)`.
- **Streak Flame Pill:** `#FFF2ED` background, flame icon in `#FF7E67`, bold integer counter indicating active consecutive chore days.
- **Roommate Avatar Token:** `32px` to `40px` circular portraits framed by a `2.5px` border colored to that roommate's assigned pastel identity (Lavender, Mint, Coral, or Sky Blue).

### Cards (To-Do & Household Tasks)
- Surface: `#FFFFFF` with `24px` rounded corners.
- Left edge: A `6px` vertical pill accent stripe indicating chore category (Cleaning = Mint, Cooking = Coral, Supplies = Sky Blue).
- Interior layout: Task title in `headline-sm`, reward chip ("+30 XP") placed inline or top-right, subtext displaying room location and assignee icon.
- Border: `1.5px` continuous outline in `#F5EFEB`.

### Selection Controls (Checkboxes & Radios)
- **Checkboxes:** Replaced with circular chore "Check-Bubbles" (`28px` diameter). Unchecked state is a soft `#F0EAE1` ring on white. Checked state pops into a filled `#6FCF97` circle containing a chunky white checkmark icon, accompanied by a quick scale pop (`1.15` to `1.0`).
- **Radio Options:** Pill selector cards that toggle between resting white surface and an active `#FFF5F2` fill with `#FF7E67` border and inset check dot.

### Input Fields
- Height: `52px`. Pill or `18px` rounded box.
- Background: `#FFFDF9` with a `1.5px` border in `#EAE3D9`. 
- Focus state: Border transitions to `#FF7E67` with a soft glow ring (`0 0 0 4px rgba(255, 126, 103, 0.15)`).
- Placeholder: `#8F9CAE`, weight `500`.

### Bottom Navigation Dock
- A floating capsule positioned `16px` above the bottom screen safe area, centered horizontally with `20px` margins.
- Surface: `#FFFFFF` at `95%` opacity with `20px` backdrop blur, surrounded by a `1.5px` border in `rgba(255, 255, 255, 0.8)`.
- Shadow: `0 10px 30px rgba(45, 49, 66, 0.08)`.
- Navigation items: 4 destinations (Home, Leaderboard, Rewards, Profile). Selected state presents a cheerful colored icon backed by a soft pastel pill glow with label in `label-sm`.