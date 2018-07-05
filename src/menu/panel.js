
class Panel{
    constructor(opt){
        this.$elem = $(opt.temp).appendTo(opt.elem)
        this.$elem.on('click', e => {
            e.stopPropagation()
        })
        $(document).on('click', e => {
            const target = e.target
            const hm = $(target).hasClass("ico-rich-" + opt.menuKey.toLocaleLowerCase())
            if(this.isShow){
                if(!hm){
                    this.hide()
                }
            }
        })
    }
    show(){
        this.isShow = true
        this.$elem.show()
    }
    hide(){
        this.isShow = false
        this.$elem.hide()
    }
}
export default Panel