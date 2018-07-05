
import Config from '../config'
import Menu from '../menu'
import Text from '../text'
import Selection from '../selection'
import Command from '../command'
import {extractThreadContent} from './extract'

export default class {
    constructor(options){
        //合并默认配置和用户配置
        this.config = Object.assign({}, Config, options)
        if(options && options.menus){
            this.config.menus = options.menus
        }
        // 编辑器元素
        this.editorElem = document.querySelector(this.config.id)
        this.$editorElem = $(this.editorElem)
        //工具栏模板
        const toolbarTemp = `<div class="toolbar"></div>`
        this.$toolbar = $(toolbarTemp).appendTo(this.$editorElem)
        this.toolbarElem = this.$toolbar.get(0)
        //编辑区域模板
        const textTemp = `<div class="edit-container"  contentEditable="true" ><p><br></p></div>`
        this.$textElem = $(textTemp).appendTo(this.$editorElem)
        this.textElem = this.$textElem.get(0)
        let th = this.$editorElem.css('height')
        th = parseInt(th.substring(0, th.length-2))
        this.$textElem.css('height', th - 44 - 32 + 'px')
        //信息提示
        const errorTemp = `<span class="error-msg error-content" id="formMsg"></span>`
        this.$editorElem.append(errorTemp)
        // 是否聚焦
        this.isFocus = false
        // 图片数量
        this.imgCount = 0
        // 图片加载块ID，从0开始计数
        this.imgLoadingId = 0
        
        // 占位符
        this.contentPlaceholder = $("<div class='placeholder' contenteditable='false'></div>")
        var pt =  this.$textElem.css("padding-top")
        pt = parseInt(pt.substring(0, pt.length-2))
        this.contentPlaceholder.insertBefore(this.$textElem)
            .css({
                left: this.$textElem.css("padding-left"),
                top: this.$textElem.position().top + pt + "px",
                "font-size": this.$textElem.css("font-size")
            })
        this.updateContentPlaceholder()
    }
    defaultParagraphSeparatorTag(){
        return "<p>"
    }
    setHTML(html){
        this.$textElem.html(html)
        this.updateContentPlaceholder()
    }
    getHTML(){
        return this.$textElem.html()
    }
    getContent(){
        return extractThreadContent(this)
    }
    // 更新placeholder，允许空行存在时显示伪装的placeholder
    updateContentPlaceholder(){
        var self = this;
        // 设置内容的输入提示
        var content = self.$textElem.html()
        var emptyLine = false
        if (content === "<p><br></p>") {
            emptyLine = true
        } 
        var reg = /^[ \n\t\r]*|[ \n\t\r]*$/g
        content = self.$textElem.text().replace(reg, "")
        if (content.length === 0  || emptyLine) {
            self.contentPlaceholder.html(self.config.placeholder)
            self.contentPlaceholder.css("visibility", "visible")
        } else {
            self.contentPlaceholder.html("")
            self.contentPlaceholder.css("visibility", "hidden")
        }
    }
    init(){
        this.cmd = new Command(this)
        document.execCommand('defaultParagraphSeparator', false, 'p');
        this.selection =  new Selection(this)
        this.menus = new Menu(this)
        this.menus.init()
        this.text = new Text(this)
        this.text.init()
    }
}