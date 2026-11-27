(()=>{'use strict';
const canvas=document.getElementById('brand-3d');if(!canvas)return;const host=canvas.parentElement;
let gl;try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:false});}catch{}if(!gl)return;
const vertex='attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}';
const fragment=`
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float box(vec3 p,vec3 b,float r){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float seven(vec3 p){
  float top=box(p-vec3(0.,.69,0.),vec3(.52,.095,.15),.055);
  vec3 s=p-vec3(.075,-.12,0.);s.xy=rot(-.43)*s.xy;
  float stem=box(s,vec3(.105,.78,.15),.055);
  return min(top,stem);
}
vec3 turn(vec3 p){p.xz=rot(.20*sin(u_time*.46)+u_pointer.x*.12)*p.xz;p.yz=rot(-.17+u_pointer.y*.08)*p.yz;p.xy=rot(-.065)*p.xy;return p;}
float scene(vec3 p){p=turn(p);float d=seven(p+vec3(1.28,0.,0.));d=min(d,seven(p));d=min(d,seven(p-vec3(1.28,0.,0.)));return d;}
vec3 normalAt(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(scene(p+e.xyy)-scene(p-e.xyy),scene(p+e.yxy)-scene(p-e.yxy),scene(p+e.yyx)-scene(p-e.yyx)));}
vec3 env(vec3 r){
  vec3 c=vec3(.035,.038,.032);
  c+=vec3(.82,.84,.78)*pow(max(dot(r,normalize(vec3(-.7,.8,.45))),0.),16.);
  c+=vec3(.53,.54,.48)*pow(max(dot(r,normalize(vec3(.65,-.28,.75))),0.),36.);
  c+=vec3(.58,1.,.045)*pow(max(dot(r,normalize(vec3(.8,.18,-.55))),0.),24.);
  float strip=smoothstep(.045,.002,abs(r.y-.27))*smoothstep(-.8,.25,r.z);
  c+=vec3(.75,.76,.70)*strip;
  return c;
}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y;
 vec3 bg=mix(vec3(.035,.039,.031),vec3(.12,.135,.10),exp(-3.2*dot(uv,uv)));
 float grid=step(.985,max(fract((uv.x+.01)*16.),fract((uv.y+.02)*16.)))*.025;
 bg+=grid; 
 vec3 ro=vec3(0.,.05,6.2);
 vec3 rd=normalize(vec3(uv*3.25,-5.));
 float t=0.;float d=0.;bool hit=false;
 for(int i=0;i<72;i++){vec3 p=ro+rd*t;d=scene(p);if(d<.002){hit=true;break;}t+=max(.001,d*.79);if(t>11.)break;}
 vec3 color=bg;
 if(hit){
  vec3 p=ro+rd*t,n=normalAt(p),v=-rd,ref=reflect(rd,n);
  float diff=max(dot(n,normalize(vec3(-.5,.8,1.))),0.);
  float fres=pow(1.-max(dot(n,v),0.),3.);
  vec3 c=vec3(.20,.215,.18)*(.24+diff*.48)+env(ref)*(.88+.32*fres);
  float rim=pow(1.-max(dot(n,v),0.),4.);
  c+=vec3(.42,.8,.035)*rim*.32;
  vec3 q=turn(p);
  float front=smoothstep(.12,.18,q.z);
  float brush=sin(q.y*480.+q.x*3.)*.009;
  c+=brush*front;
  color=c/(1.+c*.36);
 }else{
  float shadow=exp(-20.*abs(uv.y+.36))*exp(-2.*uv.x*uv.x);
  color*=1.-shadow*.42;
 }
 color=pow(max(color,0.),vec3(.85));gl_FragColor=vec4(color,1.);
}
`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;}
const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);if(!vs||!fs)return;const p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))return;gl.useProgram(p);
const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const at=gl.getAttribLocation(p,'a_position');gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,2,gl.FLOAT,false,0,0);
const resolution=gl.getUniformLocation(p,'u_resolution'),time=gl.getUniformLocation(p,'u_time'),pointer=gl.getUniformLocation(p,'u_pointer');const reduce=matchMedia('(prefers-reduced-motion: reduce)');let visible=true,active=true,frame=0,last=0,start=performance.now(),mx=0,my=0;
function draw(now){if(!active)return;const r=host.getBoundingClientRect();const scale=Math.min(1,640/Math.max(r.width,1),480/Math.max(r.height,1));const w=Math.max(1,Math.round(r.width*scale)),h=Math.max(1,Math.round(r.height*scale));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.uniform2f(resolution,w,h);gl.uniform1f(time,reduce.matches?0:(now-start)/1000);gl.uniform2f(pointer,reduce.matches?0:mx,reduce.matches?0:my);gl.drawArrays(gl.TRIANGLES,0,6);if(!gl.isContextLost())host.dataset.rendered='true';}
function loop(now){frame=0;if(!active||!visible||document.hidden||reduce.matches)return;if(now-last>=50){draw(now);last=now;}frame=requestAnimationFrame(loop);}
function sync(){if(frame){cancelAnimationFrame(frame);frame=0;}if(!active||!visible||document.hidden)return;draw(performance.now());if(!reduce.matches)frame=requestAnimationFrame(loop);}
host.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=host.getBoundingClientRect();mx=(e.clientX-r.left)/r.width*2-1;my=(e.clientY-r.top)/r.height*2-1;});host.addEventListener('pointerleave',()=>{mx=0;my=0;});
if('IntersectionObserver'in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync();},{threshold:.05}).observe(host);if('ResizeObserver'in window)new ResizeObserver(()=>{if(visible&&!document.hidden)draw(performance.now());}).observe(host);document.addEventListener('visibilitychange',sync);if(reduce.addEventListener)reduce.addEventListener('change',sync);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;host.dataset.rendered='false';if(frame)cancelAnimationFrame(frame);});canvas.addEventListener('webglcontextrestored',()=>{host.dataset.rendered='false';});sync();
})();