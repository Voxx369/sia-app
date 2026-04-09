const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

// Fonction pour récupérer le token actuel
const getAuthToken = () => {
  // Si le token est déjà en mémoire, l'utiliser
  if (authToken) return authToken;
  
  // Sinon, essayer de le charger depuis localStorage
  try {
    const savedAuth = localStorage.getItem("sia:auth");
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      if (parsed?.token) {
        authToken = parsed.token;
        return authToken;
      }
    }
  } catch (e) {
    console.error("Erreur lors du chargement du token:", e);
  }
  
  return null;
};

const toQueryString = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      search.set(key, value.join(","));
      return;
    }
    search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : "";
};

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    // Essayer de récupérer le message d'erreur détaillé du backend
    const errorMessage = isJson 
      ? (body?.message || body?.error || res.statusText) 
      : res.statusText;
    throw new Error(errorMessage);
  }
  return body;
}

export const api = {
  signup: (email, password, role = "student") =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }),
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  listCourses: () => request("/courses"),
  getCourse: (slug) => request(`/courses/${slug}`),
  enroll: (courseId) =>
    request("/enroll", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId }),
    }),
  unenroll: (courseId) =>
    request(`/enroll/${courseId}`, {
      method: "DELETE",
    }),
  myCourses: () => request(`/me/courses`),
  createCourse: (course) =>
    request("/courses", {
      method: "POST",
      body: JSON.stringify(course),
    }),
  myTeacherCourses: () => request("/courses/teacher/me"),
  courseEnrollments: (courseId) =>
    request(`/courses/teacher/${courseId}/enrollments`),
  cancelCourse: (courseId) =>
    request(`/courses/${courseId}/cancel`, {
      method: "PUT",
    }),
  retryZoom: (courseId) =>
    request(`/courses/${courseId}/retry-zoom`, {
      method: "POST",
    }),

  listPublicTeachers: (filters = {}) =>
    request(`/teachers/public${toQueryString(filters)}`),
  getMyTeacherProfile: () => request("/teachers/me/profile"),
  updateMyTeacherProfile: (payload) =>
    request("/teachers/me/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  updateSubscriptionEnabled: (enabled) =>
    request("/teachers/me/subscription-enabled", {
      method: "PUT",
      body: JSON.stringify({ enabled }),
    }),

  listBlogPosts: (filters = {}) =>
    request(`/blog/posts${toQueryString(filters)}`),
  getBlogPostBySlug: (slug) => request(`/blog/posts/${encodeURIComponent(slug)}`),
  createBlogPost: (payload) =>
    request("/blog/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateBlogPost: (id, payload) =>
    request(`/blog/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  listAnnouncementFeed: () => request("/announcements/feed"),
  listMyAnnouncements: () => request("/announcements/my"),
  createAnnouncement: (payload) =>
    request("/announcements", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getContent: (keys) =>
    request(`/content${toQueryString({ keys: Array.isArray(keys) ? keys : [keys] })}`),

  getMyCourseReview: (courseId) =>
    request(`/reviews/courses/${courseId}/me`),
  upsertMyCourseReview: (courseId, payload) =>
    request(`/reviews/courses/${courseId}/me`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  listMyReviews: () => request("/reviews/me"),
  listMyTeacherReviews: () => request("/reviews/teacher/me"),

  getZoomConfig: () => request("/zoom/config"),
  updateZoomConfig: (payload) =>
    request("/zoom/config", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  listZoomMeetings: (courseId) => request(`/zoom/courses/${courseId}/meetings`),
  createZoomMeeting: (courseId, payload) =>
    request(`/zoom/courses/${courseId}/meetings`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteZoomMeeting: (courseId, meetingId) =>
    request(`/zoom/courses/${courseId}/meetings/${meetingId}`, {
      method: "DELETE",
    }),
  updateZoomMeeting: (courseId, meetingId, payload) =>
    request(`/zoom/courses/${courseId}/meetings/${meetingId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  getZoomMeeting: (courseId, meetingId) =>
    request(`/zoom/courses/${courseId}/meetings/${meetingId}`),

  myTeacherQuestions: () => request("/qa/teacher/me"),
  listCourseQuestions: (courseId) =>
    request(`/qa/courses/${courseId}/questions`),
  createCourseQuestion: (courseId, payload) =>
    request(`/qa/courses/${courseId}/questions`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getQuestion: (questionId) => request(`/qa/questions/${questionId}`),
  postAnswer: (questionId, payload) =>
    request(`/qa/questions/${questionId}/answers`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  acceptAnswer: (answerId) =>
    request(`/qa/answers/${answerId}/accept`, {
      method: "PATCH",
    }),
  myQuestions: () => request(`/qa/me`),

  // Subscriptions
  getSubscriptionTypes: () => request("/subscriptions/types"),
  createSubscription: (payload) =>
    request("/subscriptions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getMySubscriptions: () => request("/subscriptions/my-subscriptions"),
  getActiveSubscriptions: () => request("/subscriptions/active"),
  checkAccess: (teacherId, contentType = 'full') =>
    request(`/subscriptions/check-access/${teacherId}?content_type=${contentType}`),
  cancelSubscription: (subscriptionId) =>
    request(`/subscriptions/${subscriptionId}`, {
      method: "DELETE",
    }),
  getMySubscribers: () => request("/subscriptions/my-subscribers"),
  getSubscriptionInfo: (teacherId) => request(`/subscriptions/info/${teacherId}`),
};
