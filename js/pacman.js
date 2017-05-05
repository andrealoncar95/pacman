// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var w = canvas.width;
var h = canvas.height;


// GAME FRAMEWORK 
var GF = function(){

 // variables para contar frames/s, usadas por measureFPS
    var frameCount = 0;
	var lastTime;
    var oldTime;
    var fpsContainer;
    var fps; 
 
    //  variable global temporalmente para poder testear el ejercicio
    inputStates = {};

    const TILE_WIDTH=24, TILE_HEIGHT=24;
        var numGhosts = 4;
	var ghostcolor = {};
	ghostcolor[0] = "rgba(255, 0, 0, 255)";
	ghostcolor[1] = "rgba(255, 128, 255, 255)";
	ghostcolor[2] = "rgba(128, 255, 255, 255)";
	ghostcolor[3] = "rgba(255, 128, 0,   255)";
	ghostcolor[4] = "rgba(50, 50, 255,   255)"; // blue, vulnerable ghost
	ghostcolor[5] = "rgba(255, 255, 255, 255)"; // white, flashing ghost


	// hold ghost objects
	var ghosts = {};

    var Ghost = function(id, ctx){

		this.x = 0;
		this.y = 0;
		this.velX = 0;
		this.velY = 0;
		this.speed = 1;
		
		this.nearestRow = 0;
		this.nearestCol = 0;
	
		this.ctx = ctx;
	
		this.id = id;
		this.homeX = 0;
		this.homeY = 0;
        this.state=1;
		
		this.colors = [
						new Sprite('res/img/sprites.png', [456, 16*this.id + 64], [16,16], 0.005, [0,1]),	//normal
						new Sprite('res/img/sprites.png', [584, 64], [16,16], 0.005, [0,1]),				//vulnerable
						new Sprite('res/img/sprites.png', [584, 64], [16,16], 0.02, [0,1,2,3]),				//blinking
						new Sprite('res/img/sprites.png', [585, 81], [16,16], 0.005, [0,1])					//spetacles
						];
		this.sprite = this.colors[0];

        this.draw = function(){
            // Pintar cuerpo de fantasma
			if (this.state == Ghost.NORMAL) {
				this.sprite = this.colors[0];
			} else if (this.state == Ghost.VULNERABLE) {
				if (thisGame.ghostTimer>100) {
					this.sprite = this.colors[1];
				} else {
					this.sprite = this.colors[2];
				}
			} else {
				this.sprite = this.colors[3];
			}
			ctx.save();
			ctx.translate(this.x-thisGame.TILE_WIDTH/2,this.y-thisGame.TILE_HEIGHT/2);
			this.sprite.render(ctx);
			ctx.restore();

        }; // draw

	    this.move = function() {
			this.sprite.update(delta);
				// Tu código aquí
			var col = Math.floor(this.x/thisGame.TILE_WIDTH);
                var row = Math.floor(this.y/thisGame.TILE_HEIGHT);
                if(this.state != 3){
                    if((this.x/thisGame.TILE_WIDTH)-col == 0.5 && (this.y/thisGame.TILE_HEIGHT)-row == 0.5){
                        var posibleMov = [[0,-1],[1,0],[0,1],[-1,0]];
                        var solucion = [];
                        for(var i = 0; i<posibleMov.length; i++){
                            if(!thisLevel.isWall(col+posibleMov[i][0],row+posibleMov[i][1])
                                && thisLevel.getMapTile(row+posibleMov[i][1],col+posibleMov[i][0]) != 21 
                                && thisLevel.getMapTile(row+posibleMov[i][1],col+posibleMov[i][0]) != 20){
                                solucion.push(posibleMov[i]);
                            }
                        }
                        if(solucion.length>1){
                            if(solucion.length>2 || (solucion[0][0] != solucion[1][0] && solucion[0][1] != solucion[1][1])){
                                var direccion = Math.floor((Math.random() * solucion.length) + 0);
                                direccion = solucion[direccion];
                                if(direccion[0] != 0){
                                    this.velY = 0;
                                    if(direccion[0] > 0){
                                        this.velX = this.speed;
                                    }else{
                                        this.velX = 0 - this.speed;
                                    }
                                }else{
                                    this.velX = 0;
                                    if(direccion[1] > 0){
                                        this.velY = this.speed;
                                    }else{
                                        this.velY = 0 - this.speed;
                                    }
                                }
                            }
                        }else{
                            if(solucion[0][0] != 0){
                                this.velY = 0;
                                if(solucion[0][0] > 0){
                                    this.velX = this.speed;
                                }else{
                                    this.velX = 0 - this.speed;
                                }
                            }else{
                                this.velX = 0;
                                if(solucion[0][1] > 0){
                                    this.velY = this.speed;
                                }else{
                                    this.velY = 0 - this.speed;
                                }
                            }
                        }
                    }
                // Test13 Tu código aquí
                // Si esl estado del fantasma es Ghost.SPECTACLES
                // Mover el fantasma lo más recto posible hacia la casilla de salida
                }else{ // fantasma comido
				if(this.x == this.homeX && this.y == this.homeY){ // ha llegado a casa
					ghost_eaten.play();
					this.state = Ghost.NORMAL;
					this.speed = 1;
					switch(this.id){
						case 0:
							this.velX = this.speed;
							this.velY = 0;
							break;
						case 1:
							this.velX = this.speed;
							this.velY = 0;
							break;
						case 2:
							this.velX = 0;
							this.velY = 0-this.speed;
							break;
						case 3:
							this.velX = 0-this.speed;
							this.velY = 0;
							break;
					}
				}else if((this.x/thisGame.TILE_WIDTH)-col == 0.5 && (this.y/thisGame.TILE_HEIGHT)-row == 0.5&& this.state != Ghost.NORMAL){ // hacia casa
					var posibleMov = [[0,-1],[1,0],[0,1],[-1,0]];
					var solucion = [];
					for(var i = 0; i<posibleMov.length; i++){
						if(!thisLevel.isWall(col+posibleMov[i][0],row+posibleMov[i][1])
							&& thisLevel.getMapTile(row+posibleMov[i][1],col+posibleMov[i][0]) != 21 
							&& thisLevel.getMapTile(row+posibleMov[i][1],col+posibleMov[i][0]) != 20){
							solucion.push(posibleMov[i]);
						}
					}
					if(solucion.length>1){
						if(solucion.length>2 || (solucion[0][0] != solucion[1][0] && solucion[0][1] != solucion[1][1])){//bifurcacion
							var distX = thisLevel.lvlWidth;
							direccionX = [];
							var distY = thisLevel.lvlHeight;
							direccionY = [];
							balX = Math.floor(this.homeX/thisGame.TILE_WIDTH);
							balY = Math.floor(this.homeY/thisGame.TILE_HEIGHT);
							distX = Math.abs(col-balX); // distancia de x al inicio
							distY = Math.abs(row-balY); // distancia de y al inicio
							for(var k = solucion.length-1; k>=0; k--){
								if(Math.abs(col+solucion[k][0]-balX)<distX){
									distX = Math.abs(col+solucion[k][0]-balX); //distancia minima
									direccionX = solucion[k]; //direccion con distancia minima
								}else if(Math.abs(row+solucion[k][1]-balY)<distY){
									distY = Math.abs(row+solucion[k][1]-balY); //distancia minima
									direccionY = solucion[k]; //direccion con distancia minima
								}
							}
							if(direccionX != 0 && direccionY == 0){
								direccion = direccionX;
							}else if(direccionX == 0 && direccionY != 0){
								direccion = direccionY;
							}else if(direccionX != 0 && direccionY != 0){// solo funciona en este mapa
								if((col==10 && row==10) || ((col==6 || col==14) && row==8)){
									direccion = posibleMov[2];
								}else if((col == 7 && row == 10) || (col == 4 && row == 8)){
									direccion = posibleMov[1];
								}else if((col == 13 && row == 10) || (col == 16 && row == 8)){
									direccion = posibleMov[3];
								}else if((col==4 || col==7 || col==13 || col==16) && (row==12 || row==14 || row==16)){
									direccion = posibleMov[0];//solo funciona en este mapa
								}else{//funciona en el resto de mapas
									if((col==6 || col==9) && (row==6 || row ==18)){
										direccion = posibleMov[3];
									}else if((col==11 || col==14) && (row==6 || row==18)){
										direccion = posibleMov[1];
									}else{
										var rndm = Math.floor((Math.random() * 2));
										if(rndm == 0){
											direccion = direccionX;
										}else{
											direccion = direccionY;
										}
									}
								}
							}else{
								if(this.y >= this.homeY && !thisLevel.isWall(col,row-1)){
									direccion = solucion[0];
								}else if(this.y < this.homeY && !thisLevel.isWall(col,row+1)){
									direccion = solucion[2];
								}else{
									direccion = solucion[Math.floor((Math.random() * solucion.length))];
								}
							}
							if(direccion[0] != 0){
								this.velY = 0;
								if(direccion[0] > 0){
									this.velX = this.speed;
									this.velY = 0;
								}else{
									this.velX = 0 - this.speed;
									this.velY = 0;
								}
							}else{
								this.velX = 0;
								if(direccion[1] > 0){
									this.velY = this.speed;
									this.velX = 0;
								}else{
									this.velY = 0 - this.speed;
									this.velX = 0;
								}
							}
						}
					}else{ // solo una direccion
						if(solucion[0][0] != 0){
							this.velY = 0;
							if(solucion[0][0] > 0){
								this.velX = this.speed;
							}else{
								this.velX = 0 - this.speed;
							}
						}else{
							this.velX = 0;
							if(solucion[0][1] > 0){
								this.velY = this.speed;
							}else{
								this.velY = 0 - this.speed;
							}
						}
					}
				}
			}
			this.x += this.velX;
			this.y += this.velY;
			
		};//fin move

	}; // fin clase Ghost

	 // static variables
	  Ghost.NORMAL = 1;
	  Ghost.VULNERABLE = 2;
	  Ghost.SPECTACLES = 3;

	var Level = function(ctx) {
		this.ctx = ctx;
		this.lvlWidth = 0;
		this.lvlHeight = 0;
		
		this.map = [];
		
		this.pellets = 0;
		this.powerPelletBlinkTimer = 0;

        this.setMapTile = function(row, col, newValue){
            // tu código aquí
            thisLevel.map[(row*21)+col]=newValue;
        };

        this.getMapTile = function(row, col){
            // tu código aquí	
            return thisLevel.map[(row*21)+col];		
        };

        this.printMap = function(){
            // tu código aquí
        };

        this.loadLevel = function(){
            // leer res/levels/1.txt y guardarlo en el atributo map	
            // haciendo uso de setMapTile
            var file = "res/levels/1.txt";
            $.get(file, function(data){
                var datos=data.split("\n");
                for (var i=4;datos.length-3>i;i++){
                    var linea=datos[i].split(" ");
                    
                    for (var j=0; linea.length-1>j;j++){
                        thisLevel.setMapTile(i-4,j,linea[j]);
                        if(linea[j]==2){
                            thisLevel.pellets++;
                        }
                    }
                }

                
            });
        };

        this.drawMap = function(){

	    	var TILE_WIDTH = thisGame.TILE_WIDTH;
	    	var TILE_HEIGHT = thisGame.TILE_HEIGHT;

    		var tileID = {
	    		'door-h' : 20,
			'door-v' : 21,
			'pellet-power' : 3
            };

            // Tu código aquí
            this.powerPelletBlinkTimer++;

            for(var i=0;i<21;i++){
                for(var j=0; j< 25;j++){
                    var valdosa= thisLevel.getMapTile(j,i);
                    //salidas
                    if(valdosa==21 || valdosa==20){
                        null;
                    }
                    //fantasmas
                    else if(valdosa>=10 && valdosa<=13){
                        ctx.beginPath();
                        ctx.fillStyle= 'black';
                        ctx.fillRect(TILE_WIDTH*i,TILE_HEIGHT*j,TILE_WIDTH,TILE_HEIGHT);
                        ctx.closePath(); 
                        ctx.fill();
                        
                        
                    }
                    //pildora de poder =3
                    else if(valdosa==3){
                        if(this.powerPelletBlinkTimer<30){
                            ctx.beginPath();
                            ctx.fillStyle= 'red';
                            ctx.arc(TILE_WIDTH*i+12,TILE_HEIGHT*j+12, 5, 0, Math.PI*2, false);
                            ctx.closePath(); 
                            ctx.fill();
                        }
                        else{
                            ctx.beginPath();
                            ctx.fillStyle= 'black';
                            ctx.arc(TILE_WIDTH*i+12,TILE_HEIGHT*j+12, 5, 0, Math.PI*2, false);
                            ctx.closePath(); 
                            ctx.fill();
                        }
                        if(this.powerPelletBlinkTimer>60){
                            this.powerPelletBlinkTimer=0;
                        }
                    }
                    //pildora normal =2
                    else if(valdosa==2){
                        ctx.beginPath();
                        ctx.fillStyle= 'white';
                        ctx.arc(TILE_WIDTH*i+12,TILE_HEIGHT*j+12, 5, 0, Math.PI*2, false);
                        ctx.closePath(); 
                        ctx.fill();
                        
                        
                    }
                    //entre 100 y 199 = pared
                    else if(valdosa>=100 && valdosa<=199){
                        ctx.beginPath();
                        ctx.fillStyle= 'blue';
                        ctx.fillRect(TILE_WIDTH*i,TILE_HEIGHT*j,TILE_WIDTH,TILE_HEIGHT);
                        ctx.closePath(); 
                        ctx.fill();
                    }
                    //pacman
                    else if(valdosa==4){
                        player.x=TILE_WIDTH*i+12;
                        player.y=TILE_HEIGHT*j+12;
                        player.homeX=TILE_WIDTH*i+12;
                        player.homeY=TILE_HEIGHT*j+12;
                        thisLevel.setMapTile(j,i,0);
                    }
                    if(valdosa == 11){
                        ghosts[1].x = i*TILE_WIDTH+TILE_WIDTH/2;
                        ghosts[1].y = j*TILE_HEIGHT+TILE_HEIGHT/2;
                        ghosts[1].homeX =i*TILE_WIDTH+TILE_WIDTH/2;
                        ghosts[1].homeY = j*TILE_HEIGHT+TILE_HEIGHT/2;
                        thisLevel.setMapTile(j,i,0);
                    }
                    if(valdosa == 12){
                        ghosts[2].x = i*TILE_WIDTH+TILE_WIDTH/2;
                        ghosts[2].y = j*TILE_HEIGHT+TILE_HEIGHT/2;
                        ghosts[2].homeX = i*TILE_WIDTH+TILE_WIDTH/2;
                        ghosts[2].homeY = j*TILE_HEIGHT+TILE_HEIGHT/2;
                        thisLevel.setMapTile(j,i,0);
                    }
                    if(valdosa == 13){
                        ghosts[3].x = i*TILE_WIDTH+TILE_WIDTH/2;
                        ghosts[3].y = j*TILE_HEIGHT+TILE_HEIGHT/2;
                        ghosts[3].homeX = i*TILE_WIDTH+TILE_WIDTH/2;
                        ghosts[3].homeY = j*TILE_HEIGHT+TILE_HEIGHT/2;
                        thisLevel.setMapTile(j,i,0);
                    }
                    if(valdosa == 10){
                        ghosts[0].x = i*TILE_WIDTH+TILE_WIDTH/2;
                        ghosts[0].y = j*TILE_HEIGHT+TILE_HEIGHT/2;
                        ghosts[0].homeX = i*TILE_WIDTH+TILE_WIDTH/2;
                        ghosts[0].homeY = j*TILE_HEIGHT+TILE_HEIGHT/2;
                        thisLevel.setMapTile(j,i,0);
                    }
                    
                }
            }
        };


		this.isWall = function(row, col) {
			// Tu código aquí
			var pared=thisLevel.getMapTile(col,row);
			if(pared>=100 && pared<=199){
				return true;
			}else{
				return false;
			}
		};


		this.checkIfHitWall = function(possiblePlayerX, possiblePlayerY, row, col){
				// Tu código aquí
				// Determinar si el jugador va a moverse a una fila,columna que tiene pared 
				// Hacer uso de isWall
			var x = Math.floor(possiblePlayerX/thisGame.TILE_WIDTH);//para saber col y row, TILE_WIDTH fuera de alcance...
			var y = Math.floor(possiblePlayerY/thisGame.TILE_HEIGHT);
			if(possiblePlayerX/thisGame.TILE_WIDTH-x == 0 || possiblePlayerY/thisGame.TILE_HEIGHT-y == 0){
				return this.isWall(x,y);
			}else if(possiblePlayerX/thisGame.TILE_WIDTH-x != 0.5 && possiblePlayerY/thisGame.TILE_HEIGHT-y != 0.5){
				return true; //si no esta centrado no entra
			}else{
				return this.isWall(x,y);
			}
		};

		this.checkIfHit = function(playerX, playerY, x, y, holgura){
		
			// Tu código aquí	
			
			if(Math.abs(playerX - x) < holgura && Math.abs(playerY - y) < holgura){
				return true;
			}else{
				return false;
			}
		};


		this.checkIfHitSomething = function(playerX, playerY, row, col){
			var tileID = {
	    			'door-h' : 20,
				'door-v' : 21,
				'pellet-power' : 3,
				'pellet': 2
			};

			// Tu código aquí
			//  Gestiona la recogida de píldoras
			//
			// test12 TU CÓDIGO AQUÍ
			// Gestiona la recogida de píldoras de poder
			// (cambia el estado de los fantasmas)
			if(row == null && col == null){
				var x = Math.floor(playerX/thisGame.TILE_WIDTH);
				var y = Math.floor(playerY/thisGame.TILE_HEIGHT);
			}else{
				x = col;
				y = row;
			}
			var pildora= thisLevel.getMapTile(y,x);
			if(pildora==2){
				thisGame.points++;
				thisLevel.setMapTile(y,x,0);
				thisLevel.pellets--;
				eating.play();
				if(thisLevel.pellets==0){
					console.log("Next level!");
				}
			}
			if(pildora==20){
				if(x>12){
					player.x=21;
					player.velX=player.speed;
				}
				else if(x<12){
					player.x=450;
					player.velX=-player.speed;
				}
			}
			if(pildora==21){
				if(y>12){
					player.y=24;
					player.velY=player.speed;
				}
				else if(y<12){
					player.y=555;
					player.velY=-player.speed;
				}
			}
			// test12 TU CÓDIGO AQUÍ
			// Gestiona la recogida de píldoras de poder
			// (cambia el estado de los fantasmas)
			if (pildora ==3){
                thisGame.ghostTimer = 360;
				siren.stop();
				eat_pill.play();
				waza.play();
                for (var i = 0; i < numGhosts; i++){
                    if(ghosts[i].state = 1){
					ghosts[i].state = 2;
					}
                }
                thisLevel.setMapTile(y,x,0);
            }

		};

	}; // end Level 

	var Pacman = function() {
		this.radius = 10;
		this.x = 0;
		this.y = 0;
		this.speed = 3;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
		this.colors = [
				new Sprite('res/img/sprites.png', [455, 0], [16,16], 0.005, [0,1]),	//derecha
				new Sprite('res/img/sprites.png', [455, 16], [16,16], 0.005, [0,1]),	//izquierda
				new Sprite('res/img/sprites.png', [455, 32], [16,16], 0.005, [0,1]),	//arriba
				new Sprite('res/img/sprites.png', [455, 48], [16,16], 0.005, [0,1]),	//abajo
				new Sprite('res/img/sprites.png', [488, 0], [16,16], 0.004, [0,1,2,3,4,5,6,7,8,9,10,11,12])
				];
		this.sprite = this.colors[0];
	};
	Pacman.prototype.move = function() {

		player.sprite.update(delta);
	
		if(this.velX>0 && !thisLevel.checkIfHitWall(this.x+this.radius+this.velX,this.y)){
			this.x += this.velX;
		}
		if(this.velX<0 && !thisLevel.checkIfHitWall(this.x-this.radius+this.velX,this.y)){
			this.x += this.velX;
		}
		if(this.velY>0 && this.y < w-this.radius && !thisLevel.checkIfHitWall(this.x,this.y+this.radius+this.velY)){
			this.y += this.velY;
		}
		if(this.velY<0 && this.y-this.radius > 0 && !thisLevel.checkIfHitWall(this.x,this.y-this.radius+this.velY)){
			this.y += this.velY;
		}
	
		thisLevel.checkIfHitSomething(this.x,this.y, this.nearestRow, this.nearestCol);
		for (var i=0;i<numGhosts;i++){
			if (thisLevel.checkIfHit(this.x,this.y, ghosts[i].x, ghosts[i].y, thisGame.TILE_WIDTH/2)){
				if (ghosts[i].state == 2){
					thisGame.points+=20;
                    ghosts[i].state = 3;
					eat_ghost.play();
                } else {
                    if (ghosts[i].state == 1){
                        //console.log("Pierde partida");
						siren.stop();
						die.play();
                        thisGame.setMode(thisGame.HIT_GHOST);
                        thisGame.modeTimer=90;
                    }
                }
			}
		}




	};


     // Función para pintar el Pacman
     Pacman.prototype.draw = function(x, y) {
         
        if(thisGame.mode == thisGame.HIT_GHOST){
		this.sprite = this.colors[4];
		}else if(player.velX>0){
			this.sprite = this.colors[0];
		}else if(player.velX<0){
			this.sprite = this.colors[1];
		}else if(player.velY>0){
			this.sprite = this.colors[3];
		}else if(player.velY<0){
			this.sprite = this.colors[2];
		}
		ctx.save();
		ctx.translate(player.x-thisGame.TILE_WIDTH/2,player.y-thisGame.TILE_HEIGHT/2);
		player.sprite.render(ctx);
		ctx.restore();     
    };
	
	var PacmanVidas = function() {
		this.radius = 10;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
	};
	PacmanVidas.prototype.draw = function(x, y) {
         
		ctx.beginPath();
		ctx.arc(x+this.radius,y+this.radius, this.radius, Math.PI*this.angle1, Math.PI*this.angle2, false);
		ctx.lineTo(x+this.radius, y+this.radius);
		ctx.closePath(); 
		ctx.fillStyle= 'yellow';
		//ctx.strokeStyle= 'black';
		ctx.fill();
		ctx.stroke();       
    };
	


	var player = new Pacman();
	for (var i=0; i< numGhosts; i++){
		ghosts[i] = new Ghost(i, canvas.getContext("2d"));
	}
	
	var vidas= new PacmanVidas();


	var thisGame = {
		getLevelNum : function(){
			return 0;
		},
	        setMode : function(mode) {
			this.mode = mode;
			this.modeTimer = 0;
		},
		screenTileSize: [24, 21],
		TILE_WIDTH: 24, 
		TILE_HEIGHT: 24,
		ghostTimer: 0,
		NORMAL : 1,
		HIT_GHOST : 2,
		lifes : 3,
		WAIT_TO_START: 4,
		modeTimer: 0,
		points: 0,
		highscore: 0,
		GAME_OVER: 0,
		PAUSE: 5
	};

	var thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel( thisGame.getLevelNum() );
	// thisLevel.printMap(); 

	
	var timer = function(currentTime) {
		if (oldTime === undefined) {
			oldTime = currentTime;
		}
		var aux = currentTime - oldTime;
		oldTime = currentTime;
		return aux;
	};


	var measureFPS = function(newTime){
		// la primera ejecución tiene una condición especial

		if(lastTime === undefined) {
			lastTime = newTime; 
			return;
		}

		// calcular el delta entre el frame actual y el anterior
		var diffTime = newTime - lastTime; 

		if (diffTime >= 1000) {

			fps = frameCount;    
			frameCount = 0;
			lastTime = newTime;
		}

		// mostrar los FPS en una capa del documento
		// que hemos construído en la función start()
		fpsContainer.innerHTML = 'FPS: ' + fps; 
		frameCount++;
	};

	// clears the canvas content
	var clearCanvas = function() {
		ctx.clearRect(0, 0, w, h);

	};

	var checkInputs = function(){
		// tu código aquí
		// LEE bien el enunciado, especialmente la nota de ATENCION que
		// se muestra tras el test 7
		if(inputStates.right && !thisLevel.checkIfHitWall(player.x+player.radius+player.speed,player.y)){
			var x = Math.floor((player.x+player.radius+player.speed)/24)
			var y = Math.floor((player.y)/24)
			if(player.x+player.radius+player.speed/24-x == 0.5 || player.y/24-y == 0.5){
				player.velY = 0;
				player.velX = player.speed;
			}
		}
		if(inputStates.down && !thisLevel.checkIfHitWall(player.x,player.y+player.radius+player.speed)){
			var x = Math.floor((player.x)/24)
			var y = Math.floor((player.y+player.radius+player.speed)/24)
			if(player.x/24-x == 0.5 || player.y+player.radius+player.speed/24-y == 0.5){
				player.velX = 0;
				player.velY = player.speed;
			}
		}
		if(inputStates.left && !thisLevel.checkIfHitWall(player.x-player.radius-player.speed,player.y)){
			var x = Math.floor((player.x-player.radius-player.speed)/24)
			var y = Math.floor((player.y)/24)
			if(player.x-player.radius-player.speed/24-x == 0.5 || player.y/24-y == 0.5){
				player.velY = 0;
				player.velX = 0-player.speed;
			}
		}
		if(inputStates.up && !thisLevel.checkIfHitWall(player.x,player.y-player.radius-player.speed)){
			var x = Math.floor((player.x)/24)
			var y = Math.floor((player.y-player.radius-player.speed)/24)
			if(player.x/24-x == 0.5 || player.y-player.radius-player.speed/24-y == 0.5){
				player.velX = 0;
				player.velY = 0-player.speed;
			}
		}
		if(inputStates.pausa){
			inputStates.pausa=false;
			if(thisGame.mode===thisGame.PAUSE){
				 thisGame.setMode(thisGame.NORMAL);
				 siren.play();
			}else{
				thisGame.setMode(thisGame.PAUSE);
			}
			
		}
		else{
			player.velX = player.velX;
			player.velY = player.velY;
		}
	};
	
	var displayScore= function(){
		
			//points
			ctx.font= "20px Arial";
			ctx.fillStyle= "red"
			ctx.fillText("POINTS ", 10, 20);
			ctx.fillStyle="white"
			ctx.fillText(thisGame.points, 90, 20);
		
			//lifes
		
		
		
			ctx.fillText("Lifes: ", 10, 595);
			var kont=55;
			for(var i=thisGame.lifes;i>0;i--){
				vidas.draw(10+kont,578);
				kont=kont+25;
			}
		
			//high score
		ctx.fillStyle= "red"
		ctx.fillText("HIGH SCORE ", 300, 20);
		ctx.fillStyle="white"
		if(thisGame.lifes==0){
			thisGame.highscore=thisGame.points;
		}
		ctx.fillText(thisGame.highscore, 440, 20);
		
	};


    var updateTimers = function(){
	// tu código aquí (test12)
        // Actualizar thisGame.ghostTimer (y el estado de los fantasmas, tal y como se especifica en el enunciado)
       if (thisGame.ghostTimer == 0){
            for (var i = 0; i< numGhosts; i++){
		          if (ghosts[i].state != 3){
                      ghosts[i].state = 1;
                }
	        }
        }else{
            thisGame.ghostTimer--;
			if(thisGame.ghostTimer == 0){
				waza.stop();
				siren.play();
			}
        }

	    // tu código aquí (test14)
	    // actualiza modeTimer...
        if(thisGame.modeTimer == 0 && thisGame.GAME_OVER != thisGame.mode&& thisGame.PAUSE != thisGame.mode){
            thisGame.setMode(thisGame.NORMAL);

        } else{
			siren.stop();
			var vidas=thisGame.lifes;
			if(vidas>0&& thisGame.PAUSE != thisGame.mode){
				siren.play();
				}
            thisGame.modeTimer--;
			
			
        }

            
        
    };

    var mainLoop = function(time){
        //main function, called each frame 
        measureFPS(time);
     
		delta = timer(time);
        checkInputs();
        if (thisGame.NORMAL == thisGame.mode && thisGame.GAME_OVER != thisGame.mode && thisGame.PAUSE != thisGame.mode){
           
			
            
            for (var i=0; i< numGhosts; i++){
                ghosts[i].move();
            }
            
            player.move();
            // Clear the canvas
            clearCanvas();
            thisLevel.drawMap();

            
            for (var i=0; i< numGhosts; i++){
                ghosts[i].draw();
            }
            player.draw();
			displayScore();
			
            
        } else if(thisGame.GAME_OVER == thisGame.mode){
			clearCanvas();
            thisLevel.drawMap();

            
            for (var i=0; i< numGhosts; i++){
                ghosts[i].draw();
            }
            player.draw();
			displayScore();
			//game over
			ctx.font= "70px Candara";
			ctx.fillStyle= "white"
			ctx.fillText("GAME OVER ", 70, 300);
			
		}else if (thisGame.mode == thisGame.HIT_GHOST && thisGame.modeTimer ==0){
			thisGame.lifes--;
			displayScore();
			if(thisGame.lifes<=0){
				
				thisGame.setMode(thisGame.GAME_OVER);
				
			}
			else{
            reset();
            thisGame.setMode(thisGame.WAIT_TO_START);
            thisGame.modeTimer=30;
			}
        }
		else if(thisGame.PAUSE == thisGame.mode){
			//pause
			ctx.font= "70px Arial";
			ctx.fillStyle= "red"
			ctx.fillText("PAUSE ", 145, 300);

		}
		
        updateTimers();
        // call the animation loop every 1/60th of second
		
        requestAnimationFrame(mainLoop);
    };

    var addListeners = function(){
	    //add the listener to the main, window object, and update the states
	    // Tu código aquí
		document.addEventListener('keydown',function(evt){
		
		if(event.keyCode==40) {
			inputStates.up=false;
			inputStates.right=false;
			inputStates.left=false;
			inputStates.down=true;
		}
		else if(event.keyCode==39) {
			inputStates.up=false;
			inputStates.right=true;
			inputStates.left=false;
			inputStates.down=false;
		}
		else if(event.keyCode==38) {
			inputStates.up=true;
			inputStates.right=false;
			inputStates.left=false;
			inputStates.down=false;
		}
		else if(event.keyCode==37) {
			inputStates.up=false;
			inputStates.right=false;
			inputStates.left=true;
			inputStates.down=false;
		}
		
		},false);
		
		document.addEventListener('keyup',function(evt){
		if(event.keyCode==40) {
			inputStates.up=false;
			inputStates.right=false;
			inputStates.left=false;
			inputStates.down=false;
		}
		else if(event.keyCode==39) {
			inputStates.up=false;
			inputStates.right=false;
			inputStates.left=false;
			inputStates.down=false;
		}
		else if(event.keyCode==38) {
			inputStates.up=false;
			inputStates.right=false;
			inputStates.left=false;
			inputStates.down=false;
		}
		else if(event.keyCode==37) {
			inputStates.up=false;
			inputStates.right=false;
			inputStates.left=false;
			inputStates.down=false;
		}
		else if(event.keyCode==80) {
			inputStates.pausa=true;
		}
		
		},false);
    };

    var reset = function(){
	// Tu código aquí
	// Inicialmente Pacman debe empezar a moverse en horizontal hacia la derecha, con una velocidad igual a su atributo speed
	// inicializa la posición inicial de Pacman tal y como indica el enunciado
	// Tu código aquí (test10)
	// Inicializa los atributos x,y, velX, velY, speed de la clase Ghost de forma conveniente
	    //
		player.x = player.homeX;
		player.y = player.homeY;
        inputStates.up = false;
		inputStates.down = false;
		inputStates.left = false;
		inputStates.right = true;
		player.velX = 0;
		player.velY = 0;
		for (var i=0; i< numGhosts; i++){
			ghosts[i].x = ghosts[i].homeX;
			ghosts[i].y = ghosts[i].homeY;
		
		}
		ghosts[0].velX = ghosts[0].speed;
		ghosts[0].velY = 0;
		ghosts[1].velX = ghosts[1].speed;
		ghosts[1].velY = 0;
		ghosts[2].velX = 0;
		ghosts[2].velY = 0 - ghosts[2].speed;
		ghosts[3].velX = 0 - ghosts[3].speed;
		ghosts[3].velY = 0;
	    // test14
	     thisGame.setMode( thisGame.NORMAL);
    };

	function loadAssets(){
        eat_pill = new Howl({
	    src: ['res/sounds/eat-pill.mp3'],
	    volume: 1,
	    onload: function() {
		eating = new Howl ({
		    src:['res/sounds/eating.mp3'],
		    volume:1,
		    onload: function() {
			ready = new Howl({
			    src:['res/sounds/ready.mp3'],
			    volume:1,
			    onload: function () {
				die = new Howl ({
				    src:['res/sounds/die.mp3'],
				    volume:1,
				    onend: function() {
					//ready.play();
				    },
		        	    onload: function() {
				        eat_ghost = new Howl({
				            src:['res/sounds/eat-ghost.mp3'],
				            volume:1,
				            onload: function() {
						ghost_eaten = new Howl({
						    src:['res/sounds/ghost-eaten.mp3'],
						    volume:1,
						    onload: function() {
							waza = new Howl({
							    src:['res/sounds/waza.mp3'],
							    volume:1,
							    loop:true,
							    onload: function() {
								siren = new Howl({
				                    	   	    src:['res/sounds/siren.mp3'],
				                    	    	    volume:1,
				                    	    	    loop:true,
				                    	    	    onload: function() {
									//ready.play();
									siren.play();
					                		requestAnimationFrame(mainLoop);
				                    	    	    }
		 		                		});
							    }
							});
						    }
						});
		        	            }
		        	        });
	        	            }
	        	        });
			    }
		        });
		    }
	        });
	    }
	});
    }

    function init(){
		loadAssets();
	}

    var start = function(){
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);
       
	addListeners();

	reset();

        // load sprites and start the animation
        resources.load(['res/img/sprites.png']);
        resources.onReady(init);
    };

    //our GameFramework returns a public API visible from outside its scope
    return {
        start: start,
        thisGame: thisGame
    };
};


   game = new GF();
  game.start();



