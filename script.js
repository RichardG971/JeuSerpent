window.onload = function() {
    
    let
        canvas,
        canvasWidth = 900,
        canvasHeight = 600,
        blockSize = 30,
        ctx,
        delay = 100,
        snakee,
        applee,
        widthInBlock = canvasWidth / blockSize,
        heightInBlock = canvasHeight / blockSize,
        score,
        timeout;
     
    init();
        
    function init() {
        canvas = document.createElement( "canvas" );
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid gray";
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
        document.body.appendChild( canvas );

        ctx = canvas.getContext( "2d" ); // Contexte en 2d

        snakee = new Snake( [ [ 6, 4 ], [ 5, 4 ], [ 4, 4 ] ], "right" );
        applee = new Apple( [ 10, 10 ] );
        score = 0;

        refreshCanvas();
    }
    
    function refreshCanvas() {
        snakee.advance();
        if( snakee.checkCollision() ) {
            gameOver();
        }
        else {
            if( snakee.isEatingApple( applee ) ) { // Si le serpent mange la pomme...
                score++;
                snakee.ateApple = true;
                do {
                    applee.setNewPosition(); // ... on donne une nouvelle position à la pomme...
                }
                while( applee.isOnSnake( snakee ) ); // ... tant que sa position apparait sur le serpent (booléen), on lui redonne une autre position
            }
            ctx.clearRect( 0, 0, canvasWidth, canvasHeight ); // Effacer le contexte
            drawScore();
            snakee.draw();
            applee.draw();
    
            timeout = setTimeout( refreshCanvas, delay );
        }
    }

    function gameOver() {
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white"; // Contour du texte
        ctx.lineWidth = 5;
        let
            centreX = canvasWidth / 2,
            centreY = canvasHeight / 2;
        ctx.strokeText( "Game Over", centreX, centreY - 180 );
        ctx.fillText( "Game Over", centreX, centreY - 180 );

        ctx.font = "bold 30px sans-serif";
        ctx.strokeText( "Appuyer sur la touche espace pour rejouer", centreX, centreY - 120 );
        ctx.fillText( "Appuyer sur la touche espace pour rejouer", centreX, centreY - 120 );
        ctx.restore();
    }

    function restart() {
        snakee = new Snake( [ [ 6,4 ], [ 5,4 ], [ 4,4 ] ], "right" );
        applee = new Apple( [ 10, 10 ] );
        score = 0;
        clearTimeout( timeout );

        refreshCanvas();
    }

    function drawScore() {
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let
            centreX = canvasWidth / 2,
            centreY = canvasHeight / 2;
        ctx.fillText( score.toString(), centreX, centreY );
        ctx.restore();
    }

    function drawBlock( ctx, position ) {
        let
            x = position[ 0 ] * blockSize,
            y = position[ 1 ] * blockSize;

        ctx.fillRect( x, y, blockSize, blockSize ); // Forme du contexte
    }

    function Snake( body, direction ) {
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.draw = function() {
            ctx.save(); // Permet de se souvenir des paramètres dans le contexte (ex : fillStyle pour la couleur)
            ctx.fillStyle = "#ff0000"; // Couleur du canvas

            for( let i = 0; i < this.body.length; i++  ) {
                drawBlock( ctx, this.body[ i ] );
            }
            ctx.restore();
        }
        this.advance = function() {
            let nextPosition = this.body[ 0 ].slice(); // Récupère le premier élément du tableau dans un nouveau tableau (tête du serpent)

            switch( this.direction ) {
                case "left":
                    nextPosition[ 0 ]--; // Retrait de 1 axe x à la position récupérée
                    break;
                case "right":
                    nextPosition[ 0 ]++; // Ajout de 1 axe x à la position récupérée
                    break;
                case "down":
                    nextPosition[ 1 ]++; // Ajout de 1 axe y à la position récupérée
                    break;
                case "up":
                    nextPosition[ 1 ]--; // Retrait de 1 axe y à la position récupérée
                    break;
                default:
                    throw( "Invalid Direction");
            }
            this.body.unshift( nextPosition ); // Ajout de cette position au début du tableau
            if( !this.ateApple ) this.body.pop(); // Suppression du dernier élément du tableau (queue du serpent)
            else this.ateApple = false;
        }
        this.setDirection = function( newDirection ) {
            let allowedDirection;
            switch( this.direction ) {
                case "left":
                case "right":
                    allowedDirection = [ "up", "down" ];
                    break;
                case "down":
                case "up":
                    allowedDirection = [ "left", "right" ];
                    break;
                default:
                    throw( "Invalid Direction");
            }
            if( allowedDirection.indexOf( newDirection ) > -1 ) {
                this.direction = newDirection;
            }
        }
        this.checkCollision = function() {
            let
                wallCollision = false,
                snakeCollision = false,
                head = this.body[ 0 ],
                rest = this.body.slice( 1 ),
                snakeX = head[ 0 ],
                snakeY = head[ 1 ],
                minX = 0,
                minY = 0,
                maxX = widthInBlock - 1,
                maxY = heightInBlock - 1,
                isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX,
                isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

            if( isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls ) {
                wallCollision = true;
            }

            for( let i = 0; i < rest.length; i++ ) {
                if( snakeX === rest[ i ][ 0 ] && snakeY === rest[ i ][ 1 ] ) {
                    snakeCollision = true;
                }
            }

            return wallCollision || snakeCollision;
        }
        this.isEatingApple = function( appleToEat ) {
            let head = this.body[ 0 ];

            if( head[ 0 ] === appleToEat.position[ 0 ] && head[ 1 ] === appleToEat.position[ 1 ] )
                return true;
            else
                return false;
        }
    }

    function Apple( position ) {
        this.position = position;
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            let
                radius = blockSize / 2,
                x = this.position[ 0 ] * blockSize + radius,
                y = this.position[ 1 ] * blockSize + radius;

            ctx.arc( x, y, radius, 0, Math.PI*2, true);
            ctx.fill();
            ctx.restore();
        }
        this.setNewPosition = function() {
            let
                newX = Math.round( Math.random() * ( widthInBlock - 1 ) ),
                newY = Math.round( Math.random() * ( heightInBlock - 1 ) );

            this.position = [ newX, newY ];
        }
        this.isOnSnake = function( snakeToCheck ) {
            let isOnSnake = false;

            for( let i = 0; i < snakeToCheck.body.length; i++ ) {
                if( this.position[ 0 ] === snakeToCheck.body[ i ][ 0 ] && this.position[ 1 ] === snakeToCheck.body[ i ][ 1 ] ) {
                    isOnSnake = true;
                    break;
                }
            }
            return isOnSnake;
        }
    }

    document.onkeydown = function handleKeyDown( e ) {
        console.log( e.key );
        let
            key = e.key, // "keyCode" déprécié.
            newDirection;

        switch( key ) {
            case "ArrowLeft":
                newDirection = "left";
                break;
            case "ArrowUp":
                newDirection = "up";
                break;
            case "ArrowRight":
                newDirection = "right";
                break;
            case "ArrowDown":
                newDirection = "down";
                break;
            case " ":
                restart();
            default:
                return;
        }
        snakee.setDirection( newDirection );
    }
    
}