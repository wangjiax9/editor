/**
 * 斜体
 */
export default class{
    constructor(editor){
        this.editor = editor
        this.$elem = $(
            `<div class="menu" title="斜体">
                <i class="ico-rich ico-rich-italic"></i>
            </div>`
        )
        this.type = 'click'
        //当前状态
        this.active = false
    }
    onClick(){
        //需要聚焦到编辑区域
        if(!this.editor.isFocus) return
        
        this.editor.cmd.execCommand('italic', null)
    }
    //改变状态
    changeActive(){
        const cmd = this.editor.cmd
        if(cmd.queryCommandState("italic")){
            this.active = true
            this.$elem.addClass("active")
        }else{
            this.active = false
            this.$elem.removeClass("active")
        }
    }
}