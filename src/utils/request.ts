import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// 创建 Axios 实例
const service = axios.create({
    baseURL: '/api/v1', // 使用 vite 代理
    timeout: 15000 // 请求超时时间
})

// Request 拦截器 (植入 JWT Token)
service.interceptors.request.use(
    config => {
        // 从 localStorage 或 Pinia 拿 Token
        const token = localStorage.getItem('EXAM_TOKEN')
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// Response 拦截器 (统一处理全局异常)
service.interceptors.response.use(
    response => {
        const res = response.data
        // 如果 code 不是 200，说明业务报错
        if (res.code !== 200) {
            ElMessage.error(res.message || '系统异常')

            // 401 未登录 或 403 无权限
            if (res.code === 401 || res.code === 403) {
                ElMessageBox.confirm('登录状态已失效或无权访问，请重新登录', '提示', {
                    confirmButtonText: '重新登录',
                    type: 'warning'
                }).then(() => {
                    localStorage.removeItem('EXAM_TOKEN')
                    window.location.href = '/login' // 强制跳回登录页
                })
            }
            return Promise.reject(new Error(res.message || 'Error'))
        } else {
            return res.data // 直接返回业务 data
        }
    },
    error => {
        ElMessage.error(error.message || '网络异常，请稍后再试')
        return Promise.reject(error)
    }
)

export default service