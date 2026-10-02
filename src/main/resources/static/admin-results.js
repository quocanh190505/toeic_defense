const API_BASE_URL = window.location.protocol.startsWith("http")
    ? ""
    : "http://localhost:8090";
const accessToken = localStorage.getItem("toeicAccessToken") || "";
const resultList = document.getElementById("resultList");
const resultMessage = document.getElementById("resultMessage");
const examFilter = document.getElementById("examFilter");
const userFilter = document.getElementById("userFilter");
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const filterButton = document.getElementById("filterButton");
const resetButton = document.getElementById("resetButton");
let results = [];

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showMessage(message, type = "") {
    resultMessage.textContent = message;
    resultMessage.className = `result-message ${type}`;
}

function formatDate(value) {
    if (!value) return "--";
    return new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function renderResults(data) {
    if (!data.length) {
        resultList.innerHTML = `
            <div class="empty-result">
                <h3>Chưa có lịch sử làm bài</h3>
                <p>Không tìm thấy lượt làm bài phù hợp.</p>
            </div>
        `;
        return;
    }

    resultList.innerHTML = data.map((item) => {
        const total = item.totalQuestions ?? 0;
        const correct = item.correctCount ?? 0;
        const percentage = total ? Math.round((correct / total) * 100) : 0;
        const username = item.username || `User ${item.userId ?? "--"}`;
        const examName = item.examTitle || `Đề ${item.examId ?? "--"}`;

        return `
            <article class="result-card">
                <h2>${escapeHtml(examName)}</h2>
                <div class="result-status completed">Hoàn thành</div>
                <p><strong>Tài khoản:</strong> ${escapeHtml(username)}</p>
                <div class="score-box">
                    <div class="score-title">
                        <span>Điểm</span>
                        <strong>${item.score ?? 0}</strong>
                        <span>/10</span>
                    </div>
                    <div class="score-line"></div>
                    <div class="correct-info">
                        <span>Đúng: <strong>${correct}/${total}</strong></span>
                        <span>${percentage}%</span>
                    </div>
                </div>
                <div class="result-info">
                    <p><span>THỜI GIAN NỘP</span><strong>${formatDate(item.submittedAt)}</strong></p>
                    <p><span>SỐ CÂU HỎI</span><strong>${total}</strong></p>
                    <p><span>TRẢ LỜI ĐÚNG</span><strong>${correct}</strong></p>
                </div>
                <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end;">
                    <button
                        type="button"
                        class="filter-button"
                        style="background-color: #2563eb; color: white; padding: 8px 16px; font-size: 13px; border-radius: 6px; cursor: pointer; border: none; font-weight: 600;"
                        onclick="allowRetake(${item.id}, '${escapeHtml(username)}', '${escapeHtml(examName)}')"
                    >
                        🔄 Cho phép làm lại (Reset kết quả)
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

window.allowRetake = async function(resultId, username, examTitle) {
    if (!window.confirm(`Bạn có chắc chắn muốn cấp quyền làm lại cho học viên "${username}" đối với bài thi "${examTitle}"?\n(Kết quả làm bài lần trước sẽ được xóa để học viên làm lại từ đầu)`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/exam-results/${resultId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(err || `Lỗi máy chủ (${response.status})`);
        }

        showMessage(`Đã cấp quyền làm lại cho học viên "${username}" thành công!`, "success");
        await loadResults();
    } catch (err) {
        showMessage(`Lỗi: ${err.message}`, "error");
    }
};

function renderFilters() {
    const exams = new Map();
    const users = new Map();

    results.forEach((item) => {
        exams.set(item.examId, item.examTitle || `Đề ${item.examId}`);
        users.set(item.userId, item.username || `User ${item.userId}`);
    });

    examFilter.innerHTML = '<option value="">Tất cả bài thi</option>';
    [...exams.entries()]
        .sort((first, second) => String(first[1]).localeCompare(String(second[1]), "vi"))
        .forEach(([id, title]) => {
            examFilter.insertAdjacentHTML("beforeend", `<option value="${id}">${escapeHtml(title)}</option>`);
        });

    userFilter.innerHTML = '<option value="">Tất cả tài khoản</option>';
    [...users.entries()]
        .sort((first, second) => String(first[1]).localeCompare(String(second[1]), "vi"))
        .forEach(([id, username]) => {
            userFilter.insertAdjacentHTML("beforeend", `<option value="${id}">${escapeHtml(username)}</option>`);
        });
}

function getFilteredResults() {
    const selectedExam = examFilter.value;
    const selectedUser = userFilter.value;
    const startDate = fromDate.value;
    const endDate = toDate.value;

    return results.filter((item) => {
        const submittedAt = new Date(item.submittedAt);
        const afterStart = !startDate || submittedAt >= new Date(startDate);
        const beforeEnd = !endDate || submittedAt <= new Date(`${endDate}T23:59:59`);
        return (!selectedExam || String(item.examId) === selectedExam) &&
            (!selectedUser || String(item.userId) === selectedUser) &&
            afterStart && beforeEnd;
    });
}

function applyFilters() {
    renderResults(getFilteredResults());
}

async function loadResults() {
    if (!accessToken) {
        showMessage("Bạn chưa đăng nhập.", "error");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/exam-results`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error("Bạn không có quyền xem lịch sử quản trị.");
        }
        if (!response.ok) throw new Error(`Không thể tải lịch sử (${response.status}).`);

        const payload = await response.json();
        results = (payload.data || []).sort((first, second) =>
            new Date(second.submittedAt || 0) - new Date(first.submittedAt || 0)
        );
        renderFilters();
        renderResults(results);
        showMessage("");
    } catch (error) {
        showMessage(error.message || "Không thể tải lịch sử làm bài.", "error");
        resultList.innerHTML = "";
    }
}

filterButton.addEventListener("click", applyFilters);
resetButton.addEventListener("click", () => {
    examFilter.value = "";
    userFilter.value = "";
    fromDate.value = "";
    toDate.value = "";
    renderResults(results);
});
document.getElementById("logoutButton").addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("toeicAccessToken");
    localStorage.removeItem("username");
    window.location.href = "login.html";
});

loadResults();
