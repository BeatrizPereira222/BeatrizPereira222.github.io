Light is an electromagnetic wave, and like a wave on a rope it is **transverse**: the electric field $\vec{E}$ oscillates at right angles to the direction the light travels. But "at right angles" still leaves a choice of direction. That choice is the **polarisation** of light, and our eyes are almost blind to it.

## Linear, circular and elliptical

If $\vec{E}$ always oscillates along the same line, the light is **linearly polarised**. If the tip of $\vec{E}$ traces a circle as the wave passes, it is **circularly polarised**. Anything in between is **elliptical**.

![Linearly and circularly polarised waves](figures/polarised-waves.gif "The electric field (gold) along a light wave travelling to the right. Left: linear. Right: circular.")

Mathematically, for a wave travelling along $z$:

$$\vec{E}(z,t) = E_x \cos(kz - \omega t)\,\hat{x} + E_y \cos(kz - \omega t + \delta)\,\hat{y}$$

The phase difference $\delta$ decides the type: $\delta = 0$ gives linear, $\delta = \pm 90°$ with $E_x = E_y$ gives circular.

Sunlight, a light bulb and a candle are **unpolarised**: their light is a jumble of waves with random, rapidly changing directions.

## Polarisers and Malus's law

A polariser only lets through the component of $\vec{E}$ along its transmission axis.

- Unpolarised light loses half its intensity: $I = I_0 / 2$.
- Linearly polarised light at angle $\theta$ to the axis keeps the component $E\cos\theta$. Intensity goes as the square of the field, so

$$I = I_0 \cos^2\theta \qquad \text{(Malus's law)}$$

```plot
{"fn": [{"y": "cos(x*PI/180)**2", "name": "I / I₀ = cos²θ"}],
 "x": [0, 360],
 "layout": {"xaxis": {"title": {"text": "angle between polarisation and polariser θ (degrees)"}, "dtick": 45},
            "yaxis": {"title": {"text": "transmitted fraction I / I₀"}, "range": [0, 1.05]}, "showlegend": false},
 "caption": "Rotating a polariser in front of polarised light: two bright and two dark positions per turn.",
 "height": 340}
```

## Measuring polarisation: the Stokes parameters

Real light is usually **partially** polarised. Astronomers describe it with four numbers, the Stokes parameters, each measured with a polariser (and, for $V$, a quarter-wave plate):

| Parameter | Meaning |
|---|---|
| $I$ | total intensity |
| $Q$ | horizontal minus vertical linear polarisation |
| $U$ | $+45°$ minus $-45°$ linear polarisation |
| $V$ | right minus left circular polarisation |

From them we get the **degree of polarisation** and the **angle of polarisation**:

$$P = \frac{\sqrt{Q^2 + U^2 + V^2}}{I}, \qquad \psi = \tfrac{1}{2}\arctan\frac{U}{Q}$$

For light with only linear polarisation this reduces to the simple form you can measure by rotating one polariser:

$$P = \frac{I_\text{max} - I_\text{min}}{I_\text{max} + I_\text{min}}$$

:::note Where this goes next
These four numbers are exactly what a polarimeter on a telescope measures. In the Advanced level we'll see how scattering in the atmosphere produces them.
:::

## Exercises

:::exercise Two polarisers
Unpolarised light of intensity $100\ \text{W/m}^2$ passes through two polarisers whose axes are $30°$ apart. What intensity comes out?
:::solution
The first polariser halves it: $50\ \text{W/m}^2$, now polarised along its axis.

The second applies Malus's law: $50 \cos^2 30° = 50 \times 0.75 = 37.5\ \text{W/m}^2$.
:::
:::

:::exercise The third polariser paradox
Two crossed polarisers ($0°$ and $90°$) block all light. What happens if you slide a third one at $45°$ *between* them?
:::solution
Starting from $I_0$ unpolarised: after the first, $I_0/2$. After the $45°$ one, $\tfrac{I_0}{2}\cos^2 45° = I_0/4$. After the last, $\tfrac{I_0}{4}\cos^2 45° = I_0/8$.

Adding a filter lets **more** light through: $12.5\%$ instead of nothing. Each polariser changes the polarisation direction of the light it transmits.
:::
:::

:::exercise Degree of polarisation
Rotating a polariser in front of the blue sky, you measure a maximum of 80 and a minimum of 20 (arbitrary units). What is the degree of linear polarisation?
:::solution
$P = \dfrac{80 - 20}{80 + 20} = 0.6$, so the light is $60\%$ polarised. That's typical for clear sky about $90°$ from the Sun.
:::
:::
