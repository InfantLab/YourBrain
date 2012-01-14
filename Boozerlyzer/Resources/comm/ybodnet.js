/**
 * @author Caspar Addyman
 * 
 * helper functions forBoozerlyzer.db.connecting to the yourbrainondrugs.net site
 * 
 */


	exports.username = 'test';
	exports.pswdMD5 = 'test';
	
	// our user ID, username, email etc - unique identifier of the submitter
	exports.getUserID = function (){
		//TODO make this function do something real!
		//return 'test';
		return Titanium.App.Properties.getInt('UserID');
	};
	
	exports.getUUID = function() {
		var ret = Titanium.App.Properties.getString('UUID');
		Ti.API.debug('got UUID ' + ret);
		return ret;
	}
	
	// some kind of magic key that the client-server has previously negotiated to determine authenticity
	exports.getAuthToken = function (){
		//TODO make this function do something real!
		//return 'test';
		return Titanium.App.Properties.getString('AuthToken');
	};
	
	// software version of the client
	exports.getClientVersion = function (){
		//TODO make this function do something real!
		Ti.API.debug('Ti.App.Version '+ Ti.App.version);
		return Ti.App.version;
	};
	 
	// protocol version to use
	exports.getProtocolVersion = function (){
		//TODO make this function do something real!
		return 'test';
	};
	

	//register a new user
	exports.register = function (){
      Ti.API.info('Called register in ybodnet.js');
	};
	
	//login
	exports.login = function (){
      Ti.API.info('Called login in ybodnet.js');
	};
	
	