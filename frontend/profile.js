const SUPABASE_URL = "https://gokpasjiyrndxrbbvcpa.supabase.co";
const SUPABASE_KEY = "sb_publishable_qxzWabDx8x6cTp72eDAqhA_wYgCUc_c";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const workspace = document.getElementById("profileWorkspace");
const loading = document.getElementById("profileLoading");
const signedOut = document.getElementById("signedOut");
const editor = document.getElementById("profileEditor");
let activeUser = null;

function metadataValue(key, fallback = "Not added yet") {
    return activeUser?.user_metadata?.[key] || fallback;
}

function renderProfile() {
    const name = metadataValue("full_name", activeUser.user_metadata?.name || activeUser.email.split("@")[0]);
    document.getElementById("pageName").textContent = name;
    document.getElementById("pageEmail").textContent = activeUser.email;
    document.getElementById("pageRole").textContent = metadataValue("role");
    document.getElementById("pageCollege").textContent = metadataValue("college");
    document.getElementById("pageSkills").textContent = metadataValue("skills");
    document.getElementById("pageBio").textContent = metadataValue("bio", "Add a short introduction about yourself.");
    const avatar = activeUser.user_metadata?.avatar_url || activeUser.user_metadata?.picture || "";
    const image = document.getElementById("pageAvatar");
    if (avatar) image.src = avatar;
    else image.hidden = true;
}

async function loadProgress() {
    const { data, error } = await client.from("preparation_progress").select("*").eq("user_id", activeUser.id).order("updated_at", { ascending: false });
    if (error) {
        document.getElementById("recentPreparation").innerHTML = "<p>Run supabase-setup.sql to enable preparation tracking.</p>";
        return;
    }
    const rows = data || [];
    document.getElementById("pagePrepared").textContent = rows.filter(row => row.status === "prepared").length;
    document.getElementById("pagePracticed").textContent = rows.filter(row => row.status === "practiced").length;
    document.getElementById("pageCompanies").textContent = new Set(rows.map(row => row.company_name)).size;
    document.getElementById("pageTotal").textContent = `${rows.length} SAVED`;
    const recent = document.getElementById("recentPreparation");
    recent.innerHTML = "";
    rows.slice(0, 6).forEach(row => {
        const item = document.createElement("div");
        item.innerHTML = `<span>${row.company_name} · ${row.difficulty.toUpperCase()}</span><strong>${row.question_text}</strong><small>${row.status.toUpperCase()}</small>`;
        recent.appendChild(item);
    });
    if (!rows.length) recent.innerHTML = "<p>No preparation saved yet.</p>";
}

function openEditor() {
    document.getElementById("pageEditName").value = metadataValue("full_name", activeUser.user_metadata?.name || "");
    document.getElementById("pageEditRole").value = activeUser.user_metadata?.role || "";
    document.getElementById("pageEditCollege").value = activeUser.user_metadata?.college || "";
    document.getElementById("pageEditSkills").value = activeUser.user_metadata?.skills || "";
    document.getElementById("pageEditBio").value = activeUser.user_metadata?.bio || "";
    editor.hidden = false;
    editor.scrollIntoView({ behavior: "smooth" });
}

document.getElementById("editToggle").addEventListener("click", openEditor);
document.getElementById("cancelEdit").addEventListener("click", () => { editor.hidden = true; });
document.getElementById("logoutBtn").addEventListener("click", async () => { await client.auth.signOut(); window.location.href = "index.html"; });

document.getElementById("pageProfileForm").addEventListener("submit", async event => {
    event.preventDefault();
    const button = event.submitter;
    button.disabled = true;
    const { data, error } = await client.auth.updateUser({ data: {
        full_name: document.getElementById("pageEditName").value.trim(),
        role: document.getElementById("pageEditRole").value.trim(),
        college: document.getElementById("pageEditCollege").value.trim(),
        skills: document.getElementById("pageEditSkills").value.trim(),
        bio: document.getElementById("pageEditBio").value.trim()
    }});
    button.disabled = false;
    const message = document.getElementById("pageProfileMessage");
    if (error) { message.textContent = error.message; return; }
    activeUser = data.user;
    message.textContent = "Profile saved successfully.";
    renderProfile();
});

(async function initializeProfile() {
    const { data } = await client.auth.getSession();
    loading.hidden = true;
    if (!data.session?.user) { signedOut.hidden = false; return; }
    activeUser = data.session.user;
    workspace.hidden = false;
    renderProfile();
    await loadProgress();
    if (new URLSearchParams(location.search).get("edit") === "1") openEditor();
})();
