"""Builds data/scatter-tables.json for the Sky Lab (step 4).
Run next to your own analysis code (mie_size_dist.py, quadrature.py, miepython 2.5.5) and moonlit_data.csv:
    python tools/build_scatter_tables.py
Rayleigh and Mie (4 Jones+13 species) amplitudes are normalised as phase functions; eta and u are fitted
to the clear-night polarisation and intensity (counts/s) of each band."""
import numpy as np, pandas as pd, json
from scipy.optimize import least_squares
from mie_size_dist import mie_size_dist
ang=np.arange(0,181,1.0); mu=np.cos(np.radians(ang)); sinw=np.sin(np.radians(ang))
# Jones+13 aerosol species, as in fit_moonjones.calculate_mie / allmie defaults
n=[3.2e3,2.9e3,3e-1,4.49]; R=[0.01,0.058,0.9,0.217]; logs=[0.161,0.217,0.380,0.248]; w=[1.0,0.45,0.05,1.0]
wave={'B':0.4413,'V':0.5512,'R':0.6586,'I':0.806}          # fit_moonjones fwave/1e4
m_tab4={'B':1.05,'V':1.13,'R':1.19,'I':1.18}                  # Table 4, Rayleigh & Mie & unpol-MS
def norm(x1,x2):
    I=(x1+x2)/2; c=2*np.pi*np.trapezoid(I*sinw,np.radians(ang)); return x1/c,x2/c
out={'angles':ang.tolist(),'bands':{}}
df=pd.read_csv('moonlit_data.csv')
for b in 'BVRI':
    x1=np.zeros_like(ang); x2=np.zeros_like(ang)
    for i in range(4):
        o=mie_size_dist('log_normal',n[i],[R[i],np.exp(logs[i])],1/wave[b],m_tab4[b],Dqv=mu)
        x1+=w[i]*2/wave[b]*o['X1sq']; x2+=w[i]*2/wave[b]*o['X2sq']
    m1,m2=norm(x1,x2); r1,r2=norm(np.ones_like(ang),mu**2)
    d=df[(df.BAND==b)&(df.CONDITION=='ok')&df['OBS TIME MED'].str.startswith('2021')]
    g=d.GAMMA.values; P=d.pol_unc.values; eP=d.erpol.values; Iobs=(d.I/d.EXPTIME).values; eI=(d.erI/d.EXPTIME).values
    it=lambda a: np.interp(g,ang,a)
    def model(par):
        eta,u=par; s1=eta*r1+(1-eta)*m1; s2=eta*r2+(1-eta)*m2
        I=(s1+s2)/2*(1+u); p=(s1-s2)/2/I
        return it(p), it(I)
    def resid(par):
        p,I=model(par[:2]); C=par[2]
        return np.concatenate([(p-P)/np.maximum(eP,0.01), (C*I-Iobs)/np.maximum(eI,0.03*Iobs)])
    best=None
    for e0 in (0.3,0.6,0.9):
        r=least_squares(resid,[e0,0.2,Iobs.mean()/0.1],bounds=([0,0,0],[1,10,np.inf]))
        if best is None or r.cost<best.cost: best=r
    eta,u,C=best.x
    p,I=model([eta,u]); rmsP=np.sqrt(np.mean((p-P)**2))
    pm=(m1-m2)/(m1+m2)
    print(b,'m',m_tab4[b],'eta(Rayleigh frac)',round(eta,3),'u(unpol MS)',round(u,3),'rms DoP',round(rmsP,3),
          '| Mie alone p(90)',round(pm[90],2),'| R/M weight ratio',round(eta/(1-eta),2) if eta<1 else 'inf')
    out['bands'][b]={'wave':wave[b],'m':m_tab4[b],'ray_s1':r1.round(6).tolist(),'ray_s2':r2.round(6).tolist(),
        'mie_s1':m1.round(8).tolist(),'mie_s2':m2.round(8).tolist(),'fit':{'eta':round(eta,4),'u':round(u,4),'C':C}}
json.dump(out,open('data/scatter-tables.json','w'))
