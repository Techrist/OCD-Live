import cv2, numpy as np
m=cv2.imread('warm.png',0)
m[400:,:60]=0; m[300:360,:60]=0
m[425:,:200]=0   # watermark/table noise at bottom-left
# gap closers (coast lines)
cv2.line(m,(152,208),(205,242),255,3)
cv2.line(m,(243,436),(300,432),255,3)
cv2.line(m,(300,432),(350,424),255,3)
cv2.line(m,(366,426),(412,432),255,3)
m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
# remove tiny blobs
n,lab,st,_=cv2.connectedComponentsWithStats(m)
keep=np.zeros_like(m)
for i in range(1,n):
    if st[i,4]>250: keep[lab==i]=255
ff=keep.copy(); h,w=ff.shape
mask=np.zeros((h+2,w+2),np.uint8)
inv=cv2.bitwise_not(keep)
cv2.floodFill(inv,mask,(2,2),0)       # outside -> 0, enclosed stays 255
filled=cv2.bitwise_or(inv,keep)
# madagascar interior may not close; fill its contour
cs,_=cv2.findContours(keep,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
filled2=np.zeros_like(keep)
cv2.drawContours(filled2,cs,-1,255,-1)
filled2=cv2.erode(filled2,np.ones((5,5),np.uint8))
filled2=cv2.GaussianBlur(filled2,(0,0),2); filled2=(filled2>127).astype(np.uint8)*255
cv2.imwrite('africa_mask.png',filled2)
