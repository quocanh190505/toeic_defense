const registerForm = document.getElementById("registerForm");

const usernameInput = document.getElementById("username");

const passwordInput = document.getElementById("password");

const confirmPasswordInput = document.getElementById("confirmPassword");

const registerMessage = document.getElementById("registerMessage");

const API_BASE_URL = window.location.port === "8080"
    ? ""
    : "http://localhost:8080";


function showMessage(message, type = "") {

    registerMessage.textContent = message;

    registerMessage.className = `auth-message ${type}`;

}


registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const username = usernameInput.value.trim();

    const password = passwordInput.value;

    const confirmPassword = confirmPasswordInput.value;


    if (username === "") {

        showMessage(
            "Vui lòng nhập tên đăng nhập.",
            "error"
        );

        return;

    }


    if (password === "") {

        showMessage(
            "Vui lòng nhập mật khẩu.",
            "error"
        );

        return;

    }


    if (password !== confirmPassword) {

        showMessage(
            "Mật khẩu xác nhận không khớp.",
            "error"
        );

        return;

    }


    try {

        showMessage("Đang đăng ký...");


        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                username: username,

                password: password

            })

        });


        const responseText = await response.text();
        let data = {};

        if (responseText.trim() !== "") {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                if (response.ok) {
                    data = {};
                } else {
                    throw new Error("Máy chủ trả về dữ liệu không hợp lệ.");
                }
            }
        }


        if (!response.ok) {

            if (response.status === 401) {
                throw new Error("Request đăng ký bị từ chối (401). Hãy mở trang tại http://localhost:8080/register.html và tải lại bằng Ctrl+F5.");
            }

            throw new Error(
                data.message ||
                data.error ||
                (responseText.trim() !== "" ? responseText : `Đăng ký thất bại (${response.status}).`)
            );

        }


        showMessage(
            "Đăng ký thành công! Đang chuyển đến trang đăng nhập...",
            "success"
        );


        setTimeout(function () {

            window.location.href = "login.html";

        }, 1500);


    } catch (error) {

        showMessage(
            error.message || "Không thể kết nối đến máy chủ.",
            "error"
        );

    }

});