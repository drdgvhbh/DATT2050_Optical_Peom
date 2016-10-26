include("jsVectors.js");

var SketchInst = ( function() {
	var instance;

	function init() {
		// Private methods and variables
		var _G = new Global("global");
		return {
			// Public methods and variables

			//Draws a sketchObject
			draw : function( sketchObj, radius, type ) {
				if (type == "circle") {
					sketchObj.circle( radius );
				} else if ( type == "framecircle" ) {
					sketchObj.framecircle( radius );
				} else if ( type == "sphere" ) {
					sketchObj.sphere( radius );
				}
			},

			getBaseColor : function( baseColor ) {
				var a = new Array();

				for ( var i = 0; i < baseColor.length; i++ ) {
					a.push( baseColor[i] );
				}
				return a;
			},

			checkBounds : function( sketchInst ) {
				if ( Math.abs( sketchInst.position.x ) >= _G.screenSize.x ) {
					var sign = sketchInst.position.x / Math.abs(sketchInst.position.x);
					sketchInst.position.x = _G.screenSize.x * sign * -1.0;
				}
				if ( Math.abs( sketchInst.position.y ) >= _G.screenSize.y ) {
					var sign = sketchInst.position.y / Math.abs(sketchInst.position.y);
					sketchInst.position.y = _G.screenSize.y * sign * -1.0;
				}
			}
		};
	};

	return {
	 	// Get the Singleton instance if one exists or create one if it doesn't
	    getInstance: function () {

	      if ( !instance ) {
	        instance = init();
	      }

	      return instance;
	    }
		
	};

} )();

