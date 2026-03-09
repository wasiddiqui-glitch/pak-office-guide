# Pakistan Office Guide

Pakistan Office Guide is a Next.js web application that helps users find government offices in Pakistan and view key visit information in one place, including requirements, steps, fees, hours, location details, and helpful notes.

The project is designed to make office visits easier by organizing scattered public information into a clean, searchable interface.

---

## Features

- Browse offices by city
- View office-specific requirements, steps, fees, and notes
- Dynamic office pages with reusable UI sections
- Favorites system using localStorage
- Google Maps integration for office locations
- AI-powered natural language search using the OpenAI API
- Responsive, app-like interface for desktop and mobile
- Structured JSON dataset designed for future expansion

---

## Tech Stack

- Next.js
- React
- JavaScript
- OpenAI API
- Local JSON data store
- CSS / inline styling

---

## AI Search

The app includes AI-powered natural language search that allows users to type queries such as:

- `passport office in islamabad`
- `nadra near dha lahore`
- `electricity bill office rawalpindi`

The AI layer interprets the query into structured filters such as city, category, area, and keywords, then matches results against the local office dataset.

This keeps the office data as the source of truth while making search much more intuitive.

---

## Project Structure

```bash
src/
  app/
    api/
      ai-search/
        route.js
    city/[city]/
      page.js
    office/[id]/
      page.js
    search/
      page.js
    page.js
    layout.js
    globals.css
  components/
    AISearchBox.js
    BottomNav.js
    CollapsibleSection.js
    CopyButton.js
    FavoriteButton.js
  data/
    offices.json
  lib/
    favorites.js
    offices.js
    ui.js
scripts/
  addOffice.js