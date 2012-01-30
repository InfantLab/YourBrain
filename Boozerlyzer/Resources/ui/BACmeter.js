/***
 * use RGraph and a Webview to display the current blood alcohol level.
 */

var webView ;
exports.createView = function(){
 	webView = Ti.UI.createWebView({
			height:'auto',
			width:'auto',
			url:'/charts/chartBACmeter.html',
			zIndex:9,
			backgroundColor:'transparent'
		});

	//listen for errors from webView
	webView.addEventListener("error", function(e){
	    Ti.API.log("Error: " + e.message);
		//do something
		alert('Charting error ' + e.message);
	});
	
	//as an alternative to call back use this 
	webView.addEventListener('load', function(e) {
		// code that fires AFTER webview has loaded
	    exports.plotNewBAClevel(0);
	 });
	 return webView;
};

exports.plotNewBAClevel = function(level){
	 	webView.evalJS("paintLineChart('" + level + "')");
};