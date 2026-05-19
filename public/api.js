// Fishstagram API client — exposes window.API
// All paths are relative (same-origin, served by Express on port 3000)
(function () {
  let userId = localStorage.getItem('fs_userId') || 'user_demo';
  let accessToken = localStorage.getItem('fs_token') || null;
  let _me = null;

  function hdrs() {
    const h = { 'Content-Type': 'application/json', 'x-user-id': userId };
    if (accessToken) h['Authorization'] = 'Bearer ' + accessToken;
    return h;
  }

  async function apiFetch(method, urlPath, body) {
    const opts = { method, headers: hdrs() };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const r = await fetch(urlPath, opts);
    const data = await r.json();
    if (!r.ok) throw data;
    return data;
  }

  function setAuth(data) {
    if (data.user) {
      userId = data.user.id;
      _me = data.user;
      localStorage.setItem('fs_userId', userId);
    }
    if (data.accessToken) {
      accessToken = data.accessToken;
      localStorage.setItem('fs_token', accessToken);
    }
  }

  window.API = {
    getUserId() { return userId; },

    async getMe() {
      _me = await apiFetch('GET', '/api/auth/me');
      return _me;
    },

    async login(email, password) {
      const data = await apiFetch('POST', '/api/auth/login', { email, password });
      setAuth(data);
      return data;
    },

    async register(username, email, password) {
      const data = await apiFetch('POST', '/api/auth/register', { username, email, password });
      setAuth(data);
      _me = null;
      return data;
    },

    async logout() {
      await apiFetch('POST', '/api/auth/logout').catch(() => {});
      userId = 'user_demo';
      accessToken = null;
      _me = null;
      localStorage.removeItem('fs_userId');
      localStorage.removeItem('fs_token');
    },

    async getCatches(limit, cursor) {
      const params = new URLSearchParams({ limit: String(limit || 20) });
      if (cursor) params.set('cursor', cursor);
      return apiFetch('GET', '/api/catches?' + params);
    },

    async logCatch(body) {
      return apiFetch('POST', '/api/catches', body);
    },

    async getCatch(catchId) {
      return apiFetch('GET', '/api/catches/' + catchId);
    },

    async deleteCatch(catchId) {
      return apiFetch('DELETE', '/api/catches/' + catchId);
    },

    async getFeed(limit, cursor) {
      const params = new URLSearchParams({ limit: String(limit || 20) });
      if (cursor) params.set('cursor', cursor);
      return apiFetch('GET', '/api/feed?' + params);
    },

    async likePost(postId) {
      return apiFetch('POST', '/api/posts/' + postId + '/like');
    },

    async unlikePost(postId) {
      return apiFetch('DELETE', '/api/posts/' + postId + '/like');
    },

    async getComments(postId) {
      return apiFetch('GET', '/api/posts/' + postId + '/comments');
    },

    async postComment(postId, content) {
      return apiFetch('POST', '/api/posts/' + postId + '/comments', { content });
    },

    async deleteComment(commentId) {
      return apiFetch('DELETE', '/api/comments/' + commentId);
    },

    async getLeaderboard() {
      return apiFetch('GET', '/api/leaderboard');
    },

    async getSpecies(query) {
      const q = query ? '?query=' + encodeURIComponent(query) : '';
      return apiFetch('GET', '/api/species' + q);
    },

    async search(query) {
      return apiFetch('GET', '/api/search?query=' + encodeURIComponent(query));
    },

    async getNotifications() {
      return apiFetch('GET', '/api/notifications');
    },

    async markAllNotificationsRead() {
      return apiFetch('PATCH', '/api/notifications/read-all');
    },

    async getUser(id) {
      return apiFetch('GET', '/api/users/' + id);
    },

    async follow(id) {
      return apiFetch('POST', '/api/users/' + id + '/follow');
    },

    async unfollow(id) {
      return apiFetch('DELETE', '/api/users/' + id + '/follow');
    },

    async updateProfile(body) {
      return apiFetch('PATCH', '/api/me/profile', body);
    },

    async getUserBadges(userId) {
      return apiFetch('GET', '/api/users/' + userId + '/badges');
    },

    async uploadCatchImage(file) {
      const formData = new FormData();
      formData.append('file', file);
      const h = { 'x-user-id': userId };
      if (accessToken) h['Authorization'] = 'Bearer ' + accessToken;
      const r = await fetch('/api/uploads/catch-image', { method: 'POST', headers: h, body: formData });
      const data = await r.json();
      if (!r.ok) throw data;
      return data;
    },
  };
})();
