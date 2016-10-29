var Timers = ( function() {
	function Timers( interval ) {
		this.interval = parseInt(interval) || 0; //in milliseconds	
		this._start = new Date(); 
		this.paused = false; //Is it paused?
		this._pause = new Date(); //When was it paused?
		this._pausedDuration = 0; //How long has it been paused
		this.elapsedOffset = 0; //To account for when the timer is paused.
	}

	Timers.prototype = {
		start : function() {
			var _G = new Global("global");
			this._start = new Date();
			post(_G.timerOffset+"???");
			this._start.setTime( this._start.getTime() - _G.timerOffset );
		},

		update : function ( currentTime ) {
			if ( this.paused ) {
				this._pausedDuration = currentTime.getTime() - this._pause.getTime();
			}
			var diff = currentTime.getTime() - this._start.getTime() - this._pausedDuration;
			if ( diff > this.interval ) {
				this._start.setTime( this._start.getTime() + parseInt(diff) - (parseInt(diff) % this.interval) );
				return true;  
			}
			return false;
		},

		elapsedTime : function() {
			var d = new Date();
			return d.getTime() - this._start.getTime() - this.elapsedOffset;
		},

		elapsedSeconds : function() {
			return this.elapsedTime() / 1000.0;
		},

		pause : function() {
			this.paused = true;
			this._pause = new Date();
			this._pausedDuration = 0;
		},

		resume : function() {
			this.paused = false;
			this.elapsedOffset = this.elapsedOffset + ( new Date().getTime() - this._pause.getTime() );
			this._pausedDuration = 0;
		}

	};

	return Timers;

} )();