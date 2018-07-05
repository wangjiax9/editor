/**
 * 加粗
 */
export default class{
    constructor(editor){
        this.editor = editor
        this.$elem = $(
            `<div class="menu" title="粗体">
                <i class="ico-rich ico-rich-bold"></i>
            </div>`
        )
        this.type = 'click'
        //当前状态
        this.active = false
    }
    onClick(){
        //需要聚焦到编辑区域
        if(!this.editor.isFocus) return
        
        this.editor.cmd.execCommand('bold', null)
    }
    //改变状态
    changeActive(){
        const cmd = this.editor.cmd
        if(cmd.queryCommandState("bold")){
            this.active = true
            this.$elem.addClass("active")
        }else{
            this.active = false
            this.$elem.removeClass("active")
        }
    }
}