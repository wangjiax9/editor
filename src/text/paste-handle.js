export default {
    getPasteHtml(e, editor){
        var clipboardData = e.clipboardData || (e.originalEvent && e.originalEvent.clipboardData);
        var pasteText, pasteHtml;
        if (clipboardData == null) {
            pasteText = window.clipboardData && window.clipboardData.getData('text')
        } else {
            pasteText = clipboardData.getData('text/plain');
            pasteHtml = clipboardData.getData('text/html');
        }
        if (!pasteHtml && pasteText) {
            pasteHtml = '<p>' + replaceHtmlSymbol(pasteText) + '</p>';
            //将换行转换为br
            pasteHtml = pasteHtml.replace(/\n/ig, "<br>");
        }
        // 过滤word中粘贴过来的无用字符
        var docSplitHtml = pasteHtml.split('</html>');
        if (docSplitHtml.length === 2) {
            pasteHtml = docSplitHtml[0];
                var docSplitHtml1 = pasteHtml.split('</head>');
                if (docSplitHtml1.length === 2) {
                pasteHtml = docSplitHtml1[1];
                pasteHtml = pasteHtml.replace(/\s?(style=\s?'.+?')/igm, "");
                //过滤word中可能会有的非标签节点，但是会在android端占一行
                pasteHtml = pasteHtml.replace(/<o:p><\/o:p>/ig, "");
            }
        }
        if(editor.config.uploadImgType == 0){
            //去除标签的所有属性
            pasteHtml = pasteHtml.replace(/(<[A-Za-z]+)\s?[^>]*>/igm, "$1>");
        }else{
            //去除除了带href的标签的属性
            pasteHtml = pasteHtml.replace(/\b(?!href)\w+\s*=\s*("|')[\s\S]+?\1/igm, "");
        }
        //去掉注释
        pasteHtml = pasteHtml.replace(/<![^>]*>/igm, "");
        

        //过滤无用标签
        pasteHtml = pasteHtml.replace(/<\/?(html|body|meta|script|link|img|style).+?>/igm, "");
        //过滤外层块级标签
        pasteHtml = pasteHtml.replace(/<(u|ul|ol|code)[^>]*>/ig, "").replace(/<\/(u|ul|ol|code)>/gi,"");
        //部分父级块级替换为p标签
        pasteHtml = pasteHtml.replace(/<(div|li|h|pre)[^>]*>/ig, "<p>").replace(/<\/(li|h|pre)>/gi,"<\/p>");
        if(editor.config.uploadImgType == 0){
            //如果上传至FP，则过滤掉a标签，因为是对外使用
            pasteHtml = pasteHtml.replace(/<a[^>]*>/ig, "").replace(/<\/a>/gi,"");
        }
        //清除编辑器子级空标签
        pasteHtml = clearEmptyChildren(pasteHtml);
        //清除空的标签
        pasteHtml = pasteHtml.replace(/<[A-Za-z]+>\s?<\/[A-Za-z]+>/ig, "");

        return pasteHtml
    }
}
//清除编辑器子级空标签
function clearEmptyChildren(html){
    var $temp = $("<div></div>").html(html);
    var children = $temp.children();
    $temp.children().each(function(){
        if(trim($(this).text()) == ""){
            $(this).remove();
        }
    });
    return $temp.html();
}
//清除两边的空格
function trim(str){
    var reg = new RegExp("(^\\s*)|(\\s*$)","g");
      return str.replace(reg, ''); 
}
function replaceHtmlSymbol(html) {
    if (html == null) {
        return ''
    }
    return html.replace(/</gm, '&lt;')
                .replace(/>/gm, '&gt;')
                .replace(/"/gm, '&quot;')
}