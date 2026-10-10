Why is the sky blue? Why is it polarised? Both answers come from the same small calculation: light hitting a molecule much smaller than its wavelength.

## A molecule as a tiny antenna

The electric field of incoming light, $\vec{E}_0 \cos\omega t$, pushes the electrons of a molecule back and forth. The molecule becomes an oscillating electric dipole

$$\vec{p}(t) = \alpha\,\vec{E}_0 \cos\omega t,$$

where $\alpha$ is its polarisability. An accelerating charge radiates, and a dipole oscillating at frequency $\omega$ radiates a power

$$\frac{dP}{d\Omega} = \frac{p_0^2\,\omega^4}{32\pi^2 \varepsilon_0 c^3}\,\sin^2\Theta,$$

with $\Theta$ measured from the dipole axis. Two features of this formula explain the sky.

## Why the sky is blue: the $\omega^4$

The scattered power grows as $\omega^4$, or equivalently

$$I_\text{scattered} \propto \frac{1}{\lambda^4}.$$

Blue light ($\lambda \approx 450\ \text{nm}$) is scattered $(700/450)^4 \approx 5.9$ times more than red light ($\lambda \approx 700\ \text{nm}$). Look anywhere away from the Sun and you see mostly the scattered, blue part.

## Why the sky is polarised: the $\sin^2\Theta$

Sunlight is unpolarised, so split it into two equal parts relative to the **scattering plane** (the plane containing the Sun, the molecule and you).

- The component **perpendicular** to that plane drives a dipole that always points across your line of sight, so it scatters towards you with full strength: $I_\perp \propto 1$.
- The component **in** the plane drives a dipole whose projection shrinks as the scattering angle $\gamma$ grows: $I_\parallel \propto \cos^2\gamma$.

Adding them gives the angular pattern of Rayleigh scattering,

$$I(\gamma) \propto 1 + \cos^2\gamma,$$

```plot
{"fn": [{"y": "1 + cos(x*PI/180)**2", "name": "I(γ) ∝ 1 + cos²γ"}],
 "x": [0, 180],
 "layout": {"xaxis": {"title": {"text": "scattering angle γ (degrees)"}, "dtick": 30},
            "yaxis": {"title": {"text": "relative intensity"}, "range": [0, 2.1]}, "showlegend": false},
 "caption": "Rayleigh phase function: as much light is scattered forwards as backwards, least at 90°.",
 "height": 320}
```

and the difference gives the degree of linear polarisation:

$$P(\gamma) = \frac{I_\perp - I_\parallel}{I_\perp + I_\parallel} = \frac{1 - \cos^2\gamma}{1 + \cos^2\gamma} = \frac{\sin^2\gamma}{1 + \cos^2\gamma}.$$

At $\gamma = 90°$ the scattered light is **fully** polarised. In the real atmosphere, multiple scattering, aerosols and reflection from the ground lower the maximum, so we write $P = P_\text{max}\,\sin^2\gamma / (1 + \cos^2\gamma)$.

```plot
{"src": "../research/figures/rayleigh-degree.json", "caption": "Degree of polarisation against scattering angle, for three values of P_max.", "height": 380}
```

You can explore the full-sky version of this pattern in the [Sky Lab](index.html#lab).

## Exercises

:::exercise Blue versus red
By what factor is violet light ($400\ \text{nm}$) scattered more than red light ($700\ \text{nm}$)? Why, then, is the sky not violet?
:::solution
$(700/400)^4 \approx 9.4$.

The sky still looks blue because sunlight contains less violet than blue, some violet is absorbed high in the atmosphere, and our eyes are much less sensitive to violet. What we perceive is a mix dominated by blue.
:::
:::

:::exercise Polarisation at 60°
What is the degree of polarisation of single-scattered light at a scattering angle of $60°$, with $P_\text{max} = 1$?
:::solution
$\sin^2 60° = 0.75$ and $\cos^2 60° = 0.25$, so $P = \dfrac{0.75}{1.25} = 0.6$, or $60\%$.
:::
:::
