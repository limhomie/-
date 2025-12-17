// profile.js - 个人主页功能

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initProfile();
});

// 初始化个人主页
function initProfile() {
    // 检查登录状态
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('请先登录后访问个人主页');
        window.location.href = 'login.html';
        return;
    }
    
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    
    // 如果是查看他人主页
    if (userId && parseInt(userId) !== currentUser.id) {
        loadOtherUserProfile(parseInt(userId));
    } else {
        // 查看自己的主页
        loadUserProfile(currentUser);
        showCurrentUserFeatures();
    }
    
    // 设置事件监听器
    setupProfileEventListeners();
    
    // 加载用户的动态
    loadUserPosts();
    
    // 更新统计信息
    updateProfileStats();
}

// 获取当前用户
function getCurrentUser() {
    const storedUser = localStorage.getItem('campus_social_current_user') || 
                      sessionStorage.getItem('campus_social_current_user');
    return storedUser ? JSON.parse(storedUser) : null;
}

// 加载用户资料
function loadUserProfile(user) {
    // 基本信息
    document.getElementById('profile-name').textContent = user.nickname;
    document.getElementById('profile-bio').textContent = user.bio || '这个人很懒，还没有写简介...';
    document.getElementById('profile-avatar').src = user.avatar || 'images/default-avatar.png';
    
    // 详细资料
    document.getElementById('detail-student-id').textContent = user.student_id;
    document.getElementById('detail-email').textContent = user.email;
    document.getElementById('detail-major').textContent = user.major || '未设置';
    document.getElementById('detail-register-date').textContent = formatDate(user.created_at);
    document.getElementById('detail-last-active').textContent = user.last_active || '刚刚';
    
    // 兴趣标签
    renderUserTags(user.tags || []);
    
    // 更新导航栏的用户菜单
    updateNavUserMenu(user);
}

// 加载其他用户资料
function loadOtherUserProfile(userId) {
    const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const targetUser = users.find(u => u.id === userId);
    
    if (!targetUser) {
        showProfileError('用户不存在');
        return;
    }
    
    // 加载用户资料
    loadUserProfile(targetUser);
    
    // 更新页面标题
    document.title = `${targetUser.nickname} 的主页 - 深大校园圈`;
    
    // 显示关注和私信按钮
    const currentUser = getCurrentUser();
    const followBtn = document.getElementById('follow-btn');
    const messageBtn = document.getElementById('message-btn');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    
    if (followBtn) {
        followBtn.style.display = 'flex';
        updateFollowButton(followBtn, targetUser.id);
    }
    
    if (messageBtn) {
        messageBtn.style.display = 'flex';
    }
    
    if (editProfileBtn) {
        editProfileBtn.style.display = 'none';
    }
    
    // 隐藏设置标签（只有自己能看到）
    document.getElementById('settings-tab').style.display = 'none';
    
    // 加载该用户的动态
    loadUserPosts(userId);
}

// 显示当前用户特有的功能
function showCurrentUserFeatures() {
    const followBtn = document.getElementById('follow-btn');
    const messageBtn = document.getElementById('message-btn');
    
    if (followBtn) followBtn.style.display = 'none';
    if (messageBtn) messageBtn.style.display = 'none';
    
    // 显示设置标签
    document.getElementById('settings-tab').style.display = 'flex';
    
    // 加载设置页面
    loadSettingsPage();
}

// 渲染用户标签
function renderUserTags(tags) {
    const tagsContainer = document.getElementById('profile-tags');
    if (!tagsContainer) return;
    
    if (!tags || tags.length === 0) {
        tagsContainer.innerHTML = '<span class="no-tags">还没有添加兴趣标签</span>';
        return;
    }
    
    tagsContainer.innerHTML = tags.map(tag => `
        <span class="tag">${tag}</span>
    `).join('');
}

// 更新个人主页统计信息
function updateProfileStats() {
    const posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    const currentUser = getCurrentUser();
    
    if (!currentUser) return;
    
    // 统计用户的动态
    const userPosts = posts.filter(post => post.user_id === currentUser.id);
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
    
    // 获取关注数据
    const follows = JSON.parse(localStorage.getItem('campus_social_follows') || '[]');
    const followers = follows.filter(f => f.following_id === currentUser.id);
    const following = follows.filter(f => f.follower_id === currentUser.id);
    
    // 更新统计数字
    document.getElementById('post-count').textContent = userPosts.length;
    document.getElementById('like-count').textContent = totalLikes;
    document.getElementById('follower-count').textContent = followers.length;
    document.getElementById('following-count').textContent = following.length;
    
    // 为统计数字添加点击事件
    setupStatsClickEvents();
}

// 设置统计数字点击事件
function setupStatsClickEvents() {
    const statItems = document.querySelectorAll('.stat-item');
    
    statItems.forEach(item => {
        item.addEventListener('click', function() {
            const text = this.querySelector('span').textContent;
            
            switch(text) {
                case '粉丝':
                    switchTab('followers');
                    break;
                case '关注':
                    switchTab('following');
                    break;
                case '动态':
                    switchTab('posts');
                    break;
            }
        });
    });
}

// 加载用户的动态
function loadUserPosts(userId = null) {
    const currentUser = getCurrentUser();
    const targetUserId = userId || currentUser.id;
    const posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    
    // 筛选用户的动态
    const userPosts = posts.filter(post => post.user_id === targetUserId);
    
    // 按时间排序（最新的在前）
    userPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // 渲染动态
    renderUserPosts(userPosts);
    
    // 如果没有动态，显示提示
    if (userPosts.length === 0) {
        const container = document.getElementById('user-posts');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <p>还没有发布任何动态</p>
                    ${!userId ? '<a href="post-edit.html" class="btn btn-primary">发布第一条动态</a>' : ''}
                </div>
            `;
        }
    }
}

// 渲染用户动态
function renderUserPosts(posts) {
    const container = document.getElementById('user-posts');
    if (!container) return;
    
    container.innerHTML = posts.map(post => createPostCard(post)).join('');
}

// 创建动态卡片
function createPostCard(post) {
    // 构建图片HTML
    let imagesHTML = '';
    if (post.images && post.images.length > 0) {
        imagesHTML = `
            <div class="post-images">
                ${post.images.slice(0, 3).map(img => `
                    <img src="${img}" alt="动态图片" class="post-image" 
                         onclick="viewImage('${img}')">
                `).join('')}
                ${post.images.length > 3 ? `
                    <div class="more-images">+${post.images.length - 3}</div>
                ` : ''}
            </div>
        `;
    }
    
    // 构建标签HTML
    let tagsHTML = '';
    if (post.tags && post.tags.length > 0) {
        tagsHTML = `
            <div class="post-tags">
                ${post.tags.slice(0, 3).map(tag => `
                    <span class="tag">#${tag}</span>
                `).join('')}
            </div>
        `;
    }
    
    return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-user-info">
                    <span class="post-time">${post.created_at}</span>
                </div>
                <div class="post-actions-menu">
                    <button class="action-menu-btn" onclick="togglePostMenu(${post.id})">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                    <div class="post-menu-dropdown" id="post-menu-${post.id}">
                        <button onclick="editPost(${post.id})"><i class="fas fa-edit"></i> 编辑</button>
                        <button onclick="deletePost(${post.id})" class="danger">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            </div>
            <div class="post-content">
                <div class="post-text">${post.content}</div>
                ${tagsHTML}
                ${imagesHTML}
            </div>
            <div class="post-actions">
                <span class="post-stats-mini">
                    <i class="fas fa-heart"></i> ${post.likes}
                    <i class="fas fa-comment"></i> ${post.comments}
                    <i class="fas fa-share-alt"></i> ${post.shares}
                </span>
                <div class="post-actions-right">
                    <button class="action-btn" onclick="viewPostDetail(${post.id})">
                        <i class="fas fa-eye"></i> 查看
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 切换标签页
function switchTab(tabName) {
    // 更新标签按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 显示对应的内容
    document.querySelectorAll('.tab-content').forEach(content => {
        if (content.id === `${tabName}-content`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // 加载对应标签页的内容
    switch(tabName) {
        case 'likes':
            loadLikedPosts();
            break;
        case 'favorites':
            loadFavoritePosts();
            break;
        case 'followers':
            loadFollowers();
            break;
        case 'following':
            loadFollowing();
            break;
    }
}

// 加载点赞过的动态
function loadLikedPosts() {
    const posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    const currentUser = getCurrentUser();
    
    // 筛选点赞过的动态
    const likedPosts = posts.filter(post => post.is_liked);
    
    const container = document.getElementById('liked-posts');
    if (!container) return;
    
    if (likedPosts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <p>还没有点赞过任何动态</p>
            </div>
        `;
    } else {
        container.innerHTML = likedPosts.map(post => createPostCard(post)).join('');
    }
}

// 加载收藏的动态
function loadFavoritePosts() {
    const container = document.getElementById('favorite-posts');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-star"></i>
            <p>收藏功能将在后续版本中实现</p>
        </div>
    `;
}

// 加载粉丝列表
function loadFollowers() {
    const follows = JSON.parse(localStorage.getItem('campus_social_follows') || '[]');
    const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const currentUser = getCurrentUser();
    
    // 获取粉丝的用户ID
    const followerIds = follows
        .filter(f => f.following_id === currentUser.id)
        .map(f => f.follower_id);
    
    // 获取粉丝的用户信息
    const followers = users.filter(u => followerIds.includes(u.id));
    
    const container = document.getElementById('followers-list');
    if (!container) return;
    
    if (followers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>还没有粉丝</p>
            </div>
        `;
    } else {
        container.innerHTML = followers.map(user => createUserCard(user)).join('');
    }
}

// 加载关注列表
function loadFollowing() {
    const follows = JSON.parse(localStorage.getItem('campus_social_follows') || '[]');
    const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const currentUser = getCurrentUser();
    
    // 获取关注的用户ID
    const followingIds = follows
        .filter(f => f.follower_id === currentUser.id)
        .map(f => f.following_id);
    
    // 获取关注的用户信息
    const following = users.filter(u => followingIds.includes(u.id));
    
    const container = document.getElementById('following-list');
    if (!container) return;
    
    if (following.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <p>还没有关注任何人</p>
            </div>
        `;
    } else {
        container.innerHTML = following.map(user => createUserCard(user, true)).join('');
    }
}

// 创建用户卡片
function createUserCard(user, showUnfollow = false) {
    return `
        <div class="user-card" data-user-id="${user.id}">
            <img src="${user.avatar || 'images/default-avatar.png'}" 
                 alt="${user.nickname}" class="user-card-avatar">
            <div class="user-card-info">
                <div class="user-card-name">${user.nickname}</div>
                <div class="user-card-bio">${user.bio || '这个人很懒，还没有写简介...'}</div>
                <div class="user-card-stats">
                    <span>动态 ${getUserPostCount(user.id)}</span>
                    <span>粉丝 ${getUserFollowerCount(user.id)}</span>
                </div>
            </div>
            <div class="user-card-actions">
                <button class="btn btn-sm btn-outline" onclick="viewUserProfile(${user.id})">
                    查看
                </button>
                ${showUnfollow ? `
                    <button class="btn btn-sm btn-danger" onclick="unfollowUser(${user.id})">
                        取消关注
                    </button>
                ` : `
                    <button class="btn btn-sm btn-primary" onclick="followUser(${user.id})">
                        关注
                    </button>
                `}
            </div>
        </div>
    `;
}

// 获取用户的动态数量
function getUserPostCount(userId) {
    const posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    return posts.filter(post => post.user_id === userId).length;
}

// 获取用户的粉丝数量
function getUserFollowerCount(userId) {
    const follows = JSON.parse(localStorage.getItem('campus_social_follows') || '[]');
    return follows.filter(f => f.following_id === userId).length;
}

// 加载设置页面
function loadSettingsPage() {
    const container = document.getElementById('settings-content');
    if (!container) return;
    
    const currentUser = getCurrentUser();
    
    container.innerHTML = `
        <div class="settings-container">
            <!-- 账户设置 -->
            <div class="settings-section">
                <h3><i class="fas fa-user-cog"></i> 账户设置</h3>
                
                <div class="setting-item">
                    <label>账号状态</label>
                    <div class="account-status">
                        <span class="status-badge ${currentUser.is_banned ? 'banned' : 'active'}">
                            ${currentUser.is_banned ? '已封禁' : '正常'}
                        </span>
                        ${currentUser.is_banned ? `
                            <p class="setting-hint">账号被封禁，请联系管理员</p>
                        ` : ''}
                    </div>
                </div>
                
                <div class="setting-item">
                    <label>账户类型</label>
                    <div class="account-type">
                        <span class="type-badge ${currentUser.is_admin ? 'admin' : 'user'}">
                            ${currentUser.is_admin ? '管理员' : '普通用户'}
                        </span>
                    </div>
                </div>
                
                <div class="setting-actions">
                    <button class="btn btn-outline" onclick="showChangePassword()">
                        <i class="fas fa-key"></i> 修改密码
                    </button>
                    <button class="btn btn-danger" onclick="showDeleteAccount()">
                        <i class="fas fa-trash"></i> 注销账户
                    </button>
                </div>
            </div>
            
            <!-- 隐私设置 -->
            <div class="settings-section">
                <h3><i class="fas fa-shield-alt"></i> 隐私设置</h3>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="private-profile" ${currentUser.is_private ? 'checked' : ''}>
                        私密账号
                    </label>
                    <p class="setting-hint">开启后，只有你批准的用户才能关注你和查看你的动态</p>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="hide-online-status" ${currentUser.hide_online ? 'checked' : ''}>
                        隐藏在线状态
                    </label>
                    <p class="setting-hint">开启后，其他用户将看不到你的在线状态</p>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="allow-tags" ${currentUser.allow_tags ? 'checked' : ''}>
                        允许其他用户在动态中标记我
                    </label>
                </div>
                
                <div class="setting-actions">
                    <button class="btn btn-primary" onclick="savePrivacySettings()">
                        <i class="fas fa-save"></i> 保存隐私设置
                    </button>
                </div>
            </div>
            
            <!-- 通知设置 -->
            <div class="settings-section">
                <h3><i class="fas fa-bell"></i> 通知设置</h3>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="notify-likes" ${currentUser.notify_likes ? 'checked' : ''}>
                        点赞通知
                    </label>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="notify-comments" ${currentUser.notify_comments ? 'checked' : ''}>
                        评论通知
                    </label>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="notify-follows" ${currentUser.notify_follows ? 'checked' : ''}>
                        关注通知
                    </label>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="notify-mentions" ${currentUser.notify_mentions ? 'checked' : ''}>
                        提及通知
                    </label>
                </div>
                
                <div class="setting-actions">
                    <button class="btn btn-primary" onclick="saveNotificationSettings()">
                        <i class="fas fa-save"></i> 保存通知设置
                    </button>
                </div>
            </div>
            
            <!-- 数据管理 -->
            <div class="settings-section">
                <h3><i class="fas fa-database"></i> 数据管理</h3>
                
                <div class="setting-item">
                    <label>数据导出</label>
                    <p class="setting-hint">导出你的个人数据，包括动态、评论、关注关系等</p>
                    <button class="btn btn-outline" onclick="exportUserData()">
                        <i class="fas fa-download"></i> 导出数据
                    </button>
                </div>
                
                <div class="setting-item">
                    <label>清除数据</label>
                    <p class="setting-hint">删除你的所有动态、评论等数据（账户信息将保留）</p>
                    <button class="btn btn-danger" onclick="clearUserData()">
                        <i class="fas fa-trash"></i> 清除个人数据
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 设置事件监听器
function setupProfileEventListeners() {
    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // 编辑资料按钮
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', showEditProfileModal);
    }
    
    // 关注按钮
    const followBtn = document.getElementById('follow-btn');
    if (followBtn) {
        followBtn.addEventListener('click', toggleFollow);
    }
    
    // 私信按钮
    const messageBtn = document.getElementById('message-btn');
    if (messageBtn) {
        messageBtn.addEventListener('click', sendMessage);
    }
    
    // 模态框关闭按钮
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // 点击模态框背景关闭
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// 显示编辑资料模态框
function showEditProfileModal() {
    const currentUser = getCurrentUser();
    const modal = document.getElementById('edit-profile-modal');
    const form = document.getElementById('edit-profile-form');
    
    if (!modal || !form) return;
    
    // 填充表单数据
    form.innerHTML = `
        <div class="modal-form">
            <div class="form-group">
                <label for="edit-nickname">昵称</label>
                <input type="text" id="edit-nickname" value="${currentUser.nickname}" required>
            </div>
            
            <div class="form-group">
                <label for="edit-bio">个人简介</label>
                <textarea id="edit-bio" rows="3" maxlength="200">${currentUser.bio || ''}</textarea>
                <div class="char-count">
                    <span id="edit-bio-char-count">${(currentUser.bio || '').length}</span>/200
                </div>
            </div>
            
            <div class="form-group">
                <label for="edit-major">专业</label>
                <select id="edit-major">
                    <option value="">请选择专业</option>
                    <option value="计算机科学" ${currentUser.major === '计算机科学' ? 'selected' : ''}>计算机科学</option>
                    <option value="软件工程" ${currentUser.major === '软件工程' ? 'selected' : ''}>软件工程</option>
                    <option value="电子信息" ${currentUser.major === '电子信息' ? 'selected' : ''}>电子信息</option>
                    <option value="金融" ${currentUser.major === '金融' ? 'selected' : ''}>金融</option>
                    <option value="工商管理" ${currentUser.major === '工商管理' ? 'selected' : ''}>工商管理</option>
                    <option value="其他" ${currentUser.major === '其他' ? 'selected' : ''}>其他</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="edit-email">邮箱</label>
                <input type="email" id="edit-email" value="${currentUser.email}" required>
            </div>
            
            <div class="form-group">
                <label>兴趣标签</label>
                <div class="tags-input-container">
                    <input type="text" id="edit-tags-input" placeholder="添加标签（按回车确认）">
                    <div class="selected-tags" id="edit-selected-tags">
                        ${(currentUser.tags || []).map(tag => `
                            <span class="tag">${tag}
                                <span class="remove" onclick="removeEditTag('${tag}')">&times;</span>
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button type="button" class="btn btn-outline" onclick="closeModal()">取消</button>
                <button type="submit" class="btn btn-primary">保存修改</button>
            </div>
        </div>
    `;
    
    // 显示模态框
    modal.style.display = 'flex';
    
    // 设置字符计数
    const bioTextarea = form.querySelector('#edit-bio');
    const charCount = form.querySelector('#edit-bio-char-count');
    
    if (bioTextarea && charCount) {
        bioTextarea.addEventListener('input', function() {
            charCount.textContent = this.value.length;
        });
    }
    
    // 设置标签输入
    const tagsInput = form.querySelector('#edit-tags-input');
    if (tagsInput) {
        tagsInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = this.value.trim();
                if (tag) {
                    addEditTag(tag);
                    this.value = '';
                }
            }
        });
    }
    
    // 处理表单提交
    form.onsubmit = handleEditProfileSubmit;
}

// 处理编辑资料表单提交
function handleEditProfileSubmit(e) {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    
    // 获取表单数据
    const nickname = document.getElementById('edit-nickname').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    const major = document.getElementById('edit-major').value;
    const email = document.getElementById('edit-email').value.trim();
    
    // 获取标签
    const tags = Array.from(document.querySelectorAll('#edit-selected-tags .tag'))
        .map(tag => tag.textContent.replace('×', '').trim());
    
    // 验证数据
    if (!nickname) {
        alert('昵称不能为空');
        return;
    }
    
    if (nickname.length > 20) {
        alert('昵称不能超过20个字符');
        return;
    }
    
    if (!email) {
        alert('邮箱不能为空');
        return;
    }
    
    // 检查昵称是否被其他人使用
    const nicknameExists = users.some(u => 
        u.id !== currentUser.id && u.nickname === nickname
    );
    
    if (nicknameExists) {
        alert('该昵称已被使用，请选择其他昵称');
        return;
    }
    
    // 更新用户数据
    const updatedUser = {
        ...currentUser,
        nickname,
        bio,
        major,
        email,
        tags,
        updated_at: new Date().toISOString()
    };
    
    // 更新用户列表中的用户数据
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('campus_social_users', JSON.stringify(users));
    }
    
    // 更新当前登录用户数据
    localStorage.setItem('campus_social_current_user', JSON.stringify(updatedUser));
    
    // 更新动态中的用户名
    updatePostsUsername(currentUser.id, nickname, currentUser.avatar);
    
    // 关闭模态框
    closeModal();
    
    // 重新加载页面显示更新后的数据
    location.reload();
}

// 添加编辑标签
function addEditTag(tag) {
    const container = document.getElementById('edit-selected-tags');
    if (!container) return;
    
    // 检查是否已存在
    const existingTags = Array.from(container.querySelectorAll('.tag'))
        .map(t => t.textContent.replace('×', '').trim());
    
    if (existingTags.includes(tag)) {
        return;
    }
    
    const tagElement = document.createElement('span');
    tagElement.className = 'tag';
    tagElement.innerHTML = `
        ${tag}
        <span class="remove" onclick="removeEditTag('${tag}')">&times;</span>
    `;
    
    container.appendChild(tagElement);
}

// 移除编辑标签
function removeEditTag(tag) {
    const container = document.getElementById('edit-selected-tags');
    if (!container) return;
    
    const tagElement = Array.from(container.querySelectorAll('.tag'))
        .find(t => t.textContent.includes(tag));
    
    if (tagElement) {
        tagElement.remove();
    }
}

// 更新动态中的用户名
function updatePostsUsername(userId, newUsername, avatar) {
    const posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    
    posts.forEach(post => {
        if (post.user_id === userId) {
            post.username = newUsername;
            if (avatar) {
                post.avatar = avatar;
            }
        }
    });
    
    localStorage.setItem('campus_social_posts', JSON.stringify(posts));
}

// 关闭模态框
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// 关注/取消关注用户
function toggleFollow() {
    const currentUser = getCurrentUser();
    const urlParams = new URLSearchParams(window.location.search);
    const targetUserId = parseInt(urlParams.get('id'));
    
    if (!targetUserId) return;
    
    // 获取关注关系数据
    let follows = JSON.parse(localStorage.getItem('campus_social_follows') || '[]');
    
    // 检查是否已关注
    const existingFollow = follows.find(f => 
        f.follower_id === currentUser.id && f.following_id === targetUserId
    );
    
    const followBtn = document.getElementById('follow-btn');
    
    if (existingFollow) {
        // 取消关注
        follows = follows.filter(f => 
            !(f.follower_id === currentUser.id && f.following_id === targetUserId)
        );
        
        if (followBtn) {
            followBtn.innerHTML = '<i class="fas fa-user-plus"></i> 关注';
            followBtn.classList.remove('btn-danger');
            followBtn.classList.add('btn-primary');
        }
        
        showToast('已取消关注');
    } else {
        // 关注
        const newFollow = {
            id: Date.now(),
            follower_id: currentUser.id,
            following_id: targetUserId,
            created_at: new Date().toISOString()
        };
        
        follows.push(newFollow);
        
        if (followBtn) {
            followBtn.innerHTML = '<i class="fas fa-user-minus"></i> 已关注';
            followBtn.classList.remove('btn-primary');
            followBtn.classList.add('btn-danger');
        }
        
        showToast('关注成功');
    }
    
    // 保存关注关系
    localStorage.setItem('campus_social_follows', JSON.stringify(follows));
    
    // 更新统计信息
    updateProfileStats();
}

// 更新关注按钮状态
function updateFollowButton(button, targetUserId) {
    const currentUser = getCurrentUser();
    const follows = JSON.parse(localStorage.getItem('campus_social_follows') || '[]');
    
    const isFollowing = follows.some(f => 
        f.follower_id === currentUser.id && f.following_id === targetUserId
    );
    
    if (isFollowing) {
        button.innerHTML = '<i class="fas fa-user-minus"></i> 已关注';
        button.classList.remove('btn-primary');
        button.classList.add('btn-danger');
    } else {
        button.innerHTML = '<i class="fas fa-user-plus"></i> 关注';
        button.classList.remove('btn-danger');
        button.classList.add('btn-primary');
    }
}

// 发送私信
function sendMessage() {
    alert('私信功能将在后续版本中实现');
}

// 查看用户资料
function viewUserProfile(userId) {
    window.location.href = `profile.html?id=${userId}`;
}

// 关注用户
function followUser(userId) {
    const currentUser = getCurrentUser();
    let follows = JSON.parse(localStorage.getItem('campus_social_follows') || '[]');
    
    // 检查是否已关注
    const existingFollow = follows.find(f => 
        f.follower_id === currentUser.id && f.following_id === userId
    );
    
    if (existingFollow) {
        alert('已经关注过该用户');
        return;
    }
    
    // 关注
    const newFollow = {
        id: Date.now(),
        follower_id: currentUser.id,
        following_id: userId,
        created_at: new Date().toISOString()
    };
    
    follows.push(newFollow);
    localStorage.setItem('campus_social_follows', JSON.stringify(follows));
    
    showToast('关注成功');
    loadFollowing();
}

// 取消关注用户
function unfollowUser(userId) {
    if (!confirm('确定要取消关注吗？')) {
        return;
    }
    
    const currentUser = getCurrentUser();
    let follows = JSON.parse(localStorage.getItem('campus_social_follows') || '[]');
    
    // 过滤掉这条关注关系
    follows = follows.filter(f => 
        !(f.follower_id === currentUser.id && f.following_id === userId)
    );
    
    localStorage.setItem('campus_social_follows', JSON.stringify(follows));
    
    showToast('已取消关注');
    loadFollowing();
}

// 查看动态详情
function viewPostDetail(postId) {
    window.location.href = `post-detail.html?id=${postId}`;
}

// 切换动态菜单
function togglePostMenu(postId) {
    const menu = document.getElementById(`post-menu-${postId}`);
    if (!menu) return;
    
    // 切换显示状态
    const isVisible = menu.style.display === 'block';
    menu.style.display = isVisible ? 'none' : 'block';
    
    // 点击页面其他地方关闭菜单
    if (!isVisible) {
        const closeMenu = function(e) {
            if (!e.target.closest(`#post-menu-${postId}`) && !e.target.closest(`.action-menu-btn[onclick*="${postId}"]`)) {
                menu.style.display = 'none';
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 10);
    }
}

// 编辑动态
function editPost(postId) {
    window.location.href = `post-edit.html?id=${postId}`;
}

// 删除动态
function deletePost(postId) {
    if (!confirm('确定要删除这条动态吗？删除后无法恢复。')) {
        return;
    }
    
    // 删除动态
    let posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('campus_social_posts', JSON.stringify(posts));
    
    // 删除相关评论
    let comments = JSON.parse(localStorage.getItem('campus_social_comments') || '[]');
    comments = comments.filter(c => c.post_id !== postId);
    localStorage.setItem('campus_social_comments', JSON.stringify(comments));
    
    // 从页面移除
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
        postElement.remove();
    }
    
    showToast('动态已删除');
    updateProfileStats();
}

// 显示错误信息
function showProfileError(message) {
    const container = document.querySelector('.profile-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-container">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>${message}</h2>
            <a href="index.html" class="btn btn-primary">返回首页</a>
        </div>
    `;
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '未知';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // 如果是今天，显示时间
    if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    // 如果是今年，显示月日
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString('zh-CN', { 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // 否则显示完整日期
    return date.toLocaleDateString('zh-CN');
}

// 显示Toast提示
function showToast(message) {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 更新导航栏用户菜单
function updateNavUserMenu(user) {
    const userMenu = document.getElementById('user-menu');
    if (!userMenu) return;
    
    userMenu.innerHTML = `
        <img src="${user.avatar || 'images/default-avatar.png'}" alt="头像" class="user-avatar">
        <span class="user-name">${user.nickname}</span>
        <div class="dropdown-menu">
            <a href="profile.html"><i class="fas fa-user"></i> 个人主页</a>
            <a href="profile.html?tab=settings"><i class="fas fa-cog"></i> 账户设置</a>
            ${user.is_admin ? '<a href="admin.html"><i class="fas fa-cogs"></i> 管理面板</a>' : ''}
            <hr>
            <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> 退出登录</a>
        </div>
    `;
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('campus_social_current_user');
        sessionStorage.removeItem('campus_social_current_user');
        window.location.href = 'index.html';
    }
}

// 以下是设置页面的功能函数
function showChangePassword() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>修改密码</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="change-password-form">
                    <div class="form-group">
                        <label for="current-password">当前密码</label>
                        <input type="password" id="current-password" required>
                    </div>
                    <div class="form-group">
                        <label for="new-password">新密码</label>
                        <input type="password" id="new-password" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label for="confirm-new-password">确认新密码</label>
                        <input type="password" id="confirm-new-password" required>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">取消</button>
                        <button type="submit" class="btn btn-primary">修改密码</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 处理表单提交
    modal.querySelector('form').onsubmit = function(e) {
        e.preventDefault();
        // 这里应该实现修改密码的逻辑
        alert('修改密码功能将在后续版本中实现');
        modal.remove();
    };
}

function showDeleteAccount() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-exclamation-triangle"></i> 注销账户</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="warning-box">
                    <h4>警告</h4>
                    <p>注销账户将导致：</p>
                    <ul>
                        <li>所有个人资料将被永久删除</li>
                        <li>所有动态和评论将被移除</li>
                        <li>所有关注关系将被清除</li>
                        <li>此操作不可撤销</li>
                    </ul>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">取消</button>
                    <button type="button" class="btn btn-danger" onclick="confirmDeleteAccount()">确认注销</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function confirmDeleteAccount() {
    if (confirm('确定要永久注销账户吗？此操作不可撤销！')) {
        alert('账户注销功能将在后续版本中实现');
        document.querySelector('.modal').remove();
    }
}

function savePrivacySettings() {
    const currentUser = getCurrentUser();
    const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    
    // 获取设置值
    const updatedUser = {
        ...currentUser,
        is_private: document.getElementById('private-profile').checked,
        hide_online: document.getElementById('hide-online-status').checked,
        allow_tags: document.getElementById('allow-tags').checked,
        notify_likes: document.getElementById('notify-likes').checked,
        notify_comments: document.getElementById('notify-comments').checked,
        notify_follows: document.getElementById('notify-follows').checked,
        notify_mentions: document.getElementById('notify-mentions').checked,
        updated_at: new Date().toISOString()
    };
    
    // 更新用户数据
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('campus_social_users', JSON.stringify(users));
    }
    
    // 更新当前登录用户
    localStorage.setItem('campus_social_current_user', JSON.stringify(updatedUser));
    
    showToast('设置已保存');
}

function saveNotificationSettings() {
    savePrivacySettings(); // 复用同一个函数
}

function exportUserData() {
    const currentUser = getCurrentUser();
    
    // 获取用户的所有数据
    const userData = {
        profile: currentUser,
        posts: JSON.parse(localStorage.getItem('campus_social_posts') || '[]')
            .filter(post => post.user_id === currentUser.id),
        comments: JSON.parse(localStorage.getItem('campus_social_comments') || '[]')
            .filter(comment => comment.user_id === currentUser.id),
        follows: JSON.parse(localStorage.getItem('campus_social_follows') || '[]')
            .filter(f => f.follower_id === currentUser.id || f.following_id === currentUser.id),
        export_date: new Date().toISOString()
    };
    
    // 创建JSON文件并下载
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(dataBlob);
    downloadLink.download = `campus_social_export_${currentUser.student_id}_${Date.now()}.json`;
    downloadLink.click();
    
    showToast('数据导出成功');
}

function clearUserData() {
    if (!confirm('确定要清除所有个人数据吗？此操作不可撤销！')) {
        return;
    }
    
    const currentUser = getCurrentUser();
    
    // 清除动态
    let posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    posts = posts.filter(post => post.user_id !== currentUser.id);
    localStorage.setItem('campus_social_posts', JSON.stringify(posts));
    
    // 清除评论
    let comments = JSON.parse(localStorage.getItem('campus_social_comments') || '[]');
    comments = comments.filter(comment => comment.user_id !== currentUser.id);
    localStorage.setItem('campus_social_comments', JSON.stringify(comments));
    
    // 清除关注关系
    let follows = JSON.parse(localStorage.getItem('campus_social_follows') || '[]');
    follows = follows.filter(f => 
        f.follower_id !== currentUser.id && f.following_id !== currentUser.id
    );
    localStorage.setItem('campus_social_follows', JSON.stringify(follows));
    
    showToast('个人数据已清除');
    location.reload();
}