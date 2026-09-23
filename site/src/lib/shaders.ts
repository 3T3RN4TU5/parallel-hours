// GLSL ported verbatim from the design prototype.

export const VS = `
uniform float uTime,uNoise,uExplode,uCharge,uTwist;
attribute vec3 aCenter; attribute float aRand;
varying vec3 vW; varying float vDisp; varying float vRand;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
 const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
 vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
 vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
 vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
 i=mod289(i);
 vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
 float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
 vec4 j=p-49.*floor(p*ns.z*ns.z);
 vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
 vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y);
 vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
 vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
 vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
 vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
 vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
 p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
 vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
 return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec3 rotA(vec3 v, vec3 ax, float a){ ax=normalize(ax); float s=sin(a), c=cos(a); return v*c + cross(ax,v)*s + ax*dot(ax,v)*(1.-c); }
void main(){
  vec3 nrm = normalize(position);
  float amp = uNoise + uCharge*0.3;
  float d = snoise(nrm*1.4 + vec3(uTime*.18)) * amp + snoise(nrm*3.4 - vec3(uTime*.3)) * amp * .35;
  d += uCharge * .05 * sin(uTime*26. + nrm.y*14.);
  vec3 p = position + nrm*d;
  vec3 cN = normalize(aCenter);
  vec3 cP = aCenter + cN*d;
  vec3 local = p - cP;
  float e = uExplode*(0.35+aRand*1.3);
  local = rotA(local, cN + vec3(aRand,.3,0.), e*3.) * (1. - clamp(uExplode*.35,0.,.6));
  p = cP + local + cN*e*1.6 + vec3(0., (aRand-.5)*e*.8, 0.);
  float tw = uTwist*p.y; float cs=cos(tw), sn=sin(tw); p.xz = mat2(cs,-sn,sn,cs)*p.xz;
  vDisp = d; vRand = aRand;
  vec4 w = modelMatrix*vec4(p,1.); vW = w.xyz;
  gl_Position = projectionMatrix*viewMatrix*w;
}`;
export const FS = `
uniform vec3 uAccent; uniform float uOpacity, uHeat; uniform vec2 uMouse;
varying vec3 vW; varying float vDisp; varying float vRand;
void main(){
  vec3 N = normalize(cross(dFdx(vW), dFdy(vW)));
  vec3 V = normalize(cameraPosition - vW);
  if (dot(N,V) < 0.) N = -N;
  vec3 R = reflect(-V, N);
  float box1 = smoothstep(.35,.5,R.y) * smoothstep(.98,.62,R.y);
  float box2 = smoothstep(.55,.8, R.x + uMouse.x*.35) * .55;
  float fl = smoothstep(-.2,-.7,R.y)*.07;
  vec3 L = normalize(vec3(uMouse.x*3., 2.+uMouse.y*2., 3.));
  float diff = max(dot(N,L),0.);
  float spec = pow(max(dot(R,L),0.),70.);
  float fres = pow(1.-max(dot(N,V),0.),3.);
  vec3 bone = vec3(.93,.91,.87);
  vec3 col = vec3(.022) + diff*.05 + (box1+box2)*bone*.72 + fl + spec*bone*1.1;
  col += uAccent * fres * .85;
  col = mix(col, uAccent*(.55+diff*.8), smoothstep(.1,.34,vDisp)*clamp(uHeat,0.,1.));
  gl_FragColor = vec4(col, uOpacity);
}`;
export const PVS = `
uniform float uTime,uSpread,uPx; attribute float aRand; varying float vA; varying float vR;
void main(){
  vec3 p = position*(1.+uSpread);
  p.y += sin(uTime*.3 + aRand*6.28)*.18;
  float a = uTime*.03*(.5+aRand); p.xz = mat2(cos(a),-sin(a),sin(a),cos(a))*p.xz;
  vec4 mv = modelViewMatrix*vec4(p,1.);
  gl_PointSize = uPx*(1.+aRand*1.6)*(6./-mv.z);
  vA = .2+.55*aRand; vR = aRand;
  gl_Position = projectionMatrix*mv;
}`;
export const PFS = `
uniform float uOp; uniform vec3 uAccent; varying float vA; varying float vR;
void main(){
  float d = length(gl_PointCoord-.5); if(d>.5) discard;
  vec3 c = vR>.94 ? uAccent : vec3(.93,.91,.87);
  gl_FragColor = vec4(c, smoothstep(.5,.0,d)*vA*uOp);
}`;
