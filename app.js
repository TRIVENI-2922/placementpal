const storeKey = "placementpal-v1";

const defaultData = {
  applications: [
    { id: 1, company: "Vercel", role: "Frontend Developer Intern", date: "2026-09-24", status: "Applied", badge: "v" },
    { id: 2, company: "Atlassian", role: "Software Engineer Intern", date: "2026-09-21", status: "Interview", badge: "a" },
    { id: 3, company: "Swiggy", role: "Frontend Intern", date: "2026-09-18", status: "Applied", badge: "s" }
  ],
  goals: [
    { id: 1, text: "Solve 3 JavaScript problems", done: true },
    { id: 2, text: "Finish React state-management module", done: true },
    { id: 3, text: "Practice one mock interview", done: false },
    { id: 4, text: "Update portfolio case study", done: false },
    { id: 5, text: "Reach out to one alumnus", done: false }
  ],
  roadmap: [
    { text: "HTML & accessible CSS", detail: "Semantic structure, responsive layouts", done: true },
    { text: "JavaScript foundations", detail: "Async code, DOM, modern ES features", done: true },
    { text: "React and component design", detail: "State, effects, reusable UI", done: false },
    { text: "APIs, Git & deployment", detail: "Ship a polished project online", done: false }
  ],
  profile: { name: "Teja", headline: "Frontend developer aspirant", about: "Building thoughtful, responsive web experiences.", skills: "JavaScript, React, CSS", github: "", linkedin: "" }
};

let data = JSON.parse(localStorage.getItem(storeKey) || "null") || defaultData;
let activeFilter = "All";
let searchTerm = "";
let questionIndex = 0;
const questions = {
  frontend: ["How would you make a web page accessible to every user?", "How do you approach making a site responsive on smaller screens?", "What makes a component reusable rather than too generic?"],
  javascript: ["What is the difference between a Promise and async/await?", "How would you explain event delegation to a teammate?", "When would you use map, filter, and reduce?"],
  behavioral: ["Tell me about a time you received difficult feedback and what you did next.", "Describe a project challenge and how you moved it forward.", "How do you prioritize when several tasks have the same deadline?"]
};

const $ = (selector) => document.querySelector(selector);
const save = () => localStorage.setItem(storeKey, JSON.stringify(data));

function statusClass(status) { return status.toLowerCase(); }
function initials(company) { return company.split(/\s+/).map(word => word[0]).join("").slice(0, 2).toUpperCase(); }
function formatDate(date) { return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`)); }

function renderApplications() {
  const applications = data.applications;
  const active = applications.filter(app => ["Applied", "Interview"].includes(app.status)).length;
  const interviews = applications.filter(app => app.status === "Interview").length;
  $("#activeApplications").textContent = active;
  $("#interviewCount").textContent = interviews;
  $("#applicationTotal").textContent = `${applications.length} applications`;

  $("#recentApplications").innerHTML = applications.slice(0, 3).map(app => `
    <tr><td><div class="company-cell"><span class="company-logo ${app.badge || "v"}">${initials(app.company)}</span>${app.company}</div></td><td>${app.role}</td><td>${formatDate(app.date)}</td><td><span class="status ${statusClass(app.status)}">${app.status}</span></td><td><button class="row-menu" aria-label="More actions">•••</button></td></tr>`).join("");

  const filtered = (activeFilter === "All" ? applications : applications.filter(app => app.status === activeFilter)).filter(app => `${app.company} ${app.role}`.toLowerCase().includes(searchTerm));
  $("#applicationCards").innerHTML = filtered.length ? filtered.map(app => `
    <article class="application-card"><header><span class="company-logo ${app.badge || "v"}">${initials(app.company)}</span><select class="application-status-select ${statusClass(app.status)}" data-application-id="${app.id}" aria-label="Change status for ${app.company}"><option ${app.status === "Applied" ? "selected" : ""}>Applied</option><option ${app.status === "Interview" ? "selected" : ""}>Interview</option><option ${app.status === "Offer" ? "selected" : ""}>Offer</option><option ${app.status === "Rejected" ? "selected" : ""}>Rejected</option></select></header><h3>${app.company}</h3><p class="role">${app.role}</p><footer><span>Applied ${formatDate(app.date)}</span><button title="Saved application">•••</button></footer></article>`).join("") : `<p class="muted">No matching applications yet.</p>`;
}

function renderGoals() {
  const complete = data.goals.filter(goal => goal.done).length;
  const percentage = Math.round((complete / data.goals.length) * 100);
  $("#goalList").innerHTML = data.goals.map(goal => `<label class="goal ${goal.done ? "done" : ""}"><input type="checkbox" data-goal-id="${goal.id}" ${goal.done ? "checked" : ""}/><span>${goal.text}</span></label>`).join("");
  $("#goalCount").textContent = `${complete}/${data.goals.length}`;
  $("#goalDoneCount").textContent = complete;
  $("#weeklyPercent").textContent = `${percentage}%`;
  $("#weeklyProgress").style.width = `${percentage}%`;
}

function renderRoadmap() {
  $("#roadmapItems").innerHTML = data.roadmap.map((item, index) => `<div class="roadmap-item"><span class="roadmap-step">0${index + 1}</span><div><h3>${item.text}</h3><p>${item.detail}</p></div><input type="checkbox" data-roadmap-id="${index}" ${item.done ? "checked" : ""} aria-label="Mark ${item.text} complete" /></div>`).join("");
}

function getProfileCompleteness() {
  const entries = Object.values(data.profile || {});
  return Math.round((entries.filter(value => String(value).trim()).length / entries.length) * 100);
}

function renderProfile() {
  if (!data.profile) data.profile = defaultData.profile;
  const profile = data.profile;
  const form = $("#profileForm");
  Object.entries(profile).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
  $("#previewName").textContent = profile.name || "Your name";
  $("#previewHeadline").textContent = profile.headline || "Your target role";
  $("#previewAvatar").textContent = (profile.name || "P").trim().charAt(0).toUpperCase();
  const percent = getProfileCompleteness();
  $("#profilePercent").textContent = `${percent}%`;
  $("#profileProgress").style.width = `${percent}%`;
  $("#profileReadiness").textContent = `${percent}%`;
  const skills = profile.skills.split(",").map(skill => skill.trim()).filter(Boolean);
  $("#previewSkills").innerHTML = skills.length ? skills.slice(0, 5).map(skill => `<span>${skill}</span>`).join("") : "<span>Add your core skills</span>";
}

function navigate(page) {
  document.querySelectorAll(".page").forEach(section => section.classList.toggle("active-page", section.id === page));
  document.querySelectorAll("[data-page-link]").forEach(link => link.classList.toggle("active", link.dataset.pageLink === page));
  $(".sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setQuestion() {
  const topic = $("#questionTopic").value;
  const topicQuestions = questions[topic];
  $("#interviewQuestion").textContent = topicQuestions[questionIndex % topicQuestions.length];
  $("#questionNumber").textContent = String((questionIndex % topicQuestions.length) + 1).padStart(2, "0");
  $("#answerText").value = "";
  $("#wordCount").textContent = "0 words";
  $("#feedback").classList.add("hidden");
}

function openModal() { $("#applicationModal").classList.remove("hidden"); $("#applicationForm [name=company]").focus(); }
function closeModal() { $("#applicationModal").classList.add("hidden"); }

document.querySelectorAll("[data-page-link]").forEach(link => link.addEventListener("click", event => { event.preventDefault(); navigate(link.dataset.pageLink); }));
document.querySelectorAll("[data-jump]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.jump)));
$("#menuButton").addEventListener("click", () => $(".sidebar").classList.toggle("open"));
$("#openApplicationModal").addEventListener("click", openModal);
$("#openApplicationModal2").addEventListener("click", openModal);
$("#closeModal").addEventListener("click", closeModal);
$("#applicationModal").addEventListener("click", event => { if (event.target === $("#applicationModal")) closeModal(); });

$("#applicationForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  data.applications.unshift({ id: Date.now(), company: form.get("company").trim(), role: form.get("role").trim(), date: form.get("date"), status: form.get("status"), badge: "v" });
  save(); renderApplications(); event.currentTarget.reset(); closeModal(); navigate("applications");
});

$("#goalList").addEventListener("change", event => {
  const id = Number(event.target.dataset.goalId); if (!id) return;
  data.goals = data.goals.map(goal => goal.id === id ? { ...goal, done: event.target.checked } : goal);
  save(); renderGoals();
});
$("#addGoalButton").addEventListener("click", () => {
  const text = window.prompt("What is your next focused goal?");
  if (!text?.trim()) return;
  data.goals.push({ id: Date.now(), text: text.trim(), done: false }); save(); renderGoals();
});
$("#roadmapItems").addEventListener("change", event => {
  const index = Number(event.target.dataset.roadmapId); if (Number.isNaN(index)) return;
  data.roadmap[index].done = event.target.checked; save(); renderRoadmap();
});
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter; document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active-filter", item === button)); renderApplications();
}));
$("#applicationSearch").addEventListener("input", event => { searchTerm = event.target.value.trim().toLowerCase(); renderApplications(); });
$("#applicationCards").addEventListener("change", event => {
  const id = Number(event.target.dataset.applicationId); if (!id) return;
  data.applications = data.applications.map(app => app.id === id ? { ...app, status: event.target.value } : app);
  save(); renderApplications();
});
$("#exportApplications").addEventListener("click", () => {
  const csvEscape = value => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [["Company", "Role", "Applied date", "Status"], ...data.applications.map(app => [app.company, app.role, app.date, app.status])];
  const file = new Blob([rows.map(row => row.map(csvEscape).join(",")).join("\n")], { type: "text/csv" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(file); link.download = "placementpal-applications.csv"; link.click(); URL.revokeObjectURL(link.href);
});

$("#profileForm").addEventListener("submit", event => {
  event.preventDefault(); const form = new FormData(event.currentTarget);
  data.profile = Object.fromEntries(["name", "headline", "about", "skills", "github", "linkedin"].map(key => [key, form.get(key).trim()]));
  save(); renderProfile(); $("#profileSaved").classList.remove("hidden");
  window.setTimeout(() => $("#profileSaved").classList.add("hidden"), 2200);
});

$("#analyzeResume").addEventListener("click", () => {
  const text = $("#resumeText").value.toLowerCase();
  const keywords = ["javascript", "react", "typescript", "git", "project", "api"];
  const matches = keywords.filter(keyword => text.includes(keyword));
  const missing = keywords.filter(keyword => !matches.includes(keyword));
  const score = text.trim() ? Math.min(96, 42 + matches.length * 9 + Math.min(10, Math.floor(text.length / 80))) : 0;
  const result = $("#resumeResult");
  result.classList.remove("hidden");
  result.innerHTML = text.trim() ? `<h4>Readiness score: ${score}%</h4><p>Great start. You already mention <strong>${matches.join(", ") || "your experience"}</strong>.</p><ul><li>Add evidence with numbers: performance, users, or time saved.</li>${missing.slice(0, 2).map(keyword => `<li>Consider mentioning <strong>${keyword}</strong> if you have used it.</li>`).join("")}</ul>` : `<h4>Paste a little more first</h4><p>Add your skills, project work, and achievements so we can check the content.</p>`;
});

$("#questionTopic").addEventListener("change", () => { questionIndex = 0; setQuestion(); });
$("#answerText").addEventListener("input", event => { const count = event.target.value.trim() ? event.target.value.trim().split(/\s+/).length : 0; $("#wordCount").textContent = `${count} word${count === 1 ? "" : "s"}`; });
$("#submitAnswer").addEventListener("click", () => {
  const answer = $("#answerText").value.trim(); const words = answer ? answer.split(/\s+/).length : 0; const feedback = $("#feedback");
  feedback.classList.remove("hidden");
  if (!answer) { feedback.innerHTML = "<strong>Start with a rough answer.</strong><br />Even a few sentences give you something to improve."; return; }
  const detail = words >= 80 ? "Nice depth. Now make sure your strongest example comes first." : words >= 35 ? "Good structure. Add one concrete example or measurable result to make it memorable." : "A promising start. Explain your approach, then give a real example and outcome.";
  feedback.innerHTML = `<strong>Practice feedback</strong><br />${detail}`;
  questionIndex += 1;
  window.setTimeout(setQuestion, 1800);
});

renderApplications(); renderGoals(); renderRoadmap(); renderProfile(); setQuestion();
