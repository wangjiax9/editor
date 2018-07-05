import axios from 'axios'
import Mock from '../mock'
import YpwEditor from '../editor'
import {contentHandle} from './test-thread'

function mockTest(){
    axios.get('/thread-test').then(res => {
        let data = res.data
        data = contentHandle(data)
        window.ypwEditor = new YpwEditor()
        ypwEditor.init()
        ypwEditor.setHTML(data.content)
    
        $('#getContent').click(() => {
            console.log(ypwEditor.getContent())
            $('#preview').text(ypwEditor.getContent().content)
        })
    })
}
/** 空内容测试
 *  如果测试上传到fp的时候，注释掉Mock.launch()
 **/
function emptyCTest(){
    window.ypwEditor = new YpwEditor()
    ypwEditor.init()
    $('#getContent').click(() => {
        console.log(ypwEditor.getContent())
        $('#preview').text(ypwEditor.getContent().content)
    })
}
const test = {
    launch(){
        // Mock.launch()
        // mockTest()
        emptyCTest()
    }
}
export default test
