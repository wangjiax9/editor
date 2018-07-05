/**
 *  默认配置
 */
export default {
    //编辑器选择器
    id: '#editor',
    // 0: 直接上传至fp-docs,需要token ，1:上传至admin中转，不需要token
    uploadImgType: 0,   
    //是否需要聚焦才能插图
    isNeedFocus:true, 
    //可上传图片次数
    uploadCount: 999,   
    //无内容时显示信息
    placeholder:'分享你和游戏的故事~',
    //获取FP授权码接口
    fpTokenServer: '/api/v2/fp_tokens',
    //上传至FP服务器接口
    uploadImgFPServer : 'https://file.webapp.163.com/gameapp/file/new/',
    //管理后台上传图片接口
    uploadImgAdminServer: '/admin/ajax/upload2fp/',
    //菜单
    menus:[
        'img',
        'emoticon',
        'bold',
        'italic',
        'h1',
        'h2',
        'strikeThrough',
        'blockquote',
        // 'game',
        'hr',
        'link'
    ]
}