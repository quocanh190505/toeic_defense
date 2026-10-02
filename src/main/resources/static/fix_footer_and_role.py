import re
import os

filepath = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\resources\static\profile.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the info-row in profile.html to just center the username and hide currentRole

old_info_row = r'''                <div class="info-row">
                    <div class="info-group">
                        <label>Vai trò hệ thống</label>
                        <div class="role-badge-display" id="currentRole">--</div>
                    </div>
                    <div class="info-group">
                        <label>Tên đăng nhập hiện tại</label>
                        <div class="username-display" id="currentUsername">Đang tải…</div>
                    </div>
                </div>'''

new_info_row = r'''                <div class="info-row" style="flex-direction: column; align-items: center; text-align: center; border-bottom: none; padding-bottom: 5px;">
                    <div style="display: none;" id="currentRole"></div>
                    <div class="info-group" style="width: 100%;">
                        <label style="font-size: 14px;">Tên đăng nhập hiện tại</label>
                        <div class="username-display" id="currentUsername" style="font-size: 24px; color: #1e3c72; margin-top: 4px;">Đang tải…</div>
                    </div>
                </div>'''

content = content.replace(old_info_row, new_info_row)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# We also need to fix footer being too high
# We can add `display: flex; flex-direction: column; min-height: 100vh;` to style.css for body
stylepath = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\resources\static\style.css'
with open(stylepath, 'r', encoding='utf-8') as f:
    style_content = f.read()

# We need to make sure footer pushes to bottom.
# A safe way is to just add to the end of style.css:
footer_fix = """
/* FOOTER FIX TO BOTTOM */
body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}
main {
    flex: 1;
}
footer {
    margin-top: auto;
}
"""
if "/* FOOTER FIX" not in style_content:
    style_content += footer_fix
    with open(stylepath, 'w', encoding='utf-8') as f:
        f.write(style_content)

