// 认证功能（js/auth.js）
// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
});

// 初始化认证页面
function initAuth() {
    setupAuthEventListeners();
    setupRegistrationSteps();
    setupPasswordStrength();
    setupBioCharCount();
}

// 设置认证事件监听器
function setupAuthEventListeners() {
    // 登录表单提交
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // 注册表单提交
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }

    // 密码可见性切换
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', togglePasswordVisibility);
    });

    // 忘记密码
    const forgotPasswordLink = document.getElementById('forgot-password');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const modalClose = document.querySelector('.modal-close');
    const resetPasswordForm = document.getElementById('reset-password-form');

    if (forgotPasswordLink && forgotPasswordModal) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            forgotPasswordModal.style.display = 'flex';
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', function() {
            forgotPasswordModal.style.display = 'none';
        });
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleResetPassword();
        });
    }

    // 关闭模态框（点击背景）
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// 设置注册步骤
function setupRegistrationSteps() {
    const step1NextBtn = document.getElementById('next-step-1');
    const step2PrevBtn = document.getElementById('prev-step-2');
    const step2NextBtn = document.getElementById('next-step-2');
    const completeBtn = document.getElementById('complete-registration');

    if (step1NextBtn) {
        step1NextBtn.addEventListener('click', validateStep1);
    }

    if (step2PrevBtn) {
        step2PrevBtn.addEventListener('click', () => goToStep(1));
    }

    if (step2NextBtn) {
        step2NextBtn.addEventListener('click', validateStep2);
    }

    if (completeBtn) {
        completeBtn.addEventListener('click', completeRegistration);
    }

    // 头像上传
    const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
    const avatarInput = document.getElementById('avatar-input');
    const avatarPreview = document.getElementById('avatar-preview');

    if (uploadAvatarBtn && avatarInput) {
        uploadAvatarBtn.addEventListener('click', () => avatarInput.click());
        avatarInput.addEventListener('change', handleAvatarUpload);
    }

    // 标签系统
    setupTagsSystem();
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('student-id').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    const errorMessage = document.getElementById('error-message');
    
    // 清除之前的错误信息
    if (errorMessage) {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }
    
    // 简单的验证
    if (!studentId || !password) {
        showError('请填写完整的登录信息');
        return;
    }
    
    // 验证学号格式
    if (!/^\d{10}$/.test(studentId)) {
        showError('学号必须是10位数字');
        return;
    }
    
    // 从本地存储获取用户数据
    const storedUsers = localStorage.getItem('campus_social_users');
    if (!storedUsers) {
        showError('用户不存在，请先注册');
        return;
    }
    
    const users = JSON.parse(storedUsers);
    const user = users.find(u => u.student_id === studentId && u.password === password);
    
    if (!user) {
        showError('学号或密码错误');
        return;
    }
    
    // 检查账号是否被封禁
    if (user.is_banned) {
        showError('该账号已被封禁，请联系管理员');
        return;
    }
    
    // 登录成功
    loginSuccess(user, rememberMe);
}

// 显示错误信息
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    } else {
        alert(message);
    }
}

// 登录成功
function loginSuccess(user, rememberMe) {
    // 更新用户最后活跃时间
    user.last_active = '刚刚';
    user.last_login = new Date().toISOString();
    
    // 保存用户数据到本地存储（不保存密码）
    const userData = { ...user };
    delete userData.password; // 移除密码，提高安全性
    
    if (rememberMe) {
        localStorage.setItem('campus_social_current_user', JSON.stringify(userData));
    } else {
        // 使用sessionStorage，关闭浏览器后失效
        sessionStorage.setItem('campus_social_current_user', JSON.stringify(userData));
    }
    
    // 更新用户列表中的最后活跃时间
    const storedUsers = localStorage.getItem('campus_social_users');
    if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex].last_active = '刚刚';
            users[userIndex].last_login = new Date().toISOString();
            localStorage.setItem('campus_social_users', JSON.stringify(users));
        }
    }
    
    // 只有一个跳转逻辑 - 删除重复的部分
    if (user.is_admin) {
        // 管理员跳转到首页，app.js会自动添加管理员面板链接
        window.location.href = 'index.html';
    } else {
        // 普通用户跳转到首页
        window.location.href = 'index.html';
    }
}

// 验证第一步（基本信息）
function validateStep1() {
    const studentId = document.getElementById('reg-student-id').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const email = document.getElementById('reg-email').value.trim();
    
    let isValid = true;
    
    // 验证学号
    if (!/^\d{10}$/.test(studentId)) {
        showFieldError('student-id-error', '学号必须是10位数字');
        isValid = false;
    } else {
        // 检查学号是否已注册
        const storedUsers = localStorage.getItem('campus_social_users');
        if (storedUsers) {
            const users = JSON.parse(storedUsers);
            if (users.some(u => u.student_id === studentId)) {
                showFieldError('student-id-error', '该学号已被注册');
                isValid = false;
            } else {
                hideFieldError('student-id-error');
            }
        }
    }
    
    // 验证密码
    if (password.length < 6) {
        showFieldError('password', '密码至少需要6位字符');
        isValid = false;
    } else {
        hideFieldError('password');
    }
    
    // 验证确认密码
    if (password !== confirmPassword) {
        showFieldError('confirm-password-error', '两次输入的密码不一致');
        isValid = false;
    } else {
        hideFieldError('confirm-password-error');
    }
    
    // 验证邮箱
    if (!isValidEmail(email)) {
        showFieldError('email', '请输入有效的邮箱地址');
        isValid = false;
    } else {
        hideFieldError('email');
    }
    
    if (isValid) {
        goToStep(2);
    }
}

// 验证第二步（个人资料）
function validateStep2() {
    const nickname = document.getElementById('reg-nickname').value.trim();
    
    let isValid = true;
    
    // 验证昵称
    if (nickname.length < 2 || nickname.length > 20) {
        showFieldError('nickname', '昵称长度应在2-20个字符之间');
        isValid = false;
    } else {
        // 检查昵称是否已存在
        const storedUsers = localStorage.getItem('campus_social_users');
        if (storedUsers) {
            const users = JSON.parse(storedUsers);
            if (users.some(u => u.nickname === nickname)) {
                showFieldError('nickname', '该昵称已被使用');
                isValid = false;
            } else {
                hideFieldError('nickname');
            }
        }
    }
    
    if (isValid) {
        goToStep(3);
        updateRegistrationSummary();
    }
}

// 跳转到指定步骤
function goToStep(stepNumber) {
    // 隐藏所有步骤
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // 显示指定步骤
    const targetStep = document.getElementById(`step-${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // 更新步骤指示器
    document.querySelectorAll('.step').forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        if (stepNum <= stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// 设置密码强度检测
function setupPasswordStrength() {
    const passwordInput = document.getElementById('reg-password');
    if (!passwordInput) return;
    
    passwordInput.addEventListener('input', updatePasswordStrength);
}

// 更新密码强度
function updatePasswordStrength() {
    const password = document.getElementById('reg-password').value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let color = '#e74c3c'; // 红色，弱
    let text = '密码强度：弱';
    
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // 根据强度设置颜色和文本
    if (strength >= 4) {
        color = '#2ecc71'; // 绿色，强
        text = '密码强度：强';
    } else if (strength >= 2) {
        color = '#f39c12'; // 橙色，中
        text = '密码强度：中';
    }
    
    // 更新UI
    strengthBar.style.setProperty('--strength-color', color);
    strengthBar.style.width = `${strength * 20}%`;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = text;
}

// 设置个人简介字符计数
function setupBioCharCount() {
    const bioTextarea = document.getElementById('reg-bio');
    if (!bioTextarea) return;
    
    bioTextarea.addEventListener('input', updateBioCharCount);
    updateBioCharCount(); // 初始化计数
}

// 更新个人简介字符计数
function updateBioCharCount() {
    const bioTextarea = document.getElementById('reg-bio');
    const charCount = document.getElementById('bio-char-count');
    
    if (!bioTextarea || !charCount) return;
    
    const count = bioTextarea.value.length;
    charCount.textContent = count;
    
    // 如果超过限制，显示警告
    if (count > 200) {
        charCount.style.color = '#e74c3c';
    } else {
        charCount.style.color = '#95a5a6';
    }
}

// 设置标签系统
function setupTagsSystem() {
    const tagsInput = document.getElementById('tags-input');
    const selectedTags = document.getElementById('selected-tags');
    const suggestedTags = document.querySelectorAll('.suggested-tags .tag');
    
    if (!tagsInput || !selectedTags) return;
    
    let selectedTagSet = new Set();
    
    // 输入标签
    tagsInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            e.preventDefault();
            const tag = this.value.trim();
            if (tag && !selectedTagSet.has(tag)) {
                addTag(tag);
                this.value = '';
            }
        }
    });
    
    // 点击建议标签
    suggestedTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const tagText = this.getAttribute('data-tag');
            if (!selectedTagSet.has(tagText)) {
                addTag(tagText);
            }
        });
    });
    
    // 添加标签
    function addTag(tag) {
        selectedTagSet.add(tag);
        
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.innerHTML = `
            ${tag}
            <span class="remove" onclick="removeTag(this, '${tag}')">&times;</span>
        `;
        
        selectedTags.appendChild(tagElement);
    }
    
    // 暴露给全局的移除标签函数
    window.removeTag = function(element, tag) {
        element.parentElement.remove();
        selectedTagSet.delete(tag);
    };
}

// 处理头像上传
function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
    }
    
    // 验证文件大小（2MB以内）
    if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB');
        return;
    }
    
    // 预览图片
    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarPreview = document.getElementById('avatar-preview');
        if (avatarPreview) {
            avatarPreview.src = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

// 更新注册摘要
function updateRegistrationSummary() {
    // 获取表单数据
    const studentId = document.getElementById('reg-student-id').value;
    const nickname = document.getElementById('reg-nickname').value;
    const email = document.getElementById('reg-email').value;
    
    // 更新摘要显示
    const summaryStudentId = document.getElementById('summary-student-id');
    const summaryNickname = document.getElementById('success-nickname');
    const summaryEmail = document.getElementById('summary-email');
    
    if (summaryStudentId) summaryStudentId.textContent = studentId;
    if (summaryNickname) summaryNickname.textContent = nickname;
    if (summaryEmail) summaryEmail.textContent = email;
}

// 完成注册
function completeRegistration() {
    const agreeTerms = document.getElementById('agree-terms');
    if (!agreeTerms.checked) {
        alert('请阅读并同意用户协议和隐私政策');
        return;
    }
    
    // 收集表单数据
    const formData = {
        id: Date.now(), // 使用时间戳作为ID
        student_id: document.getElementById('reg-student-id').value,
        password: document.getElementById('reg-password').value,
        nickname: document.getElementById('reg-nickname').value,
        email: document.getElementById('reg-email').value,
        avatar: document.getElementById('avatar-preview').src,
        bio: document.getElementById('reg-bio').value,
        major: document.getElementById('reg-major').value,
        realname: document.getElementById('reg-realname').value || '',
        tags: Array.from(new Set(Array.from(
            document.querySelectorAll('#selected-tags .tag')
        ).map(tag => tag.textContent.replace('×', '').trim()))),
        followers: 0,
        following: 0,
        is_active: true,
        last_active: '刚刚',
        created_at: new Date().toISOString(),
        is_admin: false
    };
    
    // 从本地存储获取现有用户
    //let users = [];
    const storedUsers = localStorage.getItem('campus_social_users');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    }
    
    // 添加新用户
    users.push(formData);
    
    // 保存到本地存储
    localStorage.setItem('campus_social_users', JSON.stringify(users));
    localStorage.setItem('campus_social_current_user', JSON.stringify(formData));
    
    // 跳转到首页
    alert('注册成功！欢迎加入深大校园圈');
    window.location.href = 'index.html';
}

// 处理注册
function handleRegistration(e) {
    e.preventDefault();
    // 注册逻辑已经在分步验证中处理
}

// 处理重置密码
function handleResetPassword() {
    const studentId = document.getElementById('reset-student-id').value.trim();
    const email = document.getElementById('reset-email').value.trim();
    
    // 简单的验证
    if (!studentId || !email) {
        alert('请填写完整的信息');
        return;
    }
    
    // 这里应该发送重置密码请求到服务器
    // 由于是模拟项目，只显示成功消息
    alert('重置密码链接已发送到您的邮箱，请查收。\n（模拟功能，实际需要后端支持）');
    
    // 关闭模态框
    const modal = document.getElementById('forgot-password-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 切换密码可见性
function togglePasswordVisibility(e) {
    const button = e.currentTarget;
    const icon = button.querySelector('i');
    const input = button.parentElement.querySelector('input');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// 辅助函数：显示字段错误
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// 辅助函数：隐藏字段错误
function hideFieldError(fieldId) {
    const errorElement = document.getElementById(fieldId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// 辅助函数：验证邮箱格式
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

