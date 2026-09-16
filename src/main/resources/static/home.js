document.addEventListener("DOMContentLoaded", () => {

    // Kiểm tra token đăng nhập
    const accessToken = localStorage.getItem("toeicAccessToken");

    // Nếu chưa đăng nhập thì quay về login
    if (!accessToken) {
        window.location.href = "login.html";
        return;
    }

    const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
    const adminLink = document.querySelector('a[href="admin.html"]');
    const usernameElement = document.getElementById("username");
    const username = localStorage.getItem("username");

    if (usernameElement && username) {
        usernameElement.textContent = `Xin chào ${username}`;
    }

    if (adminLink && tokenPayload.role !== "ADMIN") {
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