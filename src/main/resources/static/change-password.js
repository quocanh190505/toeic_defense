/**
 * change-password.js
 * Quản lý tính năng tự đổi mật khẩu cho người dùng đã đăng nhập
 */

(function () {
    const accessToken = localStorage.getItem("toeicAccessToken");
    if (!accessToken) return;

    // 1. Tạo modal đổi mật khẩu nếu chưa có trong DOM
    if (!document.getElementById("changePasswordModal")) {
        const modalHtml = `
        <div id="changePasswordModal" class="score-modal" hidden>
            <div class="score-modal-card edit-modal-card">
                <h2>🔐 Đổi mật khẩu</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 6px;">
                    Cập nhật mật khẩu bảo vệ tài khoản của bạn.
                </p>
                <form id="changePasswordForm" style="margin-top: 20px; text-align: left;">
                    <div class="form-group">
                        <label for="oldPasswordInput">Mật khẩu hiện tại</label>
                        <input id="oldPasswordInput" type="password" placeholder="Nhập mật khẩu hiện tại..." required autocomplete="current-password">
                    </div>
                    <div class="form-group">
                        <label for="newPasswordInput">Mật khẩu mới</label>
                        <input id="newPasswordInput" type="password" placeholder="Nhập mật khẩu mới..." required autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label for="confirmPasswordInput">Xác nhận mật khẩu mới</label>
                        <input id="confirmPasswordInput" type="password" placeholder="Nhập lại mật khẩu mới..." required autocomplete="new-password">
                    </div>
                    <p id="changePwMsg" class="auth-message" style="margin-top: 10px;"></p>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" id="submitChangePwBtn" class="primary-btn-submit" style="flex: 1;">Xác nhận đổi</button>
                        <button type="button" id="closeChangePwModalBtn" class="reset-button" style="width: auto;">Hủy</button>
                    </div>
                </form>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML("beforeend", modalHtml);
    }

    const modal = document.getElementById("changePasswordModal");
    const form = document.getElementById("changePasswordForm");
    const closeBtn = document.getElementById("closeChangePwModalBtn");
    const msg = document.getElementById("changePwMsg");
    const openBtn = document.getElementById("changePasswordBtn");

    function openModal() {
        if (!modal) return;
        if (form) form.reset();
        if (msg) {
            msg.textContent = "";
            msg.className = "auth-message";
        }
        modal.hidden = false;
        document.body.classList.add("modal-open");
        const oldInput = document.getElementById("oldPasswordInput");
        if (oldInput) setTimeout(() => oldInput.focus(), 100);
    }

    function closeModal() {
        if (!modal) return;
        modal.hidden = true;
        document.body.classList.remove("modal-open");
    }

    if (openBtn) {
        openBtn.addEventListener("click", openModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const oldPassword = document.getElementById("oldPasswordInput").value;
            const newPassword = document.getElementById("newPasswordInput").value;
            const confirmPassword = document.getElementById("confirmPasswordInput").value;

            if (newPassword !== confirmPassword) {
                msg.textContent = "Mật khẩu xác nhận không khớp!";
                msg.className = "auth-message error";
                return;
            }

            if (newPassword.length < 3) {
                msg.textContent = "Mật khẩu mới phải có ít nhất 3 ký tự!";
                msg.className = "auth-message error";
                return;
            }

            msg.textContent = "Đang cập nhật mật khẩu...";
            msg.className = "auth-message";

            try {
                const response = await fetch("/api/auth/changePasswordSecure", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ oldPassword, newPassword })
                });

                if (!response.ok) {
                    const resText = await response.text();
                    let errMsg = "Mật khẩu hiện tại không đúng!";
                    try {
                        const json = JSON.parse(resText);
                        if (json.message === "Invalid old password") {
                            errMsg = "Mật khẩu hiện tại không chính xác!";
                        } else if (json.message) {
                            errMsg = json.message;
                        }
                    } catch (_) {
                        if (resText && resText.length < 100) errMsg = resText;
                    }
                    throw new Error(errMsg);
                }

                msg.textContent = "Đổi mật khẩu thành công!";
                msg.className = "auth-message success";

                setTimeout(() => {
                    closeModal();
                    alert("Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.");
                }, 700);

            } catch (err) {
                msg.textContent = err.message || "Không thể đổi mật khẩu.";
                msg.className = "auth-message error";
            }
        });
    }
})();
