import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

/**
 * 当前登录用户的游戏化资料: 宝石 / 昵称 / 虚拟形象 / 通关数
 * 状态栏与各页面共用, 购买商品或获得奖励后调用 fetchProfile 刷新
 */
export const useProfileStore = defineStore('profile', () => {
    const userId = ref<string>('')
    const nickname = ref<string>('')
    const gems = ref<number>(0)
    const avatarConfig = ref<string | null>(null)
    const passedStages = ref<number>(0)
    const learnedToday = ref<boolean>(false)
    const loaded = ref<boolean>(false)

    const fetchProfile = async () => {
        try {
            const res: any = await request.get('/user/profile')
            userId.value = res.userId
            nickname.value = res.nickname
            gems.value = res.gems ?? 0
            avatarConfig.value = res.avatarConfig
            passedStages.value = res.passedStages ?? 0
            learnedToday.value = !!res.learnedToday
            loaded.value = true
        } catch (e) {
            console.warn('拉取个人资料失败', e)
        }
    }

    const reset = () => {
        userId.value = ''
        nickname.value = ''
        gems.value = 0
        avatarConfig.value = null
        passedStages.value = 0
        learnedToday.value = false
        loaded.value = false
    }

    return { userId, nickname, gems, avatarConfig, passedStages, learnedToday, loaded, fetchProfile, reset }
})
