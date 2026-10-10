Everything in physics starts with a simple question: **where is it, and how is that changing?** In this chapter we describe motion along a straight line. It sounds modest, but the same ideas will carry us to planets and photons.

## Position, velocity and acceleration

Pick a line, choose an origin and a positive direction. The **position** $x(t)$ is where the object is at time $t$.

The **velocity** is how fast the position changes:

$$v = \frac{dx}{dt}$$

and the **acceleration** is how fast the velocity changes:

$$a = \frac{dv}{dt} = \frac{d^2x}{dt^2}$$

:::note Signs matter
Velocity and acceleration have a sign. With "up" as positive, a ball thrown upward has $v > 0$ on the way up, $v < 0$ on the way down, and $a = -g$ the whole time, even at the top where $v = 0$.
:::

## Constant acceleration

When $a$ is constant (a falling ball, a car braking steadily), integrating twice gives three equations you will use again and again:

$$v = v_0 + a t$$

$$x = x_0 + v_0 t + \tfrac{1}{2} a t^2$$

$$v^2 = v_0^2 + 2a\,(x - x_0)$$

Here is a ball thrown straight up at $v_0 = 12\ \text{m/s}$ with $a = -9.81\ \text{m/s}^2$. The position is a parabola; the velocity is a straight line that crosses zero exactly when the ball is at its highest point.

![Position and velocity of a ball thrown upward](figures/ball-thrown-up.png "A ball thrown upward at 12 m/s. Position (left) and velocity (right).")

## Measuring g yourself

Drop an object, record how far it has fallen at several times, and fit $d = \tfrac{1}{2} g t^2$. The plot below is interactive: hover over the points, zoom in, and read the fitted value of $g$ from the legend.

```plot
{"src": "figures/free-fall-fit.json", "caption": "Simulated free-fall measurements with a quadratic fit.", "height": 400}
```

## Exercises

:::exercise A car from rest
A car starts from rest and accelerates at $3\ \text{m/s}^2$ for $5\ \text{s}$. How fast is it going, and how far has it travelled?
:::solution
$v = v_0 + at = 0 + 3 \times 5 = 15\ \text{m/s}$.

$x = \tfrac{1}{2} a t^2 = \tfrac{1}{2} \times 3 \times 25 = 37.5\ \text{m}$.
:::
:::

:::exercise Up and down
A ball is thrown straight up at $12\ \text{m/s}$. How high does it go, and how long until it comes back to your hand?
:::solution
At the top $v = 0$, so $0 = v_0^2 - 2 g h$ gives $h = \dfrac{v_0^2}{2g} = \dfrac{144}{19.62} \approx 7.3\ \text{m}$.

The time to the top is $t = v_0 / g \approx 1.22\ \text{s}$, and the way down takes just as long, so it returns after about $2.45\ \text{s}$. Compare with the plot above.
:::
:::

:::exercise Braking distance
A car travelling at $25\ \text{m/s}$ (90 km/h) brakes and stops in $50\ \text{m}$. What is its deceleration, and how long does it take to stop?
:::solution
From $v^2 = v_0^2 + 2a\,\Delta x$ with $v = 0$: $a = -\dfrac{v_0^2}{2\Delta x} = -\dfrac{625}{100} = -6.25\ \text{m/s}^2$.

Then $t = \dfrac{v - v_0}{a} = \dfrac{-25}{-6.25} = 4\ \text{s}$.
:::
:::
