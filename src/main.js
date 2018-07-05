
import './scss/ypw-editor'
import YpwEditor from './editor'
import test from './test'
console.log(11)
if(process.env.NODE_ENV === 'production') {
    window.YpwEditor = YpwEditor
}else{
    test.launch()
}
export default (window.YpwEditor || YpwEditor)
