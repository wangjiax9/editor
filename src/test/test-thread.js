// 前台帖子详情页内容解析
function contentHandle(res){
    //帖子内容图片映射组
    var imageDatas = res.images;
    var atUsers = res.at_users;
    var atGames = res.at_games;
    var content = res.content;

    content = checkStartAndEnd(content);
    //解析图片
    content = content.replace(/<!--\s*(IMG|APP)[0-9]+\s*-->/gi,function(curVal){
        var index = /\d{1,}/g.exec(curVal);
        var img = imageDatas[index];
        var temp = " <img class='img'  src='"+img.url+"?fop=imageView/2/w/880'/>";
        return temp;
    });
    content = content.replace(/<!--\s*USER[0-9]+\s*-->/gi,function(curVal){
        var index = /\d{1,}/g.exec(curVal);
        var user = atUsers[index];
        if(!user) return "";
        var temp = "<span class='at-user' data-uid='"+user.id+"'>@"+user.nickname+"</span>&nbsp;";
        return temp;
    });
    content = content.replace(/<!--\s*GAME[0-9]+\s*-->/gi,function(curVal){
        var index = /\d{1,}/g.exec(curVal);
        var game = atGames[index];
        if(!game) return "";
        var temp = " <div class='at-game' data-gid='"+game.id+"' contenteditable='false'><img class='at-game-img' src='"+game.icon+"?fop=imageView/2/w/40/h/40'/><span class='title'>"+game.name_cn+"</span></div><p><br></p>";
        return temp;
    });
    res.content = content;
    return res;
}
function checkStartAndEnd(content){
    content = content.trim();
    //如果第一个元素是游戏卡片，则在前面加一空行
    var checkGame = content.substring(0,8);
    if(checkGame == "<!--GAME"){
        content = "<p><br></p>" + content;
    }
    //如果最后一个元素是HR，则在其后添加一空行
    var checkHr = content.substr(content.length-4,content.length);
    if(checkHr == "<hr>"){
        content += "<p><br></p>";
    }
    return content;
}

export {contentHandle}