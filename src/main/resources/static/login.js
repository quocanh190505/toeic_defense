const loginForm = document.getElementById("loginForm");
const authMessage = document.getElementById("authMessage");
const API_BASE_URL = "http://localhost:8080";

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
    showMessage("Đang đăng nhập...");

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/loginSecure`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: document.getElementById("username").value.trim(),
                password: document.getElementById("password").value
            })
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response, "Email hoặc mật khẩu không đúng."));
        }

        const data = await response.json();
        localStorage.setItem("toeicAccessToken", data.token);
        localStorage.setItem("username", document.getElementById("username").value.trim());
        window.location.href = "home.html";
    } catch (error) {
        showMessage(error.message);
    }
});
