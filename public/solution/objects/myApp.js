/**
 * @class my.App
 * @extends
 *
 * A. eCandidus Web Desktop Application
 *       with Login/Logou screens
 * B. User Information
 *
 * @author    Jose Gonzalez
 * @copyright (c) 2014, by Candid.Concepts LC
 * @version   1.0
 * @date      <ul>
 * <li>1. June 17, 2014</li>
 * </ul>
 *
 * @license All code is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 * <p>License details: <a href="http://www.gnu.org/licenses/lgpl.html"
 * target="_blank">http://www.gnu.org/licenses/lgpl.html</a></p>
 *
 */
/* Fix for Msg Box Problem */
Ext.WindowMgr.zseed = 25000;

/* User Information */
my.User = new Ext.app.Module({
    menu: [],
    tools: [],
    isLoggedIn: function () {
        return this.userName !== null;
    },
    logout: function () {
        var windows = my.App.desktop.getManager();
        if (windows) windows.each(function (win) {
            win.close();
        });
        my.App.desktop.taskbar.clearTaskButtons();
        my.App.desktop.taskbar.startBtn.disabled = true;
        my.User.userName = null;
        my.AJAX.call('Access_Out');
        my.Popup.showAlert('Thank you for using aoLists Webtop', 'Good Bye');
        (this.home).defer(3000);
    },
    home: function () {
        window.location.href = my.AJAX.rootURL;
    }
});

/* History */
Ext.History.init();

/* Default type */
Ext.Container.defaultType = 'aostring';

/* Start Point */
Ext.onReady(function () {
    Ext.QuickTips.init();
    my.AJAX.hello(function (result) {
        if (result) my.Options = Ext.apply(my.Options, result);
    });

    my.Functions.showIdle();

    var login = new Ext.FormPanel({
        labelWidth: 80,
        frame: true,
        bodyStyle: 'padding:5px;',
        defaultType: 'textfield',
        monitorValid: true,
        buttonAlign: 'center',
        labelAlign: 'right',
        items: [{
            id: 'loginUsername',
            fieldLabel: 'Name',
            name: 'loginUsername',
            allowBlank: false
        }, {
            id: 'loginPassword',
            fieldLabel: 'Password',
            name: 'loginPassword',
            inputType: 'password',
            allowBlank: false
        }],
        buttons: [{
            text: 'Login',
            id: 'loginButton',
            formBind: true,
            handler: function () {
                Ext.get('loginButton').fadeOut();
                var un = Ext.get('loginUsername').getValue().toLowerCase();
                var up = Ext.get('loginPassword').getValue().toLowerCase();
                my.AJAX.call('Access_In', {
                    userNickname: un,
                    password: up
                }, function (result) {
                    if (result && !result.error) {
                        my.AJAX.signature = result.signature;
                        my.RTComm.login(un);
                        my.User = Ext.apply(my.User, result.data);
                        if (my.User.menuDefinitions) {
                            my.User.menu = my.Menu.Generator(my.User.menuDefinitions);
                            my.User.menuDefinitions = null;
                        }
                        if (my.User.userTheme) Ext.util.CSS.swapStyleSheet('theme', my.User.userTheme);
                        if (my.User.toolDefinitions) {
                            my.User.tools = my.Menu.ToolGenerator(my.User.toolDefinitions);
                            my.User.toolDefinitions = null;
                        }
                        if (my.User.tools.length > 0) my.User.tools.addEntry('-');
                        my.User.tools.push({
                            text: 'Logout',
                            iconCls: 'logout',
                            handler: function () {
                                Ext.Msg.show({
                                    title: 'Exiting aoLists Webtop...',
                                    msg: 'Any unsaved work will be lost, Are you sure you want to exit?',
                                    buttons: Ext.Msg.OKCANCEL,
                                    fn: function (btn) {
                                        if (btn === 'ok') {
                                            my.RTComm.logout();
                                            my.User.logout();
                                        }
                                    },
                                    icon: Ext.MessageBox.QUESTION
                                });
                            },
                            scope: this
                        });
                        win.close();
                        my.App = new Ext.app.App({
                            getModules: function () {
                                return my.User.menu;
                            },
                            getStartConfig: function () {
                                return {
                                    title: my.User.userName,
                                    iconCls: 'user',
                                    toolItems: my.User.tools
                                };
                            },
                            winID: 0,
                            nextWindowID: function () {
                                return 'win' + ++this.winID;
                            },
                            createWindow: function (windef) {
                                var xdef = Ext.apply(Ext.apply(windef, my.Window), {
                                    id: my.Constants.NextWindowID(),
                                    minimizable: true
                                });
                                var win = this.getDesktop().createWindow(xdef);
                                win.show();
                                return win;
                            }
                        });
                        my.Popup.showServerAlert('Welcome ' + my.User.userName, {
                            autoclose: 3000
                        });
                    } else {
                        //my.Popup.showAlert('Login failed!');
                        login.getForm().reset();
                        Ext.get('loginButton').fadeIn();

                        Ext.getCmp('loginUsername').focus('', 100);
                    }
                });
            }
        }]
    });

    var win = new Ext.Window({
        title: 'Please login...',
        layout: 'fit',
        width: 275,
        height: 150,
        closable: false,
        resizable: false,
        plain: true,
        border: false,
        items: [login]
    });

    win.show();
    Ext.getCmp('loginUsername').focus('', 100);
});

my.RTComm = {
    socket: null,
    user: null,
    intervalID: null,
    online: true,

    reconnect: function () {
        if (!my.RTComm.socket) {
            my.RTComm.socket = io();
        }
        if (my.RTComm.socket.connected === false) {
            my.RTComm.socket.connect()
        }
    },

    ifonline: function (cb) {
        if (my.RTComm.online) {
            if (cb) {
                cb();
            }
        } else {
            my.Popup.showAlert('Operation has been disabled until server is back online...');
        }
    },

    login: function (un) {
        if (!my.RTComm.socket) {
            my.RTComm.socket = io();
            my.RTComm.socket.on('qm', function (msg) {
                my.Popup.showQM(msg);
            });
            my.RTComm.socket.on('layoutset', function (msg) {
                delete my.Layouts[msg.layout];
            });
            my.RTComm.socket.on('disconnect', function (msg) {
                if (!my.RTComm.intervalID) {
                    my.RTComm.intervalID = setInterval(my.RTComm.reconnect, 2000)
                }
                if (my.RTComm.online) {
                    my.RTComm.online = false;
                    my.Popup.showServerAlert('Server is down!');
                }
            });
            my.RTComm.socket.on('connect', function (msg) {
                if (my.RTComm.intervalID) {
                    clearInterval(my.RTComm.intervalID);
                    my.RTComm.intervalID = null;
                }
                if (my.RTComm.user) {
                    my.RTComm.socket.emit('in', {
                        'name': my.RTComm.user
                    });
                    if (!my.RTComm.online) {
                        my.RTComm.online = true;
                        my.Popup.showServerAlert('Server is back up!');
                    }
                }
            });
        }
        my.RTComm.user = un;
        if (my.RTComm.user) {
            my.RTComm.socket.emit('in', {
                'name': my.RTComm.user
            });
        }
    },

    logout: function () {
        if (my.RTComm.socket && my.RTCommuser) {
            my.RTComm.socket.emit('out', {
                'name': my.RTComm.user
            });
        }
    },

    qm: function (to, msg, subj) {
        if (my.RTComm.socket && my.RTComm.user) {
            my.RTComm.socket.emit('qm', {
                'from': my.RTComm.user,
                'to': to,
                'message': msg,
                'subject': subj
            });
        }
    }
};