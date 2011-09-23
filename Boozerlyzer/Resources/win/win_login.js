/**
 * @author Caspar Addyman
 * 
 * The data privacy settinhs screen 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {
	
	
    var win = Titanium.UI.currentWindow;  
      
	var username = Titanium.UI.createTextField({  
	    color:'#336699',  
	    top:10,  
	    left:10,  
	    width:300,  
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
	    top:60,  
	    left:10,  
	    width:300,  
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
	    top:110,  
	    width:90,  
	    height:35,  
	    borderRadius:1,  
	    font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}  
	});  
	win.add(loginBtn);  
    
    var loginReq = Titanium.Network.createHTTPClient();  
      
    loginBtn.addEventListener('click',function(e)  
    {  
        if (username.value != '' && password.value != '')  
        {  
            loginReq.open("POST","http://yourbrainondrugs.net/boozerlyzer/post_auth.php");  
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
	    if (response.logged == true)  
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
    
})();