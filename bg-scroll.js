load("sbbsdefs.js");
load("json-client.js");
load("event-timer.js");
load("frame.js");
load("frame-extensions.js")
load("layout.js");
load("sprite.js");
load("helper-functions.js");

load(js.exec_dir + "frame-transitions.js");


var serverIni;
var players = [];
var player = new Object();
var bgFrame, bgFrame1, bgFrame2, bgFrame3, bgFrame4, msgFrame;
var stepCount = 1;
var places = [];
var bgFrameArray = [];


// COLOR CODES
var lowWhite = 'NW0';
var highWhite = 'HW0';
var lowCyan = 'NC0';
var highCyan = 'HC0';
var highBlack = 'HK0';
var highYellowDarkBlue = 'HY4';
var highWhiteDarkCyan = 'HW6'; 


function main_loop() {
	makeBg();	
	var is_playing = true;
	var time;
	bgFrame.cycle();
	gamePlay();
}




function makeBg() {
	bgFrame = new Frame(1, 1, 80, 24, BG_BLACK);

	bgFrame4 = new Frame(1, 1, 80, 24, undefined, bgFrame);
	bgFrame3 = new Frame(1, 1, 80, 24, undefined, bgFrame);
	bgFrame2 = new Frame(1, 1, 80, 24, undefined, bgFrame);
	bgFrame1 = new Frame(1, 1, 80, 24, undefined, bgFrame);
	msgFrame = new Frame(1, 1, 80, 24, BG_BLACK, bgFrame);

	bgFrame4.load(js.exec_dir + '/graphics/background4.bin', 160, 23);
	bgFrame3.load(js.exec_dir + '/graphics/background3.bin', 160, 23);
	bgFrame2.load(js.exec_dir + '/graphics/background2.bin', 160, 23);
	bgFrame1.load(js.exec_dir + '/graphics/background1.bin', 160, 23);

	// FORMAT: maskFrame( frame, maskChar, maskAttr )
	// ascii(219) = solid block
	maskFrame( bgFrame1, ascii(219), LIGHTRED );
	maskFrame( bgFrame2, ascii(219), LIGHTRED );
	maskFrame( bgFrame3, ascii(219), LIGHTRED );
	maskFrame( bgFrame4, ascii(219), LIGHTRED );

	bgFrame1.h_scroll = true;
	bgFrame1.v_scroll = false;
	bgFrame1.transparent = true;
	bgFrame2.h_scroll = true;
	bgFrame2.v_scroll = false;
	bgFrame2.transparent = true;
	bgFrame3.h_scroll = true;
	bgFrame3.v_scroll = false;
	bgFrame3.transparent = true;
	bgFrame4.h_scroll = true;
	bgFrame4.v_scroll = false;
	bgFrame4.transparent = true;

	bgFrame1.parallaxRatio = 3;
	bgFrame2.parallaxRatio = 2;
	bgFrame3.parallaxRatio = 1;
	bgFrame4.parallaxRatio = 0.5;

	bgFrameArray = [
		bgFrame4,
		bgFrame3,
		bgFrame2,
		bgFrame1
	];

	bgFrame.open();
	for (var b=0; b<bgFrameArray.length; b++) {
		bgFrameArray[b].open();
	}

	msgFrame.gotoxy(0,8);
	msgFrame.center(highBlack + 'BEWARE: This demo will output a lot of ANSI.');
	msgFrame.crlf();
	msgFrame.crlf();
	msgFrame.center(highBlack + 'Use your ' + lowWhite + 'left-' + highBlack + ' and ' + lowWhite + 'right-arrow' + highBlack + ' keys to move the mermaid.');
	msgFrame.crlf();
	msgFrame.center(highBlack + 'You can exit the demo any time by hitting ' + lowWhite + '[ESC]' + highBlack + ' or ' + lowWhite + '[Q]' + highBlack + '.');
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


}



// This is totally not finished yet.

function gamePlay() {
	player.sprite = new Sprite.Profile("mermaid", bgFrame, 18, 8, 'e', 'stand');

	// FORMAT: maskFrame( frame, maskChar, maskAttr )
	// ascii(219) = solid block
	maskFrame( player.sprite.frame, ascii(219), MAGENTA );
	player.sprite.frame.draw();

	var userInput = '';
	while( ascii(userInput) != 27 && ascii(userInput) != 81 ) {
		userInput = console.getkey(K_UPPER | K_NOCRLF);
		//player.sprite.getcmd(userInput);
// 		msgFrame.clear();
// 		msgFrame.close();
// 		msgFrame.open();
//		msgFrame.center('offset  ||  X: ' + bgFrame.offset['x'] + '  Y: ' + bgFrame.offset['y']);
// 		msgFrame.center('lastMove: ' + player.sprite.lastMove + '  Now: ' + system.timer );
// 		msgFrame.crlf();
// 		msgFrame.center('bearing: ' + player.sprite.bearing + '  canMove: ' + player.sprite.canMove() );
		if ( player.sprite.canMove() ) {
			var beginTime = system.timer;
			var direction = 1;
			var amt = 1;
			if ( userInput == KEY_LEFT ) {
				direction = -1;
				if (player.sprite.bearing != 'w') {
					player.sprite.turnTo('w');
					amt = 0;
				}
			}
			else if ( userInput == KEY_RIGHT ) {
				if (player.sprite.bearing != 'e') {
					player.sprite.turnTo('e');
					amt = 0;
				}
			}

			if ( userInput == KEY_LEFT || KEY_RIGHT ) {
				player.sprite.lastMove = system.timer;
				if ( player.sprite.position == 'walk' ) {
					player.sprite.position = 'stand';
					for (var b=0; b<bgFrameArray.length; b++) {
						var totalMove = 0;
						totalMove = amt * direction * bgFrameArray[b].parallaxRatio;
						if (totalMove >= 1 || totalMove <= -1) {
							bgFrameArray[b].scrollCircular(totalMove,0);
						}
					}
				}
				else if ( player.sprite.position == 'stand' ) {
					player.sprite.position = 'walk';
					for (var b=0; b<bgFrameArray.length; b++) {
						var totalMove = 0;
						totalMove = amt * direction * bgFrameArray[b].parallaxRatio;
						bgFrameArray[b].scrollCircular(totalMove,0);
					}
				}
				player.sprite.frame.draw();
			}

			Sprite.cycle();
			var endTime = system.timer;
// 			debug( '--------------------' );
// 			debug( 'BEGIN:' + beginTime );
// 			debug( 'END:' + endTime );
// 			debug( 'POSITION WHEN DRAWN:' + player.sprite.position );
// 			debug( 'TOTAL DRAWING TIME:' +  (endTime-beginTime) );

//			debug('BEGIN DEBUG BGFRAME');
// 			debugFrame(bgFrame);
//			bgFrame.screenShot(js.exec_dir + "frame-layers" + endTime + ".bin", false);
		} // if player.sprite.canMove
	} // end while



} // gamePlay()








// Run the game's main loop until it returns.
main_loop();



		
	







