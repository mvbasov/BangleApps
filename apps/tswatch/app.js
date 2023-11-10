/* Load fonts */
require("Font7x11Numeric7Seg").add(Graphics);
require("Font5x9Numeric7Seg").add(Graphics);
//require("FontTeletext5x9Ascii").add(Graphics);

// position on screen
const X = 173, Y = 100;
var secondsString = "  ";
var nextDraw = null;
var refreshDelay;
var tsArray = [];

function drawRoundedFrame(fx1,fy1,fx2,fy2,fcr){
  /* draw frame corners */
  /* Top left */
  g.drawCircleAA(fx1+fcr, fy1+fcr, fcr);
  g.clearRect(fx1+fcr,fy1,fx1+(fcr*2),fy1+(fcr*2));
  g.clearRect(fx1,fy1+fcr,fx1+(fcr*2),fy1+(fcr*2));
  /* Top right */
  g.drawCircleAA(fx2-fcr, fy1+fcr, fcr);
  g.clearRect(fx2-(fcr*2),fy1,fx2-fcr,fy1+(fcr*2));
  g.clearRect(fx2-(fcr*2),fy1+fcr,fx2,fy1+(fcr*2));
  /*Bottom right */
  g.drawCircleAA(fx2-fcr, fy2-fcr, fcr);
  g.clearRect(fx2-(fcr*2),fy2-(fcr*2),fx2-fcr,fy2);
  g.clearRect(fx2-(fcr*2),fy2-(fcr*2),fx2,fy2-fcr);
  /* Bottom left */
  g.drawCircleAA(fx1+fcr, fy2-fcr, fcr);
  g.clearRect(fx1+fcr,fy2-(2*fcr),fx1+(2*fcr),fy2);
  g.clearRect(fx1,fy2-(2*fcr),fx1+(fcr*2),fy2-fcr);
  /* draw frame lines */
  g.drawLine(fx1+fcr,fy1, fx2-fcr,fy1); /* top */
  g.drawLine(fx2,fy1+fcr, fx2,fy2-fcr); /* right */
  g.drawLine(fx2-fcr,fy2, fx1+fcr,fy2); /* bottom */
  g.drawLine(fx1,fy2-fcr, fx1,fy1+fcr); /* left */
}

function colletTimeStamp(ts){
  if(tsArray.length >=7)
    tsArray.shift();
  tsArray.push(ts);
}

function darawLog(){
  g.reset().clearRect(Bangle.appRect);
  g.setFont("Vector",14);
  g.setFontAlign(-1,1); /* align left bottom */
  for(i=0; i< tsArray.length; i++){
    g.drawString(tsArray[tsArray.length-i-1].toISOString().substr(0,19)+"Z", 10, (i*20) + 40, true /*clear background*/);
  }
  Bangle.setUI({mode: "updown"}, function(dir){
    if (nextDraw) clearTimeout(nextDraw);
    if(dir > 0) {
      //console.log("down");
      tsArray=[];
      darawLog();
    } else if(dir <0){
      //console.log("up");
      drawWatch();
    }else {
      //console.log("0");
      colletTimeStamp(new Date());
      darawLog();
    }
  });
}
function drawWatch() {
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  var day = d.getDate();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var dow = weekDays[d.getDay()];
  var month = months[d.getMonth()];
  var seconds = d.getSeconds();

  g.reset().clearRect(Bangle.appRect);
  drawRoundedFrame(2,26,174,150,12);
  /* draw time */
  g.setFont("7x11Numeric7Seg",5);
  g.setFontAlign(1,1); /* align right bottom */
  var time = (" "+h).substr(-2) + ":" + m.toString().padStart(2,0);
  g.drawString(time, X, Y, true /*clear background*/);
 /* draw the day of week, date and month */
  g.setFont("Vector",24);
  g.setFontAlign(0,1); /* align center bottom */
  var dateStr = dow+", "+day+" "+month;
  g.drawString(dateStr, g.getWidth()/2, Y+35, true /*clear background*/);
  /* draw steps, distance */
  var steps = Bangle.getHealthStatus("day").steps;
  g.setFont("5x9Numeric7Seg",2);
  g.setFontAlign(-1,1);
  g.drawString((steps+'    ').toString().substr(0,5), 2, Y+73, true /*clear background*/);
  var path = ((steps*0.75)/1000.0).toFixed(2);
  g.setFontAlign(1,1);
  g.drawString(path, 174, Y+75, true /*clear background*/);
  /* draw or clean seconds */
  let ds = new Date();
  let s = ds.getSeconds();
  if(!Bangle.isLocked()){
    if(secondsString == "  "){
      colletTimeStamp(ds);
    }
    secondsString = ("0"+s).substr(-2,2);
    refreshDelay = (1) * 1000;
    Bangle.setUI({mode: "updown"}, function(dir){
      if (nextDraw) clearTimeout(nextDraw);
      if(dir > 0) {
        //console.log("down");
        darawLog();
      } else if(dir <0){
        //console.log("up");
        drawWatch();
      }else {
        //console.log("0");
        Bangle.showLauncher();
      }
    });
  } else {
    secondsString = "  ";
    refreshDelay = (60 - s)*1000;
    Bangle.setUI("clock");
  }
  g.setFont("5x9Numeric7Seg",2);
  g.setFontAlign(-1,1);
  g.drawString(secondsString, 77,50, true);
  if (nextDraw) clearTimeout(nextDraw);
  nextDraw = setTimeout(function() {
    drawWatch();
  }, refreshDelay)
}

// Clear the screen once, at startup
g.reset().clearRect(Bangle.appRect);

// draw immediately at first
drawWatch();
/* Show launcher when middle button pressed
This should be done *before* Bangle.loadWidgets so that
widgets know if they're being loaded into a clock app or not */
// Lock event signals screen (un)lock:
Bangle.on('lock', drawWatch);
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
