var app = angular.module('chatDemo', ['ngResource', 'ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'luegg.directives']);

var _ws, _extScope;

/**
 * UserService
 * Informs user with error message is connection is closed
 * @returns {json} Returns available users in json format
 */
app.service('UserService', function ($resource) {
    return $resource('/users', {}, {
        query: {
            isArray: false,
            method: 'GET'
        }
    });
});

app.controller('chatController', function ($scope, $location, $interval, $filter, UserService) {

    _extScope = $scope;
    _ws = new WebSocket("ws://" + $location.host() + ":" + $location.port());

    $scope.blockedUsers = [];

    /**
     * Filters messages where "from" is found blockedUsers list
     * @param message
     * @returns {boolean}
     */
    $scope.userfilter = function (message) {
        return ($scope.blockedUsers.indexOf(message.from) === -1);
    };

    // Set interval for checking websocket state
    $interval(checkWs, 1000);

    // Messages container
    $scope.messages = [];

    // Labels. Maybe add function for translation?
    $scope.labels = {
        chatMessage: 'Write message',
        usersHeader: 'Users',
        send: 'Send',
        serverInfo: ''
    };


    /**
     * New message handler
     * Messages from users are added to messages object. Server messages are added straight to labels.serverInfo.
     * Update users and messages list on every message.
     */
    _ws.onmessage = function () {

        var data = event.data;

        if (isJson(data)) { // Check is returned data is valid JSON
            $scope.messages.push(JSON.parse(data));
        } else {
            $scope.labels.serverInfo = data;
        }

        UserService.query(function (res) {
            $scope.users = (res.data);
        });

        $scope.$apply();
    };


    /**
     * Send new messages using websocket connection
     * @param keyEvent
     */
    $scope.sendMessage = function (keyEvent) {
        if (keyEvent.which === 13 || keyEvent.which === 1) { // On ENTER or Mousedown
            $scope.newMsg = $scope.userInput;

            if (checkWs()) { // Checks websocket state before sending
                _ws.send($scope.userInput);
            }

            $scope.userInput = ""; // Clear user input after sending
        }
    };


    /**
     * Add or remove $nick to blockedUsers
     * @param $nick
     */
    $scope.filterUser = function ($nick) {

        if ($scope.blockedUsers.indexOf($nick) !== -1) {
            $scope.blockedUsers.splice($scope.blockedUsers.indexOf($nick), 1);
        } else {
            $scope.blockedUsers.push($nick);
        }
    }
});

/**
 * Checks websocket connection state
 * Informs user with error message is connection is closed
 * @returns {boolean} true if connection is open, otherwise else
 */
function checkWs() {
    if (_ws.readyState === 1) {
        return true;
    } else {
        _extScope.labels.serverInfo = 'Server disconnected';

        return false;
    }
}


/**
 * Checks if given string is valid JSON string
 * @param str
 * @returns {boolean} true if JSON, else false
 */
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
