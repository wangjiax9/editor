/**
 * 插入游戏
 */
export default class{
    constructor(editor){
        this.editor = editor
        this.$elem = $(
            `<div class="menu" title="插入游戏">
                <i class="ico-rich ico-rich-game"></i>
            </div>`
        )
        this.type = 'click'
        //当前状态
        this.active = false
    }
    onClick(){
        //需要聚焦到编辑区域
        if(!this.editor.isFocus) return
        
    }
    //改变状态
    changeActive(){
        const cmd = this.editor.cmd
    }
}