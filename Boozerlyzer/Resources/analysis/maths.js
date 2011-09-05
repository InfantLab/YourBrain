/**
 * @author Caspar Addyman
 * 
 * some maths helper functions
 */


//Calculates the mean, standard deviation and variance in an array.			
//+ Carlos R. L. Rodrigues
//@ http://jsfromhell.com/array/average [rev. #1]
function average (a){
    var r = {mean: 0, variance: 0, deviation: 0}, t = a.length;
    for(var m, s = 0, l = t; l--; s += a[l]);
    for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
    return r.deviation = Math.sqrt(r.variance = s / t), r;
}

//Sum an array
// http://snippets.dzone.com/posts/show/769
Array.prototype.sum = function(){
	for(var i=0,sum=0;i<this.length;sum+=this[i++]);
	return sum;
}