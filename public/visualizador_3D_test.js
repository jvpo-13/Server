
let velCarro = 1;
let theta = 0;
// Função para mover o carro ao longo da pista
let fraction = 0;
let velocidade = 0.001;
const vec = new THREE.Vector3(1, 0, 0);
const axis = new THREE.Vector3();
function moveCar(){
  if (carro) {
    const newPosition = pontos.getPoint(fraction);
    const tangent = pontos.getTangent(fraction);
    carro.position.copy(newPosition);
    axis.crossVectors(vec, tangent).normalize();
    const radians = Math.acos(vec.dot(tangent));

    if(axis.z < 0.5){
      carro.quaternion.setFromAxisAngle(axis, Math.PI+radians);
    }else{
      carro.quaternion.setFromAxisAngle(axis, radians);
    }
    fraction += velocidade;
    if (fraction > 1) {
      fraction = 0;
    }    
  }
}

// Adicionando o caminho à cena
const pontos = new THREE.CurvePath();
pontos.add(pointsPathCV());
pontos.add(pointsPathCA1());
pontos.add(pointsPathCL());
pontos.add(pointsPathCA2());
pontos.add(pointsPathCA3());
const caminho = path();
//scene.add(caminho);

function path() {
  const material = new THREE.LineBasicMaterial({color: 0x9132a8});
  const points = pontos.curves.reduce((p, d)=> [...p, ...d.getPoints(20)], []);
  const geometry = new THREE.BufferGeometry().setFromPoints( points );

  return new THREE.Line( geometry, material );
}

function handleKeyboard(event) {
  switch (event.key) {
    case 'w': // Move para cima
      positionCam[1] += 10;
      //positionCam = rotateStl_X(positionCam, -speed);
      break;
    case 's': // Move para baixo
      positionCam[1] -= 10;
      //positionCam = rotateStl_X(positionCam, +speed);
      break;
    case 'a': // Rodar +90
      positionCam = rotateStl_Y(positionCam, -speed);
      break;
	  case 'd': // Rodar -90
      positionCam = rotateStl_Y(positionCam, +speed);
      break;
	  case '1': // Visão frontal
      positionCam = [-distance/2, distance/2, distance/2];
      break;
    case '2': // Visão lateral
      positionCam = [0, distance, 0];
      break;
    case '3': // Visão superior
      positionCam = [0,distance/3,distance];
      break;
	  case '4': // Visão diagonal
      positionCam = [-distance, distance/3, 0];
      break;
    case 'q': // Visão diagonal
      speed = Math.PI/4;
      break;
    case 'e': // Visão diagonal
      speed = Math.PI/60;
      break;
  }
  camera.position.set(positionCam[0], positionCam[1], positionCam[2]);
	camera.lookAt(0, 0, 0);
}

// Função de matriz de rotaçãoq
function rotateStl_Y(vetor, graus) {
  let matriz = [[Math.cos(graus), 0, Math.sin(graus)],[0, 1, 0],[-Math.sin(graus), 0, Math.cos(graus)]]
  let resultado = [0,0,0];
  for (let i = 0; i < matriz.length; i++) { 
      for (let j = 0; j < vetor.length; j++) { 
          resultado[i] += vetor[j] * matriz[i][j]; 
      }
  }
  return resultado
}

function rotateStl_X(vetor, graus) {
	let matriz = [[1, 0, 0],[0, Math.cos(graus), Math.sin(graus)],[0, -Math.sin(graus), Math.cos(graus)]]
  let resultado = [0,0,0];
  for (let i = 0; i < matriz.length; i++) { 
      for (let j = 0; j < vetor.length; j++) { 
          resultado[i] += vetor[j] * matriz[i][j]; 
      }
  }
  return resultado
}

document.addEventListener('keydown', handleKeyboard);

// Função de renderização
function animate() {
	requestAnimationFrame(animate);
	controls.update(); // Atualiza os controles a cada frame
  moveCar();  // Atualiza a posição do carro
	renderer.render(scene, camera);
}
  
// Ajusta o tamanho do renderer quando a janela é redimensionada

window.addEventListener('resize', () => {
	const size = Math.min(container.clientWidth, container.clientHeight);
  renderer.setSize(size, size);
  camera.aspect = 1; // Mantém o aspecto 1:1
  camera.updateProjectionMatrix();
});

animate();


