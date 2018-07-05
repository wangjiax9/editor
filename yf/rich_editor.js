/**
 * Copyright (C) 2017 Wasabeef
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * 异常code
 */

//清除两边的空格
String.prototype.trim = function() { 
    var reg = new RegExp("(^\\s*)|(\\s*$)","g");
      return this.replace(reg, ''); 
}; 
var ERROR = {
    LINK_DISABLED:{
        code:110,
        msg:"选中的内容不能添加超链接"
    }
}
   


var RE = {};
var hiddenChar = '\ufeff';
var selectorId = 'editor';
RE.currentSelection = {
    "startContainer": 0,
    "startOffset": 0,
    "endContainer": 0,
    "endOffset": 0};
RE.currentActiveElement = {};
RE.defaultParagraphSeparatorTag = function(){
    return "<p>";
}
//游戏块ID，没添加一个自增
RE.gameWidgetId = 0;
//@用户ID
RE.atuserId = 0;

RE.editor = document.getElementById(selectorId);
// The default paragraph separator
RE.defaultParagraphSeparator = 'p';
document.addEventListener("selectionchange", function(e) { 
    // console.log("selectionChanged st")
    // console.dir(e)
    RE.backuprange(); 
});

// Initializations
RE.inputEventTimerId = null;
RE.inputEventInterval = 500;
RE.callback = function() {
  if(RE.inputEventTimerId)
  {
    clearTimeout(RE.inputEventTimerId);
  }
  RE.inputEventTimerId = setTimeout(function() {
  		 window.location.href = "re-callback://" + encodeURI(RE.getHtml().replace(/\+/g, '%2b'));
  }, RE.inputEventInterval);
  RE.updateContentPlaceholder();
}
// Initializations
RE.init = function()
 {
 	document.execCommand('insertBrOnReturn', false, false);
 	document.execCommand('defaultParagraphSeparator', false, this.defaultParagraphSeparator);
 }


RE.eventCallback = function(event) {
  window.location.href = "re-event://" + event;
}
RE.setHtml = function(content) {
    content = decodeURIComponent(content.replace(/\+/g, '%20'));
    content = RE.checkStartAndEnd(content);
    RE.editor.innerHTML = content;
    RE.updateContentPlaceholder();
}

RE.getHtml = function() {
    return RE.editor.innerHTML;
}

RE.getText = function() {
    return RE.editor.innerText;
}
RE.paste= function(content)
{
content = content.split('\n');
		var node = content.shift();
		document.execCommand('insertHTML', false, node);
		content.map(function(node) {
			if (node.length < 1) node = '<br>';
			document.execCommand('insertHTML', false, hiddenChar + '<p>' + node + '</p>');
		});
}
RE.setBaseTextColor = function(color) {
    RE.editor.style.color  = color;
}

RE.setBaseFontSize = function(size) {
    RE.editor.style.fontSize = size;
}

RE.setPadding = function(left, top, right, bottom) {
  RE._contentResizer.style.paddingLeft = RE.editor.style.paddingLeft = left;
  RE._contentResizer.style.paddingTop = RE.editor.style.paddingTop = top;
  RE._contentResizer.style.paddingRight = RE.editor.style.paddingRight = right;
  RE._contentResizer.style.paddingBottom = RE.editor.style.paddingBottom = bottom;
}

RE.setBackgroundColor = function(color) {
    document.body.style.backgroundColor = color;
}

RE.setBackgroundImage = function(image) {
    RE.editor.style.backgroundImage = image;
}

RE.setWidth = function(size) {
    RE.editor.style.minWidth = size;
}

RE.setHeight = function(size) {
    RE.editor.style.height = size;
}

RE.setTextAlign = function(align) {
    RE.editor.style.textAlign = align;
}

RE.setVerticalAlign = function(align) {
    RE.editor.style.verticalAlign = align;
}

RE.setPlaceholder = function(placeholder) {
    RE.placeholderString = placeholder;
}
RE.setPlaceholderColor = function(color) {
    RE._contentResizer.style.color = color;
}
RE.setInputEnabled = function(inputEnabled) {
    RE.editor.contentEditable = String(inputEnabled);
}

RE.undo = function() {
    document.execCommand('undo', false, null);
}

RE.redo = function() {
    document.execCommand('redo', false, null);
}

RE.setBold = function() {
    var formatBlock = document.queryCommandValue('formatBlock');
    if (formatBlock.length > 0 && (formatBlock.toLowerCase() == "h1" || formatBlock.toLowerCase() == "h2")) {
        return;
    }else{
        document.execCommand('bold', false, null);
    }
}

RE.setItalic = function() {
    document.execCommand('italic', false, null);
}

RE.setSubscript = function() {
    document.execCommand('subscript', false, null);
}

RE.setSuperscript = function() {
    document.execCommand('superscript', false, null);
}

RE.setStrikeThrough = function() {
    document.execCommand('strikeThrough', false, null);
}

RE.setUnderline = function() {
    document.execCommand('underline', false, null);
}
RE.setHr = function() {
    document.execCommand('insertHorizontalRule', false, null);
    RE.insertEmptyLine();
}
RE.setBullets = function() {
    document.execCommand('insertUnorderedList', false, null);
}

RE.setNumbers = function() {
    document.execCommand('insertOrderedList', false, null);
}

RE.setTextColor = function(color) {
    RE.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('foreColor', false, color);
    document.execCommand("styleWithCSS", null, false);
}

RE.setTextBackgroundColor = function(color) {
    RE.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('hiliteColor', false, color);
    document.execCommand("styleWithCSS", null, false);
}

RE.setFontSize = function(fontSize){
    document.execCommand("fontSize", false, fontSize);
}
function formatBlockRange(formatTag){
    var sel = getSelection();
    var range = RE.currentSelection.range;
    var docFrag = range.extractContents();
    for (var i = 0; i < docFrag.children.length; i++) {
        var node = docFrag.children[i];
        var r = document.createRange();
        r.selectNodeContents(node);
        sel.removeAllRanges();
        sel.addRange(r);
        document.execCommand('formatBlock', false, '<' + formatTag + '>');
    }
}
RE.insertFormatBlock = function(formatTag){
    var sel = RE.currentSelection.selection;
    // if(sel.type.toLowerCase() == "range"){
    //     formatBlockRange(formatTag);
    //     return;
    // }
    // var range = RE.currentSelection.range;
    // var selElem = RE.getSelectionContainerElem();
    // if($(selElem).closest("blockquote").length > 0){
    //     var r = document.createRange();
    //     r.selectNodeContents($(selElem).closest("blockquote").get(0));
    //     sel.removeAllRanges();
    //     sel.addRange(r);
    //     document.execCommand('formatBlock', false, this.defaultParagraphSeparatorTag());
    //     range.collapse(false);
    //     sel.removeAllRanges();
    //     sel.addRange(range);
    // }else{
        var formatBlock = document.queryCommandValue('formatBlock');
        //插入块级元素时避免嵌套
        if (formatBlock.length > 0 && formatBlock.toLowerCase() == formatTag) {
            document.execCommand('formatBlock', false, this.defaultParagraphSeparatorTag());
        } else {
            document.execCommand('formatBlock', false, '<' + formatTag + '>');
        }
    // }
}
RE.setHeading = function(formatTag) {
    RE.insertFormatBlock(formatTag);
}
RE.setBlockquote = function() {
    RE.insertFormatBlock("blockquote");
}
RE.setIndent = function() {
    document.execCommand('indent', false, null);
}

RE.setOutdent = function() {
    document.execCommand('outdent', false, null);
}

RE.setJustifyLeft = function() {
    document.execCommand('justifyLeft', false, null);
}

RE.setJustifyCenter = function() {
    document.execCommand('justifyCenter', false, null);
}

RE.setJustifyRight = function() {
    document.execCommand('justifyRight', false, null);
}


RE.getCaretYPosition = function() {

        var selection = window.getSelection();
        var range = selection.getRangeAt(0);
        var span = document.createElement("span");
        // Ensure span has dimensions and position by
        // adding a zero-width space character
        span.appendChild( document.createTextNode("\u200b") );
        range.insertNode(span);
        var y = span.offsetTop;
        var spanParent = span.parentNode;
        spanParent.removeChild(span);

        // Glue any broken text nodes back together
        spanParent.normalize();

        return y;

}
RE.caretInfo = {
   	y: 0,
   	height: 0
   };
RE.getYCaretInfo = function() {
    var selection = window.getSelection();
    var noSelectionAvailable = selection.rangeCount == 0;

    if (noSelectionAvailable) {
        return null;
    }

    var y = 0;
    var height = 0;
    var range = selection.getRangeAt(0);
    var needsToWorkAroundNewlineBug = (range.getClientRects().length == 0);

    // PROBLEM: iOS seems to have problems getting the offset for some empty nodes and return
    // 0 (zero) as the selection range top offset.
    //
    // WORKAROUND: To fix this problem we use a different method to obtain the Y position instead.
    //
    //if (needsToWorkAroundNewlineBug) {
    //    var closerParentNode = RE.closerParentNode();
    //    var closerDiv = RE.closerParentNodeWithName('div');
    //
    //    var fontSize = $(closerParentNode).css('font-size');
    //    var lineHeight = Math.floor(parseInt(fontSize.replace('px','')) * 1.5);
    //
    //    y = this.getCaretYPosition();
    //    height = lineHeight;
    //} else {
        if (range.getClientRects) {
            var rects = range.getClientRects();
            if (rects.length > 0) {
                // PROBLEM: some iOS versions differ in what is returned by getClientRects()
                // Some versions return the offset from the page's top, some other return the
                // offset from the visible viewport's top.
                //
                // WORKAROUND: see if the offset of the body's top is ever negative.  If it is
                // then it means that the offset we have is relative to the body's top, and we
                // should add the scroll offset.
                //
                var addsScrollOffset = document.body.getClientRects()[0].top < 0;

                if (addsScrollOffset) {
                    y = document.body.scrollTop;
                }

                y += rects[0].top;
                height = rects[0].height;
            }
        }
    //}
    var offsetTop = RE.editor.offsetTop;
    this.caretInfo.y = y - offsetTop;
    this.caretInfo.height = height;

    return this.caretInfo;
};

RE.insertImage2 = function(url, alt) {
    var html = '<img src="' + url + '" alt="' + alt + '" />';
    RE.insertHTML(html);
    var y = RE.getYCaretInfo().y;
    window.scrollTo(0, y);
}
RE.insertImage = function(url) {
    var html = '<img style="display:block;padding:3px;margin:auto;" src="' + url + '"/>';
    RE.insertHTML(html);
    //var y = RE.getYCaretInfo().y;
    //window.scrollTo(0, y);
}
RE.insertImageTrans = function(url,degree) {
    var html = '<img style="display:block;padding:3px;margin:auto;transform:rotate('+degree+'deg);"  src="' + url  + '" />';
    RE.insertHTML(html);
}
RE.insertImageWH = function(url, alt, width, height) {
    var html = '<img style="display:block;padding:3px;margin:auto;width:' + width +  ';height:' + height + ';"  src="' + url + '" alt="' + alt + '" />';
    RE.insertHTML(html);
    var y = RE.getYCaretInfo().y;
    window.scrollTo(0, y);
}
RE.insertImageWHTrans = function(url, alt, width, height,margin,degree) {
    var html = '<img style="display:block;padding:3px;margin:' + margin + ' auto ' + margin + ' auto;width:' + width +  ';height:' + height + ';transform:rotate('+degree+'deg);"  src="' + url + '" alt="' + alt + '" />';
    RE.insertHTML(html);
    var y = RE.getYCaretInfo().y;
    window.scrollTo(0, y);
}
RE.insertHTML = function(html) {
    RE.restorerange();
    document.execCommand('insertHTML', false, html);
}
RE.getSelectionContainerElem = function (range) {
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
    }
    var elem;
    if (range) {
        elem = range.commonAncestorContainer;
        return $(elem.nodeType === 1 ? elem : elem.parentNode).get(0);
    }
}
RE.delete = function() {
    document.execCommand('delete', false, null);
}

RE.scrollToSelection = function() {
  window.getSelection().anchorNode.scrollIntoView(true);

}
RE.scrollInView = function(id) {
  setTimeout(function() {
  		 var e = document.getElementById(id);
          if(e)
          {
           e.scrollIntoView(true);
          }
  }, 1000);

}
RE.insertLink = function(url, title) {
    RE.restorerange();
    var sel = document.getSelection();
    if (sel.toString().length == 0) {
        document.execCommand("insertHTML",false,"<a href='"+url+"'>"+title+"</a>");
    } else if (sel.rangeCount) {
       var el = document.createElement("a");
       el.setAttribute("href", url);
       el.setAttribute("title", title);

       var range = sel.getRangeAt(0).cloneRange();
       range.surroundContents(el);
       sel.removeAllRanges();
       sel.addRange(range);
   }
    RE.callback();
}
RE.insertBeforeCheck = function(sel){  //插入之前检测
    var sel = sel || document.getSelection();
    var range = sel.getRangeAt(0);
    var selElem = RE.getSelectionContainerElem();
    if($(selElem).hasClass("at-user") 
        || $(selElem).closest(".game-widget").length > 0
        || selElem.nodeName.toLowerCase() == "a"){
        
        //设置选区到末尾    
        range.setStart(selElem, 1);
        range.setEnd(selElem,1);
        // 0：其他类型；1：不允许中间插入块
        RE.insertType = 1;
    }else{
        RE.insertType = 0;
    }
    return range;
}
RE.insertUserTest = function(id,nickname){
    RE.atuserId ++;
    var temp = '<a href="javascript:void(0)" class="at-user" id="atuser'+RE.atuserId+'">@'+nickname+'</a>&nbsp;';
    RE.insertUser("atuser"+RE.atuserId,temp);
}
RE.insertUser = function(id,html){
    // var html = '<span class="shuck"><span class="at-user" id="'+id+'">@这是什么鬼鬼炸</span>&nbsp;</span>';
    RE.restorerange();
    var sel = window.getSelection();
    var range = RE.insertBeforeCheck(sel);
    if(RE.insertType == 1){
        var selElem = RE.getSelectionContainerElem();
        var node = $(html).get(0);
        $(selElem).after(node);
        // range.deleteContents();
        // range.insertNode(node);
        range.setStartAfter(node);
        range.setEndAfter(node);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }else{
        RE.restorerange();
        RE.insertHTML(html);
    }

    // var obj = document.querySelector("#"+id);
    // obj.setAttribute("contenteditable",false);
    RE.callback();
} 
RE.insertGameTest = function(id, iconUrl, name){
    RE.gameWidgetId ++;
    var temp = '<div class="game-widget" id="game'+RE.gameWidgetId+'" gid="'+id+'">'
        +'<div class="logo" style="background:url('+iconUrl+'?fop=imageView/2/l/60/s/60) no-repeat"></div>'
        +'<span class="title">'+name+'</span>'
    +'</div><p><br></p>';
    RE.insertGame("game"+RE.gameWidgetId, temp);
}
RE.insertGame = function(id, html){
    var range = RE.insertBeforeCheck();
    var selElem = RE.getSelectionContainerElem();
    //判断选区是否在首行首位   
    if(range.startOffset == 0 && range.endOffset == 0){ //首位
        if(selElem.id == selectorId || $(selElem).prev().length == 0){  //首行
            html = "<p></br></p>" + html;
        }
    } 
    if($(selElem).closest("blockquote").length > 0){
        $(html).insertAfter($(selElem).closest("blockquote"));
    }else{
        RE.restorerange(range);
        RE.insertHTML(html);
    }
    var obj = document.querySelector("#"+id);
    obj.style.width = (window.innerWidth-42) + "px";
    obj.setAttribute("contenteditable",false);
}
RE.lockUneditable = function(){
    // $(".at-user").attr("contenteditable",false);
    $(".game-widget").attr("contenteditable",false);
}
RE.checkStartAndEnd = function(content){
    content = content.trim();
    //匹配游戏卡片div
    var gameReg = /<div[^>]*class=("|')game-widget\1[^>]*>(<div[^>]*>.*?<\/div>|.)*?<\/div>/gi;
    //如果第一个元素是游戏卡片，则在前面加一空行
    if(content.search(gameReg) == 0){
        content = "<p><br></p>" + content;
    }
    //如果最后一个元素是HR，则在其后添加一空行
    var checkHr = content.substr(content.length-4,content.length);
    if(checkHr == "<hr>"){
        content += "<p><br></p>";
    }
    return content;
}
RE.setTodo = function(text) {
    var html = '<input type="checkbox" name="'+ text +'" value="'+ text +'"/> &nbsp;';
    document.execCommand('insertHTML', false, html);
}
RE.insertEmptyLine = function(){
    document.execCommand('insertHTML', false, '<p><br></p>');
}
RE.prepareInsert = function() {
    RE.backuprange();
}

RE.backuprange = function(){
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
      var range = selection.getRangeAt(0);
      RE.currentSelection = {
          "selection": selection,
          "range":range,
          "startContainer": range.startContainer,
          "startOffset": range.startOffset,
          "endContainer": range.endContainer,
          "endOffset": range.endOffset};
    }
}

RE.restorerange = function(range){
    var selection = window.getSelection();
    selection.removeAllRanges();
    if(range){
        selection.addRange(range);
    }else{
        range = document.createRange();
        range.setStart(RE.currentSelection.startContainer, RE.currentSelection.startOffset);
        range.setEnd(RE.currentSelection.endContainer, RE.currentSelection.endOffset);
        selection.addRange(range);
    }
}

RE.enabledEditingItems = function(e) {
    var items = [];
    if (document.queryCommandState('bold')) {
        items.push('bold');
    }
    if (document.queryCommandState('italic')) {
        items.push('italic');
    }
    if (document.queryCommandState('subscript')) {
        items.push('subscript');
    }
    if (document.queryCommandState('superscript')) {
        items.push('superscript');
    }
    if (document.queryCommandState('strikeThrough')) {
        items.push('strikeThrough');
    }
    if (document.queryCommandState('underline')) {
        items.push('underline');
    }
    if (document.queryCommandState('insertOrderedList')) {
        items.push('orderedList');
    }
    if (document.queryCommandState('insertUnorderedList')) {
        items.push('unorderedList');
    }
    if (document.queryCommandState('justifyCenter')) {
        items.push('justifyCenter');
    }
    if (document.queryCommandState('justifyFull')) {
        items.push('justifyFull');
    }
    if (document.queryCommandState('justifyLeft')) {
        items.push('justifyLeft');
    }
    if (document.queryCommandState('justifyRight')) {
        items.push('justifyRight');
    }
    if (document.queryCommandState('insertHorizontalRule')) {
        items.push('horizontalRule');
    }
    var formatBlock = document.queryCommandValue('formatBlock');
    if (formatBlock.length > 0) {
        items.push(formatBlock);
    }
    var selElem = RE.getSelectionContainerElem();
    if($(selElem).closest("blockquote").length > 0){
        items.push("blockquote");
    }

    window.location.href = "re-state://" + encodeURI(items.join(','));
}

RE.focus = function() {
    var range = document.createRange();
    range.selectNodeContents(RE.editor);
    range.collapse(false);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    RE.editor.focus();
}

RE.blurFocus = function() {
    RE.editor.blur();
}

RE.removeFormat = function() {
    document.execCommand('removeFormat', false, null);
}
RE._contentResizer = document.getElementById('editor_hidden');
RE.updateContentPlaceholder = function() {
	// 设置内容的输入提示
	var content = RE.getHtml();
	reg = /^[ \n\t\r]*|[ \n\t\r]*$/g;
	var multiLine = false;
	multiLine = !!content.match(/<hr/);
  if (!multiLine) {
  		multiLine = content.match(/<p[ >]/g);
  		if (multiLine) {
  				multiLine = multiLine.length > 1;
  		} else {
  				multiLine = false;
  		}
  }
  var hasImage = !!content.match(/<img/);
  content = RE.getText().replace(reg, '');
	if (content.length === 0  && !hasImage && !multiLine) {
		RE._contentResizer.innerHTML = RE.placeholderString;
		RE._contentResizer.style.visibility = 'visible';
	} else {
		RE._contentResizer.innerHTML = '';
		RE._contentResizer.style.visibility = 'hidden';
	}
}
// Event Listeners
RE.editor.addEventListener("input", function(e){
    var selElem = RE.getSelectionContainerElem();
    if($(selElem).closest(".at-user").length > 0 && e.inputType != "deleteContentBackward"){
        $(selElem).closest(".at-user").removeClass("at-user").removeAttr("id");
    }
    RE.callback();
    RE.updateContentPlaceholder();
  
});

RE.editor.addEventListener("keydown",function(e){
    var KEY_LEFT = 37, KEY_RIGHT = 39;
    if (e.which == KEY_LEFT || e.which == KEY_RIGHT) {
        RE.enabledEditingItems(e);
    }else if(e.which == 8){ //  退格键，判断当前选区
        var selElem = RE.getSelectionContainerElem();
        if(!selElem) return ;
        if($(selElem).closest(".at-user").length > 0){
            $(selElem).closest(".at-user").remove();
        }
    }else if(e.which == 13){ //回车键
        var selElem = RE.getSelectionContainerElem();
        if($(selElem).closest("blockquote").length > 0){ 
            
        }else if($(selElem).closest("h1, h2").length > 0 ){
            var h = $(selElem).closest("h1, h2");
            var sel = RE.currentSelection.selection;
            var range = RE.currentSelection.range;
            /**
             * H1/H2回车处理，由于默认换行会带有不希望有的格式
             * 如果是行末，则在其后添加一个空行，会失去已有格式
             * 如果是行中，则不做处理
             */
            if(range.collapsed){
                if(selElem.nodeName == "H1" || selElem.nodeName == "H2"){
                    if(range.endOffset == range.endContainer.length){
                        h.after("<p><br></p>");
                        //选区向前移动一个段落
                        RE.currentSelection.selection.modify("move","forward","paragraph");
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                }else{
                    var nextSibling = selElem.nextSibling;
                    if(nextSibling == null || (nextSibling.nodeType == 3 && nextSibling.nodeValue == "")){
                        h.after("<p><br></p>");
                        //选区向前移动一个段落
                        RE.currentSelection.selection.modify("move","forward","paragraph");
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                }
                
            }
        }
    }
});
RE.editor.addEventListener("click", RE.enabledEditingItems);
RE.editor.addEventListener("paste",function(e){
e.preventDefault();
e.stopPropagation();
// 安卓的WebView可以获得paste事件，但无法获取paste数据。
RE.eventCallback("paste");
});
RE.editor.addEventListener("click",function(e){
    var targetNode = e.target;
    if (targetNode) {
        if (targetNode.nodeName.toLowerCase() == 'a') {
            var title = targetNode.innerText;
            var url = targetNode.href;
            RE.currentActiveElement = targetNode;
            console.log("title:"+title);
            setTimeout(function() {
                RE.eventCallback("link-tap?url="+encodeURI(url)+"&title="+title);
            }, 550);
            e.preventDefault();
        }else if($(targetNode).closest(".game-widget").length > 0){
            // var selNode = $(targetNode).closest(".game-widget").get(0);
            // var sel = RE.currentSelection.selection;
            // var range = document.createRange();
            // range.selectNode(selNode);
            // sel.removeAllRanges();
            // sel.addRange(range);
            // console.log("点击了游戏卡片")
        }else if($(targetNode).hasClass(".at-user")){
            RE.canInserUser = false;
            RE.eventCallback("error?code=120&msg=不能插入");
        }
        
    }
    // console.log("tap tap tap ")
});
RE.update = {
    updateLink : function(url,title){
        var link = RE.currentActiveElement;
        link.innerHTML = title;
        link.href = url;
    }
}
RE.nativeEventHandle = {
    link:function(){
        var docFrag = RE.currentSelection.range.cloneContents();
        var obj = $("<div></div>").append(docFrag);
        var selContent = obj.html();
        //如果有换行，则不能添加超链接,
        if(selContent.search(/<(p|div|img)[^>]*>/gi) < 0){
            RE.eventCallback("link-tap?title="+encodeURI(selContent));
        }else{
            RE.eventCallback("error?code="+ERROR.LINK_DISABLED.code+"&msg="+ERROR.LINK_DISABLED.msg);
        }
    }
}
