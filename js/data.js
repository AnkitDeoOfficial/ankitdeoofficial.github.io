/* =====================================================================
   DATA LAYER
   ---------------------------------------------------------------------
   Every project card on the site is read through the functions below
   (getProjects / saveProjects). Right now they read/write the browser's
   localStorage, which is why new projects only show up on the device
   that added them.

   To make projects show up for EVERY visitor, connect Supabase:
     1. Create a free project at supabase.com
     2. Create a table called "projects" with columns:
          id          text or uuid (primary key)
          title       text
          description text
          tags        text        (comma-separated, e.g. "React,Firebase")
          link        text        (live demo / project URL)
          github      text        (repo URL, optional)
          created_at  timestamp   (default: now())
     3. In supabase-client.js, set SUPABASE_URL and SUPABASE_ANON_KEY,
        and flip USE_SUPABASE to true.
   Once that's done, the functions in this file automatically start
   reading/writing Supabase instead of localStorage — nothing else in
   the site needs to change. Claude can walk you through steps 1-3.
   ===================================================================== */

const STORAGE_KEY = "portfolio_projects";

// Starting project(s). Shown until real data is loaded / added via admin.
const DEFAULT_PROJECTS = [
  {
    id: "portfolio-website",
    title: "Portfolio Website",
    description:
      "My personal portfolio site — built to showcase who I am, what I'm learning, and the projects I build along the way. Includes a private admin panel so I can add and edit projects without touching code.",
    tags: ["HTML", "CSS", "JavaScript"],
    link: "https://github.com/AnkitDeoOfficial",
    github: "https://github.com/AnkitDeoOfficial",
  },
];

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return null;
  } catch (e) {
    console.error("Could not read saved projects:", e);
    return null;
  }
}

function writeLocal(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch (e) {
    console.error("Could not save projects:", e);
    return false;
  }
}

/**
 * Returns all projects. Swap this body for a Supabase `select()` call
 * once Supabase is connected (see supabase-client.js).
 */
async function getProjects() {
  if (window.SUPABASE_READY) {
    try {
      return await window.supabaseGetProjects();
    } catch (e) {
      console.error("Supabase fetch failed, falling back to local data:", e);
    }
  }
  const local = readLocal();
  if (local && local.length) return local;
  return DEFAULT_PROJECTS;
}

/**
 * Saves the full project list. Swap this body for Supabase
 * insert/update/delete calls once connected.
 */
async function saveProjects(projects) {
  if (window.SUPABASE_READY) {
    try {
      await window.supabaseSaveProjects(projects);
      return true;
    } catch (e) {
      console.error("Supabase save failed, saving locally instead:", e);
    }
  }
  return writeLocal(projects);
}

function makeProjectId(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "project"}-${Date.now().toString(36)}`;
}
