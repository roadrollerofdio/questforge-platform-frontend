import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserInfo {
    userId: string
    username: string
    realName: string
    role: string
    token: string
}

export const useUserStore = defineStore('user', () => {
    // 核心修复 1：将缓存键名严格对齐 request.ts 中的 'EXAM_TOKEN'
    const token = ref<string>(localStorage.getItem('EXAM_TOKEN') || '')

    const initUserInfo = (): UserInfo => {
        const storedInfo = localStorage.getItem('userInfo')
        if (storedInfo) {
            try {
                return JSON.parse(storedInfo)
            } catch (e) {
                console.error('Failed to parse userInfo')
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
        localStorage.setItem('EXAM_TOKEN', newToken) // 同步修改为 EXAM_TOKEN
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
        localStorage.removeItem('EXAM_TOKEN') // 同步修改为 EXAM_TOKEN
        localStorage.removeItem('userInfo')
    }

    const logout = () => {
        clearUserInfo()
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