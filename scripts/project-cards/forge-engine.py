#!/usr/bin/env python3
"""Home card for The Forge: a re-render of the project's audio spectrogram world.

Run from the repo root:  python3 scripts/project-cards/forge-engine.py
Writes public/images/project/cards/forge-engine.jpg (1600x900).

Nothing here is drawn by hand. The scene is rebuilt from github.com/rohxnsxngh/hans-aubs
(src/indexForge.js, index.html) with the repo's own three.js: the same 256x400 log-spaced
BufferGeometry, the same four walls, displacement shader and "electric" lookup table, the
same Water planes and fog. The heights come from the project's real track, run through a
real AnalyserNode with the project's settings (fftSize 1024, smoothing 0.5), one row per
50 Hz frame. The track and water normals are downloaded from that public repo into a temp
cache. They are not stored in this repo.

Departures from the original, all for the frame: the camera sits low and three-quarter on
to one wall so it recedes, the displacement is raised and the wall is lit from its own
surface normals so the relief reads, the colormap is kept but muted, the knot is moved
in front of the wall, enlarged, wound (2,3) instead of the project's (20,1), which is
undersampled at 77 segments and reads as a spiked ball, and given an under-light, the water is reduced to a faint
reflection, and fog is off for the knot and lower water. The final image is graded
afterwards (bloom, then a falloff to black towards the frame edges).
"""
import argparse, base64, io, json, mimetypes, os, tempfile, urllib.request
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
from scipy.ndimage import gaussian_filter

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "public/images/project/cards/forge-engine.jpg"
CACHE = Path(os.environ.get("FORGE_CARD_CACHE", Path(tempfile.gettempdir()) / "forge-card-cache"))
RAW = "https://raw.githubusercontent.com/rohxnsxngh/hans-aubs/HEAD/public/"
ASSETS = {"SomethingWicked.mp3": RAW + "Audio/SomethingWicked.mp3", "waternormals.jpg": RAW + "waternormals.jpg"}
W, H = 3200, 1800

# Framing in the original world's coordinates. The knot sits where the project put it, the
# far wall stands behind it, and start is the second of the track the wall holds.
SHOT = dict(eye=[-1450, 22, 800], at=[-1900, 135, -500], fov=26, start=15, relief=1.6, sat=.68, gain=.54,
            smooth=1.6, knotAt=[.2, .065, 520], knotScale=75, knotTilt=[-.45, .4, .3], knotGeo=[77, 8, 2, 3],
            mirror=.1, ripple=8,
            mask=dict(cx=.49, cy=.5, rx=.53, ry=.56, inner=.4))

PAGE = r"""<!doctype html><html><body style="margin:0;background:#000"><canvas id="c"></canvas>
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<script type="x-shader/x-vertex" id="vs">
  attribute float displacement;
  uniform vec3 vLut[256];
  varying vec3 vColor;
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main(){
    int index = int(displacement);
    vColor = vLut[index];
    vec4 world = modelMatrix * vec4(position,1.0);  // displaced in build(), from smoothed heights
    vWorld = world.xyz;
    vNormal = transpose(inverse(mat3(modelMatrix))) * normal;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
</script>
<script type="x-shader/x-fragment" id="fs">
  uniform float sat, gain;
  varying vec3 vColor;
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main(){
    // Surface normal of the displaced wall, so ridges catch light and valleys fall dark.
    vec3 n = normalize(vNormal);
    vec3 view = normalize(cameraPosition - vWorld);
    if (dot(n, view) < 0.0) n = -n;
    float lit = clamp(dot(n, normalize(vec3(.35,.8,.5))), 0.0, 1.0);
    float shade = .1 + 2.1*lit*lit*lit;
    float l = dot(vColor, vec3(.2126,.7152,.0722));
    // Falls dark at the foot of the wall, so no hot line sits on the water.
    float foot = smoothstep(4.0, 46.0, vWorld.y);
    gl_FragColor = vec4(mix(vec3(l), vColor, sat)*gain*shade*foot, 1.0);
  }
</script>
<script type="module">
import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";

const frequencySamples = 256, timeSamples = 400, RATE = 50;

// plotly/colormap "electric", the table the project asked the colormap package for.
const STOPS = [[0,[0,0,0]],[.15,[30,0,100]],[.4,[120,0,100]],[.6,[160,90,0]],[.8,[230,200,0]],[1,[255,250,220]]];
function electric(n){ const out=[]; for(let i=0;i<n;i++){ const t=i/(n-1); let k=0; while(k<STOPS.length-2&&t>STOPS[k+1][0])k++;
  const [a,ca]=STOPS[k],[b,cb]=STOPS[k+1],f=(t-a)/(b-a); out.push(new THREE.Vector3(...ca.map((c,j)=>(c+(cb[j]-c)*f)/255))); } return out; }

async function analyse(start){
  const bytes = await (await fetch("/cache/SomethingWicked.mp3")).arrayBuffer();
  const SR = 44100, frames = timeSamples + 8;
  const ctx = new OfflineAudioContext(2, Math.ceil((frames/RATE+.2)*SR), SR);
  const buf = await ctx.decodeAudioData(bytes);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const an = ctx.createAnalyser(); an.fftSize = 4*frequencySamples; an.smoothingTimeConstant = 0.5;
  src.connect(an); an.connect(ctx.destination); src.start(0,start);
  const rows=[];
  for(let i=0;i<frames;i++){ ctx.suspend((i+1)/RATE).then(()=>{ const d=new Uint8Array(frequencySamples); an.getByteFrequencyData(d); rows.push(d); ctx.resume(); }); }
  await ctx.startRendering();
  return rows;
}

// Light blur of the height grid. Geometry only, so the raw bytes still pick the colour.
function smooth(h,cols,rows,sigma){
  const r=Math.ceil(sigma*3), k=[]; for(let i=-r;i<=r;i++) k.push(Math.exp(-i*i/(2*sigma*sigma)));
  const sum=k.reduce((a,b)=>a+b); const pass=(src,step,n,lines,lineStep)=>{ const out=new Float32Array(src.length);
    for(let l=0;l<lines;l++) for(let i=0;i<n;i++){ let v=0; for(let o=-r;o<=r;o++){ const q=Math.min(n-1,Math.max(0,i+o)); v+=src[l*lineStep+q*step]*k[o+r]; } out[l*lineStep+i*step]=v/sum; }
    return out; };
  return pass(pass(Float32Array.from(h),1,rows,cols,rows),rows,cols,rows,1);
}

function build(rows,p){
  const xSegments=timeSamples, ySegments=frequencySamples, xSize=200, ySize=20;
  const xSeg=xSize/xSegments, ySeg=ySize/ySegments, yPowMax=Math.log(ySize);
  const vertices=[], indices=[], nV=(ySegments+1)*(xSegments+1), heights=new Uint8Array(nV);
  for(let i=0;i<=xSegments;i++){ const x=i*xSeg-xSize/2;
    for(let j=0;j<=ySegments;j++){ const pow=((ySegments-j)/ySegments)*yPowMax; vertices.push(x,-Math.pow(Math.E,pow)+ySize/2+1,0); } }
  for(let i=0;i<xSegments;i++) for(let j=0;j<ySegments;j++){
    const a=i*(ySegments+1)+(j+1), b=i*(ySegments+1)+j, c=(i+1)*(ySegments+1)+j, d=(i+1)*(ySegments+1)+(j+1);
    indices.push(a,b,d,b,c,d); }
  // Same end state as the copyWithin loop after this many frames: newest row at the front.
  const startVal=ySegments+1, endVal=nV-startVal;
  for(const d of rows){ heights.copyWithin(0,startVal,nV+1); heights.set(d,endVal-startVal); }
  const g=new THREE.BufferGeometry(); g.setIndex(indices);
  g.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
  g.setAttribute("displacement",new THREE.Uint8BufferAttribute(heights,1));
  const soft=smooth(heights,xSegments+1,ySegments+1,p.smooth), pos=g.getAttribute("position");
  for(let i=0;i<nV;i++) pos.setZ(i,soft[i]*p.relief/15.5);  // the wall's normal is +z here
  g.computeVertexNormals();
  return g;
}

window.renderCard = async (p) => {
  const canvas=document.getElementById("c");
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1); renderer.setSize(p.w,p.h,false);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const scene=new THREE.Scene(); scene.fog=new THREE.Fog(0x000000,100,2000);
  const camera=new THREE.PerspectiveCamera(p.fov,p.w/p.h,1,12000);
  camera.position.set(...p.eye); camera.lookAt(...p.at); camera.updateMatrixWorld();

  const rows=await analyse(p.start);
  const geo=build(rows,p);
  const lut=electric(256); lut[0]=new THREE.Vector3(0,0,0);
  const mat=new THREE.ShaderMaterial({uniforms:{vLut:{value:lut},sat:{value:p.sat},gain:{value:p.gain}},vertexShader:document.getElementById("vs").text,fragmentShader:document.getElementById("fs").text});
  const Y=new THREE.Vector3(0,1,0), mesh=new THREE.Mesh(geo,mat);
  mesh.position.set(-2000,90,0); mesh.rotateOnAxis(Y,Math.PI/2); mesh.scale.set(20,10,10); scene.add(mesh);
  const m1=mesh.clone(); m1.position.set(0,90,-2000); m1.rotateOnAxis(Y,-Math.PI/2); scene.add(m1);
  const m2=mesh.clone(); m2.position.set(2000,90,0); m2.rotateOnAxis(Y,Math.PI); scene.add(m2);
  const m3=mesh.clone(); m3.position.set(0,90,2000); m3.rotateOnAxis(Y,Math.PI/2); scene.add(m3);

  const normals=await new THREE.TextureLoader().loadAsync("/cache/waternormals.jpg");
  normals.wrapS=normals.wrapT=THREE.RepeatWrapping;
  const sun=new THREE.Vector3().setFromSphericalCoords(1,THREE.MathUtils.degToRad(90),THREE.MathUtils.degToRad(180));
  const wg=new THREE.PlaneGeometry(10000,10000);
  const opts={textureWidth:2048,textureHeight:2048,waterNormals:normals,sunDirection:sun,sunColor:0x000000,distortionScale:p.ripple,fog:true};
  const water=new Water(wg,{...opts,waterColor:0x000000,fog:false}); water.rotation.x=-Math.PI/2; scene.add(water);
  const upper=new Water(wg,{...opts,waterColor:0x000000}); upper.rotation.x=-Math.PI/2; upper.position.set(0,500,0); upper.rotateOnAxis(Y,Math.PI); scene.add(upper);
  water.material.uniforms.time.value=12; upper.material.uniforms.time.value=12;
  // Mirror only: no base lift, no scatter colour, and no tone mapping, which is what turned
  // the wall's yellow base grey in the reflection.
  water.material.fragmentShader=water.material.fragmentShader
    .replace("vec3( 0.1 ) + reflectionSample * 0.9",`reflectionSample * ${p.mirror.toFixed(2)}`)
    .replace("#include <tonemapping_fragment>","");

  scene.add(new THREE.AmbientLight(0xebbe1f,15));
  const dir=new THREE.DirectionalLight(0xebbe1f,15); scene.add(dir);
  // Under-light so the side facing the water holds its silhouette against the wall.
  const under=new THREE.DirectionalLight(0xff8a2a,p.under??6); under.position.set(.2,-1,.6); scene.add(under);
  const knotMat=new THREE.MeshPhongMaterial({color:p.knotColor??0x171005,emissive:0,specular:0xffffff,shininess:15,flatShading:true,fog:false});
  const knot=new THREE.Mesh(new THREE.TorusKnotGeometry(.5,.25,...p.knotGeo),knotMat);
  // Placed by frame position: x, y in NDC, then distance from the eye. Faces the lens, tilted.
  const hit=new THREE.Vector3(p.knotAt[0],p.knotAt[1],.5).unproject(camera).sub(camera.position).normalize();
  knot.scale.setScalar(p.knotScale); knot.position.copy(camera.position).addScaledVector(hit,p.knotAt[2]);
  knot.lookAt(camera.position); knot.rotateX(p.knotTilt[0]); knot.rotateY(p.knotTilt[1]); knot.rotateZ(p.knotTilt[2]); scene.add(knot);

  camera.updateMatrixWorld(); renderer.render(scene,camera);
  return canvas.toDataURL("image/png");
};
window.ready=true;
</script></body></html>"""


def fetch_assets():
    CACHE.mkdir(parents=True, exist_ok=True)
    for name, url in ASSETS.items():
        if not (CACHE / name).exists():
            urllib.request.urlretrieve(url, CACHE / name)


def capture(params):
    def handle(route):
        path = route.request.url.split("card.local", 1)[1].split("?")[0]
        if path == "/":
            return route.fulfill(body=PAGE, content_type="text/html")
        base = {"/three/": REPO / "node_modules/three", "/cache/": CACHE}
        for prefix, root in base.items():
            if path.startswith(prefix):
                f = root / path[len(prefix):]
                ctype = "text/javascript" if f.suffix == ".js" else (mimetypes.guess_type(f.name)[0] or "application/octet-stream")
                return route.fulfill(body=f.read_bytes(), content_type=ctype)
        route.abort()

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", args=["--use-angle=metal", "--enable-gpu-rasterization", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"])
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.on("pageerror", lambda e: print("pageerror", e))
        page.on("console", lambda m: print("console", m.text) if m.type == "error" else None)
        page.route("http://card.local/**", handle)
        page.goto("http://card.local/")
        page.wait_for_function("window.ready===true")
        url = page.evaluate("p => window.renderCard(p)", params)
        browser.close()
    return Image.open(io.BytesIO(base64.b64decode(url.split(",", 1)[1]))).convert("RGB")


def grade(im, mask):
    a = np.asarray(im, np.float32) / 255
    a = a ** 2.2                                     # work in linear light
    bright = np.clip(a - 0.6, 0, None)
    bloom = sum(w * gaussian_filter(bright, (s, s, 0)) for s, w in ((8, .22), (30, .16), (90, .14)))
    a = a + bloom
    h, w = a.shape[:2]
    y, x = np.mgrid[0:h, 0:w]
    # Everything falls to black before the frame edge, so the wall sits on the near-black ground.
    r = np.hypot((x / w - mask["cx"]) / mask["rx"], (y / h - mask["cy"]) / mask["ry"])
    t = np.clip((r - mask["inner"]) / (1 - mask["inner"]), 0, 1)
    a *= (1 - t * t * (3 - 2 * t))[..., None] ** 2
    a = np.clip(a, 0, 1) ** (1 / 2.2)
    a = a + (5 / 255) * (1 - a) * 1                  # lift pure black to the card ground, #050505
    a += np.random.default_rng(7).normal(0, 0.9 / 255, a.shape)  # dither out banding in the falloff
    return Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)).resize((1600, 900), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=OUT)
    ap.add_argument("--override", help="JSON merged over SHOT, for trying framings")
    a = ap.parse_args()
    fetch_assets()
    params = {**SHOT, "w": W, "h": H, **json.loads(a.override or "{}")}
    im = grade(capture(params), params["mask"])
    a.out.parent.mkdir(parents=True, exist_ok=True)
    im.save(a.out, quality=86, subsampling=0, optimize=True, progressive=True)
    print(a.out, a.out.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
