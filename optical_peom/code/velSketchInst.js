include("jsVectors.js");
include("SketchInst.js");

//Controlled by adjusting the velocity and acceleration
var VelSketchInst = (function() {
	/*theta, oRadX, oRadY, speed*/
	function VelSketchInst( pos, col, radius, type, oRadX, oRadY, speed ) {
		this.position = pos || new Vector();
		this.color = col || new Array( 0., 0., 0. );
		this.baseColor = new Array( col[0], col[1], col[2] );
		this.radius = radius || 0.;
		this.baseRadius = radius;
		this.type = type || "circle";
		this.velocity = new Vector();
		this.oRadiusX = oRadX;
		this.oRadiusY = oRadY;
		this.center = new Vector(); //Rotational Center
		this.speed = speed || 1; //Time it takes in seconds to complete one full revolution.
		this.acceleration = new Vector();
		this.theta = 0;		
		this.sketchInst = SketchInst.getInstance();
		this.bDraw = true;
	}

	VelSketchInst.prototype = {
		draw : function( sketchObj, radius ) {
			if (this.bDraw) {
				if (typeof radius === "undefined" ) {
					this.sketchInst.draw( sketchObj, this.radius, this.type );
				} else {
					this.sketchInst.draw( sketchObj, radius, this.type );
				}
			}
		},

		getBaseColor : function() {
			return this.sketchInst.getBaseColor( this.baseColor );
		},

		checkBounds : function() {
			this.sketchInst.checkBounds( this );
		}

	};
	return VelSketchInst;
})(); 