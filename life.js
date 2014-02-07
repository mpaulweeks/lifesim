//M. Paul Weeks
//Lab 8

/* functionality i have to employ:

-done?
*/

var game = (function()
{
	var minSize = 3;
	var maxSize = 20;
	var boxSize = 10; // 3-20
	var xlen = 160;
	var ylen = 120; //these three presets are just for peace of mind. they all get overwritten almost immediately
	var webc;
	var headc;
	var bgc;
	var boxc;
	var canvas;
	var ctx;
	var grid;
	var pause;
	var manual;
	var speed;
	var intervalID;
	var drawing;
	var dragging;
	var lines;

	var initfn = function()
	{
		webc = "rgb(167,219,216)";
		headc = "rgb(243,134,48)";
		bgc = "rgb(224,228,204)";
		boxc = "rgb(250,105,0)";
	
		canvas=document.getElementById("canvas");
	  	if(!canvas.getContext){return;}
	  	ctx=canvas.getContext("2d");

		dragging = false;
		toggle_drawing(false);
		manual = true;
		toggle_manual(false);
		lines = false;
		toggle_lines(false);
		boxSize = +jQuery("#sizetext").val();
		resize();
		reset("gun");
		draw();

		// done setting up. now for queries!

		jQuery("#canvas").mouseenter(function (ev) {
			draw();
		});
		jQuery("#canvas").click(function (ev) {
			if(!drawing) {
				toggle_pause();
			} else {
				if(ev.which === 2) {
					var x = ev.pageX;
					var y = ev.pageY;
					fill_square(x,y,false);
				}
				else {
					toggle_drag();
//					toggle_lines(dragging);
				}
				draw();
			}
        });
		jQuery("#canvas").mousemove(function (ev) {
			if(!pause && manual) {
	            update();
				draw();
			} else if(dragging) {
				var x = ev.pageX;
				var y = ev.pageY;
				fill_square(x,y,true);
				draw();
			}
        });
		jQuery("#canvas").mouseleave(function (ev) {
			if(manual) {
				toggle_pause(true);
			}
			if(drawing) {
				toggle_drag(false);
			}
		});
		jQuery("#random").mousedown(function (ev) {
            reset("random",true);
        });
		jQuery("#random").mouseup(function (ev) {
			draw();
        });
		jQuery("#gun").mousedown(function (ev) {
			reset("gun");
			draw();
		});
		jQuery("#acorn").mousedown(function (ev) {
			reset("acorn");
			draw();
		});
		jQuery("#diehard").mousedown(function (ev) {
			reset("diehard");
			draw();
		});
		jQuery("#sizebutton").click(function (ev) {
			var size = +jQuery("#sizetext").val();
			if(size < minSize) {
				size = minSize;
			} else if(size > maxSize) {
				size = maxSize;
			}
			jQuery("#sizetext").val(size);
			resize(size);
			draw();
		});
		jQuery("#control").mousedown(function (ev) {
			toggle_manual();
		});
		jQuery("#state").mousedown(function (ev) {
			toggle_pause();
		});
		jQuery("#showgrid").mousedown(function (ev) {
			toggle_lines();
			draw();
		});
		jQuery(window).resize(function (ev) {
			resize();
//			reset("gun");
			draw();
		});		
		jQuery("#drawflip").mousedown(function (ev) {
			toggle_drawing();
//			draw();
		});
		jQuery("#cleargrid").mousedown(function (ev) {
			reset("empty");
			draw();
		});
	};
	
	function fill_square(x,y,val) {
		var a = Math.floor((x-(window.innerWidth*0.05))/boxSize);
		var b = Math.floor((y-130)/boxSize);
		grid[a][b] = val;
	};
	
	function timed_update() {
//		console.log('fuck');
		if(manual || pause)
			return;
		//else
		update();
		draw();
	};

	function resize()
	{
		toggle_pause(true);

		var oldx = xlen;
		var oldy = ylen;

		if(arguments.length > 0) { //being passed new boxSize
			boxSize = arguments[0];
		}
//		ctx.canvas.width  = Math.floor(window.innerWidth*0.84);
		ctx.canvas.width  = Math.floor(window.innerWidth*0.9);
		ctx.canvas.height = Math.floor(window.innerHeight-(130+25));
		xlen = Math.floor(ctx.canvas.width/boxSize);
		ylen = Math.floor(ctx.canvas.height/boxSize);
		speed = Math.floor(10*50*30/(xlen*ylen));

		var newg = new Array(xlen);
	  	for (var a = 0; a < xlen; a++) {
			newg[a] = new Array(ylen);
			for (var b = 0; b < ylen; b++) {
				newg[a][b] = false;
				if(grid && a < oldx && b < oldy) {
					newg[a][b] = grid[a][b];
				}
			}
	  	}		
		grid = newg;
		
		//setup drawing lines
		toggle_lines(lines);
		ctx.beginPath();
		for (var a = 0; a <= xlen; a++) {
			ctx.moveTo(a*boxSize,0);
			ctx.lineTo(a*boxSize,ylen*boxSize);
		}
		for(var b = 0; b <= ylen; b++) {
			ctx.moveTo(0,b*boxSize);
			ctx.lineTo(xlen*boxSize,b*boxSize);			
		}
	};
	
	function toggle_drag() {
		var old = dragging;
		if(arguments.length > 0) {
			dragging = arguments[0];
		} else {
			dragging = !dragging;
		}
		
		if(dragging) {
			jQuery("#drawhelp").css("background-color","black");
			jQuery("#drawhelp").css("color",bgc);
			jQuery("#drawhelp").css("border","1px dashed "+bgc);
			jQuery("#drawhelp").empty();
			jQuery("#drawhelp").append("<p>move to draw. left click to stop.</p>");
		}
		else {
			jQuery("#drawhelp").css("background-color",bgc);
			jQuery("#drawhelp").css("color","black");
			jQuery("#drawhelp").css("border","1px dashed black");
			jQuery("#drawhelp").empty();
			jQuery("#drawhelp").append("<p>left click in grid to start drawing. right click to erase.</p>");
		}
	};
	
	function toggle_drawing() {
		toggle_pause(true);
		toggle_drag(false);
	
		if(arguments.length > 0) {
			drawing = arguments[0];
		} else {
			drawing = !drawing;
		}
		
		if(drawing) {
			jQuery("#drawflip").empty();
			jQuery("#drawflip").append("<p>Done!</p>");
			jQuery("#cleargrid").show();
			jQuery("#drawhelp").show();
			jQuery("#gun").hide();
			jQuery("#acorn").hide();
			jQuery("#diehard").hide();
			jQuery("#random").hide();
			jQuery("#divider").hide();
//			jQuery("#sizebox").hide();
			jQuery("#control").hide();
			jQuery("#state").hide();
		}
		else {
			jQuery("#drawflip").empty();
			jQuery("#drawflip").append("<p>Draw!</p>");
			jQuery("#cleargrid").hide();
			jQuery("#drawhelp").hide();
			jQuery("#gun").show();
			jQuery("#acorn").show();
			jQuery("#diehard").show();
			jQuery("#random").show();
			jQuery("#divider").show();
//			jQuery("#sizebox").show();
			jQuery("#control").show();
			jQuery("#state").show();
		}
	};

	function toggle_pause()
	{
		if(arguments.length > 0) {
			pause = arguments[0];
		} else {
			pause = !pause;
		}
		if(pause) {
			jQuery("#state").css("background-color","red");
			jQuery("#state").empty();
			jQuery("#state").append("<p>PAUSED</p>");
		} else {
			jQuery("#state").css("background-color","green");
			jQuery("#state").empty();
			if(manual) {
				jQuery("#state").append("<p>SHAKE IT</p>");
			}
			else {
				jQuery("#state").append("<p>RUNNING</p>");
			}
		}
	};		

	function toggle_manual()
	{
		var old = manual;
		if(arguments.length > 0) {
			manual = arguments[0];
		} else {
			manual = !manual;
		}
		
		toggle_pause(true);

		if(manual) {
			jQuery("#control").css("background-color","blue");
			jQuery("#control").empty();
			jQuery("#control").append("<p>MANUAL</p>");
		} else {
			jQuery("#control").css("background-color","purple");
			jQuery("#control").empty();
			jQuery("#control").append("<p>TIMER</p>");
		}
		
		if(old && !manual) {
			intervalID = window.setInterval(timed_update, speed);
		}
		if(!old && manual) {
			window.clearInterval(intervalID);
		}
	};
	
	function toggle_lines()
	{
		var old = lines;
		if(arguments.length > 0) {
			lines = arguments[0];
		} else {
			lines = !lines;
		}
		if(lines) {
			jQuery("#showgrid").css("background-color",bgc);
			jQuery("#showgrid").css("color",headc);

			ctx.strokeStyle=headc;
		} else {
			jQuery("#showgrid").css("background-color",headc);
			jQuery("#showgrid").css("color","white");

			ctx.strokeStyle=bgc;
		}


		
		if(old != lines) {
			draw();
		}
	};	
	
	function reset()
	{
		toggle_pause(true);

		grid = new Array(xlen);
	  	for (var a = 0; a < xlen; a++) {
			grid[a] = new Array(ylen);
			for (var b = 0; b < ylen; b++) {
				grid[a][b] = false;
			}
	  	}
		
		var choice = "random";
		if(arguments.length > 0) {
			choice = arguments[0];
		}
		var rotate = false;
		if(arguments.length > 1) {
			rotate = arguments[1];
		}
		
		// pre-emptive safeguards in case board not big enough for any presets
		
		if(choice === "gun" && (xlen < 37 || ylen < 10))
			choice = "empty";

		if(choice === "empty") {
			//do nothing!
		} else if (choice === "acorn") {
			var mx = Math.floor(xlen/2);
			var my = Math.floor(ylen/2);
			
			grid[mx-2][my] = true;
			grid[mx-1][my] = true;
			grid[mx-1][my-2] = true;
			grid[mx+1][my-1] = true;
			grid[mx+2][my] = true;
			grid[mx+3][my] = true;
			grid[mx+4][my] = true;
		} else if (choice === "diehard") {
			var mx = Math.floor(xlen/2);
			var my = Math.floor(ylen/3);
			
			grid[mx-3][my] = true;
			grid[mx-2][my] = true;
			grid[mx-2][my+1] = true;
			grid[mx+2][my+1] = true;
			grid[mx+3][my-1] = true;
			grid[mx+3][my+1] = true;
			grid[mx+4][my+1] = true;
		} else if(choice === "gun") {
			grid[1][5] = true;
			grid[1][6] = true;
			grid[2][5] = true;
			grid[2][6] = true;
			
			grid[11][5] = true;
			grid[11][6] = true;
			grid[11][7] = true;
			grid[12][4] = true;
			grid[12][8] = true;
			grid[13][3] = true;
			grid[13][9] = true;
			grid[14][3] = true;
			grid[14][9] = true;
			grid[15][6] = true;
			grid[16][4] = true;
			grid[16][8] = true;
			grid[17][5] = true;
			grid[17][6] = true;
			grid[17][7] = true;
			grid[18][6] = true;
			
			grid[21][3] = true;
			grid[21][4] = true;
			grid[21][5] = true;
			grid[22][3] = true;
			grid[22][4] = true;
			grid[22][5] = true;
			grid[23][2] = true;
			grid[23][6] = true;
			grid[25][1] = true;
			grid[25][2] = true;
			grid[25][6] = true;
			grid[25][7] = true;
			
			grid[35][3] = true;
			grid[35][4] = true;
			grid[36][3] = true;
			grid[36][4] = true;
		} else if(choice === "ships") {
			grid[2][1] = true;
			grid[3][2] = true;
			grid[3][3] = true;
			grid[2][3] = true;
			grid[1][3] = true;
			grid[xlen-3][1] = true;
			grid[xlen-4][2] = true;
			grid[xlen-4][3] = true;
			grid[xlen-3][3] = true;
			grid[xlen-2][3] = true;
		} else { //choice = "random"
			var options = 3;
			var model = options*Math.random();
			if(model < 1) {
				var space = 4;
				for (var a = 0; a < xlen/space; a++) {
					a *= space;
					for(var b = 0; b < ylen/space; b++) {
						b *= space;
						grid[a+2][b+1] = true;
						grid[a+3][b+2] = true;
						grid[a+3][b+3] = true;
						grid[a+2][b+3] = true;
						grid[a+1][b+3] = true;
						b /= space;
					}
					a /= space;
				}
			} else if(model < 2) {
				var space = 5;
				for (var a = 0; a < xlen/space; a++) {
					a *= space;
					for(var b = 0; b < ylen/space; b++) {
						b *= space;
						grid[a+2][b+1] = true;
						grid[a+3][b+2] = true;
						grid[a+3][b+3] = true;
						grid[a+2][b+3] = true;
						grid[a+1][b+3] = true;
						b /= space;
					}
					a /= space;
				}
			} else if(model < 3) {
				var space = 6;
				for (var a = 0; a < xlen/space; a++) {
					a *= space;
					for(var b = 0; b < ylen/space; b++) {
						b *= space;
						grid[a+2][b+1] = true;
						grid[a+3][b+2] = true;
						grid[a+3][b+3] = true;
						grid[a+2][b+3] = true;
						grid[a+1][b+3] = true;
						b /= space;
					}
					a /= space;
				}
			}
		}
		
		if(rotate) { //randomly rotate
			var dice = Math.random()*4;
			if(dice >= 1) {
				var newg = new Array(xlen);
				if(dice < 2) {
					for (var a = 0; a < xlen; a++) {
						newg[a] = new Array(ylen);
						for(var b = 0; b < ylen; b++) {
							newg[a][b] = grid[xlen-1-a][ylen-1-b];
						}
					}
				} else if(dice < 3) {
					for (var a = 0; a < xlen; a++) {
						newg[a] = new Array(ylen);
						for(var b = 0; b < ylen; b++) {
							newg[a][b] = grid[a][ylen-1-b];
						}
					}
				} else {
					for (var a = 0; a < xlen; a++) {
						newg[a] = new Array(ylen);
						for(var b = 0; b < ylen; b++) {
							newg[a][b] = grid[xlen-1-a][b];
						}
					}
				}
				grid = newg;
			}
		}
	};

	function draw()
	{
		ctx.fillStyle=bgc;
//		ctx.fillRect(0,0,xlen*boxSize,ylen*boxSize);
		ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
		ctx.fillStyle=boxc;
		for (var a = 0; a < xlen; a++) {
			for(var b = 0; b < ylen; b++) {
//				if(speed > 0 || lines) {
//					ctx.strokeRect(a*boxSize,b*boxSize,boxSize,boxSize);
//				}
				if (grid[a][b]) {
					ctx.fillRect(a*boxSize,b*boxSize,boxSize,boxSize);
				}
			}
		}
		if(speed > 0 || lines) {
			ctx.stroke();
		}
	};

	function update()
	{
		var newg = new Array(xlen);
	  	for (var a = 0; a < xlen; a++) {
			newg[a] = new Array(ylen);
			for (var b = 0; b < ylen; b++) {
				var count = 0;
				for (var aa = a-1; aa <= a+1; aa++) {
					for (var bb = b-1; bb <= b+1; bb++) {
						if (aa >= 0 && aa < xlen && bb >= 0 && bb < ylen && !(aa === a && bb === b)) {
							if (grid[aa][bb]) {
								count++;
							}
						}
					}
				}
				var alive = grid[a][b];
				if(alive && (count < 2 || count > 3)) {
					alive = false;
				} else if(!alive && count === 3) {
					alive = true;
				}
				newg[a][b] = alive;
			}
	  	}

		grid = newg;
	}

	return {
        init: initfn
    };
}());

// register my init function to be fired after the page loads
jQuery(game.init); 
