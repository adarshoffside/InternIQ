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
const targetRole = document.getElementById("targetRole");
const experienceLevel = document.getElementById("experienceLevel");
const jobDescription = document.getElementById("jobDescription");
const jdCount = document.getElementById("jdCount");
const companyCard = document.querySelector(".company-card");
const companyPresets = document.querySelectorAll("[data-company]");

const roleName = document.getElementById("roleName");
const roleType = document.getElementById("roleType");

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
const difficultyFilter = document.getElementById("difficultyFilter");
const jobAnalysisCard = document.getElementById("jobAnalysisCard");
const detectedRole = document.getElementById("detectedRole");
const jobSummary = document.getElementById("jobSummary");
const jobRequirements = document.getElementById("jobRequirements");
const progressDashboard = document.getElementById("progressDashboard");
const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");
const preparedCount = document.getElementById("preparedCount");
const practicedCount = document.getElementById("practicedCount");
const totalTracked = document.getElementById("totalTracked");
const progressEmpty = document.getElementById("progressEmpty");
const toast = document.getElementById("toast");
let toastTimer;
let latestCompany = "";
let latestRole = "";
let latestExperience = "";
let latestQuestions = [];
let mockQuestionIndex = 0;
let pendingFollowUp = "";
let trackedQuestions = new Map();

const startMockBtn = document.getElementById("startMockBtn");
const mockModal = document.getElementById("mockModal");
const mockOverlay = document.getElementById("mockOverlay");
const mockClose = document.getElementById("mockClose");
const mockForm = document.getElementById("mockForm");
const mockQuestion = document.getElementById("mockQuestion");
const mockProgress = document.getElementById("mockProgress");
const mockAnswer = document.getElementById("mockAnswer");
const mockMessage = document.getElementById("mockMessage");
const mockResult = document.getElementById("mockResult");
const analyzeAnswerBtn = document.getElementById("analyzeAnswerBtn");
const nextMockBtn = document.getElementById("nextMockBtn");

const questionsSection = document.getElementById("questions");
const intelligenceSection = document.getElementById("insights");
intelligenceSection.parentNode.insertBefore(questionsSection, intelligenceSection);

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

jobDescription.addEventListener("input", function () {
    jdCount.textContent = `${jobDescription.value.length.toLocaleString()} / 20,000`;
});

function resetDashboard() {
    roleName.textContent = "Waiting for company...";
    roleType.textContent = "Enter a company above to begin live research";

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
    jobAnalysisCard.hidden = true;
    detectedRole.textContent = "\u2014";
    jobSummary.textContent = "\u2014";
    jobRequirements.innerHTML = "";
    hiringProcess.innerHTML = "<li>Waiting for company research</li>";
    companySources.innerHTML = "<p>Source links will appear after research.</p>";
    latestCompany = "";
    latestRole = "";
    latestExperience = "";
    latestQuestions = [];
    startMockBtn.disabled = true;

    questionList.innerHTML = `
        <div class="empty-question">
            <span>WAITING FOR COMPANY</span>
            <h3>Your interview map is empty.</h3>
            <p>Enter a company above and build its intelligence brief.</p>
        </div>
    `;
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
        card.dataset.difficulty = question.difficulty || "mid";

        const whyTheyAsk = question.signal ||
            "This checks your reasoning, communication and fit for the company's work.";
        const howToAnswer = question.answerGuide ||
            "Explain your approach, support it with a real example and finish with the result or lesson learned.";
        const difficulty = question.difficulty || "mid";
        const difficultyName = { low: "FOUNDATION", mid: "INTERMEDIATE", high: "ADVANCED" }[difficulty] || "INTERMEDIATE";
        const saved = trackedQuestions.has(question.question);

        card.innerHTML = `
            <span class="question-number">
                ${String(index + 1).padStart(2, "0")}
            </span>

            <div>
                <small class="${question.type}">
                    ${question.type.toUpperCase()} &middot; AI GENERATED
                </small>

                <div class="question-actions">
                    <span class="difficulty-badge ${difficulty}">${difficultyName}</span>
                    <button type="button" class="track-question-btn ${saved ? "saved" : ""}">
                        ${saved ? "PREPARED \u2713" : "MARK PREPARED"}
                    </button>
                </div>

                <h3>${question.question}</h3>

                <div class="question-guidance">
                    <div>
                        <label>WHY THEY ASK</label>
                        <p>${whyTheyAsk}</p>
                    </div>
                    <div>
                        <label>HOW TO ANSWER</label>
                        <p>${howToAnswer}</p>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener("click", function () {
            openQuestion(question);
        });

        card.querySelector(".track-question-btn").addEventListener("click", function (event) {
            event.stopPropagation();
            toggleQuestionProgress(question);
        });

        questionList.appendChild(card);
    });

    applyQuestionFilters();
}

function applyQuestionFilters() {
    const category = document.querySelector(".tab.active")?.dataset.filter || "all";
    const difficulty = difficultyFilter?.value || "all";
    document.querySelectorAll(".question").forEach(function (card) {
        const categoryMatch = category === "all" || card.dataset.category === category;
        const difficultyMatch = difficulty === "all" || card.dataset.difficulty === difficulty;
        card.style.display = categoryMatch && difficultyMatch ? "grid" : "none";
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
                <label>WHY THEY ASK</label>

                <p>
                    ${
                        question.signal ||
                        "Your knowledge, reasoning and communication."
                    }
                </p>
            </div>

            <div class="modal-block">
                <label>HOW TO ANSWER</label>

                <p>
                    ${question.answerGuide || "Explain your approach clearly, provide an example and finish with the result or lesson learned."}
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
    const role = targetRole.value.trim();
    const experience = experienceLevel.value;
    const description = jobDescription.value.trim();

    if (company.length < 2) {
        companyCard.classList.remove("invalid");
        void companyCard.offsetWidth;
        companyCard.classList.add("invalid");
        companyName.focus();
        showToast("Enter the company you are preparing for.", "error");
        return;
    }

    if (role.length < 2) {
        targetRole.focus();
        showToast("Enter the role you are preparing for.", "error");
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
                    companyName: company,
                    targetRole: role,
                    experienceLevel: experience,
                    jobDescription: description
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
            `${role} \u00B7 ${experienceLevel.options[experienceLevel.selectedIndex].text} \u00B7 ${data.industry || "Company intelligence"}`;

        latestCompany = data.companyName || company;
        latestRole = role;
        latestExperience = experience;
        latestQuestions = Array.isArray(data.questions) ? data.questions : [];
        renderSkills(data.focusAreas);
        renderQuestions(latestQuestions);
        updateProgressUI();
        startMockBtn.disabled = latestQuestions.length === 0;

        recruiterLens.textContent =
            data.recruiterLens;

        companyOverview.textContent = data.overview || "No overview available.";
        companyIndustry.textContent = data.industry || "Not confirmed";
        companyHeadquarters.textContent = data.headquarters || "Not confirmed";
        companyFounded.textContent = data.founded || "Not confirmed";

        if (data.jobDescriptionInsights) {
            jobAnalysisCard.hidden = false;
            detectedRole.textContent = data.jobDescriptionInsights.detectedRole || role;
            jobSummary.textContent = data.jobDescriptionInsights.summary || "Role-specific requirements detected.";
            jobRequirements.innerHTML = "";
            [...(data.jobDescriptionInsights.priorityRequirements || []), ...(data.jobDescriptionInsights.keywords || [])]
                .slice(0, 14)
                .forEach(function (requirement) {
                    const tag = document.createElement("span");
                    tag.textContent = requirement;
                    jobRequirements.appendChild(tag);
                });
        } else {
            jobAnalysisCard.hidden = true;
        }

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
            .getElementById("questions")
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

function showMockQuestion() {
    const item = latestQuestions[mockQuestionIndex];
    if (!item) return;

    mockProgress.textContent = `QUESTION ${mockQuestionIndex + 1} OF ${latestQuestions.length} · ${String(item.type || "interview").toUpperCase()}`;
    mockQuestion.textContent = item.question;
    mockAnswer.value = "";
    mockMessage.textContent = "";
    mockResult.hidden = true;
    mockForm.hidden = false;
}

function openMockInterview() {
    if (!latestQuestions.length) {
        showToast("Research a company before starting the mock interview.", "error");
        return;
    }

    mockQuestionIndex = 0;
    pendingFollowUp = "";
    showMockQuestion();
    mockModal.classList.add("active");
    mockModal.setAttribute("aria-hidden", "false");
}

function closeMockInterview() {
    mockModal.classList.remove("active");
    mockModal.setAttribute("aria-hidden", "true");
}

startMockBtn.addEventListener("click", openMockInterview);
mockClose.addEventListener("click", closeMockInterview);
mockOverlay.addEventListener("click", closeMockInterview);

mockForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const answer = mockAnswer.value.trim();
    const item = latestQuestions[mockQuestionIndex];

    if (answer.length < 20) {
        mockMessage.textContent = "Write a slightly longer answer before analysis.";
        return;
    }

    analyzeAnswerBtn.disabled = true;
    analyzeAnswerBtn.textContent = "ANALYZING ANSWER...";
    mockMessage.textContent = "";

    try {
        const response = await fetch("http://localhost:3000/api/mock-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                companyName: latestCompany,
                targetRole: latestRole,
                experienceLevel: latestExperience,
                question: item.question,
                questionType: item.type,
                expectedSignal: item.signal,
                answer
            })
        });
        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(
                "The running backend is outdated. Restart backend/server.js."
            );
        }

        if (!response.ok) {
            throw new Error(data.error || "Answer analysis failed.");
        }

        document.getElementById("mockStrengths").textContent = data.strengths;
        document.getElementById("mockImprovements").textContent = data.improvements;
        document.getElementById("mockBetterAnswer").textContent = data.betterAnswerPlan;
        pendingFollowUp = item.type === "follow-up" ? "" : (data.followUpQuestion || "");
        document.getElementById("mockFollowUp").textContent = pendingFollowUp || "Continue to the next prepared question.";
        document.getElementById("adaptiveFollowup").hidden = !pendingFollowUp;
        nextMockBtn.textContent = pendingFollowUp ? "ANSWER FOLLOW-UP \u2192" : "NEXT QUESTION \u2192";
        mockForm.hidden = true;
        mockResult.hidden = false;
        if (currentUser) await saveQuestionStatus(item, "practiced");
    } catch (error) {
        mockMessage.textContent = error.message === "Failed to fetch"
            ? "AI server is offline. Start backend/server.js."
            : error.message;
    } finally {
        analyzeAnswerBtn.disabled = false;
        analyzeAnswerBtn.textContent = "ANALYZE MY ANSWER →";
    }
});

nextMockBtn.addEventListener("click", function () {
    if (pendingFollowUp) {
        latestQuestions.splice(mockQuestionIndex + 1, 0, {
            type: "follow-up",
            question: pendingFollowUp,
            signal: "Adaptive follow-up based on your previous answer"
        });
        pendingFollowUp = "";
    }

    mockQuestionIndex = (mockQuestionIndex + 1) % latestQuestions.length;
    showMockQuestion();
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
            applyQuestionFilters();
        });
    });

difficultyFilter.addEventListener("change", applyQuestionFilters);

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

function updateProgressUI() {
    const rows = [...trackedQuestions.values()];
    const prepared = rows.filter(row => row.status === "prepared").length;
    const practiced = rows.filter(row => row.status === "practiced").length;
    const currentPrepared = latestQuestions.length
        ? latestQuestions.filter(question => trackedQuestions.has(question.question)).length
        : 0;
    const percent = latestQuestions.length ? Math.round((currentPrepared / latestQuestions.length) * 100) : 0;
    preparedCount.textContent = prepared;
    practicedCount.textContent = practiced;
    totalTracked.textContent = rows.length;
    progressPercent.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
    progressEmpty.hidden = rows.length > 0;
}

async function loadPreparationProgress() {
    if (!currentUser) {
        trackedQuestions.clear();
        progressDashboard.hidden = true;
        return;
    }
    progressDashboard.hidden = false;
    const { data, error } = await supabaseClient.from("preparation_progress")
        .select("*").eq("user_id", currentUser.id).order("updated_at", { ascending: false });
    if (error) {
        progressEmpty.hidden = false;
        progressEmpty.textContent = "Run the provided Supabase setup SQL once to enable progress tracking.";
        return;
    }
    trackedQuestions = new Map((data || []).map(row => [row.question_text, row]));
    progressEmpty.textContent = "Research a company and mark questions as prepared to begin tracking.";
    updateProgressUI();
    if (latestQuestions.length) renderQuestions(latestQuestions);
}

async function saveQuestionStatus(question, status) {
    if (!currentUser) {
        openAuth();
        showToast("Sign in to save your preparation progress.", "error");
        return;
    }
    const payload = {
        user_id: currentUser.id,
        company_name: latestCompany || companyName.value.trim(),
        target_role: latestRole || targetRole.value.trim(),
        question_text: question.question,
        question_type: question.type || "technical",
        difficulty: question.difficulty || "mid",
        status,
        updated_at: new Date().toISOString()
    };
    const { error } = await supabaseClient.from("preparation_progress")
        .upsert(payload, { onConflict: "user_id,company_name,target_role,question_text" });
    if (error) {
        showToast(error.message, "error");
        return;
    }
    trackedQuestions.set(question.question, payload);
    updateProgressUI();
    renderQuestions(latestQuestions);
    showToast(status === "practiced" ? "Practice saved to your account." : "Question marked as prepared.");
}

async function toggleQuestionProgress(question) {
    if (!currentUser) {
        openAuth();
        showToast("Sign in to track your preparation.", "error");
        return;
    }
    const saved = trackedQuestions.get(question.question);
    if (!saved) return saveQuestionStatus(question, "prepared");
    const { error } = await supabaseClient.from("preparation_progress").delete()
        .eq("user_id", currentUser.id)
        .eq("company_name", saved.company_name)
        .eq("target_role", saved.target_role)
        .eq("question_text", question.question);
    if (error) {
        showToast(error.message, "error");
        return;
    }
    trackedQuestions.delete(question.question);
    updateProgressUI();
    renderQuestions(latestQuestions);
    showToast("Question removed from your tracker.");
}

function getAuthRedirectUrl() {
    return window.location.origin + window.location.pathname;
}

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
                                getAuthRedirectUrl(),
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
                        redirectTo: getAuthRedirectUrl()
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
        progressDashboard.hidden = true;
        trackedQuestions.clear();
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
    userProfile.hidden = true;
    progressDashboard.hidden = false;
    loadPreparationProgress();
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
    window.location.href = "profile.html";
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

editProfileBtn.addEventListener("click", function () {
    window.location.href = "profile.html?edit=1";
});
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
