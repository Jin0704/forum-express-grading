const restController = require('../controllers/restController')
const adminComtroller = require('../controllers/adminController')
const userController = require('../controllers/userController')
module.exports = (app, passport) => {

  app.get('/', (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', restController.getRestaurants)

  app.get('/admin', (req, res) => res.redirect('/admin/restaurants'))
  app.get('/admin/restaurants', adminComtroller.getRestaurants)
  app.get('/signup', userController.signUpPage)
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)
  app.post('/signup', userController.signUp)

}
