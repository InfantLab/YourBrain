/**
 * @author Caspar Addyman
 * 
 * some maths helper functions
 */


//Calculates the mean, standard deviation and variance in an array.			
//+ Carlos R. L. Rodrigues
//@ http://jsfromhell.com/array/average [rev. #1]
exports.average = function(a){
    var r = {mean: 0, variance: 0, deviation: 0}, t = a.length;
    for(var m, s = 0, l = t; l--; s += a[l]);
    for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
    return r.deviation = Math.sqrt(r.variance = s / t), r;
}


exports.sum = function(myArray){
	var len = myArray.length;
	for(var i=0,_sum=0;i<len;_sum+=myArray[i++]);
	return _sum;
}

/***
 * A function that returns n Random Integers 
 * in the range  0 - floor(max),
 * with or without duplicates
 *
 * @param {Object} n
 * @param {Object} max
 * @param {Object} allowDuplicates
 */
exports.nRandomIntegers = function(n,max,allowDuplicates){
	var set = [];
	var mx = Math.floor(max);
	var count = 0;
	while (set.length<n && (count<mx)){
		var candidate = Math.floor(mx*Math.random());
		if (allowDuplicates){
			set.push(candidate);
		}else if (set.indexOf(candidate) < 0){
			set.push(candidate);
			count++;
		}
	}
	return set;
	
}