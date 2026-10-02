import re
import os

filepath = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\resources\static\profile.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# The form block to replace
old_form = r'''                <form id="profileForm" class="modern-form">
                    <div class="form-group-modern">
                        <label for="usernameInput">Đổi tên đăng nhập</label>
                        <div class="input-with-icon">
                            <input id="usernameInput" name="username" maxlength="50" minlength="3" autocomplete="username" required placeholder="Nhập tên đăng nhập mới...">
                        </div>
                    </div>
                    <button type="submit" class="btn-save">Lưu tài khoản</button>
                    <p id="profileMessage" class="form-message" role="status" aria-live="polite"></p>
                </form>'''

new_buttons = r'''                <div style="display: flex; gap: 12px; margin-top: 10px;">
                    <button type="button" class="btn-save" style="flex:1; background:#1e3c72; font-size:14px; display:flex; align-items:center; justify-content:center; gap:6px;" onclick="document.getElementById('changeUsernameModal').hidden = false; document.body.classList.add('modal-open'); setTimeout(()=>document.getElementById('usernameInput').focus(),100);">👤 Thay đổi tài khoản</button>
                    <button type="button" class="btn-save" style="flex:1; background: #f8fafc; color: #1e293b; border: 1px solid #cbd5e1; font-size:14px; display:flex; align-items:center; justify-content:center; gap:6px;" onclick="document.getElementById('changePasswordBtn').click()">🔑 Thay đổi mật khẩu</button>
                </div>'''

modal_html = r'''
<!-- MODAL THAY ĐỔI TÊN ĐĂNG NHẬP -->
<div id="changeUsernameModal" class="score-modal" hidden>
    <div class="score-modal-card edit-modal-card">
        <h2>👤 Đổi tên đăng nhập</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 6px;">
            Cập nhật tên đăng nhập mới.
        </p>
        <form id="profileForm" style="margin-top: 20px; text-align: left;" class="modern-form">
            <div class="form-group">
                <label for="usernameInput" style="font-weight:bold; font-size:14px; display:block; margin-bottom:8px">Tên đăng nhập mới</label>
                <input id="usernameInput" name="username" maxlength="50" minlength="3" autocomplete="username" required placeholder="Nhập tên đăng nhập mới..." style="width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px;">
            </div>
            <p id="profileMessage" class="auth-message" style="margin-top: 16px; min-height: 20px; font-weight:600; color:#10b981; text-align:center"></p>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button type="submit" class="btn-save" style="flex: 1; background:#1e3c72; padding:12px; color:white; border:none; border-radius:8px; font-weight:bold">Lưu thay đổi</button>
                <button type="button" onclick="document.getElementById('changeUsernameModal').hidden = true; document.body.classList.remove('modal-open')" class="btn-save" style="width: auto; background: #f8fafc; color: #1e293b; border: 1px solid #cbd5e1; padding:12px 20px; border-radius:8px; font-weight:bold">Thoát</button>
            </div>
        </form>
    </div>
</div>
'''

content = content.replace(old_form, new_buttons)
content = content.replace('</body>', f'{modal_html}\n</body>')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

