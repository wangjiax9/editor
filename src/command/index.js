

/**
 *  命令对象
 */

export default class {
    constructor(editor){
        this.editor = editor
    }
    execCommand(name, value){
        const editor = this.editor
        if(!editor.isFocus){ //需要聚焦到编辑区域
            return
        }
        editor.selection.restorerange()
        document.execCommand(name, false, value)        

        editor.menus.changeActive()
        editor.selection.backuprange()
    }
    insertHTML(html){
        this.execCommand("insertHTML",html)
        this.editor.selection.backuprange()
    }
    insertEmptyLine(){
        this.insertHTML('<p><br></p>')
    }
    queryCommandState(name){
        return document.queryCommandState(name)
    }
    queryCommandValue(name){
        return document.queryCommandValue(name)
    }
}