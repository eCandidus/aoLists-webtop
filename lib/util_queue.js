/**
 *
 *		util_queue.js
 *		aolists
 *
 *      Login call related calls
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.exports.aofn,
    dequeue = require('dequeue');

/**
 *  getQUEUE - Top level menu
 */
aofn.getQUEUE = function (name) {
    // Make the holder
    aofn.queues = aofn.queues || {};
    // And get the one we want
    var ans = aofn.queues[name];
    if (!ans) {
        // Make
        ans = new dequeue();
        // Save
        aofn.queues[name] = ans;
    }
    //
    return ans;
};
