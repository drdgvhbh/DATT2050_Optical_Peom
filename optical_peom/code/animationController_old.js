include("jsVectors.js");
include("util.js");
include("absSketchInst.js");
include("velSketchInst.js");
include("timers.js");

autowatch = 1;

var paused = false; // Is it paused?

var _G = new Global("global");
_G.screenSize = new Vector( 1.7, 1. );
_G.screenPixelSize = { x : 1920, y : 1080 };
_G.FPS = 60;
_G.RGB_MAX = 255;
_G.RGB_MIN = 0;

var sketch; //Global jit.gl.sketch object

var centerOfMass = new Vector( 0., 0. );

var quantity = {
	"stars" : 4,
	"blue_warriors" : 20,
	"red_warriors" : 20
}

//Container for Instances
var instances =  {
	"stars" : new Array(),
	"blue_warriors" : new Array(),
	"red_warriors" : new Array(),
}

//Settings container
var dicts = {
	"star_settings" : new Dict( "star_settings" ),
	"blue_warriors_settings" : new Dict( "blue_warriors_settings" ),
	"red_warriors_settings" : new Dict( "red_warriors_settings" )
}

//Timers
var timers = {
	"global" : new Timers()
}

var util = Util.getInstance(); //Utility class


setup();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var radiusToSpeedRatio = 0.5;

function setup() {
	initSettings();
	sketch = new JitterObject( "jit.gl.sketch", "Stars_And_Warriors" );

	/*
	//Intialize stars
	for ( var i = 0; i < quantity["stars"]; i++ ) {
		var prefix = "settings::" + i + "::";
		var data = getInstSettings( dicts["star_settings"], i );
		var theta = util.getTheta( data[0], centerOfMass );
		var oRadiusX =  util.getDistance(data[0], centerOfMass);
		var oRadiusY =  oRadiusX * (_G.screenSize.y / _G.screenSize.x);
		var speed = dicts["star_settings"].get( prefix + "speed") * ( util.getDistance(data[0], centerOfMass) / radiusToSpeedRatio );
		instances["stars"].push( new AbsSketchInst( data[0], data[1], data[2], data[3], theta, oRadiusX, oRadiusY, speed ) );

	}
	post( util.getTime() + quantity["stars"] + " star instance(s) instantiated.\n" );
	*/
	

	timers["global"].start();
	post( util.getTime() + "Global Timer started.\n" );

	post( util.getTime() + "Setup complete.\n" );
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function update() {
	outlet( 0, timers["global"].elapsedSeconds() );
	//Create objects at a timepoint
	checkTime();
	//Update Stars
	for ( var i = 0; i < instances["stars"].length; i++ ) {
		var star = instances["stars"][i];
		star.theta = star.theta + util.toRadians( 360 / ( _G.FPS * star.speed ) );
		//post("A: "+star.speed+"\n");
		star.position.x = star.oRadiusX * Math.cos(star.theta);
		star.position.y = star.oRadiusY * Math.sin(star.theta);

	}
	//Update Blue and Red Warriors
	for ( var j = 0; j < 2; j++ ) {
		var k = "";
		if ( j == 0 ) {
			k = "blue_warriors";
		} else {
			k = "red_warriors";
		}
		for ( var i = 0; i < instances[k].length; i++ ) {
			var war  = instances[k][i];
			//Check Bounds
			war.checkBounds();
			//Curent Projected Position
			var cPP = new Vector();
			cPP.x = war.oRadiusX * Math.cos(war.theta) + war.center.x;
			cPP.y = war.oRadiusY * Math.sin(war.theta) + war.center.y;
			var prefix = "settings::" + i + "::";
			war.speed = dicts[k + "_settings"].get( prefix + "speed") * ( util.getDistance( cPP, war.center) / radiusToSpeedRatio );
			war.theta = war.theta + util.toRadians( 360 / ( _G.FPS * war.speed ) );
			//Projected Position
			var pP = new Vector();
			pP.x = war.oRadiusX * Math.cos(war.theta) + war.center.x;
			pP.y = war.oRadiusY * Math.sin(war.theta) + war.center.y;
			//Get Direction 
			var mag = war.acceleration.mag() + 0.0001;
			var dir = Vector.sub(pP, war.position );
			var dist = dir.mag();
			dir.normalize();
			dir.mult(mag);
			//dir.limit(0.001);
			war.acceleration = dir;
			war.velocity.add(war.acceleration);
			if ( dist > 0.5 ) {
				war.velocity.limit(0.033);
			} else if ( dist > 0.4) {
				war.velocity.limit(0.026);
			} else if ( dist > 0.3) {
				war.velocity.limit(0.020);
			} else if ( dist > 0.2) {
				war.velocity.limit(0.015);
			} else if ( dist < 0.01 ) {
				war.acceleration.limit(0.);
				war.velocity.limit(0.001);
			} else {
				war.acceleration.limit(0.);
				war.velocity.limit(0.011);
			}
			
			war.position.add(war.velocity);
			//war.position = pP;		
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function draw() {
	for ( var k in instances ) {
		if ( instances.hasOwnProperty(k) ) {
			for ( var i = 0; i < instances[k].length; i++ ) {
				sketch.reset();
				sketch.position = instances[k][i].position.array();
				sketch.color = instances[k][i].color;
				instances[k][i].draw( sketch );
				sketch.draw();
			}
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ambientExp = 105.0;
var aExpThreshold = 150.0;
var a2ExpThreshold = 125.0;
function ambient( sig ) {
	if ( timers["global"].elapsedSeconds() > 0 ) {
		for ( var k in instances ) {
			if ( instances.hasOwnProperty(k) ) {
				for ( var j = 0; j < instances[k].length; j++ ) {
					var inst = instances[k][j];					
					//Color Control
					var ratio = sig * Math.pow(1 + sig, ambientExp );
					for ( c = 0; c < inst.color.length; c++ ) {
						inst.color[c] = inst.getBaseColor()[c] * ratio;					
					}
					if ( inst.color[0] > 1.0 || inst.color[1] > 1.0 || inst.color[2] > 1.0 )
						inst.color = inst.getBaseColor();
					if ( ambientExp < aExpThreshold && timers["global"].elapsedSeconds() < 17.5 ) {
						ambientExp = ambientExp + 0.0128;
					} else if ( ambientExp > a2ExpThreshold && timers["global"].elapsedSeconds() > 17.5 && timers["global"].elapsedSeconds() < 25. ) {
						ambientExp = ambientExp - 0.19;
					}
			
				}
			}
		}	
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function orbit( sig ) {
	if ( timers["global"].elapsedSeconds() > 0 ) {
		for ( var k in instances ) {
			if ( instances.hasOwnProperty(k) ) {
				if ( k == "stars")
					continue;
				for ( var j = 0; j < instances[k].length; j++ ) {
					var inst = instances[k][j];				
					//Orbit Control
					var mult = 0.01;
					var rRad = sig * mult;	
					//post(rRad+"\n");				
					inst.oRadiusX = inst.oRadiusX + util.getRandom( rRad * 2, -rRad ) * _G.screenSize.x;
					inst.oRadiusY = inst.oRadiusY + util.getRandom( rRad * 2, -rRad ) * _G.screenSize.y;
					if ( k == "stars" && inst.oRadiusX > _G.screenSize.x )
						inst.oRadiusX = _G.screenSize.x;	
					if ( k == "stars" && inst.oRadiusY > _G.screenSize.y )
						inst.oRadiusY = _G.screenSize.y;
				}
			}
		}	
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//When to create an object or update it
var timings = {
	"blue_warriors" : new Array( false, 4450.0 ),
	"red_warriors" : new Array( false, 17400.0 ) 
}
function checkTime() {
	for ( var k in timings ) {
		if ( timings.hasOwnProperty(k) ) {
			if ( timings[k][0] ) 
				continue;
			if ( timers["global"].elapsedTime() > timings[k][1] ) {
				post( util.getTime() + timings[k][1] + "ms timer reached.\n" );	
				//Blue Warriors
				if ( k == "blue_warriors" || k == "red_warriors" ) {
					timings[k][0] = true;
					for ( var i = 0; i < quantity[k]; i++ ) {
						var prefix = "settings::" + i + "::";
						var data = getInstSettings( dicts[k + "_settings"], i );
						var war = new VelSketchInst( data[0], data[1], data[2], data[3], data[4], data[5], data[6] );
						war.center = instances["stars"][Math.floor( util.getRandom( instances["stars"].length, 0 ) )].position;
						war.theta = util.getTheta( war.position , war.center );
						instances[k].push( war );						
					}
					post( util.getTime() + instances[k].length + " total " + k + " instance(s) instantiated.\n" );
				}

			}
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///Slowly increases radius of each star based on the "drum" beat
var openingStarInterval = 0;
var openingStarThreshold = 0.011;
/*var starTimings = {
	0 : new Array( true, 0. ),
	1 : new Array( true, 4450. ),
	2 : new Array( true, 8800. ),
	3 : new Array( true, 13000. ),
	4 : new Array( true, 17400. ),
	5 : new Array( true, 26100. ),
	6 : new Array( true, 35000. )
}*/

var starTimings = {
	0 : new Array( true, 0. ),
	1 : new Array( true, 8800. ),
	2 : new Array( true, 13000. ),
	3 : new Array( true, 26100. )
}
function openingStarGen( drum ) {
	if ( instances["stars"].length < quantity["stars"] && starTimings[instances["stars"].length][0] 
			&& timers["global"].elapsedTime() > starTimings[instances["stars"].length][1] ) {
		if ( drum > openingStarThreshold ) {

			//Intialize star
			post( instances["stars"].length+", "+quantity["stars"] +"\n" );
			if ( instances["stars"].length < quantity["stars"] ) {
				//post("hey\n");
				var i = instances["stars"].length;
				var prefix = "settings::" + i + "::";
				var data = getInstSettings( dicts["star_settings"], i );
				var theta = util.getTheta( data[0], centerOfMass );
				var oRadiusX =  util.getDistance(data[0], centerOfMass);
				var oRadiusY =  oRadiusX * (_G.screenSize.y / _G.screenSize.x);
				var speed = dicts["star_settings"].get( prefix + "speed") * ( util.getDistance(data[0], centerOfMass) / radiusToSpeedRatio );
				starTimings[instances["stars"].length][0] = false;
				instances["stars"].push( new AbsSketchInst( data[0], data[1], data[2], data[3], theta, oRadiusX, oRadiusY, speed ) );
				post( util.getTime() + instances["stars"].length + " total star instance(s) instantiated.\n" );				

				for ( var i = 0; i < instances["blue_warriors"].length; i++ ) {
					var war = instances["blue_warriors"][i];
					war.center = instances["stars"][Math.floor( util.getRandom( instances["stars"].length, 0 ) )].position;				
				}

				for ( var i = 0; i < instances["red_warriors"].length; i++ ) {
					var war = instances["red_warriors"][i];
					war.center = instances["stars"][Math.floor( util.getRandom( instances["stars"].length, 0 ) )].position;				
				}
			}
		}
	}

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function getInstSettings( dict, iteration ) {
	var prefix = "settings::" + iteration + "::";
	// Position, Color 
	var a = new Array( 	new Vector( util.getRandomDictionaryPoint( dict, prefix + "max_pos_x", prefix + "min_pos_x", _G.screenSize.x  ),
									util.getRandomDictionaryPoint( dict, prefix + "max_pos_y", prefix + "min_pos_y", _G.screenSize.y  )
									),
						new Array(	dict.get( prefix + "col_r" ),
									dict.get( prefix + "col_g" ),
									dict.get( prefix + "col_b" )
									),
						dict.get( prefix + "radius" ),
						dict.get( prefix + "type")						
 						);
	if ( typeof dict.get( prefix + "oRadiusX" ) !== "undefined" )
		a.push( dict.get( prefix + "oRadiusX" ) );
	if ( typeof dict.get( prefix + "oRadiusY" ) !== "undefined" )
		a.push( dict.get( prefix + "oRadiusY" ) );
	if ( typeof dict.get( prefix + "speed" ) !== "undefined" )
		a.push( dict.get( prefix + "speed" ) );
	return a;

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function reset() {
	sketch.reset();
	this.box.compile();
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function bang() {
	if (!paused) {
		update();
	}
	draw();
	
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function initSettings() {
	for ( var k in dicts ) {
		if ( dicts.hasOwnProperty(k) ) {
			util.importJson( dicts[k], k );
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function pause() {
	if (paused == true) 
		return;
	paused = true;
	for ( var k in timers ) {
		if ( timers.hasOwnProperty(k) ) {
			timers[k].pause();
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function resume() {
	if (paused == false) 
		return;
	paused = false;
	for ( var k in timers ) {
		if ( timers.hasOwnProperty(k) ) {
			timers[k].resume();
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
