## Why this study matters

Polarimetry measures how much of the light from an object is polarised, and in which direction. It reveals things that brightness and colour alone cannot: the geometry of supernova explosions, the structure of active galaxies, the dust in galaxies and the make-up of kilonovae. These signals are often only a few percent, so every ground-based polarimetric observation has to be **calibrated** for everything else that adds polarised light along the way.

At night, the biggest of those contributions is the **Moon**. It is by far the brightest source of light in our night sky, and around full Moon the moonlight scattered by Earth's atmosphere dominates the sky background. That scattered light is **polarised**, so it leaks into every measurement made while the Moon is up.

The brightness of the moonlit sky above ESO's Paranal Observatory had been modelled in detail, but its **polarisation** had never been measured. This paper measures it and tests which physical model describes it.

## The current model: Rayleigh scattering

The standard description of a polarised sky is **Rayleigh scattering**: light scattered by particles much smaller than its wavelength, such as the nitrogen and oxygen molecules of air. Near full Moon the incoming moonlight is almost unpolarised, and what matters is the **scattering angle** $\gamma$, the angle on the sky between the Moon and the point we look at. For a target at zenith distance $\theta_T$ and azimuth $\phi_T$, and the Moon at $\theta_M$, $\phi_M$,

$$\cos\gamma = \cos\theta_T\cos\theta_M + \sin\theta_T\sin\theta_M\cos(\phi_M-\phi_T).$$

Single Rayleigh scattering then predicts a degree of polarisation

$$p(\gamma) = \frac{\sin^2\gamma}{1+\cos^2\gamma}:$$

- **no polarisation** towards the Moon ($\gamma = 0^\circ$) and the anti-Moon ($\gamma = 180^\circ$), the two *neutral points*;
- **maximum polarisation**, 100%, on the great circle $90^\circ$ from the Moon;
- the polarisation is **perpendicular to the scattering plane** (Moon, scattering point, observer), so it draws circles around the Moon.

### Adding the Sun: Stokes parameters

Light is described by its **Stokes vector** $\mathbf{S} = (I, Q, U, V)$: the total intensity $I$, the two linear polarisation components $Q$ and $U$, and the circular component $V$ (zero here). The degree and angle of linear polarisation follow from it:

$$p = \frac{\sqrt{Q^2+U^2}}{I}, \qquad \chi = \tfrac{1}{2}\arctan\frac{U}{Q}.$$

Scattering is a matrix acting on that vector. Unpolarised moonlight, $\mathbf{S}_\text{in} = (1, 0, 0, 0)$, is first rotated into the scattering plane, scattered by the Rayleigh matrix $\mathbf{M}(\gamma)$, and rotated back to the observer's reference frame:

$$\mathbf{S} = \mathbf{R}(\pi-\beta')\,\mathbf{M}(\gamma)\,\mathbf{R}(-\beta)\,\mathbf{S}_\text{in}.$$

This matters at **twilight**, when the sky is lit by the Sun and the Moon at the same time. Their degrees of polarisation cannot simply be added, because each source polarises the sky in a different direction. Their **Stokes vectors**, expressed in the same reference frame, can:

$$\mathbf{S}_\text{sky} = w_\text{Moon}\,\mathbf{S}_\text{Moon} + w_\text{Sun}\,\mathbf{S}_\text{Sun}, \qquad p = \frac{\sqrt{Q_\text{sky}^2+U_\text{sky}^2}}{I_\text{sky}}.$$

The weights $w$ say how much each source lights the sky. The Moon only reflects a fraction of the sunlight that hits it, its **albedo** (about 0.1), so the Sun dominates until it is well below the horizon. Once it is more than 18° below the horizon (the end of astronomical twilight), only the Moon is left. This is how my master's thesis modelled the twilight data.

Try it below. Move through the night of our observations at Paranal, switch the Sun or the Moon on and off, or place the Moon yourself. The depolarisation factor $\delta$ is explained further down.

```skysim
{"model": "rayleigh", "night": "figures/paranal-2021-01-26.json", "caption": "Rayleigh scattering of moonlight and sunlight over Paranal. Zenith at the centre, horizon at the edge, north up and east left. Colour is the degree of polarisation; the white dashes show its direction. Sun and Moon positions are computed for Paranal; their relative brightness at twilight is a rough approximation, and the Sun is switched off more than 18° below the horizon."}
```

Notice how, early in the evening, the Sun still dominates even after sunset, and the pattern swings round as the Moon takes over.

## Multiple scattering: the Berry model

Single scattering assumes each photon is scattered once on its way to us. In reality, some light is scattered several times. Observations of the daytime sky show **four** neutral points instead of two (Horváth et al. 2002): the Babinet and Brewster points close to the Sun, and the Arago and second Brewster points close to the anti-Sun. The same happens at night with the Moon.

[Berry, Dennis & Lee (2004)](https://doi.org/10.1088/1367-2630/6/1/162) found a simple way to describe this. They write the sky's polarisation as a complex number $w(\xi) = |w|\,e^{2i\chi}$, where $\xi$ is the position on the sky in a stereographic projection, $|w|$ is the degree of polarisation and $\chi$ its angle:

$$w(\xi) = \frac{4\,(\xi-\xi_+)(\xi-\xi_-)\left(\xi+\frac{1}{\xi_+^*}\right)\left(\xi+\frac{1}{\xi_-^*}\right)}{\left(1+|\xi|^2\right)^2\left|\xi_+ + \frac{1}{\xi_+^*}\right|\left|\xi_- + \frac{1}{\xi_-^*}\right|}.$$

The single neutral point at the Moon is split into two, $\xi_+$ and $\xi_-$, above and below it; their mirror images give the two points near the anti-Moon. One parameter, $L$, sets how far apart they are: an angular separation of $4\arctan L$. With $L = 0$ the pattern goes back to single scattering.

```skysim
{"model": "berry", "night": "figures/paranal-2021-01-26.json", "caption": "The Berry et al. (2004) multiple-scattering pattern over Paranal. Green circles mark the two neutral points near the Moon (or Sun). Increase L to separate them."}
```

## Other considerations: why Mie scattering matters

The real atmosphere is messier than either model.

**Depolarisation.** Air molecules are not perfect spheres. O$_2$, for example, is slightly anisotropic, and ice crystals and dust grains are far from spherical. This is described by a depolarisation factor $\delta$, which lowers the polarisation everywhere (try it with the $\delta$ slider in the first simulation):

$$p(\gamma) = \frac{\sin^2\gamma}{1+\cos^2\gamma + 2\delta/(1-\delta)}.$$

For air, experiments give $\delta \approx 0.03$–$0.04$.

**The state of the atmosphere.** Wind and turbulence lift dust and keep aerosols in the air, thin clouds come and go, and humidity changes the particles. The mix of particles above the telescope changes from night to night.

**Composition.** Besides molecules, the air holds **aerosols**: dust, sea salt, sulphates and other particles, from a few hundredths of a micron to a few microns across. These are comparable to the wavelength of light, so Rayleigh's approximation no longer holds. They need **Mie scattering**, the full solution for spheres of any size.

Mie scattering behaves very differently: larger particles polarise light much less, and they scatter strongly **forwards**, making the sky much brighter close to the Moon.

So the polarisation of the moonlit sky tells us not only about the Moon, but about **what the atmosphere is made of**.

## What we did

### The observations

We observed with **FORS2**, the FOcal Reducer and low dispersion Spectrograph on ESO's Very Large Telescope at Cerro Paranal, in its imaging polarimetry mode (IPOL), through programme 106.21L9. The observations were taken on the full-Moon nights of **25 and 26 January 2021**.

Instead of stars or galaxies, we pointed at **blank fields**: patches of sky with no bright sources, the kind normally used as flat fields for calibration. In a blank field, every pixel sees only the sky, so the whole 7′ field of view measures the moonlit background. Because the models differ mainly in how polarisation changes with the angle from the Moon, we chose **fourteen fields spread over a wide range of scattering angles**, from about 17° to 132°, including some close to the Moon to look for neutral points.

Each field was observed in four filters, **B, V, R and I** (about 441, 551, 659 and 806 nm). Because we wanted to measure the sky itself, exposure times were set to collect more than about 30 000 counts per frame. Fields far from the Moon are darker, so they needed longer exposures. On average we exposed 198, 94, 63 and 63 seconds per half-wave plate angle in B, V, R and I.

Each field gives us its **degree of polarisation** $p$ and **angle** $\psi$, in each band.

:::note How FORS2 measures polarisation
FORS2 splits the light into **two beams with perpendicular polarisations** and records both at once. A rotating plate in front of it swaps which polarisation goes where; we took four positions. Comparing the two beams at the four positions gives the Stokes parameters $q$ and $u$, and from them $p = \sqrt{q^2+u^2}$ and $\psi = \tfrac12\arctan(u/q)$. Because a blank field is evenly lit, we use the whole image and take the median, which also removes a small instrumental pattern across the field.
:::

### Fitting the models

We compared the data with every model of the previous sections: anisotropic Rayleigh, Mie with four aerosol species (Jones et al. 2013), the Berry multiple-scattering model, and combinations of them. Each model was fitted to the **polarisation** alone, to the **intensity** alone, and to **both together**, first band by band and then to all four bands at once.

The fits use Levenberg–Marquardt minimisation (lmfit) followed by Markov chain Monte Carlo sampling (emcee) to get the uncertainties. To compare models with different numbers of free parameters, we used the **Bayesian information criterion** (BIC), which rewards a good fit but penalises extra parameters. Lower is better, and a difference above 10 is a strong preference.

## What we found

### The data

The polarisation of the moonlit sky follows the shape Rayleigh scattering predicts. It is close to zero near the Moon, **peaks near 90°** and falls again beyond. But it never reaches 100%: the peak is about **60% in B** and drops to about **30% in I**. The sky is much **less polarised at longer wavelengths**.

The **brightness** tells a different story. It rises steeply close to the Moon, much more than Rayleigh scattering allows. The **polarisation angle** roughly follows the direction expected from the geometry alone (perpendicular to the scattering plane), with a few clear exceptions near γ ≈ 35° and γ ≈ 130°.

### Model by model

![Polarisation and intensity against Moon separation for each band, with the Rayleigh, Mie and combined fits](figures/paper-fig7-8-bands.png "Polarisation degree (upper) and normalised intensity (lower) against angle from the Moon in B, V (top) and R, I (bottom). Points are the clear-sky observations; lines are fits to each band: Rayleigh (dashed), Mie (dotted), Rayleigh + Mie (thin solid) and Rayleigh + Mie + multiple scattering (thick solid). Figures 7 and 8 of Pereira et al. (2026), A&A.")

In short, each model gets part of the picture right:

:::grid
:::card Rayleigh
- ✔ The **shape** of the polarisation, peaking near 90°.
- ✘ Pure Rayleigh predicts **100%** at 90°. To match the data, the light must be depolarised by $\delta$ = 0.035, 0.039, 0.051, 0.111 (B → I).
- ✘ Cannot explain the **bright sky near the Moon**.
:::
:::card Mie
- ✔ The **bright sky near the Moon**.
- ✘ The polarisation **peaks at the wrong angle**, so the fits are clearly worse.
- Refractive index ≈ 1.4–1.5, as measured for aerosols (but 1.8 in B, too high).
:::
:::card Multiple scattering
- **L = 0** in B, V and R: no extra neutral points.
- In I, L = 0.08 ± 0.12: neutral points about **18°** apart, still consistent with zero.
- So we treat it as **unpolarised extra light** that dilutes the polarisation.
:::
:::card Rayleigh + Mie + multiple scattering
- ✔ **Best model in every band**, for polarisation and brightness together.
- Better than all others by about **30 in BIC**.
- Mie and multiple scattering **grow with wavelength**, as expected for larger particles.
:::
:::

### All wavelengths at once

The last step was a single model for **all four bands together**. In principle, with the wavelength dependence built into the physics, the Rayleigh-to-Mie ratio and the multiple-scattering fraction should be the same in every band.

With a single refractive index and the aerosol mix fixed to the standard values, no model reproduces all the bands. Letting the **fractions of the four aerosol species** vary works much better: the fits prefer a larger share of **coarse tropospheric aerosols** (about 0.9 μm, the largest of the four). Allowing some **absorption** (an imaginary part in the refractive index) helps too.

```plot
{"src": "figures/fit-all-bands.json", "caption": "Combined anisotropic Rayleigh + Mie scattering model with four aerosol species (free relative fractions) and a common complex refractive index, fitted to all four bands at once: polarisation (top) and intensity (bottom). Points are the clear-sky observations; lines are the model. Redrawn from Figure 9 of Pereira et al. (2026), A&A.", "height": 640}
```

This model reproduces the polarisation in all bands and the overall shape of the brightness. The fits to individual bands are still better, though, and with only ten points per band many parameters are poorly constrained. More flexibility (all six aerosol species, or refractive indices that change with wavelength) will need more data.

### Twilight and clouds

The **twilight** data, taken as the Sun rose, need the Sun as a second light source. Adding the Sun's and the Moon's Stokes vectors, with a free fraction of light from each, the pure Rayleigh model fits these data well, including the dip in polarisation as the Sun takes over.

For the **atmosphere**, we also tested empirical corrections for extra depolarisation near the horizon and for turbulence, using the seeing as a proxy. They improve the fits, but not by enough to justify the extra parameters with the current data. They may matter for larger, more varied datasets.

:::note The practical result
To **predict and correct** the moonlit sky's polarisation in your data, a simple anisotropic Rayleigh model, with a depolarisation factor that increases with wavelength, describes the polarisation very well (though not the intensity).
:::
