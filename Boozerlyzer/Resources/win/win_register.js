/**
 * @author Caspar Addyman
 * 
 * The data privacy settinhs screen 
 * 
 * Copyright yourbrainondrugs.net 2011
 * But based on demo code by Ronnie Swietek
 *
 * http://mobile.tutsplus.com/tutorials/appcelerator/titanium-user-authentication-part-1/
 */

exports.createApplicationWindow =function(){
	var win = Titanium.UI.createWindow({
		title:'YBOB Boozerlyzer',
		backgroundImage:'/images/smallcornercup.png',
		modal:true,
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
	});	  
    var mLaunchType = win.launchType;
    var helpMessage = "Please register with Boozerlyzer.net.\nAll data are held securely and anonymously.";
	//include the menu choices	
	// Ti.include('/ui/menu.js');
	// var menu = menus;
	var menu = require('/ui/menu');
	//need to give it specific help for this screen
	menu.setHelpMessage(helpMessage);
	
    /* 
    * Interface 
    */  
    var scrollView = Titanium.UI.createScrollView({  
        contentWidth:'auto',  
        contentHeight:'auto',  
        top:0,  
        showVerticalScrollIndicator:true,  
        showHorizontalScrollIndicator:false  
    });  
    win.add(scrollView);  
      
    var username = Titanium.UI.createTextField({  
        color:'#336699',  
        top:5,  
        width:300,  
        height:40,  
        hintText:'Username',  
        keyboardType:Titanium.UI.KEYBOARD_DEFAULT,  
        returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,  
        borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED  
    });  
    scrollView.add(username);  
      
    var password1 = Titanium.UI.createTextField({  
        color:'#336699',  
        top:50,  
        width:300,  
        height:40,  
        hintText:'Password',  
        passwordMask:true,  
        keyboardType:Titanium.UI.KEYBOARD_DEFAULT,  
        returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,  
        borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED  
    });  
    scrollView.add(password1);  
      
    var password2 = Titanium.UI.createTextField({  
        color:'#336699',  
        top:95,  
        width:300,  
        height:40,  
        hintText:'Password Again',  
        passwordMask:true,  
        keyboardType:Titanium.UI.KEYBOARD_DEFAULT,  
        returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,  
        borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED  
    });  
    scrollView.add(password2);  
      
      
    var email = Titanium.UI.createTextField({  
        color:'#336699',  
        top:140,  
        width:300,  
        height:40,  
        hintText:'email',  
        keyboardType:Titanium.UI.KEYBOARD_DEFAULT,  
        returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,  
        borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED  
    });  
    scrollView.add(email);  
      
    var createBtn = Titanium.UI.createButton({  
        title:'Create Account',  
        top:195,  
        width:130,  
        height:35,  
        borderRadius:1,  
        font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}  
    });  
    scrollView.add(createBtn);  
    
        var testresults;  
      
    function checkemail(emailAddress)  
    {  
        var str = emailAddress;  
        var filter = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;  
        if (filter.test(str))  
        {  
            testresults = true;  
        }  
        else  
        {  
            testresults = false;  
        }  
        return (testresults);  
    } 
      
    var createReq = Titanium.Network.createHTTPClient();  
    createReq.onload = function(){  
		Ti.API.debug("Registration request loaded.");
		var json = this.responseText;  
	    Ti.API.debug('login post_auth response '+ json);  
	    var response = JSON.parse(json);
	    if (response.success)   { //probably succeeded :-) 
			Ti.App.Properties.setString('username',username.value );
			Ti.App.Properties.setString('password',password1.value );
			Ti.App.Properties.setString('email',email.value );
			Ti.App.Properties.setString('UUID', response.UUID);
			Ti.App.Properties.setString('AuthToken', response.AuthToken);
			Ti.App.Properties.setInt('LastSentID', response.LastID);
			Ti.App.Properties.setBool('Registered', true);
            var alertDialog = Titanium.UI.createAlertDialog({  
                title: 'Registration complete',  
                message: response.message,  
                buttonNames: ['OK']  
            });
            alertDialog.addEventListener('click',function(e)  
            {  
                Boozerlyzer.winHome.open();
                win.close(); 
            });    
            alertDialog.show();  
        } else        {  
            createBtn.enabled = true;  
            createBtn.opacity = 1;  
			alert(response.message);  
        }  

    };
      
    createBtn.addEventListener('click',function(e)  
    {  
        if (username.value != '' && password1.value != '' && password2.value != '' && email.value != '')  
        {  
            if (password1.value != password2.value)  
            {  
                alert("Your passwords do not match");  
            }  
            else  
            {  
                if (!checkemail(email.value))  
                {  
                    alert("Please enter a valid email");  
                }  
                else  
                {  
                    createBtn.enabled = false;  
	                createBtn.opacity = 0.3;  
	                createReq.open("POST","http://boozerlyzer.net/receive/post_register.php");  
	                var params = {  
	                    username: username.value,  
	                    password: Ti.Utils.md5HexDigest(password1.value),  
	                    email: email.value  
	                };  
	                createReq.send(params);  
                }  
            }  
        }  
        else  
        {  
            alert("All fields are required");  
        }  
    });    
	if (mLaunchType==="Welcome"){
		alert(helpMessage);
	}  
    
	return win;
};
