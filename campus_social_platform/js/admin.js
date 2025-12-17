// admin.js - 管理员功能

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initAdminPanel();
});

// 初始化管理员面板
function initAdminPanel() {
    // 检查管理员权限
    if (!checkAdminAccess()) {
        return;
    }
    
    // 加载数据
    loadAdminData();
    
    // 设置事件监听器
    setupAdminEventListeners();
    
    // 初始化控制台
    initDashboard();
}

// 检查管理员权限
function checkAdminAccess() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        alert('请先登录后访问管理面板');
        window.location.href = 'login.html';
        return false;
    }
    
    if (!currentUser.is_admin) {
        alert('您没有权限访问管理面板');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// 获取当前用户
function getCurrentUser() {
    const storedUser = localStorage.getItem('campus_social_current_user') || 
                      sessionStorage.getItem('campus_social_current_user');
    return storedUser ? JSON.parse(storedUser) : null;
}

// 加载管理员数据
function loadAdminData() {
    // 更新管理员用户名
    const currentUser = getCurrentUser();
    const adminUsername = document.getElementById('admin-username');
    if (adminUsername) {
        adminUsername.textContent = currentUser.nickname;
    }
    
    // 更新统计信息
    updateAdminStats();
}

// 设置管理员事件监听器
function setupAdminEventListeners() {
    // 菜单项点击
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            switchAdminSection(section);
        });
    });
    
    // 用户搜索
    const userSearch = document.getElementById('user-search');
    if (userSearch) {
        userSearch.addEventListener('input', searchUsers);
    }
    
    // 添加用户按钮
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', showAddUserModal);
    }
    
    // 用户筛选
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterUsers(filter);
        });
    });
    
    // 用户排序
    const userSort = document.getElementById('user-sort');
    if (userSort) {
        userSort.addEventListener('change', sortUsers);
    }
    
    // 全选用户
    const selectAllUsers = document.getElementById('select-all-users');
    if (selectAllUsers) {
        selectAllUsers.addEventListener('change', toggleSelectAllUsers);
    }
    
    // 批量操作
    const applyBulkAction = document.getElementById('apply-bulk-action');
    if (applyBulkAction) {
        applyBulkAction.addEventListener('click', applyBulkActions);
    }
    
    // 导出用户数据
    const exportUsersBtn = document.getElementById('export-users-btn');
    if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', exportUsersData);
    }
}

// 切换管理员区域
function switchAdminSection(sectionName) {
    // 更新菜单项状态
    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // 显示对应的区域
    document.querySelectorAll('.admin-section').forEach(section => {
        if (section.id === `${sectionName}-section`) {
            section.classList.add('active');
            
            // 加载区域数据
            switch(sectionName) {
                case 'users':
                    loadUsersTable();
                    break;
                case 'posts':
                    loadPostsManagement();
                    break;
            }
        } else {
            section.classList.remove('active');
        }
    });
}

// 初始化控制台
function initDashboard() {
    updateDashboardStats();
    loadRecentActivity();
}

// 更新控制台统计信息
function updateDashboardStats() {
    const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    
    // 总用户数
    const totalUsers = document.getElementById('total-users');
    if (totalUsers) {
        totalUsers.textContent = users.length;
    }
    
    // 总动态数
    const totalPosts = document.getElementById('total-posts');
    if (totalPosts) {
        totalPosts.textContent = posts.length;
    }
    
    // 今日注册用户数（模拟数据）
    const todayRegisters = document.getElementById('today-registers');
    if (todayRegisters) {
        todayRegisters.textContent = Math.floor(Math.random() * 5) + 1;
    }
    
    // 今日动态数
    const todayPostsAdmin = document.getElementById('today-posts-admin');
    if (todayPostsAdmin) {
        // 模拟计算今日动态数（实际应该根据时间筛选）
        const todayCount = posts.filter(p => 
            p.created_at.includes('刚刚') || p.created_at.includes('分钟前') || p.created_at.includes('小时前')
        ).length;
        todayPostsAdmin.textContent = Math.max(todayCount, Math.floor(Math.random() * 3) + 1);
    }
    
    // 封禁用户数
    const bannedUsers = document.getElementById('banned-users');
    if (bannedUsers) {
        const bannedCount = users.filter(u => u.is_banned).length;
        bannedUsers.textContent = bannedCount;
    }
    
    // 待处理举报数（模拟数据）
    const pendingReports = document.getElementById('pending-reports');
    if (pendingReports) {
        pendingReports.textContent = Math.floor(Math.random() * 3);
    }
}

// 更新管理员统计信息
function updateAdminStats() {
    const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    
    // 更新侧边栏统计
    const totalUsers = document.getElementById('total-users');
    const totalPostsStat = document.getElementById('total-posts');
    
    if (totalUsers) totalUsers.textContent = users.length;
    if (totalPostsStat) totalPostsStat.textContent = posts.length;
}

// 加载最近活动
function loadRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;
    
    // 获取最近的数据（模拟）
    const recentActivities = [
        {
            icon: 'fa-user-plus',
            color: '#3498db',
            text: '新用户 "张三" 注册了账号',
            time: '2分钟前'
        },
        {
            icon: 'fa-newspaper',
            color: '#2ecc71',
            text: '用户 "李四" 发布了一条新动态',
            time: '15分钟前'
        },
        {
            icon: 'fa-comment',
            color: '#f39c12',
            text: '用户 "王五" 评论了一条动态',
            time: '30分钟前'
        },
        {
            icon: 'fa-user',
            color: '#e74c3c',
            text: '管理员封禁了用户 "违规用户"',
            time: '1小时前'
        }
    ];
    
    container.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon" style="background: ${activity.color}">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// 加载用户表格
function loadUsersTable() {
    const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    const follows = JSON.parse(localStorage.getItem('campus_social_follows') || '[]');
    
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    
    // 按注册时间排序（最新的在前）
    const sortedUsers = [...users].sort((a, b) => 
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
    
    tbody.innerHTML = sortedUsers.map(user => {
        // 计算用户的动态数
        const userPosts = posts.filter(p => p.user_id === user.id);
        const postCount = userPosts.length;
        
        // 计算用户的粉丝数
        const followerCount = follows.filter(f => f.following_id === user.id).length;
        
        // 确定用户状态
        let statusClass = 'status-active';
        let statusText = '正常';
        
        if (user.is_banned) {
            statusClass = 'status-banned';
            statusText = '已封禁';
        } else if (!user.is_active) {
            statusClass = 'status-inactive';
            statusText = '未激活';
        }
        
        // 格式化注册时间
        const registerDate = user.created_at ? 
            formatDate(user.created_at) : '未知';
        
        return `
            <tr data-user-id="${user.id}">
                <td>
                    <input type="checkbox" class="user-checkbox" value="${user.id}">
                </td>
                <td>
                    <div class="user-info-cell">
                        <img src="${user.avatar || 'images/default-avatar.png'}" 
                             alt="${user.nickname}" class="user-avatar-table">
                        <div>
                            <div class="user-name-table">${user.nickname}</div>
                            <div class="user-id-table">ID: ${user.id}</div>
                        </div>
                    </div>
                </td>
                <td>${user.student_id || '未设置'}</td>
                <td>${postCount}</td>
                <td>${followerCount}</td>
                <td>
                    <span class="user-status ${statusClass}">${statusText}</span>
                    ${user.is_admin ? '<span class="badge admin-badge">管理员</span>' : ''}
                </td>
                <td>${registerDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" onclick="viewUser(${user.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${user.is_banned ? `
                            <button class="action-btn unban-btn" onclick="unbanUser(${user.id})">
                                <i class="fas fa-user-check"></i>
                            </button>
                        ` : `
                            <button class="action-btn ban-btn" onclick="banUser(${user.id})">
                                <i class="fas fa-ban"></i>
                            </button>
                        `}
                        ${!user.is_admin ? `
                            <button class="action-btn delete-btn" onclick="deleteUser(${user.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 搜索用户
function searchUsers() {
    const searchInput = document.getElementById('user-search');
    if (!searchInput) return;
    
    const keyword = searchInput.value.trim().toLowerCase();
    const rows = document.querySelectorAll('#users-table-body tr');
    
    rows.forEach(row => {
        const userName = row.querySelector('.user-name-table').textContent.toLowerCase();
        const userId = row.querySelector('.user-id-table').textContent.toLowerCase();
        const studentId = row.cells[2].textContent.toLowerCase();
        
        const isVisible = userName.includes(keyword) || 
                         userId.includes(keyword) || 
                         studentId.includes(keyword);
        
        row.style.display = isVisible ? '' : 'none';
    });
}

// 筛选用户
function filterUsers(filter) {
    const rows = document.querySelectorAll('#users-table-body tr');
    
    // 更新筛选按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    rows.forEach(row => {
        const statusElement = row.querySelector('.user-status');
        const status = statusElement ? statusElement.textContent : '';
        const isAdmin = row.querySelector('.admin-badge');
        
        let isVisible = true;
        
        switch(filter) {
            case 'active':
                isVisible = status === '正常';
                break;
            case 'banned':
                isVisible = status === '已封禁';
                break;
            case 'admins':
                isVisible = !!isAdmin;
                break;
            // 'all' 时显示所有
        }
        
        row.style.display = isVisible ? '' : 'none';
    });
}

// 排序用户
function sortUsers() {
    const sortSelect = document.getElementById('user-sort');
    if (!sortSelect) return;
    
    const sortBy = sortSelect.value;
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const userA = getUserDataFromRow(a);
        const userB = getUserDataFromRow(b);
        
        switch(sortBy) {
            case 'posts':
                return userB.postCount - userA.postCount;
            case 'name':
                return userA.nickname.localeCompare(userB.nickname);
            case 'recent':
            default:
                return new Date(userB.created_at) - new Date(userA.created_at);
        }
    });
    
    // 重新插入排序后的行
    rows.forEach(row => tbody.appendChild(row));
}

// 从表格行获取用户数据
function getUserDataFromRow(row) {
    const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const userId = parseInt(row.getAttribute('data-user-id'));
    const user = users.find(u => u.id === userId) || {};
    
    // 获取动态数
    const posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    const postCount = posts.filter(p => p.user_id === userId).length;
    
    return {
        ...user,
        postCount
    };
}

// 显示添加用户模态框
function showAddUserModal() {
    const modal = createModal('添加用户', getAddUserFormHTML());
    
    // 处理表单提交
    const form = modal.querySelector('form');
    form.onsubmit = function(e) {
        e.preventDefault();
        handleAddUserSubmit(this);
        modal.remove();
    };
}

// 获取添加用户表单HTML
function getAddUserFormHTML() {
    return `
        <form id="add-user-form">
            <div class="form-group">
                <label for="new-student-id">学号</label>
                <input type="text" id="new-student-id" required 
                       pattern="[0-9]{10}" title="请输入10位数字学号">
            </div>
            
            <div class="form-group">
                <label for="new-nickname">昵称</label>
                <input type="text" id="new-nickname" required maxlength="20">
            </div>
            
            <div class="form-group">
                <label for="new-email">邮箱</label>
                <input type="email" id="new-email" required>
            </div>
            
            <div class="form-group">
                <label for="new-password">密码</label>
                <input type="password" id="new-password" required minlength="6">
            </div>
            
            <div class="form-group">
                <label for="new-major">专业</label>
                <select id="new-major">
                    <option value="">请选择专业</option>
                    <option value="计算机科学">计算机科学</option>
                    <option value="软件工程">软件工程</option>
                    <option value="电子信息">电子信息</option>
                    <option value="金融">金融</option>
                    <option value="工商管理">工商管理</option>
                    <option value="其他">其他</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="new-bio">个人简介</label>
                <textarea id="new-bio" rows="3" maxlength="200"></textarea>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="new-is-admin">
                    设为管理员
                </label>
            </div>
            
            <div class="modal-actions">
                <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">取消</button>
                <button type="submit" class="btn btn-primary">添加用户</button>
            </div>
        </form>
    `;
}

// 处理添加用户表单提交
function handleAddUserSubmit(form) {
    const studentId = form.querySelector('#new-student-id').value.trim();
    const nickname = form.querySelector('#new-nickname').value.trim();
    const email = form.querySelector('#new-email').value.trim();
    const password = form.querySelector('#new-password').value;
    const major = form.querySelector('#new-major').value;
    const bio = form.querySelector('#new-bio').value.trim();
    const isAdmin = form.querySelector('#new-is-admin').checked;
    
    // 验证数据
    if (!/^\d{10}$/.test(studentId)) {
        alert('学号必须是10位数字');
        return;
    }
    
    if (!nickname || nickname.length > 20) {
        alert('昵称不能为空且不能超过20个字符');
        return;
    }
    
    if (!email) {
        alert('邮箱不能为空');
        return;
    }
    
    if (password.length < 6) {
        alert('密码至少需要6位字符');
        return;
    }
    
    // 检查学号是否已存在
    const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    if (users.some(u => u.student_id === studentId)) {
        alert('该学号已被使用');
        return;
    }
    
    // 检查昵称是否已存在
    if (users.some(u => u.nickname === nickname)) {
        alert('该昵称已被使用');
        return;
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now(),
        student_id: studentId,
        nickname: nickname,
        email: email,
        password: password,
        major: major,
        bio: bio,
        avatar: 'images/default-avatar.png',
        tags: [],
        followers: 0,
        following: 0,
        is_active: true,
        is_banned: false,
        is_admin: isAdmin,
        is_private: false,
        hide_online: false,
        allow_tags: true,
        notify_likes: true,
        notify_comments: true,
        notify_follows: true,
        notify_mentions: true,
        last_active: '刚刚',
        created_at: new Date().toISOString(),
        updated_at: null
    };
    
    // 添加到用户列表
    users.push(newUser);
    localStorage.setItem('campus_social_users', JSON.stringify(users));
    
    // 重新加载用户表格
    loadUsersTable();
    updateAdminStats();
    
    showAdminToast(`用户 "${nickname}" 添加成功`);
}

// 查看用户
function viewUser(userId) {
    window.open(`profile.html?id=${userId}`, '_blank');
}

// 编辑用户
function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        alert('用户不存在');
        return;
    }
    
    const modal = createModal('编辑用户', getEditUserFormHTML(user));
    
    // 处理表单提交
    const form = modal.querySelector('form');
    form.onsubmit = function(e) {
        e.preventDefault();
        handleEditUserSubmit(userId, this);
        modal.remove();
    };
}

// 获取编辑用户表单HTML
function getEditUserFormHTML(user) {
    return `
        <form id="edit-user-form">
            <div class="form-group">
                <label for="edit-user-student-id">学号</label>
                <input type="text" id="edit-user-student-id" value="${user.student_id}" required
                       pattern="[0-9]{10}" title="请输入10位数字学号">
            </div>
            
            <div class="form-group">
                <label for="edit-user-nickname">昵称</label>
                <input type="text" id="edit-user-nickname" value="${user.nickname}" required maxlength="20">
            </div>
            
            <div class="form-group">
                <label for="edit-user-email">邮箱</label>
                <input type="email" id="edit-user-email" value="${user.email}" required>
            </div>
            
            <div class="form-group">
                <label for="edit-user-major">专业</label>
                <select id="edit-user-major">
                    <option value="">请选择专业</option>
                    <option value="计算机科学" ${user.major === '计算机科学' ? 'selected' : ''}>计算机科学</option>
                    <option value="软件工程" ${user.major === '软件工程' ? 'selected' : ''}>软件工程</option>
                    <option value="电子信息" ${user.major === '电子信息' ? 'selected' : ''}>电子信息</option>
                    <option value="金融" ${user.major === '金融' ? 'selected' : ''}>金融</option>
                    <option value="工商管理" ${user.major === '工商管理' ? 'selected' : ''}>工商管理</option>
                    <option value="其他" ${user.major === '其他' ? 'selected' : ''}>其他</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="edit-user-bio">个人简介</label>
                <textarea id="edit-user-bio" rows="3" maxlength="200">${user.bio || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="edit-user-is-admin" ${user.is_admin ? 'checked' : ''}>
                    设为管理员
                </label>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="edit-user-is-banned" ${user.is_banned ? 'checked' : ''}>
                    封禁用户
                </label>
            </div>
            
            <div class="form-group">
                <label for="edit-user-status">状态</label>
                <select id="edit-user-status">
                    <option value="active" ${user.is_active && !user.is_banned ? 'selected' : ''}>正常</option>
                    <option value="inactive" ${!user.is_active ? 'selected' : ''}>未激活</option>
                    <option value="banned" ${user.is_banned ? 'selected' : ''}>已封禁</option>
                </select>
            </div>
            
            <div class="modal-actions">
                <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">取消</button>
                <button type="submit" class="btn btn-primary">保存修改</button>
            </div>
        </form>
    `;
}

// 处理编辑用户表单提交
function handleEditUserSubmit(userId, form) {
    const studentId = form.querySelector('#edit-user-student-id').value.trim();
    const nickname = form.querySelector('#edit-user-nickname').value.trim();
    const email = form.querySelector('#edit-user-email').value.trim();
    const major = form.querySelector('#edit-user-major').value;
    const bio = form.querySelector('#edit-user-bio').value.trim();
    const isAdmin = form.querySelector('#edit-user-is-admin').checked;
    const isBanned = form.querySelector('#edit-user-is-banned').checked;
    const status = form.querySelector('#edit-user-status').value;
    
    // 验证数据
    if (!/^\d{10}$/.test(studentId)) {
        alert('学号必须是10位数字');
        return;
    }
    
    if (!nickname || nickname.length > 20) {
        alert('昵称不能为空且不能超过20个字符');
        return;
    }
    
    if (!email) {
        alert('邮箱不能为空');
        return;
    }
    
    // 更新用户数据
    let users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        alert('用户不存在');
        return;
    }
    
    // 检查学号是否被其他人使用
    const studentIdExists = users.some((u, index) => 
        index !== userIndex && u.student_id === studentId
    );
    
    if (studentIdExists) {
        alert('该学号已被其他用户使用');
        return;
    }
    
    // 检查昵称是否被其他人使用
    const nicknameExists = users.some((u, index) => 
        index !== userIndex && u.nickname === nickname
    );
    
    if (nicknameExists) {
        alert('该昵称已被其他用户使用');
        return;
    }
    
    // 更新用户信息
    users[userIndex] = {
        ...users[userIndex],
        student_id: studentId,
        nickname: nickname,
        email: email,
        major: major,
        bio: bio,
        is_admin: isAdmin,
        is_banned: isBanned,
        is_active: status !== 'inactive',
        updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('campus_social_users', JSON.stringify(users));
    
    // 如果是当前登录用户，更新session
    const currentUser = getCurrentUser();
    if (currentUser.id === userId) {
        localStorage.setItem('campus_social_current_user', JSON.stringify(users[userIndex]));
    }
    
    // 重新加载用户表格
    loadUsersTable();
    
    showAdminToast(`用户 "${nickname}" 更新成功`);
}

// 封禁用户
function banUser(userId) {
    if (!confirm('确定要封禁该用户吗？封禁后用户将无法登录。')) {
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        alert('用户不存在');
        return;
    }
    
    const user = users[userIndex];
    
    // 不能封禁管理员
    if (user.is_admin) {
        alert('不能封禁管理员账号');
        return;
    }
    
    // 更新用户状态
    users[userIndex].is_banned = true;
    users[userIndex].is_active = false;
    users[userIndex].updated_at = new Date().toISOString();
    
    localStorage.setItem('campus_social_users', JSON.stringify(users));
    
    // 重新加载用户表格
    loadUsersTable();
    updateAdminStats();
    
    showAdminToast(`用户 "${user.nickname}" 已封禁`);
}

// 解封用户
function unbanUser(userId) {
    if (!confirm('确定要解封该用户吗？')) {
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        alert('用户不存在');
        return;
    }
    
    const user = users[userIndex];
    
    // 更新用户状态
    users[userIndex].is_banned = false;
    users[userIndex].is_active = true;
    users[userIndex].updated_at = new Date().toISOString();
    
    localStorage.setItem('campus_social_users', JSON.stringify(users));
    
    // 重新加载用户表格
    loadUsersTable();
    updateAdminStats();
    
    showAdminToast(`用户 "${user.nickname}" 已解封`);
}

// 删除用户
function deleteUser(userId) {
    if (!confirm('确定要删除该用户吗？此操作将永久删除用户的所有数据，且不可恢复！')) {
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        alert('用户不存在');
        return;
    }
    
    const user = users[userIndex];
    
    // 不能删除管理员
    if (user.is_admin) {
        alert('不能删除管理员账号');
        return;
    }
    
    // 确认删除
    const confirmText = prompt(`请输入 "DELETE" 确认删除用户 "${user.nickname}"：`);
    if (confirmText !== 'DELETE') {
        alert('删除已取消');
        return;
    }
    
    // 删除用户
    users.splice(userIndex, 1);
    localStorage.setItem('campus_social_users', JSON.stringify(users));
    
    // 删除用户的动态
    let posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    posts = posts.filter(p => p.user_id !== userId);
    localStorage.setItem('campus_social_posts', JSON.stringify(posts));
    
    // 删除用户的评论
    let comments = JSON.parse(localStorage.getItem('campus_social_comments') || '[]');
    comments = comments.filter(c => c.user_id !== userId);
    localStorage.setItem('campus_social_comments', JSON.stringify(comments));
    
    // 删除相关的关注关系
    let follows = JSON.parse(localStorage.getItem('campus_social_follows') || '[]');
    follows = follows.filter(f => 
        f.follower_id !== userId && f.following_id !== userId
    );
    localStorage.setItem('campus_social_follows', JSON.stringify(follows));
    
    // 重新加载用户表格
    loadUsersTable();
    updateAdminStats();
    
    showAdminToast(`用户 "${user.nickname}" 已删除`);
}

// 切换全选用户
function toggleSelectAllUsers(e) {
    const isChecked = e.target.checked;
    const checkboxes = document.querySelectorAll('.user-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

// 应用批量操作
function applyBulkActions() {
    const bulkAction = document.getElementById('bulk-action').value;
    
    if (!bulkAction) {
        alert('请选择批量操作');
        return;
    }
    
    // 获取选中的用户ID
    const selectedUserIds = Array.from(document.querySelectorAll('.user-checkbox:checked'))
        .map(checkbox => parseInt(checkbox.value))
        .filter(id => !isNaN(id));
    
    if (selectedUserIds.length === 0) {
        alert('请至少选择一个用户');
        return;
    }
    
    // 确认操作
    let confirmMessage = '';
    switch(bulkAction) {
        case 'ban':
            confirmMessage = `确定要封禁选中的 ${selectedUserIds.length} 个用户吗？`;
            break;
        case 'unban':
            confirmMessage = `确定要解封选中的 ${selectedUserIds.length} 个用户吗？`;
            break;
        case 'delete':
            confirmMessage = `确定要删除选中的 ${selectedUserIds.length} 个用户吗？此操作不可恢复！`;
            break;
    }
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // 执行批量操作
    switch(bulkAction) {
        case 'ban':
            selectedUserIds.forEach(userId => {
                // 这里应该调用封禁函数，但为了简化，直接更新状态
                updateUserStatus(userId, 'banned');
            });
            showAdminToast(`已封禁 ${selectedUserIds.length} 个用户`);
            break;
            
        case 'unban':
            selectedUserIds.forEach(userId => {
                updateUserStatus(userId, 'active');
            });
            showAdminToast(`已解封 ${selectedUserIds.length} 个用户`);
            break;
            
        case 'delete':
            // 批量删除需要额外确认
            const confirmText = prompt(`请输入 "DELETE ALL" 确认删除 ${selectedUserIds.length} 个用户：`);
            if (confirmText !== 'DELETE ALL') {
                alert('批量删除已取消');
                return;
            }
            
            selectedUserIds.forEach(userId => {
                deleteUserData(userId);
            });
            showAdminToast(`已删除 ${selectedUserIds.length} 个用户`);
            break;
    }
    
    // 重新加载用户表格
    loadUsersTable();
    updateAdminStats();
    
    // 取消全选
    document.getElementById('select-all-users').checked = false;
}

// 更新用户状态
function updateUserStatus(userId, status) {
    let users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return;
    
    switch(status) {
        case 'banned':
            users[userIndex].is_banned = true;
            users[userIndex].is_active = false;
            break;
        case 'active':
            users[userIndex].is_banned = false;
            users[userIndex].is_active = true;
            break;
    }
    
    users[userIndex].updated_at = new Date().toISOString();
    localStorage.setItem('campus_social_users', JSON.stringify(users));
}

// 删除用户数据（简化的删除，不显示确认对话框）
function deleteUserData(userId) {
    let users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('campus_social_users', JSON.stringify(users));
    
    // 这里可以添加删除动态、评论等数据的逻辑
}

// 导出用户数据
function exportUsersData() {
    const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    const posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    const comments = JSON.parse(localStorage.getItem('campus_social_comments') || '[]');
    const follows = JSON.parse(localStorage.getItem('campus_social_follows') || '[]');
    
    // 准备导出数据
    const exportData = {
        users: users,
        posts: posts,
        comments: comments,
        follows: follows,
        export_date: new Date().toISOString(),
        export_type: 'all_users'
    };
    
    // 创建JSON文件并下载
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(dataBlob);
    downloadLink.download = `campus_social_users_export_${Date.now()}.json`;
    downloadLink.click();
    
    showAdminToast('用户数据导出成功');
}

// 加载动态管理
function loadPostsManagement() {
    const container = document.querySelector('.posts-management');
    if (!container) return;
    
    const posts = JSON.parse(localStorage.getItem('campus_social_posts') || '[]');
    const users = JSON.parse(localStorage.getItem('campus_social_users') || '[]');
    
    // 按时间排序（最新的在前）
    const sortedPosts = [...posts].sort((a, b) => 
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
    
    if (sortedPosts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <p>还没有任何动态</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = sortedPosts.map(post => {
        const user = users.find(u => u.id === post.user_id) || {};
        
        return `
            <div class="post-admin-card" data-post-id="${post.id}">
                <div class="post-admin-header">
                    <img src="${user.avatar || 'images/default-avatar.png'}" 
                         alt="${user.nickname}" class="post-admin-avatar">
                    <div class="post-admin-user">
                        <div class="post-admin-username">${user.nickname || '未知用户'}</div>
                        <div class="post-admin-time">${post.created_at}</div>
                    </div>
                    <div class="post-admin-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewPostAdmin(${post.id})">
                            <i class="fas fa-eye"></i> 查看
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deletePostAdmin(${post.id})">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
                <div class="post-admin-content">
                    ${post.content}
                </div>
                <div class="post-admin-stats">
                    <span><i class="fas fa-heart"></i> ${post.likes}</span>
                    <span><i class="fas fa-comment"></i> ${post.comments}</span>
                    <span><i class="fas fa-share-alt"></i> ${post.shares}</span>
                </div>
            </div>
        `;
    }).join('');
}

// 查看动态（管理员）
function viewPostAdmin(postId) {
    window.open(`post-detail.html?id=${postId}`, '_blank');
}

// 删除动态（管理员）
function deletePostAdmin(postId) {
    if (!confirm('确定要删除这条动态吗？此操作不可恢复！')) {
        return;
    }
    
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
    
    showAdminToast('动态已删除');
}

// 创建模态框
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '未知';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN') + ' ' + 
               date.toLocaleTimeString('zh-CN', { 
                   hour: '2-digit', 
                   minute: '2-digit' 
               });
    } catch (e) {
        return dateString;
    }
}

// 显示管理员Toast提示
function showAdminToast(message) {
    // 移除现有的toast
    const existingToast = document.querySelector('.admin-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'admin-toast toast';
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

// 添加管理员特有的CSS
const adminStyle = document.createElement('style');
adminStyle.textContent = `
    .admin-toast {
        background: var(--dark-color);
    }
    
    .badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: bold;
        margin-left: 5px;
    }
    
    .admin-badge {
        background: var(--primary-color);
        color: white;
    }
    
    .status-badge {
        padding: 3px 8px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .status-badge.active {
        background: #d4edda;
        color: #155724;
    }
    
    .status-badge.banned {
        background: #f8d7da;
        color: #721c24;
    }
    
    .status-badge.inactive {
        background: #fff3cd;
        color: #856404;
    }
    
    .post-admin-card {
        background: white;
        border-radius: var(--radius);
        padding: 20px;
        margin-bottom: 15px;
        box-shadow: var(--shadow);
    }
    
    .post-admin-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
    }
    
    .post-admin-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .post-admin-user {
        flex: 1;
    }
    
    .post-admin-username {
        font-weight: 500;
        color: var(--dark-color);
    }
    
    .post-admin-time {
        font-size: 12px;
        color: var(--gray-color);
    }
    
    .post-admin-content {
        line-height: 1.5;
        margin-bottom: 15px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: var(--radius);
    }
    
    .post-admin-stats {
        display: flex;
        gap: 20px;
        color: var(--gray-color);
        font-size: 14px;
    }
`;
document.head.appendChild(adminStyle);