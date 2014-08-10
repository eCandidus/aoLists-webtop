/**
 *
 *		util_socket.js
 *		aolists
 *
 *      String related calls
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.exports.aofn,
    socketi = require('socket.io');

/**
 *  socket - socket.io support
 */
aofn.socket = {
    // The connection
    conn: null,
    // User table
    users: {},

    init: function (server) {
        // Create server
        aofn.socket.conn = socketi(server);
        // Handle connections
        aofn.socket.conn.on('connection', function (socket) {
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

        if (aofn.config.enableDBEXCHG) {
            aofn.socketserver.init();
        }
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

            if (aofn.config.enableDBEXCHG) {
                aofn.socketserver.emit('in', {
                    'name': name
                });
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
                delete aofn.socket.users[socket.user];
            }

            if (aofn.config.enableDBEXCHG) {
                aofn.socketserver.emit('out', {
                    'name': socket.user
                });
            }
        }
    },

    qm: function (msg, fromdb) {
        var conn;
        if (msg.to) {
            if (msg.to == '*') {
                for (var user in aofn.socket.users) {
                    conn = aofn.socket.users[user] || [];
                    conn.forEach(function (tosocket) {
                        try {
                            tosocket.emit('qm', msg);
                        } catch (e) {}
                    });
                }
            } else {
                conn = aofn.socket.users[msg.to] || [];
                conn.forEach(function (tosocket) {
                    try {
                        tosocket.emit('qm', msg);
                    } catch (e) {}
                });

                if (aofn.config.enableDBEXCHG && !fromdb && !conn.length) {
                    aofn.socketserver.emit('qm', msg);
                }
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

aofn.socketserver = {
    // The socket to the server
    socket: null,
    // Recovery
    intervalID: null,

    init: function () {
        aofn.socketserver.socket = require('socket.io-client')(aofn.format('http{2}://{0}:{1}', aofn.config.db.host, aofn.config.db.port, (aofn.config.db.useSSL ? 's' : '')));
        aofn.socketserver.socket.on('connect', function () {
            if (aofn.socketserver.intervalID) {
                clearInterval(aofn.socketserver.intervalID);
                aofn.socketserver.intervalID = null;
            }
            aofn.socketserver.socket.on('qm', function (msg) {
                aofn.socket.qm(msg, true);
            });
            socket.on('disconnect', function () {
                if (!aofn.socketserver.intervalID) {
                    aofn.socketserver.intervalID = setInterval(aofn.socketserver.reconnect, 2000);
                }
            });
        });
    },

    reconnect: function () {
        if (aofn.socketserver.socket.connected === false) {
            aofn.socketserver.socket.connect();
        }
    },

    emit: function (fn, msg) {
        if (aofn.socketserver.socket) {
            aofn.socketserver.socket.emit(fn, msg);
        }
    }
};