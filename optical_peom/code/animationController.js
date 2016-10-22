include("jsVectors.js");
include("util.js");
include("absSketchInst.js");
include("timers.js");

autowatch = 1;

var RGB_MAX = 255;
var RGB_MIN = 0;
var FPS = 60;
var radiusToSpeedRatio = 0.5;

var sketch; //Global jit.gl.sketch object

var screenSize = new Vector( 1.7, 1. );
var screenPixelSize = { x : 1920, y : 1080 };
var centerOfMass = new Vector( 0., 0. );

var quantity = {
	"stars" : 2
}

//Container for Instances
var instances =  {
	"stars" : new Array()
}

//Settings container
var dicts = {
	"star_settings" : new Dict( "star_settings" )
}

//Timers
var timers = {
	"global" : new Timers()
}

var util = Util.getInstance(); //Utility class

setup();

function setup() {
	initSettings();
	sketch = new JitterObject( "jit.gl.sketch", "Stars_And_Warriors" );

	//Intialize stars
	for ( i = 0; i < quantity["stars"]; i++ ) {
		var prefix = "settings::" + i + "::";
		var position = new Vector( 	util.getRandom( 
													parseFloat( dicts["star_settings"].get( prefix + "max_pos_x" ) ) * screenSize.x
														- parseFloat( dicts["star_settings"].get( prefix + "min_pos_x" ) * screenSize.x ), 
													parseFloat( dicts["star_settings"].get( prefix + "min_pos_x" ) ) 
													),
									util.getRandom( 
													parseFloat( dicts["star_settings"].get( prefix + "max_pos_y" ) )
														- parseFloat( dicts["star_settings"].get( prefix + "min_pos_y" ) ), 
													parseFloat( dicts["star_settings"].get( prefix + "min_pos_y" ) ) 
													)
								);
		var color = new Array( 	dicts["star_settings"].get( prefix + "col_r"),  
								dicts["star_settings"].get( prefix + "col_g"), 
								dicts["star_settings"].get( prefix + "col_b")
							);
		var radius = dicts["star_settings"].get( prefix + "radius");
		var type = dicts["star_settings"].get( prefix + "type");
		var theta = util.getTheta( position, centerOfMass );
		var oRadiusX =  util.getDistance(position, centerOfMass);
		var oRadiusY =  oRadiusX * (screenSize.y / screenSize.x);
		var speed = dicts["star_settings"].get( prefix + "speed") * ( util.getDistance(position, centerOfMass) / radiusToSpeedRatio );
		instances["stars"].push( new AbsSketchInst( position, color, radius, type, theta, oRadiusX, oRadiusY, speed ) );

	}
	post( util.getTime() + quantity["stars"] + " star instance(s) instantiated.\n" );

	timers["global"].start();
	post( util.getTime() + "Global Timer started.\n" );

	post( util.getTime() + "Setup complete.\n" );
}

function update() {
	post(timers["global"].elapsedSeconds()+"\n");
	for ( i = 0; i < instances["stars"].length; i++ ) {
		var star = instances.stars[i];
		star.theta = star.theta + util.toRadians( 360 / ( FPS * star.speed ) );
		star.position.x = star.oRadiusX * Math.cos(star.theta);
		star.position.y = star.oRadiusY * Math.sin(star.theta);
	}
}

function draw() {
	for ( var k in instances ) {
		if ( instances.hasOwnProperty(k) ) {
			for ( i = 0; i < instances[k].length; i++ ) {
				sketch.reset();
				sketch.position = instances[k][i].position.array();
				sketch.color = instances[k][i].color;
				instances[k][i].draw( sketch );
				sketch.draw();
			}
		}
	}
}

function reset() {
	sketch.reset();
	this.box.compile();
}

function bang() {
	update();
	draw();
}

function initSettings() {
	for ( var k in dicts ) {
		if ( dicts.hasOwnProperty(k) ) {
			util.importJson( dicts[k], k );
		}
	}
}