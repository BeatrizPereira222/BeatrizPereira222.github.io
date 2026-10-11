Telescopes do not measure electric fields: they measure **intensities**, averaged over many oscillations. In 1852, George Stokes found four quantities, all intensities, that fully describe the polarisation of any beam of light, including partially polarised and unpolarised light. They are the language of every polarimetric observation.

## The four parameters

$$\mathbf{S} = \begin{pmatrix} I \\ Q \\ U \\ V \end{pmatrix} = \begin{pmatrix} \langle E_x^2\rangle + \langle E_y^2\rangle \\ \langle E_x^2\rangle - \langle E_y^2\rangle \\ 2\langle E_x E_y \cos\beta\rangle \\ 2\langle E_x E_y \sin\beta\rangle \end{pmatrix},$$

where $\langle\ \rangle$ is a time average and $\beta$ the phase difference between the components.

- $I$: the **total intensity**.
- $Q$: the difference between the light polarised along $x$ and along $y$.
- $U$: the same difference, but along the diagonals ($45°$ and $135°$).
- $V$: the **circular** polarisation (right minus left).

Each of $Q$, $U$ and $V$ is a **difference of two intensities**: the light that gets through an analyser in one orientation, minus the light that gets through the opposite one. A polarimeter measures exactly these differences.

![Q, U and V as differences of intensities through pairs of analysers](figures/stokes-qu.png "What the Stokes parameters measure. Q compares the light polarised along x (0°) and y (90°); U does the same along the diagonals (45° and 135°); V compares right- and left-handed circular light. Their signs tell which one wins.")

$Q$ and $U$ depend on how the axes are oriented; $I$ and $V$ do not. In astronomy, $x$ points north and $y$ east, so angles are counted from north through east.

## Examples

| Light | $\mathbf{S}$ |
|---|---|
| Unpolarised | $(1, 0, 0, 0)$ |
| Linear, along $x$ (0°) | $(1, 1, 0, 0)$ |
| Linear, along $y$ (90°) | $(1, -1, 0, 0)$ |
| Linear, at $+45°$ | $(1, 0, 1, 0)$ |
| Linear, at angle $\alpha$ | $(1, \cos 2\alpha, \sin 2\alpha, 0)$ |
| Circular, right / left | $(1, 0, 0, \pm1)$ |

![Each polarisation state from the table, animated, with its Stokes vector](figures/stokes-states.gif "The states in the table above, seen facing the beam, each with its Stokes vector S = (I, Q, U, V). Linear light has only Q and U (which ones depends on the angle); circular light has only V; elliptical light has some of each; unpolarised light has none.")

## Degree and angle of polarisation

For perfectly polarised light, $I^2 = Q^2 + U^2 + V^2$, and every state is a point on a sphere, the *Poincaré sphere*. Real light is partly polarised, and the **degree of polarisation** tells how much:

$$p = \frac{\sqrt{Q^2 + U^2 + V^2}}{I} \in [0, 1].$$

$p = 1$ is fully polarised light, $p = 0$ is unpolarised. Scattered skylight is linearly polarised, so $V \approx 0$ and we use the **linear** degree and the **angle of polarisation**:

$$p = \frac{\sqrt{Q^2 + U^2}}{I}, \qquad \psi = \frac{1}{2}\arctan\frac{U}{Q}.$$

## Why they are so useful

Because they are intensities, Stokes parameters of **independent beams simply add**. This is what lets us combine the light scattered from the Moon and from the Sun at twilight, or the contributions of different particles in the atmosphere. And how optical elements or scattering change them is described by a matrix: the [Mueller formalism](read.html?c=research&s=mueller-formalism).

:::note From my thesis
This page is based on Chapter 1 of my master's thesis, *Polarization patterns in the sky and their influence on astronomical observations* (Instituto Superior Técnico, 2022), which goes into more detail.
:::

## References

1. B. Pereira (2022). *Polarization patterns in the sky and their influence on astronomical observations*. Master's thesis, Instituto Superior Técnico, Lisbon.
2. J. D. Jackson (1999). *Classical Electrodynamics*, 3rd ed. Wiley.
3. S. Trippe (2014). Polarization and polarimetry: a review. [arXiv:1401.1911](https://arxiv.org/abs/1401.1911).
4. K.-N. Liou (2002). *An Introduction to Atmospheric Radiation*. Academic Press (Elsevier).
