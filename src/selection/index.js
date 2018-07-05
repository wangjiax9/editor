
/**
 * 选区
 */
export default class{
    constructor(editor){
        this.editor = editor
        this.curRange = null
    }
    getRange(){
        return this.curRange
    }
    //备份选区
    backuprange(){
        var selection = window.getSelection()
        if (selection.rangeCount === 0){
            return
        } 
        var range = selection.getRangeAt(0)
        this.curRange = range
        // console.log("backuprange")
        // console.log(this.curRange)
    }
    //恢复选区
    restorerange(){
        var selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(this.curRange)
        // console.log("restorerange")
        // console.log(this.curRange)
    }
    // 选区的 $Elem
    getSelectionContainerElem(range){
        range = range || this._currentRange
        let elem
        if (range) {
            elem = range.commonAncestorContainer;
            return $(elem.nodeType === 1 ? elem : elem.parentNode).get(0)
        }
    }
    // 获得选中区域文字
    getSelectionText(){
        const range = this.curRange
        if (range) {
            return range.toString()
        } else {
            return ''
        }
    }
    // 聚焦
    focus(){  
        var range = document.createRange()
        range.selectNodeContents(this.editor.textElem)
        range.collapse(false)
        var selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
        this.editor.textElem.focus()
        this.backuprange()
    }
    // 有选区
    hasRange(){
        if(this.curRange != null){
            return true;
        }else{
            return false;
        }
    }
}