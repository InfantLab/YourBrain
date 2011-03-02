function formatDate()
{
	var date = new Date;
	var datestr = date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear();
	if (date.getHours()>=12)
	{
		datestr+=' '+(date.getHours()==12 ? date.getHours() : date.getHours()-12)+':'+date.getMinutes()+' PM';
	}
	else
	{
		datestr+=' '+date.getHours()+':'+date.getMinutes()+' AM';
	}
	return datestr;
}

function pad (x)
{
	if (x < 10)
	{
		return '0' + x;
	}
	return x;
}
function formatTime(timeVal,flag24h)
{
	var date = new Date();
	if (flag24h){
		var h = date.getHours();
		var m = date.getMinutes();
		var s = date.getSeconds();
		return pad(h) + ':' + pad(m) + ':' + pad(s);	
	}else{
		if (date.getHours()>=12)
		{
			return (date.getHours()==12 ? date.getHours() : date.getHours()-12)+':'+date.getMinutes()+' PM';
		}
		else
		{
			return date.getHours()+':'+date.getMinutes()+' AM';
		}
	}	
}
