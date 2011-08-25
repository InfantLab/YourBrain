/**
 * The setTimeout(myfunction,interval) function is slightly broken. Calling 
 * clearTimeout(id) causes myfunction to fire instantly rather than not to fire.
 * This code is a work around. 
 * See Nick Wing's answer here
 * http://developer.appcelerator.com/question/1881/please-help-on-stopping-the-settimeout
 */

function timeoutObject() { this.flag = true; }
 
function mySetTimeout(callback, time) {
    var myCallback = callback;
    if (typeof callback == 'string') {
        myCallback = function() { eval(callback); };
    }
    var timerobj = new timeoutObject();
    setTimeout(function () { 
        if (timerobj.flag) { 
        	Ti.API.debug("mySetTimeout callback");
        	myCallback();
        } 
    }, time);
    return timerobj;
}
 
function myClearTimeout(timer) {
    timer.flag = false;
}