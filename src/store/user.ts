import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserInfo {
    userId: string
    username: string // 修复：添加 username
    realName: string
    role: string
    token: string
}

export const useUserStore = defineStore('user', () => {
    const token = ref<string>(localStorage.getItem('token') || '')

    // 初始化 userInfo，尝试从 localStorage 恢复
    const initUserInfo = (): UserInfo => {
        const storedInfo = localStorage.getItem('userInfo')
        if (storedInfo) {
            try {
                return JSON.parse(storedInfo)
            } catch (e) {
                console.error('Failed to parse userInfo from localStorage')
            }
        }
        return {
            userId: '',
            username: '',
            realName: '',
            role: '',
            token: ''
        }
    }

    const userInfo = ref<UserInfo>(initUserInfo())

    const setToken = (newToken: string) => {
        token.value = newToken
        localStorage.setItem('token', newToken)
    }

    const setUserInfo = (info: Partial<UserInfo>) => {
        userInfo.value = { ...userInfo.value, ...info }
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }

    const clearUserInfo = () => {
        token.value = ''
        userInfo.value = {
            userId: '',
            username: '',
            realName: '',
            role: '',
            token: ''
        }
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
    }

    // 修复：添加 logout 方法
    const logout = () => {
        clearUserInfo()
        // 可以在这里执行其他清理操作，比如断开 SSE 连接等
    }

    return {
        token,
        userInfo,
        setToken,
        setUserInfo,
        clearUserInfo,
        logout
    }
})