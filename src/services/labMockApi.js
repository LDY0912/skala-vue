import axios from 'axios'

const PRODUCT_STORAGE_KEY = 'skala-lab-products'
const POST_STORAGE_KEY = 'skala-lab-posts'
export const LAB_TOKEN_STORAGE_KEY = 'skala-lab-access-token'

const initialProducts = [
  { id: 1, name: 'Vue 3 실전 가이드', category: '도서', price: 32000, stock: 8, description: 'Composition API와 컴포넌트 설계를 다루는 실습서' },
  { id: 2, name: '무선 키보드', category: '장비', price: 49000, stock: 5, description: '프런트엔드 개발자를 위한 저소음 무선 키보드' },
  { id: 3, name: '버티컬 마우스', category: '장비', price: 39000, stock: 0, description: '손목 부담을 줄이는 인체공학 마우스' },
  { id: 4, name: '웹 접근성 체크리스트', category: '도서', price: 18000, stock: 12, description: '실무 UI 접근성 점검 항목을 정리한 핸드북' },
]

const initialPosts = [
  { id: 1, title: 'Vue 학습을 시작합니다', content: 'Composition API부터 차근차근 실습해 봅시다.', author: '관리자', createdAt: '2026-08-01T09:00:00.000Z' },
  { id: 2, title: 'Mock API 활용 방법', content: 'Axios로 목록 조회, 등록, 수정, 삭제 요청을 연습합니다.', author: 'Vue 강사', createdAt: '2026-08-02T10:30:00.000Z' },
  { id: 3, title: 'Pinia와 JWT', content: 'Store의 인증 상태와 Bearer Token 흐름을 확인합니다.', author: '실습 도우미', createdAt: '2026-08-03T13:20:00.000Z' },
]

const mockUsers = [
  { id: 1, email: 'student@skala.com', password: '1234', name: 'SKALA 수강생', role: 'STUDENT', department: 'Frontend Class' },
  { id: 2, email: 'admin@skala.com', password: 'admin1234', name: '실습 관리자', role: 'ADMIN', department: 'Training Center' },
]

let products = readCollection(PRODUCT_STORAGE_KEY, initialProducts)
let posts = readCollection(POST_STORAGE_KEY, initialPosts)

function clone(value) {
  return structuredClone(value)
}

function readCollection(key, fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem(key))
    return Array.isArray(stored) ? stored : clone(fallback)
  } catch {
    return clone(fallback)
  }
}

function saveCollections() {
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products))
  localStorage.setItem(POST_STORAGE_KEY, JSON.stringify(posts))
}

function parseBody(config) {
  if (!config.data) return {}
  return typeof config.data === 'string' ? JSON.parse(config.data) : config.data
}

function response(config, status, data) {
  return { config, data: clone(data), headers: {}, request: null, status, statusText: 'OK' }
}

function fail(config, status, message) {
  const apiResponse = response(config, status, { message })
  throw new axios.AxiosError(message, 'ERR_BAD_RESPONSE', config, null, apiResponse)
}

function publicUser(user) {
  const { password: _password, ...safeUser } = user
  return safeUser
}

function bytesToBase64Url(bytes) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function encodeJwtPart(value) {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)))
}

async function signJwt(unsignedToken) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('skala-browser-mock-secret'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsignedToken))
  return bytesToBase64Url(new Uint8Array(signature))
}

async function createAccessToken(user) {
  const issuedAt = Math.floor(Date.now() / 1000)
  const header = encodeJwtPart({ alg: 'HS256', typ: 'JWT' })
  const payload = encodeJwtPart({
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    iat: issuedAt,
    exp: issuedAt + 15 * 60,
    iss: 'skala-browser-mock-api',
  })
  const unsignedToken = `${header}.${payload}`
  return `${unsignedToken}.${await signJwt(unsignedToken)}`
}

function decodeJwtPart(value) {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

async function authenticate(config) {
  const authorization = config.headers?.get?.('Authorization') ?? config.headers?.Authorization ?? ''
  const [type, token] = authorization.split(' ')
  if (type !== 'Bearer' || !token) fail(config, 401, 'Bearer Access Token이 필요합니다.')

  const segments = token.split('.')
  if (segments.length !== 3) fail(config, 401, '올바른 JWT 형식이 아닙니다.')

  const unsignedToken = `${segments[0]}.${segments[1]}`
  if ((await signJwt(unsignedToken)) !== segments[2]) fail(config, 401, 'JWT 서명이 올바르지 않습니다.')

  const payload = decodeJwtPart(segments[1])
  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    fail(config, 401, 'Access Token이 만료되었습니다.')
  }

  const user = mockUsers.find((item) => String(item.id) === payload.sub)
  if (!user) fail(config, 401, '토큰의 사용자를 찾을 수 없습니다.')
  return user
}

function nextId(collection) {
  return Math.max(0, ...collection.map((item) => item.id)) + 1
}

async function mockAdapter(config) {
  await new Promise((resolve) => setTimeout(resolve, 220))

  const method = config.method?.toUpperCase() ?? 'GET'
  const path = config.url?.replace(/^\/api/, '') ?? '/'
  const productMatch = path.match(/^\/products\/(\d+)$/)
  const postMatch = path.match(/^\/posts\/(\d+)$/)

  if (method === 'GET' && path === '/health') {
    return response(config, 200, { status: 'ok', productCount: products.length, postCount: posts.length })
  }

  if (method === 'POST' && path === '/reset') {
    products = clone(initialProducts)
    posts = clone(initialPosts)
    saveCollections()
    return response(config, 200, { message: '모든 Mock 데이터가 초기화되었습니다.', productCount: products.length, postCount: posts.length })
  }

  if (method === 'GET' && path === '/products') {
    const query = String(config.params?.q ?? '').trim().toLowerCase()
    const category = config.params?.category ?? '전체'
    const available = config.params?.available === true || config.params?.available === 'true'
    const result = products.filter((product) => {
      const matchesQuery = !query || product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query)
      return matchesQuery && (category === '전체' || product.category === category) && (!available || product.stock > 0)
    })
    return response(config, 200, result)
  }

  if (method === 'POST' && path === '/products') {
    const body = parseBody(config)
    if (!body.name?.trim()) fail(config, 400, '상품명은 필수입니다.')
    if (!Number.isFinite(Number(body.price)) || Number(body.price) < 0) fail(config, 400, '가격은 0 이상의 숫자여야 합니다.')
    if (!Number.isInteger(Number(body.stock)) || Number(body.stock) < 0) fail(config, 400, '재고는 0 이상의 정수여야 합니다.')
    const product = { id: nextId(products), name: body.name.trim(), category: body.category || '기타', price: Number(body.price), stock: Number(body.stock), description: body.description ?? '' }
    products.push(product)
    saveCollections()
    return response(config, 201, product)
  }

  if (productMatch && method === 'PATCH') {
    const product = products.find((item) => item.id === Number(productMatch[1]))
    if (!product) fail(config, 404, '수정할 상품을 찾을 수 없습니다.')
    Object.assign(product, parseBody(config))
    saveCollections()
    return response(config, 200, product)
  }

  if (productMatch && method === 'DELETE') {
    const index = products.findIndex((item) => item.id === Number(productMatch[1]))
    if (index < 0) fail(config, 404, '삭제할 상품을 찾을 수 없습니다.')
    const [deleted] = products.splice(index, 1)
    saveCollections()
    return response(config, 200, deleted)
  }

  if (method === 'GET' && path === '/posts') {
    const query = String(config.params?.q ?? '').trim().toLowerCase()
    const result = posts
      .filter((post) => !query || [post.title, post.content, post.author].some((value) => value.toLowerCase().includes(query)))
      .toSorted((first, second) => second.id - first.id)
    return response(config, 200, result)
  }

  if (method === 'POST' && path === '/posts') {
    const body = parseBody(config)
    if (!body.title?.trim()) fail(config, 400, '게시글 제목은 필수입니다.')
    const post = { id: nextId(posts), title: body.title.trim(), author: body.author?.trim() || '익명', content: body.content ?? '', createdAt: new Date().toISOString() }
    posts.push(post)
    saveCollections()
    return response(config, 201, post)
  }

  if (postMatch && method === 'PATCH') {
    const post = posts.find((item) => item.id === Number(postMatch[1]))
    if (!post) fail(config, 404, '수정할 게시글을 찾을 수 없습니다.')
    Object.assign(post, parseBody(config))
    saveCollections()
    return response(config, 200, post)
  }

  if (postMatch && method === 'DELETE') {
    const index = posts.findIndex((item) => item.id === Number(postMatch[1]))
    if (index < 0) fail(config, 404, '삭제할 게시글을 찾을 수 없습니다.')
    const [deleted] = posts.splice(index, 1)
    saveCollections()
    return response(config, 200, deleted)
  }

  if (method === 'POST' && path === '/auth/login') {
    const body = parseBody(config)
    const user = mockUsers.find((item) => item.email === body.email?.trim().toLowerCase() && item.password === body.password)
    if (!user) fail(config, 401, '이메일 또는 비밀번호가 올바르지 않습니다.')
    return response(config, 200, { message: '로그인에 성공했습니다.', tokenType: 'Bearer', accessToken: await createAccessToken(user), expiresIn: 900, user: publicUser(user) })
  }

  if (method === 'GET' && path === '/auth/me') {
    return response(config, 200, publicUser(await authenticate(config)))
  }

  if (method === 'GET' && path === '/auth/protected-message') {
    const user = await authenticate(config)
    return response(config, 200, { message: `${user.name}님, JWT 인증이 필요한 API 호출에 성공했습니다.`, role: user.role, requestedAt: new Date().toISOString() })
  }

  fail(config, 404, '존재하지 않는 Mock API 경로입니다.')
}

const http = axios.create({ adapter: mockAdapter, baseURL: '/api', timeout: 5000 })

http.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(LAB_TOKEN_STORAGE_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (result) => result,
  (error) => {
    const normalized = new Error(error.response?.data?.message ?? 'Mock API 요청에 실패했습니다.')
    normalized.status = error.response?.status
    return Promise.reject(normalized)
  },
)

export const systemLabApi = {
  async health() { return (await http.get('/health')).data },
  async reset() { return (await http.post('/reset')).data },
}

export const productLabApi = {
  async getAll(params = {}) { return (await http.get('/products', { params })).data },
  async create(data) { return (await http.post('/products', data)).data },
  async update(id, data) { return (await http.patch(`/products/${id}`, data)).data },
  async remove(id) { return (await http.delete(`/products/${id}`)).data },
}

export const postLabApi = {
  async getAll(params = {}) { return (await http.get('/posts', { params })).data },
  async create(data) { return (await http.post('/posts', data)).data },
  async update(id, data) { return (await http.patch(`/posts/${id}`, data)).data },
  async remove(id) { return (await http.delete(`/posts/${id}`)).data },
}

export const authLabApi = {
  async login(credentials) { return (await http.post('/auth/login', credentials)).data },
  async profile() { return (await http.get('/auth/me')).data },
  async protectedMessage() { return (await http.get('/auth/protected-message')).data },
}
