/**
 * @author Caspar Addyman
 * 
 *  Our blood-alcohol calculation . heavily adapted from this original code
 *  http://celtickane.com/projects/blood-alcohol-content-bac-calculator/
 *  which was based on 
 *  http://www.nhtsa.dot.gov/people/injury/alcohol/bacreport.html
 *  however, we also have height info so we could potentially use a formula using BMI
 *  like these
 *  http://www.highbeam.com/doc/1G1-132050585.html
 */

var minHeightM = 1.4;
var heightStepM = 0.1;
var minHeightFt = 4.5;
var heightStepFt = 0.25;
var minWeightKg = 37.5;
var weightStepKg = 5;
var minWeightLb = 85;
var heightStepLb = 10;
 
/**
 * Blood Alcohol calculation, returns an array of values for each row of doseageData.
 * If personalInfo is unavailable we use an average default value
 * 
 * @param {Object} sessionData
 * @param {Object} doseageData
 * @param {Object} personalInfo
 * @param {Object} nowFlag
 */
function BACalculate(sessionData,doseageData,personalInfo,nowFlag) {
	
	Ti.API.debug('BACCalculate sessionData -' + JSON.stringify(sessionData));
	Ti.API.debug('BACCalculate doseageData -' + JSON.stringify(doseageData));
	Ti.API.debug('BACCalculate personalInfo -' + JSON.stringify(personalInfo));
	
//	var gotValidData = ValidateSessionData(sessionData);
//	if (gotValidData !== true){
//		return {Success:false,Text:gotValidData};	
//	}
	
	var gotValidData = ValidateDoseageData(doseageData);
	if (gotValidData !== true){
		return {Success:false,Text:gotValidData};	
	}
	var metricInfo = ConvertPersonalInfo(personalInfo);
	//Percentage of body which is water for male(1) or female(0)
	var mPercentWater = (metricInfo.sex === 0 ? 0.49 : 0.58);
	var mMetabolicRateAdjust  = 1.0; //nothing implemented to change rate yet
		
	var h;
	var units; 
	var BAC = [];
	Ti.API.debug('BAC - calculate ' + doseageData.length);
	for (var b = 0; b<doseageData.length; b++ ){	
		
		if (nowFlag){
			var now = parseInt((new Date()).getTime()/1000);
			h = (now -sessionData[0].StartTime)/3600;		
		}else{
			h = (doseageData[b].DoseageChanged -sessionData[0].StartTime)/3600;
		}
		units = doseageData[b].HalfPints + doseageData[b].SingleSpirits + doseageData[b].SmallWine;
		
		Ti.API.debug('BAC weight ' + metricInfo.weight);
		Ti.API.debug('BAC mPercentWater ' + mPercentWater);
		Ti.API.debug('BAC units ' + units);
		Ti.API.debug('BAC hours ' + h);
		
		BAC[b] = CalcBAC(metricInfo.weight,mPercentWater,units,mMetabolicRateAdjust, h);
		Ti.API.debug('BAC out '+ BAC[b]);
	}
	return BAC;
//	
//	var mTimeTilDrive = (Math.round( (mBAC - .08) / MetabolicRate * 1000)/1000);
//	var mTimeTilSober = (Math.round(mBAC / MetabolicRate * 10000)/10000);
//	if (mTimeTilDrive < 0) { mTimeTilDrive = 0; }
//	if (mTimeTilSober < 0) { mTimeTilSober = 0; }

//	for (h=0;h<=(mSober+TotalTime);(h=h+1.0)) {
//		var Bac = CalcBAC(Weight,PercentWater,TotalOz,MetabolicRate, h);
//		BacByHour.push([h,Bac]);
//	}
//	BacByHour.push([mSober+TotalTime,0]);
//	
//	var BacDrivingLimit = [[0,0.08],[(mSober+TotalTime),0.08]];
//	
//	var hrLabel = ' hours';
//	if (TotalTime == 1.0) { hrLabel = ' hour'; }
//	
//	var hrLabelDrive = ' hours', hrLabelSober = ' hours';
//	if ((Math.round(mDrive*10)/10) == 1.0) { hrLabelDrive = ' hour'; }
//	if ((Math.round(mSober*10)/10) == 1.0) { hrLabelSober = ' hour'; }
	
}

/**
 * Blood Alcohol calculation that takes numerical inputs and gives numerical answer
 * @param {Object} mBodyWeight
 * @param {Object} mPercentWater
 * @param {Object} mUnitsEtOH
 * @param {Object} mMetabolicRate
 * @param {Object} mTimeInHours
 */
function CalcBAC(mBodyWeightKG, mPercentWater, mUnitsEtOH, mMetabolicRateAdjust, mTimeInHours) {
		//Based on calculations done by http://www.nhtsa.dot.gov/people/injury/alcohol/bacreport.html
		// NHTSA (1994): BAC = (A x 0.806)/(W x TBW x 1000) x 100 - ([[beta].sub.60] x t)
		//	 TBW = 0.58 for men, 0.49 for females
		// BAC = blood alcohol concentration in g/dl, 
		// [[beta].sub.60] = the metabolism rate of alcohol per hour (e.g., 0.017 g/dl)
		// t = time in hours since the first sip of alcohol to the time of assessment, 
		// A = total volume (in ml) of drinks consumed multiplied by the percent of alcohol 
		// of the drink multiplied by the density of alcohol (0.79 g/ ml) divided by 10, 
		// W = weight of participant in kg, H = height in meters, y = the age of the participant in years, h = height measured in cm.
	

		//I'm following their math by each letter -- if you're confused by a step, check out the website and go to the letter for more information
		var cGramsPerUnitEtOH = 7.9; //A constant: 1unit = 10mls  * 0.79 g/ml = 7.9 grams/unit
		//A) Body weight should be in kilos 
		//B) Find total body water
		var mBodyWaterML = mBodyWeightKG * mPercentWater * 1000;	//Men have a higher water content than women
		//D) Find alcohol per mL of water
		var mConcEtOHinWater = cGramsPerUnitEtOH * mUnitsEtOH / mBodyWaterML;
		//E) Find alcohol per mL of blood
		var mConcEtOHinBlood = mConcEtOHinWater * .806; //Blood is 80.6% water
		//F) Convert mConcEtOHinBlood from g/mL to g/100 mL (gram percent)
		var mGramPercentEtOHinBlood = mConcEtOHinBlood * 100;
		//Note: mGramPercentEtOHinBlood is the BAC with instant consumption, absorption, and distribution
		//G) G was taken care of back in D with the variable mUnitsEtOH
		//H) Calculate BAC after time span
		var mStandardMetabolicRate = 0.017  
		var mBAC = mGramPercentEtOHinBlood - (mMetabolicRateAdjust * mStandardMetabolicRate * mTimeInHours);
		if(mBAC < 0) { mBAC = 0; }
		return mBAC;
}

function ValidateDoseageData(doseageData){
	//TODO check that the doseageData object has the values we expect
	return true;
}

function ConvertPersonalInfo(personalInfo, defaultSexFlag){
	try{ //try to convert the values from the personalInfo table into actual height, weight, age
		var sex = personalInfo.gender;		
		var approxDOB = new Date(('15/' + personalInfo.BirthMonth + '/' + personalInfo.BirthYear));					
		var now = new Date();
		var ageinms = now - approxDOB;
		var age = (ageinms / 1000 ) / 31557600;

		var height_m = 0;
		if (personalInfo.HeightUnits === 0){
			Height_m = minHeight + personalInfo.Height * heightStepM;
		} else {
			//convert from feet to metres
			Height_m = 0.3048*(minHeight + personalInfo.Height * heightStepFt);	
		}
		var weightinKG = 0;
		if (personalInfo.WeightUnits === 0){
			weightinKG  = minWeight + personalInfo.Weight * weightStepKg;	
		} else {
			weightinKG  = 0.4536 * (minWeight + personalInfo.Weight * weightStepKg);				
		}
		return ({
			success:true,
			height_m: heightinM,
			sex: sex,
			weight_kg: weightinKG,
			age:age
		});
	} catch (error) {
		//if it goes wrong return some defaults (from wikipedia)
		if (defaultSexFlag === 0) {
			return ({
				success:false,
				height: 1.64,
				sex: 0,
				weight: 66.7,
				age:30
			});
		}else{
			return ({
				success:false,
				height:1.776,
				sex:1,
				weight:80,
				age:30
			});
		}
	}
}
