const loginView = document.getElementById("loginView");
const appView = document.getElementById("appView");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");
const showLoginTab = document.getElementById("showLoginTab");
const showRegisterTab = document.getElementById("showRegisterTab");
const logoutButton = document.getElementById("logoutButton");
const refreshSessionButton = document.getElementById("refreshSessionButton");
const loadUsersButton = document.getElementById("loadUsersButton");
const loadAnswersButton = document.getElementById("loadAnswersButton");
const examWorkspace = document.getElementById("examWorkspace");
const examForm = document.getElementById("examForm");
const examMessage = document.getElementById("examMessage");
const closeExamButton = document.getElementById("closeExamButton");
const demoSearchKeyword = document.getElementById("demoSearchKeyword");
const unsafeSearchButton = document.getElementById("unsafeSearchButton");
const demoSearchResult = document.getElementById("demoSearchResult");

const LOGIN_ENDPOINT = "/api/auth/loginUnsafe";

let accessToken = localStorage.getItem("toeicAccessToken") || "";
let currentUser = null;
let currentExam = null;
let currentQuestions = [];

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideAuthMessage();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
        const data = await apiRequest(LOGIN_ENDPOINT, {
            method: "POST",
            body: JSON.stringify({ username, password }),
            includeAuth: false
        });

        setToken(data.token);
        await loadCurrentUser();
        await loadDashboard();
    } catch (error) {
        showAuthMessage(error.message || "Dang nhap khong thanh cong.", "danger");
    }
});

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideAuthMessage();

    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value;

    try {
        await apiRequest("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ username, password }),
            includeAuth: false
        });

        document.getElementById("username").value = username;
        document.getElementById("password").value = "";
        registerForm.reset();
        showLoginForm();
        showAuthMessage("Tao tai khoan thanh cong. Hay dang nhap de vao phong luyen thi.", "success");
    } catch (error) {
        showAuthMessage(error.message || "Dang ky khong thanh cong.", "danger");
    }
});

showLoginTab.addEventListener("click", showLoginForm);
showRegisterTab.addEventListener("click", showRegisterForm);

logoutButton.addEventListener("click", function () {
    localStorage.removeItem("toeicAccessToken");
    accessToken = "";
    currentUser = null;
    showLogin();
});

refreshSessionButton.addEventListener("click", async function () {
    try {
        const data = await apiRequest("/api/auth/refresh", {
            method: "POST"
        });

        setToken(data.token);
        await loadCurrentUser();
        await loadDashboard();
    } catch (error) {
        showLogin();
    }
});

loadUsersButton.addEventListener("click", loadUsers);
loadAnswersButton.addEventListener("click", loadExamAnswers);
closeExamButton.addEventListener("click", closeExam);
examForm.addEventListener("submit", submitExam);
unsafeSearchButton.addEventListener("click", searchExamDemo);

window.addEventListener("load", async function () {
    if (!accessToken) {
        showLogin();
        return;
    }

    try {
        await loadCurrentUser();
        await loadDashboard();
    } catch (error) {
        showLogin();
    }
});

async function loadCurrentUser() {
    currentUser = await apiRequest("/api/auth/me");
    document.getElementById("accountId").textContent = currentUser.id;
    document.getElementById("accountUsername").textContent = currentUser.username;
    document.getElementById("navUser").textContent = currentUser.username;
    document.getElementById("navUser").classList.remove("d-none");
    logoutButton.classList.remove("d-none");
}

async function loadDashboard() {
    showApp();
    await Promise.all([loadExams(), loadMyResults()]);

    const adminPanel = document.getElementById("adminPanel");
    if (currentUser && currentUser.role === "ADMIN") {
        adminPanel.classList.remove("d-none");
    } else {
        adminPanel.classList.add("d-none");
    }
}

async function loadExams() {
    const examList = document.getElementById("examList");
    examList.innerHTML = "";

    try {
        const response = await apiRequest("/exams");
        const exams = response.data || response || [];

        if (!Array.isArray(exams) || exams.length === 0) {
            examList.innerHTML = `<p class="empty-state">Chua co de thi nao dang mo.</p>`;
            return;
        }

        examList.innerHTML = exams.map((exam) => `
            <article class="exam-card">
                <div>
                    <h3 class="h6 mb-0">${escapeHtml(exam.title || "TOEIC Practice Test")}</h3>
                    <p class="text-muted mt-2 mb-0">${escapeHtml(exam.description || "Bai thi luyen tap TOEIC.")}</p>
                    <div class="exam-meta">
                        <span>Reading</span>
                        <span>Listening</span>
                    </div>
                </div>
                <button class="btn btn-outline-primary btn-sm start-exam-button" type="button" data-exam-id="${exam.id}">
                    Bat dau lam bai
                </button>
            </article>
        `).join("");

        examList.querySelectorAll(".start-exam-button").forEach((button) => {
            button.addEventListener("click", () => {
                const exam = exams.find((item) => String(item.id) === button.dataset.examId);
                startExam(exam);
            });
        });
    } catch (error) {
        examList.innerHTML = `<p class="empty-state">Khong tai duoc danh sach de thi.</p>`;
    }
}

async function startExam(exam) {
    if (!exam || !exam.id) {
        return;
    }

    currentExam = exam;
    currentQuestions = [];
    document.getElementById("activeExamTitle").textContent = exam.title || "TOEIC Practice Test";
    hideExamMessage();
    examWorkspace.classList.remove("d-none");
    examForm.innerHTML = `<p class="empty-state">Dang tai cau hoi...</p>`;

    try {
        const response = await apiRequest(`/questions/exam/${exam.id}`);
        currentQuestions = response.data || response || [];

        if (!Array.isArray(currentQuestions) || currentQuestions.length === 0) {
            examForm.innerHTML = `<p class="empty-state">De thi nay chua co cau hoi.</p>`;
            return;
        }

        examForm.innerHTML = `
            ${currentQuestions.map(renderQuestion).join("")}
            <div class="exam-actions">
                <span class="text-muted small">${currentQuestions.length} cau hoi</span>
                <button class="btn btn-primary" type="submit">Nop bai</button>
            </div>
        `;
        examWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
        examForm.innerHTML = "";
        showExamMessage(error.message || "Khong tai duoc cau hoi.", "danger");
    }
}

function renderQuestion(question) {
    const questionNumber = question.questionNumber;
    const options = [
        ["A", question.optionA],
        ["B", question.optionB],
        ["C", question.optionC],
        ["D", question.optionD]
    ];

    return `
        <fieldset class="question-card">
            <legend>Cau ${questionNumber}: ${escapeHtml(question.content || "")}</legend>
            <div class="answer-options">
                ${options.map(([value, label]) => `
                    <label class="answer-option">
                        <input class="form-check-input" type="radio" name="question-${questionNumber}" value="${value}" required>
                        <span>${escapeHtml(label || value)}</span>
                    </label>
                `).join("")}
            </div>
        </fieldset>
    `;
}

async function submitExam(event) {
    event.preventDefault();
    hideExamMessage();

    if (!currentExam || !currentExam.id || currentQuestions.length === 0) {
        showExamMessage("Chua co bai thi de nop.", "danger");
        return;
    }

    const answers = currentQuestions.map((question) => {
        const selected = examForm.querySelector(`input[name="question-${question.questionNumber}"]:checked`);
        return {
            questionNumber: question.questionNumber,
            selectedAnswer: selected ? selected.value : ""
        };
    });

    if (answers.some((answer) => !answer.selectedAnswer)) {
        showExamMessage("Hay tra loi tat ca cau hoi truoc khi nop bai.", "warning");
        return;
    }

    try {
        const response = await apiRequest("/exam-results/submit", {
            method: "POST",
            body: JSON.stringify({
                examId: currentExam.id,
                answers
            })
        });
        const result = response.data || response;
        showExamMessage(
            `Da nop bai. Diem: ${result.score || 0} - dung ${result.correctCount || 0}/${result.totalQuestions || 0} cau.`,
            "success"
        );
        await loadMyResults();
    } catch (error) {
        showExamMessage(error.message || "Nop bai khong thanh cong.", "danger");
    }
}

function closeExam() {
    currentExam = null;
    currentQuestions = [];
    examForm.innerHTML = "";
    hideExamMessage();
    examWorkspace.classList.add("d-none");
}

async function loadMyResults() {
    const resultList = document.getElementById("resultList");
    resultList.innerHTML = "";

    try {
        const response = await apiRequest("/exam-results/me");
        const results = response.data || response || [];

        if (!Array.isArray(results) || results.length === 0) {
            resultList.innerHTML = `<p class="empty-state">Ban chua co ket qua nao.</p>`;
            return;
        }

        resultList.innerHTML = results.slice(0, 4).map((result) => `
            <div class="result-item">
                <strong>${escapeHtml(result.examTitle || "TOEIC Practice Test")}</strong>
                <span>${result.score || 0} diem - ${result.correctCount || 0}/${result.totalQuestions || 0} cau dung</span>
            </div>
        `).join("");
    } catch (error) {
        resultList.innerHTML = `<p class="empty-state">Khong tai duoc ket qua gan day.</p>`;
    }
}

async function loadUsers() {
    const adminContent = document.getElementById("adminContent");
    adminContent.innerHTML = `<p class="empty-state">Dang tai danh sach hoc vien...</p>`;

    try {
        const response = await apiRequest("/users");
        const users = response.data || response || [];

        adminContent.innerHTML = `
            <table class="table table-sm align-middle">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ten dang nhap</th>
                        <th>Vai tro</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map((user) => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${escapeHtml(user.username)}</td>
                            <td>${escapeHtml(user.role)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    } catch (error) {
        adminContent.innerHTML = `<p class="empty-state">Tai khoan hien tai khong co quyen xem danh sach hoc vien.</p>`;
    }
}

async function loadExamAnswers() {
    const adminContent = document.getElementById("adminContent");
    adminContent.innerHTML = `<p class="empty-state">Dang tai ngan hang dap an...</p>`;

    try {
        const response = await apiRequest("/exam-answers");
        const answers = response.data || response || [];

        adminContent.innerHTML = `
            <table class="table table-sm align-middle">
                <thead>
                    <tr>
                        <th>De thi</th>
                        <th>Cau</th>
                        <th>Dap an</th>
                        <th>Giai thich</th>
                    </tr>
                </thead>
                <tbody>
                    ${answers.map((answer) => `
                        <tr>
                            <td>${escapeHtml(answer.examTitle || "")}</td>
                            <td>${answer.questionNumber}</td>
                            <td>${escapeHtml(answer.correctAnswer || "")}</td>
                            <td>${escapeHtml(answer.explanation || "")}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    } catch (error) {
        adminContent.innerHTML = `<p class="empty-state">Tai khoan hien tai khong co quyen xem ngan hang dap an.</p>`;
    }
}

async function searchExamDemo() {
    const keyword = demoSearchKeyword.value;
    const url = `/api/exams/searchUnsafe?keyword=${encodeURIComponent(keyword)}`;

    demoSearchResult.innerHTML = `<p class="empty-state">Dang tim kiem...</p>`;

    try {
        const data = await apiRequest(url);
        const results = Array.isArray(data) ? data : [];

        if (results.length === 0) {
            demoSearchResult.innerHTML = `<p class="empty-state">Khong tim thay de thi phu hop.</p>`;
            return;
        }

        demoSearchResult.innerHTML = results.map((exam) => `
            <div class="result-item">
                <strong>${escapeHtml(exam.title || "")}</strong>
            </div>
        `).join("");
    } catch (error) {
        demoSearchResult.innerHTML = `<p class="empty-state">Tim kiem khong thanh cong.</p>`;
    }
}

async function apiRequest(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (options.includeAuth !== false && accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(path, {
        method: options.method || "GET",
        headers,
        body: options.body
    });

    let data = null;
    const text = await response.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch (error) {
            data = text;
        }
    }

    if (!response.ok) {
        const serverMessage = data && data.message ? data.message : text;
        throw new Error(`${response.status} ${response.statusText}${serverMessage ? ` - ${serverMessage}` : ""}`);
    }

    return data;
}

function setToken(token) {
    accessToken = token;
    localStorage.setItem("toeicAccessToken", token);
}

function showLogin() {
    loginView.classList.remove("d-none");
    appView.classList.add("d-none");
    document.getElementById("navUser").classList.add("d-none");
    logoutButton.classList.add("d-none");
}

function showApp() {
    loginView.classList.add("d-none");
    appView.classList.remove("d-none");
}

function showLoginForm() {
    loginForm.classList.remove("d-none");
    registerForm.classList.add("d-none");
    showLoginTab.classList.add("active");
    showRegisterTab.classList.remove("active");
}

function showRegisterForm() {
    registerForm.classList.remove("d-none");
    loginForm.classList.add("d-none");
    showRegisterTab.classList.add("active");
    showLoginTab.classList.remove("active");
    hideAuthMessage();
}

function showAuthMessage(message, type) {
    authMessage.textContent = message;
    authMessage.className = `alert alert-${type} mt-3`;
}

function hideAuthMessage() {
    authMessage.className = "alert mt-3 d-none";
    authMessage.textContent = "";
}

function showExamMessage(message, type) {
    examMessage.textContent = message;
    examMessage.className = `alert alert-${type} mt-3`;
}

function hideExamMessage() {
    examMessage.className = "alert mt-3 d-none";
    examMessage.textContent = "";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
