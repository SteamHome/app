var express = require('express'),
    passport = require('passport'),
    SteamStrategy = require('passport-steam').Strategy;

var router = express.Router();

router.get('/', function(req, res, next){
  if(req.user){
    r=/(id\/(.*)\/)/;m=r.exec(req.user._json.profileurl);
    res.render('auth/login', {user: req.user, profileurl: m[2]});
  }
  else res.render('auth/login');
});

router.get('/steam',
  passport.authenticate('steam', { successRedirect: '/', failureRedirect: '/login' })
);

router.get('/return',
  passport.authenticate('steam', { successRedirect: '/', failureRedirect: '/login' })
);

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/auth');
});

module.exports = router;
