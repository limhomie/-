// JavaScript 核心功能（js/app.js）
// 全局变量
let currentUser = null;
let posts = [];
let users = [];
let currentFilter = 'all';
let currentPage = 1;
const postsPerPage = 10;


// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// 初始化应用
function initApp() {
    loadMockData();
    checkLoginStatus();
    updateNavForAdmin();  // 新增：更新导航栏
    setupEventListeners();
    renderPosts();
    renderActiveUsers();
    updateStats();
}

// 加载模拟数据
function loadMockData() {
    // 检查本地存储中是否有数据
    const storedUsers = localStorage.getItem('campus_social_users');
    const storedPosts = localStorage.getItem('campus_social_posts');
    
    if (storedUsers && storedPosts) {
        users = JSON.parse(storedUsers);
        posts = JSON.parse(storedPosts);
    } else {
        // 生成初始模拟数据
        generateMockData();
    }
}

// 获取当前用户（在profile.js和admin.js中也会用到）
function getCurrentUser() {
    const storedUser = localStorage.getItem('campus_social_current_user') || 
                      sessionStorage.getItem('campus_social_current_user');
    return storedUser ? JSON.parse(storedUser) : null;
}

// 生成模拟数据
function generateMockData() {
    // 模拟用户数据
    users = [
        {
            id: 1,
            student_id: '2023001001',
            password: 'password123',
            nickname: '深大程序猿',
            email: 'dev@szu.edu.cn',
            avatar: 'images/avatar1.jpg',
            bio: '热爱编程的计算机系学生',
            tags: ['编程', '学习', '科技'],
            major: '计算机科学',
            followers: 125,
            following: 89,
            is_active: true,
            last_active: '刚刚',
            is_admin: true
        },
        {
            id: 2,
            student_id: '2023002002',
            password: 'password123',
            nickname: '校园摄影师',
            email: 'photo@szu.edu.cn',
            avatar: 'images/avatar2.jpg',
            bio: '用镜头记录校园美好瞬间',
            tags: ['摄影', '艺术', '旅行'],
            major: '艺术设计',
            followers: 356,
            following: 203,
            is_active: true,
            last_active: '5分钟前'
        },
        {
            id: 3,
            student_id: '2023003003',
            password: 'password123',
            nickname: '学习小能手',
            email: 'study@szu.edu.cn',
            avatar: 'images/avatar3.jpg',
            bio: '图书馆常驻选手',
            tags: ['学习', '阅读', '打卡'],
            major: '金融',
            followers: 189,
            following: 145,
            is_active: true,
            last_active: '10分钟前'
        }
    ];

   posts = [
        
        {
            id: 1,
            user_id: 1,
            username: '深大程序猿',
            avatar: 'images/avatar1.jpg',
            content: '今天在实验室调试了一天代码，终于解决了那个棘手的bug！记录一下这个开心的时刻。有在做Web开发项目的同学吗？一起交流交流！',
            images: ['images/post1-1.jpg'],
            likes: 45,
            comments: 12,
            shares: 3,
            is_liked: false,
            created_at: '2小时前',
            tags: ['编程', '学习']
        },
        {
            id: 2,
            user_id: 2,
            username: '校园摄影师',
            avatar: 'images/avatar2.jpg',
            content: '黄昏时分的文山湖，夕阳洒在湖面上，美得让人心醉。捕捉到了几只黑天鹅优雅的身影。',
            images: ['images/post2-1.jpg', 'images/post2-2.jpg'],
            likes: 128,
            comments: 28,
            shares: 15,
            is_liked: false,
            created_at: '5小时前',
            tags: ['摄影', '风景']
        },
        {
            id: 3,
            user_id: 3,
            username: '学习小能手',
            avatar: 'images/avatar3.jpg',
            content: '在图书馆泡了一天，完成了经济学论文的初稿。推荐《经济学原理》这本书，非常适合入门！',
            images: [],
            likes: 67,
            comments: 8,
            shares: 2,
            is_liked: false,
            created_at: '1天前',
            tags: ['学习', '图书馆']
        }
    ];

    // 保存到本地存储
    saveToLocalStorage();
}

// 保存数据到本地存储
function saveToLocalStorage() {
    localStorage.setItem('campus_social_users', JSON.stringify(users));
    localStorage.setItem('campus_social_posts', JSON.stringify(posts));
}

// 检查登录状态
function checkLoginStatus() {
    const userData = localStorage.getItem('campus_social_current_user') || 
                     sessionStorage.getItem('campus_social_current_user');
    
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            console.log('检测到登录用户:', currentUser.nickname);
        } catch (error) {
            console.error('解析用户数据时出错:', error);
            currentUser = null;
        }
    } else {
        currentUser = null;
        console.log('没有检测到登录用户');
    }
}

// 在 initApp 中添加管理员权限检查函数
function checkAdminAccess() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        alert('请先登录后访问管理面板');
        window.location.href = 'login.html';
        return false;
    }
    
    // 检查是否是管理员
    if (!currentUser.is_admin) {
        alert('您没有权限访问管理面板');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// 更新导航栏显示管理员链接
function updateNavForAdmin() {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.is_admin) {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            // 检查是否已经存在管理员链接
            const existingAdminLink = navMenu.querySelector('a[href="admin.html"]');
            if (!existingAdminLink) {
                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.className = 'nav-item';
                adminLink.innerHTML = '<i class="fas fa-cogs"></i> 管理面板';
                navMenu.appendChild(adminLink);
            }
        }
    }
}


// 更新登录用户界面
function updateUIForLoginStatus() {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        // 有登录用户，显示用户菜单
        updateUIForLoggedInUser();
        updateNavForAdmin();
    } else {
        // 没有登录用户，显示登录注册按钮
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const followingTab = document.getElementById('following-tab');
        const filterFollowing = document.getElementById('filter-following');
        const loginPrompt = document.getElementById('login-prompt');
        
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (followingTab) followingTab.style.display = 'none';
        if (filterFollowing) filterFollowing.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'block';
    }
}
// 设置事件监听器
function setupEventListeners() {
    // 筛选按钮
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            setActiveFilter(filter);
        });
    });

    // 加载更多按钮
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
    }

    // 退出登录
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // 搜索功能
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
    }
}

// 设置当前筛选
function setActiveFilter(filter) {
    currentFilter = filter;
    currentPage = 1;
    
    // 更新按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 重新渲染动态
    renderPosts();
}

// 渲染动态
function renderPosts() {
    const postsFeed = document.getElementById('posts-feed');
    if (!postsFeed) return;

    // 清空当前内容
    postsFeed.innerHTML = '';

    // 筛选动态
    let filteredPosts = [...posts];
    
    if (currentFilter === 'popular') {
        filteredPosts.sort((a, b) => b.likes - a.likes);
    } else if (currentFilter === 'following' && currentUser) {
        // 这里简化处理，实际应该只显示关注用户的动态
        filteredPosts = filteredPosts.filter(post => 
            post.user_id !== currentUser.id // 实际应根据关注关系筛选
        );
    }

    // 分页处理
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);

    // 渲染每个动态
    postsToShow.forEach(post => {
        const postElement = createPostElement(post);
        postsFeed.appendChild(postElement);
    });

    // 如果没有动态，显示提示
    if (postsToShow.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.innerHTML = `
            <i class="fas fa-newspaper"></i>
            <p>暂时没有动态，发布第一条动态吧！</p>
        `;
        postsFeed.appendChild(emptyMessage);
    }
}

// 创建动态元素
function createPostElement(post) {
    const isVisitor = !currentUser;
    const isAuthor = currentUser && currentUser.id === post.user_id;
    
    const postElement = document.createElement('div');
    postElement.className = `post-card ${isVisitor ? 'visitor-mode' : ''}`;
    postElement.setAttribute('data-post-id', post.id);
    
    // 构建图片HTML
    let imagesHTML = '';
    if (post.images && post.images.length > 0) {
        imagesHTML = `
            <div class="post-images">
                ${post.images.map(img => `
                    <img src="${img}" alt="动态图片" class="post-image" onclick="viewImage('${img}')">
                `).join('')}
            </div>
        `;
    }
    
    // 构建标签HTML
    let tagsHTML = '';
    if (post.tags && post.tags.length > 0) {
        tagsHTML = `
            <div class="post-tags">
                ${post.tags.map(tag => `
                    <span class="tag">#${tag}</span>
                `).join('')}
            </div>
        `;
    }
    
    postElement.innerHTML = `
        <div class="post-header">
            <img src="${post.avatar}" alt="${post.username}" class="post-avatar">
            <div class="post-user-info">
                <a href="profile.html?id=${post.user_id}" class="post-username">${post.username}</a>
                <div class="post-time">${post.created_at}</div>
            </div>
            ${isAuthor ? `
                <div class="post-actions-menu">
                    <button class="action-menu-btn"><i class="fas fa-ellipsis-h"></i></button>
                    <div class="action-menu-dropdown">
                        <button onclick="editPost(${post.id})"><i class="fas fa-edit"></i> 编辑</button>
                        <button onclick="deletePost(${post.id})" class="danger"><i class="fas fa-trash"></i> 删除</button>
                    </div>
                </div>
            ` : ''}
        </div>
        <div class="post-content">
            <div class="post-text">${post.content}</div>
            ${tagsHTML}
            ${imagesHTML}
        </div>
        <div class="post-actions">
            <button class="action-btn like-btn ${post.is_liked ? 'liked' : ''}" 
                    onclick="toggleLike(${post.id})"
                    ${isVisitor ? 'disabled' : ''}>
                <i class="fas fa-heart"></i>
                <span class="action-count">${post.likes}</span>
            </button>
            <button class="action-btn comment-btn" 
                    onclick="viewComments(${post.id})"
                    ${isVisitor ? 'disabled' : ''}>
                <i class="fas fa-comment"></i>
                <span class="action-count">${post.comments}</span>
            </button>
            <button class="action-btn share-btn" 
                    onclick="sharePost(${post.id})"
                    ${isVisitor ? 'disabled' : ''}>
                <i class="fas fa-share-alt"></i>
                <span class="action-count">${post.shares}</span>
            </button>
        </div>
        ${isVisitor ? `
            <div class="login-required">
                登录后才能点赞、评论和分享
                <a href="login.html">立即登录</a>
            </div>
        ` : ''}
    `;
    
    return postElement;
}

// 加载更多动态
function loadMorePosts() {
    currentPage++;
    renderPosts();
    
    // 更新按钮文本
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.innerHTML = '<i class="fas fa-sync-alt"></i> 加载更多动态';
    }
}

// 渲染活跃用户
function renderActiveUsers() {
    const activeUsersList = document.querySelector('.active-users-list');
    if (!activeUsersList) return;

    // 筛选活跃用户（简化处理：取前5个）
    const activeUsers = users.slice(0, 5);
    
    activeUsersList.innerHTML = activeUsers.map(user => `
        <a href="profile.html?id=${user.id}" class="active-user">
            <img src="${user.avatar}" alt="${user.nickname}" class="active-user-avatar">
            <div class="active-user-info">
                <div class="active-user-name">${user.nickname}</div>
                <div class="active-user-status">${user.last_active}</div>
            </div>
        </a>
    `).join('');
}

// 更新统计信息
function updateStats() {
    // 更新今日活跃用户数（模拟数据）
    const activeUsersSpan = document.getElementById('active-users');
    const todayPostsSpan = document.getElementById('today-posts');
    
    if (activeUsersSpan) {
        activeUsersSpan.textContent = Math.floor(Math.random() * 500) + 1000;
    }
    if (todayPostsSpan) {
        todayPostsSpan.textContent = posts.length;
    }
}

// 点赞/取消点赞
function toggleLike(postId) {
    if (!currentUser) {
        alert('请先登录后再操作');
        window.location.href = 'login.html';
        return;
    }

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
        const post = posts[postIndex];
        post.is_liked = !post.is_liked;
        post.likes += post.is_liked ? 1 : -1;
        
        // 更新UI
        const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
        if (likeBtn) {
            likeBtn.classList.toggle('liked');
            likeBtn.querySelector('.action-count').textContent = post.likes;
        }
        
        // 保存到本地存储
        saveToLocalStorage();
    }
}

// 查看评论
function viewComments(postId) {
    if (!currentUser) {
        alert('请先登录后再操作');
        window.location.href = 'login.html';
        return;
    }
    
    // 这里应该跳转到动态详情页
    window.location.href = `post-detail.html?id=${postId}`;
}

// 分享动态
function sharePost(postId) {
    if (!currentUser) {
        alert('请先登录后再操作');
        window.location.href = 'login.html';
        return;
    }

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
        posts[postIndex].shares += 1;
        
        // 更新UI
        const shareBtn = document.querySelector(`[data-post-id="${postId}"] .share-btn .action-count`);
        if (shareBtn) {
            shareBtn.textContent = posts[postIndex].shares;
        }
        
        // 模拟分享
        const post = posts[postIndex];
        const shareUrl = `${window.location.origin}/post-detail.html?id=${postId}`;
        const shareText = `${post.username} 的校园圈动态：${post.content.substring(0, 50)}...`;
        
        // 使用Web Share API（如果支持）
        if (navigator.share) {
            navigator.share({
                title: '深大校园圈动态',
                text: shareText,
                url: shareUrl,
            })
            .then(() => console.log('分享成功'))
            .catch(err => console.log('分享失败:', err));
        } else {
            // 回退方案：复制链接到剪贴板
            navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
                .then(() => alert('链接已复制到剪贴板！'))
                .catch(err => alert('复制失败，请手动复制链接'));
        }
        
        saveToLocalStorage();
    }
}

// 查看图片
function viewImage(imageUrl) {
    // 创建图片查看器
    const imageViewer = document.createElement('div');
    imageViewer.className = 'image-viewer';
    imageViewer.innerHTML = `
        <div class="image-viewer-content">
            <img src="${imageUrl}" alt="查看大图">
            <button class="close-viewer"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    document.body.appendChild(imageViewer);
    document.body.style.overflow = 'hidden';
    
    // 关闭查看器
    imageViewer.querySelector('.close-viewer').addEventListener('click', () => {
        document.body.removeChild(imageViewer);
        document.body.style.overflow = 'auto';
    });
    
    // 点击背景关闭
    imageViewer.addEventListener('click', (e) => {
        if (e.target === imageViewer) {
            document.body.removeChild(imageViewer);
            document.body.style.overflow = 'auto';
        }
    });
}

// 搜索功能
function performSearch() {
    const searchInput = document.querySelector('.search-box input');
    if (!searchInput) return;
    
    const keyword = searchInput.value.trim();
    if (!keyword) return;
    
    // 在实际应用中，这里应该发送搜索请求
    // 这里简化处理：过滤动态
    const filteredPosts = posts.filter(post => 
        post.content.toLowerCase().includes(keyword.toLowerCase()) ||
        post.username.toLowerCase().includes(keyword.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase())))
    );
    
    // 显示搜索结果
    const postsFeed = document.getElementById('posts-feed');
    if (postsFeed) {
        postsFeed.innerHTML = '';
        
        if (filteredPosts.length === 0) {
            postsFeed.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-search"></i>
                    <p>没有找到与"${keyword}"相关的内容</p>
                </div>
            `;
        } else {
            filteredPosts.forEach(post => {
                const postElement = createPostElement(post);
                postsFeed.appendChild(postElement);
            });
        }
    }
}

// 退出登录
// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        // 清除所有用户相关的存储
        localStorage.removeItem('campus_social_current_user');
        sessionStorage.removeItem('campus_social_current_user');
        
        // 重置全局变量
        currentUser = null;
        
        // 立即更新UI
        updateUIForLogout();
        
        // 延迟跳转，让用户看到UI变化
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

// 新增：更新退出登录后的UI
function updateUIForLogout() {
    // 显示登录注册按钮
    const authButtons = document.getElementById('auth-buttons');
    if (authButtons) {
        authButtons.style.display = 'flex';
    }
    
    // 隐藏用户菜单
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        userMenu.style.display = 'none';
    }
    
    // 隐藏关注相关标签
    const followingTab = document.getElementById('following-tab');
    const filterFollowing = document.getElementById('filter-following');
    if (followingTab) followingTab.style.display = 'none';
    if (filterFollowing) filterFollowing.style.display = 'none';
    
    // 显示游客登录提示
    const loginPrompt = document.getElementById('login-prompt');
    if (loginPrompt) {
        loginPrompt.style.display = 'block';
    }
    
    // 移除管理员链接（如果存在）
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        const adminLink = navMenu.querySelector('a[href="admin.html"]');
        if (adminLink) {
            adminLink.remove();
        }
    }
    
    console.log('用户已退出登录');
}

// 编辑动态
function editPost(postId) {
    // 跳转到编辑页面
    window.location.href = `post-edit.html?id=${postId}`;
}

// 删除动态
function deletePost(postId) {
    if (confirm('确定要删除这条动态吗？删除后无法恢复。')) {
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            posts.splice(postIndex, 1);
            saveToLocalStorage();
            
            // 从页面移除
            const postElement = document.querySelector(`[data-post-id="${postId}"]`);
            if (postElement) {
                postElement.remove();
            }
            
            // 如果没有动态了，显示提示
            const postsFeed = document.getElementById('posts-feed');
            if (postsFeed && postsFeed.children.length === 0) {
                renderPosts();
            }
        }
    }
}

// 工具函数：获取用户信息
function getUserById(userId) {
    return users.find(user => user.id === userId);
}