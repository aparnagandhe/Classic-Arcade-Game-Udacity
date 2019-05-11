
// HELPER METHODS //

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};
Number.prototype.fit = function(oldMin, oldMax, newMin, newMax) {
    return (this - oldMin) / (oldMax - oldMin) * (newMax - newMin) + newMin;
};


// SCREEN ENTITY - SUPER CLASS FOR ALL THINGS THAT APPEAR ON SCREEN //

var ScreenEntity = function() {};

//shared properties//

ScreenEntity.prototype.x = 0;  
ScreenEntity.prototype.y = 0;  
ScreenEntity.prototype.col = 0;  
ScreenEntity.prototype.row = 0;  
ScreenEntity.prototype.collisionAreaMarginRight = 0;  
ScreenEntity.prototype.collisionAreaMarginLeft = 0;  
ScreenEntity.prototype.renderOffsetX = 0;  
ScreenEntity.prototype.renderOffsetY = 0;  
ScreenEntity.prototype.isVisible = true;

//shared methods //

ScreenEntity.prototype.update = function(dt) {};
ScreenEntity.prototype.render = function() {
    if (this.isVisible) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};
ScreenEntity.prototype.setCol = function(col) {
    this.col = col;
    this.x = col * 101 + this.renderOffsetX;
};
ScreenEntity.prototype.setRow = function(row) {
    this.row = row;
    this.y = row * 83 + this.renderOffsetY;
};
ScreenEntity.prototype.hasCollidedWith = function(entity) {
    return (


        (this.isVisible === true) &&

        
        (this.row === entity.row) &&

        
        ((this.x + 101 - this.collisionAreaMarginRight) > (entity.x + entity.collisionAreaMarginLeft)) &&
        
        ((this.x + this.collisionAreaMarginLeft) < (entity.x + 101 - entity.collisionAreaMarginRight))
    );
};


// ENEMY CLASS //


var Enemy = function() {
    this.sprite = 'images/enemy-bug.png';
    this.collisionAreaMarginLeft = 3;
    this.collisionAreaMarginRight = 3;
    this.renderOffsetY = -20;

    
    this.reset();
};

//inherit from ScreenEntity //
Enemy.prototype = Object.create(ScreenEntity.prototype);
Enemy.prototype.constructor = Enemy;

//shared properties //
Enemy.prototype.minSpeed = 250;  
Enemy.prototype.maxSpeed = 400;  
Enemy.prototype.minInitialDelay = 0.5; 
Enemy.prototype.maxInitialDelay = 1.5;  

//shared methods //
Enemy.prototype.reset = function() {

    
    this.setRow(Math.floor(Math.random().fit(0, 1, 1, 4)));

    
    this.speed = Math.random().fit(0, 1, this.minSpeed, this.maxSpeed);

    
    this.x = -Math.random().fit(0, 1, this.minInitialDelay, this.maxInitialDelay) * this.speed;
};
Enemy.prototype.update = function(dt) {

    
    this.x += this.speed * dt;

    
    if (this.x > canvasWidth) {
        this.reset();
    }
};


// PLAYER CLASS //

var Player = function() {
    this.sprite = 'images/char-pink-girl.png';
    this.collisionAreaMarginLeft = 16;
    this.collisionAreaMarginRight = 16;

   
    this.reset();
};


Player.prototype = Object.create(ScreenEntity.prototype);
Player.prototype.constructor = Player;


Player.prototype.reset = function() {
    this.setRow(5);
    this.setCol(2);
};
Player.prototype.handleInput = function(keyString) {
    if (keyString !== 'undefined') {
        switch (keyString) {
            case 'left':
                this.setCol((this.col - 1).clamp(0, numCols - 1));
                break;
            case 'right':
                this.setCol((this.col + 1).clamp(0, numCols - 1));
                break;
            case 'up':
                this.setRow((this.row - 1).clamp(0, numRows - 1));
                break;
            case 'down':
                this.setRow((this.row + 1).clamp(0, numRows - 1));
                break;
        }
    }
};




// COLLECTABLE - SUPER CLASS FOR ALL POWER UP ITEMS //

var Collectable = function() {};
Collectable.prototype = Object.create(ScreenEntity.prototype);
Collectable.prototype.constructor = Collectable;
Collectable.prototype.renderOffsetY = -32;


// STAR COLLECTABLE CLASS //

var Star = function() {
    this.sprite = 'images/Star.png';
    this.points = 10;
    this.appearProbability = 0.2;
};
Star.prototype = Object.create(Collectable.prototype);
Star.prototype.constructor = Star;




// TEXT CLASS //

var ScreenText = function(text, col, row, duration, color) {
    this.text = text;
    this.setCol(col);
    this.setRow(row);
    this.duration = duration;
    this.color = color;
    this.speed = 50;  
};
ScreenText.prototype = Object.create(ScreenEntity.prototype);
ScreenText.prototype.constructor = ScreenText;
ScreenText.prototype.update = function(dt) {
    this.duration -= dt;
    this.y -= this.speed * dt;
};
ScreenText.prototype.render = function() {
    ctx.font = "30px Arial";
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.x + 30, this.y + 120);
};



// OBJECT INSTANTIATION //



var allEnemies = [];
for (var i = 0; i < 3; i++) {
    allEnemies.push(new Enemy());
}


var player = new Player();


var allCollectables = [];

for (var i = 0; i < 1; i++) {
    allCollectables.push(new Star());
}


var allTexts = [];




document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
