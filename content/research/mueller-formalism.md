The [Stokes parameters](read.html?c=research&s=stokes-parameters) describe the state of a beam of light. The **Mueller formalism** describes what happens to that state when the light passes through a polariser, reflects off a mirror, or is scattered by a particle: each process is a $4\times4$ matrix acting on the Stokes vector.

## Mueller matrices

$$\mathbf{S}' = \mathbf{M}\,\mathbf{S}, \qquad \begin{pmatrix} I' \\ Q' \\ U' \\ V' \end{pmatrix} = \begin{pmatrix} M_{11} & M_{12} & M_{13} & M_{14} \\ M_{21} & M_{22} & M_{23} & M_{24} \\ M_{31} & M_{32} & M_{33} & M_{34} \\ M_{41} & M_{42} & M_{43} & M_{44} \end{pmatrix} \begin{pmatrix} I \\ Q \\ U \\ V \end{pmatrix}.$$

Each element says how one part of the incoming light feeds another part of the outgoing light: $M_{12}$, for example, how much of the incoming $Q$ ends up as outgoing intensity. A mirror, for instance, flips the sign of $U$ and $V$:

$$\mathbf{M}_\text{mirror} = \begin{pmatrix} 1&0&0&0\\0&1&0&0\\0&0&-1&0\\0&0&0&-1 \end{pmatrix}.$$

For a sequence of processes, the matrices multiply in order, just like [Jones matrices](read.html?c=research&s=jones-calculus).

## Jones and Mueller

The Mueller formalism extends and combines the Jones and Stokes descriptions. Every Jones matrix (which acts on fields) has a corresponding Mueller matrix (which acts on intensities), called a *pure* Mueller matrix. The scattering by a single particle in a fixed orientation is one of these.

The difference appears when many things add up. A **sum** of pure Mueller matrices is generally not a pure Mueller matrix itself. That is exactly the case for light scattered by a cloud of independent particles, or by multiple scattering. It is why the Mueller formalism, not the Jones one, is used for the sky.

## Scattering

When scattering particles are randomly oriented and the medium is symmetric, the scattering matrix depends only on the scattering angle $\gamma$ and has just six independent elements:

$$\mathbf{M}(\gamma) = \begin{pmatrix} a_1 & b_1 & 0 & 0 \\ b_1 & a_2 & 0 & 0 \\ 0 & 0 & a_3 & b_2 \\ 0 & 0 & -b_2 & a_4 \end{pmatrix}.$$

For spherical particles, $a_1 = a_2$ and $a_3 = a_4$, leaving four.

This matrix is written in the **scattering plane**. To use it on the sky, the incoming light is first rotated into the scattering plane, scattered, then rotated into the observer's frame. Rotating the axes by an angle $\beta$ mixes $Q$ and $U$:

$$\mathbf{R}(\beta) = \begin{pmatrix} 1&0&0&0\\ 0&\cos2\beta&-\sin2\beta&0\\ 0&\sin2\beta&\cos2\beta&0\\ 0&0&0&1 \end{pmatrix},$$

and the full chain is

$$\mathbf{S}_\text{scattered} = \mathbf{R}(\beta')\,\mathbf{M}(\gamma)\,\mathbf{R}(\beta)\,\mathbf{S}_\text{incident}.$$

This one line is the core of every sky polarisation model: choose $\mathbf{M}$ for [Rayleigh](read.html?c=research&s=rayleigh-model) or [Mie](read.html?c=research&s=lorenz-mie-theory) scattering, and the rotation angles from the [scattering geometry](read.html?c=research&s=scattering).

:::note From my thesis
This page is based on Chapter 1 of my master's thesis, *Polarization patterns in the sky and their influence on astronomical observations* (Instituto Superior Técnico, 2022), which goes into more detail.
:::

## References

1. B. Pereira (2022). *Polarization patterns in the sky and their influence on astronomical observations*. Master's thesis, Instituto Superior Técnico, Lisbon.
2. S. Trippe (2014). Polarization and polarimetry: a review. [arXiv:1401.1911](https://arxiv.org/abs/1401.1911).
3. K.-N. Liou (2002). *An Introduction to Atmospheric Radiation*. Academic Press (Elsevier).
