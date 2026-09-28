const API_BASE_URL = window.location.protocol.startsWith("http")
    ? ""
    : "http://localhost:8090";

const accessToken = localStorage.getItem("toeicAccessToken");

if (!accessToken) {
    window.location.href = "login.html";
}

let tokenPayload = {};
try {
    tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
} catch (_) {
    window.location.href = "login.html";
}

if (tokenPayload.role !== "ADMIN") {
    alert("Khu vực quản trị chỉ dành cho tài khoản có quyền ADMIN.");
    window.location.href = "home.html";
}

const adminMessage = document.getElementById("adminMessage");
const usernameElement = document.getElementById("username");
const logoutBtn = document.getElementById("logoutBtn");

const savedUsername = localStorage.getItem("username") || tokenPayload.username || "Admin";
if (usernameElement) {
    usernameElement.textContent = `Quản trị viên: ${savedUsername}`;
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("toeicAccessToken");
        localStorage.removeItem("username");
        window.location.href = "login.html";
    });
}

function showMessage(message, isSuccess = false) {
    if (!adminMessage) return;
    adminMessage.textContent = message;
    adminMessage.className = isSuccess ? "auth-message success" : "auth-message error";
    if (message) {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================
   1. QUẢN LÝ TABS ĐIỀU HƯỚNG
========================================= */

const tabButtons = document.querySelectorAll(".admin-tab-btn");
const tabContents = document.querySelectorAll(".admin-tab-content");

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab;

        tabButtons.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));

        btn.classList.add("active");
        const targetElement = document.getElementById(targetTab);
        if (targetElement) {
            targetElement.classList.add("active");
        }
    });
});

/* =========================================
   2. QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG
========================================= */

const userTableBody = document.getElementById("userTableBody");
const createUserForm = document.getElementById("createUserForm");
const refreshUsersBtn = document.getElementById("refreshUsersBtn");
const editUserModal = document.getElementById("editUserModal");
const editUserForm = document.getElementById("editUserForm");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");

let cachedUsers = [];

async function loadUsers() {
    if (!userTableBody) return;
    userTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Đang tải danh sách tài khoản...</td></tr>`;

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            throw new Error(`Không thể lấy danh sách người dùng (${response.status})`);
        }

        const resData = await response.json();
        cachedUsers = resData.data || [];

        if (cachedUsers.length === 0) {
            userTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Chưa có tài khoản nào.</td></tr>`;
            return;
        }

        userTableBody.innerHTML = cachedUsers.map(user => {
            const isAdmin = user.role === "ADMIN";
            const targetRole = isAdmin ? "USER" : "ADMIN";

            return `
                <tr>
                    <td><strong>#${user.id}</strong></td>
                    <td><strong>${escapeHtml(user.username)}</strong></td>
                    <td>
                        <span class="role-badge ${isAdmin ? "admin-role" : "user-role"}">
                            ${isAdmin ? "👑 ADMIN" : "👤 USER"}
                        </span>
                    </td>
                    <td>
                        <button
                            type="button"
                            class="btn-sm btn-escalate-unsafe"
                            title="Chuyển đổi quyền người dùng"
                            onclick="changeUserRole(${user.id}, '${targetRole}')"
                        >
                            Chuyển thành ${targetRole}
                        </button>
                    </td>
                    <td>
                        <div class="btn-action-group">
                            <button
                                type="button"
                                class="btn-sm btn-edit"
                                onclick="openEditModal(${user.id})"
                            >
                                ✏ Sửa
                            </button>
                            <button
                                type="button"
                                class="btn-sm btn-delete"
                                onclick="deleteUser(${user.id}, '${escapeHtml(user.username)}')"
                            >
                                🗑 Xóa
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        console.error(err);
        userTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#dc2626; padding: 20px;">Lỗi: ${escapeHtml(err.message)}</td></tr>`;
    }
}

// Thay đổi Role người dùng (gọi endpoint để Burp Suite có thể bắt và sửa đổi)
window.changeUserRole = async function(userId, newRole) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/roleUnsafe`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ role: newRole })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || `Thao tác thất bại (${response.status})`);
        }

        showMessage(`Đã cập nhật quyền của User #${userId} thành [${newRole}]!`, true);
        await loadUsers();
    } catch (err) {
        showMessage(`Lỗi đổi quyền: ${err.message}`);
    }
};

// Mở modal sửa thông tin user
window.openEditModal = function(userId) {
    const user = cachedUsers.find(u => u.id === userId);
    if (!user) return;

    document.getElementById("editUserId").value = user.id;
    document.getElementById("editUsername").value = user.username;
    document.getElementById("editPassword").value = "";
    document.getElementById("editRole").value = user.role || "USER";

    if (editUserModal) {
        editUserModal.hidden = false;
        document.body.classList.add("modal-open");
    }
};

if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener("click", () => {
        if (editUserModal) {
            editUserModal.hidden = true;
            document.body.classList.remove("modal-open");
        }
    });
}

// Submit Form sửa User
if (editUserForm) {
    editUserForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userId = document.getElementById("editUserId").value;
        const username = document.getElementById("editUsername").value.trim();
        const password = document.getElementById("editPassword").value;
        const role = document.getElementById("editRole").value;

        try {
            const bodyPayload = { username, role };
            if (password) {
                bodyPayload.password = password;
            }

            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify(bodyPayload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || `Không thể cập nhật user (${response.status})`);
            }

            if (editUserModal) {
                editUserModal.hidden = true;
                document.body.classList.remove("modal-open");
            }

            showMessage(`Đã cập nhật thông tin tài khoản [${username}] thành công!`, true);
            await loadUsers();
        } catch (err) {
            alert(`Lỗi: ${err.message}`);
        }
    });
}

// Xóa User
window.deleteUser = async function(userId, username) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" (ID: ${userId})?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || `Xóa thất bại (${response.status})`);
        }

        showMessage(`Đã xóa tài khoản "${username}" thành công!`, true);
        await loadUsers();
    } catch (err) {
        showMessage(`Lỗi xóa user: ${err.message}`);
    }
};

// Form tạo User mới
if (createUserForm) {
    createUserForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("newUsername").value.trim();
        const password = document.getElementById("newPassword").value;
        const role = document.getElementById("newRole").value;

        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({ username, password, role })
            });

            if (!response.ok) {
                const errText = await response.text();
                let errMsg = errText;
                try {
                    const parsed = JSON.parse(errText);
                    errMsg = parsed.message || parsed.error || errText;
                } catch (_) {}
                throw new Error(errMsg || `Tạo thất bại (${response.status})`);
            }

            showMessage(`Tạo tài khoản [${username}] thành công!`, true);
            createUserForm.reset();
            await loadUsers();
        } catch (err) {
            showMessage(`Lỗi tạo user: ${err.message}`);
        }
    });
}

if (refreshUsersBtn) {
    refreshUsersBtn.addEventListener("click", () => {
        loadUsers();
        showMessage("Đã làm mới danh sách người dùng.", true);
    });
}

/* =========================================
   3. QUẢN LÝ ĐỀ THI & CÂU HỎI
========================================= */

const adminExamList = document.getElementById("adminExamList");

function normalizeCorrectAnswer(value) {
    const answer = String(value || "").trim().toUpperCase();
    if (!/^[A-D]$/.test(answer)) {
        throw new Error("Đáp án đúng phải là A, B, C hoặc D.");
    }
    return answer;
}

function readInlinePdfOptions(line, currentQuestion) {
    const optionMatches = [...line.matchAll(/\(([A-D])\)\s*([^()]*?)(?=\s+\([A-D]\)\s*|$)/gi)];
    if (optionMatches.length < 2 || !currentQuestion) {
        return false;
    }

    optionMatches.forEach((match) => {
        currentQuestion.options[match[1].toUpperCase()] = match[2].trim();
    });

    return true;
}

async function sendRequest(path, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(body)
    });

    const text = await response.text();
    let data = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch (error) {
        data = { message: text };
    }

    if (!response.ok) {
        throw new Error(data.message || data.error || `Thao tác thất bại (${response.status}).`);
    }

    return data;
}

async function loadAdminExams() {
    if (!adminExamList) return;

    try {
        const response = await fetch(`${API_BASE_URL}/exams`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            throw new Error("Không thể tải danh sách đề thi.");
        }

        const result = await response.json();
        const exams = result.data || [];

        if (!exams.length) {
            adminExamList.innerHTML = "<p>Hiện chưa có đề thi nào trong hệ thống.</p>";
            return;
        }

        adminExamList.innerHTML = exams.map((exam) => `
            <div class="exam-card">
                <h3>${escapeHtml(exam.title || `Đề thi ${exam.id}`)}</h3>
                <p>ID: <strong>${exam.id}</strong></p>
                <button type="button" class="btn-sm btn-delete delete-exam-button" data-exam-id="${exam.id}">
                    🗑 Xóa đề thi
                </button>
            </div>
        `).join("");
    } catch (err) {
        adminExamList.innerHTML = `<p style="color: #dc2626;">Lỗi tải đề thi: ${escapeHtml(err.message)}</p>`;
    }
}

if (adminExamList) {
    adminExamList.addEventListener("click", async (event) => {
        const deleteButton = event.target.closest(".delete-exam-button");
        if (!deleteButton) return;

        const examId = deleteButton.dataset.examId;
        if (!window.confirm(`Bạn có chắc muốn xóa đề thi ID ${examId}?`)) return;

        deleteButton.disabled = true;
        try {
            const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Xóa đề thi thất bại (${response.status}).`);
            }

            showMessage(`Đã xóa đề thi ID ${examId}.`, true);
            await loadAdminExams();
        } catch (error) {
            deleteButton.disabled = false;
            showMessage(error.message || "Không thể xóa đề thi.");
        }
    });
}

const examForm = document.getElementById("examForm");
if (examForm) {
    examForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
            const result = await sendRequest("/exams", {
                title: document.getElementById("examTitle").value.trim(),
                description: document.getElementById("examDescription").value.trim()
            });
            const examId = result.data && result.data.id;
            showMessage(`Đã tạo đề thi${examId ? `, ID là ${examId}` : ""}.`, true);
            event.target.reset();
            await loadAdminExams();
        } catch (error) {
            showMessage(error.message);
        }
    });
}

const questionForm = document.getElementById("questionForm");
if (questionForm) {
    questionForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
            const examId = Number(document.getElementById("questionExamId").value);
            const questionNumber = Number(document.getElementById("questionNumber").value);

            await sendRequest("/questions", {
                examId,
                questionNumber,
                content: document.getElementById("questionContent").value.trim(),
                optionA: document.getElementById("optionA").value.trim(),
                optionB: document.getElementById("optionB").value.trim(),
                optionC: document.getElementById("optionC").value.trim(),
                optionD: document.getElementById("optionD").value.trim()
            });
            await sendRequest("/exam-answers", {
                examId,
                questionNumber,
                correctAnswer: normalizeCorrectAnswer(document.getElementById("correctAnswer").value),
                explanation: ""
            });
            showMessage("Đã thêm câu hỏi vào đề thi thành công.", true);
            questionForm.reset();
        } catch (error) {
            showMessage(error.message);
        }
    });
}

function parseWordQuestions(rawText) {
    const lines = rawText
        .replace(/\r/g, "")
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    const questions = [];
    let currentQuestion = null;

    const flushQuestion = () => {
        if (!currentQuestion) return;
        const { questionNumber, content, options } = currentQuestion;
        const normalized = {
            questionNumber,
            content: content.trim(),
            optionA: (options.A || "").trim(),
            optionB: (options.B || "").trim(),
            optionC: (options.C || "").trim(),
            optionD: (options.D || "").trim(),
            correctAnswer: currentQuestion.correctAnswer || "",
        };

        if (normalized.content && normalized.optionA && normalized.optionB && normalized.optionC && normalized.optionD) {
            questions.push(normalized);
        }
        currentQuestion = null;
    };

    for (const line of lines) {
        const questionMatch = line.match(/^(?:Câu|Question|Q|QUESTION)\s*(\d+)[.:\-\s]*(.*)$/i) ||
            line.match(/^(\d+)[.):\-]\s*(.*)$/);

        if (questionMatch) {
            flushQuestion();
            const questionNumber = Number(questionMatch[1]);
            const content = (questionMatch[2] || "").trim();
            currentQuestion = {
                questionNumber,
                content,
                options: {},
            };
            continue;
        }

        if (readInlinePdfOptions(line, currentQuestion)) {
            continue;
        }

        const optionMatch = line.match(/^\(?([A-D])\)?[.):\-]?\s+(.*)$/i);
        if (optionMatch && currentQuestion) {
            const optionKey = optionMatch[1].toUpperCase();
            currentQuestion.options[optionKey] = optionMatch[2] || "";
            continue;
        }

        const answerMatch = line.match(/^(?:Đáp án đúng|Đáp án|Answer|Correct answer|ĐA)\s*[:\-]?\s*\(?([A-D])\)?\b/i);
        if (answerMatch && currentQuestion) {
            currentQuestion.correctAnswer = answerMatch[1].toUpperCase();
            continue;
        }

        if (currentQuestion) {
            if (!currentQuestion.content) {
                currentQuestion.content = line;
            } else {
                currentQuestion.content += ` ${line}`;
            }
        }
    }

    flushQuestion();
    return questions;
}

async function extractPdfText(arrayBuffer) {
    if (!window.pdfjsLib) {
        throw new Error("Chưa tải được thư viện đọc PDF. Hãy kiểm tra kết nối mạng và tải lại trang.");
    }

    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageLines = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const items = textContent.items
            .filter((item) => item.str && item.str.trim())
            .map((item) => ({
                text: item.str.trim(),
                x: item.transform[4],
                y: item.transform[5]
            }))
            .sort((first, second) => second.y - first.y || first.x - second.x);

        const lines = [];
        for (const item of items) {
            const lastLine = lines[lines.length - 1];
            if (!lastLine || Math.abs(lastLine.y - item.y) > 3) {
                lines.push({ y: item.y, text: item.text });
            } else {
                lastLine.text += ` ${item.text}`;
            }
        }

        pageLines.push(lines.map((line) => line.text).join("\n"));
    }

    return pageLines.join("\n");
}

async function importParsedQuestions(questions, examId, sourceName) {
    if (!questions.length) {
        throw new Error(`Không trích xuất được câu hỏi từ ${sourceName}. Hãy kiểm tra định dạng.`);
    }

    if (!examId) {
        throw new Error("Vui lòng nhập ID đề thi đúng.");
    }

    let missingAnswerCount = 0;
    for (let index = 0; index < questions.length; index += 1) {
        const question = questions[index];
        await sendRequest("/questions", {
            examId,
            questionNumber: Number(question.questionNumber),
            content: question.content,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD
        });
        if (question.correctAnswer) {
            await sendRequest("/exam-answers", {
                examId,
                questionNumber: Number(question.questionNumber),
                correctAnswer: normalizeCorrectAnswer(question.correctAnswer),
                explanation: question.explanation || ""
            });
        } else {
            missingAnswerCount += 1;
        }
        showMessage(`Đang nhập ${index + 1}/${questions.length} câu hỏi...`);
    }

    const answerMessage = missingAnswerCount
        ? ` Chưa có đáp án đúng cho ${missingAnswerCount} câu.`
        : "";
    showMessage(`Đã nhập ${questions.length} câu hỏi từ ${sourceName}.${answerMessage}`, true);
}

const uploadPdfBtn = document.getElementById("uploadPdfBtn");
if (uploadPdfBtn) {
    uploadPdfBtn.addEventListener("click", async () => {
        const fileInput = document.getElementById("pdfFileInput");
        const file = fileInput.files && fileInput.files[0];

        try {
            if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
                throw new Error("Vui lòng chọn file PDF.");
            }

            const examId = Number(document.getElementById("pdfExamId").value);
            const text = await extractPdfText(await file.arrayBuffer());
            await importParsedQuestions(parseWordQuestions(text), examId, "file PDF");
        } catch (error) {
            showMessage(error.message || "Không thể đọc file PDF.");
        }
    });
}

/* =========================================
   KHỞI ĐỘNG TRANG ADMIN
========================================= */

loadUsers();
loadAdminExams().catch((error) => showMessage(error.message));
