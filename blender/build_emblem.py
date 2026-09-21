"""Trace the ten alpha components in icon-white.png into the WSU club GLB."""
import bpy, os, json, math, struct
from collections import deque
from mathutils import Matrix

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(ROOT,'public','brand','icon-white.png')
GLB=os.path.join(ROOT,'public','models','club-emblem.glb')
BLEND=os.path.join(ROOT,'blender','club-emblem.blend')
REPORT=os.path.join(ROOT,'blender','asset-report.json')
os.makedirs(os.path.dirname(GLB),exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def mat(name,c,metal,rough):
 m=bpy.data.materials.new(name); m.use_nodes=True; b=m.node_tree.nodes.get('Principled BSDF'); b.inputs['Base Color'].default_value=(*c,1); b.inputs['Metallic'].default_value=metal; b.inputs['Roughness'].default_value=rough; return m
BLACK=mat('Ceramic near-black',(.006,.006,.006),.38,.18); GOLD=mat('WSU gold spark',(.85,.40,.003),.72,.16); SILVER=mat('Polished silver sidewalls',(.65,.65,.65),.92,.12)
im=bpy.data.images.load(SRC,check_existing=False); w,h=im.size[:]; px=im.pixels[:]
mask=[[px[(y*w+x)*4+3]>=.5 for x in range(w)] for y in range(h)]; seen=set(); comps=[]
for y in range(h):
 for x in range(w):
  if not mask[y][x] or (x,y) in seen: continue
  q=deque([(x,y)]); seen.add((x,y)); c=[]
  while q:
   X,Y=q.popleft(); c.append((X,Y))
   for a,b in ((X-1,Y),(X+1,Y),(X,Y-1),(X,Y+1)):
    if 0<=a<w and 0<=b<h and mask[b][a] and (a,b) not in seen: seen.add((a,b)); q.append((a,b))
  comps.append(c)
if len(comps)!=10: raise RuntimeError('Expected 10 alpha components, found '+str(len(comps)))
def edges(c):
 c=set(c); e={}
 for x,y in c:
  if (x,y-1) not in c:e[(x,y)]=(x+1,y)
  if (x+1,y) not in c:e[(x+1,y)]=(x+1,y+1)
  if (x,y+1) not in c:e[(x+1,y+1)]=(x,y+1)
  if (x-1,y) not in c:e[(x,y+1)]=(x,y)
 loops=[]
 while e:
  start=next(iter(e)); cur=start; out=[start]
  while True:
   cur=e.pop(cur)
   if cur==start:break
   out.append(cur)
  loops.append(out)
 return max(loops,key=len)
def dist(p,a,b):
 dx,dy=b[0]-a[0],b[1]-a[1]
 return math.hypot(p[0]-a[0],p[1]-a[1]) if not(dx or dy) else abs(dy*p[0]-dx*p[1]+b[0]*a[1]-b[1]*a[0])/math.hypot(dx,dy)
def rdp(q,t=1):
 if len(q)<3:return q
 k=max(range(1,len(q)-1),key=lambda i:dist(q[i],q[0],q[-1]))
 if dist(q[k],q[0],q[-1])>t:return rdp(q[:k+1],t)[:-1]+rdp(q[k:],t)
 return [q[0],q[-1]]
def contour(c):
 q=edges(c); k=max(range(len(q)),key=lambda i:(q[i][0]-q[0][0])**2+(q[i][1]-q[0][1])**2); return rdp(q[k:]+q[:k]+[q[k]])[:-1]
def info(c):
 xs=[p[0] for p in c];ys=[p[1] for p in c]; x,y=c[len(c)//2]; r,g,b,a=px[(y*w+x)*4:(y*w+x)*4+4]
 return {'c':c,'lo':(min(xs),min(ys)),'hi':(max(xs),max(ys)),'mid':(sum(xs)/len(c),sum(ys)/len(c)),'gold':r>.7 and g>.2 and b<.2}
items=[info(c) for c in comps]; spark=next(i for i in items if i['gold']); rem=[i for i in items if i is not spark]
central=sorted(rem,key=lambda i:abs(i['mid'][0]-w/2))[:3]; leaves=[i for i in rem if i not in central]
stem=max(central,key=lambda i:i['mid'][1]); chevs=sorted([i for i in central if i is not stem],key=lambda i:i['mid'][1],reverse=True)
named=[('spark',spark),('stem',stem),('chevron_0',chevs[0]),('chevron_1',chevs[1])]
for side,prefix in (([i for i in leaves if i['mid'][0]<w/2],'leaf_L_'),([i for i in leaves if i['mid'][0]>w/2],'leaf_R_')):
 for n,i in enumerate(sorted(side,key=lambda i:i['mid'][1],reverse=True)):named.append((prefix+str(n),i))
if len(named)!=10:raise RuntimeError('component classification failed')
ys=[p[1] for _,i in named for p in i['c']]; sc=5/(max(ys)-min(ys)+1); ox=w/2;oy=(min(ys)+max(ys)+1)/2
def build(name,i):
 p=[((x-ox)*sc,(y-oy)*sc) for x,y in contour(i['c'])]; cx=(min(x for x,y in p)+max(x for x,y in p))/2;cy=(min(y for x,y in p)+max(y for x,y in p))/2
 c=bpy.data.curves.new(name+'_trace','CURVE');c.dimensions='2D';c.fill_mode='BOTH';c.extrude=.12;c.bevel_depth=.035;c.bevel_resolution=4;c.materials.append(GOLD if name=='spark' else BLACK)
 if name!='spark':c.materials.append(SILVER)
 s=c.splines.new('BEZIER');s.bezier_points.add(len(p)-1)
 for j,(v,(x,y)) in enumerate(zip(s.bezier_points,p)):
  prev=p[(j-1)%len(p)]; nxt=p[(j+1)%len(p)]; a=(x-prev[0],y-prev[1]); b=(nxt[0]-x,nxt[1]-y); la=math.hypot(*a);lb=math.hypot(*b)
  turn=math.degrees(math.acos(max(-1,min(1,(a[0]*b[0]+a[1]*b[1])/(la*lb))))) if la and lb else 180
  v.co=(x-cx,y-cy,0); v.handle_left_type=v.handle_right_type=('VECTOR' if turn>40 else 'AUTO')
 s.use_cyclic_u=True;o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.location=(cx,cy,0);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)
 if name!='spark':
  for f in o.data.polygons:
   if abs(f.normal.z)<.55:f.material_index=1;f.use_smooth=True
 return o
objs=[build(n,i) for n,i in named]
# Bake Blender XZ/-Y basis; exporter writes glTF XY/+Z.
R=Matrix.Rotation(math.radians(90),4,'X')
for o in objs:o.data.transform(R);o.location=R@o.location;o.rotation_euler=(0,0,0)
# Native-only viewing rig and a gentle four-second leaf gust; neither ships in GLB.
for o in objs:
 if o.name.startswith('leaf_'):
  o.keyframe_insert('rotation_euler',frame=1);o.rotation_euler.y=(.075 if '_L_' in o.name else -.075);o.keyframe_insert('rotation_euler',frame=49);o.rotation_euler.y=0;o.keyframe_insert('rotation_euler',frame=97)
cam_data=bpy.data.cameras.new('Preview Camera');cam=bpy.data.objects.new('Preview Camera',cam_data);bpy.context.collection.objects.link(cam);cam.location=(0,-8,0);cam.rotation_euler=(math.radians(90),0,0)
for x,z,energy in ((-4,3,800),(4,2,600)):
 data=bpy.data.lights.new('Preview Key','AREA');data.energy=energy;data.shape='DISK';data.size=4;light=bpy.data.objects.new('Preview Key',data);bpy.context.collection.objects.link(light);light.location=(x,-4,z);light.rotation_euler=(math.radians(90),0,0)
bpy.context.scene.render.fps=24;bpy.context.scene.frame_end=97;bpy.context.scene.frame_set(1);bpy.ops.wm.save_as_mainfile(filepath=BLEND)
bpy.ops.object.select_all(action='DESELECT')
for o in objs:o.select_set(True)
bpy.context.view_layer.objects.active=objs[0];bpy.ops.export_scene.gltf(filepath=GLB,export_format='GLB',use_selection=True,export_animations=False,export_materials='EXPORT')
raw=open(GLB,'rb').read();jl,_=struct.unpack_from('<I4s',raw,12);doc=json.loads(raw[20:20+jl]);mins=[1e9]*3;maxs=[-1e9]*3;names=[]
for n in doc['nodes']:
 if 'mesh' not in n:continue
 names.append(n['name']);t=n.get('translation',[0,0,0]);s=n.get('scale',[1,1,1])
 for pr in doc['meshes'][n['mesh']]['primitives']:
  a=doc['accessors'][pr['attributes']['POSITION']]
  for k in range(3):mins[k]=min(mins[k],a['min'][k]*s[k]+t[k]);maxs[k]=max(maxs[k],a['max'][k]*s[k]+t[k])
bounds={'min':[round(v,5) for v in mins],'max':[round(v,5) for v in maxs],'size':[round(maxs[i]-mins[i],5) for i in range(3)]}
if sorted(names)!=sorted(o.name for o in objs) or not(bounds['size'][1]>4.9 and bounds['size'][2]<.4):raise RuntimeError('GLTF validation failed '+repr((names,bounds)))
report={'source':'icon-white.png alpha trace','part_count':10,'parts':sorted(names),'gltf_axis_contract':'XY plane front +Z','gltf_bounds':bounds,'materials':{'black':'Ceramic near-black / Polished silver sidewalls','spark':'WSU gold spark on all faces'}}
open(REPORT,'w',encoding='utf8').write(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
