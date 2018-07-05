/**
 * 表情
 */
import Panel from '../panel'
export default class{
    constructor(editor){
        this.editor = editor
        this.$elem = $(
            `<div class="menu" title="表情">
                <i class="ico-rich ico-rich-emoticon"></i>
            </div>`
        )
        this.type = 'click'
        
        // 面板模板
        this.panelTemp = `
        <div class="editor-panel editor-panel-emoticon" >
        <span class="pointer"></span>
        ${this.getEmotTemp()}  
        </div>`
    }
    onClick(){
        const editor = this.editor
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
                menuKey: 'emoticon',
                temp: this.panelTemp
            })
            this.panel.show()
            const $panel = this.panel.$elem
            $panel.find('.emot-grid dd').on('click', e => {
                const emot = e.target.innerText
                editor.cmd.insertHTML(emot)
                this.panel.hide()
            })
        }
        
    }
    //改变状态
    changeActive(){
        if(this.panel && this.panel.isShow){
            this.$elem.addClass("active")
        }else{
            this.$elem.removeClass("active")
        }
    }
    // 获得表情模板
    getEmotTemp(){
        const emotDatas =  ['(ง •̀_•́)ง', '(￣∀￣)', '(´・ω・`)', '(｡˘•ε•˘｡)', '( • ω - )', '(｡☉౪ ⊙｡)', '( ´◔ ‸◔`)', '(｡・`ω´･)', '(￣ε(#￣)', '╮(╯▽╰)╭', '(ノ｀Д´)ノ', ' (/≧▽≦/)', '( ・◇・)？', 'Σ(ﾟдﾟ;)', 'ಥ_ಥ', '( ^ω^)', '(ΘωΘ)', '（⊙ˍ⊙）', '( ′ェ`）', '（¯﹃¯）', '(＞д＜)', '（。_。）', '（￣﹏￣）', '(╬▔皿▔) ', '→_→', '←_←', '(=｀ω´=) ', '(〒︿〒)', '（/ω＼）', ' _(:3 」∠)_']
        let temp = '<dl class="emot-grid">'
        emotDatas.forEach((v, i) => {
            temp += `<dd>${v}</dd>`
        })
        temp += '</dl>'
        return temp
    }
}