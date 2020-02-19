// -------------------------- Game objects -------------------------
var wNr = 10; // number of generated walls
var myPlayer = {playerY: 0, playerX: 0, playerHeight: 30, playerWidth: 30, jumpHeight: 100, hoverTimer: 0, hoverTime: 30, jumpStage: 0,  jump: jumpCheck, beginJump: jumpStart};
var walls = {wallCollection: [], createWalls: wallCreator, animate: animateEachWall, checkPlayerCollision: wallCollisionCheck};

// -------------------------- Document elements -------------------------

var playerBox = document.getElementById("player");
var gameCanvas = document.getElementById("gamepalet");

// initiation of the intervaltimer variable so functions are able to influence the timer on a global scale.

    var intervaltimer;

//-------------------------- Wall object functions -------------------------

// function: Create multiple wall objects within walls.wallCollection.
function wallCreator(){

    // add the properties of the walls.
    var wallDistanceRangeLow = 0;
    var wallDistanceRangeHigh = 100;
    var wallSizeYSet = 50;
    var wallSizeXSet = 20;
    var wallColorSet = "blue"; // currently has no function. (created to demonstrate the interaction between objects and css)
    var wallPosXSet = 0;
    var jumpRange = (myPlayer.jumpHeight * 2) + myPlayer.hoverTime; // used as a reference for the randomised distance between walls (real jump range is now shorter as the change in wallx and playery both used to have the same dependancy)
    var mapWallDistance = 0;

    
    // a loop for creating new wall objects. 
        // the wallPosX is relative to the last wallposX(mapWallDistance)
        // between the walls is a minimum range of the wallWidth and the jumprange to make all levels playable.
        // a random number is added to the minimum range in order to make levels randomized.
    
        for (i=0; i<wNr; i++){
        var wallTemplate = {wallSizeX: wallSizeXSet, wallSizeY: wallSizeYSet, wallColor: wallColorSet, wallPosX: wallPosXSet};
        var wallDistanceRnd = Math.floor((Math.random() * wallDistanceRangeHigh) + wallDistanceRangeLow); // add random number generator that responces to range
        
        
        var wallDistance = wallDistanceRnd + mapWallDistance + jumpRange;
        wallTemplate.wallPosX = wallDistance;
        
        walls.wallCollection.push(wallTemplate);
        mapWallDistance = wallDistance; 

    }

}

// function: decrement the wallPosX of each wall object within walls.wallCollection.
function animateEachWall(){
   
    for (i=0; i<this.wallCollection.length; i++){
        this.wallCollection[i].wallPosX --;
    }
    
}

// function: check for overlap between the wallobjects from walls.wallCollection and the myPlayer object
function wallCollisionCheck(){


    // loop: check overlap for each wall object
    for (i=0; i<walls.wallCollection.length; i++){
        var currentWall = walls.wallCollection[i];



        // check range where the player overlaps the wall on the x-axis
        if ((currentWall.wallPosX <= (myPlayer.playerX + myPlayer.playerWidth)) && ((currentWall.wallPosX + currentWall.wallSizeX) >= myPlayer.playerX)){
            // check if the player is high enough
            if(currentWall.wallSizeY >= (myPlayer.playerY)){
                endGame();
            }
        }

    }
   
    
}

// -------------------------- Player object functions -------------------------

// function: jumpCheck is called for each frame to check the players posY within the jumping animation (and to toggle between the different jumping stages).
//           jumpCheck also increments or decrements the players posY  based on the current jumping stage. (go up/ hover/ go down)
function jumpCheck(){
    
    if(this.jumpStage === 1){ // rising fast
        this.playerY+=2;
        if (this.playerY>=(this.jumpHeight/3)){
            this.jumpStage = 1.5;
        }
    }
    if(this.jumpStage === 1.5){ // rising slow
        this.playerY++;
        if (this.playerY>=this.jumpHeight){
            this.jumpStage = 2;
        }
    }
    else if(this.jumpStage === 2){ // hovering
        this.hoverTimer++;
        if(this.hoverTimer===this.hoverTime){
            this.hoverTimer=0;
            this.jumpStage = 2.5;
        }
    }
    if(this.jumpStage === 2.5){ // falling slow
        this.playerY--;
        if (this.playerY<=(this.jumpHeight/3)){
            this.jumpStage = 3;
        }
    }
    else if(this.jumpStage === 3){ // falling fast
        this.playerY-=2;
        if(this.playerY <= 0){
            this.playerY = 0;
            this.jumpStage = 0;
        }
    }
    else{}

}

// function: initiate the jump by changing the jumpstage to 1. (only works if jumpstage = 0)
function jumpStart(){
    console.log(myPlayer.jumpStage);
    if (this.jumpStage === 0){
        this.jumpStage = 1;
    }  
}

// -------------------------- Painting functions -------------------------

// function: delete page content within the gameframe. Create new content based on the new object values (this creates an animation)
function paintFrame(){
    
    // delete content of canvas

    while (gameCanvas.hasChildNodes()){
        gameCanvas.removeChild(gameCanvas.firstChild);
    }
    

    // create wall divs and append them to the gameCanvas div.    
    for (i = 0; i < walls.wallCollection.length; i++){
        var wallPainting = document.createElement("div");
        wallPainting.className = "wallstyle";
        wallPainting.style.left = walls.wallCollection[i].wallPosX + "px";
        gameCanvas.appendChild(wallPainting);
    }

    // create new player div.

    var playerPainting = document.createElement("div");
    playerPainting.className = "playerstyle";
    playerPainting.style.bottom = myPlayer.playerY + "px";
    gameCanvas.appendChild(playerPainting);
    
    // !!!!!!!!! it might be faster to transform existing elements but this is for practice only !!!!!!!!!!!!!
}

// -------------------------- Gamelogic -------------------------

// function: the function that is called when the player presses start. It will reset player values and starts the repeated call of the frame function
function gameVisualizer(){

    // reset the myPlayer values (still have to do this for wall objects as well)
    myPlayer.playerX = 0;
    myPlayer.playerY = 0;
    myPlayer.jumpStage = 0;
    
    // Create a new randomized set of walls
    walls.createWalls();
    
    // start the repeated call of the frame function (every (value) miliseconds)
    intervaltimer = setInterval(frame, 10); // zou gedeclared moeten worden verder in het programma.

    // !!!!!!!!!!!! Do not add code below as it might cause problems with the intervaltimer above !!!!!!!!!!!!!!!!!!!!!!!!!
}

// function: a sequence of functions needed to create a new frame. + gamelogic checks for stopping the game.
function frame(){
    
    walls.animate(); // decrement the posX of each wall
    myPlayer.jump(); // change the posY of the player based on the jump animation
    paintFrame(); // create new shapes on the screen based on the new values.
    walls.checkPlayerCollision(); // check for a gameover by wallcollision
    checkLvlEnd(); // check for a gameover by reaching the end of the lvl (yeah, it is called a win)

    
   

}

// function: check if the player reached the end of the level to end the game.
function checkLvlEnd(){
    if (walls.wallCollection[(walls.wallCollection.length - 1)].wallPosX < -100){
        endGame();
    }
}

// function: end the game (by stopping the intervaltimer) 
function endGame(){

    clearInterval(intervaltimer);

}

// function: end the game and reset (removes content from the canvas and empties the walls.wallCollection array)
function resetGame(){
    
    // stop the intervaltimer
    endGame();

    // remove all content from canvas
    while (gameCanvas.hasChildNodes()){
        gameCanvas.removeChild(gameCanvas.firstChild);
    }

    // clear walls.wallcollection array 
    walls.wallCollection.length = 0; // Deletes all objects within the array from memory ( =[] does not clear the memory )
    walls.wallCollection = []; // set the value of walls.wallcollection back to an empty array

}

// feature in progress: a function used to couple the jumping 
function checkJumpInput(){
   // Deze functie moet gemaakt worden om het spel om te zetten in een quiz voor loops.
    
    // Neem het inputveld naast de game en laat de player springen doormiddel van de loop.
    var playerJumpInput;
    // input in vorm van loop (){}
    // geef een optie om de jump input te geven.
    
    /* de input moet voldoen aan voorwaarden: 
        
        1. de code mag alleen invloed hebben op de startjump functie.
        2. bij niet overeenkomende variabelen moet er een foutmelding komen.
        3. De input van de loop kan in relatie tot afstand, tijd of afstand van de muur.

    */

}

/* 
to do: 

1. add user input fields and corresponding functionality
2. shield off button functionality (no start when already playing for example)
3. couple the game reset to the start function as well. (with a check to skip for example the endgame part)
*/
