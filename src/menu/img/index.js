/**
 * 插入图片
 */
import imgUpload from './img-upload'
export default class{
    constructor(editor){
        this.editor = editor
        this.$elem = $(
            `<div class="menu" title="插入图片">
                <i class="ico-rich ico-rich-img"></i>
                <input type="file" id="editorImgFile" style="width:0;height:0;opacity: 0;position: absolute;"/>
            </div>`
        )
        this.type = 'click'
        //当前状态
        this.active = false
        this.$editorImgFile = null
    }
    preHandle(){
        const editor = this.editor
        this.$editorImgFile = $("#editorImgFile")
        this.$editorImgFile.on("change", function(){
            new imgUpload(editor).selectFileImage(this)
        })
    }
    onClick(){
        const editor = this.editor
        if(editor.config.isNeedFocus){
            //需要聚焦到编辑区域
            if(!this.editor.isFocus) return
        }
        if(!editor.selection.hasRange()){
            editor.selection.focus()
        }
        editor.imgCount = editor.$textElem.find("img").length
        if(editor.imgCount >= editor.config.uploadCount){
            return
        } 
        this.$editorImgFile.get(0).click()
        // this.editor.cmd.execCommand('bold', null)
    }
    //改变状态
    changeActive(){
        const cmd = this.editor.cmd
    }
    
}