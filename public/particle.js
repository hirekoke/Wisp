/**
  particle system / JavaScript
  (c) 2012 @hirekoke
*/

/** Particle constructor
  posX  : location x
  posY  : location y
  velX  : velocity x
  velY  : velocity y
  gravX : gravity x
  gravY : gravity y
  rad   : radius
  lifeLimit : max life
  baseColor : particle color, array ([red, green, blue])
  afterImageNum : # of afterimage
 */
var Particle = function(posX, posY, velX, velY, gravX, gravY, rad,
                        lifeLimit, baseColor, afterImageNum) {
  this.posX = posX;
  this.posY = posY;
  this.velX = velX;
  this.velY = velY;
  this.gravX = gravX;
  this.gravY = gravY;
  this.rad = rad;
  this.life = 0;
  this.lifeLimit = lifeLimit;
  this.color = baseColor;
  this.curAlpha = 1;
  this.afterImageNum = afterImageNum;
  
  this.posXL = [];
  this.posYL = [];
  this.alpL = [];
};

Particle.prototype = {
/** returns this particle is dead or not */
isDead : function() {
  return (this.life > this.lifeLimit);
},

/** step */
step: function() {
  if(this.life > 0) {
    this.posXL.push(this.posX);
    this.posYL.push(this.posY);
    this.alpL.push(this.curAlpha);
    
    if(this.posXL.length > this.afterImageNum) {
      this.posXL.shift();
      this.posYL.shift();
      this.alpL.shift();
    }
  }
  
  this.velX += this.gravX;
  this.velY += this.gravY;
  
  this.posX += this.velX;
  this.posY += this.velY;

  this.curAlpha = 1-this.life/this.lifeLimit;
  
  this.life++;
},

getColor: function(alpha) {
  return "rgba(" +
    this.color.join(",") + "," + alpha+ ")";
},

/** render this particle,
  ctx: context of canvas */
render: function(ctx) {
  for(var i=this.posXL.length-1; i>=0; i--) {
    ctx.beginPath();
    ctx.arc(this.posXL[i], this.posYL[i], this.rad,
            0, Math.PI*2, false);
    ctx.fillStyle = this.getColor(this.alpL[i] * i/this.posXL.length);
    ctx.fill();
  }
  
  ctx.beginPath();
  ctx.arc(this.posX, this.posY, this.rad, 0, Math.PI*2, false);
  ctx.fillStyle = this.getColor(this.curAlpha);
  ctx.fill();
}
};

/** Emitter constructor */
var Emitter = function() {
  this.fgColor = [0, 0, 0];
  this.bgColor = [255, 255, 255];
  this.canvasId = "particle_canvas";
  
  /* property of emitter */
  // gravity
  this.gravityX = 0;
  this.gravityY = 1;
  
  // range of initial velocity
  this.velocityMin = 1.0;
  this.velocityMax = 2.0;
  
  // range of initial direction
  this.directionMin = 0;
  this.directionMax = 2 * Math.PI;
  
  // life range of paticles
  this.lifeMin = 10;
  this.lifeMax = 20;
  
  // range of radius
  this.radiusMin = 1;
  this.radiusMax = 3;
  
  // number of afterimage
  this.afterImageNum = 3;
  
  /* variables */
  this.stop = false;
  this.particles = [];
};

Emitter.prototype = {
/** get random value in [min, max] */
getRand: function(min, max) {
  return min + Math.random() * (max - min);
},

/** emit particles
  num: # of particles
  x: int, location of center
  y: int, location of center
  */
emit: function(num, x, y) {
  for(var i=0; i<num; i++) {
    var px = (Math.random() - 0.5) * 5 + x;
    var py = (Math.random() - 0.5) * 5 + y;
    
    var dir = this.getRand(this.directionMin, this.directionMax);
    var v = this.getRand(this.velocityMin, this.velocityMax);
    //console.log(v + " " +this.velocityMin + " " + this.velocityMax);
    var vx = v * Math.cos(dir);
    var vy = v * Math.sin(dir);
    
    var life = parseInt(this.getRand(this.lifeMin, this.lifeMax));
    var rad = this.getRand(this.radiusMin, this.radiusMax);
    
    var p = new Particle(px, py, vx, vy,
                         this.gravityX, this.gravityY,
                         rad, life,
                         this.fgColor, this.afterImageNum);
    this.particles.push(p);
  }
},

clear: function() {
  this.particles = [];
},

isEmpty: function() {
  return this.particles.length <= 0;
},

update: function() {
  var del = [];
  
  // update
  for(var i=0; i<this.particles.length; i++) {
    var p = this.particles[i];
    p.step();
    if(p.isDead()) {
      del.push(i);
    }
  }
  
  // delete dead particles
  for(var i=del.length-1; i>=0; i--) {
    this.particles.splice(del[i], 1);
  }
},

render: function() {
  var canvas = $("#" + this.canvasId);
  var ctx = canvas.get(0).getContext("2d");
  
  var width = canvas.width();
  var height = canvas.height();
  
  ctx.globalCompositeOperation = "lighter";
  
  // render particles
  for(var i=0; i<this.particles.length; i++) {
    this.particles[i].render(ctx);
  }
}
};
