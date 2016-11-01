include("jsVectors.js");
include("util.js");
include("absSketchInst.js");
include("velSketchInst.js");
include("timers.js");

autowatch = 1;
outlets = 2;

var paused = false; // Is it paused?

var _G = new Global("global");
_G.FPS = 60;
_G.RGB_MAX = 255;
_G.RGB_MIN = 0;
//_G.timerOffset = 0;

var sketch; //Global jit.gl.sketch object

var centerOfMass = new Vector( 0., 0. );

var quantity = {
	"stars" : 5,
	"blue_warriors" : 20,
	"red_warriors" : 20,
	"dancers" : 2
}

//Container for Instances
var instances =  {
	"stars" : new Array(),
	"blue_warriors" : new Array(),
	"red_warriors" : new Array(),
	"hunter_planes" : new Array(),
	"dancers" : new Array()
}

//Settings container
var dicts = {
	"star_settings" : new Dict( "star_settings" ),
	"blue_warriors_settings" : new Dict( "blue_warriors_settings" ),
	"red_warriors_settings" : new Dict( "red_warriors_settings" ),
	"dancers_settings" : new Dict( "dancers_settings" )
}

//Timers
var timers = {
	"global" : new Timers(),
	"violin" : new Timers( 51 ),
	"hunt" : new Timers( 85 ),
	"abolishHunter" : new Timers( 119 ),
	"abolishStar" : new Timers ( 1000 ),
	"abolishWar" : new Timers ( 100 ),
	"gloriousStar" : new Timers( 6000 ),
	"col" : new Timers( 6600 ),
	"finalAbolish" : new Timers( 34 )

}

var colorPallete = {
	"stars" : new Array (
		//217, 201, 28
		new Array(
			0.85098,
			0.78824,
			0.10980
		),
		//240, 199, 19
		new Array(
			0.94117,
			0.78039,
			0.07451
		),
		//226, 240, 19
		new Array(
			0.88627,
			0.94117,
			0.07451
		),
		//229, 169, 18
		new Array(
			0.89804,
			0.66275,
			0.07059
		),
		//144, 230, 18
		new Array(
			0.56471,
			0.90196,
			0.07059
		)
	),
	"blue_warriors" : new Array(
		//51, 189, 223
		new Array(
			0.2,
			0.74118,
			0.87451
		),
		//42, 236, 168
		new Array(
			0.16471,
			0.92549,
			0.65882
		),
		//44, 246, 233
		new Array(
			0.17255,
			0.96471,
			0.91373
		),
		//42, 95, 236
		new Array(
			0.16471,
			0.37255,
			0.92549
		),
		//44, 153, 246
		new Array(
			0.17255,
			0.6,
			0.96471
		)
	),
	"red_warriors" : new Array(
		//140, 11, 57
		new Array(
			0.54902,
			0.04314,
			0.22353
		),
		//163, 5, 140
		new Array(
			0.63926,
			0.01961,
			0.54902
		),
		//163, 12, 5
		new Array(
			0.63926,
			0.04709,
			0.01961
		),
		//153, 33, 4
		new Array(
			0.6,
			0.12941,
			0.01569
		),
		//125, 4, 153
		new Array(
			0.4902,
			0.01569,
			0.6
		)
	),

	"hunter_planes" : new Array(
		//217, 79, 2
		new Array( //Complement
			0.85098,
			0.3098,
			0.0078
		),
		//1, 217, 186
		new Array( //Split Complement			
			0.00392,
			0.85098,
			0.72941
		),
		//1, 32, 217
		new Array( //Split Complement			
			0.00392,
			0.12549,
			0.72941
		)
	),

	"dancers" : new Array (
		//66, 151, 217
		new Array(
			0.25882,
			0.59216,
			0.85098
		),
		//216, 132, 66
		new Array(
			0.84706,
			0.51765,
			0.25882
		)
	)
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
var distanceVel = {
	0.5 : 0.033,
	0.4 : 0.026,
	0.3 : 0.020,
	0.2 : 0.015,
	"else" : 0.011 
}
var baseDistanceVelRatio = 1.0;
var distanceVelRatio = 1.0;
var dancerRatio = new Vector(3.,1.);
var gloriousStarFired = 12.0;
var rotateTheta = 0;
function update() {
	outlet( 0, timers["global"].elapsedSeconds() );
	//Create objects at a timepoint
	checkTime();
	eraseColour();
	//Update Stars
	for ( var i = 0; i < instances["stars"].length; i++ ) {
		var star = instances["stars"][i];
		star.theta = star.theta + util.toRadians( 360 / ( _G.FPS * star.speed ) );
		//post("A: "+star.speed+"\n");
		if ( timers["global"].elapsedTime() < 177000 ) {
			star.position.x = star.oRadiusX * Math.cos(star.theta) + centerOfMass.x;
			star.position.y = star.oRadiusY * Math.sin(star.theta) + centerOfMass.y;
		} else {
			star.position.x = star.oRadiusX 
								* ( Math.cos(star.theta) + Math.cos( 11 * star.theta ) / 2 + Math.sin( 14 * star.theta ) / 3 ) 
								+ centerOfMass.x;
			star.position.y = star.oRadiusY 
					* ( Math.sin(star.theta) + Math.sin( 11 * star.theta ) / 2 + Math.cos( 14 * star.theta ) / 3 ) 
					+ centerOfMass.y;
		}
		if ( (timers["global"].elapsedTime() >= 66000 && timers["global"].elapsedTime() < 80000) ) {
			abolish( instances["stars"], timers["abolishStar"], "stars" );
		}
		if ( timers["global"].elapsedTime() > 212000 ) 	
			abolish( instances["stars"], timers["finalAbolish"], "stars" );
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
				war.velocity.limit(distanceVel[0.5] * distanceVelRatio);
			} else if ( dist > 0.4) {
				war.velocity.limit(distanceVel[0.4] * distanceVelRatio);
			} else if ( dist > 0.3) {
				war.velocity.limit(distanceVel[0.3] * distanceVelRatio);
			} else if ( dist > 0.2) {
				war.velocity.limit(distanceVel[0.2] * distanceVelRatio);
			} else if ( dist < 0.01 ) {
				war.acceleration.limit(0.);
				war.velocity.limit(0.001);
			} else {
				war.acceleration.limit(0.);
				war.velocity.limit(distanceVel["else"] * distanceVelRatio);
			}
			
			war.position.add(war.velocity);
			//war.position = pP;	
			if ( (timers["global"].elapsedTime() >= 66000 && timers["global"].elapsedTime() < 80000) ) {
				abolish( instances[k], timers["abolishWar"], k );
			}
			if ( timers["global"].elapsedTime() > 212000 ) 	
				abolish( instances[k], timers["finalAbolish"], k );
		}
	}

	if ( timers["global"].elapsedTime() > 66000 && timers["global"].elapsedTime() < 70000  ) {
		var counter = 0;
		for ( var k in instances ) {
			if ( instances.hasOwnProperty(k) ) {
				for ( var j = 0; j < instances[k].length; j++ ) {
					if (counter <= 2 && counter >= 0) {
						var inst = instances[k][j];
						inst.bDraw = true;
						if ( inst.radius > inst.baseRadius) {
							inst.radius = inst.radius * 0.99;
						}
					}
				}
			}
			counter++;
		}				
	}


	if ( timers["global"].elapsedTime() > 87500  ) {
		for ( var i = 0; i < instances["hunter_planes"].length; i++ ) {
			var inst = instances["hunter_planes"][i];
			inst.checkBounds();
			inst.position.add(inst.velocity);
			abolish( instances["hunter_planes"], timers["abolishHunter"], "Hunter Planes");
		}
	}

	for ( var i = 0; i < instances["dancers"].length; i++ ) {
		var dancer = instances["dancers"][i];
		if ( i == 0) {
			dancer.theta = dancer.theta + util.toRadians( 360 / ( _G.FPS * dancer.speed ) );
		} else {
			dancer.theta = dancer.theta - util.toRadians( 360 / ( _G.FPS * dancer.speed ) );
		}
		
		//post("A: "+star.speed+"\n");
		dancer.position.x = dancer.oRadiusX * Math.cos(dancer.theta * dancerRatio.x) * _G.screenSize.x;
		dancer.position.y = dancer.oRadiusY * Math.sin(dancer.theta * dancerRatio.y) -0.1;
	}

	if ( timers["global"].elapsedTime() > 177000 ) {
		var iDur = 28000;
		var iDistance = -9;
		var iElapsed = timers["global"].elapsedTime() - 177000;
		var fRatio = iElapsed / iDur;
		var fChange = fRatio * iDistance;
		gloriousStarFired = 12 + fChange;
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
//When to create an object or update it
var timings = {
	"blue_warriors" : new Array( false, 4450. ),
	"red_warriors" : new Array( false, 17400. ), 
	"cool_stars" : new Array( false, 66000. ),
	"death_stars" : new Array( false, 80000. ),
	"vel_hunters" : new Array( false, 87500. ),
	"dancers1" : new Array( false, 104000. ),
	"killDancers1" : new Array( false, 109000.),
	"dancers2" : new Array( false, 113500. ),
	"killDancers2" : new Array( false, 118000. ),
	"dancers3" : new Array( false, 122400. ),
	"killDancers3" : new Array( false, 127000. ),
	"dancers4" : new Array( false, 131000. ),
	"killDancers4" : new Array( false, 135500. ),
	"star_revival" : new Array( false, 139840. ),
	"blue_revival" : new Array( false, 140000. ),
	"red_revival" : new Array( false, 142000. ),
	"voices" : new Array( false, 177000 ),
	"final" : new Array( false, 212000)
}
function checkTime() {
	for ( var k in timings ) {
		if ( timings.hasOwnProperty(k) ) {
			if ( timings[k][0] ) 
				continue;
			if ( timers["global"].elapsedTime() > timings[k][1] ) {
				post( util.getTime() + timings[k][1] + "ms timer reached.\n" );	

				if ( k == "blue_revival") {
					timings[k][0] = true;
					k = "blue_warriors";
				}
				if ( k == "red_revival") {
					timings[k][0] = true;
					k = "red_warriors";
				}
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

				if ( k == "cool_stars") {
					timings[k][0] = true;
					var counter = 0;
					for ( var k in instances ) {
						if ( instances.hasOwnProperty(k) ) {
							for ( var j = 0; j < instances[k].length; j++ ) {
								if (counter <= 2 && counter >= 0) {
									var inst = instances[k][j];
									inst.bDraw = true;
								}
							}
						}
						counter++;
					}
				}
				if ( k == "death_stars" ) {
					centerOfMass = new Vector( 0., 0. );
					timings[k][0] = true;
					for ( var o in instances ) {
						if ( o == "hunter_planes" )
							continue;
						if ( instances.hasOwnProperty(o) ) {
							instances[o] = new Array();
							post( util.getTime() + "All " + o + " instances cleared.\n" );
						}
					}
				}
				if ( k == "vel_hunters" ) {
					timings[k][0] = true;
					for ( var i = 0; i < instances["hunter_planes"].length; i++ ) {
						instances["hunter_planes"][i].velocity = new Vector(0., -0.1);
					}
				}
				if ( k == "dancers1" || k == "dancers2" || k == "dancers3" || k == "dancers4" ) {
					timings[k][0] = true;
					for ( var i = 0; i < quantity["dancers"]; i++ ) {
						var prefix = "settings::" + i + "::";
						var data = getInstSettings( dicts["dancers" + "_settings"], i );
						//post(data[0]+"\n");
						var dancer = new AbsSketchInst( data[0], data[1], data[2], data[3], 1.5 * Math.PI, data[4], data[5], data[6]  );
						instances["dancers"].push( dancer );
						post( util.getTime() + instances["dancers"].length + " total " + "dancers" + " instance(s) instantiated.\n" );						
					}

				}

				if ( k == "killDancers1" || k == "killDancers2" || k == "killDancers3" || k == "killDancers4" ) {
					timings[k][0] = true;
					for ( var i = 0; i < instances["hunter_planes"].length; i++ ) {
						instances["hunter_planes"][i].velocity = new Vector(0., -0.1);
					}
					instances["dancers"] = new Array();
					huntRad = 0.025;
					var mult = parseInt(k.charAt(11));
					dancerRatio = new Vector(3.+ 2. * mult,1.);
				}

				if ( k == "star_revival" ) {
					timings[k][0] = true;
					starTimings = {
						0 : new Array( true, 139840. ),
						1 : new Array( true, 140600. ),
						2 : new Array( true, 141400. ),
						3 : new Array( true, 142200. ),
						4 : new Array( true, 143200. )
					}
				}

				if ( k == "voices" ) {
					timings[k][0] = true;
					centerOfMass.x = 0;
					centerOfMass.y = 0;
					late1 = -1;
					late2 = 1;
					for ( var i = 0; i < instances["stars"].length; i++ ) {
						var star = instances["stars"][i];
						star.speed = 10.0 * ( util.getDistance(star.position, centerOfMass) / radiusToSpeedRatio );
						star.bDraw = true;
						star.baseColor = colorPallete["stars"][0];
					}
					for ( var i = 0; i < instances["blue_warriors"].length; i++ ) {
						var blue = instances["blue_warriors"][i];
						blue.bDraw = true;
						blue.baseColor = colorPallete["blue_warriors"][0];
						blue.type = "framecircle";					}
					for ( var i = 0; i < instances["red_warriors"].length; i++ ) {
						var red = instances["red_warriors"][i];
						red.bDraw = true;
						red.baseColor = colorPallete["red_warriors"][0];
						red.type = "framecircle";
					}
				}

				if ( k == "final" ) {
					timings[k][0] = true;
					for ( var i = 0; i < instances["hunter_planes"].length; i++ ) {
						instances["hunter_planes"][i].velocity = new Vector(0., -0.1);						
					}
					huntRad = 0.001;
					colorPallete["hunter_planes"] = new Array(
						//217, 79, 2
						new Array( //Complement
							0.85098,
							0.3098,
							0.0078
						),
						//1, 217, 186
						new Array( //Split Complement			
							0.00392,
							0.85098,
							0.72941
						),
						//1, 32, 217
						new Array( //Split Complement			
							0.00392,
							0.12549,
							0.72941
						)
					);
				}

			}
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var eraCTimings = {
	0 : new Array( false, 0.0, 35000, 1., 0.5 ),
	1 : new Array( false, 35000., 70000., 0.5, 0.9 ),
	2 : new Array( false, 87500., 104500., 1.0, 0.85 ),
	3 : new Array( false, 104000., 108999., 0.85, 0.15 ),
	4 : new Array( false, 109000., 113499., 0.15, 0.85 ),
	5 : new Array( false, 113500., 117999., 0.85, 0.15 ),
	6 : new Array( false, 118000., 122399., 0.15, 0.85 ),
	7 : new Array( false, 122400., 126999., 0.85, 0.15 ),
	8 : new Array( false, 127000., 130999., 0.15, 0.85 ),
	9 : new Array( false, 131000., 134999., 0.85, 0.15 ),
	10 : new Array( false, 135000., 139840., 0.15, 0.9 ),
	11 : new Array( false, 177000., 210000., 0.9, 0.005 ),
	13 : new Array( false, 212001., 220000., 0.005 , 0.85 )
}

var colorErase = new Array( "erase_color", 0., 0., 0., 1. );
function eraseColour() {
	if ( timers["global"].elapsedSeconds() > 0 ) {
		for ( var k in eraCTimings ) {
			if ( eraCTimings.hasOwnProperty(k) ) {
				if (eraCTimings[k][0] || timers["global"].elapsedTime() < eraCTimings[k][1]) 
					continue;
				if ( timers["global"].elapsedTime() > eraCTimings[k][2] ) {
					eraCTimings[k][0] = true;
					continue;
				}
				var dur = eraCTimings[k][2] - eraCTimings[k][1];
				var distance = eraCTimings[k][4] - eraCTimings[k][3];
				var elapsed = timers["global"].elapsedTime() - eraCTimings[k][1];
				var ratio = elapsed / dur;
				var change = ratio * distance;
				colorErase[4] = eraCTimings[k][3] + change;
				outlet( 1, colorErase );
			}
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
//																		PART 1 AND 2 START
//
// 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ambientExp = 105.0;
var aExpThreshold = 150.0;
var a2ExpThreshold = 125.0;
function ambient( sig ) {
	if ( (timers["global"].elapsedTime()  > 0 && timers["global"].elapsedTime() < 70000)
			|| timers["global"].elapsedTime() > 139840 ) {
		for ( var k in instances ) {
			if ( k == "hunter_planes")
				continue;
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
	if ( (timers["global"].elapsedTime()  > 0 && timers["global"].elapsedTime() < 70000)
			|| timers["global"].elapsedTime() > 139840 ) {
		for ( var k in instances ) {
			if ( instances.hasOwnProperty(k) ) {								
				for ( var j = 0; j < instances[k].length; j++ ) {
					if ( k != "stars") {
						var inst = instances[k][j];				
						//Orbit Control
						var mult = 0.01;
						var rRad = sig * mult;		
					if ( timers["global"].elapsedTime() < 177000 ) {
							inst.oRadiusX = inst.oRadiusX + util.getRandom( rRad * 2, -rRad ) * _G.screenSize.x;
							inst.oRadiusY = inst.oRadiusY + util.getRandom( rRad * 2, -rRad ) * _G.screenSize.y;		
						} else {
							if ( inst.oRadiusX > 0.2 )
								inst.oRadiusX = inst.oRadiusX - util.getRandom( 0.001, 0 ) * _G.screenSize.x;
								if ( inst.oRadiusY > 0.2 )
								inst.oRadiusY = inst.oRadiusY - util.getRandom( 0.001, 0 ) * _G.screenSize.y;	
						}	
					} else {
						var inst = instances[k][j];				
						//Orbit Control for Stars
						var incr = 0.002;
						var mult = 0.15;
						var rRad = sig * mult;
						if ( timers["global"].elapsedTime() < 177000 ) {		
							inst.oProjRadiusX = Math.abs(inst.oProjRadiusX + util.getRandom( rRad * 2, -rRad ) * _G.screenSize.x);
							inst.oProjRadiusY = Math.abs(inst.oProjRadiusY + util.getRandom( rRad * 2, -rRad ) * _G.screenSize.y);
						} else {
							if ( inst.oProjRadiusX > 0.5 * _G.screenSize.x) {
								inst.oProjRadiusX = inst.oProjRadiusX - 0.001;
							} else {
								inst.oProjRadiusX = 0.5 * _G.screenSize.x
							}
							if ( inst.oProjRadiusY > 0.5 * _G.screenSize.y) {
								inst.oProjRadiusY = inst.oProjRadiusY - 0.001;
							} else {
								inst.oProjRadiusY = 0.5 * _G.screenSize.y
							}
						}
						if ( Math.abs(inst.oProjRadiusX) > _G.screenSize.x )
							inst.oProjRadiusX = _G.screenSize.x;	
						if ( Math.abs(inst.oProjRadiusY)  > _G.screenSize.y )
							inst.oProjRadiusY = _G.screenSize.y;
						if ( Math.abs(inst.oRadiusX) < inst.oProjRadiusX  ) {
							inst.oRadiusX = Math.abs(inst.oRadiusX) + incr;
						} else {
							inst.oRadiusX = Math.abs(inst.oRadiusX) - incr;
						}
						if ( Math.abs(inst.oRadiusY) < inst.oProjRadiusY  ) {
							inst.oRadiusY =  Math.abs(inst.oRadiusY) + incr;
						} else {
							inst.oRadiusY =  Math.abs(inst.oRadiusY) - incr;
						}
					}
				}
			}
		}	
	}
}	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var violinOld = 0;
var late1 = 0;
var late2 = 0;
var radCtrlMult = 0.02;
var colorCounter = 5;
var vioKeys = {
	"blue_warriors" : false,
	"red_warriors" : false
};
function violin( sig ) {
	//post("Sig: " + sig + " Diff: " + Math.abs( sig - violinOld ) +"\n");
	if ( (Math.abs( sig - violinOld ) > 0.57) && Math.abs(sig) > 0.4 ) {
		violinOld = sig;
		var absSig = Math.abs(sig);
		var radCtrl = absSig * radCtrlMult;
		if ( (timers["global"].elapsedTime() > 35000 &&  timers["global"].elapsedTime() < 49000) 
				|| (timers["global"].elapsedTime() > 52250 &&  timers["global"].elapsedTime() < 66000 )
				|| timers["global"].elapsedTime() > 139840 ) {
			
			if (timers["violin"].update( new Date() ) ) {
				var counter = 0;
				distanceVelRatio = (baseDistanceVelRatio * absSig * 1.75) + 0.3;
				if ( timers["global"].elapsedTime() < 177000 ) {					
					centerOfMass.y = util.getRandom( absSig, -absSig*0.5 );
				} else {
					centerOfMass.y = 0.
				}
				var randBoolean = (Math.random() >= 0.5);

				if ( randBoolean ) {
					vioKeys["blue_warriors"] = true;
					vioKeys["red_warriors"] = false;
				} else {
					vioKeys["blue_warriors"] = false;
					vioKeys["red_warriors"] = true;
				}

				for ( var k in vioKeys ) {
					if ( vioKeys.hasOwnProperty(k) ) {
						col = colorPallete[k][Math.floor(util.getRandom(colorCounter, 0))];	
						if ( timers["global"].elapsedTime() < 177000 ) {

							for ( var j = 0; j < instances[k].length; j++ ) {
								var inst = instances[k][j];
								if ( vioKeys[k] ) {
									inst.baseColor = col;			
									inst.bDraw = true;
									inst.radius = inst.baseRadius + radCtrl;
									if ( inst.type == "circle" ) {
										inst.type = "framecircle";
									} else {
										inst.type = "circle";
									}
								} 
								else {						
									inst.bDraw = false;
									if ( inst.radius > inst.baseRadius) {
										inst.radius = inst.radius * 0.5;
									}
								}
							}							
						} else {
							if ( timers["col"].update( new Date() ) ) {
								if ( colorCounter > 0 ) {
									colorCounter = colorCounter - 1;
								}
							}
							for ( var j = 0; j < instances[k].length; j++ ) {
								var inst = instances[k][j];
								if ( vioKeys[k] ) {
									inst.baseColor = col;	
									inst.bDraw = true;		
									if ( inst.type == "circle" ) {
										inst.type = "framecircle";
									} else {
										inst.type = "circle";
									}
									inst.radius = inst.baseRadius + radCtrl;
								} 
								else {						
									if ( inst.radius > inst.baseRadius) {
										inst.bDraw = false;
										inst.radius = inst.radius * 0.5;
									}
								}
							}
						}

					}
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
	3 : new Array( true, 26100. ),
	4 : new Array( true, 34000. )
}
function openingStarGen( drum ) {
	if ( timers["global"].elapsedTime() > 35000 && timers["global"].elapsedTime() < 139840  )
		return;
	if ( instances["stars"].length < quantity["stars"] && starTimings[instances["stars"].length][0] 
			&& timers["global"].elapsedTime() > starTimings[instances["stars"].length][1] ) {
		if ( drum > openingStarThreshold ) {

			//Intialize star
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
//
//
//																		PART 1 AND 2 END 
//
// 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
//																		PART 3 + 4START
//
// 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var split = false;
var huntRad = 0.025;
var huntXLimit = 0;
function hunt( sig ) {
	if ( Math.abs(sig) > 0.95 ) {
		if ( (timers["global"].elapsedTime() >= 70000 && timers["global"].elapsedTime() < 87500 ) 
				|| (timers["global"].elapsedTime() > 109000 && timers["global"].elapsedTime() < 113500)
				|| (timers["global"].elapsedTime() > 118000 && timers["global"].elapsedTime() < 122400)
				|| (timers["global"].elapsedTime() > 127000 && timers["global"].elapsedTime() < 131000) 
				|| (timers["global"].elapsedTime() > 135500 && timers["global"].elapsedTime() < 139000)
				|| (timers["global"].elapsedTime() > 212000 && timers["global"].elapsedTime() < 225000 ) ) {
			if (timers["hunt"].update( new Date() ) ) {
				var pX = util.getRandom( huntXLimit * 2, -huntXLimit );
				var pY = util.getRandom( _G.screenSize.y * 2, -_G.screenSize.y );
				var pos = new Vector( pX, pY );
				var col;
				if (!split) {
					col = colorPallete["hunter_planes"][0];
					split = !split;
				} else {
					//post(Math.floor(util.getRandom(2,1))+"\n");
					col = colorPallete["hunter_planes"][Math.floor(util.getRandom(2,1))];
					split = !split;
				}
				
				var radius = huntRad;
				var type = "plane";
				huntRad = huntRad + 0.001;
				if ( huntXLimit < 1. * _G.screenSize.x )
					huntXLimit = huntXLimit + 0.015;
				var plane = new VelSketchInst( pos, col, radius, type, 0, 0, 0 );
				instances["hunter_planes"].push(plane);
				//post(instances["hunter_planes"].length+"\n");
			}
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function greaterHunt( sig ) {
	if ( timers["global"].elapsedTime() > 87500 ) {
		//post(sig+"\n");
		for ( var i = 0; i < instances["hunter_planes"].length; i++ ) {
			var inst = instances["hunter_planes"][i];
			inst.velocity = new Vector(sig*0.8, -0.1);
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function abolish( instArray, timer, name ) {
	if ( timer.update( new Date() ) ) {
		if ( instArray.length > 0 ) {
			instArray.pop();
		} else {
			post( util.getTime() + "All " + name + " cleared.\n" );
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function voice( sig ) {
	if ( timers["global"].elapsedTime() > 177000 ) {
		for ( var i = 0; i < instances["stars"].length; i++ ) {
			var star = instances["stars"][i];
			star.speed = ( gloriousStarFired * 1 - Math.abs(sig) ) * ( util.getDistance(star.position, centerOfMass) / radiusToSpeedRatio );
		}
		/*for ( var i = 1; i < 4; i ++ ) {
			colorErase[i] = Math.abs(sig * 50); 
			if ( colorErase[i] > 1.0 )
				colorErase[i] = 1.0;
			}
		}*/
	}

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
//																		PART 3 + 4 END 
//
// 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
function updateTimer( time ) {
	_G.timerOffset = time;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function setSize( width, height ) {
	_G.screenSize = new Vector( width/height, 1. );
	_G.screenPixelSize = { x : width, y : height };
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
