/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {

    'use strict';

    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);
    global.canvasWidth = canvas.width;
    global.canvasHeight = canvas.height;

    var numRows = 6;
    var numCols = 5;
    global.numRows = numRows;
    global.numCols = numCols;

    //object to keep track of current game state
    var gameState = {
        'score': 0,
        'highScore': 0
    };

    
    // HELPER FUNCTIONS //
    
    
    function displayText(text, col, row, duration, color) {
        allTexts.push(new ScreenText(text, col, row, duration, color));
    }


    function shuffle(o){
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    
    function convertXToCol(x) {
        return Math.floor(x / 101);
    }

   
    // MAIN LOOP AND INIT //
    

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        resetGame();
        lastTime = Date.now();
        main();
    }

   
    // UPDATES AND COLLISION CHECKS //
    
    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {

       
        updateEntities(dt);
        checkCollisions();
        updateGameState();
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {

        
        allCollectables.forEach(function(collectable) {
            collectable.update(dt);
        });

        
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });

        
        player.update();

        
        allTexts.forEach(function(text) {
            text.update(dt);
        });

        
        for (var i = allTexts.length - 1; i >= 0; i--) {
            if (allTexts[i].duration < 0) {
                allTexts.splice(i, 1);
            }
        }
    }

    function checkCollisions() {

        
        for (var i = 0, len = allCollectables.length; i < len; i++) {
            if (allCollectables[i].hasCollidedWith(player)) {

                
                allCollectables[i].isVisible = false;

                
                gameState.score += allCollectables[i].points;

                
                displayText('+' + allCollectables[i].points, convertXToCol(allCollectables[i].x), allCollectables[i].row, 0.5, 'yellow');

                break;
            }
        }

       
        for (i = 0, len = allEnemies.length; i < len; i++) {
            if (allEnemies[i].hasCollidedWith(player)) {

                
                displayText('!!!', player.col, player.row, 0.5, 'red');

                
                resetGame();

                return;
            }
        }
    }

    function updateGameState() {

        
        if (player.row === 0) {

            
            gameState.score += 5;

            
            displayText("+5", player.col, player.row, 0.5, 'white');

           
            resetPlayer();
        }
    }

   
    // RENDER //
    
    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {

       
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        
        ctx.font = "30px Arial";
        ctx.fillStyle = 'black';
        ctx.fillText("Score: " + gameState.score, 0, 40);
        ctx.fillText("High Score: " + gameState.highScore, 270, 40);

        
        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */

        //render collectables first
        //have to render them row by row from top to bottom so that there won't be strange overlaps
        //1) hash the items into buckets of rows first
        var sorter = {1: [], 2: [], 3: []};
        for (var i = 0, len = allCollectables.length; i < len; i++) {
            sorter[allCollectables[i].row].push(allCollectables[i]);
        }
        //2) now render the bucketed items row by row, from top (row 1) to bottom (row 3)
        for (i = 1; i <= 3; i++) {
            for (var j = 0, len = sorter[i].length; j < len; j++) {
                sorter[i][j].render();
            }
        }

        
        player.render();

       
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        
        allTexts.forEach(function(text) {
            text.render();
        });
    }

    
    // RESETS //

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function resetGame() {

        
        resetPlayer();

        
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
        }

        
        gameState.score = 0;
    }

   
    function resetPlayer() {
        player.reset();
        resetCollectables();
    }

    
    function resetCollectables() {

        //create a list of array that goes from [0, 1, ..., 14], then shuffle it.
        //each item represents an index in the possible rock ground position (total of 15).
        //this way, the collectables will not overlap.
        var shuffledList = shuffle(Array.apply(null, {length: 15}).map(Number.call, Number));

       
        for (var i = 0, len = allCollectables.length; i < len; i++) {

            
            var n = shuffledList[i];

            
            allCollectables[i].setCol(n % 5);
            allCollectables[i].setRow(Math.floor(n / 5) + 1);

            
            allCollectables[i].isVisible = Math.random() <= allCollectables[i].appearProbability;
        }
    }

    
    // RESOURCES / LOADING //
    

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-pink-girl.png',
        'images/Star.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
