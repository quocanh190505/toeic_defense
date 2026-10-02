const token = localStorage.getItem("toeicAccessToken") || "";
const form = document.getElementById("profileForm");
const usernameInput = document.getElementById("usernameInput");
const currentUsername = document.getElementById("currentUsername");
const currentRole = document.getElementById("currentRole");
const message = document.getElementById("profileMessage");
const detailsForm = document.getElementById("personalDetailsForm");
const detailsMessage = document.getElementById("personalDetailsMessage");
const logoutButton = document.getElementById("logoutButton");

function endSession() {
    ["toeicAccessToken", "username", "userId", "role"].forEach(key => localStorage.removeItem(key));
    window.location.href = "login.html";
}

if (!token) endSession();

async function loadProfile() {
    try {
        const response = await fetch("/users/me", { headers: { Authorization: `Bearer ${token}` } });
        if (response.status === 401 || response.status === 403) return endSession();
        if (!response.ok) throw new Error("Không thể tải hồ sơ.");
        const result = await response.json();
        const user = result.data;
        currentUsername.textContent = user.username;
        currentRole.textContent = user.role;
        usernameInput.value = user.username;
        document.getElementById("navUsername").textContent = user.username;
        localStorage.setItem("username", user.username);
        localStorage.setItem("role", user.role);
        const profileResponse = await fetch("/profiles/me", { headers: { Authorization: `Bearer ${token}` } });
        if (!profileResponse.ok) throw new Error("Không thể tải thông tin cá nhân.");
        const profile = (await profileResponse.json()).data;
        document.getElementById("fullNameInput").value = profile.fullName || "";
        document.getElementById("emailInput").value = profile.email || "";
        document.getElementById("phoneInput").value = profile.phone || "";
    } catch (error) {
        message.textContent = error.message;
    }
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    message.textContent = "";
    const username = usernameInput.value.trim();
    if (username.length < 3 || username.length > 50) {
        message.textContent = "Tên đăng nhập cần có từ 3 đến 50 ký tự.";
        return;
    }
    try {
        const response = await fetch("/users/api/users/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ username })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Không thể cập nhật hồ sơ.");
        currentUsername.textContent = result.data.username;
        usernameInput.value = result.data.username;
        document.getElementById("navUsername").textContent = result.data.username;
        localStorage.setItem("username", result.data.username);
        message.textContent = "Hồ sơ đã được cập nhật.";
    } catch (error) {
        message.textContent = error.message;
    }
});

detailsForm.addEventListener("submit", async event => {
    event.preventDefault();
    detailsMessage.textContent = "";
    try {
        const response = await fetch("/profiles/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                fullName: document.getElementById("fullNameInput").value.trim(),
                email: document.getElementById("emailInput").value.trim(),
                phone: document.getElementById("phoneInput").value.trim()
            })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Không thể cập nhật thông tin cá nhân.");
        detailsMessage.textContent = "Thông tin cá nhân đã được cập nhật.";
    } catch (error) {
        detailsMessage.textContent = error.message;
    }
});

logoutButton.addEventListener("click", event => { event.preventDefault(); endSession(); });
loadProfile();
