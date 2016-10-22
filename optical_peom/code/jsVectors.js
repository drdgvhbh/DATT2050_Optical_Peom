//  Vector3D and Vector adapted from vector.js
//  http://evanw.github.io/lightgl.js/docs/vector.html
//
// Provides a simple vector class. Vector operations can be
// done using member functions, which return new vectors, or static
// functions, which reuse existing vectors to avoid generating garbage.
// Default is a 3D vector. A 2D vector: z coordinate is set to 0.

// set, get
// add — add vectors
// sub — subtract vectors
// mult — scale the vector with multiplication
// div — scale the vector with division
// mag — calculate the magnitude of a vector
// ** setMag - set the magnitude of a vector
// normalize — normalize the vector to a unit length of 1
// * equals - compare two vectors
// dot — the dot product of two vectors
// cross — the cross product of two vectors (only relevant in three dimensions) random2D - make a random 2D vector
// * length - the length of a vector
// dist — the Euclidean distance between two vectors (considered as points)
// angleBetween — find the angle between two vectors
// * rotate3D - rotate a vector on theta and phi
// * unit - divide a vector by its length
// * max —  the max value of a vector
// * min —  the min value of a vector
// limit - limit the magnitude of a vector
// * toAngles - convert to theta and phi
// * toArray - convert to array
// * fromArray - create from an array
// * clone - clone this vectora
// heading2D — the 2D heading of a vector expressed as an angle rotate — rotate a 2D vector by an angle
// * lerp — linear interpolate to another vector


var Vector = (function() {
  function Vector(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }
  
  
  Vector.add = function(v1, v2) {
    var v3 = new Vector();
  		v3.x = v1.x + v2.x;
  		v3.y = v1.y + v2.y;
  		v3.z = v1.z + v2.z;
  		
    return v3;
  };
  
  Vector.sub = function(v1, v2) {
  	var v3 = new Vector();
  		v3.x = v1.x - v2.x;
  		v3.y = v1.y - v2.y;
  		v3.z = v1.z - v2.z;
  		
    return v3;
  };
  
  Vector.mult = function(v1, v2) {
    var v3 = new Vector();
  		v3.x = v1.x * v2.x;
  		v3.y = v1.y * v2.y;
  		v3.z = v1.z * v2.z;
  		
    return v3;
  };
  
  Vector.div = function(v1, v2) {
    var v3 = new Vector();
  		v3.x = v1.x / v2.x;
  		v3.y = v1.y / v2.y;
  		v3.z = v1.z / v2.z;
  		
    return v3;
  };
  
  Vector.dist = function(v1, v2) {
    return v1.dist(v2);
  };
  
  Vector.dot = function(v1, v2) {
    return v1.dot(v2);
  };
  
  Vector.cross = function(v1, v2) {
    return v1.cross(v2);
  };
  
  Vector.angleBetween = function(v1, v2) {
    return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
  };
  
  // Common vector operations for Vector 
  Vector.prototype = {
	set: 
		function(v, y, z) {
		  if (arguments.length === 1) {
			this.set(v.x || v[0] || 0, 
			v.y || v[1] || 0, 
			v.z || v[2] || 0);
		  } else {
			this.x = v;
			this.y = y;
			this.z = z;
		  }
		}, 

	get: 
		function() {
		  return new Vector(this.x, this.y, this.z);
		}, 

	mag: 
		function() {
		  var x = this.x, 
		  y = this.y, 
		  z = this.z;
		  return Math.sqrt(x * x + y * y + z * z);
		}, 

	add: 
		function(v, y, z) {
		  if (arguments.length === 1) {
			this.x += v.x;
			this.y += v.y;
			this.z += v.z;
		  } else {
			this.x += v;
			this.y += y;
			this.z += z;
		  }
		}, 

	sub: 
		function(v, y, z) {
		  if (arguments.length === 1) {
			this.x -= v.x;
			this.y -= v.y;
			this.z -= v.z;
		  } else {
			this.x -= v;
			this.y -= y;
			this.z -= z;
		  }
		}, 

	mult: 
		function(v) {
		  if (typeof v === 'number') {
			this.x *= v;
			this.y *= v;
			this.z *= v;
		  } else {
			this.x *= v.x;
			this.y *= v.y;
			this.z *= v.z;
		  }
		}, 

	div: 
		function(v) {
		  if (typeof v === 'number') {
			this.x /= v;
			this.y /= v;
			this.z /= v;
		  } else {
			this.x /= v.x;
			this.y /= v.y;
			this.z /= v.z;
		  }
		}, 

	dist: 
		function(v) {
		  var dx = this.x - v.x, 
		  dy = this.y - v.y, 
		  dz = this.z - v.z;
		  return Math.sqrt(dx * dx + dy * dy + dz * dz);
		}, 

	dot: 
		function(v, y, z) {
		  if (arguments.length === 1) {
			return (this.x * v.x + this.y * v.y + this.z * v.z);
		  }
		  return (this.x * v + this.y * y + this.z * z);
		}, 

	cross: 
		function(v) {
		  var x = this.x, 
		  y = this.y, 
		  z = this.z;
		  return new Vector(y * v.z - v.y * z, 
		  z * v.x - v.z * x, 
		  x * v.y - v.x * y);
		}, 

	normalize: 
		function() {
		  var m = this.mag();
		  if (m > 0) {
			this.div(m);
		  }
		}, 

	limit: 
		function(high) {
		  if (this.mag() > high) {
			this.normalize();
			this.mult(high);
		  }
		}, 

	heading2D: 
		function() {
		  return (-Math.atan2(-this.y, this.x));
		}, 

	toString: 
		function() {
		  return "[" + this.x + ", " + this.y + ", " + this.z + "]";
		}, 

	array: 
		function() {
		  return [this.x, this.y, this.z];
		}
	};
	  
  function createVectorMethod(method) {
    return function(v1, v2) {
      var v = v1.get();
      v[method](v2);
      return v;
    };
  }
  for (var method in Vector.prototype) {
    if (Vector.prototype.hasOwnProperty(method) && !Vector.hasOwnProperty(method)) {
      Vector[method] = createVectorMethod(method);
    }
  }
  return Vector;
}
());



