/*
	Metaballs with help from:
	http://www.somethinghitme.com/2012/06/06/2d-metaballs-with-canvas/
*/


var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Temporary canvas used to allow thresholding of alpha values to control "blobbyness"
var tempCanvas = document.createElement("canvas");
var tempCtx = tempCanvas.getContext("2d");

var width = canvas.width,
	height = canvas.height;

tempCanvas.width = width;
tempCanvas.height = height;

var particlesArray = [];

// Threshold for alpha cut-off, smaller numbers increase the size of the blobs but also make them "fuzzier"
// ~ 200 is a good value 
var threshold = 200;

// shim layer with setTimeout fallback - Paul Irish
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var Particle = function(x, y, vx, vy, radius) {
	this.position = {x: x, y: y};
	this.velocity = {x: vx, y: vy};
	this.radius = radius;

	// Rainbow blobs
	// this.colour = {red:Math.floor(255*Math.random()), green:Math.floor(255*Math.random()),blue:Math.floor(255*Math.random())};

	// Sea blue blobs
	this.colour = {red:56, green:164,blue:223};
};

var createParticles = function(n) {
	for (var i = 0; i < n; i++) {
		// Define new x & y positions and velocities, radius
		var xPos = Math.random() * canvas.width,
			yPos = Math.random() * canvas.height,
			xVel = Math.random() * 4 - 2,
			yVel = Math.random() * 4 - 2,
			rad = Math.floor(Math.random() * 30) + 30;

		// Create a particle with the above values and push to an array	
		var p = new Particle(xPos, yPos, xVel, yVel, rad);
		particlesArray.push(p);
	}
};

var render = function() {
	window.requestAnimFrame(render);
	// Clear temp canvas
	tempCtx.clearRect(0,0,width,height);

	for (var i = 0; i < particlesArray.length; i++) {
		var particle = particlesArray[i];

		// Update positions based on velocity
		particle.position.x += particle.velocity.x;
		particle.position.y += particle.velocity.y;

		// Check if particles are going off-screen, if so then put on other side of canvas to give continuous movement
		if (particle.position.x > width + particle.radius) {
			particle.position.x = 0 - particle.radius;
		}
		if (particle.position.x < 0 - particle.radius) {
			particle.position.x = width + particle.radius;
		}
		if (particle.position.y > height + particle.radius) {
			particle.position.y = 0 - particle.radius;
		}
		if (particle.position.y < 0 - particle.radius) {
			particle.position.y = height + particle.radius;
		}


		// Update colour positions on temp canvas
		tempCtx.beginPath();
		var gradient = tempCtx.createRadialGradient(particle.position.x, particle.position.y, 0, particle.position.x, particle.position.y, particle.radius);
		gradient.addColorStop(0, 'rgba(' + particle.colour.red + ',' + particle.colour.green + ', ' + particle.colour.blue + ',1)');
		gradient.addColorStop(1, 'rgba(' + particle.colour.red + ',' + particle.colour.green + ', ' + particle.colour.blue + ',0)');
		tempCtx.fillStyle = gradient;
		tempCtx.arc(particle.position.x, particle.position.y, particle.radius, 0, 2* Math.PI);
		tempCtx.fill();
	}
	// Send to function that takes pixel data and implements alpha cut-off - then draws to the main canvas
	metaballDraw();

};


var metaballDraw = function() {
	// Get pixel data of temporary canvas, this allows us to check the alpha values
	var imgData = tempCtx.getImageData(0,0,width,height);
	var pixels = imgData.data;

	//The pixel data is given in r,g,b,a form
	// So to check the alpha value we must look at the n*4th pixel
	for (var i = 0; i < pixels.length; i += 4) {
		if (pixels[i+3] < threshold) {
			pixels[i+3] = 0;
		}
	}
	// Draw final result to the real canvas
	ctx.putImageData(imgData, 0, 0);
};

var init = function() {
	createParticles(50);
	render();

};

init();