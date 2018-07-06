
import './scss/ypw-editor'
import YpwEditor from './editor'
import test from './test'
if(process.env.NODE_ENV === 'development') {
    test.launch()
}else{
    window.YpwEditor = YpwEditor
}
export default (window.YpwEditor || YpwEditor)