var _ = require('lodash');

function User(nick) {
    this.nick = nick;
    this.online = false;
}

exports = module.exports = function() {
    var _users = {};
    
    return {
        createUser: function(id) {
           if(!_users[id]) {
               _users[id] = new User(id);
               return _users[id];
           }
           return null;
        },
        getUser: function(id) {
            return _users[id];
        },
        getAll: function() {
            return _.map(_users, function(user) {
                return {nick: user.nick, online: user.online};
            });
        },
        /** Changes user nickname but be carefull, if newnick is alredy in use, this takes it over */
        changeNick: function(oldNick, newNick) {
            var user = this.getUser(oldNick);
            if(user && !user.online) {
                user.nick = newNick;
                delete _users[oldNick];
                _users[newNick] = user;
            }
        }
    }
}