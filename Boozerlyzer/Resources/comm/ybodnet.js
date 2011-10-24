/**
 * @author Caspar Addyman
 * 
 * helper functions forBoozerlyzer.db.connecting to the yourbrainondrugs.net site
 * 
 */


(function(){
	
	//Note we need to use an alias of comm variable (for some reason that i don't fully understand)
	var commAlias = Boozerlyzer.comm;
	//create an object which will be our public API
	commAlias.ybodnet = {};
	commAlias.ybodnet.username = 'test';
	commAlias.ybodnet.pswdMD5 = 'test';
	
	// our user ID, username, email etc - unique identifier of the submitter
	commAlias.ybodnet.getUserID = function (){
		//TODO make this function do something real!
		//return 'test';
		return Titanium.App.Properties.getInt('UserID');
	};
	
	commAlias.ybodnet.getUUID = function() {
		var ret = Titanium.App.Properties.getString('UUID');
		Ti.API.debug('got UUID ' + ret);
		return ret;
	}
	
	// some kind of magic key that the client-server has previously negotiated to determine authenticity
	commAlias.ybodnet.getAuthToken = function (){
		//TODO make this function do something real!
		//return 'test';
		return Titanium.App.Properties.getString('AuthToken');
	};
	
	// software version of the client
	commAlias.ybodnet.getClientVersion = function (){
		//TODO make this function do something real!
		Ti.API.debug('Ti.App.Version '+ Ti.App.version);
		return Ti.App.version;
	};
	 
	// protocol version to use
	commAlias.ybodnet.getProtocolVersion = function (){
		//TODO make this function do something real!
		return 'test';
	};
	

	//register a new user
	commAlias.ybodnet.register = function (){
      Ti.API.info('Called register in ybodnet.js');
	};
	
	//login
	commAlias.ybodnet.login = function (){
      Ti.API.info('Called login in ybodnet.js');
	};
	
	

}());