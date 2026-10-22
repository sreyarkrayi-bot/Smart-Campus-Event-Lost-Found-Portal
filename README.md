<div align="center">

# 🎓 Campus Hub

**One place for campus events and lost-and-found.**
RSVP to what's happening, report what's missing, and get it back through a verified claim.

[Live Demo](https://sreyarkrayi-bot.github.io/Smart-Campus-Event-Lost-Found-Portal/) 

</div>

---

## Overview

Campus notices end up scattered across physical boards and chat groups, and lost items rarely find their way back to their owners. Campus Hub brings both problems into a single, fast, installation-free web app:

- **Events:** a calendar-driven schedule with RSVPs.
- **Lost & Found:** a searchable registry with photos, locations, and an ownership-verification flow.
- **Moderation:** an admin dashboard to keep everything clean.

## Features

### 📅 Events
- Monthly calendar with markers on event dates; click a date to filter
- RSVP and cancel RSVP, with a live attendee count
- Category filters (Tech, Cultural, Academic, Sports, Other)
- Countdown labels: *Today*, *Tomorrow*, *In 5 days*
- **Add to calendar:** download an `.ics` file for Google, Apple, or Outlook Calendar

### 🔎 Lost & Found
- Report **Lost** or **Found** items with category, date, and description
- **Photo upload** with live preview and automatic client-side compression
- **Location tagging** across campus zones, with location, type, and status filters and full-text search
- **Claim verification:** claimants submit proof of ownership; the poster or an admin approves or rejects. Approval marks the item as *Returned* and closes competing claims.

### 🛡️ Admin moderation
- Overview stats (users, events, open items, pending claims)
- Create or delete events, remove any post, reopen or close items, and review every claim

### 👤 Accounts
- Register and log in with validation
- Student and admin roles with protected views
- Passwords hashed with SHA-256 (Web Crypto API)
- **My activity** page: claims awaiting your decision, your claims, your reports, and your RSVPs

### 🎨 Experience
- Fully responsive, with a mobile bottom navigation bar and bottom-sheet forms
- Light and dark themes (follows system preference, with a manual toggle)
- Keyboard-friendly, with visible focus states and reduced-motion support

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | Semantic HTML5, native `<dialog>` |
| Styling | CSS3 custom properties, Grid, Flexbox, media queries |
| Logic | Vanilla JavaScript (ES6+), event delegation |
| Browser APIs | localStorage, FileReader, Canvas, Web Crypto, Blob |
| Fonts | Bricolage Grotesque, Instrument Sans (Google Fonts) |

No framework, no build step, no dependencies.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@lpu.in` | `admin123` |
| Student | Register from the **Log in → Create an account** screen | 6+ characters |

> **Reset data:** DevTools → Application → Local Storage → delete the keys starting with `ch_`, then reload.


## How It Works

### Data model

State is stored in `localStorage` under keys prefixed with `ch_`.

```text
users   { id, name, email, pw, role: "student" | "admin" }
events  { id, title, date, time, venue, cat, desc, rsvps: [userId] }
items   { id, type: "Lost" | "Found", title, cat, loc, date, desc, photo,
          by, byName, status: "open" | "returned" }
claims  { id, itemId, itemTitle, by, byName, proof,
          status: "pending" | "approved" | "rejected" }
```

### Claim verification flow

```
Item posted ──► User submits a claim with proof ──► status: pending
                                                       │
                              Poster or admin reviews  ▼
                          ┌── Approve ──► item: returned, other claims rejected
                          └── Reject  ──► claim: rejected
```

### Validation

| Form | Rules |
|---|---|
| Sign up / Log in | Valid email, password ≥ 6 chars, name ≥ 2 chars, unique email |
| Report item | Name ≥ 3 chars, date not in the future, description ≥ 10 chars, image file ≤ 8 MB |
| Claim | Proof ≥ 10 chars, one claim per user per item |
| New event | Title ≥ 3 chars, today or later, time and venue required |

All user-generated content is HTML-escaped before rendering.

## Deployment

**GitHub Pages**
1. Push the files to the repository root.
2. **Settings → Pages → Deploy from a branch → `main` / `(root)`** → Save.
3. Your site goes live at `https://<username>.github.io/<repo>/`.

**Vercel / Netlify**
Import the repository, set the framework preset to **Other**, and leave the build command empty.

## Limitations

- Data lives in the browser, so it is **not shared across devices or users**.
- Authentication is client-side and suited to demos. A production deployment needs a backend.

## Roadmap

- [ ] Backend and shared database (Firebase / Supabase)
- [ ] Email and push notifications for claim updates
- [ ] In-app messaging between finder and owner
- [ ] Event capacity limits and waitlists
- [ ] Cloud image storage

## License

Released under the [MIT License](LICENSE).
