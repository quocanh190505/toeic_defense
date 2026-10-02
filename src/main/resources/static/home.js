document.addEventListener("DOMContentLoaded", () => {

    // Kiểm tra token đăng nhập
    const accessToken = localStorage.getItem("toeicAccessToken");

    // Nếu chưa đăng nhập thì quay về login
    if (!accessToken) {
        window.location.href = "login.html";
        return;
    }

    let tokenPayload = {};
    try {
        tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
    } catch (_) {}

    const adminLink = document.querySelector('a[href="admin.html"]');
    const usernameElement = document.getElementById("username");
    const username = localStorage.getItem("username") || tokenPayload.username || "User";
    const role = localStorage.getItem("role") || tokenPayload.role || "USER";

    if (usernameElement) {
        usernameElement.innerHTML = `👤 <strong>${username}</strong> `;
    }

    if (adminLink && role !== "ADMIN") {
        adminLink.remove();
    }


    // Tìm nút đăng xuất
    const logoutButton = document.getElementById("logoutBtn");

    if (logoutButton) {

        logoutButton.addEventListener("click", (event) => {

            event.preventDefault();

            // Xóa token
            localStorage.removeItem("toeicAccessToken");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
            localStorage.removeItem("role");

            // Quay về trang đăng nhập
            window.location.href = "login.html";

        });

    }


    // Nút bắt đầu luyện thi
    const startExamButton = document.getElementById("startExamButton");

    if (startExamButton) {

        startExamButton.addEventListener("click", () => {

            window.location.href = "exams.html";

        });

    }

});
