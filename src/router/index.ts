import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: () => import('@/views/Login.vue'), meta: { title: '系统登录' } },
    { path: '/user/paper-list', name: 'UserPaperList', component: () => import('@/views/user/PaperList.vue'), meta: { title: '我的待考任务', requiresAuth: true } },
    { path: '/exam/room/:id', name: 'ExamRoom', component: () => import('@/views/exam/ExamRoom.vue'), meta: { title: '在线考场 - 考试中', requiresAuth: true } },
    { path: '/exam/report/:recordId', name: 'ExamReport', component: () => import('@/views/exam/ExamReport.vue'), meta: { title: '考试成绩报告', requiresAuth: true } },
    {
        path: '/admin',
        component: () => import('@/views/admin/AdminLayout.vue'), // 采用嵌套路由复用 Sidebar
        meta: { requiresAuth: true },
        children: [
            { path: 'dashboard', component: () => import('@/views/admin/AdminDashboard.vue'), meta: { title: '控制台首页' } },
            { path: 'question', component: () => import('@/views/admin/QuestionManage.vue'), meta: { title: '题库管理' } },
            { path: 'paper', component: () => import('@/views/admin/PaperManage.vue'), meta: { title: '试卷与考试' } },
            { path: 'analysis/:paperId', component: () => import('@/views/admin/PaperAnalysis.vue'), meta: { title: '考试分析大盘' } },
            { path: 'users', component: () => import('@/views/admin/UserManage.vue'), meta: { title: '用户管理' } },
            { path: 'settings', component: () => import('@/views/admin/SystemSettings.vue'), meta: { title: '系统设置' } }
        ]
    }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, from, next) => {
    if (to.meta.title) document.title = (to.meta.title as string) + ' | 智能考试系统'
    const token = localStorage.getItem('EXAM_TOKEN')
    if (to.meta.requiresAuth && !token) {
        next({ path: '/login' })
    } else {
        const userInfoStr = localStorage.getItem('USER_INFO')
        if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr)
            if (to.path.startsWith('/admin') && userInfo.role !== 'ROLE_ADMIN') {
                return next({ path: '/user/paper-list' })
            }
        }
        next()
    }
})

export default router