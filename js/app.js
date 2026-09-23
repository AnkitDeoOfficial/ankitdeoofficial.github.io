const GITHUB_USERNAME = "AnkitDeoOfficial";

/* ---------- Secret admin trigger ----------
   Typing this exact name + email + message into the contact form and
   pressing "Send Message" opens the admin panel instead of sending a
   message. Nothing about this is written anywhere except here. */
const ADMIN_TRIGGER = {
  name: "ankit deo",
  email: "ankitdev880@gmail.com",
  message: "QWer12@#",
};

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Mobile nav ---------- */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open-mobile");
  navLinks.style.display = navLinks.classList.contains("open-mobile") ? "flex" : "";
  if (navLinks.classList.contains("open-mobile")) {
    navLinks.style.position = "absolute";
    navLinks.style.top = "64px";
    navLinks.style.left = "0";
    navLinks.style.right = "0";
    navLinks.style.background = "var(--bg)";
    navLinks.style.flexDirection = "column";
    navLinks.style.padding = "20px 24px";
    navLinks.style.borderBottom = "1px solid var(--card-border)";
  }
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open-mobile");
    navLinks.removeAttribute("style");
  })
);

/* Highlight active nav link on scroll */
const sections = document.querySelectorAll("section[id], header[id]");
window.addEventListener("scroll", () => {
  let current = "home";
  sections.forEach((sec) => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
  });
});

/* ---------- Theme toggle ---------- */
const themeToggle = document.getElementById("themeToggle");
function applyTheme(mode) {
  document.body.classList.toggle("light", mode === "light");
  themeToggle.textContent = mode === "light" ? "☀️" : "🌙";
}
applyTheme(localStorage.getItem("theme") || "dark");
themeToggle.addEventListener("click", () => {
  const next = document.body.classList.contains("light") ? "dark" : "light";
  localStorage.setItem("theme", next);
  applyTheme(next);
});

/* ---------- Toast ---------- */
function showToast(text, ms = 3200) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), ms);
}

/* ---------- Projects ---------- */
function projectThumbSvg() {
  return `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="10" width="48" height="34" rx="4" fill="#1b2648" stroke="#33447a" stroke-width="1.5"/>
    <rect x="12" y="16" width="30" height="4" rx="2" fill="#3b82f6"/>
    <rect x="12" y="24" width="20" height="4" rx="2" fill="#8b5cf6"/>
    <rect x="0" y="48" width="60" height="4" rx="2" fill="#243156"/>
  </svg>`;
}

function renderProjects(projects) {
  const grid = document.getElementById("projectGrid");
  if (!projects.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      No projects yet — check back soon. New projects get added here regularly.
    </div>`;
    return;
  }
  grid.innerHTML = projects
    .map(
      (p) => `
    <article class="project-card">
      <div class="project-thumb">${projectThumbSvg()}</div>
      <div class="project-body">
        <h3>${escapeHtml(p.title)}</h3>
        <div class="project-tags">${(p.tags || [])
          .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
          .join("")}</div>
        <p class="project-desc">${escapeHtml(p.description || "")}</p>
        <div class="project-links">
          ${p.link ? `<a class="btn-link" href="${escapeAttr(p.link)}" target="_blank" rel="noopener">View Project →</a>` : ""}
          ${p.github ? `<a class="btn-link" href="${escapeAttr(p.github)}" target="_blank" rel="noopener">Code</a>` : ""}
        </div>
      </div>
    </article>`
    )
    .join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

getProjects().then(renderProjects);

/* ---------- GitHub live stats ---------- */
async function loadGithubStats() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
    if (!res.ok) throw new Error("GitHub API error");
    const user = await res.json();

    document.getElementById("statRepos").textContent = user.public_repos ?? "–";
    document.getElementById("statFollowers").textContent = user.followers ?? "–";
    document.getElementById("statFollowing").textContent = user.following ?? "–";
    document.getElementById("statGists").textContent = user.public_gists ?? "–";
    document.getElementById("ghFollowLine").textContent = `${user.followers ?? 0} followers · ${user.following ?? 0} following`;

    const avatarWrap = document.getElementById("ghAvatarWrap");
    if (user.avatar_url) {
      avatarWrap.innerHTML = `<img src="${user.avatar_url}" alt="${GITHUB_USERNAME} avatar" />`;
    }

    const repoRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=3`);
    const repos = repoRes.ok ? await repoRes.json() : [];
    const repoList = document.getElementById("repoList");
    if (Array.isArray(repos) && repos.length) {
      repoList.innerHTML = repos
        .map(
          (r) => `
        <div class="repo-row">
          <div>
            <div class="repo-name">${escapeHtml(r.name)}</div>
            <div class="repo-desc">${escapeHtml(r.description || "No description")}</div>
          </div>
          <a class="btn-link" href="${escapeAttr(r.html_url)}" target="_blank" rel="noopener">★ ${r.stargazers_count}</a>
        </div>`
        )
        .join("");
    } else {
      repoList.innerHTML = `<div class="repo-row"><div class="repo-desc">No public repositories yet.</div></div>`;
    }
  } catch (e) {
    document.getElementById("ghFollowLine").textContent = "Live stats unavailable right now";
    document.getElementById("repoList").innerHTML = `<div class="repo-row"><div class="repo-desc">Couldn't load repositories right now.</div></div>`;
  }
}
loadGithubStats();

/* ---------- Contact form (+ hidden admin trigger) ---------- */
const contactForm = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = contactForm.name.value.trim();
  const email = contactForm.email.value.trim();
  const message = contactForm.message.value; // exact match, not trimmed on case

  const isAdminAttempt =
    name.toLowerCase() === ADMIN_TRIGGER.name &&
    email.toLowerCase() === ADMIN_TRIGGER.email &&
    message === ADMIN_TRIGGER.message;

  if (isAdminAttempt) {
    sessionStorage.setItem("admin_unlocked", "true");
    window.location.href = "admin.html";
    return;
  }

  if (!name || !email || !message.trim()) {
    formMsg.textContent = "Please fill in every field.";
    formMsg.className = "form-msg error";
    return;
  }

  // No backend on GitHub Pages — open the visitor's email client, pre-filled.
  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
  window.location.href = `mailto:ankitdev880@gmail.com?subject=${subject}&body=${body}`;

  formMsg.textContent = "Opening your email app to send this…";
  formMsg.className = "form-msg success";
  showToast("Opening your email app…");
  contactForm.reset();
});
