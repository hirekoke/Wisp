/**
constructor of WispAnim
  target: jQuery object (line)
  fontColor: color of text-shadow
  wispColor: color of line-shadow
 */
var WispAnim = function(target) {
  // const
  this.DELAY = 30; // msec
  this.CANVAS_ELEMCLS = "__wisp_canvas_";
  
  // variable
  this.frameCnt = 0;
  this.maxFrame = 16;
  
  this.target = target;
  this.target.addClass("wisp");
  this.target.wisp = this;
  this.canvasId = this.target.attr("id") + "_canvas";
  
  this.fontColor = null; // [r,g,b] ex) [255, 255, 200]
  this.wispColor = null; // [r,g,b,a] ex) [204, 255, 0, 0.75]
  this.particleColor = null;
  this.wispStyles = null;
};

WispAnim.prototype = {
createId: function() {
  var date = new Date();
  var dateStr = "" + date.getHours() +
    date.getMinutes() + date.getSeconds() +
      date.getMilliseconds();
  return dateStr;
},

fillRoundRect: function(ctx, l, t, r, b, rad) {
  ctx.moveTo(l+rad, t);
  ctx.lineTo(r-rad, t);
  ctx.arc(r-rad, t+rad, rad, 1.5*Math.PI, 0, false);
  ctx.lineTo(r, b-rad);
  ctx.arc(r-rad, b-rad, rad, 0, 0.5*Math.PI, false);
  ctx.lineTo(l+rad, b);
  ctx.arc(l+rad, b-rad, rad, 0.5*Math.PI, Math.PI, false);
  ctx.lineTo(l, t+rad);
  ctx.arc(l+rad, t+rad, rad, Math.PI, 1.5*Math.PI, false);
  ctx.fill();
},

/** start animation */
start: function(fontColor, wispColor, particleColor, wispStyles) {
  this.fontColor = fontColor;
  this.wispColor = wispColor;
  this.particleColor = particleColor;
  this.wispStyles = wispStyles;
  
  var animId = this.createId();
  var delay = this.DELAY;
  var frameCnt = 0;
  var maxFrame = this.maxFrame;
  
  this.target.wisp_animid = animId;
  var wispNoStyle = {
    textShadow: "none",
    boxShadow: "none",
    backgroundColor: "transparent"
  };
  
  // canvas setting
  var canvas = $("#"+ this.canvasId);
  if(canvas.length == 0) {
    canvas = $("<canvas class=\"" + this.CANVAS_ELEMCLS + "\" id=\"" + this.canvasId + "\"></canvas>");
    $(document.body).append(canvas);
  }
  
  var cm = 30; // margin of line
  var lx = this.target.offset().left; // line xpos
  var ly = this.target.offset().top;  // line ypos
  var lw = this.target.width();  // line width
  var lh = this.target.height(); // line height
  ly += lh * 0.75; lh *= 0.25;
  var cw = lw + cm*2;  // canvas width
  var ch = lh + cm*2; // canvas height
  var r = lh / 2.0;
  if(r > lw / 2.0) r = lw / 2.0;
  
  canvas.css({
    left: lx - cm, top: ly - cm,
    width: cw, height: ch
  });
  canvas.attr("width", cw);
  canvas.attr("height", ch);
  
  // particle settings
  var emitNum = Math.round(1/this.maxFrame * 200);
  var emitter = new Emitter();
  emitter.canvasId = this.canvasId;
  emitter.gravityX = 0.6; emitter.gravityY = 0;
  emitter.velocityMin = 3; emitter.velocityMax = 10;
  emitter.lifeMin = 2; emitter.lifeMax = 4;
  emitter.radiusMin = 0.3; emitter.radiusMax = 2;
  emitter.fgColor = this.particleColor;
  emitter.bgColor = [0, 0, 0, 0];
  emitter.afterImageNum = 0;
  
  var end = function(wisp) {
    var ctx = canvas.get(0).getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    var width = canvas.width();
    var height = canvas.height();
    
    // clear
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, width, height);
    
    emitter.clear();
    
    wisp.target.css(wispNoStyle);
  };
  
  var repeat = function(wisp) {
    emitter.update();
    
    var ctx = canvas.get(0).getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    var width = canvas.width();
    var height = canvas.height();
    
    // clear
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, width, height);
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

    if(frameCnt < maxFrame) {
      var x = frameCnt / maxFrame * lw + cm;
      var c = wispColor.slice(0, 3).join(",");
      var a = (1-frameCnt/maxFrame) * wispColor[3];
      
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowColor = "rgba(" + c + "," + a + ")";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "rgba(" + c + "," + a + ")";
      
      wisp.fillRoundRect(ctx, cm-1, cm-1, x+2, cm+lh+2, r+1);
      wisp.fillRoundRect(ctx, cm, cm, x, cm+lh, r);
      
      ctx.shadowColor = "rgba(0, 0, 0, 0)";
      ctx.shadowBlur = 0;
      
      emitter.emit(emitNum, x, height/2.0);
      
      wisp.target.css(wispStyles[frameCnt]);
    } else {
      wisp.target.css(wispNoStyle);
    }
    
    emitter.render();
    
    frameCnt++;
    if(wisp.target.wisp_animid != animId) {
      end(wisp);
    } else if(frameCnt < maxFrame || !emitter.isEmpty()) {
      setTimeout(repeat, delay, wisp);
    } else {
      setTimeout(end, delay, wisp);
    }
  };

  repeat(this);
}

};

/** constructor of Wisp */
var Wisp = function() {
  // const
  this.OUTPUT_ELEMID = "__output_";
  this.OUTPUT_MAXLINE = 50;

  this.SRC_ELEMID = "__sources_";

  this.OUTTYPE_OUTPUT = 0;
  this.OUTTYPE_ERROR = 1;
  this.OUTTYPE_INFO = 2;

  this.ANIM_MAX_FRAME = 16;
  
  // variables
  this.lines = [];
  this.filename = null;

  this.idHash = { };  // filename => id
  this.idCount = 0;   // current id count

  this.threadColors = { }; // thread name => color([font color, wisp color])
  this.curColors = null;
  this.curH = 0;
  this.curHDiv = 720;
};

Wisp.convertHsvToRgb = function(hsv) {
  var h = hsv[0]; var s = hsv[1]; var v = hsv[2];
  var hi = Math.floor(h / 60.0) % 6;
  var f = h/60.0-hi;
  var p = Math.round(v*(1-s) * 255);
  var q = Math.round(v*(1-f*s) * 255);
  var t = Math.round(v*(1-(1-f)*s) * 255);
  v = Math.round(v * 255);
  switch(hi) {
  case 0:
    return [v,t,p];
  case 1:
    return [q,v,p];
  case 2:
    return [p,v,t];
  case 3:
    return [p,q,v];
  case 4:
    return [t,p,v];
  case 5:
    return [v,p,q];
  }
  return [0,0,0];
};

/* instance method */
Wisp.prototype = {

/** get next hue (color) */
nextHue: function() {
  var h = this.curH % 360;
  this.curH += this.curHDiv;
  if(this.curH >= 360) {
    this.curHDiv /= 2.0;
    this.curH = this.curHDiv / 2.0;
  }
  return h;
},

/** get thread color from thread name */
getThreadColors: function(thname) {
  if(this.threadColors[thname] != null) {
    return this.threadColors[thname];
    
  } else { // generate new color
    var h = this.nextHue();
    var fc = [255, 255, 255];
    var wc = Wisp.convertHsvToRgb([h, 0.8, 0.6]);
    wc.push(1.0);
    var pc = Wisp.convertHsvToRgb([h, 0.8, 0.9]);
    
    // generate text-shadow properties
    var ts = [];
    var col = "rgb(" + fc.join(",") + ")";
    for(var i=0; i<this.ANIM_MAX_FRAME; i++) {
      ts.unshift("0 0 " + (i*2+1) + "px " + col);
    }
    for(var i=ts.length-2; i>=0; i--) {
      ts[i] = ts[i] + "," + ts[i+1];
    }
    
    // generate background & box-shadow colors
    // generate wisp styles
    var ws = [];
    for(var i=0; i<this.ANIM_MAX_FRAME; i++) {
      ws.push({ textShadow: ts[i] });
    }
    
    var col = [ fc, wc, pc, ws ];
    this.threadColors[thname] = col;
    return col;
  }
},

/** get file id from filename */
getFileId : function(filename) {
  if(this.idHash[filename] != null) {
    return this.idHash[filename];
  } else {
    var id = "__" + this.idCount;
    this.idHash[filename] = id;
    this.idCount++;
    return id;
  }
},

/** get line id from filename & lineno */
getLineId : function(filename, id) {
  return this.getFileId(filename) + "_l" + id;
},

/** add new file */
addFile : function(filename, codes) {
  console.log("addFile: " + filename + ", " + codes.length + " lines");
  
  var id = this.getFileId(filename);
  var sec = $("<section class=\"code\" id=\"" + id + "\"></section>");
  var header = $("<h1>" + filename + "</h1>");
  var codeDiv = $("<div class=\"code\"></div>");

  // lines
  for(var i=0; i<codes.length; i++) {
    var lineObj = $("<code id=\"" + this.getLineId(filename, i) + "\"></code>");
    lineObj.text(codes[i]);
    codeDiv.append(lineObj);
    if(i != codes.length-1) {
      codeDiv.append("<br />");
    }
  }
  sec.append(header);
  sec.append(codeDiv);
  $("#" + this.SRC_ELEMID).append(sec);
  
  this.setFile(filename);
},

/** set file */
setFile : function(filename) {
  console.log("setFile: " + filename);

  if(this.prevWispFile) {
    this.prevWispFile.removeClass("wisp");
  }
  
  var id = this.getFileId(filename);
  this.filename = filename;
  this.lines = $("#" + id + " code");
  
  var fdiv = $("#" + id);
  var fcol = "rgb(" + this.curColors[2].join(",") + ")";
  fdiv.addClass("wisp");
  
  this.prevWispFile = fdiv;
},

/** set line */
setLine : function(lineNo) {
  console.log("setLine: " + lineNo);
  
  var line = this.lines[lineNo];
  if(line) {
    var lineObj = $(line);
    var wispAnim = lineObj.wisp;
    if(wispAnim == null) {
      wispAnim = new WispAnim(lineObj);
      wispAnim.maxFrame = this.ANIM_MAX_FRAME;
    } else {
      console.log("reuse");
    }
    wispAnim.start(this.curColors[0],
                   this.curColors[1],
                   this.curColors[2],
                   this.curColors[3]);
  }
},

/** set thread */
setThread : function(threadName) {
  console.log("setThread: " + threadName);
  this.curColors = this.getThreadColors(threadName);
},

/** add output */
addOutput : function(type, data) {
  var cls = "";
  switch(type) {
  case this.OUTTYPE_INFO:
    cls = "info"; break;
  case this.OUTTYPE_OUTPUT:
    cls = "output"; break;
  case this.OUTTYPE_ERROR:
    cls = "error"; break;
  }
  console.log("addOutput: (" + cls + ") " + data);

  var sd = data;
  sd = sd.split("<").join("&lt;");
  sd = sd.split(">").join("&gt;");
  var li = "#" + this.OUTPUT_ELEMID + " li";
  $("#" + this.OUTPUT_ELEMID).append($("<li class=\"" + cls + "\">" + sd + "</li>"));
  
  if(type != this.OUTTYPE_INFO) {
    if($(li).size() > this.OUTPUT_MAXLINE) {
      $(li + ":first").remove();
    }
  }
  
  $("#" + this.OUTPUT_ELEMID)[0].scrollTop = $("#" + this.OUTPUT_ELEMID)[0].scrollHeight;
},

/** proc web socket message
  data: sended message */
procMessage : function(data) {
  var op = data.charAt(0);
  var arg = data.slice(1);
  
  switch(data.charAt(0)) {
  case "F":
    var obj = JSON.parse(arg);
    if(obj.name) {
      if(obj.code) {
        this.addFile(obj.name, obj.code);
      } else {
        this.setFile(obj.name);
      }
    }
    return false;
    
  case "L":
    var no = parseInt(arg, 10);
    this.setLine(no - 1);
    return true;
    
  case "O":
    this.addOutput(this.OUTTYPE_OUTPUT, arg);
    return false;
  case "E":
    this.addOutput(this.OUTTYPE_ERROR, arg);
    return false;

  case "T":
    this.setThread(arg);
    return false;
  }
  return true;
},

onLoad : function() {
},

onSocketOpen: function() {
  this.addOutput(this.OUTTYPE_INFO, "Socket opened");
},

onSocketClose: function() {
  this.addOutput(this.OUTTYPE_INFO, "Socket closed");
}

};

var wisp = new Wisp();

$(document).ready(function() {
  wisp.onLoad();
  
  var ws = new WebSocket('ws://' + window.location.host + window.location.pathname);
  ws.onopen = function() {
    wisp.onSocketOpen();
  };
  ws.onclose = function() {
    wisp.onSocketClose();
  };
  
  ws.onmessage = function(m) {
    if(wisp.procMessage(m.data))
      ws.send("ok");
  };
});
