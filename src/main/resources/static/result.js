const resultList = document.getElementById("resultList");
const resultMessage = document.getElementById("resultMessage");
const examFilter = document.getElementById("examFilter");
const statusFilter = document.getElementById("statusFilter");
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const filterButton = document.getElementById("filterButton");
const resetButton = document.getElementById("resetButton");
const navUsername = document.getElementById("navUsername");
const logoutButton = document.getElementById("logoutButton");

const profileUsername = document.getElementById("profileUsername");
const profileRole = document.getElementById("profileRole");

const accessToken = localStorage.getItem("toeicAccessToken") || "";

let tokenPayload = {};
try {
    tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
} catch (_) {}

const savedUsername = localStorage.getItem("username") || tokenPayload.username || "User";
const role = localStorage.getItem("role") || tokenPayload.role || "USER";

if (navUsername) {
    navUsername.innerHTML = `👤 <strong>${escapeHtml(savedUsername)}</strong> `;
}

const profileForm = document.getElementById("profileForm");
const profileUsernameInput = document.getElementById("profileUsernameInput");
const profileUpdateMessage = document.getElementById("profileUpdateMessage");

if (profileUsername) profileUsername.textContent = savedUsername;
if (profileUsernameInput) profileUsernameInput.value = savedUsername;

if (profileForm) {
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        profileUpdateMessage.textContent = "";

        try {
            const response = await fetch("/users/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({ username: profileUsernameInput.value.trim() })
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Không thể cập nhật hồ sơ.");
            }

            const updatedUsername = result.data.username;
            localStorage.setItem("username", updatedUsername);
            profileUsername.textContent = updatedUsername;
            navUsername.innerHTML = `👤 <strong>${escapeHtml(updatedUsername)}</strong> `;
            profileUpdateMessage.textContent = "Đã cập nhật hồ sơ.";
        } catch (error) {
            profileUpdateMessage.textContent = error.message;
        }
    });
}
if (profileRole) {
    profileRole.textContent = role;
    profileRole.className = `role-badge ${role === "ADMIN" ? "admin-role" : "user-role"}`;
}

if (logoutButton) {
    logoutButton.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("toeicAccessToken");
        localStorage.removeItem("username");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        window.location.href = "login.html";
    });
}

let results = [];

/* =========================
   HIỂN THỊ THÔNG BÁO
========================= */

function showMessage(message, type = "") {
    if (!resultMessage) return;

    resultMessage.textContent = message;
    resultMessage.className = `result-message ${type}`;
}

/* =========================
   FORMAT NGÀY GIỜ
========================= */

function formatDate(dateString) {
    if (!dateString) {
        return "--";
    }

    const date = new Date(dateString);

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

/* =========================
   TÍNH TRẠNG THÁI
========================= */

function getStatus(result) {
    if (result.correctCount === null || result.correctCount === undefined) {
        return "Đang làm";
    }

    return "Hoàn thành";
}

/* =========================
   HIỂN THỊ KẾT QUẢ
========================= */

function renderResults(data) {
    if (!resultList) return;

    if (!data || data.length === 0) {
        resultList.innerHTML = `
            <div class="empty-result">
                <h3>Chưa có lịch sử làm bài</h3>
                <p>Bạn chưa hoàn thành bài thi nào hoặc không có bài thi phù hợp bộ lọc.</p>
            </div>
        `;
        return;
    }

    resultList.innerHTML = data.map(result => {
        const status = getStatus(result);

        const percentage = result.totalQuestions > 0
            ? Math.round((result.correctCount / result.totalQuestions) * 100)
            : 0;

        return `
            <div class="result-card">
                <div>
                    <h2>${escapeHtml(result.examTitle || "Đề thi TOEIC")}</h2>

                    <div class="result-status ${status === "Hoàn thành" ? "completed" : "doing"}">
                        ${status === "Hoàn thành" ? "✓ Hoàn thành" : "⏳ Đang làm"}
                    </div>

                    <div class="score-box">
                        <div class="score-title">
                            <span>🏆 Điểm</span>
                            <strong>${result.score ?? 0}</strong>
                            <span>/10</span>
                        </div>

                        <div class="score-line"></div>

                        <div class="correct-info">
                            <span>Đúng: <strong>${result.correctCount ?? 0} / ${result.totalQuestions ?? 0}</strong> câu</span>
                            <span>${percentage}%</span>
                        </div>
                    </div>

                    <div class="result-info">
                        <p>
                            <span>🕒 Thời gian nộp:</span>
                            <strong>${formatDate(result.submittedAt)}</strong>
                        </p>
                        <p>
                            <span>📋 Tổng số câu:</span>
                            <strong>${result.totalQuestions ?? 0} câu</strong>
                        </p>
                        <p>
                            <span>✓ Số câu đúng:</span>
                            <strong>${result.correctCount ?? 0} câu</strong>
                        </p>
                    </div>
                </div>

                <div class="result-actions">
                    <button class="detail-btn" type="button" onclick="viewResult(${result.id})">
                        Chi tiết
                    </button>
                    <button class="retry-btn" type="button" onclick="retryExam(${result.examId})">
                        Làm lại
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

/* =========================
   CHỐNG XSS HTML
========================= */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================
   LẤY LỊCH SỬ TỪ BACKEND
========================= */

async function loadResults() {
    if (!accessToken) {
        showMessage(
            "Bạn chưa đăng nhập. Vui lòng đăng nhập lại để xem lịch sử.",
            "error"
        );
        resultList.innerHTML = `
            <div class="empty-result">
                <h3>Yêu cầu đăng nhập</h3>
                <p>Vui lòng <a href="login.html" style="color: #1d4ed8; font-weight: bold;">đăng nhập</a> để xem lịch sử làm bài của bạn.</p>
            </div>
        `;
        return;
    }

    try {
        showMessage("Đang tải lịch sử làm bài...");

        const response = await fetch("/exam-results/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error("Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
            }

            throw new Error(`Không thể tải lịch sử (${response.status})`);
        }

        const responseData = await response.json();
        results = responseData.data || [];

        showMessage("");
        renderExamFilter(results);
        renderResults(results);

    } catch (error) {
        console.error(error);
        showMessage(error.message || "Không thể tải lịch sử làm bài.", "error");

        resultList.innerHTML = `
            <div class="empty-result">
                <h3>Không thể tải dữ liệu</h3>
                <p>${escapeHtml(error.message || "Hãy kiểm tra backend và đăng nhập lại.")}</p>
            </div>
        `;
    }
}

/* =========================
   TẠO DANH SÁCH BÀI THI
========================= */

function renderExamFilter(data) {
    if (!examFilter) return;

    const examMap = new Map();

    data.forEach(result => {
        if (!examMap.has(result.examId)) {
            examMap.set(result.examId, result.examTitle);
        }
    });

    examFilter.innerHTML = `<option value="">Tất cả bài thi</option>`;

    examMap.forEach((title, id) => {
        examFilter.innerHTML += `
            <option value="${id}">
                ${escapeHtml(title || `Đề thi #${id}`)}
            </option>
        `;
    });
}

/* =========================
   LỌC KẾT QUẢ
========================= */

function filterResults() {
    const selectedExam = examFilter?.value || "";
    const selectedStatus = statusFilter?.value || "";
    const startDate = fromDate?.value || "";
    const endDate = toDate?.value || "";

    let filtered = [...results];

    if (selectedExam) {
        filtered = filtered.filter(result =>
            String(result.examId) === String(selectedExam)
        );
    }

    if (selectedStatus) {
        filtered = filtered.filter(result =>
            getStatus(result) === selectedStatus
        );
    }

    if (startDate) {
        const from = new Date(startDate);
        filtered = filtered.filter(result => {
            const submitted = new Date(result.submittedAt);
            return submitted >= from;
        });
    }

    if (endDate) {
        const to = new Date(endDate);
        to.setHours(23, 59, 59, 999);

        filtered = filtered.filter(result => {
            const submitted = new Date(result.submittedAt);
            return submitted <= to;
        });
    }

    renderResults(filtered);
}

/* =========================
   RESET BỘ LỌC
========================= */

function resetFilters() {
    if (examFilter) examFilter.value = "";
    if (statusFilter) statusFilter.value = "";
    if (fromDate) fromDate.value = "";
    if (toDate) toDate.value = "";

    renderResults(results);
}

/* =========================
   XEM CHI TIẾT
========================= */

function viewResult(resultId) {
    const item = results.find(r => r.id === resultId);
    if (!item) {
        alert("Không tìm thấy thông tin bài thi này.");
        return;
    }

    const percentage = item.totalQuestions > 0
        ? Math.round((item.correctCount / item.totalQuestions) * 100)
        : 0;

    alert(
        `CHI TIẾT KẾT QUẢ:\n` +
        `• Tên đề thi: ${item.examTitle || "Đề thi TOEIC"}\n` +
        `• Điểm số: ${item.score ?? 0} / 10\n` +
        `• Trả lời đúng: ${item.correctCount ?? 0} / ${item.totalQuestions ?? 0} câu (${percentage}%)\n` +
        `• Thời gian nộp: ${formatDate(item.submittedAt)}`
    );
}

/* =========================
   LÀM LẠI ĐỀ
========================= */

function retryExam(examId) {
    window.location.href = `exam.html?id=${examId}`;
}

/* =========================
   EVENT
========================= */

if (filterButton) {
    filterButton.addEventListener("click", filterResults);
}

if (resetButton) {
    resetButton.addEventListener("click", resetFilters);
}

/* =========================
   KHỞI ĐỘNG
========================= */

loadResults();
