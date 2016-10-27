include("jsVectors.js");

var Util = ( function() {
	var instance;

	function init() {
		// Private methods and variables
		return {
			// Public methods and variables

			//Imports a json file to a dictionary
			importJson : function( dDict, sName ) {
				dDict.import_json( sName + ".json" );
			},

			getTime : function() {
				var d = new Date();
				return "[ " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds() + " ] ";
			},

			getRandom : function( range, offset ) {
				return ( Math.random() * range ) + offset;
			},

			getQuadrant : function( x, y ) {
				if ( x > 0 && y >= 0) {
					return 0;
				} else if ( x <= 0 && y > 0) {
					return 1;
				} else if ( x < 0 && y <= 0 ) {
					return 2;
				} else {
					return 3;
				}
			},

			getTheta : function( point, origin ) {
				var hypo = Vector.sub( point, origin ).mag();
				//post(hypo.toString() );
				var opp = Vector.sub(point, new Vector( point.x, origin.y) ).mag();
				var theta = Math.asin(opp / hypo);
				var quad = Util.getInstance().getQuadrant( point.x, point.y );
				/*post("Hypot: " + hypo.toString() + " Oppo: " + opp.toString() + " Theta: " + theta.toString()
					+ " Quad: " + quad + "\n");*/
				if ( quad == 1 ) {
					theta = Math.PI - theta;
				} else if ( quad == 2 ) {
					theta = Math.PI + theta;
				} else if ( quad == 3 ) {
					theta = 2 * Math.PI - theta;
				}
				//post("Inner:" + theta+"\n");
				return theta;
								
			},

			toDegrees : function ( theta ) {
				//post("Theta: " + theta + " Poop: " + theta * 180.0 + "\n"  );
				return (theta * 180.0 / Math.PI);

			},

			toRadians : function ( degrees ) {
				return degrees * Math.PI / 180;
			},

			getDistance : function( p1, p2 ) {
			 	return Vector.sub(p1,p2).mag();
			},

			normalize : function ( value, min, max ) {
				var range = max - min;
				return value / range;
			},

			mutliplyArray : function( multiplier, array ) {
				var a = new Array();
				for ( var i = 0; i < array.length; i++ ) {
					a.push( array[i] * multiplier );
				}
				return a;
			},

			getRandomDictionaryPoint : function( dict, max, min, multiplier ) {
				return instance.getRandom ( parseFloat( dict.get( max ) ) * multiplier - parseFloat( dict.get( min ) * multiplier ), 
								 			parseFloat( dict.get( min ) ) * multiplier
											);
			},

			scale : function ( v, min1, max1, min2, max2 ) {
				var ratio = (v-min1) / (max1-min1);
				return (max2-min2) * ratio + min2;
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

