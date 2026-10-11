In 1871, Lord Rayleigh explained why the daytime sky is blue and polarised. The same physics describes the night sky lit by the Moon. His model is the starting point for every study of sky polarisation, including [my own](read.html?c=research&s=moonlit-sky-paranal).

## Small particles, big effect

Rayleigh's model applies to particles much smaller than the wavelength of light, such as the nitrogen and oxygen molecules of air:

$$x = \frac{2\pi r}{\lambda} \ll 1.$$

The incoming electric field pushes the electrons of each molecule back and forth, turning it into a tiny oscillating **dipole**. An oscillating dipole radiates, and that radiation is the scattered light.

## Why the sky is blue

The scattering cross-section, how much light one molecule removes from the beam, grows steeply as the wavelength gets shorter:

$$\sigma_s = \frac{8\pi^3 (n^2-1)^2}{3\lambda^4 N_s^2}\,f(\delta), \qquad f(\delta) = \frac{6+3\delta}{6-7\delta},$$

where $n$ is the refractive index of air, $N_s$ the number of molecules per unit volume, and $f(\delta)$ a small correction for the fact that molecules are not perfect spheres ($\delta \approx 0.035$ for air). Because of the $\lambda^{-4}$, blue light is scattered several times more than red. Scattered light comes from all over the sky, so the sky looks blue. Light that travels straight through loses its blue, so the Sun looks red at sunset.

## Why the sky is polarised

A dipole cannot radiate along its own axis. Split the incoming light into a part perpendicular to the scattering plane and a part parallel to it:

- the **perpendicular** part is scattered equally in all directions;
- the **parallel** part is scattered with a strength $\cos^2\gamma$, which vanishes at $\gamma = 90°$.

Unpolarised light therefore comes out with intensity proportional to $1 + \cos^2\gamma$, and a degree of polarisation

$$p(\gamma) = \frac{\sin^2\gamma}{1+\cos^2\gamma}.$$

It is **zero** towards the light source and away from it (the two *neutral points*), and **100%** at $90°$. The polarisation direction is always perpendicular to the scattering plane.

```plot
{"src": "figures/rayleigh-degree.json", "caption": "Degree of polarisation against scattering angle for Rayleigh scattering.", "height": 360}
```

In the language of the [Mueller formalism](read.html?c=research&s=mueller-formalism), Rayleigh scattering of unpolarised light is described by the normalised matrix

$$\mathbf{M}_\text{Ray}(\gamma) = \begin{pmatrix} 1 & -\frac{\sin^2\gamma}{1+\cos^2\gamma} & 0 & 0 \\ -\frac{\sin^2\gamma}{1+\cos^2\gamma} & 1 & 0 & 0 \\ 0 & 0 & \frac{2\cos\gamma}{1+\cos^2\gamma} & 0 \\ 0 & 0 & 0 & \frac{2\cos\gamma}{1+\cos^2\gamma} \end{pmatrix}.$$

## The polarised night sky

Put the Moon instead of the Sun and the same pattern appears at night: a band of strong polarisation $90°$ from the Moon, circling it. You can explore it over Paranal with the simulator in the [moonlit sky article](read.html?c=research&s=moonlit-sky-paranal).

```skysim
{"model": "rayleigh", "night": "figures/paranal-2021-01-26.json", "caption": "Rayleigh scattering of moonlight (and sunlight at twilight) over Paranal, on the night of 26 January 2021. Zenith at the centre, north up and east left. Colour is the degree of polarisation; dashes show its direction."}
```

Real skies are less polarised than Rayleigh predicts: anisotropic molecules, aerosols ([Mie scattering](read.html?c=research&s=lorenz-mie-theory)) and multiple scattering all reduce it.

:::note From my thesis
This page is based on Chapter 2 of my master's thesis, *Polarization patterns in the sky and their influence on astronomical observations* (Instituto Superior Técnico, 2022), which goes into more detail.
:::

## References

1. B. Pereira (2022). *Polarization patterns in the sky and their influence on astronomical observations*. Master's thesis, Instituto Superior Técnico, Lisbon.
2. Lord Rayleigh (J. W. Strutt) (1871). On the light from the sky, its polarization and colour. *Philosophical Magazine* 41, 107 and 274.
3. J. D. Jackson (1999). *Classical Electrodynamics*, 3rd ed. Wiley.
4. K.-N. Liou (2002). *An Introduction to Atmospheric Radiation*. Academic Press (Elsevier).
5. J. Gál, G. Horváth, A. Barta & R. Wehner (2001). Polarization of the moonlit clear night sky measured by full-sky imaging polarimetry at full Moon. *J. Geophys. Res.* 106, 22647.
6. B. Pereira, S. González-Gaitán, A. M. Mourão et al. (2026). Moonlit sky polarization patterns from Cerro Paranal. *A&A*. [doi:10.1051/0004-6361/202555617](https://doi.org/10.1051/0004-6361/202555617).
