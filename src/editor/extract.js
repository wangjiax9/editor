/**
 * 提取帖子内容
 * 服务于帖子编辑器
 */
function extractThreadContent(editor){ 
    var $textElem = editor.$textElem
    //过滤可能会出现的未删除的预览图片
    var preview = $textElem.find(".img-view")
    if(preview.length > 0){
        preview.remove()
    }
    //提取图片
    var images = extractImages($textElem)
    var atusers = extractUser($textElem)
    var atgames = extractGame($textElem)
    var content = $textElem.html()
    
    var count = 0
    //获取内容，将图片标签转换为<!--IMG0-->，其中0为内容中图片序号
    content = content.replace(/<img[^>]*class=("|')img\1[^>]*\/?>/gi,function(curVal,index){
        return "<!--IMG"+(count++)+"-->"
    })
    count = 0
    content = content.replace(/<(a|span)[^>]*class=("|')at-user\2[^>]*>[^<]*<\/(a|span)>/gi,function(curVal,index){
        return "<!--USER"+(count++)+"-->"
    })
    count = 0
    content = content.replace(/<div[^>]*class=("|')at-game\1[^>]*>(?!<\/div>).*?<\/div>/gi,function(curVal,index){
        return "<!--GAME"+(count++)+"-->"
    })
    //由于Android、IOS端的p标签行间距比较远，换行改成<br>
    // content = content.replace(/<p>\s*<br>\s*<\/p>/gi,"<br>")
    // content = content.replace(/<p[^>]*>/gi,"")
    // content = content.replace(/<\/p>/gi,"<br>")

    return {
        images:images,
        at_users:atusers,
        at_games:atgames,
        content:content
    }
}
//提取游戏
function extractGame($textElem){
    var datas = []
    var games = $textElem.find(".at-game")
    for (var i = 0; i < games.length; i++) {
        var data = {
            id:$(games[i]).data("gid"),
            name_cn: $(games[i]).find(".title").html(),
            icon: $(games[i]).find(".at-game-img").attr("src")
        }
        datas.push(data)
    }
    return datas
}
//提取图片
function extractImages($textElem){
    var datas = []
    var imgs = $textElem.find(".img")
    for (var i = 0; i < imgs.length; i++) {
        var data = {
            width:imgs[i].naturalWidth,
            height: imgs[i].naturalHeight,
            url: imgs[i].src
        }
        datas.push(data)
    }
    return datas
}
//提取@用户
function extractUser($textElem){
    var datas = []
    var users = $textElem.find(".at-user")
    for (var i = 0; i < users.length; i++) {
        var data = {
            id:$(users[i]).data("uid"),
            nickname: $(users[i]).text().substring(1)
        }
        datas.push(data)
    }
    return datas
}

export {extractThreadContent}

