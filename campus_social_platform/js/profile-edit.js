// profile-edit.js - 编辑资料功能（修复标签添加问题）

// 全局变量
let isModalOpen = false;
let userTags = [];

// 初始化编辑资料功能
function initProfileEdit() {
    console.log('初始化编辑资料功能');
    
    // 清理重复元素
    cleanDuplicateElements();
    
    // 绑定模态框事件
    bindModalEvents();
    
    // 初始化标签功能
    initTagsFeature();
    
    console.log('编辑资料功能初始化完成');
}

// 清理重复元素
function cleanDuplicateElements() {
    console.log('清理重复元素...');
    
    // 清理重复模态框
    const modals = document.querySelectorAll('#edit-profile-modal');
    if (modals.length > 1) {
        console.log('清理: 发现重复模态框，保留第一个');
        for (let i = 1; i < modals.length; i++) {
            modals[i].remove();
        }
    }
    
    // 清理重复按钮
    ['save-profile', 'cancel-edit', 'close-edit-modal'].forEach(id => {
        const elements = document.querySelectorAll(`#${id}`);
        if (elements.length > 1) {
            console.log(`清理: 发现重复 #${id}，保留第一个`);
            for (let i = 1; i < elements.length; i++) {
                elements[i].remove();
            }
        }
    });
}

// 绑定模态框事件
function bindModalEvents() {
    console.log('绑定模态框事件');
    
    const modal = document.getElementById('edit-profile-modal');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const closeBtn = document.getElementById('close-edit-modal');
    const cancelBtn = document.getElementById('cancel-edit');
    const saveBtn = document.getElementById('save-profile');
    
    // 绑定编辑资料按钮
    if (editProfileBtn) {
        // 移除可能存在的旧事件监听器
        editProfileBtn.removeEventListener('click', openEditModal);
        editProfileBtn.addEventListener('click', openEditModal);
        console.log('编辑资料按钮事件已绑定');
    }
    
    // 绑定关闭按钮
    if (closeBtn) {
        closeBtn.removeEventListener('click', closeEditModal);
        closeBtn.addEventListener('click', closeEditModal);
    }
    
    // 绑定取消按钮
    if (cancelBtn) {
        cancelBtn.removeEventListener('click', closeEditModal);
        cancelBtn.addEventListener('click', closeEditModal);
    }
    
    // 绑定保存按钮
    if (saveBtn) {
        saveBtn.removeEventListener('click', saveProfileData);
        saveBtn.addEventListener('click', saveProfileData);
    }
    
    // 点击模态框外部关闭
    if (modal) {
        modal.removeEventListener('click', modalClickHandler);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeEditModal();
            }
        });
    }
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isModalOpen) {
            closeEditModal();
        }
    });
}

// 初始化标签功能
function initTagsFeature() {
    console.log('初始化标签功能');
    
    const tagInput = document.getElementById('tag-input');
    if (!tagInput) {
        console.error('找不到标签输入框');
        return;
    }
    
    // 移除旧的事件监听器
    tagInput.removeEventListener('keydown', tagInputKeydownHandler);
    
    // 标签输入事件 - 修复这里！
    tagInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = tagInput.value.trim();
            if (tag) {
                addTag(tag);  // 使用正确的函数名
                tagInput.value = '';
            }
        }
    });
}

// 添加标签（主函数）
function addTag(tagText) {
    console.log('添加标签:', tagText);
    
    const selectedTagsContainer = document.getElementById('selected-tags');
    if (!selectedTagsContainer) {
        console.error('找不到标签容器');
        return;
    }
    
    // 检查标签是否已存在
    if (userTags.includes(tagText)) {
        showMessage('该标签已存在', 'error');
        return;
    }
    
    // 检查标签数量限制
    if (userTags.length >= 5) {
        showMessage('最多只能添加5个标签', 'error');
        return;
    }
    
    // 检查标签长度
    if (tagText.length > 10) {
        showMessage('标签不能超过10个字符', 'error');
        return;
    }
    
    // 添加到数组
    userTags.push(tagText);
    
    // 创建并添加标签元素
    const tagElement = createTagElement(tagText);
    selectedTagsContainer.appendChild(tagElement);
    
    console.log('标签添加成功，当前标签:', userTags);
}

// 创建标签元素
function createTagElement(tagText) {
    const tagElement = document.createElement('div');
    tagElement.className = 'tag-item';
    tagElement.innerHTML = `
        ${tagText}
        <button type="button" class="remove-tag">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 添加删除事件
    tagElement.querySelector('.remove-tag').addEventListener('click', function() {
        tagElement.remove();
        // 从userTags数组中移除
        const index = userTags.indexOf(tagText);
        if (index > -1) {
            userTags.splice(index, 1);
            console.log('删除标签，当前标签:', userTags);
        }
    });
    
    return tagElement;
}

// 打开编辑模态框
function openEditModal() {
    console.log('打开编辑资料模态框');
    
    try {
        const modal = document.getElementById('edit-profile-modal');
        if (!modal) {
            console.error('错误: 模态框元素不存在');
            return;
        }
        
        // 填充表单数据
        populateModalData();
        
        // 显示模态框
        modal.style.display = 'flex';
        isModalOpen = true;
        
        // 强制重绘，确保transition生效
        void modal.offsetWidth;
        
        // 添加active类触发动画
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // 防止背景滚动
        document.body.style.overflow = 'hidden';
        
        // 焦点移到昵称输入框
        setTimeout(() => {
            const nicknameInput = document.getElementById('edit-nickname');
            if (nicknameInput) {
                nicknameInput.focus();
                nicknameInput.select();
            }
        }, 100);
        
        // 初始化字符计数
        updateCharCount();
        
        // 重新绑定标签事件（确保每次打开都有效）
        bindTagInputEvent();
        
    } catch (error) {
        console.error('打开模态框时出错:', error);
        showMessage('打开编辑页面失败', 'error');
    }
}

// 绑定标签输入事件（确保每次打开模态框都有效）
function bindTagInputEvent() {
    const tagInput = document.getElementById('tag-input');
    if (!tagInput) return;
    
    // 移除旧的事件监听器
    tagInput.removeEventListener('keydown', tagInputKeydownHandler);
    
    // 添加新的事件监听器
    tagInput.addEventListener('keydown', tagInputKeydownHandler);
}

// 标签输入键盘事件处理器
function tagInputKeydownHandler(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const tag = e.target.value.trim();
        if (tag) {
            addTag(tag);
            e.target.value = '';
        }
    }
}

// 填充模态框数据
function populateModalData() {
    console.log('填充模态框数据');
    
    try {
        // 从页面获取当前用户信息
        const nicknameElement = document.getElementById('profile-name');
        const bioElement = document.getElementById('profile-bio');
        const majorElement = document.getElementById('detail-major');
        const emailElement = document.getElementById('detail-email');
        const tagsContainer = document.getElementById('profile-tags');
        
        // 重置userTags数组
        userTags = [];
        
        // 获取当前用户标签
        if (tagsContainer) {
            const tagElements = tagsContainer.querySelectorAll('.tag-item');
            userTags = Array.from(tagElements).map(tag => {
                let text = tag.textContent.trim();
                // 清理文本，移除可能存在的×符号
                text = text.replace(/×/g, '').trim();
                return text;
            }).filter(tag => tag);
        }
        
        console.log('加载的用户标签:', userTags);
        
        // 填充表单
        const nicknameInput = document.getElementById('edit-nickname');
        const bioInput = document.getElementById('edit-bio');
        const majorSelect = document.getElementById('edit-major');
        const emailInput = document.getElementById('edit-email');
        const selectedTagsContainer = document.getElementById('selected-tags');
        
        if (nicknameInput && nicknameElement) {
            nicknameInput.value = nicknameElement.textContent || '';
        }
        
        if (bioInput && bioElement) {
            bioInput.value = bioElement.textContent || '';
        }
        
        if (majorSelect && majorElement) {
            majorSelect.value = majorElement.textContent || '计算机科学';
        }
        
        if (emailInput && emailElement) {
            emailInput.value = emailElement.textContent || '';
        }
        
        // 填充标签
        if (selectedTagsContainer) {
            selectedTagsContainer.innerHTML = '';
            userTags.forEach(tag => {
                const tagElement = createTagElement(tag);
                selectedTagsContainer.appendChild(tagElement);
            });
        }
        
    } catch (error) {
        console.error('填充模态框数据时出错:', error);
    }
}

// 更新字符计数
function updateCharCount() {
    try {
        const nicknameInput = document.getElementById('edit-nickname');
        const bioInput = document.getElementById('edit-bio');
        const nicknameCount = document.getElementById('nickname-count');
        const bioCount = document.getElementById('bio-count');
        
        if (nicknameInput && nicknameCount) {
            nicknameCount.textContent = nicknameInput.value.length;
        }
        
        if (bioInput && bioCount) {
            bioCount.textContent = bioInput.value.length;
        }
    } catch (error) {
        console.error('更新字符计数时出错:', error);
    }
}

// 关闭模态框
function closeEditModal() {
    console.log('关闭编辑资料模态框');
    
    try {
        const modal = document.getElementById('edit-profile-modal');
        if (!modal) return;
        
        // 移除active类
        modal.classList.remove('active');
        isModalOpen = false;
        
        // 等待动画完成后隐藏
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
        
    } catch (error) {
        console.error('关闭模态框时出错:', error);
    }
}

// 保存资料数据
function saveProfileData() {
    console.log('保存资料数据');
    
    try {
        // 获取表单数据
        const formData = {
            nickname: document.getElementById('edit-nickname')?.value.trim() || '',
            bio: document.getElementById('edit-bio')?.value.trim() || '',
            major: document.getElementById('edit-major')?.value || '计算机科学',
            email: document.getElementById('edit-email')?.value.trim() || '',
            tags: userTags
        };
        
        console.log('要保存的表单数据:', formData);
        
        // 表单验证
        if (!validateFormData(formData)) {
            return;
        }
        
        // 显示加载状态
        const saveBtn = document.getElementById('save-profile');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
        saveBtn.disabled = true;
        
        // 保存数据（模拟API请求）
        setTimeout(() => {
            try {
                // 更新页面显示
                updateProfileDisplay(formData);
                
                // 更新本地存储
                updateLocalStorage(formData);
                
                // 显示成功消息
                showMessage('资料更新成功！', 'success');
                
            } catch (error) {
                console.error('保存过程中出错:', error);
                showMessage('保存失败，请重试', 'error');
            } finally {
                // 恢复按钮状态
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
                
                // 关闭模态框
                closeEditModal();
            }
            
        }, 1000);
        
    } catch (error) {
        console.error('保存资料时出错:', error);
        showMessage('保存失败，请重试', 'error');
        
        // 恢复按钮状态
        const saveBtn = document.getElementById('save-profile');
        if (saveBtn) {
            saveBtn.innerHTML = '保存修改';
            saveBtn.disabled = false;
        }
    }
}

// 表单验证
function validateFormData(data) {
    console.log('验证表单数据:', data);
    
    // 验证昵称
    if (!data.nickname || data.nickname.trim() === '') {
        showMessage('请输入昵称', 'error');
        document.getElementById('edit-nickname')?.focus();
        return false;
    }
    
    if (data.nickname.length < 2) {
        showMessage('昵称至少2个字符', 'error');
        document.getElementById('edit-nickname')?.focus();
        return false;
    }
    
    if (data.nickname.length > 20) {
        showMessage('昵称不能超过20个字符', 'error');
        document.getElementById('edit-nickname')?.focus();
        return false;
    }
    
    // 验证邮箱
    if (!data.email || data.email.trim() === '') {
        showMessage('请输入邮箱', 'error');
        document.getElementById('edit-email')?.focus();
        return false;
    }
    
    if (!isValidEmail(data.email)) {
        showMessage('请输入有效的邮箱地址', 'error');
        document.getElementById('edit-email')?.focus();
        return false;
    }
    
    // 验证个人简介长度
    if (data.bio.length > 200) {
        showMessage('个人简介不能超过200个字符', 'error');
        document.getElementById('edit-bio')?.focus();
        return false;
    }
    
    return true;
}

// 邮箱验证
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 更新页面显示
function updateProfileDisplay(data) {
    console.log('更新页面显示:', data);
    
    try {
        // 更新基本信息
        const nameElement = document.getElementById('profile-name');
        const bioElement = document.getElementById('profile-bio');
        const majorElement = document.getElementById('detail-major');
        const emailElement = document.getElementById('detail-email');
        const tagsContainer = document.getElementById('profile-tags');
        
        if (nameElement) {
            nameElement.textContent = data.nickname;
            console.log('更新昵称:', data.nickname);
        }
        
        if (bioElement) {
            bioElement.textContent = data.bio;
            console.log('更新简介:', data.bio);
        }
        
        if (majorElement) {
            majorElement.textContent = data.major;
            console.log('更新专业:', data.major);
        }
        
        if (emailElement) {
            emailElement.textContent = data.email;
            console.log('更新邮箱:', data.email);
        }
        
        // 更新标签
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            if (data.tags && data.tags.length > 0) {
                data.tags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'tag-item';
                    tagElement.textContent = tag;
                    tagsContainer.appendChild(tagElement);
                });
                console.log('更新标签:', data.tags);
            } else {
                tagsContainer.innerHTML = '<span class="no-tags">还没有添加兴趣标签</span>';
            }
        }
        
    } catch (error) {
        console.error('更新页面显示时出错:', error);
    }
}

// 更新本地存储
function updateLocalStorage(data) {
    console.log('更新本地存储');
    
    try {
        // 获取当前用户
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.error('未找到当前用户');
            return;
        }
        
        // 获取所有用户
        const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
        
        // 更新用户数据
        const updatedUser = {
            ...currentUser,
            nickname: data.nickname,
            bio: data.bio,
            major: data.major,
            email: data.email,
            tags: data.tags,
            updated_at: new Date().toISOString()
        };
        
        console.log('更新后的用户数据:', updatedUser);
        
        // 更新用户列表
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem('campus_social_users', JSON.stringify(users));
        } else {
            console.warn('用户不在用户列表中，可能是新用户');
            users.push(updatedUser);
            localStorage.setItem('campus_social_users', JSON.stringify(users));
        }
        
        // 更新当前登录用户
        localStorage.setItem('campus_social_current_user', JSON.stringify(updatedUser));
        
        console.log('本地存储更新完成');
        
    } catch (error) {
        console.error('更新本地存储时出错:', error);
    }
}

// 获取当前用户
function getCurrentUser() {
    try {
        const storedUser = localStorage.getItem('campus_social_current_user') || 
                          sessionStorage.getItem('campus_social_current_user');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error('获取当前用户时出错:', error);
        return null;
    }
}

// 显示消息
function showMessage(message, type) {
    console.log(`显示消息: ${message} (${type})`);
    
    try {
        // 移除现有的消息
        const existingMsg = document.querySelector('.message-toast');
        if (existingMsg) {
            existingMsg.remove();
        }
        
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `message-toast ${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            background-color: ${type === 'success' ? '#4CAF50' : '#F44336'};
            color: white;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease forwards;
        `;
        
        // 添加到页面
        document.body.appendChild(messageElement);
        
        // 3秒后移除
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.remove();
                    }
                }, 300);
            }
        }, 3000);
        
    } catch (error) {
        console.error('显示消息时出错:', error);
        // 降级方案
        alert(message);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('profile-edit.js加载完成');
    
    // 初始化编辑资料功能
    initProfileEdit();
    
    // 绑定输入事件用于字符计数
    const nicknameInput = document.getElementById('edit-nickname');
    const bioInput = document.getElementById('edit-bio');
    
    if (nicknameInput) {
        nicknameInput.removeEventListener('input', updateCharCount);
        nicknameInput.addEventListener('input', updateCharCount);
    }
    
    if (bioInput) {
        bioInput.removeEventListener('input', updateCharCount);
        bioInput.addEventListener('input', updateCharCount);
    }
    
    // 检查全局函数是否可用
    window.addTag = addTag;
    window.openEditModal = openEditModal;
    window.closeEditModal = closeEditModal;
    window.saveProfileData = saveProfileData;
    
    console.log('全局函数已注册:', {
        addTag: typeof addTag,
        openEditModal: typeof openEditModal,
        closeEditModal: typeof closeEditModal,
        saveProfileData: typeof saveProfileData
    });
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .no-tags {
        color: #999;
        font-style: italic;
    }
`;
document.head.appendChild(style);