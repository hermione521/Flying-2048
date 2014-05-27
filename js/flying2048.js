if ( !window.requestAnimationFrame ) {
	window.requestAnimationFrame = ( function() {
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
			window.setTimeout( callback, 1000 / 60 );
		};
	})();
}


window.Flying2048 = window.Flying2048  || {};
Flying2048.sounds = {};

Flying2048.init = function() {
	Flying2048.sounds["bad"] = document.getElementById("audio_bad");
	Flying2048.sounds["win"] = document.getElementById("audio_win");
	Flying2048.sounds["move"] = document.getElementById("audio_move");
	Flying2048.sounds["score"] = document.getElementById("audio_score");

	// set the scene size
	var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight;

	// set some camera attributes
	var VIEW_ANGLE = 45,
	ASPECT = WIDTH / HEIGHT,
	NEAR = 0.1,
	FAR = 10000;

	// create a WebGL renderer, camera and a scene
	Flying2048.renderer = new THREE.WebGLRenderer();
	Flying2048.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	Flying2048.scene = new THREE.Scene();

	// the camera starts at 0,0,0 so pull it back
	Flying2048.camera.position.z = 600;
	Flying2048.scene.add(Flying2048.camera);
	// start the renderer
	Flying2048.renderer.setSize(WIDTH, HEIGHT);
	Flying2048.renderer.setClearColor(0xfaf8ef, 1);
	// attach the render-supplied DOM element
	document.body.appendChild(Flying2048.renderer.domElement);

	// configuration object
	var boundingBoxConfig = {
		width: 400,
		height: 400,
		depth: 2000,
		splitX: 4,
		splitY: 4,
		splitZ: 20
	};
	 
	Flying2048.boundingBoxConfig = boundingBoxConfig;
	Flying2048.blockSize = 100;
	Flying2048.maxVisible = 14;
	   
	var boundingBox = new THREE.Mesh(
		new THREE.BoxGeometry(	boundingBoxConfig.width, boundingBoxConfig.height, boundingBoxConfig.depth, 
								boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ), 
		new THREE.MeshBasicMaterial({ color: 0xbbada0, wireframe: true })
	);
	Flying2048.scene.add(boundingBox);

	Flying2048.renderer.render(Flying2048.scene, Flying2048.camera);

	document.getElementById("play_button").addEventListener('click', function (event) {
		event.preventDefault();
		Flying2048.start();
	});
};

Flying2048.start = function() {
	document.getElementById("menu").style.display = "none";
	document.getElementById("points").style.display = "block";

	Flying2048.animate();
};

Flying2048.gameStepTime = 1000;
 
Flying2048.frameTime = 0; // ms
Flying2048.cumulatedFrameTime = 0; // ms
Flying2048._lastFrameTime = Date.now(); // timestamp

Flying2048.gameOver = false;

Flying2048.animate = function() {
	var time = Date.now();
	Flying2048.frameTime = time - Flying2048._lastFrameTime;
	Flying2048._lastFrameTime = time;
	Flying2048.cumulatedFrameTime += Flying2048.frameTime;

	while(Flying2048.cumulatedFrameTime > Flying2048.gameStepTime) {
		Flying2048.cumulatedFrameTime -= Flying2048.gameStepTime;

		// moving all blocks nearer (z=14 visible, z=15 invisible)
		for (var x = 3; x >= 0; x--){
			if (Flying2048.staticBlocks[x]){
				for (var y = 3; y >= 0; y--){
					if (Flying2048.staticBlocks[x][y]){
						if (Flying2048.staticBlocks[x][y][Flying2048.maxVisible + 2]){
							Flying2048.staticBlocks[x][y][Flying2048.maxVisible + 2] = null;
						}
						for (var z = Flying2048.maxVisible + 1; z >= 0; z--) {
							if (Flying2048.staticBlocks[x][y][z]){
								Flying2048.staticBlocks[x][y][z + 1] = Flying2048.staticBlocks[x][y][z];
								Flying2048.staticBlocks[x][y][z + 1].position.z += Flying2048.blockSize;
								Flying2048.staticBlocks[x][y][z] = null;
							}
						}
					}
				}
			}
		}

		// generate new blocks
		var blockNum = Math.random() < 0.8 ? 2 : 1;
		for (var i = 0; i < blockNum; ++i){
			var x = Math.floor(Math.random() * 4);
			var y = Math.floor(Math.random() * 4);
			var r = Math.random(), num;
			for (var j = 0; j < 11; ++j){
				if (r < Flying2048.randomFreq[j]){
					num = j;
					break;
				}
			}
			//console.log("x = " + x + " y = " + y + " num = " + num);
			Flying2048.addStaticBlock(x, y, num);
		}

		// calculate score
		var cameraX = (Flying2048.camera.position.x - Flying2048.blockSize / 2) / Flying2048.blockSize + Flying2048.boundingBoxConfig.splitX / 2;
		var cameraY = (Flying2048.camera.position.y - Flying2048.blockSize / 2) / Flying2048.blockSize + Flying2048.boundingBoxConfig.splitY / 2;
		//console.log("cameraX = " + cameraX + " cameraY = " + cameraY);
		if (Flying2048.staticBlocks[cameraX] && Flying2048.staticBlocks[cameraX][cameraY]){
			var currentBlock = Flying2048.staticBlocks[cameraX][cameraY][Flying2048.maxVisible + 1];
			if (currentBlock){
				var currentNum = Flying2048.power2[currentBlock.num];
				//console.log("hit!! " + currentNum);
				if (Flying2048.currentPoints === 0){
					if (currentNum === 2){
						Flying2048.setPoints(2);
						Flying2048.sounds["score"].play();
					}
				}
				else if (currentNum < Flying2048.currentPoints){
					Flying2048.setPoints(currentNum);
					Flying2048.sounds["bad"].play();
				}
				else if (currentNum === Flying2048.currentPoints){
					Flying2048.setPoints(currentNum * 2);
					Flying2048.sounds["score"].play();
				}
			}
		}
	}

	Flying2048.renderer.render(Flying2048.scene, Flying2048.camera);
	if(!Flying2048.gameOver){
		window.requestAnimationFrame(Flying2048.animate);
	}
}

Flying2048.staticBlocks = [];
Flying2048.zColors = [
	0x6666ff, 0x66ffff, 0xcc68EE, 0x666633, 0x66ff66, 0x9966ff, 0x00ff66, 0x66EE33, 0x003399, 0x330099, 0xFFA500, 0x99ff00, 0xee1289, 0x71C671, 0x00BFFF, 0x666633, 0x669966, 0x9966ff
];
Flying2048.numColors = [
	0xeee4da, 0xede0c8, 0xf2b179, 0xf59563, 0xf67c5f, 0xf65e3b, 0xedcf72, 0xedcc61, 0xedc850, 0xedc53f, 0xedc22e, 0x3c3a32
];
Flying2048.power2 = [
	2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048
];
Flying2048.randomFreq = [
	0.2, 0.35, 0.5, 0.6, 0.7,
	0.75, 0.8, 0.85, 0.9, 0.95, 1
];
Flying2048.materialArray = [];
for (var i = 0; i < 11; i++) {
	var tempArray = [];
	var texture = new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture( 'img/' + Flying2048.power2[i] + '.png')});
	for (var j = 0; j < 6; ++j){
		tempArray.push(texture);
	}
	Flying2048.materialArray.push(tempArray);
};
console.log(Flying2048.materialArray);
Flying2048.addStaticBlock = function(x, y, num) {
	if(Flying2048.staticBlocks[x] === undefined) Flying2048.staticBlocks[x] = [];
	if(Flying2048.staticBlocks[x][y] === undefined) Flying2048.staticBlocks[x][y] = [];
	var z = 0;

	var MovingCubeMat = new THREE.MeshFaceMaterial(Flying2048.materialArray[num]);
	var MovingCubeGeom = new THREE.BoxGeometry( Flying2048.blockSize, Flying2048.blockSize, Flying2048.blockSize, 1, 1, 1, Flying2048.materialArray[num] );
	var MovingCube = new THREE.Mesh( MovingCubeGeom, MovingCubeMat );

	MovingCube.position.x = (x - Flying2048.boundingBoxConfig.splitX/2)*Flying2048.blockSize + Flying2048.blockSize/2;
	MovingCube.position.y = (y - Flying2048.boundingBoxConfig.splitY/2)*Flying2048.blockSize + Flying2048.blockSize/2;
	MovingCube.position.z = (z - Flying2048.boundingBoxConfig.splitZ/2)*Flying2048.blockSize + Flying2048.blockSize/2;
	MovingCube.num = num;

	Flying2048.scene.add(MovingCube);	
	Flying2048.staticBlocks[x][y][z] = MovingCube;
};

Flying2048.currentPoints = 0;
Flying2048.setPoints = function(n) {
	Flying2048.currentPoints = n;
	document.getElementById("points").innerHTML = "<h1>" + Flying2048.currentPoints + "</h1>";
	if (n === 4096){
		Flying2048.gameOver = true;
		document.getElementById("you-win").style.display = "block";
		Flying2048.sounds["win"].play();
	}
}

window.addEventListener("load", Flying2048.init);

window.addEventListener('keydown', function (event) {
	var key = event.which ? event.which : event.keyCode;
	switch(key) {
		case 38: // up (arrow)
			if (Flying2048.camera.position.y < 150){
				Flying2048.camera.position.y += Flying2048.blockSize / 2;
				Flying2048.sounds["move"].play();
			}
			break;
		case 40: // down (arrow)
			if (Flying2048.camera.position.y > -150){
				Flying2048.camera.position.y -= Flying2048.blockSize / 2;
				Flying2048.sounds["move"].play();
			}
			break;
		case 37: // left(arrow)
			if (Flying2048.camera.position.x > -150){
				Flying2048.camera.position.x -= Flying2048.blockSize / 2;
				Flying2048.sounds["move"].play();
			}
			break;
		case 39: // right (arrow)
			if (Flying2048.camera.position.x < 150){
				Flying2048.camera.position.x += Flying2048.blockSize / 2;
				Flying2048.sounds["move"].play();
			}
			break;	
	}
}, false);

