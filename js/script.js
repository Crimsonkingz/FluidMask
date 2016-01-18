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
var maskImage = new Image();
maskImage.src = "../images/beer.jpg";


// Threshold for alpha cut-off, smaller numbers increase the size of the blobs but also make them "fuzzier"
// ~ 200 is a good value 
var threshold = 200;
var gravity = 9;


var xCiderVel = 0.5;
var yCiderVel = 2;

var xCider = 0;
var yCider = 0;
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
	// this.colour = {red:56, green:164,blue:223};
	this.colour = {red:255, green:255,blue:255};
};

var createParticles = function(n) {
	for (var i = 0; i < n; i++) {
		// Define new x & y positions and velocities, radius
		var xPos = Math.random() * canvas.width,
			yPos = canvas.height,
			xVel = Math.random() * 5 - 2.5,
			yVel = Math.random() * -2,			
			rad = 100;

		// Create a particle with the above values and push to an array	
		var p = new Particle(xPos, yPos, xVel, yVel, rad);
		particlesArray.push(p);
	}
};

var render = function() {
	window.requestAnimFrame(render);
	// Clear temp canvas
	tempCtx.clearRect(0,0,width,height);

	// xCider += xCiderVel;
	yCider += yCiderVel;

	for (var i = 0; i < particlesArray.length; i++) {
		var particle = particlesArray[i];

		particle.velocity.y += gravity/60;

		// Check if particles are going off-screen, if so then put on other side of canvas to give continuous movement
		if (particle.position.x > width) {
			particle.velocity.x *= -0.8;
		}
		if (particle.position.x < 0) {
			particle.velocity.x *= -0.8;
		}
		if (particle.position.y > height) {
			particle.velocity.y *= -0.8;
		}
		if (particle.position.y < 0) {
			particle.velocity.y *= -0.8;
		}
		
		// Moving cider image		
		if (yCider >= 50 || yCider < -50) {
			
			yCiderVel -= 1/60;
		}
		// Update positions based on velocity
		particle.position.x += particle.velocity.x;
		particle.position.y += particle.velocity.y;
	
		tempCtx.globalCompositeOperation = "source-over";
		// Update colour positions on temp canvas
		tempCtx.beginPath();
		var gradient = tempCtx.createRadialGradient(particle.position.x, particle.position.y, 0, particle.position.x, particle.position.y, particle.radius);
		gradient.addColorStop(0, 'rgba(' + particle.colour.red + ',' + particle.colour.green + ', ' + particle.colour.blue + ',1)');
		gradient.addColorStop(1, 'rgba(' + particle.colour.red + ',' + particle.colour.green + ', ' + particle.colour.blue + ',0)');
		tempCtx.fillStyle = gradient;
		tempCtx.arc(particle.position.x, particle.position.y, particle.radius, 0, 2* Math.PI);
		tempCtx.fill();

		//Draw cider
		tempCtx.globalCompositeOperation = "source-in";
		tempCtx.drawImage(maskImage,xCider,yCider, canvas.width, canvas.height);

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
		if (pixels[i+3] < threshold/1.25) {
			pixels[i+3] = 0;
		}
	}
	// Draw final result to the real canvas
	ctx.putImageData(imgData, 0, 0);
};

var init = function() {
	createParticles(50);
	maskImage.onload = function() {
		render();
	};
	

};

init();