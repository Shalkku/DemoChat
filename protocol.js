var _ = require('lodash');

exports = module.exports = function(wss, users, chathistory) {
    var _users = users;
    var _history = chathistory;
    var _wss = wss;
    
    function setUserNick(user, nick) {
        if(_users[user])
        user.nick = nick;
    }
    
    return {
        handleCommand: function(ws, msg) {
            var commandAndParmas = msg.split(' ', 2);
            if(commandAndParmas.length >= 2 && commandAndParmas[0].toLowerCase() === '/nick') {
                var nick = commandAndParmas[1].trim();
                //check if nick is in use
                var user = _users.getUser(nick);
                if(user && user.online) { //currently online, won't accept
                    ws.send(JSON.stringify({from: "_server", error: "Nick in use"}));
                    return false;
                }                
                if(nick[0] === '_') { //reserver nicks starting with '_' to server use
                    ws.send(JSON.stringify({from: "_server", error: "Nick cannot start with the underscore"}));
                    return false;
                }
                //set or create user
                var retMsg;
                var params = {};
                if(ws.user) { 
                    var oldNick = ws.user.nick;
                    _users.changeNick(oldNick, nick);
                    retMsg =  oldNick + " is now known as " + ws.user.nick;
                } else {
                    if(!user) {
                        ws.user = _users.createUser(nick);
                    } else {
                        ws.user = user;
                    }
                    ws.user.online = true;
                    retMsg = "New user: " + ws.user.nick + " joined.";
                    params.trigger = 'updateUsers'; // Update users list
                }
                this.broadcast("_server", retMsg, params)
            }    
        },
        broadcast: function(from, msg, params) {
            _history.add(from, msg);
            var chat = {from: from, message: msg, params: params};
            _.each(_wss.clients, function(client) {
                /*if(client.user && client.user.nick !== from) {
                    client.send(JSON.stringify(chat));
                } */
                if(client.user) {
                 client.send(JSON.stringify(chat));
                 }
            });
        }
    }

    
};