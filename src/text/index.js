

/**
 * 编辑区域
 */
import pasteHandle from './paste-handle'
export default class{
   constructor(editor){
       this.editor = editor
   } 
   init(){
       
       this.eventHandle()
   }
   //更新选区和菜单状态
   updateRangeAndMenu(){
        const editor = this.editor
        //备份选区
        editor.selection.backuprange()
        //改变菜单状态
        editor.menus.changeActive()
    }
   // 事件处理
   eventHandle(){
       const editor = this.editor
       // 编辑器是否聚焦
       $(document).on("click", e => {
            const target = e.target
            // 点击的是否是编辑器内的元素
            const isChild = editor.editorElem.contains(target)
            // 点击的是否是编辑区域
            const isTextElem = editor.textElem.contains(target)
            // 点击的是否是工具栏菜单
            let isMenu = false
            for (let [menuKey, menu] of editor.menus.menus) {
                const hm = $(target).hasClass("ico-rich-" + menuKey.toLocaleLowerCase())
                if(hm){
                    isMenu = true
                    break;
                }
            }
            if(!isChild){
                editor.isFocus = false
            }else{
                if(isTextElem || isMenu){
                    editor.isFocus = true
                }else{
                    editor.isFocus = false
                }
            }
            // console.log(`editor.isFocus: ${editor.isFocus}`)
       })
       editor.$textElem.on({
            click: e => {
                editor.isFocus = true
                this.updateRangeAndMenu()
            },
            input: e => {
                var selElem = editor.selection.getSelectionContainerElem()
                if($(selElem).closest(".at-user").length > 0 && e.originalEvent.inputType != "deleteContentBackward"){
                    $(selElem).closest(".at-user").removeClass("at-user").removeAttr("data-uid")
                }
                // 更新placeholder，允许空行存在时显示伪装的placeholder
                editor.updateContentPlaceholder()
            },
            blur: e => {
                // editor.isFocus = false
                this.updateRangeAndMenu()
            },
            keydown: e => {
                const KEY = {
                    ENTER:13,   //回车键
                    BACKSPACE:8 //退格键
                }
                if(e.which == KEY.ENTER){

                }else if(e.which == KEY.BACKSPACE){
                    var selElem = editor.selection.getSelectionContainerElem()
                    if($(selElem).closest(".at-user").length > 0){
                        $(selElem).closest(".at-user").remove();
                    }
                }
            },
            keyup: e => {
                this.updateRangeAndMenu()
            },
            paste: e => {
                if(document.documentMode){  //如果是IE，禁止粘贴
                    e.stopPropagation()
                    e.preventDefault()
                    return
                }
                e.preventDefault()
                //获得粘贴内容
                let pasteHtml = pasteHandle.getPasteHtml(e,editor)
                editor.selection.backuprange()
                editor.cmd.insertHTML(pasteHtml)
            }
       })
   }
}