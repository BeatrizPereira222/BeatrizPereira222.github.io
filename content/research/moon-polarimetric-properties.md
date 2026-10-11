Moonlight is sunlight reflected by the lunar surface. Before we can model how the atmosphere polarises it, we need to know what the light is like when it leaves the Moon.

## Sunlight first

Sunlight is very nearly unpolarised. Its continuum polarisation in the optical (the "second solar spectrum") stays below about 1%, with line features below about 0.15%. For sky models, sunlight can be treated as unpolarised.

## A rough, dusty mirror

The Moon's surface is far from uniform: bright **highlands** and dark **maria** (seas of lunar basalt), craters, and a layer of fine dust, the regolith. Light reflected from it goes through many processes:

- single and double reflection on grain faces, and shadowing, which **polarise** the light;
- absorption after refraction inside grains, higher-order reflections, scattering by tiny particles and internal reflections, which give mostly **unpolarised** light.

## The polarisation curve

Bernard Lyot measured the polarisation of moonlight around 1924 and found that its direction is always either perpendicular or parallel to the *plane of vision* (containing the Sun, the Moon and the observer). Its degree depends on the **phase angle**, the angle between the incoming sunlight and our line of sight at the Moon:

$$p = \frac{I_+ - I_-}{I_+ + I_-},$$

where $I_+$ and $I_-$ are the intensities perpendicular and parallel to the plane of vision.

- At **small phase angles** (near full Moon, up to about 23°) the polarisation is slightly **negative**, parallel to the plane of vision. This negative branch comes from shadowing and double reflections in the rough surface.
- Beyond the inversion point it becomes **positive**, reaching its maximum at a phase angle of about 100°–110°, around the quarters. At 0.6 µm the maximum is about 6% for the bright highlands and about 14% for the dark maria; for the whole Moon it averages about 7.7%.
- At **full Moon** (phase angle near 0°) it is close to zero.

![Lunar polarisation curve: degree of polarisation against phase angle for a dark mare and a bright highland region](figures/moon-polarisation-curve.png "Polarisation of moonlight against phase angle at 0.6 µm, for a dark mare and a bright highland region. Redrawn after Dollfus & Bowell (1971), as shown in my thesis (Figure 1.8).")

The maximum polarisation depends on **wavelength** (higher in blue) and on the **albedo**, the fraction of light reflected: darker regions polarise more. Empirically, for the whole Moon,

$$\log P_m = \log A - 1.96\,\log\lambda - 0.60,$$

with $\lambda$ in microns.

## The albedo

The albedo itself changes with the Moon's phase, the wavelength and libration (which shows us slightly different parts of the surface over the month). An empirical model fitted to more than 100 000 images of the Moon in 32 bands (the ROLO survey) gives it for any time, place and wavelength. For our observations at Paranal, the albedo was between about 0.09 and 0.19, depending on the band and the night.

![Lunar albedo over a lunar cycle in three wavelengths](figures/thesis-albedo-time.png "Lunar albedo over about 40 days from 27 January 2021, at 350 nm (blue), 475 nm (white) and 703.6 nm (red), with the illuminated fraction of the Moon (dashed green). From my thesis (Figure 1.9).")

![Lunar albedo against phase angle](figures/thesis-albedo-phase.png "The same albedo against phase angle. The double lines show that waxing and waning Moons differ, because different parts of the surface are lit. From my thesis (Figure 1.10).")

![Lunar albedo against wavelength for one observation](figures/thesis-albedo-wavelength.png "Albedo against wavelength at 01:18 UT on 27 January 2021, during an observation in the B band: about 0.11 at 437 nm. From my thesis (Figure 1.11).")

## Why it matters

For observations near **full Moon**, like ours, the moonlight is almost unpolarised, and we can treat it as natural light entering the atmosphere. At other phases, the Moon's own polarisation becomes important and has to be added to any sky model, using the [Stokes parameters](read.html?c=research&s=stokes-parameters).

:::note From my thesis
This page is based on Chapter 1 of my master's thesis, *Polarization patterns in the sky and their influence on astronomical observations* (Instituto Superior Técnico, 2022), which goes into more detail.
:::

## References

1. B. Pereira (2022). *Polarization patterns in the sky and their influence on astronomical observations*. Master's thesis, Instituto Superior Técnico, Lisbon.
2. J. O. Stenflo (2005). Polarization of the Sun's continuous spectrum. *A&A* 429, 713.
3. A. Gandorfer (2005). *The Second Solar Spectrum*, vol. III. vdf Hochschulverlag.
4. M. Wolff (1975). Polarization of light reflected from rough planetary surface. *Applied Optics* 14, 1395.
5. Z. Kopal (ed.). *Physics and Astronomy of the Moon*. Academic Press.
6. A. Dollfus & E. Bowell (1971). Polarimetric properties of the lunar surface and its interpretation. Part I. *A&A* 10, 29.
7. H. H. Kieffer & T. C. Stone (2005). The spectral irradiance of the Moon. *AJ* 129, 2887.
