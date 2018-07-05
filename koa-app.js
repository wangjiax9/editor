const Nuxt = require('nuxt')

const path = require('path')
const Koa = require('koa')
const app = new Koa()

const Router = require('koa-router')
const router = new Router()
const serve = require('koa-static')

router.get(/\/*/gi, (ctx, next) => {
	console.log(ctx.response)
})
const main = serve(path.join(__dirname))

app.use(main)
app.use(router.routes())

app.listen(7777);