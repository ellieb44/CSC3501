
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    backgroundColor: "#1a1a2e",

    scene: {
        create: create
    }
};

const game = new Phaser.Game(config);

function create() {
    this.add.text(250, 50, "Welcome to CPU Escape!", {
        fontSize: "28px",
        color: "#ffffff"
    });

    // Create our player character
    this.add.rectangle(100, 300, 40, 40, 0x00ff00);
    // Create the ground
    this.add.rectangle(400, 380, 800, 40, 0x555555);

}
