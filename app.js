const express = require('express')
const handlebars = require('express-handlebars')// 引入 handlebars
const db = require('./models') //引入資料庫
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const helpers = require('./_helpers')
const session = require('express-session')
const methodOverride = require('method-override')

const app = express()
const port = process.env.PORT || 3000
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const passport = require('./config/passport')

app.engine('handlebars', handlebars({
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
}))// Handlebars 註冊樣板引擎
app.set('view engine', 'handlebars')// 設定使用 Handlebars 做為樣板引擎
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(methodOverride('_method'))

app.use('/upload', express.static(__dirname + '/upload'))
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = helpers.getUser(req)
  next()
})

app.listen(port, () => {
  db.sequelize.sync() //讓models跟資料庫同步
  console.log(`Example app listening at http://localhost:${port}`)
})

require('./routes')(app)

module.exports = app
