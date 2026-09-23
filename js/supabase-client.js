/* =====================================================================
   SUPABASE CONNECTION (optional — off by default)
   ---------------------------------------------------------------------
   The site works fine without this file doing anything: projects are
   just stored in the browser's localStorage. Fill in the two values
   below and set USE_SUPABASE to true to make projects sync for every
   visitor instead of just your own browser.
   ===================================================================== */

const USE_SUPABASE = false; // change to true once the values below are set

const SUPABASE_URL = ""; // e.g. "https://xxxxxxxx.supabase.co"
const SUPABASE_ANON_KEY = ""; // your project's public "anon" key

window.SUPABASE_READY = false;

if (USE_SUPABASE && SUPABASE_URL && SUPABASE_ANON_KEY) {
  // Loaded from CDN in index.html / admin.html as `window.supabase`
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  window.supabaseGetProjects = async function () {
    const { data, error } = await client
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map((row) => ({
      ...row,
      tags: typeof row.tags === "string" ? row.tags.split(",").map((t) => t.trim()).filter(Boolean) : row.tags || [],
    }));
  };

  window.supabaseSaveProjects = async function (projects) {
    // Simplest reliable approach for a small personal project list:
    // wipe the table and reinsert the current full list.
    const rows = projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      tags: Array.isArray(p.tags) ? p.tags.join(",") : p.tags || "",
      link: p.link || "",
      github: p.github || "",
    }));
    const { error: deleteError } = await client
      .from("projects")
      .delete()
      .neq("id", "__none__");
    if (deleteError) throw deleteError;
    if (rows.length) {
      const { error: insertError } = await client.from("projects").insert(rows);
      if (insertError) throw insertError;
    }
  };

  window.SUPABASE_READY = true;
}
