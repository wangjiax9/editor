/**
 * 图片上传处理
 */
import EXIF from 'exif-js'
import axios from 'axios'
export default class {
    constructor(editor){
        this.editor = editor
        this.file = null
        // 图片方向
        this.orientation = null
        // 上传中对象
        this.uploadingObj = null
    }
    selectFileImage(fileObj){
        const self = this
        self.file = fileObj.files['0']
        if(!self.file) return
        // 检查图片格式  
        var rFilter = /^(image\/jpeg|image\/png|image\/gif)$/i 
        if (!rFilter.test(self.file.type)) {  
            alert('请选择jpeg、png、gif格式的图片')  
            return  
        }
        //获取照片方向角属性，用户旋转控制  
        EXIF.getData(self.file, function() {  
            EXIF.getAllTags(this)   
            self.orientation = EXIF.getTag(this, 'Orientation')  
        })  
        var oReader = new FileReader()  
        oReader.onload = function(e) {
            //图片预览
            self.previewImg(e.target.result)
        }
        oReader.readAsDataURL(self.file) 
    }
    previewImg(src){
        const editor = this.editor
        editor.imgLoadingId ++
        var loadingTemp = `
            <div class="img-view img-uploading" id="imgLoading${editor.imgLoadingId}">
                <div class="img-upload" >
                    <img class="img-preview" src="${src}"/>
                    <div class="upload-status">
                        <div class="progress">
                            上传进度
                            <em class="per" id="per">0</em>%
                        </div>
                        <br>
                    </div>
                </div>
            </div>`
        loadingTemp = `${loadingTemp}<p><br></p>`
        // 插入预览图模板
        editor.cmd.execCommand('insertHTML', loadingTemp)
        this.uploadingObj = $(`#imgLoading${editor.imgLoadingId}`)
        this.uploadingObj.attr('contenteditable', false)
        if(this.orientation != undefined && this.orientation != 1){
            this.orientationCorrect(src)
        }else{
            this.toUploadImg(this.file)
        }
    }
    //方向纠正处理，主要针对手机拍照图片
    orientationCorrect(src){
        const self = this
        var image = new Image()  
        image.src = src
        image.onload = function() {
            var canvas = document.createElement("canvas")  
            var base64 = null  
            switch(self.orientation){  
                case 6://需要顺时针（向左）90度旋转  
                    self.rotateImg(this,'left',canvas)  
                    break  
                case 8://需要逆时针（向右）90度旋转  
                    self.rotateImg(this,'right',canvas)  
                    break  
                case 3://需要180度旋转  
                    self.rotateImg(this,'right',canvas)//转两次  
                    self.rotateImg(this,'right',canvas)  
                    break 
            } 
            base64 = canvas.toDataURL("image/jpeg", 0.8)  
            // dataURL 的格式为 “data:image/png;base64,****”,逗号之前都是一些说明性的文字，我们只需要逗号之后的就行了
            var data=base64.split(',')[1]
            data=window.atob(data)
            var ia = new Uint8Array(data.length)
            for (var i = 0; i < data.length; i++) {
                ia[i] = data.charCodeAt(i)
            }
            // canvas.toDataURL 返回的默认格式就是 image/png
            var imgBlob=new Blob([ia], {type:"image/png"})
            self.toUploadImg(imgBlob)
        }
    }
    toUploadImg(imgFile){
        const editor = this.editor
        var form = document.createElement("form")
        form.enctype = "multipart/form-data"
        var fd =new FormData(form)
        var url = ""
        if(editor.config.uploadImgType == 0){
            if(process.env.NODE_ENV === 'development') {
                // 测试上传的时候，停掉mock.launch() 由于mockjs监听上传进度有bug，打包时注释掉
                const authorization = "Policy 8apmyp/88Sp2MNtCJuz3J3SebS8=:eyJmc2l6ZUxpbWl0IjogWzAsIDEwNDg1NzYwMF0sICJtaW1lTGltaXQiOiBbImltYWdlL2pwZWciLCAiaW1hZ2UvcG5nIiwgInZpZGVvL21wNCIsICJpbWFnZS9naWYiLCAiaW1hZ2UvYm1wIl0sICJ1cmwiOiAiaHR0cDovL2ZwLnBzLm5ldGVhc2UuY29tL2dhbWVhcHAvZmlsZS9uZXcvIiwgImNvbG9yIjogZmFsc2UsICJ0aW1lc3RhbXAiOiAxNTI1ODYwMzkzLCAicGluZyI6ICIiLCAibWV0aG9kIjogIlBPU1QifQ=="
                fd.append('fpfile', imgFile)
                fd.append('Authorization', authorization)
                this.uploadToFp(fd)
            }else{
                // 获取FP上传授权码
                axios.get(editor.config.fpTokenServer).then(res => {
                    const authorization = res.data.token
                    fd.append('fpfile', imgFile)
                    fd.append('Authorization', authorization)
                    this.uploadToFp(fd)
                }).catch(e => {
                    console.log(e)
                })
            }  
        }else if(editor.config.uploadImgType == 1){
            fd.append('file', imgFile)
            this.uploadToAdmin(fd)
        }
    }
    // 上传图片到FP服务器
    uploadToFp(fd){
        this.clearFile()
        const self = this
        const editor = this.editor
        const cf = {
            onUploadProgress: function(progressEvent){
                self.progressHandlingFunction(progressEvent)
            }
        }
        axios.post(editor.config.uploadImgFPServer, fd, cf)
        .then(res => {
            const result = res.data
            if(result.status === 200){
                const img = JSON.parse(result.body)
                const temp = `<img class ="img" src="${img.url}"/>`
                self.uploadingObj.after(temp).remove()
            }else if(result.status === 401 || result.status === 403){ 
                console.log(result.body)
                self.uploadingObj.remove()
            }else{
                console.log('这不科学，上传出现了意想不到的错误，赶紧联系客服！！')
                self.uploadingObj.remove()
            }
        })
    }
    // 通过管理后台借口上传图片到FP
    uploadToAdmin(fd){
        this.clearFile()
        const self = this
        const editor = this.editor
        const cf = {
            onUploadProgress: function(progressEvent){
                self.progressHandlingFunction(progressEvent)
            }
        }
        axios.post(editor.config.uploadImgAdminServer, fd, cf)
        .then(res => {
            const result = res.data
            const img = result.img
            const temp = `<img class ="img" src="${img.url}"/>`
            self.uploadingObj.after(temp).remove()
        })
    }
    progressHandlingFunction(progressEvent) {
        if (progressEvent.lengthComputable) {  
            var percent = parseInt(progressEvent.loaded / progressEvent.total * 100)
            var $per = this.uploadingObj.find(".progress .per")
            $per.html(percent)
        } 
    }
    clearFile(){
        $('#editorImgFile').val('')
    }
    //对图片旋转处理 
    rotateImg(img, direction, canvas){
        //最小与最大旋转方向，图片旋转4次后回到原方向    
        var min_step = 0    
        var max_step = 3    
        if (img == null)return    
        //img的高度和宽度不能在img元素隐藏后获取，否则会出错    
        var height = img.height    
        var width = img.width    
        var step = 2    
        if (step == null) {    
            step = min_step    
        }    
        if (direction == 'right') {    
            step++    
            //旋转到原位置，即超过最大值    
            step > max_step && (step = min_step)    
        } else {    
            step--    
            step < min_step && (step = max_step)    
        }    
        //旋转角度以弧度值为参数    
        var degree = step * 90 * Math.PI / 180    
        var ctx = canvas.getContext('2d')    
        switch (step) {    
            case 0:    
                canvas.width = width    
                canvas.height = height    
                ctx.drawImage(img, 0, 0)    
                break    
            case 1:    
                canvas.width = height    
                canvas.height = width    
                ctx.rotate(degree)    
                ctx.drawImage(img, 0, -height)    
                break    
            case 2:    
                canvas.width = width    
                canvas.height = height    
                ctx.rotate(degree)    
                ctx.drawImage(img, -width, -height)    
                break    
            case 3:    
                canvas.width = height    
                canvas.height = width    
                ctx.rotate(degree)    
                ctx.drawImage(img, -width, 0)    
                break    
        }    
    }
}