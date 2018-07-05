~(function(){
    window.YpwEditor = function(options){
        var defaultConfig = {
            editor: "#editor",
            uploadImgType: 0,   // 0: 直接上传至fp-docs,需要token ，1:上传至admin中转，不需要token
            isNeedFocus:true, //是否需要聚焦才能插图
            uploadCount: 999,   //可上传图片次数
            placeholder:"分享你和游戏的故事~",
            authorization: "",
            uploadImgFPServer : "https://file.webapp.163.com/gameapp/file/new/",
            uploadImgAdminServer: "/admin/ajax/upload2fp/"
        }
        this.config = $.extend({}, defaultConfig, options);
        this.currentSelection = {
            "startContainer": 0,
            "startOffset": 0,
            "endContainer": 0,
            "endOffset": 0
        };
        this.editor = $(this.config.editor).find(".edit-container");
        this.toolbarObj = $(this.config.editor).find(".toolbar");
        this.imgFileObj = $("#imgFile");
        this.imgCount = 0;  //图片数量
        this.isFocus = false;

        this.imgLoadingId = 0; //图片加载块ID，从0开始计数

        this.contentPlaceholder = $("<div class='placeholder' contenteditable='false'></div>");
        var pt =  this.editor.css("padding-top");
        pt = parseInt(pt.substring(0, pt.length-2));
        this.contentPlaceholder.insertBefore(this.editor)
            .css({
                left:this.editor.css("padding-left"),
                top:this.editor.position().top + pt+"px",
                "font-size":this.editor.css("font-size")
            });

        this.toolbar = {
            bold: $(this.config.editor).find(".bold"),
            strikeThrough: $(this.config.editor).find(".strikeThrough"),
            insertImg:$(this.config.editor).find(".insertImg")
        }
    }
    YpwEditor.prototype = {
        constructor: YpwEditor,
        initConfig: function(){

        },
        // 封装 execCommand
        execCommand: function(name, value){
            this.restorerange();
            document.execCommand(name, false, value);
        },
        // 封装 document.queryCommandState
        queryCommandState: function (name) {
            return document.queryCommandState(name)
        },
        insertHTML: function(html){
            this.execCommand("insertHTML",html);
            this.backuprange();
        },
        backuprange: function(){
            var selection = window.getSelection();
            if (selection.rangeCount > 0) {
                var range = selection.getRangeAt(0);
                this.currentSelection = {
                    "range":range,
                    "startContainer": range.startContainer,
                    "startOffset": range.startOffset,
                    "endContainer": range.endContainer,
                    "endOffset": range.endOffset
                };
            }
        },
        restorerange: function(){
            var selection = window.getSelection();
            selection.removeAllRanges();
            var range = document.createRange();
            range.setStart(this.currentSelection.startContainer, this.currentSelection.startOffset);
            range.setEnd(this.currentSelection.endContainer, this.currentSelection.endOffset);
            selection.addRange(range);
        },
        focus: function(){  //聚焦
            var range = document.createRange();
            range.selectNodeContents(this.editor.get(0));
            range.collapse(false);
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            this.editor.focus();
            this.backuprange();
        },
        hasRange: function(){
            if(this.currentSelection.startContainer == 0){
                return false;
            }else{
                return true;
            }
        },
        enabledEditingItems: function(){
            var items = [];
            if (document.queryCommandState('bold')) {
                items.push('bold');
            }
            if (document.queryCommandState('strikeThrough')) {
                items.push('strikeThrough');
            }
            this.itemsCheck(items);
        },
        itemsCheck: function(items){
            this.toolbar.bold.removeClass("active");
            this.toolbar.strikeThrough.removeClass("active");
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                this.toolbar[item].addClass("active");
            }
        },
        editorBlur: function(){
            if(!this.config.isNeedFocus) return;
            this.toolbarObj.addClass("blur");
            this.toolbar.bold.removeClass("active");
            this.toolbar.strikeThrough.removeClass("active");
        },
        // 选区的 $Elem
        getSelectionContainerElem: function (range) {
            var selection = window.getSelection();
            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
            }
            var elem;
            if (range) {
                elem = range.commonAncestorContainer;
                return $(elem.nodeType === 1 ? elem : elem.parentNode).get(0);
            }
        },
        getContent: function(){ 
            var self = this;
            //过滤可能会出现的未删除的预览图片
            var preview = this.editor.find(".img-view");
            if(preview.length > 0){
                preview.remove();
            }
            //提取图片
            var images = extractImages();
            var atusers = extractUser();
            var atgames = extractGame();
            var content = this.editor.html();
            
            var count = 0;
            //获取内容，将图片标签转换为<!--IMG0-->，其中0为内容中图片序号
            content = content.replace(/<img[^>]*class=("|')img\1[^>]*\/?>/gi,function(curVal,index){
                return "<!--IMG"+(count++)+"-->";
            });
            count = 0;
            content = content.replace(/<(a|span)[^>]*class=("|')at-user\2[^>]*>[^<]*<\/(a|span)>/gi,function(curVal,index){
                return "<!--USER"+(count++)+"-->";
            });
            count = 0;
            content = content.replace(/<div[^>]*class=("|')at-game\1[^>]*>(?!<\/div>).*?<\/div>/gi,function(curVal,index){
                return "<!--GAME"+(count++)+"-->";
            });
            //由于Android、IOS端的p标签行间距比较远，换行改成<br>
            //由于Android端支持显示p，就不需要转换p
            // content = content.replace(/<p>\s*<br>\s*<\/p>/gi,"<br>");
            // content = content.replace(/<p[^>]*>/gi,"");
            // content = content.replace(/<\/p>/gi,"<br>");

            return {
                images:images,
                at_users:atusers,
                at_games:atgames,
                content:content
            };
            //提取游戏
            function extractGame(){
            	var datas = [];
                var games = self.editor.find(".at-game");
                for (var i = 0; i < games.length; i++) {
                    var data = {
                        id:$(games[i]).data("gid"),
                        name_cn: $(games[i]).find(".title").html(),
                        icon: $(games[i]).find(".at-game-img").attr("src")
                    }
                    datas.push(data);
                }
                return datas;
            }
            //提取图片
            function extractImages(){
                var datas = [];
                var imgs = self.editor.find(".img");
                for (var i = 0; i < imgs.length; i++) {
                    var data = {
                        width:imgs[i].naturalWidth,
                        height: imgs[i].naturalHeight,
                        url: imgs[i].src
                    }
                    datas.push(data);
                }
                return datas;
            }
            //提取@用户
            function extractUser(){
                var datas = [];
                var users = self.editor.find(".at-user");
                for (var i = 0; i < users.length; i++) {
                    var data = {
                        id:$(users[i]).data("uid"),
                        nickname: $(users[i]).text().substring(1)
                    }
                    datas.push(data);
                }
                return datas;
            }

        },
        updateContentPlaceholder: function(){   //更新placeholder，允许空行存在时显示伪装的placeholder
            var self = this;
            // 设置内容的输入提示
            var content = self.editor.html();
            var emptyLine = false;
            if (content == "<p><br></p>") {
                emptyLine = true;
            } 
            var reg = /^[ \n\t\r]*|[ \n\t\r]*$/g;
            content = self.editor.text().replace(reg, "");
            if (content.length === 0  || emptyLine) {
                
                self.contentPlaceholder.html(self.config.placeholder);
                self.contentPlaceholder.css("visibility","visible");
            } else {
                self.contentPlaceholder.html("");
                self.contentPlaceholder.css("visibility","hidden");
            }
        },
        editorEvent: function(){    //编辑器事件
            var self = this;
            this.editor.on({
                click: function(e){
                    //body有click事件处理，停止冒泡
                    e.stopPropagation();
                    self.isFocus = true;
                    self.toolbarObj.removeClass("blur");
                    self.enabledEditingItems();
                },
                input: function(e){
                    var selElem = self.getSelectionContainerElem();
                    if($(selElem).closest(".at-user").length > 0 && e.originalEvent.inputType != "deleteContentBackward"){
                        $(selElem).closest(".at-user").removeClass("at-user").removeAttr("data-uid");
                    }
                    self.updateContentPlaceholder();
                    
                },
                focus: function(){

                },
                blur: function(){
                    // self.editorBlur();
                    self.backuprange();
                },
                keyup: function(e){
                    var KEY_LEFT = 37, 
                        KEY_RIGHT = 39, 
                        KEY_ENTER = 13,
                        KEY_BACKSPACE = 8; 
                    if (e.which == KEY_LEFT || e.which == KEY_RIGHT) {
                        self.enabledEditingItems();
                    }
                    if(e.which == KEY_ENTER){

                    }
                    if(e.which == KEY_BACKSPACE){
                        var selElem = self.getSelectionContainerElem();
                        if(!selElem) return ;
                        if($(selElem).closest(".at-user").length > 0){
                            $(selElem).closest(".at-user").remove();
                        }
                    }
                    
                },
                paste: function(e){
                    if(document.documentMode){  //如果是IE，禁止粘贴
                        e.stopPropagation();
                        e.preventDefault();
                        return;
                    }
                    e.preventDefault();
                    pasteHandle(e);
                }
            });
            //粘贴处理
            function pasteHandle(e){
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
                if(self.config.uploadImgType == 0){
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
                if(self.config.uploadImgType == 0){
                    //如果上传至FP，则过滤掉a标签，因为是对外使用
                    pasteHtml = pasteHtml.replace(/<a[^>]*>/ig, "").replace(/<\/a>/gi,"");
                }
                //清除编辑器子级空标签
                pasteHtml = clearEmptyChildren(pasteHtml);
                //清除空的标签
                pasteHtml = pasteHtml.replace(/<[A-Za-z]+>\s?<\/[A-Za-z]+>/ig, "");

                self.backuprange();
                // var selectionElem = self.getSelectionContainerElem();
                // var nodeName = selectionElem.nodeName;
                // if (nodeName === 'DIV' || nodeName === 'P' || self.editor.html() === '<p><br></p>') {
                if (!pasteHtml) {
                    return
                }
                self.execCommand("insertHTML", pasteHtml);
                // }else{
                //         // 不是 div，证明在已有内容的元素中粘贴，只粘贴纯文本
                //     if (!pasteText) {
                //         return
                //     }
                //     self.execCommand("insertHTML", "<p>"+pasteText+"</p>");
                // }
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
        },
        toolbarEvent: function(){   //工具栏事件
            var self = this;
            $(document.body).click(function(e){ 
                if( $(e.target).parent().hasClass("bold") 
                    || $(e.target).parent().hasClass("strikeThrough")
                    || $(e.target).parent().hasClass("insertImg")
                ){
                    // 不作处理
                }else{
                    //点击编辑之外除了工具栏以外时，编辑器失焦
                    self.isFocus = false;
                }
            });
            self.toolbar.bold.on("click",function(e){
                if(!self.isFocus) return;
                $(this).toggleClass("active");
                self.execCommand("bold",null);
            });
            self.toolbar.strikeThrough.on("click",function(){
                if(!self.isFocus) return;
                $(this).toggleClass("active");
                self.execCommand("strikeThrough",null);
            });
            self.toolbar.insertImg.on("click",function(){
                if(self.config.isNeedFocus){
                    if(!self.isFocus) return;
                }
                if(!self.hasRange()){
                    self.focus();
                } 
                self.imgCount = self.editor.find("img").length;
                if(self.imgCount >= self.config.uploadCount) return;
                self.imgFileObj.click();
                if(self.config.uploadImgType == 0){
                    self.getFpToken();
                }
            });
            self.imgFileObj.on("change",function(){
                
                new self.imgHandle(self).selectFileImage(this);
            })
        },
        imgHandle: function(self){
            var file = null;
            //图片方向角 
            var orientation = null;  
            //上传中对象
            var uploadingObj = null;
            //选择图片事件
            this.selectFileImage = function(fileObj){
                file = fileObj.files['0'];
                if(!file) return;
                // 检查图片格式  
                var rFilter = /^(image\/jpeg|image\/png|image\/gif)$/i; 
                if (!rFilter.test(file.type)) {  
                    alert("请选择jpeg、png、gif格式的图片");  
                    return;  
                }
                //获取照片方向角属性，用户旋转控制  
                EXIF.getData(file, function() {  
                    EXIF.getAllTags(this);   
                    orientation = EXIF.getTag(this, 'Orientation');  
                });  
                var oReader = new FileReader();  
                oReader.onload = function(e) {
                    //图片预览
                    previewImg(e.target.result);
                }
                oReader.readAsDataURL(file);  
            }
            //图片预览
            function previewImg(src){
                self.imgLoadingId ++;
                var loadingTemp = ""+
                    "<div class='img-view img-uploading' id='imgLoading"+self.imgLoadingId+"'>"+
                        "<div class='img-upload' >"+
                            "<img class='img-preview' src='"+src+"'/>"+
                            "<div class='upload-status'>"+
                                "<div class='progress'>上传进度<em class='per' id='per'>0</em>%</div><br>"+
                            "</div>"+
                        "</div>"+
                    "</div>";
                var content = self.editor.html();
                // if(content == "" || content == "<p><br></p>"){  
                //     //如果内容空白，则在图片前面加空行
                //     loadingTemp = "<p><br></p>"+loadingTemp ;
                // }
                //会出现的问题是，捕获到的是ico节点，所以这没起作用，抽空再看看
                // var selectionElem = self.getSelectionContainerElem(self.currentSelection.range);
                // if($(selectionElem).next().length == 0){
                //     //如果在末尾添加图片，则在最后添加空行
                    loadingTemp = loadingTemp + "<p><br></p>";
                // }

                self.execCommand("insertHTML",loadingTemp);
                uploadingObj = $("#imgLoading"+self.imgLoadingId);
                uploadingObj.attr("contenteditable",false);
                // 0不知道是什么角度，
                if(orientation != undefined && orientation != 1 && orientation != 0 ){
                    //方向纠正处理
                    orientationCorrect(src);
                }else{
                    uploadImg(file);
                }
            }
            //方向纠正处理，主要针对手机拍照图片
            function orientationCorrect(src){
                var image = new Image();  
                image.src = src;
                image.onload = function() {
                    var canvas = document.createElement("canvas");  
                    var base64 = null;  
                    switch(orientation){  
                        case 6://需要顺时针（向左）90度旋转  
                            rotateImg(this,'left',canvas);  
                            break;  
                        case 8://需要逆时针（向右）90度旋转  
                            rotateImg(this,'right',canvas);  
                            break;  
                        case 3://需要180度旋转  
                            rotateImg(this,'right',canvas);//转两次  
                            rotateImg(this,'right',canvas);  
                            break; 
                    } 
                    base64 = canvas.toDataURL("image/jpeg", 0.8);  
                    // dataURL 的格式为 “data:image/png;base64,****”,逗号之前都是一些说明性的文字，我们只需要逗号之后的就行了
                    var data=base64.split(',')[1];
                    data=window.atob(data);
                    var ia = new Uint8Array(data.length);
                    for (var i = 0; i < data.length; i++) {
                        ia[i] = data.charCodeAt(i);
                    };
                    // canvas.toDataURL 返回的默认格式就是 image/png
                    var imgBlob=new Blob([ia], {type:"image/png"});
                    uploadImg(imgBlob);
                }
            }
            //对图片旋转处理 
            function rotateImg(img, direction, canvas){
                //最小与最大旋转方向，图片旋转4次后回到原方向    
                var min_step = 0;    
                var max_step = 3;    
                if (img == null)return;    
                //img的高度和宽度不能在img元素隐藏后获取，否则会出错    
                var height = img.height;    
                var width = img.width;    
                var step = 2;    
                if (step == null) {    
                    step = min_step;    
                }    
                if (direction == 'right') {    
                    step++;    
                    //旋转到原位置，即超过最大值    
                    step > max_step && (step = min_step);    
                } else {    
                    step--;    
                    step < min_step && (step = max_step);    
                }    
                //旋转角度以弧度值为参数    
                var degree = step * 90 * Math.PI / 180;    
                var ctx = canvas.getContext('2d');    
                switch (step) {    
                    case 0:    
                        canvas.width = width;    
                        canvas.height = height;    
                        ctx.drawImage(img, 0, 0);    
                        break;    
                    case 1:    
                        canvas.width = height;    
                        canvas.height = width;    
                        ctx.rotate(degree);    
                        ctx.drawImage(img, 0, -height);    
                        break;    
                    case 2:    
                        canvas.width = width;    
                        canvas.height = height;    
                        ctx.rotate(degree);    
                        ctx.drawImage(img, -width, -height);    
                        break;    
                    case 3:    
                        canvas.width = height;    
                        canvas.height = width;    
                        ctx.rotate(degree);    
                        ctx.drawImage(img, -width, 0);    
                        break;    
                }    
            }
            //上传图片
            function uploadImg(imgFile){
                var form = document.createElement("form");
                form.enctype = "multipart/form-data";
                var fd =new FormData(form);
                var url = "";
                if(self.config.uploadImgType == 0){  
                    
                    fd.append('fpfile',imgFile);
                    fd.append('Authorization',self.config.authorization);
                    url = self.config.uploadImgFPServer;
                }else if(self.config.uploadImgType == 1){
                    fd.append('file',imgFile);
                    url = self.config.uploadImgAdminServer;
                }
                //清空file域
                clearFile();
                $.ajax({
                    url: url,
                    type: "POST",
                    data: fd,
                    contentType: false, //必须false才会自动加上正确的Content-Type
                    processData: false, //必须false才会避开jQuery对 formdata 的默认处理
                    xhr: function(){ //获取ajaxSettings中的xhr对象，为它的upload属性绑定progress事件的处理函数
                        myXhr = $.ajaxSettings.xhr();
                        if(myXhr.upload){ //检查upload属性是否存在
                            //绑定progress事件的回调函数
                            myXhr.upload.addEventListener('progress',progressHandlingFunction, false);
                        }
                        return myXhr; //xhr对象返回给jQuery使用
                    }
                }).done( function(result){
                    if(self.config.uploadImgType == 0){ 
                        if(result.status == 200){
                            var img = $.parseJSON(result.body);
                            var temp = "<img class='img' src='"+img.url+"'/>";
                            uploadingObj.after(temp).remove();
                        }else if(result.status == 401){
                            console.log(result.body);
                            uploadingObj.remove();
                        }else if(result.status == 403){
                            console.log(result.body);
                            uploadingObj.remove();
                        }else{
                            console.log('这不科学，上传出现了意想不到的错误，赶紧联系客服！！');
                            uploadingObj.remove();
                        }
                    }else if(self.config.uploadImgType == 1){
                        var img = result.img;
                        var temp = "<img class='img' src='"+img.url+"'/>";
                        uploadingObj.after(temp).remove();
                    } 
                    self.enabledEditingItems();
                }).fail(function(xhr){
                    console.log(xhr);
                    uploadingObj.remove();
                });
                //上传进度回调函数：  
                function progressHandlingFunction(e) {  
                    if (e.lengthComputable) {  
                        var percent = parseInt(e.loaded/e.total*100);  
                        var $per = uploadingObj.find(".progress .per");
                        $per.html(percent);
                    }  
                } 
            }
            //清空file域
            function clearFile(){
                var f = $("#imgFile") ;
                f.val("")
                //以下是为了兼容IE的
                // f.after(f.clone().val(""));      
                // f.remove(); 
                // $("#imgFile").on("change",function(){
                //     console.log("ayayayayayayayayay")
                //     // new self.imgHandle(self).selectFileImage(this); 
                // });
            }
        },
        getFpToken: function(){ //获取上传到fp服务器的token
            var self = this;
            $.get("/api/v2/fp_tokens").done(function(res){
                token = res.token;
                self.config.authorization = token;
            });
        },
        init: function(){
        	// document.execCommand('insertBrOnReturn', false, false);
        	document.execCommand('defaultParagraphSeparator', false, "p");
        	this.updateContentPlaceholder();
            
            //编辑器事件
            this.editorEvent();
            //工具栏事件
            this.toolbarEvent();
        }
    }

})();
