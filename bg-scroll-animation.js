load("sbbsdefs.js");
load("frame.js");
load("frame-extensions.js")
load("sprite.js");
load("helper-functions.js");
load("frame-extensions.js"); // Josh's extra frame stuff, eg: .scrollCircular() method
load(js.exec_dir + "frame-transitions.js");

// GLOBAL FRAME VARIABLES
var player = new Object();
var bgFrame, bgFrame1, bgFrame2, bgFrame3, bgFrame4, fgFrame;
var bgFrameArray = [];
var canvasFrame;

// COLOR CODES
var lowWhite = 'NW0';
var highWhite = 'HW0';
var lowCyan = 'NC0';
var highCyan = 'HC0';
var highBlack = 'HK0';
var highYellowDarkBlue = 'HY4';
var highWhiteDarkCyan = 'HW6';


// Compare a canvas frame against data in another frame. Repaint characters that are different.
function repaintCanvas( newFrame, canvas ) {
	var newFrameData = newFrame.dump();
	for (var x=0; x<canvas.width; x++) {
		for (var y=0; y<canvas.height; y++) {
			var newChar = newFrameData[y][x];
			var oldChar = canvas.getData(x,y);
			// Compare corresponding characters on current canvas and the new frame.
			// If they are different, repaint the character on the canvas.
			if ( newChar && (newChar.attr !== oldChar.attr || newChar.ch !== oldChar.ch) ) {
				canvas.clearData(x,y);
				canvas.setData(x,y,newChar.ch,newChar.attr);
			}
			// If the new frame has a null instead of a character object,
			// treat that like an empty black space. Draw it on the canvas
			// if the corresponding character is not also an empty black space.
			else if ( newChar == null ) {
				if ( oldChar.ch != ascii(32) || oldChar.attr != BG_BLACK ) {
					canvas.clearData(x,y);
					canvas.setData(x,y,ascii(32),BG_BLACK);
				}
			}
		}
	}
}

function joshSprite( frame, path ) {
	if ( frame !== undefined ) {
		this.frame = frame;
	}
	if ( path !== undefined ) {
		this.path = path;
	}
	else {
		this.path = [];
	}
	this.index = 0;
	this.isInMemory = true;
}

joshSprite.prototype = {
	setPath: function( p ) {
		this.path = p;
	},
	getPath: function() {
		return this.path;
	},
	getPathLength: function() {
		return this.path.length;
	},
	getIndex: function() {
		return this.index;
	},
	getPoint: function() {
		if ( this.index < this.path.length ) {
			return this.path[ this.index ].point;
		}
		return false;
	},
	getX: function() {
		if ( this.index < this.path.length ) {
			return this.path[ this.index ].point[0];
		}
		return false;
	},
	getY: function() {
		if ( this.index < this.path.length ) {
			return this.path[ this.index ].point[1];
		}
		return false;
	},
	increment: function(amt) {
		if ( amt === undefined ) {
			amt = 1;
		}
		this.index += amt;
	},
	decrement: function(amt) {
		if ( amt === undefined ) {
			amt = 1;
		}
		this.index -= amt;
	},
	changeBearing: function(n) {
		var spriteHeight = this.frame.height;
		this.frame.scrollTo(0 , n*spriteHeight );
	},
	changePosition: function(n) {
		var spriteWidth = this.frame.width;
		this.frame.scrollTo(n*spriteWidth, 0 );
	},
	isOnStage: function() {
		var screen_rows = console.screen_rows;
		var screen_cols = console.screen_columns;
		var sprite_x = this.getX();
		var sprite_y = this.getY();
		var sprite_w = this.frame.width;
		var sprite_h = this.frame.height;

		if (
			// Not outside left border
			( sprite_x + sprite_w ) > 0 &&
			// Not outside right border
			sprite_x <= screen_cols &&
			// Not outside top border
			( sprite_y + sprite_h ) > 0 &&
			// Not outside bottom border
			sprite_y <= screen_rows
		) {
			return true;
		}
		return false;
	},
	move: function() {
		// Get current point on animation path
		if ( this.getPoint() ) {
			if ( this.isOnStage() ) {
				this.frame.moveTo( this.getX(), this.getY() );
				if (!this.frame.is_open) {
					//this.frame.draw();
					this.frame.open();
				}
			}
			else {
				if (this.frame.is_open) {
					this.frame.close();
				}
			}
			this.increment();
		}
	}
}


function makeBg() {
	bgFrame = new Frame(1, 1, 80, 24, BG_BLACK);

	bgFrame4 = new Frame(1, 1, 80, 24, undefined, bgFrame);
	bgFrame3 = new Frame(1, 1, 80, 24, undefined, bgFrame);
	bgFrame2 = new Frame(1, 1, 80, 24, undefined, bgFrame);
	bgFrame1 = new Frame(1, 1, 80, 24, undefined, bgFrame);
	fgFrame  = new Frame(1, 1, 80, 24, BG_BLACK, bgFrame);
	msgFrame = new Frame(1, 1, 80, 24, BG_BLACK, bgFrame);

	bgFrame4.load(js.exec_dir + '/graphics/background4.bin', 160, 23);
	bgFrame3.load(js.exec_dir + '/graphics/background3.bin', 160, 23);
	bgFrame2.load(js.exec_dir + '/graphics/background2.bin', 160, 23);
	bgFrame1.load(js.exec_dir + '/graphics/background1.bin', 160, 23);
	fgFrame.load(js.exec_dir + '/graphics/title1.bin', 80, 24);

	// player.sprite = new Sprite.Profile("mermaid", bgFrame, 18, 8, 'e', 'stand');
	
	player.sprite = new joshSprite( new Frame(18, 8, 49, 9, undefined, bgFrame) );
	player.sprite.frame.load(js.exec_dir + '/sprites/mermaid.bin');

	// Mermaid sprite has several states
	player.sprite.tailUp = function() {
		this.changePosition(0);
	}
	player.sprite.tailDown = function() {
		this.changePosition(1);
	}
	player.sprite.turnRight = function() {
		this.changeBearing(0);
	}
	player.sprite.turnLeft = function() {
		this.changeBearing(1);
	}

	player.sprite.frame.checkbounds = false;
	// For changing states, we need hscroll but not vscroll
	player.sprite.frame.h_scroll = true;
	player.sprite.frame.v_scroll = false;
	player.sprite.frame.transparent = true;

	bgFrameArray = [
		bgFrame4,
		bgFrame3,
		bgFrame2,
		bgFrame1
	];

	// Mask each frame and set the same properties
	for (var b=0; b<bgFrameArray.length; b++) {
		// FORMAT: maskFrame( frame, maskChar, maskAttr )
		// ascii(219) = solid block
		maskFrame( bgFrameArray[b], ascii(219), LIGHTRED );
		bgFrameArray[b].h_scroll = true;
		bgFrameArray[b].v_scroll = false;
		bgFrameArray[b].transparent = true;
	}
	maskFrame( player.sprite.frame, ascii(219), MAGENTA );

	// assign parallax ratio for each layer
	bgFrame1.parallaxRatio = 3;
	bgFrame2.parallaxRatio = 2;
	bgFrame3.parallaxRatio = 1;
	bgFrame4.parallaxRatio = 0.5;

	// open all background layers
	bgFrame.open();
	for (var b=0; b<bgFrameArray.length; b++) {
		bgFrameArray[b].open();
	}

	// player.sprite.frame.open();
	// player.sprite.frame.draw();

	fgFrame.transparent = true;
	fgFrame.top();
	fgFrame.open();

	msgFrame.gotoxy(0,8);
	msgFrame.center(highBlack + 'This demo will output a lot of ANSI.');
	msgFrame.crlf();
	msgFrame.center(highBlack + 'It usually takes about ' + lowWhite + '1-2 minutes' + highBlack + ' to display.');
	msgFrame.crlf();
	msgFrame.center(highBlack + 'A few seconds after the demo finishes, you will be returned to the BBS.');
	msgFrame.crlf();
	msgFrame.crlf();
	msgFrame.center(highBlack + 'Note: Latency issues may cause the demo to become garbled.');
	msgFrame.crlf();
	msgFrame.center(highBlack + 'If you experience this, you may want to try the "user-controlled" demo instead.');
	msgFrame.crlf();
	msgFrame.crlf();
	msgFrame.center(lowWhite + 'HIT ' + highWhite + '[ENTER]' + lowWhite + ' TO BEGIN THE DEMO.');

	msgFrame.top();
	msgFrame.draw();
	msgFrame.open();

	var userInput;
	while ( ascii(userInput) != 13 ) {
		userInput = console.getkey(K_UPPER | K_NOCRLF);
		// do nothing;
	}
	msgFrame.close();
	msgFrame.delete();

	// The Canvas frame will sit atop all the others. We will manually paint this frame with the data
	// from bgFrame.dump(). Using a canvas with manual repaint is faster than plain bgFrame.cycle();
	canvasFrame = new Frame(1, 1, 80, 24, BG_BLACK);
	canvasFrame.transparent = false;
	canvasFrame.draw();

}





function play() {
	var userInput = '';
	var beat = 1;
	var xl = fgFrame.width;
	var yl = fgFrame.height;
	var x = xl-1;
	var y = 0;
	var p = 0;
	// screenshot counter
	var ss = 0;
	// screenshot switch. Change this to false to disable.
	var screenShot = false;
	// main animation
	var fr = 0;
	var numFrames = 192;
	var pixelArray = [];
	// Best wipeSizes are evenly divisible into 80: 1, 2, 4, 5, 8, 10
	var wipeSize = 6; 
	var wipeGradientStep = parseInt( (yl-2) / wipeSize );
	var wipeFrLen = parseInt( xl / wipeSize );
	// opening title screen
	var numTitleFrames = 16;
	// end credits screen
	var creditsFr = 0;
	var numCreditsFrames = 8;

	// ==========================================
	// MERMAID ANIMATION (with wipe intro/outtro)
	// ==========================================

	for ( fr=0; fr<numFrames; fr++ ) {
		// Record what time we began the loop 
		var beginFrameDraw = system.timer;

		// reset beat counter if necessary
		if (beat > 4) {
			beat = 1;
		}

		var direction = 1;
		var amt = 1;

		// - - - - - - - - - - - - - - - - - - - - -
		// TITLE SCREEN ANIMATION
		// - - - - - - - - - - - - - - - - - - - - -

		if ( fr < numTitleFrames ) {
			fgFrame.load(js.exec_dir + '/graphics/title' + beat + '.bin', 80, 24);
			fgFrame.draw();
			if (screenShot) {
				var ss_padded = ('000'+ss.toString()).slice(-3);
				bgFrame.screenShot(js.exec_dir + "/screenshots/mermaid-" + ss_padded + ".bin", false);
				ss++;
			}
		}

		// - - - - - - - - - - - - - - - - - - - - -
		// ANIMATE THE SPRITE
		// - - - - - - - - - - - - - - - - - - - - -

		if ( fr >= numTitleFrames ) {
			// On first two beats, should be in TAILUP position
			if (beat == 1 || beat == 2 ) {
				player.sprite.tailUp();
				// Iterate over all background layers and scroll them
				for (var b=0; b<bgFrameArray.length; b++) {
					var totalMove = 0;
					// Calculate how far this background layer should scroll
					totalMove = amt * direction * bgFrameArray[b].parallaxRatio;
					// Ensure layers with fractional ratios only scroll every other beat
					if ( (totalMove >= 1) || (beat == 1) ) {
						bgFrameArray[b].scrollCircular(totalMove,0);
					}
				}
			}

			// On first two beats, should be in TAILDOWN position
			else if (beat == 3 || beat == 4 ) {
				player.sprite.tailDown();
				// Iterate over all background layers and scroll them
				for (var b=0; b<bgFrameArray.length; b++) {
					var totalMove = 0;
					// Calculate how far this background layer should scroll
					totalMove = amt * direction * bgFrameArray[b].parallaxRatio;
					// Ensure layers with fractional ratios only scroll every other beat
					if ( (totalMove >= 1) || (beat == 3) ) {
						bgFrameArray[b].scrollCircular(totalMove,0);
					}
				}
			}
		}

		// - - - - - - - - - - - - - - - - - - - - -
		// ANIMATE THE WIPE
		// - - - - - - - - - - - - - - - - - - - - -

		if ( (fr > numTitleFrames) && (fr < (numTitleFrames + wipeFrLen)) ) {
			// A wipe is a slow painting (or erasing) across the screen, 
			// with the trailing edge consisting of gradient, wipeSize cols wide. 
			// Each column in the gradient will paint successively fewer characters.

			fgFrame.load(js.exec_dir + '/graphics/title' + beat + '.bin', 80, 24);

			// Clear out the columns from the LAST wipe gradient. 
			if ( x < ( xl - (wipeSize) ) ) {
				var cleanupSize = xl-x;
				for (var oldx=xl-cleanupSize; oldx<xl; oldx++) {
					for (y=0; y<yl; y++) {
						fgFrame.clearData(oldx,y);
					}
				}
			}
			// Generate the new wipe gradient.
			for (p=0;p<(wipeSize); p++) {
				pixelArray[p] = [];
				for (y=0; y<yl; y++) {
					pixelArray[p].push(y);
				}
				//debug( '----------------'  );
				//debug( 'p: ' + p + ' | x: ' + x  );
				while( pixelArray[p].length > ( (wipeGradientStep * p) + 2 ) ) {
					//debug( 'pixelArray: ' + pixelArray );
					//debug( 'pixelArray[p]: ' + pixelArray[p] );
					var randomIndex = Math.floor(Math.random() * pixelArray[p].length);
					var randomPixel = pixelArray[p].splice(randomIndex, 1);
					//debug( 'randomIndex: ' + randomIndex + ' | randomPixel: ' + randomPixel  );
					fgFrame.clearData(x-p,randomPixel);
				}
			}
			x = x - (wipeSize);
		}
		// Clear fgFrame after first wipe, and reset X coordinate
 		else if (fr == (numTitleFrames + wipeFrLen) ) {
			fgFrame.clear();
			// reset the wipe x coordinate, to be reused on end wipe.
			x=xl-1;
		}
		// Clear screen completely after end wipe
 		if ( fr == numFrames-1 ) {
			fgFrame.delete();
			fgFrame  = new Frame(1, 1, 80, 24, BG_BLACK, bgFrame);
			fgFrame.open();
		}
		// End wipe
		else if (fr >= (numFrames - wipeFrLen) - 1 ) {
// 	  		debug( 'Final wipe. Frame:' + fr + ' | x:' + x );
// 	  		debug( 'xl:' + xl + ' | x:' + x );

			// A wipe is a slow painting across the screen, with the trailing
			// edge consisting of gradient of (wipeSize) columns. 
			// Each column will have successively fewer characters.
			
			// Clear out the columns from the LAST wipe gradient. 
			if ( x < ( xl - (wipeSize) ) ) {
				var cleanupSize = wipeSize;
				for (c = 0; c<cleanupSize; c++) {
					var oldx = (x + cleanupSize) - c;
					for (y=0; y<yl; y++) {
						fgFrame.setData(oldx,y,ascii(214),BLACK);
					}
				}
			}
			// Generate the new wipe gradient.
			for (p=0;p<(wipeSize); p++) {
				pixelArray[p] = [];
				for (y=0; y<yl; y++) {
					pixelArray[p].push(y);
				}
				while( pixelArray[p].length > ( (wipeGradientStep * p) + 2 ) ) {
					var randomIndex = Math.floor(Math.random() * pixelArray[p].length);
					var randomPixel = pixelArray[p].splice(randomIndex, 1);
					// ascii(219) = solid block; 5 = Magenta
					fgFrame.setData(x-p,randomPixel,ascii(214),BLACK);
				}
			}
			x = x - (wipeSize);
		}

		// - - - - - - - - - - - - - - - - - - - - -
		// RENDER EVERYTHING TO SCREEN
		// - - - - - - - - - - - - - - - - - - - - -

		// player.sprite.frame.draw();
		// Sprite.cycle();
		// fgFrame.top();
		// fgFrame.refresh();
		// fgFrame.draw();
		// fgFrame.cycle();
		repaintCanvas( bgFrame, canvasFrame );
		canvasFrame.cycle();

// 		if (beat == 1) { mswait(500); }

		// Record what time we finished drawing
		var endFrameDraw = system.timer;

		// increment beat counter
		beat++;
		if (screenShot) {
			var ss_padded = ('000'+ss.toString()).slice(-3);
			bgFrame.screenShot(js.exec_dir + "/screenshots/mermaid-" + ss_padded + ".bin", false);
			ss++;
		}
//  		debug( 'Frame:' + fr );
//  		debug( 'Position:' + player.sprite.position );
//  		debug( 'Drawing time: ' + ( endFrameDraw - beginFrameDraw ) );

	} // end for loop


	// ============================
	// END CREDITS SCREEN ANIMATION
	// ============================

	for (creditsFr=0; creditsFr<numCreditsFrames; creditsFr++) {
		fgFrame.load(js.exec_dir + '/graphics/credits' + (creditsFr + 1) + '.bin', 80, 24);
		fgFrame.draw();
		if (screenShot) {
			var ss_padded = ('000'+ss.toString()).slice(-3);
			bgFrame.screenShot(js.exec_dir + "/screenshots/mermaid-" + ss_padded + ".bin", false);
			ss++;
		}
		mswait(200);
	}

	mswait(3000);
// 	while ( ascii(userInput) != 13 ) {
// 		userInput = console.getkey(K_UPPER | K_NOCRLF);
// 	}

} // play()


function cleanup() {
	var allFrames = [
		bgFrame,
		bgFrame1,
		bgFrame2,
		bgFrame3,
		bgFrame4,
		player.sprite.frame,
		fgFrame,
		canvasFrame
	];

	for (var af=0; af < allFrames.length; af++ ) {
 		allFrames[af].close();
	 	allFrames[af].delete();
	}
}



function main_loop() {
	makeBg();	
	bgFrame.cycle();
	play();
	cleanup();
	exit();
}



// Run the animation
main_loop();


