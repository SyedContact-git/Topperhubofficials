// In production, API calls go through the same-origin proxy (Netlify/Vercel rewrites).
// In development, Vite dev server proxy handles it (see vite.config.js).
const BASE = ''

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  // KGS
  kgs: {
    batches: () => get('/api/kgs/batches'),
    courseDetails: (id) => get(`/api/kgs/course-details?id=${id}`),
    lessons: (id) => get(`/api/kgs/lessons?id=${id}`),
  },

  // Padhle
  padhle: {
    batches: () => get('/api/padhle/batches'),
    content: (courseId, parentId) => {
      let url = `/api/padhle/content?course_id=${courseId}`
      if (parentId) url += `&parent_id=${parentId}`
      return get(url)
    },
    live: (courseId) => get(`/api/padhle/live?course_id=${courseId}`),
    previousLive: (courseId) => get(`/api/padhle/previous-live?course_id=${courseId}`),
    videoDetails: (courseId, videoId) => get(`/api/padhle/video-details?course_id=${courseId}&video_id=${videoId}`),
    play: (url) => get(`/api/padhle/play?url=${encodeURIComponent(url)}`),
  },

  // ScienceAndFun
  scienceandfun: {
    batches: () => get('/api/scienceandfun/batches'),
    content: (courseId, parentId) => {
      let url = `/api/scienceandfun/content?course_id=${courseId}`
      if (parentId) url += `&parent_id=${parentId}`
      return get(url)
    },
    live: (courseId) => get(`/api/scienceandfun/live?course_id=${courseId}`),
    previousLive: (courseId) => get(`/api/scienceandfun/previous-live?course_id=${courseId}`),
    videoDetails: (courseId, videoId) => get(`/api/scienceandfun/video-details?course_id=${courseId}&video_id=${videoId}`),
    play: (url) => get(`/api/vibrant/play?url=${encodeURIComponent(url)}`),
  },

  // Vibrant
  vibrant: {
    batches: () => get('/api/vibrant/batches'),
    content: (courseId, parentId) => {
      let url = `/api/vibrant/content?course_id=${courseId}`
      if (parentId) url += `&parent_id=${parentId}`
      return get(url)
    },
    live: (courseId) => get(`/api/vibrant/live?course_id=${courseId}`),
    previousLive: (courseId) => get(`/api/vibrant/previous-live?course_id=${courseId}`),
    videoDetails: (courseId, videoId) => get(`/api/vibrant/video-details?course_id=${courseId}&video_id=${videoId}`),
    play: (url) => get(`/api/vibrant/play?url=${encodeURIComponent(url)}`),
  },

  // MissionJeet
  missionjeet: {
    batches: () => get('/api/missionjeet/batches'),
    live: () => get('/api/missionjeet/live'),
  },

  // NextToppers
  nexttoppers: {
    batches: () => get('/api/nexttoppers/batches'),
    live: () => get('/api/nexttoppers/live'),
    videoDrm: (videoId) => get(`/api/nexttoppers/getVideoDetailsDrm?videoid=${videoId}`),
  },

  // RWA
  rwa: {
    batches: () => post('/api/rwa/batches'),
    subjects: (courseId) => get(`/api/rwa/subjects/${courseId}`),
  },

  // PW (Physics Wallah)
  pw: {
    batches: () => get('/api/pw/batches'),
    batchDetails: (batchId) => post('/api/pw/batchdetails', { searchParams: { BatchId: batchId } }),
    live: (batchId) => post('/api/pw/live', { searchParams: { BatchId: batchId } }),
    topics: (batchId, subjectId) => get(`/api/pw/topics?BatchId=${batchId}&SubjectId=${subjectId}`),
    dataContent: (batchId, subjectSlug, topicSlug) =>
      get(`/api/pw/datacontent?batchId=${batchId}&subjectSlug=${subjectSlug}&topicSlug=${topicSlug}`),
    video: (batchId, subjectId) => get(`/api/pw/video?batchId=${batchId}&subjectId=${subjectId}`),
    videoPlay: (batchId, subjectId, childId) =>
      get(`/api/pw/videoplay?batchId=${batchId}&subjectId=${subjectId}&childId=${childId}`),
    getUrl: (params) => {
      const q = new URLSearchParams(params).toString()
      return get(`/api/pw/get-url?${q}`)
    },
    otp: (params) => {
      const q = new URLSearchParams(params).toString()
      return get(`/api/pw/otp?${q}`)
    },
    kid: (mpdUrl) => get(`/api/pw/kid?mpdUrl=${encodeURIComponent(mpdUrl)}`),
    attachments: (batchId, subjectId, contentId) =>
      get(`/api/pw/attachments-url?BatchId=${batchId}&SubjectId=${subjectId}&ContentId=${contentId}`),
  },
}

export const PLATFORMS = [
  {
    id: 'kgs',
    name: 'KGS',
    description: 'Khan Global Studies - UPSC & SSC preparation',
    color: '#FF6B35',
    icon: '📚',
    hasLive: false,
    hasContent: true,
  },
  {
    id: 'padhle',
    name: 'Padhle',
    description: 'Complete learning platform with live classes',
    color: '#4CAF50',
    icon: '📖',
    hasLive: true,
    hasContent: true,
  },
  {
    id: 'scienceandfun',
    name: 'Science And Fun',
    description: 'Science education made easy and fun',
    color: '#2196F3',
    icon: '🔬',
    hasLive: true,
    hasContent: true,
  },
  {
    id: 'vibrant',
    name: 'Vibrant Academy',
    description: 'Premier coaching for competitive exams',
    color: '#9C27B0',
    icon: '🎓',
    hasLive: true,
    hasContent: true,
  },
  {
    id: 'missionjeet',
    name: 'MissionJeet',
    description: 'Mission to ace your exams',
    color: '#FF9800',
    icon: '🎯',
    hasLive: true,
    hasContent: false,
  },
  {
    id: 'nexttoppers',
    name: 'NextToppers',
    description: 'Next generation toppers platform',
    color: '#E91E63',
    icon: '🏆',
    hasLive: true,
    hasContent: false,
  },
  {
    id: 'rwa',
    name: 'RWA (Rojgar With Ankit)',
    description: 'Government job preparation',
    color: '#00BCD4',
    icon: '💼',
    hasLive: false,
    hasContent: true,
  },
  {
    id: 'pw',
    name: 'Physics Wallah (PW)',
    description: 'India\'s most loved education platform',
    color: '#673AB7',
    icon: '⚡',
    hasLive: true,
    hasContent: true,
  },
]
