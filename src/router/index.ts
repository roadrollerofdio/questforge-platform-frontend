import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: () => import('@/views/Login.vue'), meta: { title: '系统登录' } },

    // ===== 用户端(多邻国风格布局: 顶部状态栏 + 底部菜单) =====
    {
        path: '/user',
        component: () => import('@/layouts/UserLayout.vue'),
        meta: { requiresAuth: true },
        redirect: '/user/home',
        children: [
            { path: 'home', name: 'UserHome', component: () => import('@/views/user/Home.vue'), meta: { title: '学习地图' } },
            { path: 'projects', name: 'ProjectSelect', component: () => import('@/views/user/ProjectSelect.vue'), meta: { title: '选择项目' } },
            { path: 'tasks', name: 'DailyTasks', component: () => import('@/views/user/DailyTasks.vue'), meta: { title: '每日任务' } },
            { path: 'ai-teacher', name: 'AiTeacher', component: () => import('@/views/user/AiTeacher.vue'), meta: { title: 'AI 教师' } },
            { path: 'messages', name: 'Messages', component: () => import('@/views/user/Messages.vue'), meta: { title: '消息' } },
            { path: 'shop', name: 'Shop', component: () => import('@/views/user/Shop.vue'), meta: { title: '宝石小店' } },
            { path: 'profile', name: 'Profile', component: () => import('@/views/user/Profile.vue'), meta: { title: '个人信息' } }
        ]
    },
    // 旧入口兼容
    { path: '/user/paper-list', redirect: '/user/home' },

    // ===== 关卡内部与结算页(全屏沉浸式, 不挂布局) =====
    { path: '/exam/room/:id', name: 'ExamRoom', component: () => import('@/views/exam/ExamRoom.vue'), meta: { title: '关卡挑战', requiresAuth: true } },
    { path: '/exam/result/:progressId', name: 'StageResult', component: () => import('@/views/exam/StageResult.vue'), meta: { title: '关卡结算', requiresAuth: true } },
    { path: '/exam/report/:recordId', name: 'ExamReport', component: () => import('@/views/exam/ExamReport.vue'), meta: { title: '考试成绩报告', requiresAuth: true } },

    // ===== 已完成关卡详情页(全屏沉浸式, 不挂布局) =====
    { path: '/user/stage-detail/:stageId', name: 'StageDetail', component: () => import('@/views/user/StageDetail.vue'), meta: { title: '关卡详情', requiresAuth: true } },

    // ===== 与好友私聊(全屏沉浸式) =====
    { path: '/user/chat/:friendId', name: 'Chat', component: () => import('@/views/user/Chat.vue'), meta: { title: '聊天', requiresAuth: true } },

    // ===== 管理端 =====
    {
        path: '/admin',
        component: () => import('@/views/admin/AdminLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            { path: 'dashboard', component: () => import('@/views/admin/AdminDashboard.vue'), meta: { title: '控制台首页' } },
            { path: 'question', component: () => import('@/views/admin/QuestionManage.vue'), meta: { title: '题库管理' } },
            { path: 'paper', component: () => import('@/views/admin/PaperManage.vue'), meta: { title: '试卷与考试' } },
            { path: 'analysis/:paperId', component: () => import('@/views/admin/PaperAnalysis.vue'), meta: { title: '学情分析大盘' } },
            { path: 'users', component: () => import('@/views/admin/UserManage.vue'), meta: { title: '用户管理' } },
            { path: 'daily-task', component: () => import('@/views/admin/DailyTaskManage.vue'), meta: { title: '每日任务管理' } },
            { path: 'shop', component: () => import('@/views/admin/ShopManage.vue'), meta: { title: '宝石小店管理' } },
            { path: 'settings', component: () => import('@/views/admin/SystemSettings.vue'), meta: { title: '系统设置' } },
            { path: 'announcement', component: () => import('@/views/admin/AnnouncementManage.vue'), meta: { title: '公告管理' } }
        ]
    }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, from, next) => {
    if (to.meta.title) document.title = (to.meta.title as string) + ' | QuestForge'
    const token = localStorage.getItem('EXAM_TOKEN')
    if (to.meta.requiresAuth && !token) {
        next({ path: '/login' })
    } else {
        // 与 store/user.ts 的存储键保持一致(修复旧版读 USER_INFO 的不一致)
        const userInfoStr = localStorage.getItem('userInfo')
        if (userInfoStr) {
            try {
                const userInfo = JSON.parse(userInfoStr)
                if (to.path.startsWith('/admin') && userInfo.role !== 'ROLE_ADMIN') {
                    return next({ path: '/user/home' })
                }
            } catch (e) { /* 解析失败时放行, 由后端鉴权兜底 */ }
        }
        next()
    }
})

export default router
