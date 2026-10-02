import os

filepath = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\resources\static\profile.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to extract the modal logic and place it before the script tags.
# In the current HTML, the modal is placed at the end before </body> after scripts.

modal_marker_start = '<!-- MODAL THAY ĐỔI TÊN ĐĂNG NHẬP -->'
script_marker_start = '<script src="profile.js'

# Find indices
script_idx = content.find(script_marker_start)
modal_idx = content.find(modal_marker_start)

if modal_idx > script_idx:
    # We need to cut the modal block and paste it before the script block.
    # The modal block goes from modal_marker_start to </body>
    modal_end_idx = content.find('</body>', modal_idx)
    modal_content = content[modal_idx:modal_end_idx]
    
    # Remove modal from bottom
    content = content[:modal_idx] + content[modal_end_idx:]
    
    # Insert modal before scripts. Wait, scripts are inside <main> or after </main>?
    # Scripts are after </main>. Let's insert modal right after </main>.
    main_end_idx = content.find('</main>') + 7
    content = content[:main_end_idx] + '\n\n' + modal_content + '\n' + content[main_end_idx:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

