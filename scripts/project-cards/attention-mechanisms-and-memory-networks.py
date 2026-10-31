#!/usr/bin/env python3
"""Home card for the Transformer speech recognition project.

A cross-attention matrix built as a physical object: every (token, audio frame)
cell is one lit column, its height the attention weight. The picture is
ILLUSTRATIVE, not model output. The weights are a real scaled dot-product
softmax, but over synthetic queries and keys (sinusoidal positions plus random
sound-class embeddings, on a simulated utterance with uneven token durations).
Nothing here comes from the trained network or from LibriSpeech.

Path traced in WebGL2 through Chrome, then graded here.
Run from the repo root:
    python3 scripts/project-cards/attention-mechanisms-and-memory-networks.py
Options: --scale 0.25 --spp 64 --out /path/preview.jpg  for quick looks.
"""
import argparse
import base64
import json
from pathlib import Path

import cv2
import numpy as np
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("--scale", type=float, default=2.0, help="render size relative to 1600x900")
ap.add_argument("--spp", type=int, default=900)
ap.add_argument("--out", default="public/images/project/cards/attention-mechanisms-and-memory-networks.jpg")
args = ap.parse_args()

W, H = round(1600 * args.scale), round(900 * args.scale)
FRAMES, TOKENS = 150, 80
PEAK = 19.0          # height of the tallest column, in cell widths
D_MODEL = 384        # the project's model dimension
HEADS = 6            # the project's head count
TEMPERATURE = 0.85   # softens each softmax so the ridge has shoulders


def positional(t, d=D_MODEL):
    """Sinusoidal positional encoding at (fractional) positions t."""
    t = np.asarray(t, dtype=np.float64)[:, None]
    k = np.arange(d // 2)[None, :]
    a = t / 10000.0 ** (2 * k / d)
    return np.concatenate([np.sin(a), np.cos(a)], axis=1)


def attention_field():
    """Per-token softmax over audio frames, averaged across heads."""
    rng = np.random.default_rng(11785)
    # Uneven token lengths, with the odd short pause, like real speech.
    dur = rng.gamma(2.2, 1.0, TOKENS)
    dur[rng.random(TOKENS) < 0.1] *= 2.4
    edges = np.concatenate([[0], np.cumsum(dur)])
    edges *= (FRAMES - 1) / edges[-1]
    centres = 0.5 * (edges[:-1] + edges[1:])
    token_of_frame = np.clip(np.searchsorted(edges, np.arange(FRAMES), side="right") - 1, 0, TOKENS - 1)

    # A small alphabet of sound classes, so repeats leave faint off-ridge echoes.
    classes = rng.integers(0, 9, TOKENS)
    vocab = rng.normal(size=(9, D_MODEL))
    vocab /= np.linalg.norm(vocab, axis=1, keepdims=True)

    scale = 0.55
    Q = positional(centres * scale) + 3.2 * vocab[classes]
    K = positional(np.arange(FRAMES) * scale) + 3.2 * vocab[classes[token_of_frame]]
    Q = Q / np.linalg.norm(Q, axis=1, keepdims=True) * np.sqrt(D_MODEL)
    K = K / np.linalg.norm(K, axis=1, keepdims=True) * np.sqrt(D_MODEL)

    A = np.zeros((TOKENS, FRAMES))
    for h in range(HEADS):
        P = rng.normal(size=(D_MODEL, D_MODEL // 2)) / np.sqrt(D_MODEL // 2)
        with np.errstate(all="ignore"):  # Accelerate's matmul raises spurious FP flags on macOS
            logits = (Q @ P) @ (K @ P).T / np.sqrt(D_MODEL)
        logits = (logits - logits.max(axis=1, keepdims=True)) * TEMPERATURE
        e = np.exp(logits)
        A += e / e.sum(axis=1, keepdims=True)
    return A / HEADS


A = attention_field()
norm = A / A.max()
level = np.tanh(norm / 0.42) / np.tanh(1 / 0.42)  # soft ceiling, so one very short token cannot spike
height = 0.12 + PEAK * level ** 1.2 + 0.9 * np.clip(1 + np.log10(norm + 1e-12) / 6, 0, 1) ** 2
# A lighting choice only: a gentle gain mid-ridge gives the eye one place to land. Heights stay as computed.
yy, xx = np.mgrid[0:TOKENS, 0:FRAMES]
spot = 1.0 + 1.0 * np.exp(-(((xx / FRAMES - 0.54) ** 2) + ((yy / TOKENS - 0.54) ** 2)) / 0.05)
glow = np.clip(level ** 1.6 * spot * 0.52, 0, 1)
field = np.stack([height, glow], axis=-1).astype(np.float32)  # rows = tokens, cols = frames

HTML = r"""<!doctype html><canvas id=c></canvas><script>
const FS=`#version 300 es
precision highp float; precision highp int;
uniform highp sampler2D F; uniform vec2 R; uniform int seed; uniform ivec2 N; uniform float HM;
uniform vec3 eye,fwd,rgt,upv; uniform vec2 pool; uniform float fl,ap,fd;
out vec4 o;
uint s;
uint pcg(){uint a=s*747796405u+2891336453u;s=a;uint w=((a>>((a>>28u)+4u))^a)*277803737u;return (w>>22u)^w;}
float rnd(){return float(pcg())*(1./4294967296.);}
const float PI=3.14159265;
const float GAP=.075;
vec2 cellv(ivec2 c){return texelFetch(F,c,0).rg;}
struct H{float t;vec3 n;ivec2 c;int k;};
H trace(vec3 ro,vec3 rd){
  H h;h.t=1e9;h.k=0;h.n=vec3(0,0,1);h.c=ivec2(0);
  if(rd.z<-1e-6){float t=-ro.z/rd.z;if(t>1e-4){h.t=t;h.k=1;}}
  vec3 ird=1./rd;
  vec3 b1=vec3(0,0,0),b2=vec3(vec2(N),HM);
  vec3 t0=(b1-ro)*ird,t1=(b2-ro)*ird;
  vec3 a=min(t0,t1),b=max(t0,t1);
  float tn=max(max(a.x,a.y),max(a.z,0.)),tf=min(min(b.x,b.y),b.z);
  if(tn>=tf)return h;
  tf=min(tf,h.t);
  vec3 p=ro+rd*(tn+1e-4);
  ivec2 c=ivec2(floor(p.xy));c=clamp(c,ivec2(0),N-1);
  vec2 d=abs(ird.xy);ivec2 st=ivec2(sign(rd.xy));
  vec2 nx=(vec2(c)+step(vec2(0),rd.xy)-ro.xy)*ird.xy;
  float t=tn;
  for(int i=0;i<N.x+N.y+4;i++){
    float te=min(min(nx.x,nx.y),tf);
    float ht=cellv(c).r;
    float z0=ro.z+rd.z*t,z1=ro.z+rd.z*te;
    if(min(z0,z1)<ht){
      vec3 bl=vec3(vec2(c)+GAP,0.),bh=vec3(vec2(c)+1.-GAP,ht);
      vec3 q0=(bl-ro)*ird,q1=(bh-ro)*ird;
      vec3 qa=min(q0,q1),qb=max(q0,q1);
      float n=max(max(qa.x,qa.y),qa.z),f=min(min(qb.x,qb.y),qb.z);
      if(n<f&&n>1e-4&&n<h.t){
        h.t=n;h.k=2;h.c=c;
        h.n=n==qa.x?vec3(-sign(rd.x),0,0):n==qa.y?vec3(0,-sign(rd.y),0):vec3(0,0,-sign(rd.z));
        return h;
      }
    }
    if(te>=tf)break;
    if(nx.x<nx.y){nx.x+=d.x;c.x+=st.x;}else{nx.y+=d.y;c.y+=st.y;}
    t=te;
    if(c.x<0||c.y<0||c.x>=N.x||c.y>=N.y)break;
  }
  return h;
}
vec3 ramp(float g){
  vec3 deep=vec3(1.,.10,.006),mid=vec3(1.,.24,.025),hot=vec3(1.,.74,.50);
  return g<.6?mix(deep,mid,g/.6):mix(mid,hot,(g-.6)/.4);
}
vec3 env(vec3 d){
  // cool strip behind the matrix, a wide dim overhead box
  vec3 c=vec3(0.);
  float back=smoothstep(.10,.34,d.y)*smoothstep(.62,.30,d.z)*smoothstep(.02,.16,d.z);
  c+=vec3(.20,.42,.95)*back*.045;
  float top=smoothstep(.72,.96,d.z);
  c+=vec3(.62,.74,1.)*top*.30;
  return c;
}
vec3 cosdir(vec3 n){
  float a=2.*PI*rnd(),z=rnd()*2.-1.,r=sqrt(max(0.,1.-z*z));
  return normalize(n+vec3(r*cos(a),r*sin(a),z)+1e-5);
}
void main(){
  s=uint(gl_FragCoord.x)*1973u+uint(gl_FragCoord.y)*9277u+uint(seed)*26699u+1u;pcg();pcg();
  vec2 uv=(gl_FragCoord.xy-.5+vec2(rnd(),rnd())-R*.5)/R.y;
  vec3 dir=normalize(fwd*fl+rgt*uv.x+upv*uv.y);
  float a=2.*PI*rnd(),r=ap*sqrt(rnd());
  vec3 ro=eye+rgt*r*cos(a)+upv*r*sin(a);
  vec3 foc=eye+dir*(fd/dot(dir,fwd));
  vec3 rd=normalize(foc-ro);
  vec3 L=vec3(0.),T=vec3(1.);
  for(int b=0;b<5;b++){
    H h=trace(ro,rd);
    if(h.k==0){L+=T*env(rd);break;}
    vec3 p=ro+rd*h.t;
    vec3 alb;float rough,F0=.04;
    if(h.k==2){
      vec2 v=cellv(h.c);
      float prof=h.n.z>.5?1.:pow(clamp(p.z/v.r,0.,1.),6.)*.5;
      float g=v.g;
      vec3 e=ramp(pow(g,.9))*(g*g*7.+g*1.7)*prof;
      vec3 add=T*e; if(b>0){float m=max(add.r,max(add.g,add.b));if(m>2.5)add*=2.5/m;}
      L+=add;
      vec2 dp=(p.xy-pool)/vec2(N);alb=vec3(.20,.21,.235)*(.05+.95*exp(-dot(dp,dp)/.13));rough=.28;
    }else{alb=vec3(.010,.0105,.012);rough=.42;}
    float c=clamp(-dot(rd,h.n),0.,1.);
    float Fr=F0+(1.-F0)*pow(1.-c,5.);
    ro=p+h.n*1e-3;
    if(rnd()<Fr){
      rd=normalize(reflect(rd,h.n)+rough*(cosdir(h.n)-h.n));
      if(dot(rd,h.n)<=0.)break;
    }else{
      rd=cosdir(h.n);T*=alb;
    }
  }
  o=vec4(L,1.);
}`;
const VS=`#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0,1);}`;
window.setup=(P)=>{
  const c=document.getElementById('c');c.width=P.W;c.height=P.H;
  const gl=c.getContext('webgl2',{antialias:false,powerPreference:'high-performance'});
  gl.getExtension('EXT_color_buffer_float');
  if(!gl.getExtension('EXT_float_blend'))throw 'no float blend';
  const dbg=gl.getExtension('WEBGL_debug_renderer_info');
  const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s);return s;};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));
  gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw gl.getProgramInfoLog(pr);
  gl.useProgram(pr);
  const u=n=>gl.getUniformLocation(pr,n);
  const raw=Uint8Array.from(atob(P.field),x=>x.charCodeAt(0));
  const tx=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tx);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RG32F,P.nx,P.ny,0,gl.RG,gl.FLOAT,new Float32Array(raw.buffer));
  const rt=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,rt);
  gl.texStorage2D(gl.TEXTURE_2D,1,gl.RGBA32F,P.W,P.H);
  const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,rt,0);
  gl.bindTexture(gl.TEXTURE_2D,tx);
  gl.uniform1i(u('F'),0);gl.uniform2f(u('R'),P.W,P.H);gl.uniform2i(u('N'),P.nx,P.ny);gl.uniform1f(u('HM'),P.hmax);
  for(const k of ['eye','fwd','rgt','upv'])gl.uniform3fv(u(k),P[k]);
  gl.uniform2f(u('pool'),P.nx*.56,P.ny*.52);gl.uniform1f(u('fl'),P.fl);gl.uniform1f(u('ap'),P.ap);gl.uniform1f(u('fd'),P.fd);
  gl.viewport(0,0,P.W,P.H);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.enable(gl.SCISSOR_TEST);
  gl.bindVertexArray(gl.createVertexArray());
  window.G={gl,u,P,pass:0};
  return dbg?gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL):'?';
};
// one sample per pixel, drawn in tiles so the GPU watchdog never trips
window.step=async(n)=>{
  const {gl,u,P}=G,T=Math.ceil(P.H/6);
  for(let k=0;k<n;k++){
    for(let y=0;y<P.H;y+=T){
      gl.scissor(0,y,P.W,T);gl.uniform1i(u('seed'),G.pass);gl.drawArrays(gl.TRIANGLES,0,3);gl.flush();
    }
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


def normal(v):
    v = np.asarray(v, float)
    return v / np.linalg.norm(v)


def camera():
    target = np.array([FRAMES * 0.485, TOKENS * 0.60, 3.0])
    eye = np.array([FRAMES * 0.45, TOKENS * -1.1, 70.0])
    fwd = normal(target - eye)
    rgt = normal(np.cross(fwd, [0, 0, 1]))
    upv = np.cross(rgt, fwd)
    return dict(
        eye=eye.tolist(), fwd=fwd.tolist(), rgt=rgt.tolist(), upv=upv.tolist(),
        fl=1.62, ap=0.5, fd=float(np.linalg.norm(target - eye)),
    )


def render():
    params = dict(W=W, H=H, nx=FRAMES, ny=TOKENS, hmax=float(height.max()) + 0.01,
                  field=base64.b64encode(field.tobytes()).decode(), **camera())
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome", headless=False, args=[
            "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist",
            "--disable-gpu-watchdog", "--window-position=-3000,0", "--window-size=320,240"])
        page = b.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        page.set_content(HTML)
        print("renderer:", page.evaluate("P=>setup(P)", params), flush=True)
        done = 0
        while done < args.spp:
            done = page.evaluate("n=>step(n)", min(8, args.spp - done))
            if done % 80 == 0:
                print(done, flush=True)
        rows = []
        for y in range(0, H, 200):
            h = min(200, H - y)
            raw = base64.b64decode(page.evaluate("([y,h])=>grab(y,h)", [y, h]))
            rows.append(np.frombuffer(raw, np.float32).reshape(h, W, 4)[:, :, :3])
        b.close()
    return np.vstack(rows)[::-1] / args.spp  # GL rows run bottom-up


def grade(hdr):
    s = args.scale
    bloom = sum(w * cv2.GaussianBlur(np.minimum(hdr, 24), (0, 0), sg * s)
                for w, sg in [(0.03, 5), (0.02, 18), (0.014, 60)])
    x = (hdr + bloom) * 1.15
    x = x * (2.51 * x + 0.03) / (x * (2.43 * x + 0.59) + 0.14)     # ACES fit
    x = np.clip(x, 0, 1)
    x = cv2.resize(x, (1600, 900), interpolation=cv2.INTER_AREA)
    yy, xx = np.mgrid[0:900, 0:1600]
    v = 1 - 0.34 * np.clip((((xx - 800) / 1000) ** 2 + ((yy - 450) / 620) ** 2), 0, 1) ** 1.6
    x = x * v[..., None]
    x = np.where(x <= 0.0031308, 12.92 * x, 1.055 * np.power(np.maximum(x, 1e-8), 1 / 2.4) - 0.055)
    x = x * (1 - 0.024) + np.array([0.021, 0.021, 0.026])          # lifts the ground to about #050507
    rng = np.random.default_rng(3)
    x = x + rng.normal(0, 0.0026, x.shape[:2])[..., None]          # fine grain stops banding in the falloff
    return (np.clip(x, 0, 1) * 255 + 0.5).astype(np.uint8)


def main():
    hdr = render()
    img = grade(hdr)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out), img[:, :, ::-1], [cv2.IMWRITE_JPEG_QUALITY, 86, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
    print(out, out.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
