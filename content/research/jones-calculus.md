Writing the electric field with sines and cosines works, but it quickly becomes clumsy when light passes through several optical elements. In 1941, R. Clark Jones proposed a compact alternative: write the field as a **vector** and the optical elements as **matrices**.

## The Jones vector

Using complex numbers, the two components of the electric field can be stacked into a vector that keeps both their amplitudes and their phases:

$$\mathbf{e} = \begin{pmatrix} E_x(0)\,e^{i\phi_1} \\ E_y(0)\,e^{i\phi_2} \end{pmatrix}.$$

Some common states (normalised):

| Polarisation | Jones vector |
|---|---|
| Linear, along $x$ | $\begin{pmatrix}1\\0\end{pmatrix}$ |
| Linear, along $y$ | $\begin{pmatrix}0\\1\end{pmatrix}$ |
| Circular, left | $\frac{1}{\sqrt2}\begin{pmatrix}1\\i\end{pmatrix}$ |
| Circular, right | $\frac{1}{\sqrt2}\begin{pmatrix}1\\-i\end{pmatrix}$ |

Any polarisation state can be written as a combination of two orthogonal states ($\mathbf{e}_1\cdot\mathbf{e}_2^* = 0$), just like any vector in the plane is a combination of $\hat x$ and $\hat y$.

![Elliptical, circular, linear and unpolarised light as waves, with their Jones vectors](figures/polarisation-states.png "Elliptical, circular, linear and unpolarised light: the wave along the beam (top), the path of the electric field seen facing the beam, and the Jones vector (bottom). Unpolarised light has no single Jones vector. Redrawn after Figure 1.2 of my thesis.")

## Jones matrices

A polariser, a wave plate or a mirror changes the polarisation. Each is described by a $2\times2$ complex **Jones matrix** $\mathbf{J}$:

$$\mathbf{e}' = \mathbf{J}\,\mathbf{e}.$$

For a chain of elements, you simply multiply their matrices in order. A polariser that only lets the $x$ component through, for example, is

$$\mathbf{J}_x = \begin{pmatrix}1&0\\0&0\end{pmatrix}.$$

## The limitation

Jones calculus describes **perfectly polarised, coherent** light. Two Jones vectors can only be added when the beams are coherent, which is rarely the case for light from the sky. For partially polarised or unpolarised light we need intensities rather than field amplitudes: the [Stokes parameters](read.html?c=research&s=stokes-parameters). The two descriptions complement each other, and the [Mueller formalism](read.html?c=research&s=mueller-formalism) connects them.

:::note From my thesis
This page is based on Chapter 1 of my master's thesis, *Polarization patterns in the sky and their influence on astronomical observations* (Instituto Superior Técnico, 2022), which goes into more detail.
:::

## References

1. B. Pereira (2022). *Polarization patterns in the sky and their influence on astronomical observations*. Master's thesis, Instituto Superior Técnico, Lisbon.
2. J. D. Jackson (1999). *Classical Electrodynamics*, 3rd ed. Wiley.
3. S. Trippe (2014). Polarization and polarimetry: a review. [arXiv:1401.1911](https://arxiv.org/abs/1401.1911).
