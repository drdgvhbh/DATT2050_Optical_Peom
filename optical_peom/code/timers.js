var Timers = ( function() {
	function Timers( interval ) {
		this.interval = parseInt(interval) || 0; //in milliseconds	
		this._start = new Date();
	}

	Timers.prototype = {
		start : function() {
			this._start = new Date();
		},

		update : function ( currentTime ) {
			var diff = currentTime.getTime() - this._start.getTime();
			if ( diff > this.interval ) {
				this._start.setTime( this._start.getTime() + parseInt(diff) * this.interval );
				return true;  
			}
			return false;
		},

		elapsedTime : function() {
			var d = new Date();
			return d.getTime() - this._start.getTime();
		},

		elapsedSeconds : function() {
			return this.elapsedTime() / 1000.0;
		}
	};

	return Timers;

} )();