/**
 * @author Caspar Addyman
 * 
 * helper functions forTi.App.boozerlyzer.db.connecting to the yourbrainondrugs.net site
 * 
 */


(function(){
	
	//create an object which will be our public API
	Ti.App.boozerlyzer.comm.ybodnet = {};
	Ti.App.boozerlyzer.comm.ybodnet.username = 'test';
	Ti.App.boozerlyzer.comm.ybodnet.pswdMD5 = 'test';
	
	// our user ID, username, email etc - unique identifier of the submitter
	Ti.App.boozerlyzer.comm.ybodnet.getUserID = function (){
		//TODO make this function do something real!
		//return 'test';
		return Titanium.App.Properties.getInt('UserID');
	};
	
	Ti.App.boozerlyzer.comm.ybodnet.getUUID = function() {
		var ret = Titanium.App.Properties.getString('UUID');
		Ti.API.debug('got UUID ' + ret);
		return ret;
	}
	
	// some kind of magic key that the client-server has previously negotiated to determine authenticity
	Ti.App.boozerlyzer.comm.ybodnet.getAuthToken = function (){
		//TODO make this function do something real!
		//return 'test';
		return Titanium.App.Properties.getString('AuthToken');
	};
	
	// software version of the client
	Ti.App.boozerlyzer.comm.ybodnet.getClientVersion = function (){
		//TODO make this function do something real!
		Ti.API.debug('Ti.App.Version '+ Ti.App.version);
		return Ti.App.version;
	};
	 
	// protocol version to use
	Ti.App.boozerlyzer.comm.ybodnet.getProtocolVersion = function (){
		//TODO make this function do something real!
		return 'test';
	};
	

	//register a new user
	Ti.App.boozerlyzer.comm.ybodnet.register = function (){
      Ti.API.info('Called register in ybodnet.js');
	};
	
	//login
	Ti.App.boozerlyzer.comm.ybodnet.login = function (){
      Ti.API.info('Called login in ybodnet.js');
	};
	
	

}());