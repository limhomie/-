// JavaScript 核心功能（js/app.js）
// 全局变量
let currentUser = null;
let posts = [];
let users = [];
let currentFilter = "all";
let currentPage = 1;
const postsPerPage = 10;

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", function () {
  initApp();
});

// 智能时间显示函数（兼容字符串和时间戳）
function smartFormatTime(time) {
  if (!time && time !== 0) return "";

  // 如果已经是相对字符串（刚刚 / N分钟前 / N小时前 / N天前），直接返回
  if (typeof time === "string") {
    const relPatterns = ["刚刚", "分钟前", "小时前", "天前"];
    for (const p of relPatterns) {
      if (time.includes(p)) return time;
    }
  }

  let date;
  if (typeof time === "number") date = new Date(time);
  else date = new Date(time);

  if (isNaN(date.getTime())) {
    // 无法解析时，返回原始字符串
    return time;
  }

  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 7) return `${diffDay}天前`;

  // 7天以上，显示具体日期（年-月-日 可带时间）
  const opts = { year: "numeric", month: "2-digit", day: "2-digit" };
  const datePart = date.toLocaleDateString("zh-CN", opts).replace(/\//g, "-");
  const timePart = date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  return `${datePart} ${timePart}`;
}
// 初始化应用
function initApp() {
  loadMockData();
  checkLoginStatus();
  updateNavForAdmin(); // 新增：更新导航栏
  updateUIForLoginStatus(); // 更新登录状态UI
  setupEventListeners();

  // 只在首页执行特定功能
  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/")
  ) {
    renderPosts();
    renderActiveUsers();
    updateStats();
  }
}

// 加载模拟数据
function loadMockData() {
  // 检查本地存储中是否有数据
  const storedUsers = localStorage.getItem("campus_social_users");
  const storedPosts = localStorage.getItem("campus_social_posts");

  if (storedUsers && storedPosts) {
    users = JSON.parse(storedUsers);
    posts = JSON.parse(storedPosts);
    // 如果本地已有数据，但缺少默认测试用户，则补齐（避免因早期运行导致某些用户丢失）
    ensureMockUsers();
  } else {
    // 生成初始模拟数据
    generateMockData();
  }
}

// 确保默认的 mock 用户存在（合并而非覆盖现有数据）
function ensureMockUsers() {
  if (!Array.isArray(users)) users = [];

  const defaults = [
    { id: 1, student_id: "2023001001", password: "password123", nickname: "深大程序猿", email: "dev@szu.edu.cn", avatar: "images/avatar1.jpg", bio: "热爱编程的计算机系学生", tags: ["编程", "学习", "科技"], major: "计算机科学", followers: 125, following: 89, is_active: true, last_active: "刚刚", is_admin: true },
    { id: 2, student_id: "2023002002", password: "password123", nickname: "校园摄影师", email: "photo@szu.edu.cn", avatar: "images/avatar2.jpg", bio: "用镜头记录校园美好瞬间", tags: ["摄影", "艺术", "旅行"], major: "艺术设计", followers: 356, following: 203, is_active: true, last_active: "5分钟前" },
    { id: 3, student_id: "2023003003", password: "password123", nickname: "学习小能手", email: "study@szu.edu.cn", avatar: "images/avatar3.jpg", bio: "图书馆常驻选手", tags: ["学习", "阅读", "打卡"], major: "金融", followers: 189, following: 145, is_active: true, last_active: "10分钟前" }
  ];

  let changed = false;
  defaults.forEach((d) => {
    const existingIndex = users.findIndex((u) => u.student_id === d.student_id);
    if (existingIndex === -1) {
      users.push(d);
      changed = true;
    } else {
      // 如果已存在但缺少密码，则补上默认密码（避免登录失败）
      const existing = users[existingIndex];
      if ((!existing.password || existing.password === "") && d.password) {
        existing.password = d.password;
        users[existingIndex] = existing;
        changed = true;
      }
    }
  });

  if (changed) saveToLocalStorage();
}

// 获取当前用户（在profile.js和admin.js中也会用到）
function getCurrentUser() {
  const storedUser =
    localStorage.getItem("campus_social_current_user") ||
    sessionStorage.getItem("campus_social_current_user");
  return storedUser ? JSON.parse(storedUser) : null;
}

// 生成模拟数据
function generateMockData() {
  // 模拟用户数据
  users = [
    {
      id: 1,
      student_id: "2023001001",
      password: "password123",
      nickname: "深大程序猿",
      email: "dev@szu.edu.cn",
      avatar: "images/avatar1.jpg",
      bio: "热爱编程的计算机系学生",
      tags: ["编程", "学习", "科技"],
      major: "计算机科学",
      followers: 125,
      following: 89,
      is_active: true,
      last_active: "刚刚",
      is_admin: true,
    },
    {
      id: 2,
      student_id: "2023002002",
      password: "password123",
      nickname: "校园摄影师",
      email: "photo@szu.edu.cn",
      avatar: "images/avatar2.jpg",
      bio: "用镜头记录校园美好瞬间",
      tags: ["摄影", "艺术", "旅行"],
      major: "艺术设计",
      followers: 356,
      following: 203,
      is_active: true,
      last_active: "5分钟前",
    },
    {
      id: 3,
      student_id: "2023003003",
      password: "password123",
      nickname: "学习小能手",
      email: "study@szu.edu.cn",
      avatar: "images/avatar3.jpg",
      bio: "图书馆常驻选手",
      tags: ["学习", "阅读", "打卡"],
      major: "金融",
      followers: 189,
      following: 145,
      is_active: true,
      last_active: "10分钟前",
    },
  ];

  posts = [
    {
      id: 1,
      user_id: 1,
      username: "深大程序猿",
      avatar: "images/avatar1.jpg",
      content:
        "今天在实验室调试了一天代码，终于解决了那个棘手的bug！记录一下这个开心的时刻。有在做Web开发项目的同学吗？一起交流交流！",
      images: ["images/post1-1.jpg"],
      likes: 45,
      comments: 12,
      shares: 3,
      is_liked: false,
      created_at: "2小时前",
      tags: ["编程", "学习"],
    },
    {
      id: 2,
      user_id: 2,
      username: "校园摄影师",
      avatar: "images/avatar2.jpg",
      content:
        "黄昏时分的文山湖，夕阳洒在湖面上，美得让人心醉。捕捉到了几只黑天鹅优雅的身影。",
      images: ["images/post2-1.jpg", "images/post2-2.jpg"],
      likes: 128,
      comments: 28,
      shares: 15,
      is_liked: false,
      created_at: "5小时前",
      tags: ["摄影", "风景"],
    },
    {
      id: 3,
      user_id: 3,
      username: "学习小能手",
      avatar: "images/avatar3.jpg",
      content:
        "在图书馆泡了一天，完成了经济学论文的初稿。推荐《经济学原理》这本书，非常适合入门！",
      images: [],
      likes: 67,
      comments: 8,
      shares: 2,
      is_liked: false,
      created_at: "1天前",
      tags: ["学习", "图书馆"],
    },
  ];

  // 保存到本地存储
  saveToLocalStorage();
}

// 保存数据到本地存储
function saveToLocalStorage() {
  // 在写回 users 时合并已有 localStorage 中的用户，保留已有的密码字段
  mergeAndSaveUsers(users);
  localStorage.setItem("campus_social_posts", JSON.stringify(posts));
}

// 合并并保存 users：保留已存在用户的 password 字段，避免覆盖丢失
function mergeAndSaveUsers(usersArray) {
  try {
    const stored = JSON.parse(localStorage.getItem("campus_social_users") || "[]");

    // 将 stored 转为以 student_id 为 key 的映射，方便合并
    const map = new Map();
    stored.forEach((u) => {
      if (u && (u.student_id || u.id)) {
        const key = u.student_id || String(u.id);
        map.set(key, u);
      }
    });

    // 合并 usersArray
    const merged = [];
    usersArray.forEach((u) => {
      const key = u.student_id || String(u.id);
      const existing = map.get(key);
      if (existing) {
        // 保留 existing 的 password，当新对象缺少时
        if ((!u.password || u.password === "") && existing.password) {
          u.password = existing.password;
        }
        // 合并其他字段（以 u 为准，但不移除 existing 中的额外字段）
        const combined = Object.assign({}, existing, u);
        merged.push(combined);
        map.delete(key);
      } else {
        merged.push(u);
      }
    });

    // 把 stored 中未在 usersArray 出现的用户也保留下来
    map.forEach((v) => merged.push(v));

    localStorage.setItem("campus_social_users", JSON.stringify(merged));
  } catch (e) {
    // 解析失败则回退为直接写入
    localStorage.setItem("campus_social_users", JSON.stringify(usersArray));
  }
}

// 检查登录状态
function checkLoginStatus() {
  const userData =
    localStorage.getItem("campus_social_current_user") ||
    sessionStorage.getItem("campus_social_current_user");

  if (userData) {
    try {
      currentUser = JSON.parse(userData);
      console.log("检测到登录用户:", currentUser.nickname);
    } catch (error) {
      console.error("解析用户数据时出错:", error);
      currentUser = null;
    }
  } else {
    currentUser = null;
    console.log("没有检测到登录用户");
  }
}

// 在 initApp 中添加管理员权限检查函数
function checkAdminAccess() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    alert("请先登录后访问管理面板");
    window.location.href = "login.html";
    return false;
  }

  // 检查是否是管理员
  if (!currentUser.is_admin) {
    alert("您没有权限访问管理面板");
    window.location.href = "index.html";
    return false;
  }

  return true;
}

// 更新导航栏显示管理员链接
function updateNavForAdmin() {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.is_admin) {
    const navMenu = document.querySelector(".nav-menu");
    if (navMenu) {
      // 检查是否已经存在管理员链接
      const existingAdminLink = navMenu.querySelector('a[href="admin.html"]');
      if (!existingAdminLink) {
        const adminLink = document.createElement("a");
        adminLink.href = "admin.html";
        adminLink.className = "nav-item";
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
    const authButtons = document.getElementById("auth-buttons");
    const userMenu = document.getElementById("user-menu");
    const followingTab = document.getElementById("following-tab");
    const filterFollowing = document.getElementById("filter-following");
    const loginPrompt = document.getElementById("login-prompt");

    if (authButtons) authButtons.style.display = "flex";
    if (userMenu) userMenu.style.display = "none";
    if (followingTab) followingTab.style.display = "none";
    if (filterFollowing) filterFollowing.style.display = "none";
    if (loginPrompt) loginPrompt.style.display = "block";
  }
}

// 更新已登录用户的界面
function updateUIForLoggedInUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  // 隐藏登录注册按钮
  const authButtons = document.getElementById("auth-buttons");
  if (authButtons) {
    authButtons.style.display = "none";
  }

  // 显示用户菜单
  const userMenu = document.getElementById("user-menu");
  if (userMenu) {
    userMenu.style.display = "flex";

    // 更新用户头像
    const userAvatar = userMenu.querySelector(".user-avatar");
    if (userAvatar) {
      userAvatar.src = currentUser.avatar || "images/default-avatar.png";
      userAvatar.alt = currentUser.nickname + "的头像";
    }

    // 更新用户名
    const userName = userMenu.querySelector(".user-name");
    if (userName) {
      userName.textContent = currentUser.nickname;
    }
  }

  // 显示关注标签
  const followingTab = document.getElementById("following-tab");
  if (followingTab) {
    followingTab.style.display = "block";
  }

  console.log("用户界面已更新:", currentUser.nickname);
}
// 设置事件监听器
function setupEventListeners() {
  // 筛选按钮
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter");
      setActiveFilter(filter);
    });
  });

  // 加载更多按钮
  const loadMoreBtn = document.getElementById("load-more-btn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMorePosts);
  }

  // 退出登录
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // 发布按钮
  const publishBtn = document.getElementById("publish-btn");
  if (publishBtn) {
    publishBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // 如果已经在发布页面，不做跳转
      if (window.location.pathname.includes("publish.html")) {
        return;
      }

      if (currentUser) {
        window.location.href = "publish.html";
      } else {
        alert("请先登录后再发布动态");
        setTimeout(function () {
          window.location.href = "login.html";
        }, 1000);
      }
    });
  }

  // 搜索功能
  const searchInput = document.querySelector(".search-box input");
  const searchBtn = document.querySelector(".search-box button");
  if (searchInput && searchBtn) {
    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") performSearch();
    });
  }
}

// 设置当前筛选
function setActiveFilter(filter) {
  currentFilter = filter;
  currentPage = 1;

  // 更新按钮状态
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    if (btn.getAttribute("data-filter") === filter) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // 重新渲染动态
  renderPosts();
}

// 渲染动态
function getFollows() {
  return JSON.parse(localStorage.getItem("campus_social_follows") || "[]");
}

function isFollowing(followerId, followingId) {
  const follows = getFollows();
  return follows.some((f) => f.follower_id === followerId && f.following_id === followingId);
}

function isMutualFollow(userAId, userBId) {
  return isFollowing(userAId, userBId) && isFollowing(userBId, userAId);
}

function canViewPost(post, viewer) {
  // visibility: 'public' (default) or 'friends'
  const visibility = post.visibility || 'public';
  if (visibility !== 'friends') return true;
  // friends-only: author always can view
  if (viewer && viewer.id === post.user_id) return true;
  if (!viewer) return false;
  return isMutualFollow(viewer.id, post.user_id);
}

function renderPosts(postsData = null) {
  const postsFeed = document.getElementById("posts-feed");
  if (!postsFeed) return;

  // 清空当前内容
  postsFeed.innerHTML = "";

  // 筛选动态
  let filteredPosts = postsData ? [...postsData] : [...posts];

  if (currentFilter === "popular") {
    filteredPosts.sort((a, b) => b.likes - a.likes);
  } else if (currentFilter === "following" && currentUser) {
    // 只显示当前用户关注的人的动态
    const follows = getFollows();
    const followingIds = follows
      .filter((f) => f.follower_id === currentUser.id)
      .map((f) => f.following_id);
    filteredPosts = filteredPosts.filter((post) => followingIds.includes(post.user_id));
  }

  // 分页处理
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const postsToShow = filteredPosts.slice(startIndex, endIndex);

  // 渲染每个动态
  postsToShow.forEach((post) => {
    const postElement = createPostElement(post);
    postsFeed.appendChild(postElement);
  });

  // 如果没有动态，显示提示
  if (postsToShow.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "empty-message";
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

  const postElement = document.createElement("div");
  postElement.className = `post-card ${isVisitor ? "visitor-mode" : ""}`;
  postElement.setAttribute("data-post-id", post.id);

  const canView = canViewPost(post, currentUser);
  postElement.style.cursor = canView ? "pointer" : "default";
  postElement.onclick = function () {
    if (!canView) {
      alert("该动态仅对互为关注的好友可见");
      return;
    }
    window.location.href = `post-detail.html?id=${post.id}`;
  };

  // 构建图片HTML
  let imagesHTML = "";
  if (post.images && post.images.length > 0) {
    imagesHTML = `
            <div class="post-images">
                ${post.images
                  .map(
                    (img) => `
                    <img src="${img}" alt="动态图片" class="post-image" onclick="viewImage('${img}')">
                `
                  )
                  .join("")}
            </div>
        `;
  }

  // 构建标签HTML
  let tagsHTML = "";
  if (post.tags && post.tags.length > 0) {
    tagsHTML = `
            <div class="post-tags">
                ${post.tags
                  .map(
                    (tag) => `
                    <span class="tag">#${tag}</span>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  postElement.innerHTML = `
        <div class="post-header">
            <img src="${post.avatar}" alt="${
    post.username
  }" class="post-avatar">
            <div class="post-user-info">
                <a href="profile.html?id=${
                  post.user_id
                }" class="post-username" onclick="event.stopPropagation()">${
    post.username
  }</a>
                <div class="post-time">${smartFormatTime(post.created_at)}</div>
            </div>
            ${
              isAuthor
                ? `
                <div class="post-actions-menu" onclick="event.stopPropagation()">
                    <button class="action-menu-btn" onclick="togglePostMenu(${post.id}, event)">
                    <i class="fas fa-ellipsis-h"></i>
                    </button>
                    <div class="action-menu-dropdown" id="post-menu-${post.id}">
                        <button onclick="editPost(${post.id})"><i class="fas fa-edit"></i> 编辑</button>
                        <button onclick="deletePost(${post.id})" class="danger"><i class="fas fa-trash"></i> 删除</button>
                    </div>
                </div>
            `
                : ""
            }
        </div>
        <div class="post-content">
          ${canView ? `<div class="post-text">${post.content}</div>` : `<div class="post-text locked">该动态仅对互为关注的好友可见</div>`}
          ${canView ? tagsHTML : ""}
          ${canView ? imagesHTML : ""}
        </div>
        <div class="post-actions" onclick="event.stopPropagation()">
                <button class="action-btn like-btn ${post.is_liked ? "liked" : ""}" 
                  onclick="event.stopPropagation(); toggleLike(${post.id}, this)"
                  ${isVisitor || !canView ? "disabled" : ""}>
                <i class="fas fa-heart"></i>
                <span class="action-count">${post.likes}</span>
            </button>
                <button class="action-btn comment-btn" 
                  onclick="event.stopPropagation(); viewComments(${post.id})"
                  ${isVisitor || !canView ? "disabled" : ""}>
                <i class="fas fa-comment"></i>
                <span class="action-count">${post.comments}</span>
            </button>
                <button class="action-btn share-btn" 
                  onclick="event.stopPropagation(); sharePost(${post.id})"
                  ${isVisitor || !canView ? "disabled" : ""}>
                <i class="fas fa-share-alt"></i>
                <span class="action-count">${post.shares}</span>
            </button>
        </div>
        ${
          isVisitor
            ? `
            <div class="login-required" onclick="event.stopPropagation()">
                登录后才能点赞、评论和分享
                <a href="login.html">立即登录</a>
            </div>
        `
            : ""
        }
    `;

  return postElement;
}

// 控制下拉菜单显示/隐藏
function togglePostMenu(postId, event) {
  // 阻止事件冒泡，防止点击菜单触发动态卡片的跳转
  if (event) event.stopPropagation();

  const menu = document.getElementById(`post-menu-${postId}`);

  // 关闭页面上所有其他可能打开的菜单（排他性）
  document.querySelectorAll(".action-menu-dropdown").forEach((m) => {
    if (m.id !== `post-menu-${postId}`) {
      m.style.display = "none";
    }
  });

  // 切换当前菜单
  if (menu) {
    const isHidden = menu.style.display === "none" || menu.style.display === "";
    menu.style.display = isHidden ? "block" : "none";
  }
}

// 点击页面任何其他地方，关闭所有下拉菜单
document.addEventListener("click", function () {
  document.querySelectorAll(".action-menu-dropdown").forEach((m) => {
    m.style.display = "none";
  });
});

// 加载更多动态
function loadMorePosts() {
  currentPage++;
  renderPosts();

  // 更新按钮文本
  const loadMoreBtn = document.getElementById("load-more-btn");
  if (loadMoreBtn) {
    loadMoreBtn.innerHTML = '<i class="fas fa-sync-alt"></i> 加载更多动态';
  }
}

// 渲染活跃用户
function renderActiveUsers() {
  const activeUsersList = document.querySelector(".active-users-list");
  if (!activeUsersList) return;

  // 筛选活跃用户（简化处理：取前5个）
  const activeUsers = users.slice(0, 5);

  activeUsersList.innerHTML = activeUsers
    .map(
      (user) => `
        <a href="profile.html?id=${user.id}" class="active-user">
            <img src="${user.avatar}" alt="${user.nickname}" class="active-user-avatar">
            <div class="active-user-info">
                <div class="active-user-name">${user.nickname}</div>
                <div class="active-user-status">${user.last_active}</div>
            </div>
        </a>
    `
    )
    .join("");
}

// 更新统计信息
function updateStats() {
  // 更新今日活跃用户数（模拟数据）
  const activeUsersSpan = document.getElementById("active-users");
  const todayPostsSpan = document.getElementById("today-posts");

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
    alert("请先登录后再操作");
    window.location.href = "login.html";
    return;
  }

  const postIndex = posts.findIndex((p) => p.id === postId);
  if (postIndex !== -1) {
    const post = posts[postIndex];
    post.is_liked = !post.is_liked;
    post.likes += post.is_liked ? 1 : -1;

    // 更新UI
    const likeBtn = document.querySelector(
      `[data-post-id="${postId}"] .like-btn`
    );
    if (likeBtn) {
      likeBtn.classList.toggle("liked");
      likeBtn.querySelector(".action-count").textContent = post.likes;
    }

    // 保存到本地存储
    saveToLocalStorage();
  }
}

// 查看评论
function viewComments(postId) {
  if (!currentUser) {
    alert("请先登录后再操作");
    window.location.href = "login.html";
    return;
  }

  // 这里应该跳转到动态详情页
  window.location.href = `post-detail.html?id=${postId}`;
}

// 分享动态
function sharePost(postId) {
  if (!currentUser) {
    alert("请先登录后再操作");
    window.location.href = "login.html";
    return;
  }

  const postIndex = posts.findIndex((p) => p.id === postId);
  if (postIndex !== -1) {
    posts[postIndex].shares += 1;

    // 更新UI
    const shareBtn = document.querySelector(
      `[data-post-id="${postId}"] .share-btn .action-count`
    );
    if (shareBtn) {
      shareBtn.textContent = posts[postIndex].shares;
    }

    // 模拟分享
    const post = posts[postIndex];
    const shareUrl = `${window.location.origin}/post-detail.html?id=${postId}`;
    const shareText = `${post.username} 的校园圈动态：${post.content.substring(
      0,
      50
    )}...`;

    // 使用Web Share API（如果支持）
    if (navigator.share) {
      navigator
        .share({
          title: "深大校园圈动态",
          text: shareText,
          url: shareUrl,
        })
        .then(() => console.log("分享成功"))
        .catch((err) => console.log("分享失败:", err));
    } else {
      // 回退方案：复制链接到剪贴板
      navigator.clipboard
        .writeText(`${shareText} ${shareUrl}`)
        .then(() => alert("链接已复制到剪贴板！"))
        .catch((err) => alert("复制失败，请手动复制链接"));
    }

    saveToLocalStorage();
  }
}

// 查看图片
function viewImage(imageUrl) {
  // 创建图片查看器
  const imageViewer = document.createElement("div");
  imageViewer.className = "image-viewer";
  imageViewer.innerHTML = `
        <div class="image-viewer-content">
            <img src="${imageUrl}" alt="查看大图">
            <button class="close-viewer"><i class="fas fa-times"></i></button>
        </div>
    `;

  document.body.appendChild(imageViewer);
  document.body.style.overflow = "hidden";

  // 关闭查看器
  imageViewer.querySelector(".close-viewer").addEventListener("click", () => {
    document.body.removeChild(imageViewer);
    document.body.style.overflow = "auto";
  });

  // 点击背景关闭
  imageViewer.addEventListener("click", (e) => {
    if (e.target === imageViewer) {
      document.body.removeChild(imageViewer);
      document.body.style.overflow = "auto";
    }
  });
}

// 搜索功能
function performSearch() {
  const searchInput = document.querySelector(".search-box input");
  if (!searchInput) return;

  const keyword = searchInput.value.trim();
  if (!keyword) return;

  // 在实际应用中，这里应该发送搜索请求
  // 这里简化处理：过滤动态
  const filteredPosts = posts.filter(
    (post) =>
      post.content.toLowerCase().includes(keyword.toLowerCase()) ||
      post.username.toLowerCase().includes(keyword.toLowerCase()) ||
      (post.tags &&
        post.tags.some((tag) =>
          tag.toLowerCase().includes(keyword.toLowerCase())
        ))
  );

  // 显示搜索结果
  const postsFeed = document.getElementById("posts-feed");
  if (postsFeed) {
    postsFeed.innerHTML = "";

    if (filteredPosts.length === 0) {
      postsFeed.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-search"></i>
                    <p>没有找到与"${keyword}"相关的内容</p>
                </div>
            `;
    } else {
      filteredPosts.forEach((post) => {
        const postElement = createPostElement(post);
        postsFeed.appendChild(postElement);
      });
    }
  }
}

// 退出登录
// 退出登录
function logout() {
  if (confirm("确定要退出登录吗？")) {
    // 清除所有用户相关的存储
    localStorage.removeItem("campus_social_current_user");
    sessionStorage.removeItem("campus_social_current_user");

    // 重置全局变量
    currentUser = null;

    // 立即更新UI
    updateUIForLogout();

    // 延迟跳转，让用户看到UI变化
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  }
}

// 新增：更新退出登录后的UI
function updateUIForLogout() {
  // 显示登录注册按钮
  const authButtons = document.getElementById("auth-buttons");
  if (authButtons) {
    authButtons.style.display = "flex";
  }

  // 隐藏用户菜单
  const userMenu = document.getElementById("user-menu");
  if (userMenu) {
    userMenu.style.display = "none";
  }

  // 隐藏关注相关标签
  const followingTab = document.getElementById("following-tab");
  const filterFollowing = document.getElementById("filter-following");
  if (followingTab) followingTab.style.display = "none";
  if (filterFollowing) filterFollowing.style.display = "none";

  // 显示游客登录提示
  const loginPrompt = document.getElementById("login-prompt");
  if (loginPrompt) {
    loginPrompt.style.display = "block";
  }

  // 移除管理员链接（如果存在）
  const navMenu = document.querySelector(".nav-menu");
  if (navMenu) {
    const adminLink = navMenu.querySelector('a[href="admin.html"]');
    if (adminLink) {
      adminLink.remove();
    }
  }

  console.log("用户已退出登录");
}

// 编辑动态
function editPost(postId) {
  // 跳转到编辑页面
  window.location.href = `post-edit.html?id=${postId}`;
}

// 删除动态
function deletePost(postId) {
  if (confirm("确定要删除这条动态吗？删除后无法恢复。")) {
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex !== -1) {
      posts.splice(postIndex, 1);
      saveToLocalStorage();

      // 从页面移除
      const postElement = document.querySelector(`[data-post-id="${postId}"]`);
      if (postElement) {
        postElement.remove();
      }

      // 如果没有动态了，显示提示
      const postsFeed = document.getElementById("posts-feed");
      if (postsFeed && postsFeed.children.length === 0) {
        renderPosts();
      }
    }
  }
}

// 工具函数：获取用户信息
function getUserById(userId) {
  return users.find((user) => user.id === userId);
}
