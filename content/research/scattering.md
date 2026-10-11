When light meets matter, the electric field of the wave pushes the electric charges of atoms and molecules into oscillation. Oscillating charges radiate, so the matter sends out light of its own in all directions. That re-emitted light is **scattered light**.

![Animation: light meets a particle; most is scattered in all directions, some is absorbed and some passes on](figures/scattering.gif "Light meets a particle. The incoming wave makes the charges in the particle oscillate, and the particle sends light out in all directions (scattering, blue). Some of the energy is absorbed and warms the particle (red glow), and some light passes straight on. Animated after Figure 1.3 of my thesis.")

## What can happen to light

When light hits a particle, three things can happen:

- **Absorption:** part of the energy is taken up by the particle, for example as heat.
- **Elastic scattering:** the light changes direction but keeps its wavelength.
- **Inelastic scattering:** the light changes direction and wavelength (Raman scattering, fluorescence).

Scattering and absorption always go together. Here we only consider **elastic** scattering: the light that reaches us has the same colour as the light that came in.

## Size matters

How a particle scatters depends on its size compared with the wavelength, through the **size parameter**

$$x = \frac{2\pi r}{\lambda},$$

where $r$ is the particle's radius.

- $x \ll 1$: particles much smaller than the wavelength, such as air molecules. This is [Rayleigh scattering](read.html?c=research&s=rayleigh-model): strongly dependent on wavelength (blue scatters much more than red) and strongly polarising.
- $x \gtrsim 1$: particles comparable to or larger than the wavelength, such as aerosols, dust and water droplets. This needs the full [Lorenz–Mie theory](read.html?c=research&s=lorenz-mie-theory): it depends much less on wavelength (clouds look white) and sends most light forwards.

![Scattering regimes: particle radius against wavelength, with lines of constant size parameter](figures/scattering-regimes.png "Which kind of scattering applies, depending on the particle size and the wavelength. Lines are constant size parameter x. Air molecules and visible light sit in the Rayleigh regime; aerosols and cloud droplets in the Mie regime.")

## The geometry of scattering in the sky

For the moonlit sky, what matters is the **scattering angle** $\gamma$: the angle between the moonlight coming in and the direction it is scattered towards us. It equals the angular distance on the sky between the Moon (M) and the point we look at (T). With zenith distances $\theta$ and azimuths $\phi$,

$$\cos\gamma = \cos\theta_T\cos\theta_M + \sin\theta_T\sin\theta_M\cos(\phi_M - \phi_T).$$

```plot
{"src": "figures/scattering-geometry-3d.json", "caption": "Scattering geometry on the sky dome (drag to rotate, scroll to zoom). The observer O is at the centre. Moonlight (gold) arrives as a parallel beam from the direction of the Moon, enters the atmosphere (diamond) and reaches a point S on the line of sight to the target T, where it is scattered towards the observer (green). The scattering angle γ (violet) is the angle between the directions to the Moon and to the target; θ_M and θ_T are their zenith distances. Redrawn after Figure 1.4 of my thesis.", "height": 520}
```

In **single scattering**, the light is scattered once on its way: it enters the atmosphere from the Moon, is scattered at some point along our line of sight, and travels to us. In **multiple scattering**, it bounces several times first.

To calculate the polarisation, the light has to be described relative to the **scattering plane** (the plane containing the Moon, the scattering point and the observer). This needs two rotation angles, found with spherical trigonometry:

$$\cos\beta_1 = \frac{\cos\theta_T - \cos\theta_M\cos\gamma}{\sin\theta_M\sin\gamma}, \qquad \cos\beta_2 = \frac{\cos\theta_M - \cos\theta_T\cos\gamma}{\sin\theta_T\sin\gamma}.$$

How these rotations and the scattering itself act on the light is described by the [Mueller formalism](read.html?c=research&s=mueller-formalism).

:::note From my thesis
This page is based on Chapter 1 of my master's thesis, *Polarization patterns in the sky and their influence on astronomical observations* (Instituto Superior Técnico, 2022), which goes into more detail.
:::

## References

1. B. Pereira (2022). *Polarization patterns in the sky and their influence on astronomical observations*. Master's thesis, Instituto Superior Técnico, Lisbon.
2. K.-N. Liou (2002). *An Introduction to Atmospheric Radiation*. Academic Press (Elsevier).
3. S. Trippe (2014). Polarization and polarimetry: a review. [arXiv:1401.1911](https://arxiv.org/abs/1401.1911).
