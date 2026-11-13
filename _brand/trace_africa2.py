import cv2, numpy as np
im=cv2.imread('_brand/africa_outline.png',0)
h,w=im.shape; print(h,w)
S=4
m=(im<90).astype(np.uint8)*255
m[int(h*0.86):, :int(w*0.46)]=0   # badge "Sous licence"
m=cv2.resize(m,None,fx=S,fy=S,interpolation=cv2.INTER_LINEAR); m=(m>100).astype(np.uint8)*255
m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
cs,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
cs=[c for c in cs if cv2.contourArea(c)>800*S*S/4]
print(len(cs),[cv2.contourArea(c)/S/S for c in cs])
x,y,bw,bh=cv2.boundingRect(np.vstack(cs))
sc=500/(bw)
out=[]
for c in cs:
    c=cv2.approxPolyDP(c,S*0.8,True)[:,0,:].astype(float)
    c[:,0]=(c[:,0]-x)*sc; c[:,1]=(c[:,1]-y)*sc
    out.append('M'+' L'.join(f'{a:.1f} {b:.1f}' for a,b in c)+'Z')
H=bh*sc
d=''.join(out); print(len(d),bw,bh,H)
open('_brand/africa-path.txt','w').write(d)
open('_brand/africa-vb.txt','w').write(f'0 0 500 {H:.0f}')
