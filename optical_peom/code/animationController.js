include("jsVectors.js");
include("util.js");
include("absSketchInst.js");

autowatch = 1;

var sketch; //Global jit.gl.sketch object

var screenSize = new Vector( 1.7, 1. );
var screenPixelSize = { x : 1920, y : 1080 };

//How many of each object?
var instances =  {
	"stars" : new Array()
}

//Settings container
var dicts = {
	"star_settings" : new Dict( "star_settings" )
}

var util = Util.getInstance(); //Utility class

setup();

function setup() {
	initSettings();
	sketch = new JitterObject( "jit.gl.sketch", "Stars_And_Warriors" );
	
	for ( i = 0; i < dicts["star_settings"].getsize("settings"); i++ ) {
		var prefix = "settings::" + i + "::";
		var position = new Vector( dicts["star_settings"].get( prefix + "pos_x"), dicts["star_settings"].get( prefix + "pos_y") );
		var color = new Array( 	dicts["star_settings"].get( prefix + "col_r"),  
								dicts["star_settings"].get( prefix + "col_g"), 
								dicts["star_settings"].get( prefix + "col_b")
							);
		var radius = dicts["star_settings"].get( prefix + "radius");
		var type = dicts["star_settings"].get( prefix + "type");
		instances["stars"].push( new AbsSketchInst( position, color, radius, type ) );
	}
	post( util.getTime() + "Setup complete.\n" );

}

function update() {

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