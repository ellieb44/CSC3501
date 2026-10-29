# CPU Escape

A Geometry Dash inspired endless runner for CSC3501, with CPU knowledge checkpoints.

Open `index.html` in a modern browser. No build, server, or dependency installation is required.

- Space, up arrow, W, or touch/click the game to jump. Hold to jump again on landing.
- P pauses or resumes. Leaving the window automatically pauses the run.
- Distance is shown at the top right and increases only while running. Best distance is saved locally when available.
- Movement accelerates smoothly from 360 toward 620 pixels/second. Rendering uses requestAnimationFrame; physics uses a fixed 120 Hz timestep.
- Collisions freeze the run and present a CPU question. A correct answer lets you continue with the same distance and speed and a clear runway. A wrong answer ends the run; Restart begins at zero.

The cube uses a fixed jump impulse and gravity with no midair double jump. This is an original approximation of the arcade feel, not a reproduction of Geometry Dash's exact physics or assets.

Run `node --test game.test.cjs` to check the quiz, distance, restart, and pause flows in a simulated browser environment. These checks do not replace a visual playtest.
