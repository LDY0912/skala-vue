import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authLabApi, LAB_TOKEN_STORAGE_KEY } from '../services/labMockApi.js'

const USER_STORAGE_KEY = 'skala-lab-user'

function readUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_STORAGE_KEY))
  } catch {
    return null
  }
}

function decodePayload(token) {
  try {
    const encoded = token?.split('.')[1]
    if (!encoded) return null
    const base64 = encoded.replaceAll('-', '+').replaceAll('_', '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

export const useAuthLabStore = defineStore('auth-lab', () => {
  const accessToken = ref(sessionStorage.getItem(LAB_TOKEN_STORAGE_KEY))
  const user = ref(readUser())
  const isLoading = ref(false)
  const errorMessage = ref('')
  const protectedResult = ref(null)

  const isLoggedIn = computed(() => Boolean(accessToken.value && user.value))
  const tokenPayload = computed(() => decodePayload(accessToken.value))
  const authorizationHeader = computed(() => accessToken.value ? `Bearer ${accessToken.value}` : '')

  function save(result) {
    accessToken.value = result.accessToken
    user.value = result.user
    sessionStorage.setItem(LAB_TOKEN_STORAGE_KEY, result.accessToken)
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user))
  }

  function clear() {
    accessToken.value = null
    user.value = null
    protectedResult.value = null
    sessionStorage.removeItem(LAB_TOKEN_STORAGE_KEY)
    sessionStorage.removeItem(USER_STORAGE_KEY)
  }

  async function login(email, password) {
    isLoading.value = true
    errorMessage.value = ''
    try {
      save(await authLabApi.login({ email, password }))
      return true
    } catch (error) {
      clear()
      errorMessage.value = error.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function validateSession() {
    if (!accessToken.value) return false
    try {
      user.value = await authLabApi.profile()
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user.value))
      return true
    } catch {
      clear()
      return false
    }
  }

  async function requestProtectedMessage() {
    isLoading.value = true
    errorMessage.value = ''
    try {
      protectedResult.value = await authLabApi.protectedMessage()
      return true
    } catch (error) {
      if (error.status === 401) clear()
      errorMessage.value = error.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    clear()
    errorMessage.value = ''
  }

  return { accessToken, user, isLoading, errorMessage, protectedResult, isLoggedIn, tokenPayload, authorizationHeader, login, logout, validateSession, requestProtectedMessage }
})
