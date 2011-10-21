/**
 * @author Caspar Addyman
 * 
 * This screen gives user information about the data they are sending to our servers.
 *
 * Copyright yourbrainondrugs.net 2011
 */

(function() {
	
	
    var win = Titanium.UI.currentWindow;  
    var commAlias = Ti.App.boozerlyzer.comm;
      
	var username = Titanium.UI.createTextField({  
	    color:'#336699',  
	    top:10,  
	    left:10,  
	    width:160,  
	    height:40,  
	    hintText:'Username',  
	    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,  
	    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,  
	    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	    value:Ti.App.Properties.getString('username','' )
	});  
	win.add(username);  
	  
	var password = Titanium.UI.createTextField({  
	    color:'#336699',  
	    top:10,  
	    left:180,  
	    width:120,  
	    height:40,  
	    hintText:'Password',  
	    passwordMask:true,  
	    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,  
	    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,  
	    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,  
	    value:Ti.App.Properties.getString('password','' )
	});  
	win.add(password);  
	  
	var loginBtn = Titanium.UI.createButton({  
	    title:'Login',  
	    top:10,  
	    width:90,
	    left:320,  
	    height:35,  
	    borderRadius:1,  
	    font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}  
	});  
	win.add(loginBtn);  
    
    var loginReq = Titanium.Network.createHTTPClient();  
      
    loginBtn.addEventListener('click',function(e)  
    {  
        if (username.value !== '' && password.value !== '')  
        {  
            loginReq.open("POST","http:/boozerlyzer.net/receive/post_auth.php");  
            var params = {  
                username: username.value,  
                password: Ti.Utils.md5HexDigest(password.value)  
            };  
            loginReq.send(params);  
        }  
        else  
        {  
            alert("Username/Password are required");  
        }  
    }); 
    loginReq.onload = function()  
	{  
	    var json = this.responseText;  
	    Ti.API.debug('login post_auth response '+ json);  
	    var response = JSON.parse(json);
	    if (response.logged === true)  
	    {  
	        username.blur();  
	        password.blur();  
	        Ti.App.fireEvent('grantEntrance', {  
	            username:response.username,  
	            email:response.email,
	            UUID:response.UUID  
	        });
			Ti.App.Properties.setBool('Registered', true);
			//Ti.App.Properties.setInt('UserID', response.UserID);
			Ti.App.Properties.setString('UUID', response.UUID);
			Ti.App.Properties.setString('AuthToken', response.AuthToken);
			Ti.App.Properties.setInt('LastSentID', response.LastID);
			alert('Logged in, response was ' + response.toString());
	        alert('Logged in successfully!');
	        //win.close();  
	    }  
	    else  
	    {  
	        alert('Login failed:' + response.message);  
	        //alert('Response was: ' + response.toString());
	    }  
	}; 
    //loginReq.
    
    var labelLastSync = Titanium.UI.createLabel({
		text:'Last sync with server - Never',
		top:60,  
	    left:10,  
	    width:300,  
	    height:40,  
	    borderRadius:2,  
	    font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14} 
    });
    win.add(labelLastSync);
    
    
    var buttonSyncNow = Titanium.UI.createButton({
		title:'Sync Now',
		top:60,  
	    left:320,  
	    width:100,  
	    height:40,  
	    borderRadius:2,  
	    font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}
    });
    buttonSyncNow.addEventListener('click', function(){
		commAlias.sendData.sync();
		var updateTime = Ti.App.boozerlyzer.dateTimeHelpers.prettyDate(Titanium.App.Properties.getInt('LastSentTime', 0));
		labelLastSync.text = 'Last sync with server - ID('+ Titanium.App.Properties.getInt('LastSentID', 0) +') ' +  updateTime;
	});
    win.add(buttonSyncNow);
    
    var checkAutoSync = Titanium.UI.createSwitch({
		titleOn:'Auto Sync On',
		titleOff:'Auto Sync Off',
		value:Titanium.App.Properties.getBool('AutoSync',true),
		top:200,
		left:60,
		height:44,
		width:120
    });
    checkAutoSync.addEventListener('click',function(){
		Titanium.App.Properties.setBool('AutoSync',checkAutoSync.value);
    });
    win.add(checkAutoSync);
    
})();