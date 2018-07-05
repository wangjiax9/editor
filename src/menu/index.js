
/**
 * 菜单
 */
import MenuClass from './menu-list.js'

export default class{
    constructor(editor){
        this.editor = editor
        this.menus = new Map()
    }
    //菜单初始化
    init(){
        let temp = ``
        const configMenus = this.editor.config.menus || []
        
        configMenus.forEach( menuKey => {
            const MC = MenuClass[menuKey]
            if(MC && typeof MC === 'function'){
                this.menus.set(menuKey, new MC(this.editor))
            }
        });
        this.addMenu()
        this.bindEvent()
    }
    addMenu(){
        //添加菜单到toolbar中
        for (let [menuKey, menu] of this.menus) {
            const $elem = menu.$elem
            if($elem){
                this.editor.$toolbar.append($elem)
            }
        }
    } 
    //绑定菜单事件
    bindEvent(){
        const editor = this.editor
        for (let [menuKey, menu] of this.menus) {
            if(!menu.type) return

            const $elem = menu.$elem
            if(menu.type === 'click' && menu.onClick){
                if(menu.preHandle){
                    menu.preHandle()
                }
                $elem.on('click', e => {
                    if(editor.selection.getRange() == null){
                        return
                    } 
                    menu.onClick()
                })
            }
        }
    }
    //修改菜单状态
    changeActive(){
        for (let [menuKey, menu] of this.menus) {
            if(menu.changeActive){
                setTimeout( () => {
                    menu.changeActive()
                },100)
            }
        }
    }
}