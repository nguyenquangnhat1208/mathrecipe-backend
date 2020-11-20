var express = require('express');
var router = express.Router();
const file_image = require('../controllers/file_image.controller');
const BibleVerse = require('../controllers/bibleVerse.controller');
const Scripture = require('../controllers/scripture.controller');
const User = require('../controllers/user.controller');
const UrlLunch = require('../controllers/lunchUrl.controller');
const ColorApp = require('../controllers/colorApp.controller');
const firebase_admin = require('../controllers/firebase_admin');
const Debug = require('../controllers/Debug');
const passportService = require('../configs/passport.config'),
  passport = require('passport');
var requireLogin = passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
});
module.exports = (app) => {
  let authRoutes = express.Router();

  app.use(passport.initialize());
  app.use(passport.session());
  passportService(passport);
  router.use('/auth', authRoutes);
  authRoutes.post('/login', requireLogin);

  function isLoggedIn(req, res, next) {
    // console.log(req.isAuthenticated());
    // console.log(req.user);
    if (req.isAuthenticated())
      return next();
    res.redirect('/login');
  }
  app.get('/', isLoggedIn, (req, res) => {
    res.render('use_manager');
  });
  app.get('/bibleVerse-manager', isLoggedIn, (req, res) => {
    res.render('bibleVerse');
  });
  app.get('/scripture-manager', isLoggedIn, (req, res) => {
    res.render('scripture_manager_v2');
  });
  app.get('/account-manager', isLoggedIn, async (req, res) => {
    res.render('use_manager');
  });
  app.get('/url-manager', (req, res) => {
    res.render('lunchUrl_manager');
  });
  app.get('/color-app', (req, res) => {
    res.render('colorApp');
  });
  app.get('/login', (req, res) => {
    res.render('Login', { layout: false, title: 'login', message: req.flash('message') });
  });
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
  });

  express.application.prefix = express.Router.prefix = function (path, configure) {
    var router = express.Router();
    this.use(path, router);
    configure(router);
    return router;
  };
  //upload single image in local
  router.post('/upload-single-image-local/:bible_verses', file_image.uploadSingleImageLocal);
  router.post('/firebase/set-notification', firebase_admin.SetNotification);
  router.post('/firebase/disable-notification', firebase_admin.DisableNotification);
  router.post('/debug', Debug.CreateDebuger);
  router.post('/testing', firebase_admin.testing);
  router.get('/callfirebase', firebase_admin.callfirebase);

  //Router bible-verse
  router.prefix('/bible-verse', (route) => {
    route.post('/get', isLoggedIn, BibleVerse.GetBibleVerse);
    route.get('/get-m', BibleVerse.GetBibleVerseForMobile);
    route.get('/get-s', BibleVerse.GetBibleVerseForSwiper);
    route.get('/get-a', BibleVerse.GetAllBibleVerse);
    // route.post('/get', GiaoVien.GetGiaoVien);
    route.post('/create', isLoggedIn, BibleVerse.CreateBibleVerseOnCloud);
    route.put('/update', BibleVerse.UpdateScriptureOnCloud);
    route.delete('/delete/:id', isLoggedIn, BibleVerse.DeleteScriptureOnCloud);
  });

  //Router scripture
  router.prefix('/scripture', (route) => {
    route.post('/get', isLoggedIn, Scripture.GetScripture);
    route.get('/get-m', Scripture.GetScriptureForMobile);
    // route.post('/get', GiaoVien.GetGiaoVien);
    route.post('/create', isLoggedIn, Scripture.CreateScriptureOnCloud);
    route.put('/update', isLoggedIn, Scripture.UpdateScriptureOnCloud);
    route.delete('/delete/:id', isLoggedIn, Scripture.DeleteScriptureOnCloud);
  })

  router.prefix('/account-manager', (route) => {
    route.post('/get', isLoggedIn, User.GetUser);
    route.post('/create', isLoggedIn, User.CreateUser);
    route.post('/change-password', isLoggedIn, User.changePassword);
    route.put('/update/:id', isLoggedIn, User.UpdateUser);
    route.delete('/delete/:id', User.DeleteUser);
  })

  router.get('/get-url', UrlLunch.geturl);
  router.post('/edit-url', UrlLunch.Updateurl);
  router.get('/get-color-app', ColorApp.GetColorApp);
  router.post('/edit-color-app', ColorApp.UpdateColorApp);
  app.use('/api/v1', router);
}
