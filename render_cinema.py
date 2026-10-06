"""Original procedural 3D motion background, no stock or client footage."""
from pathlib import Path
import math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
ROOT=Path(__file__).parent
W,H,FPS,N=960,720,24,192
y,x=np.mgrid[0:H,0:W]
g=np.exp(-(((x-520)/400)**2+((y-340)/280)**2))
b=np.exp(-(((x-740)/300)**2+((y-500)/180)**2))
base=np.zeros((H,W,3),dtype=np.float32)+[5,14,20]
base+=g[:,:,None]*[9,24,17]+b[:,:,None]*[4,12,25]
base=Image.fromarray(np.uint8(np.clip(base,0,255)))
out=ROOT/'cinema-loop.mp4'
p=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','medium','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',str(out)],stdin=subprocess.PIPE)
def project(a,t):
    cx,sx=math.cos(.58),math.sin(.58)
    cy,sy=math.cos(t),math.sin(t)
    q=a.copy();q[:,1],q[:,2]=a[:,1]*cx-a[:,2]*sx,a[:,1]*sx+a[:,2]*cx
    r=q.copy();r[:,0],r[:,2]=q[:,0]*cy+q[:,2]*sy,-q[:,0]*sy+q[:,2]*cy
    scale=720/(3.9-r[:,2]);return np.column_stack((W*.54+r[:,0]*scale,H*.49-r[:,1]*scale))
u=np.linspace(0,math.tau,161)
for frame in range(N):
    t=frame/N*math.tau
    lines=Image.new('RGB',(W,H));d=ImageDraw.Draw(lines)
    for j in range(22):
        v=j/22*math.tau
        a=np.column_stack(((1.03+.16*math.cos(v))*np.cos(u),(1.03+.16*math.cos(v))*np.sin(u),np.full(len(u),.16*math.sin(v))))
        points=project(a,t*.0+.28*math.sin(t))
        color=(int(38+35*(1+math.cos(v))),int(76+54*(1+math.cos(v))),int(77+36*(1+math.sin(v))))
        d.line([tuple(q) for q in points],fill=color,width=1)
    for j in range(48):
        v=np.linspace(0,math.tau,32);a0=j/48*math.tau+t
        a=np.column_stack(((1.03+.16*np.cos(v))*math.cos(a0),(1.03+.16*np.cos(v))*math.sin(a0),.16*np.sin(v)))
        d.line([tuple(q) for q in project(a,.28*math.sin(t))],fill=(30,75,71),width=1)
    for k in range(3):
        a=np.column_stack((1.45*np.cos(u),.13*np.sin(u),1.45*np.sin(u)))
        a[:,1]+=(-.55+k*.55)
        d.line([tuple(q) for q in project(a,.15*math.sin(t)+k*.2)],fill=(18,56,71),width=1)
    glow=lines.filter(ImageFilter.GaussianBlur(15))
    img=Image.fromarray(np.uint8(np.clip(np.array(base,dtype=float)+np.array(lines)*.9+np.array(glow)*1.8,0,255)))
    if frame==0:img.save(ROOT/'cinema-poster.webp',quality=84)
    p.stdin.write(img.tobytes())
p.stdin.close();assert p.wait()==0
web=ROOT/'cinema-web.mp4'
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(out),'-vf','scale=720:540,fps=18','-an','-c:v','libx264','-crf','31','-preset','fast','-pix_fmt','yuv420p','-movflags','+faststart',str(web)],check=True)
web.replace(out)
print(out.name,out.stat().st_size)
