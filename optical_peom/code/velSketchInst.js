include("jsVectors.js");
include("SketchInst.js");

//Controlled by adjusting the velocity and acceleration
var VelSketchInst = (function() {
	function VelSketchInst( pos, col, radius, type, theta, oRadX, oRadY, speed ) {
		this.position = pos || new Vector();
		this.color = col || new Array( 0., 0., 0. );
		this.baseColor = new Array( col[0], col[1], col[2] );
		this.radius = radius || 0.;
		this.type = type || "circle";
		this.theta = theta || 0.;
		this.oRadiusX = oRadX;
		this.oRadiusY = oRadY;
		this.speed = speed || 1; //Time it takes in seconds to complete one full revolution.
		this.sketchInst = SketchInst.getInstance();
	}

	VelSketchInst.prototype = {
		draw : function( sketchObj, radius ) {
			if (typeof radius === "undefined" ) {
				this.sketchInst.draw( sketchObj, this.radius, this.type );
			} else {
				this.sketchInst.draw( sketchObj, radius, this.type );
			}
		},

		getBaseColor : function() {
			return this.sketchInst.getBaseColor( this.baseColor );
		}


	};
	return AbsSketchInst;
})(); 