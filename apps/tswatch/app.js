// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
require("Teletext5x9Ascii").add(Graphics);
require("5x9Numeric7Seg").add(Graphics);

// position on screen
const X = 173, Y = 100;
var secondsString = "  ";

function draw() {
  // work out how to display the current time
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  var day = d.getDate();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var dow = weekDays[d.getDay()];
  var month = months[d.getMonth()];
  var seconds = d.getSeconds();
  var time = (" "+h).substr(-2) + ":" + m.toString().padStart(2,0);
  // Reset the state of the graphics library
  g.reset();
  
  /* draw frame corners */
  var fcr = 12;
  var fx1 = 2;
  var fy1 = 26;
  var fx2 = 174;
  var fy2 = 150;
  g.drawCircleAA(fx1+fcr, fy1+fcr, fcr);
  g.clearRect(fx1+fcr,fy1,fx1+(fcr*2),fy1+(fcr*2));
  g.clearRect(fx1,fy1+fcr,fx1+(fcr*2),fy1+(fcr*2));
  
  g.drawCircleAA(fx2-fcr, fy1+fcr, fcr);
  g.clearRect(fx2-(fcr*2),fy1,fx2-fcr,fy1+(fcr*2));
  g.clearRect(fx2-(fcr*2),fy1+fcr,fx2,fy1+(fcr*2));

  g.drawCircleAA(fx2-fcr, fy2-fcr, fcr);
  g.clearRect(fx2-(fcr*2),fy2-(fcr*2),fx2-fcr,fy2);
  g.clearRect(fx2-(fcr*2),fy2-(fcr*2),fx2,fy2-fcr);

  g.drawCircleAA(fx1+fcr, fy2-fcr, fcr);
  g.clearRect(fx1+fcr,fy2-(2*fcr),fx1+(2*fcr),fy2);
  g.clearRect(fx1,fy2-(2*fcr),fx1+(fcr*2),fy2-fcr);

  /* draw frame lines */
  g.drawLine(fx1+fcr,fy1, fx2-fcr,fy1); 
  g.drawLine(fx2,fy1+fcr, fx2,fy2-fcr);
  g.drawLine(fx2-fcr,fy2, fx1+fcr,fy2);
  g.drawLine(2,140, 2,36);
  // draw the current time (4x size 7 segment)
  g.setFont("7x11Numeric7Seg",5);
  g.setFontAlign(1,1); // align right bottom
  g.drawString(time, X, Y, true /*clear background*/);
  g.setFont("Teletext5x9Ascii",2); 
  g.setFontAlign(0,1); // align center bottom
  // pad the date - this clears the background if the date were to change length
  var dateStr = dow+", "+day+" "+month;
  g.drawString(dateStr, g.getWidth()/2, Y+35, true /*clear background*/);
  /* draw steps, distance */
  var steps = Bangle.getHealthStatus("day").steps;
  g.setFont("5x9Numeric7Seg",2);
  g.setFontAlign(-1,1);
  g.drawString((steps+'    ').toString().substr(0,5), 2, Y+73, true /*clear background*/);
  g.setFont("Teletext5x9Ascii",2);
  g.setFontAlign(1,1);
  g.drawString(((steps*0.7)/1000.0).toFixed(2)+'Km', 174, Y+75, true /*clear background*/);
  
  let ds = new Date();
  let s = ds.getSeconds();
  g.setFont("5x9Numeric7Seg",2);
  g.setFontAlign(-1,1);
  if(!Bangle.isLocked()){
    if(secondsString == "  "){
      secondsString = ("0"+s).substr(-2,2);
    }
  } else {
    secondsString = "  ";
  }
  //secondsString = ("0"+s).substr(-2,2);
  /* 146, 67 "4x6",2 - inside last digit */
  /* 75,50 "Teletext5x9Ascii",2 - below semicolon */
  g.drawString(secondsString, 76,50, true);
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw(false);
// now draw every minutes starting at new minute 
var startTime = new Date();
setTimeout(function() {
    setInterval(draw, 60000);
    draw();
    //console.log('14 led clk start');
}, (60 - startTime.getSeconds()) * 1000);
/* Show launcher when middle button pressed
This should be done *before* Bangle.loadWidgets so that
widgets know if they're being loaded into a clock app or not */
// Lock event signals screen (un)lock:
Bangle.on('lock', draw);
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();