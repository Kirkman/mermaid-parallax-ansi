

// Important note: this function will not show circular references.
// So if an instance of an object, etc is repeated, it will show as "null"
function debug(debugSnippet) {
	if (typeof debugSnippet === 'object') {
		var cache = [];
// 		var debugText = JSON.stringify(  debugSnippet  );

		var debugText = JSON.stringify(debugSnippet, function(key, value) {
			if (typeof value === 'object' && value !== null) {
				if (cache.indexOf(value) !== -1) {
					// Circular reference found, discard key
					return;
				}
				// Store value in our collection
				cache.push(value);
			}
			return value;
		}, null, 4);
		cache = null; // Enable garbage collection
	}
	else {
		var debugText = debugSnippet;
	}

	var debugFile = new File( js.exec_dir + '/debug.txt' );
	debugFile.open("a");
	debugFile.write( '\n' + debugText + '\n' );
	debugFile.close();
}


function debugFrame(theFrame) {
	debug( 'debugFrame() function called' );

	if (typeof theFrame !== "undefined") {
		debug( 'typeof frame is NOT undefined' );
		var x, y, xl, yl;
		var grid = '';
		var row = '';
		grid = '\r\n-------------------------';
		// I'm changing this line to use width and height 
		// because of a (hopefully temporary) bug where data_width was way too wide.
//		grid += 'width: ' + theFrame.data_width + ' | height: ' + theFrame.data_height + '\r\n';
		grid += 'width: ' + theFrame.width + ' | height: ' + theFrame.height + '\r\n';
//	 	xl = theFrame.data.length;
		xl = theFrame.width;
		if (theFrame.data_width > 0) {
			for (x=0; x<xl; x++) {
				row = '';
				yl = theFrame.height;
				for (y=0; y<yl; y++) {
					var theChar = theFrame.data[x][y].ch;
					var theAttr = theFrame.data[x][y].attr;
					if (theChar == undefined) {
						theChar = '_';
					}
					if (theAttr == undefined) {
						theAttr = '_';
					}
					row += '|';
					row += ascii(theChar).toString().rjust(3,"0");
					row += ' ';
					row += theAttr.toString().rjust(3,"0");
				}
				row +='|\r\n';
				grid += row;
			}
			debug(grid);
		}
	}
	else {
		debug('Problem debugging frame.');
		debug( theFrame );
	}
}

// convert 1-dimensional array into 2-dimensional array
function listToMatrix(list, elementsPerSubArray) {
    var matrix = [], i, k;

    for (i = 0, k = -1; i < list.length; i++) {
        if (i % elementsPerSubArray === 0) {
            k++;
            matrix[k] = [];
        }

        matrix[k].push(list[i]);
    }

    return matrix;
}

// String repeat
// From: http://snipplr.com/view/699/stringrepeat/
String.prototype.repeat = function( num ) {
	for( var i = 0, buf = ''; i < num; i++ ) buf += this;
	return buf;
}

// Text left justify, right justify, and center
// From: http://snipplr.com/view/709/stringcenter-rjust-ljust/
String.prototype.ljust = function( width, padding ) {
	padding = padding || ' ';
	padding = padding.substr( 0, 1 );
	if ( this.length < width ) {
		return this + padding.repeat( width - this.length );
	}
	else {
		return this;
	}
}
String.prototype.rjust = function( width, padding ) {
	padding = padding || ' ';
	padding = padding.substr( 0, 1 );
	if( this.length < width ) {
		return padding.repeat( width - this.length ) + this;
	}
	else {
		return this;
	}
}
String.prototype.center = function( width, padding ) {
	padding = padding || ' ';
	padding = padding.substr( 0, 1 );
	if( this.length < width ) {
		var len		= width - this.length;
		var remain	= ( len % 2 == 0 ) ? '' : padding;
		var pads	= padding.repeat( parseInt( len / 2 ) );
		return pads + this + pads + remain;
	}
	else {
		return this;
	}
}


// Find an object by key in an array of objects
// http://stackoverflow.com/a/11477986
function objectFindByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
}

// Get distinct values from an array of objects
// http://stackoverflow.com/questions/15125920/how-to-get-distinct-values-from-an-array-of-objects-in-javascript
function uniqueBy(arr, fn) {
  var unique = {};
  var distinct = [];
  arr.forEach(function (x) {
    var key = fn(x);
    if (!unique[key]) {
      distinct.push(key);
      unique[key] = true;
    }
  });
  return distinct;
}


// Sort an array of objects by a key
// Adapted to sort in reverse order
// http://stackoverflow.com/a/8837505/566307
function sortByKey(array, key) {
	return array.sort(function(a, b) {
		var x = a[key]; var y = b[key];
		return ((x > y) ? -1 : ((x < y) ? 1 : 0));
	});
}


function hasDecimal(num) {
	return (num % 1 != 0);
}

function isOdd(num) { return num % 2 == 1; }


// Change date to yyyymmdd format
Date.prototype.yyyymmdd = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
	var dd  = this.getDate().toString();
	return yyyy + (mm[1]?mm:'0'+mm[0]) + (dd[1]?dd:'0'+dd[0]); // padding
};

// Get time string. Adapted from:
// http://stackoverflow.com/questions/10211145/getting-current-date-and-time-in-javascript#comment25142367_10211214
Date.prototype.timeNow = function(){
	return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() + ((this.getHours()>12)?(' p.m.'):' a.m.');
};