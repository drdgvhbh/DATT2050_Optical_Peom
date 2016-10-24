include("jsVectors.js");

var SketchInst = ( function() {
	var instance;

	function init() {
		// Private methods and variables
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

