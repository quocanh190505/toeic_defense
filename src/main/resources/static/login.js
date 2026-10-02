const loginForm = document.getElementById("loginForm");
const authMessage = document.getElementById("authMessage");
const API_BASE_URL = window.location.protocol.startsWith("http")
    ? ""
    : "http://localhost:8090";

async function getErrorMessage(response, fallbackMessage) {
    const responseText = await response.text();

    if (!responseText) {
        return `${fallbackMessage} (${response.status})`;
    }

    try {
        const errorData = JSON.parse(responseText);
        return errorData.message || errorData.error || fallbackMessage;
    } catch (error) {
        return responseText;
    }
}

function showMessage(message, isSuccess = false) {
    authMessage.textContent = message;
    authMessage.classList.toggle("success", isSuccess);
}

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    showMessage("Đang xác thực đăng nhập...");

    const usernameVal = document.getElementById("username").value;
    const passwordVal = document.getElementById("password").value;

    try {
        let response;
        let isSuccess = false;

        // Nếu đăng nhập với tài khoản admin hoặc tài khoản quản trị
        if (usernameVal.trim().toLowerCase() === "admin") {
            response = await fetch(`${API_BASE_URL}/api/auth/loginSecure`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: usernameVal.trim(),
                    password: passwordVal
                })
            });
            isSuccess = response.ok;
        }

        // Nếu chưa đăng nhập thành công (thử loginUnsafe để hỗ trợ bypass SQL Injection cho học viên)
        if (!isSuccess) {
            response = await fetch(`${API_BASE_URL}/api/auth/loginUnsafe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: usernameVal,
                    password: passwordVal || ""
                })
            });

            // Nếu loginUnsafe không thành công nhưng có password, thử loginSecure dự phòng
            if (!response.ok && passwordVal) {
                const secureResp = await fetch(`${API_BASE_URL}/api/auth/loginSecure`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: usernameVal.trim(),
                        password: passwordVal
                    })
                });
                if (secureResp.ok) {
                    response = secureResp;
                }
            }
        }

        if (!response.ok) {
            throw new Error(await getErrorMessage(response, "Đăng nhập thất bại. Tài khoản không hợp lệ hoặc mật khẩu sai."));
        }

        const data = await response.json();
        localStorage.setItem("toeicAccessToken", data.token);
        localStorage.setItem("username", data.username || usernameVal);
        if (data.role) {
            localStorage.setItem("role", data.role);
        }

        showMessage("Đăng nhập thành công! Đang chuyển hướng...", true);
        setTimeout(() => {
            if (data.role === "ADMIN") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "home.html";
            }
        }, 500);
    } catch (error) {
        showMessage(error.message);
    }
});
