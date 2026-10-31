"""Small studio renderer shared by the architecture cards.

Path traces a list of matte boxes on a dark floor under two softboxes, the way
the MOGO photo is lit: no bloom, no emissive materials, just soft light on a
physical object. WebGL2 through Chrome on the Metal GPU, graded here.

Scenes call render_card(boxes, camera, out). A box is (min_xyz, max_xyz, mat)
with mat 0 white, 1 orange, 2 graphite.
"""
import base64
from pathlib import Path

import cv2
import numpy as np
from playwright.sync_api import sync_playwright

W, H = 2400, 1350
TILES = 6

HTML = r"""<!doctype html><canvas id=c></canvas><script>
const FS=`#version 300 es
precision highp float; precision highp int;
uniform highp sampler2D B; uniform vec2 R; uniform int seed,N;
uniform vec3 eye,fwd,rgt,upv; uniform float fl,ap,fd,bevel;
uniform vec3 keyC,keyU,keyV,keyE,rimC,rimU,rimV,rimE;
out vec4 o;
uint s;
uint pcg(){uint a=s*747796405u+2891336453u;s=a;uint w=((a>>((a>>28u)+4u))^a)*277803737u;return (w>>22u)^w;}
float rnd(){return float(pcg())*(1./4294967296.);}
const float PI=3.14159265;
struct H{float t;vec3 n;int m;vec3 lo,hi;float e;vec3 emit;};
void quad(vec3 ro,vec3 rd,vec3 c,vec3 u,vec3 v,vec3 e,inout H h){
  vec3 n=normalize(cross(v,u));float d=dot(n,rd);if(d>=0.)return;
  float t=dot(c-ro,n)/d;if(t<1e-4||t>=h.t)return;
  vec3 p=ro+rd*t-c;
  if(abs(dot(p,u))>dot(u,u)||abs(dot(p,v))>dot(v,v))return;
  h.t=t;h.e=1.;h.emit=e;
}
H trace(vec3 ro,vec3 rd,bool lights){
  H h;h.t=1e9;h.m=-1;h.e=0.;h.n=vec3(0,0,1);h.emit=vec3(0);h.lo=h.hi=vec3(0);
  if(rd.z<-1e-6){float t=-ro.z/rd.z;if(t>1e-4){h.t=t;h.m=3;}}
  vec3 ird=1./rd;
  for(int i=0;i<N;i++){
    vec4 A=texelFetch(B,ivec2(2*i,0),0),C=texelFetch(B,ivec2(2*i+1,0),0);
    vec3 a=(A.xyz-ro)*ird,b=(C.xyz-ro)*ird,l=min(a,b),g=max(a,b);
    float tn=max(max(l.x,l.y),l.z),tf=min(min(g.x,g.y),g.z);
    if(tn<tf&&tn>1e-4&&tn<h.t){
      h.t=tn;h.m=int(A.w);h.lo=A.xyz;h.hi=C.xyz;
      h.n=-sign(rd)*step(l.yzx,l.xyz)*step(l.zxy,l.xyz);
    }
  }
  h.e=0.;
  if(lights){quad(ro,rd,keyC,keyU,keyV,keyE,h);quad(ro,rd,rimC,rimU,rimV,rimE,h);}
  return h;
}
// a soft edge: tips the normal in the last sliver of each face, so box edges
// catch the light the way a machined part does instead of ending in a CG line
vec3 softEdge(vec3 p,H h){
  vec3 c=(h.lo+h.hi)*.5,e=(h.hi-h.lo)*.5,q=p-c,n=h.n;
  float r=min(bevel,min(e.x,min(e.y,e.z))*.45);
  for(int i=0;i<3;i++){
    if(abs(h.n[i])>.5)continue;
    float d=e[i]-abs(q[i]);
    if(d<r){vec3 ax=vec3(0);ax[i]=sign(q[i]);n=normalize(n+ax*(1.-d/r));}
  }
  return n;
}
vec3 cosdir(vec3 n){
  float a=2.*PI*rnd(),z=rnd()*2.-1.,r=sqrt(max(0.,1.-z*z));
  return normalize(n+vec3(r*cos(a),r*sin(a),z)*.999);
}
void main(){
  s=uint(gl_FragCoord.x)*1973u+uint(gl_FragCoord.y)*9277u+uint(seed)*26699u+1u;
  vec2 j=vec2(rnd(),rnd())-.5,uv=(gl_FragCoord.xy+j-.5*R)/R.y;
  vec3 d=normalize(fwd*fl+rgt*uv.x+upv*uv.y);
  vec3 ro=eye,rd=d;
  if(ap>0.){
    float a=rnd()*6.2832,r=sqrt(rnd())*ap;vec3 f=eye+d*(fd/dot(d,fwd));
    ro=eye+rgt*r*cos(a)+upv*r*sin(a);rd=normalize(f-ro);
  }
  vec3 L=vec3(0),T=vec3(1);
  for(int b=0;b<5;b++){
    H h=trace(ro,rd,b>0);
    if(h.e>.5){L+=T*h.emit;break;}
    if(h.m<0)break;
    vec3 p=ro+rd*h.t,n=h.m==3?vec3(0,0,1):softEdge(p,h),alb;float rough,F0;
    if(h.m==0){alb=vec3(.80,.785,.75);rough=.5;F0=.035;}
    else if(h.m==1){alb=vec3(.86,.19,.012);rough=.5;F0=.035;}
    else if(h.m==2){alb=vec3(.045,.047,.052);rough=.4;F0=.04;}
    else{alb=vec3(.006,.006,.007);rough=.62;F0=.012;}
    float c=clamp(-dot(rd,n),0.,1.),Fr=F0+(1.-F0)*pow(1.-c,5.);
    ro=p+h.n*1e-3;
    if(rnd()<Fr){rd=normalize(reflect(rd,n)+rough*(cosdir(n)-n));if(dot(rd,h.n)<=0.)break;}
    else{rd=cosdir(n);if(dot(rd,h.n)<=0.)rd=cosdir(h.n);T*=alb;}
  }
  o=vec4(min(L,vec3(8.)),1.);
}`;
const VS=`#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0,1);}`;
window.setup=(P)=>{
  const c=document.getElementById('c');c.width=P.W;c.height=P.H;
  const gl=c.getContext('webgl2',{antialias:false,powerPreference:'high-performance'});
  gl.getExtension('EXT_color_buffer_float');
  if(!gl.getExtension('EXT_float_blend'))throw 'no float blend';
  const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s);return s;};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));
  gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw gl.getProgramInfoLog(pr);
  gl.useProgram(pr);
  const u=n=>gl.getUniformLocation(pr,n);
  const tx=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tx);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,P.n*2,1,0,gl.RGBA,gl.FLOAT,new Float32Array(P.boxes));
  const rt=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,rt);
  gl.texStorage2D(gl.TEXTURE_2D,1,gl.RGBA32F,P.W,P.H);
  const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,rt,0);
  gl.bindTexture(gl.TEXTURE_2D,tx);
  gl.uniform1i(u('B'),0);gl.uniform2f(u('R'),P.W,P.H);gl.uniform1i(u('N'),P.n);
  for(const k of ['eye','fwd','rgt','upv','keyC','keyU','keyV','keyE','rimC','rimU','rimV','rimE'])gl.uniform3fv(u(k),P[k]);
  gl.uniform1f(u('fl'),P.fl);gl.uniform1f(u('ap'),P.ap);gl.uniform1f(u('fd'),P.fd);gl.uniform1f(u('bevel'),P.bevel);
  gl.viewport(0,0,P.W,P.H);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.enable(gl.SCISSOR_TEST);
  gl.bindVertexArray(gl.createVertexArray());
  window.G={gl,u,P,pass:0};
};
window.step=async(n)=>{
  const {gl,u,P}=G,T=Math.ceil(P.H/8);
  for(let k=0;k<n;k++){
    for(let y=0;y<P.H;y+=T){gl.scissor(0,y,P.W,T);gl.uniform1i(u('seed'),G.pass);gl.drawArrays(gl.TRIANGLES,0,3);gl.flush();}
    G.pass++;
  }
  gl.finish();await new Promise(r=>setTimeout(r,0));return G.pass;
};
window.grab=(y0,h)=>{
  const {gl,P}=G,a=new Float32Array(P.W*h*4);
  gl.readPixels(0,y0,P.W,h,gl.RGBA,gl.FLOAT,a);
  let s='';const u=new Uint8Array(a.buffer);
  for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));
  return btoa(s);
};
</script>"""


def _unit(v):
    v = np.asarray(v, float)
    return v / np.linalg.norm(v)


def _softbox(centre, target, half_w, half_h, power):
    """A rectangle at centre facing target; u and v are its half extents."""
    n = _unit(np.asarray(target, float) - centre)
    u = _unit(np.cross(n, [0, 0, 1])) * half_w
    v = _unit(np.cross(u, n)) * half_h
    return np.asarray(centre, float), u, v, np.asarray(power, float)


def render_card(boxes, cam, lights, out, spp=420, scale=1.0, exposure=1.0):
    width, height = int(W * scale), int(H * scale)
    target, eye = np.asarray(cam["target"], float), np.asarray(cam["eye"], float)
    fwd = _unit(target - eye)
    rgt = _unit(np.cross(fwd, [0, 0, 1]))
    upv = np.cross(rgt, fwd)
    flat = []
    for lo, hi, mat in boxes:
        flat += [*lo, mat, *hi, 0]
    key = _softbox(*lights["key"])
    rim = _softbox(*lights["rim"])
    params = dict(
        W=width, H=height, n=len(boxes), boxes=[float(x) for x in flat],
        eye=eye.tolist(), fwd=fwd.tolist(), rgt=rgt.tolist(), upv=upv.tolist(),
        fl=cam["fl"], ap=cam.get("ap", 0.0), fd=float(np.linalg.norm(target - eye)),
        bevel=cam.get("bevel", 0.02),
        keyC=key[0].tolist(), keyU=key[1].tolist(), keyV=key[2].tolist(), keyE=key[3].tolist(),
        rimC=rim[0].tolist(), rimU=rim[1].tolist(), rimV=rim[2].tolist(), rimE=rim[3].tolist(),
    )
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome", headless=False, args=[
            "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist",
            "--disable-gpu-watchdog", "--window-position=-3000,0", "--window-size=320,240"])
        page = b.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.set_content(HTML)
        page.evaluate("P=>setup(P)", params)
        done = 0
        while done < spp:
            done = page.evaluate("n=>step(n)", min(4, spp - done))
        rows = []
        for y in range(0, height, 200):
            h = min(200, height - y)
            raw = base64.b64decode(page.evaluate("([y,h])=>grab(y,h)", [y, h]))
            rows.append(np.frombuffer(raw, np.float32).reshape(h, width, 4)[:, :, :3])
        b.close()
    if errors:
        raise RuntimeError(errors)
    hdr = np.vstack(rows)[::-1] / spp
    x = hdr * exposure
    x = x * (2.51 * x + 0.03) / (x * (2.43 * x + 0.59) + 0.14)  # ACES fit
    x = cv2.resize(np.clip(x, 0, 1), (1600, 900), interpolation=cv2.INTER_AREA)
    x = np.where(x <= 0.0031308, 12.92 * x, 1.055 * np.power(np.maximum(x, 1e-8), 1 / 2.4) - 0.055)
    x = x * 0.975 + np.array([0.019, 0.019, 0.023])  # the ground, about #050506
    x = x + np.random.default_rng(3).normal(0, 0.0026, x.shape[:2])[..., None]  # grain stops banding
    img = (np.clip(x, 0, 1) * 255 + 0.5).astype(np.uint8)
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out), img[:, :, ::-1], [cv2.IMWRITE_JPEG_QUALITY, 86, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
    print(out, out.stat().st_size // 1024, "KB")
