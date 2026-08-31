const SUPABASE_URL = "https://gokpasjiyrndxrbbvcpa.supabase.co";
const SUPABASE_KEY = "sb_publishable_qxzWabDx8x6cTp72eDAqhA_wYgCUc_c";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            persistSession: true,
            detectSessionInUrl: true,
            autoRefreshToken: true,
            flowType: "implicit"
        }
    }
);
const analyzeBtn = document.getElementById("analyzeBtn");
const companyName = document.getElementById("companyName");
const companyCard = document.querySelector(".company-card");
const companyPresets = document.querySelectorAll("[data-company]");

const roleName = document.getElementById("roleName");
const roleType = document.getElementById("roleType");
const readinessScore = document.getElementById("readinessScore");
const readinessText = document.getElementById("readinessText");

const technicalScore = document.getElementById("technicalScore");
const behavioralScore = document.getElementById("behavioralScore");
const problemScore = document.getElementById("problemScore");

const technicalBar = document.getElementById("technicalBar");
const behavioralBar = document.getElementById("behavioralBar");
const problemBar = document.getElementById("problemBar");

const detectedSkills = document.getElementById("detectedSkills");
const questionList = document.getElementById("questionList");
const recruiterLens = document.getElementById("recruiterLens");
const companyOverview = document.getElementById("companyOverview");
const companyIndustry = document.getElementById("companyIndustry");
const companyHeadquarters = document.getElementById("companyHeadquarters");
const companyFounded = document.getElementById("companyFounded");
const companyWebsite = document.getElementById("companyWebsite");
const hiringProcess = document.getElementById("hiringProcess");
const companySources = document.getElementById("companySources");
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message, type = "info") {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = `toast active ${type}`;
    toastTimer = setTimeout(() => {
        toast.className = "toast";
    }, 4200);
}

async function checkBackend() {
    const status = document.getElementById("systemStatus");
    const text = document.getElementById("systemStatusText");
    try {
        const response = await fetch("http://localhost:3000", { cache: "no-store" });
        if (!response.ok) throw new Error();
        status.classList.remove("offline");
        text.textContent = "AI READY";
    } catch {
        status.classList.add("offline");
        text.textContent = "AI OFFLINE";
    }
}

checkBackend();

companyPresets.forEach(function (button) {
    button.addEventListener("click", function () {
        companyName.value = button.dataset.company;
        companyPresets.forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        companyName.focus();
    });
});

companyName.addEventListener("input", function () {
    companyCard.classList.remove("invalid");
    companyPresets.forEach(button => {
        button.classList.toggle("active", button.dataset.company.toLowerCase() === companyName.value.trim().toLowerCase());
    });
});

companyName.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        analyzeBtn.click();
    }
});

function resetDashboard() {
    roleName.textContent = "Waiting for company...";
    roleType.textContent = "Enter a company above to begin live research";

    readinessScore.textContent = "\u2014";
    readinessText.textContent = "AWAITING RESEARCH";

    technicalScore.textContent = "\u2014";
    behavioralScore.textContent = "\u2014";
    problemScore.textContent = "\u2014";

    technicalBar.style.width = "0%";
    behavioralBar.style.width = "0%";
    problemBar.style.width = "0%";

    detectedSkills.innerHTML =
        "<span>Waiting for research</span>";

    recruiterLens.textContent =
        "What is this company likely to evaluate?";

    companyOverview.textContent = "Research a company to see its business, products, culture and interview context.";
    companyIndustry.textContent = "\u2014";
    companyHeadquarters.textContent = "\u2014";
    companyFounded.textContent = "\u2014";
    companyWebsite.textContent = "\u2014";
    companyWebsite.removeAttribute("href");
    hiringProcess.innerHTML = "<li>Waiting for company research</li>";
    companySources.innerHTML = "<p>Source links will appear after research.</p>";

    questionList.innerHTML = `
        <div class="empty-question">
            <span>WAITING FOR COMPANY</span>
            <h3>Your interview map is empty.</h3>
            <p>Enter a company above and build its intelligence brief.</p>
        </div>
    `;
}

function animateScore(element, target) {
    let current = 0;
    const finalScore = Number(target) || 0;

    const interval = setInterval(function () {
        current += Math.max(
            1,
            Math.ceil(finalScore / 20)
        );

        if (current >= finalScore) {
            current = finalScore;
            clearInterval(interval);
        }

        element.textContent = current + "%";
    }, 25);
}

function renderSkills(skills) {
    detectedSkills.innerHTML = "";

    if (!Array.isArray(skills) || skills.length === 0) {
        detectedSkills.innerHTML =
            "<span>No strong signals detected</span>";
        return;
    }

    skills.forEach(function (skill) {
        const tag = document.createElement("span");
        tag.textContent = skill;
        detectedSkills.appendChild(tag);
    });
}

function renderQuestions(questions) {
    questionList.innerHTML = "";

    if (!Array.isArray(questions) || questions.length === 0) {
        questionList.innerHTML = `
            <div class="empty-question">
                <span>NO QUESTIONS</span>
                <h3>No questions were generated.</h3>
                <p>Try another company name.</p>
            </div>
        `;
        return;
    }

    questions.forEach(function (question, index) {
        const card = document.createElement("article");

        card.className = "question";
        card.dataset.category = question.type;

        card.innerHTML = `
            <span class="question-number">
                ${String(index + 1).padStart(2, "0")}
            </span>

            <div>
                <small class="${question.type}">
                    ${question.type.toUpperCase()} &middot; AI GENERATED
                </small>

                <h3>${question.question}</h3>

                <div class="question-tags">
                    <span>${question.type}</span>
                    <span>HIGH</span>
                </div>
            </div>

            <b>HIGH</b>
            <i>&rarr;</i>
        `;

        card.addEventListener("click", function () {
            openQuestion(question);
        });

        questionList.appendChild(card);
    });
}

function openQuestion(question) {
    const modal = document.createElement("div");

    modal.className = "question-modal";

    modal.innerHTML = `
        <div class="modal-bg"></div>

        <div class="modal-content">
            <button class="modal-close">&times;</button>

            <span class="section-label">
                ${question.type.toUpperCase()} &middot; INTERNIQ
            </span>

            <h2>${question.question}</h2>

            <div class="modal-block">
                <label>WHAT THEY MAY BE TESTING</label>

                <p>
                    ${
                        question.signal ||
                        "Your knowledge, reasoning and communication."
                    }
                </p>
            </div>

            <div class="modal-block">
                <label>HOW TO PREPARE</label>

                <p>
                    Explain your approach clearly, provide an example
                    and finish with the result or lesson learned.
                </p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    function closeQuestion() {
        modal.remove();
    }

    modal
        .querySelector(".modal-close")
        .addEventListener("click", closeQuestion);

    modal
        .querySelector(".modal-bg")
        .addEventListener("click", closeQuestion);
}

analyzeBtn.addEventListener("click", async function () {
    const company = companyName.value.trim();

    if (company.length < 2) {
        companyCard.classList.remove("invalid");
        void companyCard.offsetWidth;
        companyCard.classList.add("invalid");
        companyName.focus();
        showToast("Enter the company you are preparing for.", "error");
        return;
    }

    analyzeBtn.disabled = true;

    analyzeBtn.innerHTML = `
        <span>RESEARCHING LIVE SOURCES...</span>
        <strong class="button-loader" aria-hidden="true"></strong>
    `;

    try {
        const response = await fetch(
            "http://localhost:3000/api/company",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    companyName: company
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Analysis failed."
            );
        }

        roleName.textContent =
            data.companyName || company;

        roleType.textContent =
            [data.industry, data.headquarters].filter(Boolean).join(" \u00B7 ") || "Company intelligence brief";

        animateScore(
            technicalScore,
            data.technicalScore
        );

        animateScore(
            behavioralScore,
            data.behavioralScore
        );

        animateScore(
            problemScore,
            data.problemScore
        );

        technicalBar.style.width =
            data.technicalScore + "%";

        behavioralBar.style.width =
            data.behavioralScore + "%";

        problemBar.style.width =
            data.problemScore + "%";

        readinessScore.textContent =
            data.confidenceScore;

        readinessText.textContent =
            String(
                data.confidenceText ||
                "RESEARCH COMPLETE"
            ).toUpperCase();

        renderSkills(data.focusAreas);
        renderQuestions(data.questions);

        recruiterLens.textContent =
            data.recruiterLens;

        companyOverview.textContent = data.overview || "No overview available.";
        companyIndustry.textContent = data.industry || "Not confirmed";
        companyHeadquarters.textContent = data.headquarters || "Not confirmed";
        companyFounded.textContent = data.founded || "Not confirmed";

        if (data.website) {
            companyWebsite.textContent = data.website.replace(/^https?:\/\//, "").replace(/\/$/, "");
            companyWebsite.href = data.website;
        } else {
            companyWebsite.textContent = "Not confirmed";
            companyWebsite.removeAttribute("href");
        }

        hiringProcess.innerHTML = "";
        (data.hiringProcess || []).forEach(step => {
            const item = document.createElement("li");
            item.textContent = step;
            hiringProcess.appendChild(item);
        });

        companySources.innerHTML = "";
        (data.sources || []).forEach(source => {
            const link = document.createElement("a");
            link.className = "source-link";
            link.href = source.url;
            link.target = "_blank";
            link.rel = "noopener";
            const title = document.createElement("strong");
            title.textContent = source.title || "Research source";
            const url = document.createElement("span");
            url.textContent = source.url;
            link.append(title, url);
            companySources.appendChild(link);
        });

        if (!companySources.children.length) {
            companySources.innerHTML = "<p>No live sources were returned.</p>";
        }

        analyzeBtn.innerHTML = `
            <span>COMPANY BRIEF READY &#10003;</span>
            <strong>&rarr;</strong>
        `;

        document
            .getElementById("insights")
            .scrollIntoView({
                behavior: "smooth"
            });

    } catch (error) {
        console.error(error);

        showToast(
            error.message === "Failed to fetch"
                ? "Research server is offline. Start backend/server.js and try again."
                : error.message || "Could not research this company.",
            "error"
        );

        analyzeBtn.innerHTML = `
            <span>TRY AGAIN</span>
            <strong>&rarr;</strong>
        `;
    }

    analyzeBtn.disabled = false;
});

document
    .querySelectorAll(".tab")
    .forEach(function (tab) {
        tab.addEventListener("click", function () {
            document
                .querySelectorAll(".tab")
                .forEach(function (button) {
                    button.classList.remove("active");
                });

            tab.classList.add("active");

            const filter = tab.dataset.filter;

            document
                .querySelectorAll(".question")
                .forEach(function (card) {
                    if (
                        filter === "all" ||
                        card.dataset.category === filter
                    ) {
                        card.style.display = "grid";
                    } else {
                        card.style.display = "none";
                    }
                });
        });
    });

document.addEventListener(
    "mousemove",
    function (event) {
        const glow =
            document.querySelector(".cursor-glow");

        if (!glow) return;

        glow.style.left = event.clientX + "px";
        glow.style.top = event.clientY + "px";
    }
);

const authButton =
    document.getElementById("authButton");

const authModal =
    document.getElementById("authModal");

const authOverlay =
    document.getElementById("authOverlay");

const authClose =
    document.getElementById("authClose");

const authForm =
    document.getElementById("authForm");

const authTitle =
    document.getElementById("authTitle");

const authSubtitle =
    document.getElementById("authSubtitle");

const authSwitch =
    document.getElementById("authSwitch");

const authSubmit =
    document.getElementById("authSubmit");

const authMessage =
    document.getElementById("authMessage");

const nameField =
    document.getElementById("nameField");

const googleAuth =
    document.getElementById("googleAuth");

const userGreeting =
    document.getElementById("userGreeting");

const userHello =
    document.getElementById("userHello");

const userAvatar =
    document.getElementById("userAvatar");

const userProfile =
    document.getElementById("userProfile");

const profileAvatar =
    document.getElementById("profileAvatar");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const userMenu = document.getElementById("userMenu");
const menuAvatar = document.getElementById("menuAvatar");
const menuName = document.getElementById("menuName");
const menuEmail = document.getElementById("menuEmail");
const viewProfileBtn = document.getElementById("viewProfileBtn");
const editProfileBtn = document.getElementById("editProfileBtn");
const menuLogoutBtn = document.getElementById("menuLogoutBtn");
const profileEditBtn = document.getElementById("profileEditBtn");
const profileRole = document.getElementById("profileRole");
const profileCollege = document.getElementById("profileCollege");
const profileSkills = document.getElementById("profileSkills");
const profileBio = document.getElementById("profileBio");
const profileModal = document.getElementById("profileModal");
const profileOverlay = document.getElementById("profileOverlay");
const profileClose = document.getElementById("profileClose");
const profileForm = document.getElementById("profileForm");
const profileMessage = document.getElementById("profileMessage");

let signUpMode = false;
let currentUser = null;

function openAuth() {
    authModal.classList.add("active");
}

function closeAuth() {
    authModal.classList.remove("active");
    authMessage.textContent = "";
}

authButton.addEventListener(
    "click",
    async function () {
        if (currentUser) {
            const { error } =
                await supabaseClient.auth.signOut();

            if (error) {
                alert(error.message);
            }

            return;
        }

        openAuth();
    }
);

authClose.addEventListener(
    "click",
    closeAuth
);

authOverlay.addEventListener(
    "click",
    closeAuth
);

authSwitch.addEventListener(
    "click",
    function () {
        signUpMode = !signUpMode;
        nameField.hidden = !signUpMode;

        authTitle.textContent =
            signUpMode
                ? "Create your account."
                : "Welcome back.";

        authSubtitle.textContent =
            signUpMode
                ? "Start preparing smarter with InternIQ."
                : "Sign in to continue your preparation.";

        authSubmit.textContent =
            signUpMode
                ? "CREATE ACCOUNT \u2192"
                : "SIGN IN \u2192";

        authSwitch.textContent =
            signUpMode
                ? "Already have an account? Sign in"
                : "New to InternIQ? Create an account";

        authMessage.textContent = "";
    }
);

authForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const email =
            document
                .getElementById("authEmail")
                .value
                .trim();

        const password =
            document
                .getElementById("authPassword")
                .value;

        const name =
            document
                .getElementById("authName")
                .value
                .trim();

        authSubmit.disabled = true;
        authMessage.textContent = "Please wait...";

        try {
            let result;

            if (signUpMode) {
                result =
                    await supabaseClient.auth.signUp({
                        email: email,
                        password: password,
                        options: {
                            emailRedirectTo:
                                window.location.origin +
                                "/frontend/index.html",
                            data: {
                                name: name
                            }
                        }
                    });
            } else {
                result =
                    await supabaseClient.auth
                        .signInWithPassword({
                            email: email,
                            password: password
                        });
            }

            if (result.error) {
                throw result.error;
            }

            if (
                signUpMode &&
                !result.data.session
            ) {
                authMessage.textContent =
                    "Verification sent. Check your newest email.";
                return;
            }

            closeAuth();
            authForm.reset();

        } catch (error) {
            authMessage.textContent =
                error.message ||
                "Authentication failed.";

        } finally {
            authSubmit.disabled = false;
        }
    }
);

googleAuth.addEventListener(
    "click",
    async function () {
        authMessage.textContent =
            "Opening Google...";

        const { error } =
            await supabaseClient.auth
                .signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo:
                            window.location.origin +
                            "/frontend/index.html"
                    }
                });

        if (error) {
            authMessage.textContent =
                error.message;
        }
    }
);

function updateUserInterface(session) {
    const user = session?.user || null;

    currentUser = user;

    if (!user) {
        authButton.textContent = "SIGN IN";
        userGreeting.hidden = true;
        userMenu.hidden = true;
        userProfile.hidden = true;
        return;
    }

    const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email.split("@")[0];

    const firstName =
        fullName.split(" ")[0];

    const avatar =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        "";

    authButton.textContent = "LOG OUT";

    userHello.textContent =
        "Hi, " + firstName;

    profileName.textContent =
        "Hi, " + fullName;

    profileEmail.textContent =
        user.email;

    menuName.textContent = fullName;
    menuEmail.textContent = user.email;
    profileRole.textContent = user.user_metadata?.role || "Not added yet";
    profileCollege.textContent = user.user_metadata?.college || "Not added yet";
    profileSkills.textContent = user.user_metadata?.skills || "Not added yet";
    profileBio.textContent = user.user_metadata?.bio || "Add a short introduction about yourself.";

    if (avatar) {
        userAvatar.src = avatar;
        profileAvatar.src = avatar;
        menuAvatar.src = avatar;

        userAvatar.hidden = false;
        profileAvatar.hidden = false;
        menuAvatar.hidden = false;
    } else {
        userAvatar.hidden = true;
        profileAvatar.hidden = true;
        menuAvatar.hidden = true;
    }

    userGreeting.hidden = false;
    userProfile.hidden = false;
    closeAuth();
}

supabaseClient.auth.onAuthStateChange(
    function (event, session) {
        updateUserInterface(session);
    }
);

async function restoreLoginSession() {
    const hash = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");

    if (accessToken && refreshToken) {
        await supabaseClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
        });
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const { data } = await supabaseClient.auth.getSession();
    updateUserInterface(data.session);
}

restoreLoginSession();

userGreeting.addEventListener("click", function (event) {
    event.stopPropagation();
    userMenu.hidden = !userMenu.hidden;
});

document.addEventListener("click", function () {
    userMenu.hidden = true;
});

userMenu.addEventListener("click", function (event) {
    event.stopPropagation();
});

viewProfileBtn.addEventListener("click", function () {
    userMenu.hidden = true;
    userProfile.scrollIntoView({ behavior: "smooth" });
});

function openProfileEditor() {
    const metadata = currentUser?.user_metadata || {};
    document.getElementById("editName").value = metadata.full_name || metadata.name || "";
    document.getElementById("editRole").value = metadata.role || "";
    document.getElementById("editCollege").value = metadata.college || "";
    document.getElementById("editSkills").value = metadata.skills || "";
    document.getElementById("editBio").value = metadata.bio || "";
    profileMessage.textContent = "";
    profileModal.classList.add("active");
    userMenu.hidden = true;
}

function closeProfileEditor() {
    profileModal.classList.remove("active");
}

editProfileBtn.addEventListener("click", openProfileEditor);
profileEditBtn.addEventListener("click", openProfileEditor);
profileClose.addEventListener("click", closeProfileEditor);
profileOverlay.addEventListener("click", closeProfileEditor);

menuLogoutBtn.addEventListener("click", async function () {
    await supabaseClient.auth.signOut();
    userMenu.hidden = true;
});

profileForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    profileMessage.textContent = "Saving...";

    const { data, error } = await supabaseClient.auth.updateUser({
        data: {
            full_name: document.getElementById("editName").value.trim(),
            role: document.getElementById("editRole").value.trim(),
            college: document.getElementById("editCollege").value.trim(),
            skills: document.getElementById("editSkills").value.trim(),
            bio: document.getElementById("editBio").value.trim()
        }
    });

    if (error) {
        profileMessage.textContent = error.message;
        return;
    }

    const { data: sessionData } = await supabaseClient.auth.getSession();
    updateUserInterface(sessionData.session);
    profileMessage.textContent = "Profile saved \u2713";
    setTimeout(closeProfileEditor, 700);
});

document.addEventListener(
    "keydown",
    function (event) {
        if (
            (event.ctrlKey || event.metaKey) &&
            event.code === "Space"
        ) {
            event.preventDefault();
            companyName.focus();
        }

        if (event.key === "Escape") {
            const questionModal =
                document.querySelector(
                    ".question-modal"
                );

            if (questionModal) {
                questionModal.remove();
            }

            if (authModal) {
                closeAuth();
            }
        }
    }
);
