function formatDate(dateVal)
{
	var date = new Date(dateVal*1000);
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
function formatTime(timeVal,flagShowMins, flag24h)
{
	var date = new Date(timeVal*1000);
	var h = date.getHours();
	var m = date.getMinutes();
	var mins = '';
	if (flagShowMins){
		mins = ':' + pad(m);
	}
	if (flag24h){
		return pad(h) + mins;	
	}else{
		if (h>=12)
		{
			return (h==12 ? h : h-12)+ mins +' PM';
		}else{
			return h + mins + ' AM';
		}
	}	
}


// creates a 'pretty date' from a unix time stamp
function prettyDate(time){
	var monthname = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	var date = new Date(time*1000),
	diff = (((new Date()).getTime() - date.getTime()) / 1000),
	day_diff = Math.floor(diff / 86400);
	if ( isNaN(day_diff) || day_diff < 0 ){
		return '';
	}
	if(day_diff >= 31){
		var date_year = date.getFullYear();
		if (date_year < 2011){
			return 'Never';
		}
		var month_name = monthname[date.getMonth()];
		var date_month = date.getMonth() + 1;
		if(date_month < 10){
			date_month = "0"+date_month;
		}
		var date_monthday = date.getDate();
		if(date_monthday < 10){
			date_monthday = "0"+date_monthday;
		}
		return date_monthday + " " + month_name + " " + date_year;
	}
	return day_diff == 0 && (
		diff < 60 && "just now" ||
		diff < 120 && "1 min ago" ||
		diff < 3600 && Math.floor( diff / 60 ) + " mins ago" ||
		diff < 7200 && "1 hour ago" ||
		diff < 86400 && "about " + Math.floor( diff / 3600 ) + " hours ago") ||
	day_diff == 1 && "Yesterday" ||
	day_diff < 7 && day_diff + " days ago" ||
	day_diff < 31 && Math.ceil( day_diff / 7 ) + " week" + ((Math.ceil( day_diff / 7 )) == 1 ? "" : "s") + " ago";
}

function formatDay(time){
	var dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat'];
	var date = new Date(time*1000);
	return dayName[date.getDay()];
}

function formatDayPlusTime(time, flag24h){
	return formatDay(time) + ' ' + formatTime(time,true,flag24h);
}

function timeLabel(timeValue, flagShowDay, flagShowMins, flag24h){
	//a function that will return a hour l
	var time = formatTime(timeValue, flagShowMins, flag24h);
	if(flagShowDay){
		time += '\n' + formatDay(time)	
	}
	return time;
}
