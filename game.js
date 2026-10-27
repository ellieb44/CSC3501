
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    
backgroundColor: "#1a1a2e",

//enable physics
physics: {
    default: "arcade",
    
    arcade: {
        gravity: { x: 0, y: 700 }, //higher number for  faster gravity
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
    this.add.text(250, 50, "Welcome to CPU Escape!", {
        fontSize: "28px",
        color: "#ffffff"
    });


    // Create our player character with physics
    this.player = this.add.rectangle(100, 100, 40, 40, 0x00ff00);
    this.physics.add.existing(this.player);
    
    // Create the ground
    this.ground = this.add.rectangle(400, 380, 800, 40, 0x555555);

    // Give the ground physics
    this.physics.add.existing(this.ground, true);

    // Make the player land on the ground
    this.physics.add.collider(this.player, this.ground);
    
    // Create our first obstacle
    this.obstacle = this.add.rectangle(600, 330, 40, 60, 0xff0000);
    
    // Give the obstacle a physics body
    this.physics.add.existing(this.obstacle, true);

    // Detect when the player hits the obstacle
    
    // Detect when the player hits an obstacle
    this.physics.add.overlap(this.player, this.obstacle, () => {

        // Stop the obstacle
        this.tweens.pauseAll();

        // Pause the physics
        this.physics.pause();

        // Show a message
        this.add.text(220, 180, "You hit an obstacle!", {
            fontSize: "28px",
            color: "#ff0000"
        });
    });


    
    // Make the obstacle move to the left
    this.tweens.add({
        targets: this.obstacle,
        x: -50,
        duration: 4000,

        onUpdate: () => {
            this.obstacle.body.updateFromGameObject();
        }
    });


 
    // Set up the spacebar for jumping
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


}


function update() {
    // Check if the player is standing on the ground
    const onGround = this.player.body.onFloor() || this.player.body.touching.down;

    // Check if the spacebar was just pressed
    if (Phaser.Input.Keyboard.JustDown(this.spacebar) && onGround) {
        this.player.body.setVelocityY(-500); //lower number for jump height
    }
}


