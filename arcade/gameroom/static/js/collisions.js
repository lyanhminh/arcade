let distance = function(r1, r2) {
    return Math.sqrt((r1[0] - r2[0])**2 + (r1[1] -r2[1])**2)
}

let matchDirection = function(r1, r2){
    return math.sum(...[0,1].map(idx => r1[idx]*r2[idx]));
}

const directions = {
    up: [0,-1],
    down: [0,1],
    left: [-1,0],
    right: [1,0],
    upRight: [2/Math.sqrt(5), -1/Math.sqrt(5)],
    downRight: [2/Math.sqrt(5), 1/Math.sqrt(5)],
    downLeft: [-2/Math.sqrt(5),1/Math.sqrt(5)],
    upLeft: [-2/Math.sqrt(5),-1/Math.sqrt(5)]
}

const getDirection = function(r){
    const similarity = {};
    console.log('similarity', similarity)
    Object.entries(directions).forEach(([key, value]) => similarity[key] = matchDirection(value, r))
    const max = Math.max(...Object.entries(similarity).map(([key,value]) => value ));
    console.log(max, similarity,  Object.entries(similarity).filter(([key, value]) => value == max))
    return Object.entries(similarity).filter(([key, value]) => value == max)[0][0]
}



