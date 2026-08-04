<script setup>
import { onMounted, reactive, ref } from 'vue'
import { postLabApi, productLabApi, systemLabApi } from '../../services/labMockApi.js'

const activeResource = ref('products')
const health = ref(null)
const notice = ref('')
const isLoading = ref(false)
const editingProductId = ref(null)
const editingPostId = ref(null)
const products = ref([])
const posts = ref([])

const productFilters = reactive({ q: '', category: '전체', available: false })
const productForm = reactive({ name: '', category: '장비', price: 0, stock: 0, description: '' })
const postQuery = ref('')
const postForm = reactive({ title: '', author: '', content: '' })

function showNotice(message) {
  notice.value = message
  window.setTimeout(() => {
    if (notice.value === message) notice.value = ''
  }, 3000)
}

async function checkHealth() {
  health.value = await systemLabApi.health()
}

async function loadProducts() {
  isLoading.value = true
  try {
    products.value = await productLabApi.getAll(productFilters)
  } finally {
    isLoading.value = false
  }
}

async function loadPosts() {
  isLoading.value = true
  try {
    posts.value = await postLabApi.getAll({ q: postQuery.value })
  } finally {
    isLoading.value = false
  }
}

function clearProductForm() {
  editingProductId.value = null
  Object.assign(productForm, { name: '', category: '장비', price: 0, stock: 0, description: '' })
}

function editProduct(product) {
  editingProductId.value = product.id
  Object.assign(productForm, product)
}

async function saveProduct() {
  if (editingProductId.value) {
    await productLabApi.update(editingProductId.value, { ...productForm })
    showNotice('PATCH 요청으로 상품을 수정했습니다.')
  } else {
    await productLabApi.create({ ...productForm })
    showNotice('POST 요청으로 상품을 등록했습니다.')
  }
  clearProductForm()
  await Promise.all([loadProducts(), checkHealth()])
}

async function removeProduct(product) {
  if (!window.confirm(`“${product.name}” 상품을 삭제할까요?`)) return
  await productLabApi.remove(product.id)
  if (editingProductId.value === product.id) clearProductForm()
  showNotice('DELETE 요청으로 상품을 삭제했습니다.')
  await Promise.all([loadProducts(), checkHealth()])
}

function clearPostForm() {
  editingPostId.value = null
  Object.assign(postForm, { title: '', author: '', content: '' })
}

function editPost(post) {
  editingPostId.value = post.id
  Object.assign(postForm, { title: post.title, author: post.author, content: post.content })
}

async function savePost() {
  if (editingPostId.value) {
    await postLabApi.update(editingPostId.value, { ...postForm })
    showNotice('PATCH 요청으로 게시글을 수정했습니다.')
  } else {
    await postLabApi.create({ ...postForm })
    showNotice('POST 요청으로 게시글을 등록했습니다.')
  }
  clearPostForm()
  await Promise.all([loadPosts(), checkHealth()])
}

async function removePost(post) {
  if (!window.confirm(`“${post.title}” 게시글을 삭제할까요?`)) return
  await postLabApi.remove(post.id)
  if (editingPostId.value === post.id) clearPostForm()
  showNotice('DELETE 요청으로 게시글을 삭제했습니다.')
  await Promise.all([loadPosts(), checkHealth()])
}

async function resetData() {
  if (!window.confirm('상품과 게시글을 처음 상태로 되돌릴까요?')) return
  const result = await systemLabApi.reset()
  clearProductForm()
  clearPostForm()
  await Promise.all([loadProducts(), loadPosts(), checkHealth()])
  showNotice(result.message)
}

function formatPrice(price) {
  return `${Number(price).toLocaleString('ko-KR')}원`
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

onMounted(async () => {
  await Promise.all([checkHealth(), loadProducts(), loadPosts()])
})
</script>

<template>
  <section class="crud-lab">
    <div class="lab-status">
      <div>
        <span class="status-dot"></span>
        <strong>브라우저 Mock API 연결됨</strong>
        <small v-if="health">상품 {{ health.productCount }}개 · 게시글 {{ health.postCount }}개</small>
      </div>
      <button type="button" class="danger-soft" @click="resetData">Mock 데이터 초기화</button>
    </div>

    <p v-if="notice" class="notice" role="status">{{ notice }}</p>

    <nav class="resource-tabs" aria-label="CRUD 데이터 선택">
      <button :class="{ active: activeResource === 'products' }" @click="activeResource = 'products'">상품 API</button>
      <button :class="{ active: activeResource === 'posts' }" @click="activeResource = 'posts'">게시글 API</button>
    </nav>

    <div v-if="activeResource === 'products'" class="manager-grid">
      <form class="panel form-panel" @submit.prevent="saveProduct">
        <div class="panel-title">
          <span class="method" :class="editingProductId ? 'patch' : 'post'">{{ editingProductId ? 'PATCH' : 'POST' }}</span>
          <h3>{{ editingProductId ? '상품 수정' : '상품 등록' }}</h3>
        </div>
        <label>상품명<input v-model.trim="productForm.name" required /></label>
        <div class="two-fields">
          <label>카테고리<select v-model="productForm.category"><option>장비</option><option>도서</option><option>강의</option><option>기타</option></select></label>
          <label>재고<input v-model.number="productForm.stock" type="number" min="0" required /></label>
        </div>
        <label>가격<input v-model.number="productForm.price" type="number" min="0" required /></label>
        <label>상품 설명<textarea v-model.trim="productForm.description" rows="3"></textarea></label>
        <div class="form-actions">
          <button class="primary">{{ editingProductId ? '수정 저장' : '상품 등록' }}</button>
          <button v-if="editingProductId" type="button" class="ghost" @click="clearProductForm">취소</button>
        </div>
      </form>

      <article class="panel list-panel">
        <div class="panel-title"><span class="method get">GET</span><h3>상품 목록</h3><b>{{ products.length }}개</b></div>
        <form class="filters" @submit.prevent="loadProducts">
          <input v-model.trim="productFilters.q" placeholder="상품명·설명 검색" />
          <select v-model="productFilters.category"><option>전체</option><option>장비</option><option>도서</option><option>강의</option><option>기타</option></select>
          <label class="check"><input v-model="productFilters.available" type="checkbox" /> 재고 있음</label>
          <button class="primary">조회</button>
        </form>
        <p v-if="isLoading" class="empty">GET 요청 중...</p>
        <p v-else-if="products.length === 0" class="empty">조건에 맞는 상품이 없습니다.</p>
        <div v-else class="item-list">
          <article v-for="product in products" :key="product.id" class="item-card">
            <div><span class="tag">{{ product.category }}</span><h4>{{ product.name }}</h4><p>{{ product.description }}</p><small :class="{ soldout: product.stock === 0 }">{{ product.stock ? `재고 ${product.stock}개` : '품절' }}</small></div>
            <div class="item-side"><strong>{{ formatPrice(product.price) }}</strong><button class="ghost" @click="editProduct(product)">수정</button><button class="danger-soft" @click="removeProduct(product)">삭제</button></div>
          </article>
        </div>
      </article>
    </div>

    <div v-else class="manager-grid">
      <form class="panel form-panel" @submit.prevent="savePost">
        <div class="panel-title"><span class="method" :class="editingPostId ? 'patch' : 'post'">{{ editingPostId ? 'PATCH' : 'POST' }}</span><h3>{{ editingPostId ? '게시글 수정' : '게시글 등록' }}</h3></div>
        <label>제목<input v-model.trim="postForm.title" required /></label>
        <label>작성자<input v-model.trim="postForm.author" placeholder="미입력 시 익명" /></label>
        <label>내용<textarea v-model.trim="postForm.content" rows="6"></textarea></label>
        <div class="form-actions"><button class="primary">{{ editingPostId ? '수정 저장' : '게시글 등록' }}</button><button v-if="editingPostId" type="button" class="ghost" @click="clearPostForm">취소</button></div>
      </form>

      <article class="panel list-panel">
        <div class="panel-title"><span class="method get">GET</span><h3>게시글 목록</h3><b>{{ posts.length }}개</b></div>
        <form class="filters post-filter" @submit.prevent="loadPosts"><input v-model.trim="postQuery" placeholder="제목·내용·작성자 검색" /><button class="primary">검색</button></form>
        <p v-if="isLoading" class="empty">GET 요청 중...</p>
        <p v-else-if="posts.length === 0" class="empty">검색 결과가 없습니다.</p>
        <div v-else class="item-list">
          <article v-for="post in posts" :key="post.id" class="item-card post-card">
            <div><h4>{{ post.title }}</h4><p>{{ post.content }}</p><small>{{ post.author }} · {{ formatDate(post.createdAt) }}</small></div>
            <div class="item-side"><button class="ghost" @click="editPost(post)">수정</button><button class="danger-soft" @click="removePost(post)">삭제</button></div>
          </article>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.crud-lab { color: #243b53; }
.lab-status, .lab-status > div, .resource-tabs, .panel-title, .filters, .form-actions, .item-card, .item-side { display: flex; align-items: center; }
.lab-status { justify-content: space-between; gap: 12px; margin-bottom: 14px; padding: 12px 14px; border: 1px solid #cce6d6; border-radius: 10px; background: #effaf3; }
.lab-status > div { gap: 7px; flex-wrap: wrap; }
.lab-status small { width: 100%; margin-left: 15px; color: #648072; }
.status-dot { width: 9px; height: 9px; border-radius: 50%; background: #20b26b; box-shadow: 0 0 0 4px rgb(32 178 107 / 13%); }
.notice { margin: 0 0 12px; padding: 10px 12px; border-radius: 8px; background: #e7f4ff; color: #176796; font-weight: 700; }
.resource-tabs { gap: 6px; margin-bottom: 14px; padding: 5px; border-radius: 10px; background: #e9eef3; }
.resource-tabs button { flex: 1; padding: 9px; border: 0; border-radius: 7px; background: transparent; color: #607080; font-weight: 750; cursor: pointer; }
.resource-tabs button.active { background: #fff; color: #137eaf; box-shadow: 0 2px 7px rgb(30 55 75 / 10%); }
.manager-grid { display: grid; grid-template-columns: minmax(230px, .78fr) minmax(340px, 1.4fr); gap: 14px; }
.panel { min-width: 0; padding: 16px; border: 1px solid #dfe6eb; border-radius: 12px; background: #fff; box-shadow: 0 4px 14px rgb(28 54 75 / 6%); }
.panel-title { gap: 8px; margin-bottom: 14px; }
.panel-title h3 { margin: 0; font-size: 16px; font-weight: 800; }
.panel-title b { margin-left: auto; color: #718392; font-size: 12px; }
.method { padding: 3px 6px; border-radius: 4px; background: #12a66a; color: white; font-size: 10px; font-weight: 800; }
.method.patch { background: #df8b18; }
.method.get { background: #168bc2; }
.form-panel > label, .two-fields label { display: grid; gap: 4px; margin-bottom: 10px; color: #526779; font-size: 12px; font-weight: 700; }
.two-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
input, select, textarea { width: 100%; padding: 8px 9px; border: 1px solid #c9d3db; border-radius: 6px; background: #fff; color: #263e51; font: inherit; font-size: 12px; }
textarea { resize: vertical; }
button { border-radius: 6px; font: inherit; font-size: 11px; font-weight: 750; cursor: pointer; }
.primary { padding: 7px 10px; border: 1px solid #148dc5; background: #159bd7; color: #fff; }
.ghost { padding: 6px 9px; border: 1px solid #b8c5cd; background: #fff; color: #456071; }
.danger-soft { padding: 6px 9px; border: 1px solid #edb4b4; background: #fff4f4; color: #bf4545; }
.form-actions { gap: 6px; }
.form-actions .primary { flex: 1; }
.filters { align-items: stretch; gap: 6px; margin-bottom: 12px; }
.filters > input { min-width: 0; flex: 1; }
.filters select { width: 82px; }
.check { display: flex; align-items: center; gap: 3px; white-space: nowrap; font-size: 11px; }
.check input { width: auto; }
.item-list { display: grid; gap: 7px; }
.item-card { align-items: flex-start; justify-content: space-between; gap: 10px; padding: 11px; border: 1px solid #e0e7ec; border-radius: 8px; }
.item-card > div:first-child { min-width: 0; }
.item-card h4, .item-card p { margin: 0; }
.item-card h4 { color: #24465e; font-size: 13px; font-weight: 800; }
.item-card p { overflow: hidden; margin-top: 3px; color: #71818d; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.item-card small { display: block; margin-top: 4px; color: #4c8062; font-size: 10px; }
.item-card small.soldout { color: #c94c4c; }
.tag { display: inline-block; margin-bottom: 3px; padding: 1px 5px; border-radius: 4px; background: #e8f3fb; color: #1779aa; font-size: 9px; }
.item-side { flex: 0 0 auto; flex-wrap: wrap; justify-content: flex-end; gap: 4px; max-width: 145px; }
.item-side strong { width: 100%; color: #163f59; text-align: right; font-size: 12px; }
.empty { padding: 24px; color: #778894; text-align: center; }
.post-filter input { flex: 1; }
.post-card p { white-space: normal; }
@media (max-width: 800px) { .manager-grid { grid-template-columns: 1fr; } }
@media (max-width: 520px) { .lab-status { align-items: stretch; flex-direction: column; } .filters { flex-wrap: wrap; } .filters > input { flex-basis: 100%; } .item-card { flex-direction: column; } .item-side { justify-content: flex-start; max-width: none; } .item-side strong { text-align: left; } }
</style>
