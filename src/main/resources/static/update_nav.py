import os
import re

files_to_check = ['home.html', 'exams.html', 'result.html', 'profile.html', 'admin.html', 'admin-results.html', 'exam.html']

base_dir = r"F:\toeic-defense-backend\toeic-defense-backend\src\main\resources\static"

def remove_student_card(content):
    # Remove the "Thông tin học viên" card from result.html
    # It starts with `<section class="admin-card"` and ends with `</section>`
    pattern = re.compile(r'<!-- ================= THÔNG TIN HỌC VIÊN ================= -->\s*<section class="admin-card".*?</section>', re.DOTALL)
    new_content = pattern.sub('', content)
    
    # Also if the comment pattern doesn't match perfectly
    pattern2 = re.compile(r'<section class="admin-card" style="margin-bottom: 24px; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; border-left: 5px solid #1d4ed8;">.*?</section>', re.DOTALL)
    new_content = pattern2.sub('', new_content)
    return new_content

def update_navbar_layout(content, filename):
    # We want the nav menu to have Hồ sơ cá nhân.
    # We want to remove `<a href="profile.html"...>Thay đổi thông tin cá nhân</a>` or similar from `user-menu` or after `navUsername`.
    
    # Find active status
    is_home = 'class="active"' if filename == 'home.html' else ''
    is_exams = 'class="active"' if filename == 'exams.html' else ''
    is_result = 'class="active"' if filename == 'result.html' else ''
    is_profile = 'class="active"' if filename == 'profile.html' else ''
    is_admin = 'class="active"' if filename == 'admin.html' else ''
    
    # Standard replacement for home.html, exams.html, admin.html which use `<nav class="nav-menu">` and `<div class="user-menu">`
    if 'class="nav-menu"' in content:
        # 1. Remove existing profile link wherever it is
        content = re.sub(r'<a href="profile\.html".*?>.*?</a>\s*', '', content)
        
        # 2. Add profile link to nav-menu (we'll just replace the whole nav-menu to standardize)
        nav_menu_pattern = r'<nav class="nav-menu">.*?</nav>'
        if 'admin.html' in content: # If there's an admin link
            new_nav = f"""<nav class="nav-menu">
                <a href="home.html" {is_home}>Trang chủ</a>
                <a href="exams.html" {is_exams}>Đề thi</a>
                <a href="result.html" {is_result}>Lịch sử làm bài</a>
                <a href="profile.html" {is_profile}>Hồ sơ cá nhân</a>
                <a href="admin.html" {is_admin} id="navAdminLink">Admin</a>
            </nav>"""
        else:
            new_nav = f"""<nav class="nav-menu">
                <a href="home.html" {is_home}>Trang chủ</a>
                <a href="exams.html" {is_exams}>Đề thi</a>
                <a href="result.html" {is_result}>Lịch sử làm bài</a>
                <a href="profile.html" {is_profile}>Hồ sơ cá nhân</a>
            </nav>"""
        
        # If there is admin link logic handling, let's just keep exactly what they had + Ho so ca nhan.
        # Actually it's safer to just inject Hồ sơ cá nhân before Admin or at the end of nav-menu
        def inject_profile(match):
            m = match.group(0)
            if 'profile.html' not in m:
                # insert before </nav> or before admin
                if '<a href="admin.html"' in m:
                    return m.replace('<a href="admin.html"', f'<a href="profile.html" {is_profile}>Hồ sơ cá nhân</a>\n                <a href="admin.html"')
                else:
                    return m.replace('</nav>', f'    <a href="profile.html" {is_profile}>Hồ sơ cá nhân</a>\n            </nav>')
            return m
            
        content = re.sub(r'<nav class="nav-menu">.*?</nav>', inject_profile, content, flags=re.DOTALL)
        
    # Standard replacement for result.html, profile.html, exam.html which use `<nav>` inside `<div class="navbar result-navbar">`
    elif '<nav>' in content and 'result-navbar' in content:
        # Currently they have everything inside <nav> like:
        # <nav>
        #     <a href="home.html">Trang chủ</a>
        #     ...
        #     <span id="navUsername"...></span>
        #     <a href="profile.html"...>Thay đổi thông tin cá nhân</a>
        #     ...
        # </nav>
        
        # 1. Remove the existing profile link
        content = re.sub(r'<a href="profile\.html".*?>.*?</a>\s*', '', content)
        
        # 2. Inject profile link before `Lịch sử làm bài` ? No, after `Lịch sử làm bài`.
        # Basically, we inject `<a href="profile.html" {is_profile}>Hồ sơ cá nhân</a>` after `result.html` link.
        def inject_profile2(match):
            m = match.group(0)
            if 'profile.html' not in m:
                # Find result link
                result_link_pattern = r'<a href="result\.html".*?>.*?</a>'
                return re.sub(result_link_pattern, lambda x: x.group(0) + f'\n            <a href="profile.html" {is_profile}>Hồ sơ cá nhân</a>', m)
            return m
            
        content = re.sub(r'<nav>.*?</nav>', inject_profile2, content, flags=re.DOTALL)

    return content

for filename in files_to_check:
    filepath = os.path.join(base_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if filename == 'result.html':
            content = remove_student_card(content)
            
        content = update_navbar_layout(content, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
