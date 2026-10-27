
const config = {
    type: Phaser.AUTO,
    parent: "game-container",
    width: 1280,
    height: 720,
    backgroundColor: "#1a1a2e",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    // Enable physics
    physics: {
        default: "arcade",
        arcade: {
            gravity: { x: 0, y: 700 },
            debug: false
        }
    },

    scene: {
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function create() {

    // Create our player character with physics
    this.player = this.add.rectangle(150, 400, 60, 60, 0x00ff00);
    this.physics.add.existing(this.player);

    // Create the ground
    this.ground = this.add.rectangle(640, 680, 1280, 80, 0x555555);
    this.physics.add.existing(this.ground, true);

    // Make the player land on the ground
    this.physics.add.collider(this.player, this.ground);

    // Set up the spacebar for jumping
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Create our first obstacle
    this.obstacle = this.add.rectangle(1100, 600, 60, 80, 0xff0000);

    // Give the obstacle a physics body
    this.physics.add.existing(this.obstacle, true);

    // Detect when the player hits the obstacle
    this.physics.add.overlap(this.player, this.obstacle, () => {

        // Stop the obstacle and pause physics
        this.tweens.pauseAll();
        this.physics.pause();

        // Pick a random CPU question
        const randomIndex = Phaser.Math.Between(0, cpuQuestions.length - 1);
        const selectedQuestion = cpuQuestions[randomIndex];
        
        // Group the question and answers together
        const quizContainer = this.add.container(0, 0);
       
        // Display the CPU question
        const questionText = this.add.text(640, 100, selectedQuestion.question, {
            fontSize: "24px",
            color: "#ffffff",
            fontStyle: "bold",
            align: "center",
            wordWrap: { width: 1000 }
        }).setOrigin(0.5);

        quizContainer.add(questionText);


        // Track whether the player has answered
        let hasAnswered = false;

        // Display the four answer choices
        selectedQuestion.options.forEach((option, index) => {

            const answer = this.add.text(
                640,
                190 + (index * 65),
                `${String.fromCodePoint(65 + index)}. ${option}`,
                {
                    fontSize: "20px",
                    color: "#ffffff",
                    backgroundColor: "#333355",
                    padding: { x: 18, y: 10 },
                    wordWrap: { width: 750 },
                    align: "center"
                }
            );

            // Center the answer and make it clickable
            answer.setOrigin(0.5);
            answer.setInteractive({ useHandCursor: true });
            
            // Add this answer button to the quiz container
            quizContainer.add(answer);

            // Check the player's answer
            answer.on("pointerdown", () => {

                // Prevent multiple answers
                if (hasAnswered) {
                    return;
                }

                hasAnswered = true;

                if (index === selectedQuestion.correctAnswer) {      
                // Show a message for the correct answer
                const correctText = this.add.text(640, 450, "Correct Answer! Continue playing!", {
                    fontSize: "26px",
                    color: "#00ff00"
                }).setOrigin(0.5);

                // Remove the message 
                this.time.delayedCall(2000, () => {
                    correctText.destroy();
                });
                    
                    // Remove the question and answer buttons
                    quizContainer.destroy();

                    // Remove the obstacle so the player can safely continue
                    this.obstacle.destroy();
                    
                    // Resume the game after a correct answer
                    this.physics.resume();
                    this.tweens.resumeAll();



                } else {

                    // Show incorrect answer message
                    this.add.text(640, 425, "Incorrect Answer! GAME OVER!", {
                        fontSize: "26px",
                        color: "#ff0000"
                    }).setOrigin(0.5);
                    
                // Hide the obstacle when the game ends
                this.obstacle.setVisible(false);
                this.obstacle.body.enable = false;

                    
                // Create a retry button
                const retryButton = this.add.text(640, 610, "Retry Level", {
                    fontSize: "22px",
                    color: "#ffffff",
                    backgroundColor: "#333355",
                    padding: { x: 25, y: 12 }
                }).setOrigin(0.5);

                // Make the button clickable
                retryButton.setInteractive({ useHandCursor: true });

                // Restart the game when clicked
                retryButton.on("pointerdown", () => {
                    this.scene.restart();
                });


                    // Show the correct answer
                    const correctAnswerText = selectedQuestion.options[selectedQuestion.correctAnswer];

                    this.add.text(640, 485, "Correct Answer: " + correctAnswerText, {
                        fontSize: "20px",
                        color: "#00ff00",
                        align: "center",
                        wordWrap: { width: 900 }
                    }).setOrigin(0.5);

                    // Explain the correct answer
                    this.add.text(640, 530, selectedQuestion.explanation, {
                        fontSize: "18px",
                        color: "#ffffff",
                        align: "center",
                        wordWrap: { width: 900 }
                    }).setOrigin(0.5);
                }
            });
        });
    });

    // Make the obstacle move toward the player
    this.tweens.add({
        targets: this.obstacle,
        x: -60,
        duration: 5000,

        onUpdate: () => {
            this.obstacle.body.updateFromGameObject();
        }
    });
}

function update() {

    // Check if the player is standing on the ground
    const onGround = this.player.body.onFloor() || this.player.body.touching.down;

    // Jump when the spacebar is pressed
    if (Phaser.Input.Keyboard.JustDown(this.spacebar) && onGround) {
        this.player.body.setVelocityY(-500);
    }
}
