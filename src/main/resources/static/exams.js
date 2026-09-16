const examList = document.getElementById("examList");
const examMessage = document.getElementById("examMessage");

const usernameElement = document.getElementById("username");
const logoutBtn = document.getElementById("logoutBtn");

const accessToken = localStorage.getItem("toeicAccessToken");


// Kiểm tra đăng nhập

if (!accessToken) {

    window.location.href = "login.html";

}

const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
const adminLink = document.querySelector('a[href="admin.html"]');
const username = localStorage.getItem("username");

if (usernameElement && username) {
    usernameElement.textContent = `Xin chào ${username}`;
}

if (adminLink && tokenPayload.role !== "ADMIN") {
    adminLink.remove();
}


// Hiển thị thông báo

function showMessage(message) {

    examMessage.textContent = message;

}


// Lấy danh sách đề thi

async function loadExams() {

    try {

        const response = await fetch("/exams", {

            method: "GET",

            headers: {

                "Authorization": `Bearer ${accessToken}`

            }

        });


        if (!response.ok) {

            throw new Error("Không thể tải danh sách đề thi");

        }


        const result = await response.json();


        console.log(result);


        const exams = result.data || [];


        if (exams.length === 0) {

            examList.innerHTML = `
                <p>Hiện chưa có đề thi nào.</p>
            `;

            return;

        }


        examList.innerHTML = "";


        exams.forEach(exam => {

            const examCard = document.createElement("div");

            examCard.className = "exam-card";

            const title = String(exam.title || `Đề thi ${exam.id}`);
            const yearMatch = title.match(/\b(20\d{2})\b/);
            const year = yearMatch ? yearMatch[1] : "2026";
            const cleanTitle = title.replace(/\s*[-|]\s*20\d{2}\s*$/, "").trim();
            const examName = cleanTitle || `Bộ đề ${exam.id}`;
            const totalQuestions = exam.totalQuestions || 10;
            const attempts = exam.attemptCount || 40572;

            examCard.innerHTML = `

                <div class="exam-card-header">
                    <div class="exam-card-copy">
                        <h2>${escapeHtml(examName)}</h2>

                        <div class="exam-card-badges">
                            <span>${escapeHtml(examName.toLowerCase().includes("parrot") ? "parrot" : "TOEIC")}</span>
                            <span>${escapeHtml(year)}</span>
                        </div>

                        <div class="exam-card-meta">
                            <span>📄 ${totalQuestions} đề</span>
                            <span>👥 ${Number(attempts).toLocaleString("vi-VN")} lượt làm</span>
                        </div>
                    </div>
                    </div>

                    <div class="exam-card-icon" aria-hidden="true">▣</div>
                </div>

                <a href="exam.html?id=${exam.id}" class="exam-card-link">
                    Vào luyện <span aria-hidden="true">→</span>
                </a>

            `;


            examList.appendChild(examCard);

        });


    }

    catch (error) {

        console.error(error);


        showMessage(
            "Không thể tải danh sách đề thi."
        );


        examList.innerHTML = `
            <p>Đã xảy ra lỗi khi tải đề thi.</p>
        `;

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


// Đăng xuất

logoutBtn.addEventListener("click", function () {

    localStorage.removeItem("toeicAccessToken");
    localStorage.removeItem("username");

    window.location.href = "login.html";

});


// Chạy khi mở trang

loadExams();