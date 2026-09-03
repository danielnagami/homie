App: "Homie" — a gamified household to-do app for families/roommates, mobile-first.

Visual style: cute, cozy, playful, "cuttie" chibi-cartoon aesthetic. Soft rounded corners,
pastel color palette (warm coral, mint green, soft yellow, lavender), friendly rounded
sans-serif typography, big tappable buttons, generous whitespace, subtle drop shadows,
small celebratory illustrations (confetti, sparkles, stars) for gamification moments.
Design for a single mobile viewport (375x812), portrait only, with a bottom tab bar
for primary navigation.

Screens to design:

1. Sign In — app logo/mascot, "Sign in with Google" button, "Sign in with Microsoft"
   button, short friendly tagline. No email/password fields.

2. Create or Join Home — two large cards: "Create a new Home" (name input + create
   button) and "Join a Home" (join-code input + join button).

3. Avatar Builder — live avatar preview (cute chibi character, SVG style) centered top,
   below it horizontal swipeable pickers for: skin tone, hair style, hair color,
   face/expression, outfit, accessory. "Save avatar" button pinned to bottom.

4. Home / Task Checklist (main screen) — header showing the user's avatar, name,
   current level badge, and streak flame icon with day count. Below: a scrollable list
   of today's task cards, each with an icon, task title, point value chip, and a
   checkbox/checkmark button to mark complete (with a satisfying "completed" state:
   strikethrough + confetti burst). Floating "+" button to add a new task (opens the
   Create Task dialog, screen 5). Small overflow/menu icon in the header to open the
   Manage Tasks screen (screen 6).

5. Create / Edit Task (dialog or bottom sheet) — appears over the Home screen. Fields:
   task title (text input), points (number stepper, prefilled from the household's
   default), recurrence (segmented control: Daily / Weekly / Once), assignee (avatar
   picker row: "Anyone" or a specific household member), icon/emoji picker for the task
   card. Primary "Save Task" button, secondary "Cancel". When editing an existing task,
   also show a "Delete Task" destructive action.

6. Manage Tasks — full screen list of all household tasks (not just today's), grouped
   by recurrence (Daily / Weekly / Once). Each row shows icon, title, points chip,
   recurrence tag, assignee avatar, and edit/delete icon buttons that open screen 5 in
   edit mode. Floating "+" button to open screen 5 in create mode.

7. Leaderboard — segmented control at top: Day / Week / Month. Below, a ranked list of
   household members: avatar, name, points, rank medal icon for top 3, subtle progress
   bar comparing to the top scorer ("wins against your family").

8. Level & Achievements — level badge with large level number, circular/linear XP
   progress bar to next level, below it a grid of achievement badges (locked = greyed
   out silhouette, unlocked = full color with small glow), tapping shows title +
   description in a modal.

Bottom tab bar (visible on screens 4, 6, 7, 8): Home, Tasks, Leaderboard, Achievements,
Profile.

Deliverable: mobile screens as described, consistent design system (colors, spacing,
component styles) reusable across all screens.