var express = require('express');
var router = express.Router();
var cradle = require('cradle');
var keen = require('keen-js');
var conf = require('../config.js');


cradle.setup({
    host: 'localhost',
    cache: true,
    raw: false,
    forceSave: true,
    auth: { username: conf.couch.user, password: conf.couch.pass}
  });
var db = new(cradle.Connection)().database('users');

var keenClient = new keen({
  projectId: conf.keen.id,
  writeKey: conf.keen.write
});

String.prototype.includes = function() {'use strict';
    return String.prototype.indexOf.apply(this, arguments) !== -1;
};

String.prototype.stripSlashes = function(){
    return this.replace(/\\(.)/mg, "$1");
};

function stripTrailingSlash(str) {
    if(str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}

/* GET home page. */
router.get('/', function(req, res, next){
  if(req.user) {
    db.get(req.user.id, function (err, doc) {
      if(!err) { renderHome(req.user.id, doc.links, req, res); }
      else {
        console.log('Error getting links for '+req.user.id, err);
        renderHome(req.user.id, null, req, res);
      }
     });

  }
  else { res.render('welcome'); }
});

router.get('/welcome', function(req, res, next){
  if(req.user) { res.render('welcome', {user: req.user}); }
  else { res.redirect('/'); }
});

router.get(['/suggest', '/suggest/:appid'], function(req, res, next){
  res.render('suggest', {user: req.user, appid: req.params.appid});
});

router.get(['/id', '/id/:id*'], function(req, res, next) {
  if(req.params.id) {
      steamid.convertVanity(req.params.id, function(err, id) {
        if (err) res.render('auth/login', { error: 'profileid', user: req.user });
        else renderHome(id, null, req, res);
    });
  }
  else res.render('auth/login', { error: 'profileid', user: req.user });
});

router.get(['/profiles', '/profiles/:profile*'], function(req, res, next) {
  if(req.params.profile) {
    renderHome(req.params.profile, null, req, res);
  }
});

router.get('/userlinks', function(req, res, next){
  if(req.user){
    db.get(req.user.id, function (err, doc) {
      if(!err) res.render('userlinks', {user: req.user, links: doc.links});
      else {
        console.log('Error getting links for '+req.user.id, err);
        res.render('userlinks', {user: req.user, links:'error'});
      }
     });
  }
  else res.render('auth/login', {error:'userlinks'});
});

router.post('/userlinks', function(req, res, next){
  var links = req.body.links;
  if(req.user && links && JSON.parse(links).length <= 5){
    db.merge(req.user.id, {links: JSON.parse(links)}, function (err, data) {
        if(err){ console.log('Error updating links for user'+err); res.json({success: false}); }
        else res.json({success: data.ok});
    });
  }
  else res.json({success: false});
});

router.post('/getid', function(req, res, next){

  var type;
  var steamid;
  var input = stripTrailingSlash(req.body.input);
  console.log(input)
  var reVan = /steamcommunity.com\/id\/(.*)/;
  var re64 = /steamcommunity.com\/profiles\/(.*)/;


  if(input === null){
   res.json({error: 'noid'});
  }


  if (input.includes('http://steamcommunity.com/profiles/')){
    matches = re64.exec(input);
    url = matches[1].stripSlashes();
    res.json({url: '/profiles/'+url});
  }
  else if (input.includes('http://steamcommunity.com/id/')){
    matches = reVan.exec(input);
    url = matches[1].stripSlashes();
    res.json({url: '/id/'+url});
  }
  else {
    res.json({url: '/id/'+input});
  }

});

function renderHome(userid, links, req, res, next){
  s.getPlayerSummaries({
    steamids: userid,
    callback: function(err, data) {
      steam = data.response.players[0];
      if (process.env.NODE_ENV === 'development') console.log(steam)
      if(err){
        res.render('error', { error: 'summary', user: req.user}); return;
      }
      // else{
        else if(steam.communityvisibilitystate != 3) {
          res.render('usererror', { error: 'profileState', user: req.user, steam: steam });
        }
        else {
          var reg = /steamcommunity.com\/(.*)\//;
          matches = reg.exec(steam.profileurl);
          res.render('home', { user: req.user, steam: steam, profileurl: matches[1], links: links });
          keenClient.addEvent('render', {
            'app': {
              'id': steam.gameid,
              'name': steam.gameextrainfo
            },
            'user': {
              'steamid': steam.steamid,
              'profilestate': steam.profilestate
            },
            'agent': {
              'browser': req.headers['user-agent'],
              'ip': req.ip
            },
            'keen': {
              'addons': [
                {
                  'name': 'keen:ip_to_geo',
                  'input': { 'ip': 'agent.ip' },
                  'output': 'ip_geo'
                },
                {
                  'name': 'keen:ua_parser',
                  'input': { 'ua_string': 'agent.browser' },
                  'output': 'ua_details'
                }
              ]
            }

          }, function(err, resp){
            if(err) console.log('Keen Err:', err);
            else { if (process.env.NODE_ENV === 'development') console.log('Keen:', resp) }
          });
        }
      // }
    }
  });
}


module.exports = router;
