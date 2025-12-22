// posts.js - 动态管理功能
console.log("profile.js 已加载");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM已加载");

  // 测试：能否找到容器元素
  const container = document.querySelector(".profile-container");
  console.log("容器元素:", container);

  // 测试：显示一条消息
  const content = document.getElementById("posts-content");
  if (content) {
    content.innerHTML =
      '<p style="padding: 20px; color: red;">测试：profile.js 已执行</p>';
  }

  const followingTab = document.getElementById("following-tab");

  if (followingTab) {
    followingTab.addEventListener("click", function () {
      window.location.href = "following-posts.html";
    });
  }
});
// 模拟数据存储
// 模拟动态数据
let comments = [];

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", function () {
  initPosts();
  setupPostsEventListeners();
});

// 初始化动态系统
function initPosts() {
  // 从本地存储加载数据
  loadPostsFromStorage();

  // 如果是动态详情页，加载特定动态
  if (window.location.pathname.includes("post-detail.html")) {
    loadPostDetail();
  }

  // 如果是发布页，初始化发布功能
  if (
    window.location.pathname.includes("post-edit.html") ||
    window.location.pathname.includes("publish.html")
  ) {
    initPostEditor();
  }
}

// 从本地存储加载动态数据
function loadPostsFromStorage() {
  const storedPosts = localStorage.getItem("campus_social_posts");
  const storedComments = localStorage.getItem("campus_social_comments");

  if (storedPosts) {
    posts = JSON.parse(storedPosts);
  }

  if (storedComments) {
    comments = JSON.parse(storedComments);
  }
}

// 保存数据到本地存储
function saveToStorage() {
  localStorage.setItem("campus_social_posts", JSON.stringify(posts));
  localStorage.setItem("campus_social_comments", JSON.stringify(comments));
}

// 设置事件监听器
function setupPostsEventListeners() {
  // 点赞按钮
  document.addEventListener("click", function (e) {
    if (e.target.closest(".like-btn")) {
      const likeBtn = e.target.closest(".like-btn");
      const postId = parseInt(likeBtn.closest(".post-card").dataset.postId);
      toggleLike(postId, likeBtn);
    }
  });

  // 评论按钮
  document.addEventListener("click", function (e) {
    if (e.target.closest(".comment-btn")) {
      const commentBtn = e.target.closest(".comment-btn");
      const postId = parseInt(commentBtn.closest(".post-card").dataset.postId);
      showCommentSection(postId);
    }
  });

  // 发布动态表单
  const postForm = document.getElementById("post-form");
  if (postForm) {
    postForm.addEventListener("submit", handlePostSubmit);
  }

  // 图片上传
  const imageUpload = document.getElementById("post-images");
  if (imageUpload) {
    imageUpload.addEventListener("change", handleImageUpload);
  }

  // 标签输入
  const tagsInput = document.getElementById("post-tags-input");
  if (tagsInput) {
    tagsInput.addEventListener("keypress", handleTagInput);
  }
}

// ========== 动态详情页功能 ==========

// 加载动态详情
function loadPostDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = parseInt(urlParams.get("id"));

  if (!postId) {
    showErrorMessage("动态不存在");
    return;
  }

  const post = posts.find((p) => p.id === postId);
  if (!post) {
    showErrorMessage("动态不存在或已被删除");
    return;
  }

  renderPostDetail(post);
  loadComments(postId);
}

// 渲染动态详情
function renderPostDetail(post) {
  const postDetail = document.getElementById("post-detail");
  if (!postDetail) return;

  // 构建图片HTML
  let imagesHTML = "";
  if (post.images && post.images.length > 0) {
    imagesHTML = `
            <div class="post-images-detail">
                ${post.images
                  .map(
                    (img, index) => `
                    <div class="image-container">
                        <img src="${img}" alt="动态图片 ${
                      index + 1
                    }" class="post-image-detail" 
                             onclick="viewImageGallery(${post.id}, ${index})">
                    </div>
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

  postDetail.innerHTML = `
        <div class="post-header-detail">
          <a class="post-avatar-link" data-userid="${post.user_id}">
            <img src="${post.avatar}" alt="${post.username}" class="post-avatar-detail">
          </a>
            <div class="post-user-info-detail">
                <a href="profile.html?id=${
                  post.user_id
                }" class="post-username-detail">${post.username}</a>
                <div class="post-time-detail">${post.created_at}</div>
            </div>
            ${
              isCurrentUserPost(post.user_id)
                ? `
                <div class="post-actions-menu">
                    <button class="action-menu-btn" onclick="togglePostMenu(${post.id})">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                    <div class="action-menu-dropdown" id="post-menu-${post.id}">
                        <button onclick="editPost(${post.id})"><i class="fas fa-edit"></i> 编辑</button>
                        <button onclick="deletePost(${post.id})" class="danger">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            `
                : ""
            }
        </div>
        <div class="post-content-detail">
            <div class="post-text-detail">${post.content}</div>
            ${tagsHTML}
            ${imagesHTML}
        </div>
        <div class="post-stats">
            <span><i class="fas fa-heart"></i> ${post.likes} 点赞</span>
            <span><i class="fas fa-comment"></i> ${post.comments} 评论</span>
            <span><i class="fas fa-share-alt"></i> ${post.shares} 分享</span>
        </div>
        <div class="post-actions-detail">
            <button class="action-btn like-btn ${post.is_liked ? "liked" : ""}" 
                    onclick="toggleLike(${post.id})">
                <i class="fas fa-heart"></i> ${post.is_liked ? "已赞" : "点赞"}
            </button>
            <button class="action-btn comment-btn" onclick="focusCommentInput()">
                <i class="fas fa-comment"></i> 评论
            </button>
            <button class="action-btn share-btn" onclick="sharePost(${
              post.id
            })">
                <i class="fas fa-share-alt"></i> 分享
            </button>
        </div>
    `;
}

// ========== 点赞功能 ==========

// 切换点赞状态
function toggleLike(postId, likeBtn = null) {
  // 检查登录状态
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("请先登录后再操作");
    window.location.href = "login.html";
    return;
  }

  const postIndex = posts.findIndex((p) => p.id === postId);
  if (postIndex === -1) return;

  const post = posts[postIndex];
  const wasLiked = post.is_liked;

  // 更新点赞状态
  post.is_liked = !wasLiked;
  post.likes += wasLiked ? -1 : 1;

  // 更新点赞记录
  updateLikeRecord(postId, currentUser.id, !wasLiked);

  // 更新UI
  if (likeBtn) {
    updateLikeButton(likeBtn, post.is_liked, post.likes);
  } else {
    // 更新详情页的按钮
    const detailLikeBtn = document.querySelector(
      ".post-actions-detail .like-btn"
    );
    if (detailLikeBtn) {
      updateLikeButton(detailLikeBtn, post.is_liked, post.likes);
    }
  }

  // 保存数据
  saveToStorage();

  return post.is_liked;
}

// 更新点赞按钮显示
function updateLikeButton(button, isLiked, likesCount) {
  if (!button) return;

  button.classList.toggle("liked", isLiked);
  const icon = button.querySelector("i");
  const countSpan =
    button.querySelector(".action-count") ||
    button.querySelector(".like-count");

  if (icon) {
    icon.className = isLiked ? "fas fa-heart" : "far fa-heart";
  }

  if (countSpan) {
    countSpan.textContent = likesCount;
  } else {
    // 如果没有计数元素，更新按钮文本
    const textSpan = button.querySelector(".action-text");
    if (textSpan) {
      textSpan.textContent = isLiked ? "已赞" : "点赞";
    }
  }
}

// 更新点赞记录
function updateLikeRecord(postId, userId, isLiked) {
  // 这里可以存储用户的点赞记录
  // 实际应用中应该发送到服务器
  const likeKey = `post_${postId}_like_${userId}`;
  if (isLiked) {
    localStorage.setItem(likeKey, "true");
  } else {
    localStorage.removeItem(likeKey);
  }
}

// ========== 评论功能 ==========

// 显示评论区域
function showCommentSection(postId) {
  const postElement = document.querySelector(`[data-post-id="${postId}"]`);
  if (!postElement) return;

  // 检查是否已经有评论区域
  let commentSection = postElement.querySelector(".comments-section");

  if (!commentSection) {
    // 创建评论区域
    commentSection = document.createElement("div");
    commentSection.className = "comments-section";
    commentSection.innerHTML = `
            <div class="comments-list" id="comments-${postId}">
                <!-- 评论将在这里动态加载 -->
            </div>
            <div class="comment-form">
                <textarea class="comment-input" placeholder="写下你的评论..." 
                          rows="2" maxlength="500"></textarea>
                <div class="comment-form-actions">
                    <button class="btn btn-primary btn-sm" onclick="submitComment(${postId})">发布</button>
                    <button class="btn btn-outline btn-sm" onclick="hideCommentSection(${postId})">取消</button>
                </div>
            </div>
        `;

    // 添加到动态卡片后
    const postActions = postElement.querySelector(".post-actions");
    if (postActions) {
      postElement.insertBefore(commentSection, postActions.nextSibling);
    }

    // 加载评论
    loadComments(postId, commentSection);
  }

  // 显示评论区域
  commentSection.style.display = "block";

  // 聚焦到评论输入框
  const commentInput = commentSection.querySelector(".comment-input");
  if (commentInput) {
    commentInput.focus();
  }
}

// 隐藏评论区域
function hideCommentSection(postId) {
  const postElement = document.querySelector(`[data-post-id="${postId}"]`);
  if (!postElement) return;

  const commentSection = postElement.querySelector(".comments-section");
  if (commentSection) {
    commentSection.style.display = "none";
  }
}

// 加载评论
function loadComments(postId, container = null) {
  const postComments = comments.filter((c) => c.post_id === postId);
  const targetContainer =
    container || document.getElementById(`comments-${postId}`);

  if (!targetContainer) return;

  if (postComments.length === 0) {
    targetContainer.innerHTML =
      '<div class="no-comments">还没有评论，快来抢沙发吧！</div>';
    return;
  }

  // 按时间排序（最新的在前）
  postComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  targetContainer.innerHTML = postComments
    .map(
      (comment) => `
        <div class="comment-item" data-comment-id="${comment.id}">
            <img src="${comment.avatar || "images/default-avatar.png"}" 
                 alt="${comment.username}" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-username">${comment.username}</span>
                    <span class="comment-time">${comment.created_at}</span>
                </div>
                <div class="comment-text">${comment.content}</div>
                <div class="comment-actions">
                    <button class="reply-btn" onclick="replyToComment(${
                      comment.id
                    }, '${comment.username}')">
                        回复
                    </button>
                    ${
                      isCurrentUserComment(comment.user_id)
                        ? `
                        <button class="delete-comment-btn" onclick="deleteComment(${comment.id})">
                            删除
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// 提交评论
function submitComment(postId) {
  // 检查登录状态
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("请先登录后再评论");
    window.location.href = "login.html";
    return;
  }

  const postElement = document.querySelector(`[data-post-id="${postId}"]`);
  if (!postElement) return;

  const commentInput = postElement.querySelector(".comment-input");
  if (!commentInput) return;

  const content = commentInput.value.trim();
  if (!content) {
    alert("评论内容不能为空");
    return;
  }

  if (content.length > 500) {
    alert("评论内容不能超过500字");
    return;
  }

  // 创建评论对象
  const newComment = {
    id: Date.now(),
    post_id: postId,
    user_id: currentUser.id,
    username: currentUser.nickname,
    avatar: currentUser.avatar,
    content: content,
    created_at: "刚刚",
    parent_id: null, // 回复评论时使用
  };

  // 添加到评论列表
  comments.push(newComment);

  // 更新动态的评论数
  const postIndex = posts.findIndex((p) => p.id === postId);
  if (postIndex !== -1) {
    posts[postIndex].comments += 1;

    // 更新动态卡片上的评论数
    const commentBtn = postElement.querySelector(".comment-btn .action-count");
    if (commentBtn) {
      commentBtn.textContent = posts[postIndex].comments;
    }
  }

  // 清空输入框
  commentInput.value = "";

  // 重新加载评论
  loadComments(postId, postElement.querySelector(".comments-list"));

  // 保存数据
  saveToStorage();

  // 显示成功提示
  showToast("评论发布成功");
}

// 删除评论
function deleteComment(commentId) {
  if (!confirm("确定要删除这条评论吗？")) {
    return;
  }

  const commentIndex = comments.findIndex((c) => c.id === commentId);
  if (commentIndex === -1) return;

  const comment = comments[commentIndex];

  // 减少动态的评论数
  const postIndex = posts.findIndex((p) => p.id === comment.post_id);
  if (postIndex !== -1) {
    posts[postIndex].comments = Math.max(0, posts[postIndex].comments - 1);

    // 更新UI中的评论数
    const postElement = document.querySelector(
      `[data-post-id="${comment.post_id}"]`
    );
    if (postElement) {
      const commentBtn = postElement.querySelector(
        ".comment-btn .action-count"
      );
      if (commentBtn) {
        commentBtn.textContent = posts[postIndex].comments;
      }
    }
  }

  // 删除评论
  comments.splice(commentIndex, 1);

  // 从UI中移除
  const commentElement = document.querySelector(
    `[data-comment-id="${commentId}"]`
  );
  if (commentElement) {
    commentElement.remove();
  }

  // 保存数据
  saveToStorage();

  showToast("评论已删除");
}

// 回复评论
function replyToComment(commentId, username) {
  const commentElement = document.querySelector(
    `[data-comment-id="${commentId}"]`
  );
  if (!commentElement) return;

  const postId = commentElement.closest(".comments-section")
    ? commentElement.closest("[data-post-id]").dataset.postId
    : null;

  if (!postId) return;

  const commentInput = document.querySelector(
    `[data-post-id="${postId}"] .comment-input`
  );
  if (!commentInput) return;

  commentInput.value = `@${username} `;
  commentInput.focus();
}

// ========== 动态发布功能 ==========

// 初始化动态编辑器
function initPostEditor() {
  // 如果是编辑模式，加载动态内容
  const urlParams = new URLSearchParams(window.location.search);
  const postId = parseInt(urlParams.get("id"));
  const editMode = urlParams.has("id");

  if (editMode && postId) {
    loadPostForEditing(postId);
    document.getElementById("page-title").textContent = "编辑动态";
    document.getElementById("submit-btn").innerHTML =
      '<i class="fas fa-save"></i> 保存修改';
  }

  // 设置标签系统
  setupPostTags();

  // 设置图片预览
  setupImagePreview();

  // 设置字符计数
  setupCharCount();
}

// 加载要编辑的动态
function loadPostForEditing(postId) {
  const post = posts.find((p) => p.id === postId);
  if (!post) {
    showErrorMessage("动态不存在或已被删除");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
    return;
  }

  // 检查权限
  const currentUser = getCurrentUser();
  if (!currentUser || post.user_id !== currentUser.id) {
    showErrorMessage("您没有权限编辑此动态");
    setTimeout(() => {
      window.location.href = `post-detail.html?id=${postId}`;
    }, 2000);
    return;
  }

  // 填充表单
  document.getElementById("post-content").value = post.content;

  // 加载标签
  if (post.tags && post.tags.length > 0) {
    const tagsContainer = document.getElementById("selected-tags");
    tagsContainer.innerHTML = post.tags
      .map(
        (tag) => `
            <span class="tag">${tag}
                <span class="remove" onclick="removeTag(this, '${tag}')">&times;</span>
            </span>
        `
      )
      .join("");
  }

  // 存储编辑的帖子ID
  document.getElementById("post-form").dataset.editId = postId;
}

// 设置动态标签系统
function setupPostTags() {
  const tagsInput = document.getElementById("post-tags-input");
  if (!tagsInput) return;

  let selectedTags = new Set();

  // 输入标签
  tagsInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = this.value.trim().replace(/#/g, "");
      if (tag && tag.length > 0 && tag.length <= 10 && !selectedTags.has(tag)) {
        addPostTag(tag);
        this.value = "";
      }
    }
  });

  // 热门标签建议
  const suggestedTags = document.querySelectorAll(".tag-suggestion");
  suggestedTags.forEach((tag) => {
    tag.addEventListener("click", function () {
      const tagText = this.textContent.replace("#", "").trim();
      if (!selectedTags.has(tagText)) {
        addPostTag(tagText);
      }
    });
  });

  // 添加标签函数
  window.addPostTag = function (tag) {
    selectedTags.add(tag);

    const tagsContainer = document.getElementById("selected-tags");
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.innerHTML = `
            ${tag}
            <span class="remove" onclick="removePostTag(this, '${tag}')">&times;</span>
        `;

    tagsContainer.appendChild(tagElement);
  };

  // 移除标签函数
  window.removePostTag = function (element, tag) {
    element.parentElement.remove();
    selectedTags.delete(tag);
  };
}

// 处理标签输入
function handleTagInput(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const input = e.target;
    const tag = input.value.trim().replace(/#/g, "");

    if (tag && tag.length > 0 && tag.length <= 10) {
      addPostTag(tag);
      input.value = "";
    }
  }
}

// 设置图片预览
function setupImagePreview() {
  const imageUpload = document.getElementById("post-images");
  if (!imageUpload) return;

  imageUpload.addEventListener("change", function (e) {
    const files = Array.from(e.target.files);
    const previewContainer = document.getElementById("image-preview");

    if (!previewContainer) return;

    // 清空之前的预览
    previewContainer.innerHTML = "";

    // 限制最多9张图片
    if (files.length > 9) {
      alert("最多只能上传9张图片");
      files.splice(9);
    }

    files.forEach((file, index) => {
      if (!file.type.startsWith("image/")) {
        alert(`文件 ${file.name} 不是图片类型`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB限制
        alert(`图片 ${file.name} 大小不能超过5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const imgContainer = document.createElement("div");
        imgContainer.className = "image-preview-item";
        imgContainer.innerHTML = `
                    <img src="${e.target.result}" alt="预览图片">
                    <button type="button" class="remove-image-btn" onclick="removePreviewImage(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
        previewContainer.appendChild(imgContainer);
      };
      reader.readAsDataURL(file);
    });
  });
}

// 移除预览图片
window.removePreviewImage = function (index) {
  const imageUpload = document.getElementById("post-images");
  const files = Array.from(imageUpload.files);

  // 创建新的FileList
  const dt = new DataTransfer();
  files.forEach((file, i) => {
    if (i !== index) {
      dt.items.add(file);
    }
  });

  imageUpload.files = dt.files;

  // 重新生成预览
  const event = new Event("change", { bubbles: true });
  imageUpload.dispatchEvent(event);
};

// 设置字符计数
function setupCharCount() {
  const textarea = document.getElementById("post-content");
  const charCount = document.getElementById("char-count");

  if (!textarea || !charCount) return;

  textarea.addEventListener("input", function () {
    const count = this.value.length;
    charCount.textContent = count;

    // 改变颜色当接近限制
    if (count > 1800) {
      charCount.style.color = "#e74c3c";
    } else if (count > 1500) {
      charCount.style.color = "#f39c12";
    } else {
      charCount.style.color = "#666";
    }
  });
}

// 从链接添加图片
window.addImageFromLink = function () {
  const linkInput = document.getElementById("image-link");
  const url = linkInput.value.trim();

  if (!url) {
    alert("请输入图片链接");
    return;
  }

  // 简单的URL验证
  if (!url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
    alert("请输入有效的图片链接（支持jpg、png、gif、webp格式）");
    return;
  }

  const previewContainer = document.getElementById("image-preview");
  if (!previewContainer) return;

  // 检查是否已添加
  const existingImages = previewContainer.querySelectorAll(
    ".image-preview-item"
  );
  if (existingImages.length >= 9) {
    alert("最多只能添加9张图片");
    return;
  }

  // 创建预览
  const imgContainer = document.createElement("div");
  imgContainer.className = "image-preview-item";
  imgContainer.innerHTML = `
        <img src="${url}" alt="链接图片" onerror="this.parentElement.remove(); alert('图片加载失败，请检查链接');">
        <button type="button" class="remove-image-btn" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

  previewContainer.appendChild(imgContainer);
  linkInput.value = "";
};

// 处理图片上传
function handleImageUpload(e) {
  // 预览功能已在setupImagePreview中处理
  // 这里可以添加额外的处理逻辑
}

// 处理动态提交
function handlePostSubmit(e) {
  e.preventDefault();

  // 检查登录状态
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("请先登录后再发布动态");
    window.location.href = "login.html";
    return;
  }

  const content = document.getElementById("post-content").value.trim();
  if (!content) {
    alert("动态内容不能为空");
    return;
  }

  if (content.length > 2000) {
    alert("动态内容不能超过2000字");
    return;
  }

  // 获取标签
  const tags = Array.from(document.querySelectorAll("#selected-tags .tag")).map(
    (tag) => tag.textContent.replace("×", "").trim()
  );

  // 获取图片（包括上传的文件和链接图片）
  const images = [];

  // 处理上传的图片文件
  const imageFiles = document.getElementById("post-images").files;
  if (imageFiles.length > 0) {
    for (let i = 0; i < Math.min(imageFiles.length, 9); i++) {
      const file = imageFiles[i];
      // 在实际应用中，这里应该上传图片到服务器并获取URL
      // 这里使用本地URL作为示例
      const imageUrl = URL.createObjectURL(file);
      images.push(imageUrl);
    }
  }

  // 处理预览中的链接图片
  const previewImages = document.querySelectorAll("#image-preview img");
  previewImages.forEach((img) => {
    const src = img.src;
    if (src && !images.includes(src)) {
      images.push(src);
    }
  });

  // 限制最多9张
  if (images.length > 9) {
    images.splice(9);
  }

  // 检查是编辑还是新建
  const isEdit = e.target.dataset.editId;

  if (isEdit) {
    // 编辑现有动态
    const postId = parseInt(isEdit);
    const postIndex = posts.findIndex((p) => p.id === postId);

    if (postIndex !== -1) {
      posts[postIndex].content = content;
      posts[postIndex].tags = tags;
      posts[postIndex].images = images;
      posts[postIndex].updated_at = new Date().toISOString();

      showToast("动态更新成功");
    }
  } else {
    // 创建新动态
    const newPost = {
      id: Date.now(),
      user_id: currentUser.id,
      username: currentUser.nickname,
      avatar: currentUser.avatar,
      content: content,
      images: images,
      tags: tags,
      likes: 0,
      comments: 0,
      shares: 0,
      is_liked: false,
      created_at: "刚刚",
      updated_at: null,
    };

    posts.unshift(newPost); // 添加到开头
    showToast("动态发布成功");
  }

  // 保存到本地存储
  saveToStorage();

  // 延迟跳转，让用户看到成功提示
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
}

// ========== 动态管理功能 ==========

// 删除动态
function deletePost(postId) {
  if (!confirm("确定要删除这条动态吗？删除后无法恢复。")) {
    return;
  }

  const postIndex = posts.findIndex((p) => p.id === postId);
  if (postIndex === -1) {
    showErrorMessage("动态不存在");
    return;
  }

  // 检查权限
  const currentUser = getCurrentUser();
  if (!currentUser || posts[postIndex].user_id !== currentUser.id) {
    showErrorMessage("您没有权限删除此动态");
    return;
  }

  // 删除动态
  posts.splice(postIndex, 1);

  // 删除相关评论
  comments = comments.filter((c) => c.post_id !== postId);

  // 保存数据
  saveToStorage();

  // 如果是在详情页，返回首页
  if (window.location.pathname.includes("post-detail.html")) {
    window.location.href = "index.html";
  } else {
    // 如果是在首页，移除动态卡片
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
      postElement.remove();
    }
  }

  showToast("动态已删除");
}

// 编辑动态
function editPost(postId) {
  // 跳转到编辑页面
  window.location.href = `post-edit.html?id=${postId}`;
}

// 分享动态
function sharePost(postId) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  // 增加分享计数
  const postIndex = posts.findIndex((p) => p.id === postId);
  if (postIndex !== -1) {
    posts[postIndex].shares += 1;
    saveToStorage();

    // 更新UI
    const shareBtn = document.querySelector(
      `[data-post-id="${postId}"] .share-btn .action-count`
    );
    if (shareBtn) {
      shareBtn.textContent = posts[postIndex].shares;
    }
  }

  // 分享内容
  const shareUrl = `${window.location.origin}/post-detail.html?id=${postId}`;
  const shareText = `${post.username} 的校园圈动态：${post.content.substring(
    0,
    100
  )}...`;

  // 使用Web Share API
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
    // 回退方案：复制链接
    navigator.clipboard
      .writeText(`${shareText} ${shareUrl}`)
      .then(() => showToast("链接已复制到剪贴板"))
      .catch((err) => alert("复制失败，请手动复制链接"));
  }
}

// ========== 辅助函数 ==========

// 获取当前登录用户
function getCurrentUser() {
  const storedUser =
    localStorage.getItem("campus_social_current_user") ||
    sessionStorage.getItem("campus_social_current_user");
  return storedUser ? JSON.parse(storedUser) : null;
}

// 检查是否是当前用户的动态
function isCurrentUserPost(userId) {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.id === userId;
}

// 检查是否是当前用户的评论
function isCurrentUserComment(userId) {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.id === userId;
}

// 显示错误消息
function showErrorMessage(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;

  // 添加到页面顶部
  document.body.insertBefore(errorDiv, document.body.firstChild);

  // 3秒后自动移除
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 3000);
}

// 显示成功提示
function showToast(message) {
  // 移除现有的toast
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;

  document.body.appendChild(toast);

  // 显示toast
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // 3秒后隐藏并移除
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// 查看图片画廊
window.viewImageGallery = function (postId, startIndex) {
  const post = posts.find((p) => p.id === postId);
  if (!post || !post.images || post.images.length === 0) return;

  // 创建图片画廊
  const gallery = document.createElement("div");
  gallery.className = "image-gallery";
  gallery.innerHTML = `
        <div class="gallery-overlay" onclick="closeImageGallery()"></div>
        <div class="gallery-content">
            <div class="gallery-header">
                <span class="gallery-counter">${startIndex + 1} / ${
    post.images.length
  }</span>
                <button class="gallery-close" onclick="closeImageGallery()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="gallery-main">
                <img src="${post.images[startIndex]}" alt="图片 ${
    startIndex + 1
  }" class="gallery-image">
                ${
                  post.images.length > 1
                    ? `
                    <button class="gallery-nav gallery-prev" onclick="changeGalleryImage(-1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="gallery-nav gallery-next" onclick="changeGalleryImage(1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                `
                    : ""
                }
            </div>
            <div class="gallery-thumbnails">
                ${post.images
                  .map(
                    (img, index) => `
                    <img src="${img}" alt="缩略图 ${index + 1}" 
                         class="thumbnail ${
                           index === startIndex ? "active" : ""
                         }"
                         onclick="changeGalleryImageTo(${index})">
                `
                  )
                  .join("")}
            </div>
        </div>
    `;

  document.body.appendChild(gallery);
  document.body.style.overflow = "hidden";

  // 存储当前状态
  gallery.dataset.currentIndex = startIndex;
  gallery.dataset.images = JSON.stringify(post.images);
};

// 关闭图片画廊
window.closeImageGallery = function () {
  const gallery = document.querySelector(".image-gallery");
  if (gallery) {
    gallery.remove();
    document.body.style.overflow = "auto";
  }
};

// 切换画廊图片
window.changeGalleryImage = function (direction) {
  const gallery = document.querySelector(".image-gallery");
  if (!gallery) return;

  const images = JSON.parse(gallery.dataset.images);
  let currentIndex = parseInt(gallery.dataset.currentIndex);

  currentIndex += direction;

  if (currentIndex < 0) {
    currentIndex = images.length - 1;
  } else if (currentIndex >= images.length) {
    currentIndex = 0;
  }

  // 更新图片
  const galleryImage = gallery.querySelector(".gallery-image");
  galleryImage.src = images[currentIndex];

  // 更新计数器
  const counter = gallery.querySelector(".gallery-counter");
  counter.textContent = `${currentIndex + 1} / ${images.length}`;

  // 更新缩略图
  gallery.querySelectorAll(".thumbnail").forEach((thumb, index) => {
    thumb.classList.toggle("active", index === currentIndex);
  });

  // 更新当前索引
  gallery.dataset.currentIndex = currentIndex;
};

// 跳转到指定图片
window.changeGalleryImageTo = function (index) {
  const gallery = document.querySelector(".image-gallery");
  if (!gallery) return;

  const images = JSON.parse(gallery.dataset.images);

  if (index >= 0 && index < images.length) {
    // 更新图片
    const galleryImage = gallery.querySelector(".gallery-image");
    galleryImage.src = images[index];

    // 更新计数器
    const counter = gallery.querySelector(".gallery-counter");
    counter.textContent = `${index + 1} / ${images.length}`;

    // 更新缩略图
    gallery.querySelectorAll(".thumbnail").forEach((thumb, i) => {
      thumb.classList.toggle("active", i === index);
    });

    // 更新当前索引
    gallery.dataset.currentIndex = index;
  }
};

// 初始化CSS样式（用于动态添加的样式）
function initPostsStyles() {
  const style = document.createElement("style");
  style.textContent = `
        /* 评论区域样式 */
        .comments-section {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid var(--border-color);
        }
        
        .comments-list {
            max-height: 300px;
            overflow-y: auto;
            margin-bottom: 15px;
        }
        
        .comment-item {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .comment-item:last-child {
            border-bottom: none;
        }
        
        .comment-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
        }
        
        .comment-content {
            flex: 1;
        }
        
        .comment-header {
            margin-bottom: 5px;
        }
        
        .comment-username {
            font-weight: 600;
            color: var(--dark-color);
        }
        
        .comment-time {
            font-size: 12px;
            color: var(--gray-color);
            margin-left: 10px;
        }
        
        .comment-text {
            line-height: 1.5;
            margin-bottom: 8px;
        }
        
        .comment-actions {
            font-size: 12px;
        }
        
        .reply-btn, .delete-comment-btn {
            background: none;
            border: none;
            color: var(--gray-color);
            cursor: pointer;
            padding: 2px 5px;
            margin-right: 10px;
        }
        
        .reply-btn:hover {
            color: var(--primary-color);
        }
        
        .delete-comment-btn {
            color: var(--danger-color);
        }
        
        .comment-form textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            resize: vertical;
            font-family: inherit;
        }
        
        .comment-form textarea:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        
        .comment-form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 10px;
        }
        
        .no-comments {
            text-align: center;
            color: var(--gray-color);
            padding: 20px;
            font-style: italic;
        }
        
        /* 动态详情页样式 */
        .post-header-detail {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .post-avatar-detail {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            margin-right: 15px;
        }
        
        .post-user-info-detail {
            flex: 1;
        }
        
        .post-username-detail {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark-color);
            text-decoration: none;
        }
        
        .post-time-detail {
            color: var(--gray-color);
            margin-top: 5px;
        }
        
        .post-content-detail {
            margin-bottom: 20px;
        }
        
        .post-text-detail {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .post-images-detail {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .image-container {
            border-radius: var(--radius);
            overflow: hidden;
            cursor: pointer;
        }
        
        .post-image-detail {
            width: 100%;
            height: 200px;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .post-image-detail:hover {
            transform: scale(1.05);
        }
        
        .post-stats {
            display: flex;
            gap: 20px;
            padding: 15px 0;
            border-top: 1px solid var(--border-color);
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 20px;
            color: var(--gray-color);
        }
        
        .post-actions-detail {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }
        
        .post-actions-detail .action-btn {
            flex: 1;
            padding: 12px;
            font-size: 16px;
        }
        
        /* 图片画廊样式 */
        .image-gallery {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .gallery-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
        }
        
        .gallery-content {
            position: relative;
            z-index: 2001;
            width: 90%;
            max-width: 1000px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 20px;
        }
        
        .gallery-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            color: white;
        }
        
        .gallery-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 5px;
        }
        
        .gallery-main {
            position: relative;
            margin-bottom: 20px;
        }
        
        .gallery-image {
            width: 100%;
            height: auto;
            max-height: 70vh;
            object-fit: contain;
            border-radius: 5px;
        }
        
        .gallery-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: background 0.3s ease;
        }
        
        .gallery-nav:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .gallery-prev {
            left: 20px;
        }
        
        .gallery-next {
            right: 20px;
        }
        
        .gallery-thumbnails {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding: 10px 0;
        }
        
        .thumbnail {
            width: 80px;
            height: 60px;
            object-fit: cover;
            border-radius: 5px;
            cursor: pointer;
            opacity: 0.6;
            transition: opacity 0.3s ease;
        }
        
        .thumbnail:hover,
        .thumbnail.active {
            opacity: 1;
        }
        
        /* Toast提示样式 */
        .toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: var(--secondary-color);
            color: white;
            padding: 12px 24px;
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .toast.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        
        .toast i {
            font-size: 1.2rem;
        }
        
        /* 错误消息样式 */
        .error-message {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--danger-color);
            color: white;
            padding: 15px 20px;
            border-radius: var(--radius);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;

  document.head.appendChild(style);
}

// 页面加载时初始化样式
window.addEventListener("DOMContentLoaded", initPostsStyles);
