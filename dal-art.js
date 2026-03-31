// ========================================
// DAL GENERATIVE ART ENGINE v2
// Shared across all pages
// ========================================
const COLS=['#FFE44D','#FF6B6B','#00D68F','#FF6EB4','#FF9F43','#4FC3F7','#ffffff'];
const rnd=(a,b)=>Math.random()*(b-a)+a;
const pick=a=>a[Math.floor(Math.random()*a.length)];

function jitterLine(ctx,x1,y1,x2,y2,jitter=3){
  const steps=Math.max(8,Math.hypot(x2-x1,y2-y1)/4);
  ctx.beginPath();ctx.moveTo(x1+rnd(-jitter,jitter),y1+rnd(-jitter,jitter));
  for(let i=1;i<=steps;i++){const t=i/steps;ctx.lineTo(x1+(x2-x1)*t+rnd(-jitter,jitter),y1+(y2-y1)*t+rnd(-jitter,jitter));}
  ctx.stroke();
}
function splatter(ctx,x,y,color,size){
  ctx.fillStyle=color;const pts=Math.floor(rnd(5,9));ctx.beginPath();
  for(let i=0;i<pts;i++){const a=i/pts*Math.PI*2,r=size*(0.5+rnd(0,.6));const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;
  i===0?ctx.moveTo(px,py):ctx.quadraticCurveTo(x+Math.cos(a-0.3)*r*rnd(.8,1.4),y+Math.sin(a-0.3)*r*rnd(.8,1.4),px,py);}
  ctx.closePath();ctx.fill();
  for(let i=0;i<rnd(8,25);i++){const a=rnd(0,Math.PI*2),d=rnd(size*.4,size*2.5),dr=rnd(1,size*.15);ctx.beginPath();ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,dr,0,Math.PI*2);ctx.fill();}
}
function drip(ctx,x,startY,color,len,width){
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,startY);
  let cy=startY;while(cy<startY+len){cy+=rnd(5,15);ctx.lineTo(x+rnd(-width*.5,width*.5),cy);}ctx.stroke();
  ctx.beginPath();ctx.ellipse(x+rnd(-2,2),cy,width*rnd(.8,1.5),width*rnd(1,2),0,0,Math.PI*2);ctx.fill();
}
function wobblyCircle(ctx,x,y,r,color,lw){
  ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.beginPath();const pts=Math.floor(rnd(20,35));
  for(let i=0;i<=pts;i++){const a=i/pts*Math.PI*2,rr=r+rnd(-r*.2,r*.2);const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}
  ctx.closePath();ctx.stroke();
}
function sketchyX(ctx,x,y,size,color){
  ctx.strokeStyle=color;ctx.lineWidth=rnd(2,4);ctx.lineCap='round';
  jitterLine(ctx,x-size,y-size,x+size,y+size,2);jitterLine(ctx,x+size,y-size,x-size,y+size,2);
}
function scrawlText(ctx,text,x,y,color,size){
  ctx.font=`${size}px 'Permanent Marker',cursive`;ctx.fillStyle=color;ctx.save();ctx.translate(x,y);ctx.rotate(rnd(-.25,.25));ctx.fillText(text,0,0);ctx.restore();
}
function sketchyArrow(ctx,x,y,angle,len,color){
  ctx.strokeStyle=color;ctx.lineWidth=rnd(2.5,4);ctx.lineCap='round';ctx.lineJoin='round';
  const ex=x+Math.cos(angle)*len,ey=y+Math.sin(angle)*len;jitterLine(ctx,x,y,ex,ey,2);
  const hl=len*.3;jitterLine(ctx,ex,ey,ex+Math.cos(angle+2.7)*hl,ey+Math.sin(angle+2.7)*hl,1.5);
  jitterLine(ctx,ex,ey,ex+Math.cos(angle-2.7)*hl,ey+Math.sin(angle-2.7)*hl,1.5);
}
function paintSection(canvasId, colors){
  const c=document.getElementById(canvasId);if(!c)return;
  const sec=c.parentElement;c.width=sec.offsetWidth;c.height=sec.offsetHeight;
  const ctx=c.getContext('2d'),W=c.width,H=c.height;
  for(let i=0;i<rnd(8,16);i++)splatter(ctx,rnd(0,W),rnd(0,H),pick(colors)+'30',rnd(10,50));
  for(let i=0;i<rnd(3,8);i++)wobblyCircle(ctx,rnd(0,W),rnd(0,H),rnd(15,55),pick(colors)+'30',rnd(1.5,3));
  for(let i=0;i<rnd(4,10);i++)sketchyX(ctx,rnd(0,W),rnd(0,H),rnd(6,16),pick(colors)+'35');
  for(let i=0;i<rnd(3,7);i++)drip(ctx,rnd(0,W),rnd(-5,5),pick(colors)+'30',rnd(20,H*.25),rnd(2,4));
  const ws=['CREATE!','ART!','★','✦','→','MAKE!','!','©','PLAY!','WOW!'];
  for(let i=0;i<rnd(4,9);i++)scrawlText(ctx,pick(ws),rnd(0,W),rnd(20,H),pick(colors)+'30',rnd(14,30));
  for(let i=0;i<rnd(2,5);i++)sketchyArrow(ctx,rnd(0,W),rnd(0,H),rnd(0,Math.PI*2),rnd(25,60),pick(colors)+'30');
  for(let i=0;i<rnd(3,8);i++){ctx.strokeStyle=pick(colors)+'20';ctx.lineWidth=rnd(1,3);jitterLine(ctx,rnd(0,W),rnd(0,H),rnd(0,W),rnd(0,H),rnd(3,8));}
}

// ========================================
// ANIMATED PARTICLES OVERLAY
// ========================================
class Particle{
  constructor(W,H){this.reset(W,H);this.y=rnd(0,H);}
  reset(W,H){this.x=rnd(0,W);this.y=H+rnd(10,50);this.r=rnd(2,8);this.vx=rnd(-.4,.4);this.vy=rnd(-.8,-.15);this.color=pick(COLS);this.alpha=rnd(.1,.5);this.pulse=rnd(.02,.06);this.phase=rnd(0,Math.PI*2);this.rot=rnd(0,Math.PI*2);this.rotV=rnd(-.02,.02);this.shape=Math.floor(rnd(0,4));/* 0=circle 1=x 2=dot 3=ring */}
  update(W,H){this.x+=this.vx;this.y+=this.vy;this.phase+=this.pulse;this.rot+=this.rotV;
    this.alpha=rnd(.1,.4)+Math.sin(this.phase)*.15;if(this.y<-20||this.x<-20||this.x>W+20)this.reset(W,H);}
  draw(ctx){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.rot);ctx.globalAlpha=Math.max(0,this.alpha);
    if(this.shape===0){ctx.beginPath();ctx.arc(0,0,this.r,0,Math.PI*2);ctx.fillStyle=this.color;ctx.fill();}
    else if(this.shape===1){ctx.strokeStyle=this.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-this.r,-this.r);ctx.lineTo(this.r,this.r);ctx.moveTo(this.r,-this.r);ctx.lineTo(-this.r,this.r);ctx.stroke();}
    else if(this.shape===2){ctx.fillStyle=this.color;ctx.fillRect(-this.r/2,-this.r/2,this.r,this.r);}
    else{ctx.beginPath();ctx.arc(0,0,this.r,0,Math.PI*2);ctx.strokeStyle=this.color;ctx.lineWidth=2;ctx.stroke();}
    ctx.restore();}
}
function initAnimatedOverlay(canvasId){
  const c=document.getElementById(canvasId);if(!c)return;
  const sec=c.parentElement;c.width=sec.offsetWidth;c.height=sec.offsetHeight;
  const ctx=c.getContext('2d'),W=c.width,H=c.height;
  const parts=[];for(let i=0;i<50;i++)parts.push(new Particle(W,H));
  function loop(){ctx.clearRect(0,0,W,H);parts.forEach(p=>{p.update(W,H);p.draw(ctx);});requestAnimationFrame(loop);}
  loop();
}
