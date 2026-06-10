import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义用户状态接口
interface UserState {
    userId: string
    realName: string
    role: string
    token: string
}

export const useUserStore = defineStore('user', () => {
    // 从 localStorage 初始化状态，防止刷新页面丢失
    const userInfo = ref<UserState>({
        userId: '',
        realName: '',
        role: '',
        token: localStorage.getItem('EXAM_TOKEN') || ''
    })

    // 如果本地存了字符串化的用户信息，则解析出来
    const localStr = localStorage.getItem('USER_INFO')
    if (localStr) {
        try {
            const parsed = JSON.parse(localStr)
            userInfo.value = { ...userInfo.value, ...parsed }
        } catch (e) {
            console.error('解析本地用户信息失败', e)
        }
    }

    // 登录成功后设置状态
    const setUserInfo = (data: Partial<UserState>) => {
        userInfo.value = { ...userInfo.value, ...data }
        if (data.token) {
            localStorage.setItem('EXAM_TOKEN', data.token)
        }
        // 剔除 token 后存储其他信息
        const { token, ...rest } = userInfo.value
        localStorage.setItem('USER_INFO', JSON.stringify(rest))
    }

    // 退出登录清除状态
    const clearUserInfo = () => {
        userInfo.value = { userId: '', realName: '', role: '', token: '' }
        localStorage.removeItem('EXAM_TOKEN')
        localStorage.removeItem('USER_INFO')
    }

    return {
        userInfo,
        setUserInfo,
        clearUserInfo
    }
})