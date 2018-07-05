/**
 * H1
 */
export default class{
    constructor(editor){
        this.editor = editor
        this.$elem = $(
            `<div class="menu" title="H1">
                <i class="ico-rich ico-rich-h1"></i>
            </div>`
        )
        this.type = 'click'
        //当前状态
        this.active = false
    }
    onClick(){
        const editor = this.editor
        //需要聚焦到编辑区域
        if(!editor.isFocus) return
        //插入块级元素时避免嵌套
        if (this.active) {
            editor.cmd.execCommand('formatBlock', editor.defaultParagraphSeparatorTag())
        } else {
            editor.cmd.execCommand('formatBlock', '<h1>')
        }
    }
    //改变状态
    changeActive(){
        const cmd = this.editor.cmd
        const cmdValue = cmd.queryCommandValue('formatBlock')
        if(cmdValue.toLowerCase() == "h1"){
            this.active = true
            this.$elem.addClass("active")
        }else{
            this.active = false
            this.$elem.removeClass("active")
        }
    }
}