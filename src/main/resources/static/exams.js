const accessToken = localStorage.getItem("toeicAccessToken");

if (!accessToken) {
    window.location.href = "login.html";
}

const examList = document.getElementById("examList");
const examMessage = document.getElementById("examMessage");
const usernameElement = document.getElementById("username");
const logoutBtn = document.getElementById("logoutBtn");

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearSearchBtn = document.getElementById("clearSearchBtn");

let allExams = [];

/* =========================
   USER INFO & LOGOUT
========================= */

const savedUsername = localStorage.getItem("username");
if (usernameElement && savedUsername) {
    usernameElement.textContent = `Xin chào, ${savedUsername}`;
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("toeicAccessToken");
        localStorage.removeItem("username");
        window.location.href = "login.html";
    });
}

/* =========================
   ESCAPE HTML
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
   RENDER EXAM CARDS
========================= */

function renderExams(exams) {
    if (!examList) return;

    if (!exams || exams.length === 0) {
        examList.innerHTML = `
            <div class="empty-result">
                <h3>Không tìm thấy đề thi phù hợp</h3>
                <p>Vui lòng thử tìm kiếm với từ khóa khác hoặc bấm nút "Tất cả đề".</p>
            </div>
        `;
        return;
    }

    examList.innerHTML = "";

    exams.forEach(exam => {
        const examCard = document.createElement("div");
        examCard.className = "exam-card";

        const examId = exam.id || "";
        const title = exam.title || "Đề thi TOEIC";
        const description = exam.description || "Bài thi kiểm tra năng lực tiếng Anh TOEIC chuẩn hóa.";
        const duration = exam.durationMinutes ? `${exam.durationMinutes} phút` : "Chưa cập nhật";
        const totalQuestions = exam.totalQuestions ? `${exam.totalQuestions} câu hỏi` : "Đầy đủ câu hỏi";

        examCard.innerHTML = `
            <div class="exam-card-header">
                <div class="exam-card-icon" aria-hidden="true">📖</div>

                <div class="exam-card-copy">
                    <h2>${escapeHtml(title)}</h2>

                    <div class="exam-card-badges">
                        <span>Đề thi TOEIC</span>
                        <span>Đầy đủ phần thi</span>
                    </div>

                    <div class="exam-card-meta">
                        <span>⏱ ${escapeHtml(duration)}</span>
                        <span>📝 ${escapeHtml(totalQuestions)}</span>
                    </div>
                </div>
            </div>

            <div>
                <p style="color: #64748b; font-size: 14px; margin-top: 14px; line-height: 1.5;">
                    ${escapeHtml(description)}
                </p>

                ${examId ? `
                    <a href="exam.html?id=${examId}" class="exam-card-link">
                        Vào làm bài thi <span aria-hidden="true">→</span>
                    </a>
                ` : ""}
            </div>
        `;

        examList.appendChild(examCard);
    });
}

/* =========================
   TẢI TẤT CẢ ĐỀ THI
========================= */

async function loadExams() {
    try {
        examList.innerHTML = `<p class="loading-text">Đang tải danh sách đề thi...</p>`;

        const response = await fetch("/exams", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("toeicAccessToken");
                window.location.href = "login.html";
                return;
            }
            throw new Error(`Lỗi máy chủ (${response.status})`);
        }

        const data = await response.json();
        allExams = data.data || [];

        renderExams(allExams);

    } catch (error) {
        console.error("Lỗi tải đề thi:", error);
        if (examMessage) {
            examMessage.textContent = "Không thể tải danh sách đề thi. Vui lòng thử lại sau.";
        }
        examList.innerHTML = `
            <div class="empty-result">
                <h3>Không thể tải đề thi</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;
    }
}

/* =========================
   TÌM KIẾM ĐỀ THI (GỌI API SEARCH UNSAFE ĐỂ BURP SUITE INTERCEPT)
========================= */

async function executeSearchUnsafe(keyword) {
    if (!keyword) {
        if (clearSearchBtn) clearSearchBtn.style.display = "none";
        renderExams(allExams);
        return;
    }

    try {
        examList.innerHTML = `<p class="loading-text">Đang tìm kiếm...</p>`;

        if (clearSearchBtn) {
            clearSearchBtn.style.display = "inline-block";
        }

        // Gọi API searchUnsafe để Burp Suite có thể bắt và khai thác payload SQLi
        const response = await fetch(`/api/exams/searchUnsafe?keyword=${encodeURIComponent(keyword)}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Lỗi phản hồi (${response.status})`);
        }

        const searchResults = await response.json(); // Mảng các { title: string }

        if (!searchResults || searchResults.length === 0) {
            examList.innerHTML = `
                <div class="empty-result">
                    <h3>Không tìm thấy đề thi phù hợp</h3>
                    <p>Không có kết quả nào cho từ khóa: "<strong>${escapeHtml(keyword)}</strong>".</p>
                </div>
            `;
            return;
        }

        // Khớp kết quả trả về với danh sách đề thi hiện có
        const matchedList = [];
        searchResults.forEach(item => {
            const returnedTitle = item.title ?? "";
            const matchedExam = allExams.find(
                e => e.title && e.title.trim().toLowerCase() === returnedTitle.trim().toLowerCase()
            );

            if (matchedExam) {
                matchedList.push(matchedExam);
            } else {
                matchedList.push({
                    title: returnedTitle,
                    description: "Kết quả tìm kiếm",
                    durationMinutes: null,
                    totalQuestions: null
                });
            }
        });

        renderExams(matchedList);

    } catch (err) {
        console.error("Lỗi khi tìm kiếm:", err);
        examList.innerHTML = `
            <div class="empty-result">
                <h3>Không thể hoàn tất tìm kiếm</h3>
                <p>Đã xảy ra lỗi trong quá trình xử lý yêu cầu tìm kiếm.</p>
            </div>
        `;
    }
}

/* =========================
   SEARCH FORM EVENTS
========================= */

if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const kw = searchInput ? searchInput.value.trim() : "";
        executeSearchUnsafe(kw);
    });
}

if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", function () {
        if (searchInput) searchInput.value = "";
        clearSearchBtn.style.display = "none";
        renderExams(allExams);
    });
}

/* =========================
   KHỞI TẠO
========================= */

loadExams();
