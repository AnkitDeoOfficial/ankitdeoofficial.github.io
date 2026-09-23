(function gate() {
  if (sessionStorage.getItem("admin_unlocked") !== "true") {
    document.getElementById("lockScreen").style.display = "flex";
    return;
  }
  document.getElementById("adminMain").style.display = "block";
  initAdmin();
})();

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("admin_unlocked");
  window.location.href = "index.html";
});

function showToast(text, ms = 2800) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), ms);
}

async function initAdmin() {
  document.getElementById("storageNote").textContent = window.SUPABASE_READY
    ? "Connected to Supabase — changes are visible to every visitor."
    : "Saving to this browser only (Supabase not connected yet).";

  let projects = await getProjects();
  renderAdminList(projects);

  function renderAdminList(list) {
    const container = document.getElementById("adminList");
    if (!list.length) {
      container.innerHTML = `<div class="empty-state">No projects yet. Add your first one below.</div>`;
      return;
    }
    container.innerHTML = list
      .map(
        (p) => `
      <div class="admin-item" data-id="${p.id}">
        <div>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.description || "")}</p>
          <div class="project-tags" style="margin-top:8px;">${(p.tags || [])
            .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
            .join("")}</div>
        </div>
        <div class="admin-item-actions">
          <button class="btn btn-outline btn-sm" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="btn btn-danger btn-sm" data-action="delete" data-id="${p.id}">Delete</button>
        </div>
      </div>`
      )
      .join("");

    container.querySelectorAll('[data-action="edit"]').forEach((btn) =>
      btn.addEventListener("click", () => startEdit(btn.dataset.id))
    );
    container.querySelectorAll('[data-action="delete"]').forEach((btn) =>
      btn.addEventListener("click", () => deleteProject(btn.dataset.id))
    );
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function startEdit(id) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    document.getElementById("formTitle").textContent = "Edit project";
    document.getElementById("editId").value = p.id;
    document.getElementById("pTitle").value = p.title || "";
    document.getElementById("pTags").value = (p.tags || []).join(", ");
    document.getElementById("pDesc").value = p.description || "";
    document.getElementById("pLink").value = p.link || "";
    document.getElementById("pGithub").value = p.github || "";
    document.getElementById("cancelEditBtn").style.display = "inline-flex";
    window.scrollTo({ top: document.getElementById("projectForm").offsetTop - 80, behavior: "smooth" });
  }

  function resetForm() {
    document.getElementById("formTitle").textContent = "Add a new project";
    document.getElementById("editId").value = "";
    ["pTitle", "pTags", "pDesc", "pLink", "pGithub"].forEach((id) => (document.getElementById(id).value = ""));
    document.getElementById("cancelEditBtn").style.display = "none";
  }

  document.getElementById("cancelEditBtn").addEventListener("click", resetForm);

  async function deleteProject(id) {
    if (!confirm("Delete this project? This can't be undone.")) return;
    projects = projects.filter((p) => p.id !== id);
    await saveProjects(projects);
    renderAdminList(projects);
    showToast("Project deleted.");
  }

  document.getElementById("saveProjectBtn").addEventListener("click", async () => {
    const title = document.getElementById("pTitle").value.trim();
    const msg = document.getElementById("adminMsg");
    if (!title) {
      msg.textContent = "A title is required.";
      msg.className = "form-msg error";
      return;
    }
    const editId = document.getElementById("editId").value;
    const tags = document
      .getElementById("pTags")
      .value.split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const data = {
      title,
      tags,
      description: document.getElementById("pDesc").value.trim(),
      link: document.getElementById("pLink").value.trim(),
      github: document.getElementById("pGithub").value.trim(),
    };

    if (editId) {
      projects = projects.map((p) => (p.id === editId ? { ...p, ...data } : p));
      msg.textContent = "Project updated.";
    } else {
      projects.push({ id: makeProjectId(title), ...data });
      msg.textContent = "Project added.";
    }
    msg.className = "form-msg success";
    await saveProjects(projects);
    renderAdminList(projects);
    resetForm();
    showToast("Saved. Refresh the live site to see it.");
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const out = document.getElementById("exportOutput");
    out.style.display = "block";
    out.value = JSON.stringify(projects, null, 2);
    out.select();
  });
}
