include("jsVectors.js");
include("SketchInst.js");

//Controlled by adjusting the position
var AbsSketchInst = (function() {
	function AbsSketchInst( pos, col, radius, type, theta, oRadX, oRadY, speed ) {
		this.position = pos || new Vector();
		this.color = col || new Array( 0., 0., 0. );
		this.baseColor = new Array( col[0], col[1], col[2] );
		this.baseRadius = radius;
		this.radius = this.baseRadius || 0.;
		this.type = type || "circle";
		this.theta = theta || 0.;
		this.oRadiusX = oRadX;
		this.oRadiusY = oRadY;
		this.oProjRadiusX = oRadX;
		this.oProjRadiusY = oRadY;
		this.speed = speed || 1; //Time it takes in seconds to complete one full revolution.
		this.sketchInst = SketchInst.getInstance();
		this.bDraw = true;
	}

	AbsSketchInst.prototype = {
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
		}


	};
	return AbsSketchInst;
})(); 