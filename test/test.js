var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should;
var supertest = require('supertest');
var express = require('express');
var app = require('../app.js');
var steamhome = supertest('http://localhost:9000');
var exec = require('child_process').exec;
var imgur = require('imgur');
var Steam = require('steam');

var steamClient = new Steam.SteamClient();
var steamUser = new Steam.SteamUser(steamClient);
var steamFriends = new Steam.SteamFriends(steamClient);

app.listen(9000)

describe('SteamHome', function() {

  it('homepage should return a 200 response', function(done) {
    steamhome.get('/')
      .expect(200, done);
  });

  it('/suggest should return a 200 response', function(done) {
    steamhome.get('/suggest')
      .expect(200, done);
  });

  it('/random should return a 404 response', function(done) {
    steamhome.get('/random')
      .expect(404, done);
  });

  it('/getid should return a steamurl', function(done) {
    steamhome.post('/getid')
      .send({input: 'http://steamcommunity.com/id/zackboe'})
      .expect(200)
      .end(function(err,res){
        expect(res.body).to.have.property('url');
        expect(res.body.url).to.equal('/id/zackboe');
        console.log(res.body.url);
        done();
      })
  });

});

describe('Browser Tests', function(){
  this.slow(30000)

  // This feels really wrong but..
  it('should not load game data when inactive', function(done){
    exec('casperjs test test/inactive.js', function(error, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {

            console.log('exec error: ' + error);
            throw(error)
        }
        done()
    });
  });

  it('should load game data when active', function(done){
    this.timeout(60000)

    steamClient.connect();
    steamClient.on('connected', function(){
      steamUser.logOn({
        account_name: 'automatedtest',
        password: process.env.STEAMPASS
      });
    });

    steamClient.on('logOnResponse', function(){
      console.log('✓ Logged into Steam')
      steamFriends.setPersonaState(Steam.EPersonaState.Online);
      steamUser.gamesPlayed({'games_played': {'game_id': '570'} })
    })

    console.log('.. waiting 30 seconds')
    setTimeout(function () {
      exec('casperjs test test/active.js', function(error, stdout, stderr) {
          console.log(stdout);
          console.log(stderr);
          if (error !== null) {

              console.log('exec error: ' + error);
              throw(error)
          }
          imgur.uploadFile('active.png')
            .then(function (json) { console.log('Active Screenshot: '+json.data.link); done() })
            .catch(function (err) { console.error(err.message); done();  });

      });
    }, 30000);
  });



})
