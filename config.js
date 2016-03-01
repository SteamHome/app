var config = {};

config.steam = {};
  config.steam.key = process.env.STEAM_KEY || '';
  config.steam.returnURL = process.env.STEAM_RETURN || '';
  config.steam.realm = process.env.STEAM_REALM || '';

config.couch = {};
  config.couch.user = process.env.COUCH_USER || '';
  config.couch.pass = process.env.COUCH_PASS || '';

config.keen = {};
  config.keen.id = process.env.KEEN_ID || '';
  config.keen.write = process.env.KEEN_WRITE || '';

config.cookie = process.env.COOKIE || '';

module.exports = config;
