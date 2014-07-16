/**
 *
 *		util_socket.js
 *		aolists
 *
 *      String related calls
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var app = module.parent.exports.app,
    aofn = module.parent.exports.aofn,
    socketi = require('socket.io');

/**
 *  socket - socket.io interface
 */
aofn.socket = {
    // The interface
    interface: null,
    // User table
    users: {},

    init: function (server) {
        // Create server
        aofn.socket.interface = socketi(server);
        // Handle connections
        aofn.socket.interface.on('connection', function (socket) {
            // A new connection takes place
            socket.on('disconnect', function (msg) {
                if (socket.user) {
                    aofn.socket.addSocket(socket);
                    aofn.socket.removeSocket(socket);
                }
            });
            socket.on('in', function (msg) {
                if (msg.name) {
                    aofn.socket.addSocket(socket, msg.name);
                }
            });
            socket.on('out', function (msg) {
                aofn.socket.addSocket(socket);
                aofn.socket.removeSocket(socket);
            });
            socket.on('qm', function (msg) {
                aofn.socket.addSocket(socket);
                aofn.socket.qm(msg);
            });
        });
    },

    addSocket: function (socket, name) {
        if (name) {
            socket.user = name;
        }
        if (socket.user) {
            var conn = aofn.socket.users[socket.user] || [];
            var found = false;
            for (var i = conn.length; i > 0; i--) {
                var wsock = conn[i - 1];
                if (socket.id === wsock.id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                conn.push(socket);
                aofn.socket.users[socket.user] = conn;
            }
        }
    },

    removeSocket: function (socket) {
        if (socket.user) {
            var conn = aofn.socket.users[socket.user] || [];
            for (var i = conn.length; i > 0; i--) {
                var wsock = conn[i - 1];
                if (socket.id === wsock.id) {
                    conn.splice(i - 1, 1);
                }
            }
            if (conn.length) {
                aofn.socket.users[socket.user] = conn;
            } else {
                delete aofn.socket.users[socket.user]
            }
        }
    },

    qm: function (msg) {
        if (msg.to) {
            if (msg.to == '*') {
                for (var user in aofn.socket.users) {
                    var conn = aofn.socket.users[user] || [];
                    conn.forEach(function (tosocket) {
                        try {
                            tosocket.emit('qm', msg);
                        } catch (e) {}
                    });
                }
            } else {
                var conn = aofn.socket.users[msg.to] || [];
                conn.forEach(function (tosocket) {
                    try {
                        tosocket.emit('qm', msg);
                    } catch (e) {}
                });
            }
        }
    },

    layoutset: function (msg) {
        for (var user in aofn.socket.users) {
            var conn = aofn.socket.users[user] || [];
            conn.forEach(function (tosocket) {
                try {
                    tosocket.emit('layoutset', msg);
                } catch (e) {}
            });
        }
    }
};