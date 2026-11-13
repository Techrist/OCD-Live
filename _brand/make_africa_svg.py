import json
d=json.load(open('africa_pts.json'))
A=d['A']
M=[(452,352),(465,360),(463,390),(451,416),(433,433),(420,426),(428,395),(440,372)]
def cr(P):
    n=len(P); out=f'M{P[0][0]} {P[0][1]}'
    for i in range(n):
        p0,p1,p2,p3=P[(i-1)%n],P[i],P[(i+1)%n],P[(i+2)%n]
        c1=(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6)
        c2=(p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6)
        out+=f' C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]} {p2[1]}'
    return out+'Z'
path=cr(A)+cr(M)
open('africa-path.txt','w').write(path)
print(len(path))
