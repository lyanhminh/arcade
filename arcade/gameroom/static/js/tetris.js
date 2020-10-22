BLOCK_SIZE = 30;
WIDTH = BLOCK_SIZE * 13;
HEIGHT = BLOCK_SIZE * 25;
GRAVITY = BLOCK_SIZE
SHAPES = ['I', 'L', 'S', 'T'];
MOVEX = 1
MOVEY = 2
FRAMERATE = 220;
BLOCKRATE = FRAMERATE * 1;
SPAWNRATE = FRAMERATE *25;
KEYRATE = FRAMERATE * .2

VX = BLOCK_SIZE;

let Mrotation = math.matrix([[0, -1], [1, 0]]);

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

const gameCanvas = {
    canvas: document.getElementById('canvas'),
    shapesList: [],
    blocksList: [],
    activeShapeIdx: 0,
    keys: [],
    vx: 0,
    vy: 1,
    score: 0,
    pause: true,
    rotate: false,
    start: function () {
        this.canvas.width = WIDTH;
        this.canvas.height = HEIGHT;
        this.context = this.canvas.getContext('2d');
        document.body.insertBefore(this.canvas, document.body.firstChild);
        this.interval = setInterval(updateGameCanvas, FRAMERATE);
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
                    gameCanvas.pause = false;
                }
                else {
                    gameCanvas.interval = setInterval(updateGameCanvas, FRAMERATE);
                    gameCanvas.spawnInterval = setInterval(gameCanvas.makeNewShape, SPAWNRATE);
                    gameCanvas.pause = true;
                }
            }

        })

    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    setControlledShape: function () {
        if (this.shapesList.filter(shape => shape.isActive).length > 0 && this.shapesList.every(shape => !shape.isControlled)) {
            this.shapesList.filter(shape => shape.isActive).sort((a, b) => a.id - b.id)[0].isControlled = true
        }
    },
    deleteRows: function (shapeObj) {
        let shapesList = this.shapesList;
        const ys = shapeObj.set.map(block => block.y).filter(onlyUnique);
        const fullRows = ys.map(y => shapesList.map(shape => shape.set).flat().filter(block => block.y == y)).filter(row => row.length == WIDTH / BLOCK_SIZE)
        fullRows.map(row => row.map(function (rowBlock) {
            shapesList.filter(shape => shape.id == rowBlock.shapeID).map(shape => shape.set = shape.set.filter(block => block.id != rowBlock.id))
        }))
        console.log(fullRows)
        if (fullRows.length != 0) {
            gameCanvas.shiftDown(fullRows.map(row => row[0].y));
            gameCanvas.score += fullRows.length*10;

        }
    },
    shiftDown: function (ys) {
        let shapesList = this.shapesList;
        console.log(ys)
        ys.sort().map(y => shapesList.map(shape => shape.set).flat().filter(block => block.y < y).map(block => block.y = block.y + BLOCK_SIZE))
    },
    displayScore: function(){

        this.context.font = "30px Arial";
        this.context.fillStyle = 'green'
        this.context.strokeText(this.score, WIDTH/2, this.over ? HEIGHT/2 + 40: HEIGHT/2);
    },
    getTippetyTop: function(){
        let tops = this.shapesList.filter(shape => !shape.isActive).map(shape => shape.set).flat().map(block => block.y)
        return tippetyTop = Math.min(...tops)
    },
    stopGame: function(){
        if(this.getTippetyTop()<=0){
            console.log('GAME OVER', this.getTippetyTop())
            clearInterval(this.interval);
            clearInterval(this.spawnInterval)
            this.over = true;
        }
    },
    displayEnd: function(){
        if(this.over){
            this.context.font = "30px Arial";
            this.context.fillStyle = 'red'
            this.context.strokeText('GAME OVER', WIDTH/2 - 80, HEIGHT/2);

    }
        }


}

gameCanvas.makeNewShape = function () {
    const shapeString = SHAPES[Math.floor(Math.random() * SHAPES.length)]
    newShape = new Shape(shapeString);
    gameCanvas.shapesList.push(newShape);
    gameCanvas.blocksList.push(...newShape.set)
}

class Shape {
    constructor(type) {
        this.id = gameCanvas.shapesList.length;
        this.set = this.makeSet(type)
        this.isActive = true;
        this.isControlled = false;
        this.tops = this.determineTops();
        this.sides = this.determineSides();
    }
    makeSet(type) {
        let color;
        switch (type) {
            case 'T':
                color = 'red'
                return [new Block(color, WIDTH / 2, BLOCK_SIZE / 2, [0, BLOCK_SIZE], this.id),
                new Block(color, WIDTH / 2, BLOCK_SIZE / 2, [0, 0], this.id),
                new Block(color, WIDTH / 2, BLOCK_SIZE / 2, [-BLOCK_SIZE, 0], this.id),
                new Block(color, WIDTH / 2, BLOCK_SIZE / 2, [BLOCK_SIZE, 0], this.id)]
            case 'L':
                color = 'blue';
                return [new Block(color, WIDTH / 2, 3 * BLOCK_SIZE / 2, [0, 0], this.id),
                new Block(color, WIDTH / 2, 3 * BLOCK_SIZE / 2, [0, BLOCK_SIZE], this.id),
                new Block(color, WIDTH / 2, 3 * BLOCK_SIZE / 2, [0, -BLOCK_SIZE], this.id),
                new Block(color, WIDTH / 2, 3 * BLOCK_SIZE / 2, [BLOCK_SIZE, BLOCK_SIZE], this.id)]
            case 'S':
                color = 'green';
                return [new Block(color, WIDTH / 2 + BLOCK_SIZE / 2, BLOCK_SIZE, [BLOCK_SIZE / 2, -BLOCK_SIZE / 2], this.id),
                new Block(color, WIDTH / 2 + BLOCK_SIZE / 2, BLOCK_SIZE, [BLOCK_SIZE / 2, BLOCK_SIZE / 2], this.id),
                new Block(color, WIDTH / 2 + BLOCK_SIZE / 2, BLOCK_SIZE, [-BLOCK_SIZE / 2, BLOCK_SIZE / 2], this.id),
                new Block(color, WIDTH / 2 + BLOCK_SIZE / 2, BLOCK_SIZE, [-BLOCK_SIZE / 2, -BLOCK_SIZE / 2], this.id)]
            case 'I':
                color = 'orange';
                return [new Block(color, WIDTH / 2 + BLOCK_SIZE / 2, -BLOCK_SIZE, [BLOCK_SIZE / 2, BLOCK_SIZE / 2], this.id),
                new Block(color, WIDTH / 2 + BLOCK_SIZE / 2, -BLOCK_SIZE, [BLOCK_SIZE / 2, 3 * BLOCK_SIZE / 2], this.id),
                new Block(color, WIDTH / 2 + BLOCK_SIZE / 2, -BLOCK_SIZE, [BLOCK_SIZE / 2, -3 * BLOCK_SIZE / 2], this.id),
                new Block(color, WIDTH / 2 + BLOCK_SIZE / 2, -BLOCK_SIZE, [BLOCK_SIZE / 2, -BLOCK_SIZE / 2], this.id)]
        }
    }
    determineIfActive() {

        if (gameCanvas.shapesList.length == 1) { return true; }
        return this.determineTops().every(top => top[1] > BLOCK_SIZE + Math.max(...this.set.filter(block => block.x == top[0]).map(block => block.y)))

    }
    determineTops() {
        let id = this.id;
        let tops;
        const shapeSet = this.set;
        if (gameCanvas.shapesList.length == 1) {
            tops = this.set.map(block => block.x).filter(onlyUnique).map(x => [x, HEIGHT - BLOCK_SIZE]);
        }
        else {
            let xs = this.set.map(block => block.x).filter(onlyUnique);
            tops = xs.map(function (x) {
                let blocksAtX = gameCanvas.shapesList.map(shape => shape.set).flat().filter(blockListBlock =>
                    blockListBlock.shapeID != id &&
                    !gameCanvas.shapesList.filter(shape => shape.id == blockListBlock.shapeID)[0].isActive &&
                    blockListBlock.x == x &&
                    blockListBlock.y > Math.max(...shapeSet.filter(shapeBlock => shapeBlock.x == blockListBlock.x).map(shapeBlock => shapeBlock.y))
                )
                return blocksAtX.length == 0 ? [x, HEIGHT] : [x, Math.min(...blocksAtX.map(block => block.y))];
            })
        }
        this.tops = tops;
        return tops;
    }
    determineSides(dy) {
        let id = this.id;
        const set = this.set;
        let ys = this.set.map(block => block.y).filter(onlyUnique);
        let sides = ys.map(function (y) {
            let blocksAtY = gameCanvas.shapesList.map(shape => shape.set).flat().filter(blockListBlock => blockListBlock.shapeID != id &&
                !gameCanvas.shapesList.filter(shape => shape.id == blockListBlock.shapeID)[0].isActive &&
                blockListBlock.y == y + dy)
            const divider = gameCanvas.vx > 0 ? Math.max(...set.map(block => block.x)) + BLOCK_SIZE : Math.min(...set.map(block => block.x));
            let oneSidedBlocksAtY = gameCanvas.vx > 0 ? blocksAtY.filter(block => block.x >= divider) : blocksAtY.filter(block => block.x + BLOCK_SIZE <= divider)
            const sideEdge = gameCanvas.vx > 0 ? WIDTH : 0;
            return oneSidedBlocksAtY.length == 0 ? [y + dy, sideEdge] :
                gameCanvas.vx > 0 ? [y + dy, Math.min(...oneSidedBlocksAtY.map(block => block.x))] : [y + dy, Math.max(...oneSidedBlocksAtY.map(block => block.x + BLOCK_SIZE))];
        })
        this.sides = sides;
        return sides;

    }
    setIsActive() {
        this.isActive = this.isActive && this.determineIfActive();
        if (!this.isActive) {
            this.isControlled = false;
            this.set.map(block => block.color = 'gray')
        }
        return this.isActive;
    }
    rotate() {
        if (gameCanvas.rotate && this.isControlled) {
            let rotationArray = this.set.map(function (block) {
                const [newX, newY] = math.multiply([block.originx, block.originy], Mrotation)._data
                let rotatedx = newX + block.x - block.originx;
                let rotatedy = newY + block.y - block.originy;
                return [rotatedx, rotatedy, newX, newY]
            })
            let outOfBounds = rotationArray.some(block => determineIfMovesOutOfBounds(block[0]))
            if (!outOfBounds) {
                let color = this.set[0].color;
                const newBlocks = rotationArray.map(block => new Block(color, block[0], block[1], [block[2], block[3]], this.id, true))
                this.set = newBlocks;
            }
        }
    }
    snapInPlace() {
        let deltaX;
        const spaceY = Math.min(...this.tops.map(top => top[1] - BLOCK_SIZE - Math.max(...this.set.filter(function (block) { return block.x == top[0] }).map(block => block.y))))
        const deltaY = spaceY >= gameCanvas.vy ? gameCanvas.vy : spaceY;
        if (gameCanvas.vx == 0) {
            deltaX = 0;
        }
        else {
            const f = gameCanvas.vx > 0 ? Math.max : Math.min
            let spaceX = Math.min(...this.determineSides(deltaY).map(side => Math.abs(side[1] - f(...this.set.filter(block => block.y == side[0] - deltaY).map(block => block.x)))));
            spaceX = gameCanvas.vx > 0 ? spaceX - BLOCK_SIZE : spaceX
            deltaX = Math.abs(spaceX) >= Math.abs(gameCanvas.vx) ? gameCanvas.vx : spaceX;
        }
        return [deltaX, deltaY]
    }
    update() {
        if (this.isActive) {
            let vx = 0; let vy = GRAVITY;
            if (this.isControlled) {
                [vx, vy] = this.snapInPlace()
            }
            this.set.map(block => block.update(vx, vy))
        }
    }
}

class Block {
    constructor(color, x, y, local, shapeID, rotate = false) {
        this.x = !rotate ? x + local[0] - BLOCK_SIZE / 2 : x;
        this.y = !rotate ? y + local[1] - BLOCK_SIZE / 2 : y;
        this.originx = local[0];
        this.originy = local[1];
        this.color = color;
        this.shapeID = shapeID;
        this.id = uuid.v4();
    }
    update(vx, vy) {
        this.x = this.x + vx;
        this.y = this.y + vy;
    }
}

function determineIfMovesOutOfBounds(x) {
    return (x + gameCanvas.vx < 0) || (x + gameCanvas.vx > WIDTH - BLOCK_SIZE)
}

function updateKeys() {
    if (gameCanvas.keys && gameCanvas.keys['ArrowRight']) { gameCanvas.vx = VX * MOVEX; console.log('-1') }
    if (gameCanvas.keys && gameCanvas.keys['ArrowDown']) { gameCanvas.vy = GRAVITY * MOVEY; console.log('vy') }
    if (gameCanvas.keys && gameCanvas.keys['ArrowLeft']) { gameCanvas.vx = -VX * MOVEX; console.log('1') }
    if (gameCanvas.keys && gameCanvas.keys['Space']) { gameCanvas.rotate = true; console.log('1') }
}

function start() {
    gameCanvas.start();
    gameCanvas.makeNewShape();
    gameCanvas.setControlledShape();
    gameCanvas.spawnInterval = setInterval(gameCanvas.makeNewShape, SPAWNRATE);
    // keyInterval = setInterval(updateKeys, KEYRATE);
}

function updateGameCanvas() {
    gameCanvas.clear();
    gameCanvas.vx = 0;
    gameCanvas.vy = GRAVITY;
    gameCanvas.rotate = false;
    updateKeys();
    updateBlocks();
    gameCanvas.shapesList.map(shape => shape.set.map(function (block) {
        gameCanvas.context.fillStyle = block.color;
        gameCanvas.context.fillRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
    }))
    gameCanvas.stopGame();
    gameCanvas.displayEnd();
    gameCanvas.displayScore();

}

function updateBlocks() {
    for (shapeObj of gameCanvas.shapesList) {
        shapeObj.setIsActive()
        gameCanvas.setControlledShape();
        if (shapeObj.isControlled) {
            shapeObj.rotate();
        }
        if (shapeObj.isActive) {
            shapeObj.update();
            if (!shapeObj.setIsActive()) {
                gameCanvas.deleteRows(shapeObj);
            }
        }
    }
}

start()
// document.getElementById('start-game').addEventListener('click', start)
