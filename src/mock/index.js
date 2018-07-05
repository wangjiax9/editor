import Mock from 'mockjs'

import {other} from './mock-other'
import {thread} from './mock-thread'

export default {
    launch() {
        // 指定被拦截的 Ajax 请求的响应时间，单位是毫秒
        Mock.setup({timeout: '100-1000'})
        let mockList = [...other, ...thread]
        mockList.forEach(obj => {
            Mock.mock(obj.rurl, obj.type, function(options) {
                console.log('mockjs拦截了'+options.type+'请求，url：'+options.url+' ，数据为以下：')
                console.log(obj.data) 
                return obj.data
            })
        }) 
    }
}