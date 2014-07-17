/**
 * @class Merge Tool
 * @extends
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
my.Functions.MergeCallBack = function (result) {
    if (result && result.data) {
        var rData = result.data;
        if (rData.command) {
            switch (rData.command) {
            case 'view':
                my.View.Form({
                    action: 'View',
                    objid: rData.objid,
                    objds: rData.objds
                });
                my.AJAX.call('MergeCleanup', rData);
                break;
            case 'select':
                my.Select.Form({
                    mergeid: rData.mergeid,
                    objds: rData.objds,
                    objdsdesc: rData.objdatble,
                    lookup: rData.lookup
                }, function (data) {
                    if (data) {}
                });
                break;
            case 'input':
                my.Dialogs.Input({
                    mergeid: rData.mergeid,
                    title: rData.title,
                    prompt: rData.prompt
                }, function (button, e) {
                    if (buton == 'OK') {
                        my.AJAX.call('MergeInput', {
                            mergeid: button.shared.req.mergeid,
                            input: button.shared.input.getValue()
                        }, my.Functions.MergeCallBack);
                    } else {
                        my.AJAX.call('MergeCleanup', {
                            mergeid: button.shared.req.mergeid
                        });
                    }
                    button.shared.window.close();
                });
                break;
            case 'choice':
                my.Dialogs.Choice({
                    mergeid: rData.mergeid,
                    title: rData.title,
                    prompt: rData.prompt,
                    choices: rData.choice
                }, function (button, e) {
                    if (buton == 'OK') {
                        my.AJAX.call('MergeInput', {
                            mergeid: button.shared.req.mergeid,
                            input: button.shared.input.getValue()
                        }, my.Functions.MergeCallBack);
                    } else {
                        my.AJAX.call('MergeCleanup', {
                            mergeid: button.shared.req.mergeid
                        });
                    }
                    button.shared.window.close();
                });
                break;
            }
        }
    }
};

my.Tools.MergeDoc = function (src, cb) {
    my.Select.Form({
        objds: 'Writer',
        xtable: src.objds,
        xid: src.objid,
        mergeif: src.mergeif
    }, function (data) {
        my.AJAX.call('MergeDocument', data, my.Functions.MergeCallBack);
    });
};

my.Tools.MergeForm = function (src, cb) {
    my.Select.Form({
        objds: 'Form',
        xtable: src.objds,
        xid: src.objid,
        mergeif: src.mergeif
    }, function (data) {
        my.AJAX.call('MergeForm', data, my.Functions.MergeCallBack);
    });
};