Telescopes measure the polarisation of light from distant objects to learn about their shapes, magnetic fields and dust. But when the Moon is up, **the sky itself is polarised**, and that background light gets mixed into every measurement. In this paper we measured that background at one of the world's best observatories and found which physics explains it.

## What we did

During two full-Moon nights in January 2021 we pointed **FORS2**, an instrument on the Very Large Telescope (VLT) at ESO's Cerro Paranal in Chile, at fourteen *blank fields*: patches of sky with no bright stars or galaxies. FORS2 splits light into two perpendicular polarisations, and a rotating half-wave plate lets us measure the Stokes parameters $q$ and $u$ at four angles. We did this in four colours: **B** (blue), **V** (green), **R** (red) and **I** (near-infrared).

Because the fields were spread across the sky, each one sat at a different angular distance from the Moon, the **scattering angle** $\gamma$. That is the key variable: the models all predict how polarisation changes with $\gamma$.

## What we found

```plot
{"src": "figures/paranal-dop.json", "caption": "Measured degree of polarisation on the clear night (27 Jan 2021) in four bands, with the single-scattering model scaled by each band's maximum polarisation A(λ). Field 1101-264, taken as the Moon set, is left out.", "height": 420}
```

- The polarisation **peaks about 90° from the Moon**, just as Rayleigh scattering predicts.
- The peak is far below the 100% of pure Rayleigh theory, and it **drops with wavelength**: about 60% in blue light and 30% in near-infrared light.
- Rayleigh models fit the polarisation well, but only with a **depolarisation factor** that grows with wavelength (from $\delta \approx 0.035$ in B to $0.111$ in I).
- The **brightness** of the sky tells a different story: it rises steeply close to the Moon, which Rayleigh scattering cannot reproduce. That needs **Mie scattering** by larger aerosol particles.

## Which model wins

We compared single Rayleigh scattering, Mie scattering, the multiple-scattering model of Berry et al. (2004) and combinations of them, with Bayesian model comparison. The best description of polarisation **and** intensity together is

$$\text{Rayleigh} \;+\; \text{Mie} \;+\; \text{unpolarised multiple scattering},$$

with the Mie and multiple-scattering parts growing in importance at longer wavelengths, where larger particles matter more.

:::note The practical result
If you only need to **predict and correct** the moonlit sky's polarisation in your data, a simple anisotropic Rayleigh model with a wavelength-dependent depolarisation factor does an excellent job.
:::

## Why it matters

Polarimetry is used to study supernovae, active galaxies, kilonovae and the dust in galaxies. All of these are faint, so the background matters. This work gives observers at Paranal a way to model the moonlit sky's contribution, and it shows that the atmosphere above the observatory contains enough large aerosols to leave a clear signature.

## Try it yourself

The [Sky Lab](index.html#lab) runs these models for any night and shows our measured fields at their positions in the sky.
