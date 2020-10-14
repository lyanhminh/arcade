const HEIGHT = 800;
const WIDTH = 600;
const FRAMERATE = 100;
const SPAWNRATE = FRAMERATE* 20;
const SPEED = 10;
const MISSILE_SPEED = SPEED * 1.5;
const INVADER_SPEED = SPEED * .8;
const REGENERATERATE = 10 * FRAMERATE;
const JITTERRATE = .85;

const gameCanvas = {
    canvas: document.getElementById('canvas'),
    ship: null,
    invaders: [],
    pause: true,
    keys:[],
    missiles: [],
    start: function () {
        this.canvas.width = WIDTH;
        this.canvas.height = HEIGHT;
        this.context = this.canvas.getContext('2d');
        this.interval = setInterval(updateCanvas, FRAMERATE);
        this.spawnInterval = setInterval(makeInvader, SPAWNRATE);
        this.regenerateInterval = setInterval(regenerateMissiles, REGENERATERATE)
        window.addEventListener('keydown', function (e) {
            gameCanvas.keys[e.code] = true;
        });
        window.addEventListener('keyup', function (e) {
            gameCanvas.keys[e.code] = false;
        });
        window.addEventListener('keypress', function (e) {
            if (e.code == 'Enter') {
                console.log('pause', gameCanvas.pause)
                if (gameCanvas.pause) {
                    // gameCanvas.intervals( interval => clearInterval(interval))
                    clearInterval(gameCanvas.interval);
                    clearInterval(gameCanvas.spawnInterval);
                    clearInterval(gameCanvas.regenerateInterval)
                    gameCanvas.pause = false;
                }
                else {
                    gameCanvas.interval = setInterval(updateCanvas, FRAMERATE);
                    gameCanvas.spawnInterval = setInterval(makeInvader, SPAWNRATE);
                    gameCanvas.regenerateInterval = setInterval(regenerateMissiles, REGENERATERATE)
                    gameCanvas.pause = true;
                }
            }
            if(e.code == 'Space'){
                gameCanvas.ship.fire();
            }

        })
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    },
    drawMissileBar: function () {
        for(i = 1; i <= this.ship.missiles ; i++){
            this.context.fillStyle = 'black';
            this.context.fillRect(i*(5 + 10), HEIGHT - 15, 10, 10)
        }
    },
}

const regenerateMissiles = function () {
    gameCanvas.ship.regenerate();
}

const updateCanvas = function(){
    gameCanvas.clear();
    updateKeys();
    gameCanvas.ship.render();
    gameCanvas.missiles.map(function(missile) { 
        missile.update(); 
        missile.render()})
    gameCanvas.drawMissileBar()
    gameCanvas.invaders = gameCanvas.invaders.filter(invader => invader.y < HEIGHT + 10);
    gameCanvas.invaders.map(function(invader) {
        invader.update();
        invader.render()
    })
    console.log('no of invaders ', gameCanvas.invaders.length)
    // gameCanvas.invaders.map(invader => invader.draw)

}

class Missile{
    static width = 10;
    static length = 10;
    constructor(color, x, y, vx, vy) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }
    render() {
        gameCanvas.context.fillStyle = this.color;
        gameCanvas.context.fillRect(this.x, this.y, Missile.width, Missile.length)
    }
    update(){
        this.x += this.vx;
        this.y += this.vy;
    }
}

class Ship{
    static maxMissiles = 20;
    constructor(pos) {
        this.x = pos[0];
        this.y = pos[1];
        this.vx = 0;
        this.vy = 0;
        this.missiles = 20///Ship.maxMissiles;;
        this.color =  'blue' ;
        console.log(this.missiles, Ship.maxMissiles)
    }
    render(){
        gameCanvas.context.fillStyle = this.color;
        gameCanvas.context.fillRect(this.x, this.y, 20, 50); //main fuselage
        gameCanvas.context.fillRect(this.x -15, this.y +25, 15, 25);
        gameCanvas.context.fillRect(this.x + 20, this.y + 25, 15, 25);
    }
    update(vx, vy){
        this.vx = vx;
        this.vy = vy ;
        this.x += this.vx;
        this.y += this.vy;
    }
    fire(){
        if(this.missiles > 0){
            const missile = new Missile('red', this.x + 5, this.y - Missile.length, this.vx, - MISSILE_SPEED)
            gameCanvas.missiles.push(missile)
            this.missiles -= 1;
        }
        
    }
    regenerate(){
        console.log(Ship.maxMissiles, this.missiles)
        this.missiles = this.missiles == Ship.maxMissiles ? this.missiles : this.missiles + 1;
    }
} 

class Invader extends Ship{
    constructor(pos){
        super(pos);
        this.color = 'red';
        this.vy = INVADER_SPEED;
        this.vx = INVADER_SPEED;
    }
    render(){
        gameCanvas.context.beginPath();
        gameCanvas.context.ellipse(this.x, this.y, 15,10,0, 0, 2*Math.PI )
        gameCanvas.context.stroke()
        gameCanvas.context.fillStyle = this.color;
        gameCanvas.context.fill();
        drawCircle('yellow', this.x, this.y - 10, 15)
    }
    update(){
        this.vx = Math.random() > JITTERRATE ? -1*this.vx : this.vx;
        this.x += this.vx;
        this.y += this.vy;
    }
}

const makeInvader = function(){
    const invader = new Invader([WIDTH * Math.random(), 30]);
    gameCanvas.invaders.push(invader)

}

const updateKeys = function() {
    let vx = gameCanvas.ship.vx - Math.sign(gameCanvas.ship.vx);
    let vy = gameCanvas.ship.vy - Math.sign(gameCanvas.ship.vy);
    let fire = false;
    if (gameCanvas.keys && gameCanvas.keys['ArrowRight']) { vx = SPEED; console.log('-1') }
    if (gameCanvas.keys && gameCanvas.keys['ArrowDown']) { vy = SPEED ; console.log('vy') }
    if (gameCanvas.keys && gameCanvas.keys['ArrowUp']) { vy = -SPEED ; console.log('vy') }
    if (gameCanvas.keys && gameCanvas.keys['ArrowLeft']) { vx = -SPEED ; console.log('1') }
    if (gameCanvas.keys && gameCanvas.keys['Space']) { fire = true; console.log('1') }
    gameCanvas.ship.update(vx, vy)

}

function drawCircle(color, x,y, diameter){
    gameCanvas.context.fillStyle = color;
    gameCanvas.context.beginPath();
    gameCanvas.context.arc(x, y, diameter/2, 0, 2 * Math.PI);
    gameCanvas.context.fill();
}


const startInvaders = function(){
    gameCanvas.ship = new Ship( [WIDTH/2, HEIGHT -115])
    let invader = new Invader([WIDTH*.6, 50])
    gameCanvas.invaders.push(invader)
    console.log(gameCanvas.ship)
    gameCanvas.start()
}

startInvaders()