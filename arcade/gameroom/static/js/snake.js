DIAMETER = 30;
STEP = 18
WIDTH = DIAMETER * STEP;
HEIGHT = DIAMETER * STEP;
FRAMERATE = 100;
STARTING_SNAKE_LENGTH = 6;
STARTX = WIDTH / 2 - DIAMETER * 3 + DIAMETER/2;
STARTY = HEIGHT / 2 + DIAMETER/2;
SPEED = DIAMETER/2;

const makeRandom = function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const gameCanvas = {
    canvas: document.getElementById('canvas'),
    paused: true,
    setFoodOut: true,
    foodPos: [1,1],
    turnPoints: [],
    over: false,
    score: 0,
    start: function () {
        console.log('starting game')
        this.canvas.width = WIDTH;
        this.canvas.height = HEIGHT;
        this.context = this.canvas.getContext('2d');
        this.interval = setInterval(updateCanvas, FRAMERATE);
        console.log('add listener')
        window.addEventListener('keydown', function (e) {
            console.log('keypress', e.code)
            if (e.code == 'Enter') {
                if (gameCanvas.paused) {
                    clearInterval(gameCanvas.interval)
                    gameCanvas.paused = false;
                }
                else {
                    gameCanvas.interval = setInterval(updateCanvas, FRAMERATE);
                    gameCanvas.paused = true;
                }
            }
            else {
                gameCanvas.snake.update(e.code);
            }

        })
    },
    clear: function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    placeFood: function(){
        if(this.setFoodOut){
            while(true){
            let x; let y;
            [x, y] = [0,1].map(x=> DIAMETER*(makeRandom(0, STEP -1) + 1/2))
            if(gameCanvas.snake.body.every(segment => distance([segment.x, segment.y], [x, y])>= DIAMETER)){
                [gameCanvas.foodPos[0], gameCanvas.foodPos[1]] = [x, y]
                break;
            }
            }
        }
        this.setFoodOut = false;
    },
    stopGame: function(){
        if(this.snake.head.x < DIAMETER/2 || this.snake.head.x > WIDTH - DIAMETER/2 || this.snake.head.y < DIAMETER/2 || this.snake.head.y > HEIGHT - DIAMETER/2){
            clearInterval(this.interval);
            clearInterval(this.spawnInterval)
            this.over = true;
        }
    },
    displayScore: function(){

        this.context.font = "30px Arial";
        this.context.fillStyle = 'green'
        this.context.strokeText(this.score, WIDTH/2, this.over ? HEIGHT/2 + 40: HEIGHT/2);
    },
    displayEnd: function(){
        if(this.over){
            this.context.font = "30px Arial";
            this.context.fillStyle = 'red'
            this.context.strokeText('GAME OVER', WIDTH/2 - 80, HEIGHT/2);
        }
    }
}

function updateCanvas() {
    gameCanvas.clear();
    gameCanvas.placeFood();
    gameCanvas.snake.update();
    gameCanvas.snake.body.map(segment => {drawCircle(segment.color, segment.x, segment.y);
    })
    drawCircle('green', gameCanvas.foodPos[0], gameCanvas.foodPos[1])
    gameCanvas.stopGame()
    gameCanvas.displayScore();
    gameCanvas.displayEnd();
}

class TurnPoint {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }
}

class Segment {
    constructor(color, x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy
        this.color = color
    }
    update(){
        [this.vx, this.vy] = this.getNewVelocity();
        this.x = this.x + this.vx;
        this.y = this.y + this.vy;
        console.log('same seg update', this.x, this.y, this.vx, this.vy)
    }
    getNewVelocity(){
        const turnpoint = gameCanvas.snake.turnpoints.filter(turnpoint => turnpoint.x == this.x && turnpoint.y == this.y);
        console.log('segment update', this.x, this.y, this.color)
        let vx = this.vx;
        let vy = this.vy;
        if(turnpoint.length>0){
            console.log('in turnpoint')
            vx = turnpoint[0].vx
            vy = turnpoint[0].vy;
            console.log('vx', this.vx, turnpoint[0].vx)
        }
        return [vx, vy ]

    }
}

class Snake {
    constructor(x,y, vx, vy) {
        this.body = Array.from(Array(STARTING_SNAKE_LENGTH), (x, index) => index).
            map(segment => new Segment('gray', x + (STARTING_SNAKE_LENGTH - segment) * DIAMETER , y , vx, vy));
        this.tail = this.body.slice(-1)[0];
        this.head = this.body[0];
        this.head.color = 'blue';
        this.turnpoints = [];
        this.remove = false;
    }

    update(turn){
        console.log('snake update')
        if(turn){
            let vy;
            let vx;
            switch (turn) {
                case 'ArrowUp':
                    vy = -SPEED;
                    vx = 0;
                    break;
                case 'ArrowDown':
                    vy = SPEED;
                    vx = 0;
                    break;
                case 'ArrowLeft':
                    vy = 0;
                    vx = -SPEED;
                    break;
                case 'ArrowRight':
                    vx = SPEED;
                    vy = 0;
            }
            if(!this.doesSelfReverse(vx, vy))
            {
                // this.head.vx = vx;
                // this.head.vy = vy;
                this.turnpoints.push(new TurnPoint(this.head.x, this.head.y, vx, vy))
            }

        }
        // const doesSelfCollide = this.doesSelfReverse(this.head.vx, this.head.vy);
        if(this.doesSelfCollide(this.head.vx, this.head.vy)){
            console.log('GAME OVER')
            clearInterval(gameCanvas.interval)
        }
        this.eat();
        this.remove = this.shouldRemoveTurnpoint();
        this.body.map(segment => segment.update());
        this.turnpoints = this.remove ? this.turnpoints.slice(1) : this.turnpoints;
    }
    doesSelfReverse(vx, vy){
        return ((vx != 0 && vx == -this.head.vx) || (vy != 0 && vy == -this.head.vy))
    }
    shouldRemoveTurnpoint(){
            return this.turnpoints.length ? this.tail.x == this.turnpoints[0].x && this.tail.y == this.turnpoints[0].y : false
    }
    doesSelfCollide(vx, vy){
        gameCanvas.snake.body.slice(1,-1).map(bodySegment => console.log('dx: ', this.head.x + vx - bodySegment.x - bodySegment.getNewVelocity()[0] ,
        'dy: ', this.head.y + vy - bodySegment.y  - bodySegment.getNewVelocity()[1], 'distance', distance([this.head.x + vx, bodySegment.x + bodySegment.getNewVelocity()[0]],
        [this.head.y + vy, bodySegment.y + bodySegment.getNewVelocity()[1]])))
        // return false //this.body.slice(0,-1).some(segment => (segment.x == this.head.x + vx || segment.y == this.head.y + vy) );
        // return intersections.length ? true: false

        // const bodySegment = this.body.slice(-2)[0]
        // console.log('bodysegment', bodySegment, 'head',this.head.x + 2*vx, this.head.y + 2*vy)
        // if(this.head.x + vx - bodySegment.x <= DIAMETER && this.head.y + vy - bodySegment.y <= DIAMETER){
        //     return true
        // };
        // return gameCanvas.snake.body.slice(1,-1).some(bodySegment => distance([gameCanvas.snake.head.x + vx, bodySegment.x + bodySegment.getNewVelocity()[0]],
        //                                                          [gameCanvas.snake.head.y + vy, bodySegment.y + bodySegment.getNewVelocity()[1]]) < DIAMETER/2)
        let close =gameCanvas.snake.body.slice(1,-1).filter(bodySegment => distance([gameCanvas.snake.head.x + vx, bodySegment.x + bodySegment.getNewVelocity()[0]],
                                                                 [gameCanvas.snake.head.y + vy, bodySegment.y + bodySegment.getNewVelocity()[1]]) < DIAMETER/2)
        close.map(segment => segment.color ='red')
        return false;
    }
    eat(){
        if(distance([this.head.x, this.head.y], [gameCanvas.foodPos[0], gameCanvas.foodPos[1]]) <= DIAMETER/4){
            gameCanvas.setFoodOut = true;
            gameCanvas.placeFood();
            this.body.push(new Segment('gray', this.tail.x - Math.sign(this.tail.vx)*DIAMETER, this.tail.y - Math.sign(this.tail.vy)*DIAMETER, this.tail.vx, this.tail.vy ))
            this.tail = this.body.slice(-1)[0];
            gameCanvas.score += 10;
        }
    }
}

function start() {
    gameCanvas.snake = new Snake(STARTX, STARTY, SPEED, 0);
    gameCanvas.start();
    console.log(gameCanvas.snake)
}



function distance(pos1, pos2){
    return Math.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)
}

function drawCircle(color, x,y){
    console.log(color,x,y)
    gameCanvas.context.fillStyle = color;
    gameCanvas.context.beginPath();
    gameCanvas.context.arc(x, y, DIAMETER/2, 0, 2 * Math.PI);
    gameCanvas.context.fill();
}

wrapAround = function(pos){
    switch(pos){
        case 0:
            return WIDTH - DIAMETER/2;
        case WIDTH :
            return DIAMETER/2;
        default:
            return pos;
    }
}

start();