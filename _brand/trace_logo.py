import cv2, numpy as np
im=cv2.imread('capture.png')[110:240,160:390]
S=6
big=cv2.resize(im,None,fx=S,fy=S,interpolation=cv2.INTER_CUBIC)
hsv=cv2.cvtColor(big,cv2.COLOR_BGR2HSV)
orange=((hsv[:,:,1]>115)&(hsv[:,:,0]<26)&(hsv[:,:,2]>60)).astype(np.uint8)*255
dark=((big.astype(int).sum(2)<230)).astype(np.uint8)*255
H,W=orange.shape
# restrict: orange only above y=205*? (Live text zone starts ~ y>=88 in crop)
orange[int(88*S):,:]=0
dark[:int(80*S),:]=0
def clean(m,k=9):
    m=cv2.GaussianBlur(m,(0,0),S*0.9); m=(m>127).astype(np.uint8)*255
    n,lab,st,_=cv2.connectedComponentsWithStats(m)
    out=np.zeros_like(m)
    for i in range(1,n):
        if st[i,4]>600*S: out[lab==i]=255
    return out
orange=clean(orange); dark=clean(dark)
cv2.imwrite('mask_orange.png',orange); cv2.imwrite('mask_dark.png',dark)
def path(mask):
    cs,h=cv2.findContours(mask,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
    d=[]
    for c in cs:
        a=cv2.approxPolyDP(c,S*0.35,True)[:,0,:]/S
        if len(a)<3: continue
        d.append('M'+' L'.join(f'{x:.1f} {y:.1f}' for x,y in a)+'Z')
    return ''.join(d)
x0=min(np.where(orange.any(0))[0].min(),np.where(dark.any(0))[0].min())/S
x1=max(np.where(orange.any(0))[0].max(),np.where(dark.any(0))[0].max())/S
y0=np.where(orange.any(1))[0].min()/S; y1=np.where(dark.any(1))[0].max()/S
print(x0,x1,y0,y1)
pad=2
vb=f'{x0-pad:.1f} {y0-pad:.1f} {x1-x0+2*pad:.1f} {y1-y0+2*pad:.1f}'
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="OCD Live"><path fill="#C76524" fill-rule="evenodd" d="{path(orange)}"/><path fill="#0A0A10" fill-rule="evenodd" d="{path(dark)}"/></svg>'
open('logo-traced.svg','w').write(svg); print(len(svg),vb)
