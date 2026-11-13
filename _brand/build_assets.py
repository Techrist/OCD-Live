import re,json,os
svg=open('_brand/logo-traced.svg').read()
vb=re.search(r'viewBox="([^"]+)"',svg).group(1)
paths=re.findall(r' d="([^"]+)"',svg)
orange,dark=paths
africa=open('_brand/africa-path.txt').read(); AVB=open('_brand/africa-vb.txt').read()
ORANGE='#C76524'; INK='#0A0A10'
def logo(o,k): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="OCD Live"><path fill="{o}" fill-rule="evenodd" d="{orange}"/><path fill="{k}" fill-rule="evenodd" d="{dark}"/></svg>'
open('public/brand/logo.svg','w').write(logo(ORANGE,INK))
open('public/brand/logo-white.svg','w').write(logo('#FFFFFF','#FFFFFF'))
open('public/brand/africa.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{AVB}" role="img" aria-label="Afrique"><path fill="#F4F1EC" stroke="#F6B24A" stroke-width="6" stroke-linejoin="round" d="{africa}"/></svg>')
# favicon: square, white OCD mark on copper
x,y,w,h=map(float,vb.split())
oh=(130*0+0)
fav=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="{ORANGE}"/><svg x="6" y="16" width="52" height="32" viewBox="{x} {y} {w} {h*0.66}" preserveAspectRatio="xMidYMid meet"><path fill="#fff" fill-rule="evenodd" d="{orange}"/></svg></svg>'
open('src/app/icon.svg','w').write(fav)
ts=f'''// Généré depuis la capture du mur OCD Live (voir _brand/). Ne pas éditer à la main.
export const LOGO_VIEWBOX = "{vb}";
export const LOGO_OCD_PATH = "{orange}";
export const LOGO_LIVE_PATH = "{dark}";
export const AFRICA_VIEWBOX = "{AVB}";
export const AFRICA_PATH = "{africa}";
'''
open('src/components/brand/brand-paths.ts','w',encoding='utf-8').write(ts)
print(vb)
