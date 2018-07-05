/**
 * 插入链接
 */
import Panel from '../panel'
export default class{
    constructor(editor){
        this.editor = editor
        this.$elem = $(
            `<div class="menu" title="插入链接">
                <i class="ico-rich ico-rich-link"></i>
            </div>`
        )
        this.type = 'click'
        //当前状态
        this.active = false
        this.linkHref = ''
        this.linkTitle = ''
        // 面板模板
        this.panelTemp = `
            <div class="editor-panel editor-panel-link" >
                <span class="pointer"></span>  
                <div class="title">添加外部链接</div>
                <div class="form-row"><input type="text" class="input link-title"/></div>
                <div class="form-row"><input type="text" class="input link-href"/></div>
                <div class="form-row">
                    <span class="error-msg"></span>
                </div>
                <div class="form-row center mb0">
                    <span class="btn btn-primary">确定</span>
                </div>
            </div>`
    }
    onClick(){
        //需要聚焦到编辑区域
        if(!this.editor.isFocus) return
        if(this.panel){
            if(this.panel.isShow){
                this.panel.hide()
            }else{
                this.panel.show()
            }
        }else{
            this.panel = new Panel({
                editor: this.editor, 
                elem: this.$elem,
                menuKey: 'link',
                temp: this.panelTemp
            })
            this.panel.show()
            const $panel = this.panel.$elem
            $panel.find('.btn').on('click', e => {
                this.linkHref = $panel.find('.link-href').val()
                this.linkTitle = $panel.find('.link-title').val()
                this.insertLink()
                this.panel.hide()
            })
        }
    }
    insertLink(){
        console.log(`${this.linkTitle}; ${this.linkHref}`)
        const editor = this.editor
        editor.selection.restorerange()
        const sel = document.getSelection()
        if(sel.toString().length == 0){
            const temp = `<a href="${this.linkHref}">${this.linkTitle}</a>`
            editor.cmd.insertHTML(temp)
        }else if(sel.rangeCount){
            var el = document.createElement("a")
            el.setAttribute("href", this.linkHref)
            el.setAttribute("title", this.linkTitle)

            var range = sel.getRangeAt(0).cloneRange()
            range.surroundContents(el)
            sel.removeAllRanges()
            sel.addRange(range)
        }
    }
    //改变状态
    changeActive(){
    }
}