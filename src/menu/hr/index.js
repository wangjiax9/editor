/**
 * 分割线
 */
export default class{
    constructor(editor){
        this.editor = editor
        this.$elem = $(
            `<div class="menu" title="分割线">
                <i class="ico-rich ico-rich-hr"></i>
            </div>`
        )
        this.type = 'click'
        //当前状态
        this.active = false
    }
    onClick(){
        const editor = this.editor
        //需要聚焦到编辑区域
        if(!this.editor.isFocus) return
        editor.cmd.execCommand('insertHorizontalRule', null)
        editor.cmd.insertEmptyLine()
    }
    //改变状态
    changeActive(){
        const cmd = this.editor.cmd
    }
}