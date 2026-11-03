# CPU Escape

A Geometry Dash inspired endless runner for CSC3501, with CPU knowledge checkpoints.

Open `index.html` in a modern browser. No build, server, or dependency installation is required.
The opening screen explains the controls, quizzes, hearts, and refills. The playable stage and all HUD stats stay hidden until you select Start running.

- Space, up arrow, W, or touch/click the game to jump. Hold to jump again on landing.
- P pauses or resumes. Leaving the window automatically pauses the run.
- Distance is shown at the top right and increases only while running. Best distance is saved locally when available.
- Movement accelerates smoothly from 360 toward 620 pixels/second. Rendering uses requestAnimationFrame; physics uses a fixed 120 Hz timestep.
- Each round starts with three heart icons representing three available revives. Hitting a transistor or platform edge, or falling into a gap, breaks one heart and presents a CPU question. A correct answer revives you with the same distance and speed and a clear runway; a wrong answer ends the round. Hearts stay broken after a revive. After the third revive, the next collision ends the round without a quiz. Restart resets distance and restores all hearts.
- Floating chip platforms form varied rising and falling routes, with short steps and occasional wider decks carrying transistors. Land on the glowing tops and jump across the dark gaps.
- Collectible hearts appear along the course at `d(n) = 500n + 100(n - 1)` meters: 500, 1,100, 1,700, 2,300, 2,900, and so on, only when a heart is missing as that pickup enters the screen. Full hearts skip that pickup without shifting the schedule. Touch one to restore one spent heart, up to three total; missed hearts give no healing. Refills allow additional revives, and restarting resets the pickup schedule.

The cube uses a fixed jump impulse and gravity with no midair double jump. This is an original approximation of the arcade feel, not a reproduction of Geometry Dash's exact physics or assets.

Run `node --test game.test.cjs` to check the quiz, distance, restart, and pause flows in a simulated browser environment. These checks do not replace a visual playtest.
