const HEIGHT = 800;
const WIDTH = 600;
const FRAMERATE =80;
const SPAWNRATE = FRAMERATE* 20;
const SPEED = 12;
const MISSILE_SPEED = SPEED * 1.75;
const INVADER_SPEED = SPEED * .7;
const REGENERATERATE = 10 * FRAMERATE;
const JITTERRATE = .85;
const A = 15;
const B = 10;
const DIAMETER = 15;


const gameCanvas = {
    canvas: document.getElementById('canvas'),
    ship: null,
    invaders: [],
    pause: true,
    keys:[],
    score: 0,
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
                    clearInterval(gameCanvas.interval);
                    clearInterval(gameCanvas.spawnInterval);
                    clearInterval(gameCanvas.regenerateInterval);                    //stop();
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
    displayScore: function(hits){
        if(hits >0){
           this.context.font = "30px Arial";
           this.context.strokeText(this.score, WIDTH/2, HEIGHT/2);
        }

    },
    stop: function(){
        clearInterval(gameCanvas.interval);
        clearInterval(gameCanvas.spawnInterval);
        clearInterval(gameCanvas.regenerateInterval);
    }
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
    gameCanvas.drawMissileBar();


    gameCanvas.invaders.map(invader => invader.update())
    gameCanvas.invaders.map(invader => invader.render());
    let missileMask = gameCanvas.missiles.map(missile => missile.y > 0 && !gameCanvas.invaders.some(invader => invader.isHit(missile.center, 'missile')));
    let invaderMask = gameCanvas.invaders.map(invader => !invader.isHit(gameCanvas.ship.center) && !gameCanvas.missiles.some(missile => invader.isHit(missile.center,'missile')));
    gameCanvas.score += invaderMask.filter(bool => !bool).length * 10;
    gameCanvas.missiles = gameCanvas.missiles.filter((item, i) => missileMask[i])
    gameCanvas.invaders = gameCanvas.invaders.filter((invader,i) => invader.y < HEIGHT + 10 &&  invaderMask[i]);
    gameCanvas.displayScore(invaderMask.filter(bool => !bool).length);

    console.log('no of invaders ', gameCanvas.invaders.length)
    console.log('no of invaders ', gameCanvas.missiles.length)
    console.log('score', gameCanvas.score)

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
        this.center = [this.x + Missile.width/2, this.y + Missile.length/2]
    }
    render() {
        gameCanvas.context.fillStyle = this.color;
        gameCanvas.context.fillRect(this.x, this.y, Missile.width, Missile.length)
    }
    update(){
        this.x += this.vx;
        this.y += this.vy;
        this.center = [this.x + Missile.width/2, this.y + Missile.length/2];

    }
}

class Ship{
    static maxMissiles = 20;
    static length = 50;
    static width = 50;
    constructor(pos) {
        this.x = pos[0] ;
        this.y = pos[1];
        this.vx = 0;
        this.vy = 0;
        this.missiles = Ship.maxMissiles;;
        this.color =  'blue' ;
        this.center = [pos[0] + 10, pos[1] + 25];
        console.log(this.missiles, Ship.maxMissiles)
    }
    render(){
        gameCanvas.context.fillStyle = this.color;
        gameCanvas.context.fillRect(this.x, this.y, 20, Ship.length); //main fuselage
        gameCanvas.context.fillRect(this.x -15, this.y +25, 15, Ship.length/2);
        gameCanvas.context.fillRect(this.x + 20, this.y + 25, 15, Ship.length/2);

        //collision development
        gameCanvas.context.fillStyle = 'white';
        gameCanvas.context.fillRect(this.center[0], this.center[1], 2,2);

        gameCanvas.context.beginPath();
        gameCanvas.context.lineWidth = "2";
        gameCanvas.context.strokeStyle = 'red'
        gameCanvas.context.rect(this.x - 40, this.y - .5*Ship.length, 2*Ship.length, 2*Ship.length);
        gameCanvas.context.stroke();

        gameCanvas.context.strokeStyle = 'red';
        gameCanvas.context.beginPath();
        gameCanvas.context.arc(this.center[0], this.center[1] , Ship.length, 0, 2 * Math.PI);
        gameCanvas.context.stroke();

        gameCanvas.context.strokeStyle = 'red';
        gameCanvas.context.beginPath();
        gameCanvas.context.arc(this.center[0], this.center[1] , Ship.length*.7, 0, 2 * Math.PI);
        gameCanvas.context.stroke();

    }
    update(vx, vy){
        this.vx = vx;
        this.vy = vy ;
        this.x = this.center[0] + this.vx > WIDTH - Ship.width/2 ? WIDTH - 35 : this.center[0] + this.vx < Ship.width/2 ? 15 : this.x + this.vx;
        this.y =  this.center[1] + this.vy > HEIGHT - Ship.length/2 ? HEIGHT - Ship.length :  this.center[1] + this.vy < Ship.length/2 ? 0 : this.y + this.vy;
        this.center = [this.x +10, this.y +25];
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
        this.center = pos;
        this.a = A;
        this.b = B;
        this.top = this.y -  this.b;
        this.bottom = [this.x, this.y + this.b];
        this.insideR = [this.x + DIAMETER/2, this.top[1]  - this.b + 2 ];
        this.insideL = [this.x - DIAMETER/2, this.top[1]  - this.b + 2 ];
        console.log(this.top, this.bottom)
    }
    render(){
        gameCanvas.context.beginPath();
        gameCanvas.context.ellipse(this.x, this.y, this.a, this.b, 0, 0, 2*Math.PI )
        gameCanvas.context.stroke()
        gameCanvas.context.fillStyle = this.color;
        gameCanvas.context.fill();
        drawCircle('yellow', this.x, this.y - this.b, DIAMETER)

        gameCanvas.context.fillStyle = 'white';
        gameCanvas.context.fillRect(this.center[0], this.center[1], 2,2);
    }
    update(){
        this.vx = Math.random() > JITTERRATE ? -1*this.vx : this.vx;
        this.x = this.center[0] + this.vx > WIDTH - this.a ? WIDTH - this.a : this.center[0] + this.vx < this.a ? this.a : this.x + this.vx;
        this.y =  this.y + this.vy ;
        this.center = [this.x +10, this.y +25];
        this.center = [this.x, this.y];
        this.top = [this.x, this.y - this.b];
        this.bottom = [this.x, this.y + this.b];
        this.insideR = [this.x + DIAMETER/2, this.top[1]  - this.b + 2 ];
        this.insideL = [this.x - DIAMETER/2, this.top[1]  - this.b + 2 ];
    }
    isHit(r, collider){
        let separation = distance(this.center, r);
        let lgSeparation = collider == 'missile' ? Missile.length/2 + DIAMETER  : Ship.length*.8;
        let smallSeparation = Missile.width/2 + A/2;
        let lgDirections = ['down', 'downLeft', 'downRight'];

        if( separation >  lgSeparation){
            return false;
        }
        let direction = getDirection([r[0] - this.center[0]  ,  r[1]- this.center[1]])
        if(collider != 'missile'){
            smallSeparation = Ship.length*.68;
            lgDirections = ['up', 'down', 'upRight', 'upLeft', 'left', 'right'];
        }
        if(lgDirections.includes(direction) ){
            if(collider != 'missile'){
                gameCanvas.stop();
            }
            return true;
        }
        else{
            if(separation < smallSeparation){
                if(collider != 'missile'){
                    gameCanvas.stop();
                }
                console.log('HIIIIIIIIIIIIIIIIIIIIIIITTTTTTTTTT')
                console.log(direction)
                return true;
            }
            return false;

        }

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
    if (gameCanvas.keys && gameCanvas.keys['Space']) { fire = true ;console.log('1') }
    gameCanvas.ship.update(vx, vy)

}

function drawCircle(color, x,y, diameter){
    gameCanvas.context.fillStyle = color;
    gameCanvas.context.beginPath();
    gameCanvas.context.arc(x, y, diameter/2, 0, 2 * Math.PI);
    gameCanvas.context.fill();
}


const start = function(){
    gameCanvas.ship = new Ship( [WIDTH/2, HEIGHT -115])
    let invader = new Invader([WIDTH*.6, 50])
    gameCanvas.invaders.push(invader)
    console.log(gameCanvas.ship)
    gameCanvas.start()
}

start()
// document.getElementById('start-game').addEventListener('click', start)
