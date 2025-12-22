// post-detail.js
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = parseInt(urlParams.get("id"));

  if (!postId) {
    alert("动态不存在");
    window.location.href = "index.html";
    return;
  }

  const storedPosts =
    JSON.parse(localStorage.getItem("campus_social_posts")) || [];
  const post = storedPosts.find((p) => p.id === postId);

  if (post) {
    renderFullPost(post);
  } else {
    document.getElementById("post-content-target").innerHTML =
      "<p>动态不存在或已被删除</p>";
  }

  initPostDetail(postId);
  initCommentArea();
  initBackButton();
});

function initPostDetail(postId) {
  // 1. 获取动态数据 (从 localStorage 或全局变量)
  const post = posts.find((p) => p.id === postId);
  if (!post) {
    document.getElementById("post-content-target").innerHTML =
      "<p>动态已被删除</p>";
    return;
  }

  // 2. 渲染主内容
  renderPostMain(post);

  // 3. 渲染评论列表
  renderComments(post.id);

  // 4. 绑定发布评论事件
  document.getElementById("submit-comment").addEventListener("click", () => {
    handleAddComment(postId);
  });
}

function renderPostMain(post) {
  const user = getUserById(post.user_id);
  const target = document.getElementById("post-content-target");
  const authorAvatar = post.avatar || "img/default-avatar.png";
  const imagesHtml = post.images
    ? post.images.map((img) => `<img src="${img}">`).join("")
    : "";

  target.innerHTML = `
        <div class="post-header-detail">
            <div class="user-info" onclick="window.location.href='profile.html?id=${
              post.user_id
            }'">
                <img src="${authorAvatar}" class="post-avatar" style="cursor: pointer;">
                <div style="cursor: pointer;">
                    <h4>${post.username}</h4>
                    <span class="post-time">${post.created_at}</span>
                </div>
            </div>
        </div>
        <div class="post-body">
            <p class="post-full-text">${post.content}</p>
            <div class="post-detail-images">${imagesHtml}</div>
        </div>
        <div class="post-actions-detail">
            <button class="action-btn ${
              post.isLiked ? "liked" : ""
            }" onclick="toggleLike(${post.id})">
                <i class="fa${post.isLiked ? "s" : "r"} fa-thumbs-up"></i> 
                <span>${post.likes}</span>
            </button>
            <button class="action-btn"><i class="far fa-share-square"></i> 分享</button>
        </div>
    `;

  // 更新侧边栏作者信息
  document.getElementById("author-info").innerHTML = `
        <div style="text-align:center; padding: 20px;display: flex; flex-direction: column; align-items: center;" onclick="window.location.href='profile.html?id=${post.user_id}'">
            <img src="${post.avatar}" style="width:80px; height:80px; border-radius:50%;cursor: pointer;">
            <h3 style="text-align: center; margin: 10px 0;cursor: pointer;">${post.username}</h3>
            <p style="color:var(--gray-color); font-size:14px;">发布了该动态</p>
            <button class="btn btn-outline" style="margin-top:15px; width:100%">点击前往他的主页</button>
        </div>
    `;
}

function renderComments(postId) {
  // 假设评论存在 localStorage 的 campus_social_comments 中
  const allComments = JSON.parse(
    localStorage.getItem("campus_social_comments") || "[]"
  );
  const postComments = allComments.filter((c) => c.postId === postId);

  const listTarget = document.getElementById("comments-list");
  document.getElementById("comment-count").textContent = postComments.length;

  if (postComments.length === 0) {
    listTarget.innerHTML =
      '<p style="text-align:center; color:#999; padding:20px;">暂无评论，快来抢沙发吧！</p>';
    return;
  }

  listTarget.innerHTML = postComments
    .map(
      (c) => `
        <div class="comment-item">
            <img src="${c.userAvatar}" class="active-user-avatar">
            <div class="comment-body">
                <div class="comment-user">
                    ${c.username}
                    <span class="comment-time">${c.time}</span>
                </div>
                <div class="comment-text">${c.text}</div>
            </div>
        </div>
    `
    )
    .join("");
}

function handleAddComment(postId) {
  const text = document.getElementById("comment-textarea").value.trim();
  if (!text) return;

  const currentUser = JSON.parse(
    localStorage.getItem("campus_social_current_user")
  );
  if (!currentUser) {
    alert("请先登录");
    return;
  }

  const newComment = {
    id: Date.now(),
    postId: postId,
    userId: currentUser.id,
    username: currentUser.nickname,
    userAvatar: currentUser.avatar || "img/default-avatar.png",
    text: text,
    time: "刚刚",
  };

  const allComments = JSON.parse(
    localStorage.getItem("campus_social_comments") || "[]"
  );
  allComments.unshift(newComment);
  localStorage.setItem("campus_social_comments", JSON.stringify(allComments));

  document.getElementById("comment-textarea").value = "";
  renderComments(postId);
}

function renderFullPost(post) {
  const user = getUserById(post.user_id);
  const target = document.getElementById("post-content-target");
  const userAvatar = post.avatar || "img/default-avatar.png";

  // 渲染动态全文、点赞数和时间戳
  target.innerHTML = `
    <div class="post-detail-header">
      <div onclick="window.location.href='profile.html?id=${post.user_id}'">
        <img src="${
          post.userAvatar
        }" class="detail-avatar" style="cursor: pointer;">
        <div class="detail-user-info" style="cursor: pointer;">
          <h4>${post.username}</h4>
          <span class="detail-time">${post.time} (发布于深大校园)</span>
        </div>
      </div>
    </div>
    
    <div class="post-detail-content">
      <p style="white-space: pre-wrap;">${post.content}</p>
      <div class="post-detail-images">
        ${
          post.images
            ? post.images
                .map((img) => `<img src="${img}" class="full-width-img">`)
                .join("")
            : ""
        }
      </div>
    </div>
    
    <div class="post-detail-footer">
      <span class="like-count"><i class="fas fa-heart"></i> ${
        post.likes || 0
      } 人觉得很赞</span>
    </div>
  `;

  // 更新评论数量
  document.getElementById("comment-count").textContent = post.comments
    ? post.comments.length
    : 0;
}

function initCommentArea() {
  const currentUser = JSON.parse(
    localStorage.getItem("campus_social_current_user")
  );
  const commentAvatar = document.getElementById("current-user-avatar");

  if (commentAvatar) {
    // 如果用户已登录且有头像，则显示头像，否则显示默认图
    if (currentUser && currentUser.avatar) {
      commentAvatar.src = currentUser.avatar;
    } else {
      commentAvatar.src = "img/default-avatar.png";
    }
  }
}

function initBackButton() {
  const backBtn = document.getElementById("back-btn");
  if (!backBtn) return;

  backBtn.addEventListener("click", function () {
    // 优先返回历史记录上一页
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // 如果没有历史记录，跳转到默认页面（比如帖子列表）
      window.location.href = "index.html"; // 替换为你的首页/帖子列表页路径
    }
  });
}
