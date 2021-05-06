
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var points = 0
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
scene.background = new THREE.Color( 0x8CC3F4 );
document.body.appendChild( renderer.domElement );
let cloudParticles = [];
let plasmaBalls = []
let plasmaBalls2 = []
let health = 100
let ufo_health = 100
let ufo_destroyed = 0
var d = new THREE.Clock();

d.getDelta()
let t = d.getElapsedTime()

// var geometry = new THREE.BoxGeometry( 1, 1, 1 );
// var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// var cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

//clouds
let loader1 = new THREE.TextureLoader();
loader1.load("smoke-1.png", function(texture){
  cloudGeo = new THREE.PlaneBufferGeometry(500,500);
cloudMaterial = new THREE.MeshBasicMaterial({
  map:texture,
  transparent: true
});
for(let p=0; p<2; p++) {
	let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
	cloud.position.set(
		Math.random()*800 -400 ,
	  Math.random()*900 - 500,
	  -1000
	  
	);
	cloud.rotation.x = 0;
	cloud.rotation.y = -0.12;
	cloud.rotation.z = Math.random()*2*Math.PI;
	cloud.material.opacity = 0;
	cloudParticles.push(cloud);
	scene.add(cloud);
  }
});
//plane
const light = new THREE.AmbientLight( 0x404040 ,2); // soft white light
scene.add( light );
const directionalLight = new THREE.DirectionalLight( 0xFCF8DD, 1.4 );
scene.add( directionalLight );
camera.position.z = 40;

const loader = new THREE.GLTFLoader();
var plane 
loader.load( 'js/objects/plane/F-16D.gltf', function ( gltf ) {
	plane = gltf.scene
	plane.position.set(0,0,0)
	plane.rotation.set(0.3,3.15,0)
	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );
const light2 = new THREE.PointLight( 0x00FF00, 10, 20,1 );
light2.position.set( 50, 50, 50 );
scene.add( light2 )
const light3 = new THREE.PointLight( 0xDC143C, 10, 20,1 );
light3.position.set( 50, -500, 50 );
scene.add( light3 )
//ufo
const loader3 = new THREE.GLTFLoader();
var ufo 
loader3.load( 'ufo2.glb', function ( gltf ) {
	ufo = gltf.scene
	ufo.position.set(0,0,-400)
	ufo.rotation.set(0.3,0.15,0)
	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );


var star = []
for(let p=0; p<3; p++) {
	const loader2 = new THREE.GLTFLoader();
	
	loader2.load( 'star.glb', function ( gltf ) {
		
		let star1 = gltf.scene
		star1.position.set(p*20 -20,0,p*20 -20)
		star1.rotation.set(1.5,0,0)
		star.push(star1)
		scene.add( gltf.scene );
		

	}, undefined, function ( error ) {

		console.error( error );

	} );
}


var animate = function () {
	requestAnimationFrame( animate );
	//health
	document.getElementById("health").innerHTML = "Health : " + String(health)
	document.getElementById("health2").innerHTML = "Enemy Health : " + String(ufo_health)
	//bullets
	
	plasmaBalls.forEach(b => {
		b.position.z -= 5; // move along the local z-axis
		if(b.position.z < -1500){
			scene.remove(b)
		}
	  });
	plasmaBalls2.forEach(b => {
		b.position.z += 1; // move along the local z-axis
		if(b.position.z > 100){
			scene.remove(b)
		}
	  });
	//enemy movement
	updateufo()
	cloudParticles.forEach(p => {
		// console.log(plane.position)
		p.position.z +=1.5;
		p.material.opacity += 0.001
		if(p.position.z > 500){
			p.position.set(
				Math.random()*800 -400,
				
				100,
				Math.random()*800 -1000
			  );
			p.material.opacity = 0
		}
	 });
	 star.forEach(p => {
		// console.log(p.position)
		p.rotation.z += 0.05
		p.position.z +=0.5;
		if(p.position.z > 100){
			p.position.z = -500
		}
	 });

	 //collision
	detect_collision()
	// console.log(collision)
	renderer.render( scene, camera );
};
let v = 0
function updateufo(){
	if(ufo_destroyed==1){
		ufo_destroyed = 0
		ufo.position.set(0,0,-400)
		ufo.rotation.set(0.3,0.15,0)
		ufo_health  = 100
	}
	if(ufo_health > 0){
		if(ufo.position.z < -30)
		ufo.position.z += 1.1
		v += 0.07
		
		if(d.getElapsedTime() - t > 2){
			ufo_shoots()
			t = d.getElapsedTime()
		}
		// console.log(Math.sin(v))
		ufo.position.x += Math.pow((plane.position.x - ufo.position.x),1)*0.02 + 0.5*Math.sin(v)
		plasmaBalls.forEach(b => {
			
			if(b.position.x>=(ufo.position.x-5) && b.position.x <= (ufo.position.x + 5)){
				if(b.position.z>= ufo.position.z-5  && b.position.z <= ufo.position.z + 5)
				{
					console.log("hi")
					scene.remove(b);
					ufo_health-=10
					points+=10;
					document.getElementById("notes").innerHTML = "Score : " + String(points)
				}
			}
		});
		
		plasmaBalls2.forEach(b => {
			
			if(b.position.x>=(plane.position.x-5) && b.position.x <= (plane.position.x + 5)){
				if(b.position.z>= plane.position.z-5  && b.position.z <= plane.position.z + 5)
				{
					// console.log("hi")
					scene.remove(b);
					health-=1
					
					document.getElementById("notes").innerHTML = "Score : " + String(points)
				}
			}
		});
		light2.position.set(ufo.position.x,ufo.position.y,ufo.position.z+3);
	}
	else{
		if(ufo.position.z < 10)
		ufo.position.z += 0.1
		if(ufo.position.y > -50)
		ufo.position.y -= 0.1
		else
		ufo_destroyed = 1
		ufo.rotation.y += 0.05
		light3.position.set(ufo.position.x,ufo.position.y,ufo.position.z+3);

	}
}
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 65 || keyCode == 97) { 
        if(plane.position.x > -100)
        {
            if(plane.position.x > -31){
			plane.rotation.z = -0.5;
            plane.position.x -= 0.5; 
			}
        } 
    }
	if (keyCode == 68 || keyCode == 100) {
        if(plane.position.x < 100)
        {
			if(plane.position.x < 31){
            plane.rotation.z = 0.5;
            plane.position.x += 0.5;
			}
        }
    }
	if (keyCode == 87 || keyCode == 119) {
        if(plane.position.y < 70)
            {
				if(plane.position.z > 0){
                	plane.rotation.x = 0.2;
                	plane.position.z -= 0.5;
				}
            }
    } 
	if (keyCode == 83 || keyCode == 115) {
        
		if(plane.position.z < 15){
			plane.rotation.x = 0.5;
		plane.position.z += 0.5;
		}
    }
};
function onMouseDown() {
	let plasmaBall = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 4), new THREE.MeshBasicMaterial({
	  color: "red"
	}));
	plasmaBall.position.copy(plane.position); // start position - the tip of the weapon
	
	scene.add(plasmaBall);
	plasmaBalls.push(plasmaBall);
  }
function ufo_shoots(){
	let plasmaBall = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 4), new THREE.MeshBasicMaterial({
		color: "green"
	  }));
	  plasmaBall.position.copy(ufo.position); // start position - the tip of the weapon
	  
	  scene.add(plasmaBall);
	  plasmaBalls2.push(plasmaBall);
}
function onKeyup(event ){
	plane.rotation.x = 0.3
	plane.rotation.z = 0
	plane.rotation.y = 3.15
}
function detect_collision(){
	var box_x1 = plane.position.x +5
	var box_x2 = plane.position.x -5
	var box_z1 = plane.position.z +5
	var box_z2 = plane.position.z -5

	for(let i=0;i<3;i++){
		if(star[i].position.x>=box_x2 && star[i].position.x <= box_x1)
            if(star[i].position.z>= box_z2 && star[i].position.y <= box_z1)
            {
				console.log("hi")
                star[i].position.z = -500;
				
                points++;
				document.getElementById("notes").innerHTML = "Score : " + String(points)
            }
		}
}
// var firstObject = loader
// var secondObject = star[0]
// firstBB = new THREE.Box3().setFromObject(gltf.scene);
// secondBB = new THREE.Box3().setFromObject(secondObject);
// var collision = firstBB.isIntersectionBox(secondBB);
window.addEventListener('keydown', onDocumentKeyDown, false);
window.addEventListener('keyup', onKeyup, false);
window.addEventListener("mousedown", onMouseDown);
animate();