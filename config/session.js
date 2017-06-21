var session = require('client-sessions');

var config = session({
    cookieName: 'session',
    secret: 'jalsdjfapodkjlskf345345hjk3lh45j3589834hklalkja',
    duration: 30 * 60 * 1000,
    activeDuration: 5*60*1000
});

module.exports = config;