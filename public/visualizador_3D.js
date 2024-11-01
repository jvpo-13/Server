
// Configuração básica da cena
const scene = new THREE.Scene();
const width = 1800
const height = 1800
const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 10000 );
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(400, 400);
document.getElementById('threejs-container').appendChild(renderer.domElement);

// Obtém o contêiner
const container = document.getElementById('threejs-container');
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Adicionando luz principal (direcional)
const light11 = new THREE.DirectionalLight(0xffffff, .9);
light11.position.set(1, 1, 1).normalize();
scene.add(light11);

// Adicionando uma segunda luz (pode ser outra direcional ou ponto)
const light12 = new THREE.DirectionalLight(0xffffff, .4);
light12.position.set(1, 0, -1).normalize();
scene.add(light12);

// Adicionando uma segunda luz (pode ser outra direcional ou ponto)
const light13 = new THREE.DirectionalLight(0xffffff, .4);
light13.position.set(-1, 0, 1).normalize();
scene.add(light13);

// Adicionando uma segunda luz (pode ser outra direcional ou ponto)
const light14 = new THREE.DirectionalLight(0xffffff, .6);
light14.position.set(-1, 1, -1).normalize();
scene.add(light14);

// Adicionando uma segunda luz (pode ser outra direcional ou ponto)
const light3 = new THREE.PointLight(0x00ff00, .05); // Luz de ponto verde com intensidade 5
light3.position.set(0, 200, 0); // Posição mais elevada para iluminar a cena
scene.add(light3);

// Configurando os controles de câmera
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Ativar a inércia no movimento da câmera
controls.dampingFactor = 0.25; // Fator de amortecimento
controls.screenSpacePanning = false; // Panning no espaço da tela
controls.minDistance = 100; // Distância mínima de zoom
controls.maxDistance = 2000; // Distância máxima de zoom
controls.maxPolarAngle = Math.PI / 2; // Limita a câmera para não passar pelo "polo"

let distance = 1000; // distancia da camera
// Controle de teclado para movimentar a câmera
let speed = Math.PI/4; // Velocidade de movimentação da câmera
let positionCam = [-distance/2, distance/2, distance/2]; // Vetor posição da câmera

// Carregando o modelo STL
let pista;
const loader = new THREE.STLLoader();
loader.load('Pista_thomas.stl', function (geometry) {
  geometry.center();
  
  const material = new THREE.MeshLambertMaterial({ color: 0xF1F1EE });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  //mesh.rotation.y -= Math.PI;
  pista = mesh
  pista.rotation.y = Math.PI;

  // Centraliza o modelo na cena
  const center = new THREE.Vector3();
  geometry.computeBoundingBox();
  geometry.boundingBox.getCenter(center);
  mesh.position.sub(center);

  camera.position.set(positionCam[0], positionCam[1], positionCam[2]);
	camera.lookAt(0, 0, 0);
  controls.update(); // Atualiza os controles após alterar a posição da câmera
});

// Carregar o modelo do carro
let carro;
loader.load('Carro_thomas.stl', function (geometry) {
  geometry.center();
  
  const material = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Vermelho para o carro
  const carMesh = new THREE.Mesh(geometry, material);
  scene.add(carMesh);
  
  // Girar o carro 90 graus no eixo Y
  carMesh.rotation.y = Math.PI;
  carMesh.rotation.x = 0;
  carMesh.rotation.z = 0;

  // Posicionar o carro sobre a pista
  carMesh.position.set(300, -35, 530); // Ajuste conforme necessário para alinhar com a pista
  carro = carMesh;

  controls.update(); // Atualiza os controles após alterar a posição do carro
});

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
scene.add(caminho);

function path() {
  const material = new THREE.LineBasicMaterial({color: 0x9132a8});
  const points = pontos.curves.reduce((p, d)=> [...p, ...d.getPoints(20)], []);
  const geometry = new THREE.BufferGeometry().setFromPoints( points );

  return new THREE.Line( geometry, material );
}

function pointsPathCV() {
  const pointsPath = new THREE.CurvePath();
  const line1 = new THREE.LineCurve3(
    new THREE.Vector3(100, -35, 530),
    new THREE.Vector3(470, -35, 530)
  );
  const curve1 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(470, -35, 530),
    new THREE.Vector3(588, -35, 530),
    new THREE.Vector3(588, -35, 400),
    new THREE.Vector3(588, -35, 400)
  );
  const line2 = new THREE.LineCurve3(
    new THREE.Vector3(588, -35, 400),
    new THREE.Vector3(588, -35, -250)
  );
  const curve2 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(588, -35, -250),
    new THREE.Vector3(588, -35, -380),
    new THREE.Vector3(378, -35, -380),
    new THREE.Vector3(378, -35, -250)
  );
  const line3 = new THREE.LineCurve3(
    new THREE.Vector3(378, -35, -250),
    new THREE.Vector3(378, -35, -120)
  );
  const line4 = new THREE.LineCurve3(
    new THREE.Vector3(378, -35, -120),
    new THREE.Vector3(378, -35, -250)
  );
  const curve3 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(378, -35, -250),
    new THREE.Vector3(378, -35, -380),
    new THREE.Vector3(588, -35, -380),
    new THREE.Vector3(588, -35, -250)
  );
  const line5 = new THREE.LineCurve3(
    new THREE.Vector3(588, -35, -250),
    new THREE.Vector3(588, -35, 400)
  );
  const curve4 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(588, -35, 400),
    new THREE.Vector3(588, -35, 400),
    new THREE.Vector3(588, -35, 530),
    new THREE.Vector3(470, -35, 530)
  );
  const line6 = new THREE.LineCurve3(
    new THREE.Vector3(470, -35, 530),
    new THREE.Vector3(100, -35, 530)
  );

  pointsPath.add(line1);
  pointsPath.add(curve1);
  pointsPath.add(line2);
  pointsPath.add(curve2);
  pointsPath.add(line3);
  pointsPath.add(line4);
  pointsPath.add(curve3);
  pointsPath.add(line5);
  pointsPath.add(curve4);
  pointsPath.add(line6);

  return pointsPath;
}

function pointsPathCA1() {
  const pointsPath = new THREE.CurvePath();
  const line1 = new THREE.LineCurve3(
    new THREE.Vector3(100, -35, 530),
    new THREE.Vector3(-470, -35, 530)
  );
  const curve1 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-470, -35, 530),
    new THREE.Vector3(-588, -35, 530),
    new THREE.Vector3(-588, -35, 400),
    new THREE.Vector3(-588, -35, 400)
  );
  const line2 = new THREE.LineCurve3(
    new THREE.Vector3(-588, -35, 400),
    new THREE.Vector3(-588, -35, -120)
  );
  const curve2 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-588, -35, -120),
    new THREE.Vector3(-588, -35, -230),
    new THREE.Vector3(-470, -35, -230),
    new THREE.Vector3(-470, -35, -230)
  );
  const line3 = new THREE.LineCurve3(
    new THREE.Vector3(-470, -35, -230),
    new THREE.Vector3(-400, -35, -230)
  );

  pointsPath.add(line1);
  pointsPath.add(curve1);
  pointsPath.add(line2);
  pointsPath.add(curve2);
  pointsPath.add(line3);

  return pointsPath;
}

function pointsPathCL() {
  const pointsPath = new THREE.CurvePath();
  const line1 = new THREE.LineCurve3(
    new THREE.Vector3(-400, -35, -230),
    new THREE.Vector3(80, -35, -230)
  );
  const curve1 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(80, -35, -230),
    new THREE.Vector3(280, -35, -230),
    new THREE.Vector3(280, -35, 50),
    new THREE.Vector3(80, -35, 40)
  );
  const curve2 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(80, -35, 40),
    new THREE.Vector3(55, -35, 38),
    new THREE.Vector3(45, -35, 32),
    new THREE.Vector3(40, -35, 30)
  );
  const curve10 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(80, -35, -230),
    new THREE.Vector3(280, -35, -230),
    new THREE.Vector3(280, -35, 100),
    new THREE.Vector3(40, -35, 30)
  );
  const line2 = new THREE.LineCurve3(
    new THREE.Vector3(40, -35, 30),
    new THREE.Vector3(-90, -35, -45)
  );
  //volta
  const line3 = new THREE.LineCurve3(
    new THREE.Vector3(-90, -35, -45),
    new THREE.Vector3(40, -35, 30)
  );
  const curve3 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(40, -35, 30),
    new THREE.Vector3(45, -35, 32),
    new THREE.Vector3(55, -35, 38),
    new THREE.Vector3(80, -35, 40)
  );
  const curve4 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(80, -35, 40),
    new THREE.Vector3(280, -35, 50),
    new THREE.Vector3(280, -35, -230),
    new THREE.Vector3(80, -35, -230)
  );
  const line4= new THREE.LineCurve3(
    new THREE.Vector3(80, -35, -230),
    new THREE.Vector3(-400, -35, -230)
  );

  pointsPath.add(line1);
  pointsPath.add(curve1);
  pointsPath.add(curve2);
  pointsPath.add(line2);
  pointsPath.add(line3);
  pointsPath.add(curve3);
  pointsPath.add(curve4);
  pointsPath.add(line4);

  return pointsPath;
}

function pointsPathCA2() {
  const pointsPath = new THREE.CurvePath();
  const line1 = new THREE.LineCurve3(
    new THREE.Vector3(-400, -35, -230),
    new THREE.Vector3(-470, -35, -230)
  );
  const curve1 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-470, -35, -230),
    new THREE.Vector3(-470, -35, -230),
    new THREE.Vector3(-588, -35, -230),
    new THREE.Vector3(-588, -35, -330)
  );
  const line2 = new THREE.LineCurve3(
    new THREE.Vector3(-588, -35, -330),
    new THREE.Vector3(-588, -35, -420)
  );
  const curve2 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-588, -35, -420),
    new THREE.Vector3(-588, -35, -420),
    new THREE.Vector3(-588, -35, -530),
    new THREE.Vector3(-488, -35, -530)
  );
  const curve3 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-488, -35, -530),
    new THREE.Vector3(-588, -35, -530),
    new THREE.Vector3(-588, -35, -420),
    new THREE.Vector3(-588, -35, -420)
  );
  const line3 = new THREE.LineCurve3(
    new THREE.Vector3(-588, -35, -420),
    new THREE.Vector3(-588, -35, 400)
  );
  const line4= new THREE.LineCurve3(
    new THREE.Vector3(-588, -35, 400),
    new THREE.Vector3(-588, -35, -120)
  );
  const curve4 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-588, -35, -120),
    new THREE.Vector3(-588, -35, -230),
    new THREE.Vector3(-470, -35, -230),
    new THREE.Vector3(-470, -35, -230)
  );
  const curve5 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-470, -35, -230),
    new THREE.Vector3(-470, -35, -230),
    new THREE.Vector3(-588, -35, -230),
    new THREE.Vector3(-588, -35, -330)
  );
  const line5 = new THREE.LineCurve3(
    new THREE.Vector3(-588, -35, -330),
    new THREE.Vector3(-588, -35, -420)
  );
  const curve6 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-588, -35, -420),
    new THREE.Vector3(-588, -35, -420),
    new THREE.Vector3(-588, -35, -530),
    new THREE.Vector3(-488, -35, -530)
  );
  const line6 = new THREE.LineCurve3(
    new THREE.Vector3(-488, -35, -530),
    new THREE.Vector3(-308, -35, -530)
  );
  const curve7 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-308, -35, -530),
    new THREE.Vector3(-258, -35, -530),
    new THREE.Vector3(-168, 0, -530),
    new THREE.Vector3(-158, 5, -530)
  );
  const line7 = new THREE.LineCurve3(
    new THREE.Vector3(-158, 5, -530),
    new THREE.Vector3(88, 120, -530)
  );
  const curve8 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(88, 120, -530),
    new THREE.Vector3(118, 135, -530),
    new THREE.Vector3(138, 145, -530),
    new THREE.Vector3(238, 145, -530)
  );
  const line8 = new THREE.LineCurve3(
    new THREE.Vector3(238, 145, -530),
    new THREE.Vector3(338, 145, -530)
  );
  
  

  pointsPath.add(line1);
  pointsPath.add(curve1);
  pointsPath.add(line2);
  pointsPath.add(curve2);
  pointsPath.add(curve3);
  pointsPath.add(line3);
  pointsPath.add(line4);
  pointsPath.add(curve4);
  pointsPath.add(curve5);
  pointsPath.add(line5);
  pointsPath.add(curve6);
  pointsPath.add(line6);
  pointsPath.add(curve7);
  pointsPath.add(line7);
  pointsPath.add(curve8);
  pointsPath.add(line8);

  return pointsPath;
}

function pointsPathCA3() {
  const pointsPath = new THREE.CurvePath();
  const line1 = new THREE.LineCurve3(
    new THREE.Vector3(338, 145, -530),
    new THREE.Vector3(238, 145, -530)
  );
  const curve1 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(238, 145, -530),
    new THREE.Vector3(138, 145, -530),
    new THREE.Vector3(118, 135, -530),
    new THREE.Vector3(88, 120, -530)
  );
  const line2 = new THREE.LineCurve3(
    new THREE.Vector3(88, 120, -530),
    new THREE.Vector3(-158, 5, -530)
  );
  const curve2 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-158, 5, -530),
    new THREE.Vector3(-168, 0, -530),
    new THREE.Vector3(-258, -35, -530),
    new THREE.Vector3(-308, -35, -530)
  );
  const line3 = new THREE.LineCurve3(
    new THREE.Vector3(-308, -35, -530),
    new THREE.Vector3(-488, -35, -530)
  );
  const curve3 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-488, -35, -530),
    new THREE.Vector3(-588, -35, -530),
    new THREE.Vector3(-588, -35, -420),
    new THREE.Vector3(-588, -35, -420)
  );
  const line4 = new THREE.LineCurve3(
    new THREE.Vector3(-588, -35, -420),
    new THREE.Vector3(-588, -35, 400)
  );
  const curve5 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-588, -35, 400),
    new THREE.Vector3(-588, -35, 400),
    new THREE.Vector3(-588, -35, 530),
    new THREE.Vector3(-470, -35, 530)
  );
  const line6 = new THREE.LineCurve3(
    new THREE.Vector3(-470, -35, 530),
    new THREE.Vector3(100, -35, 530)
  );
  
  pointsPath.add(line1);
  pointsPath.add(curve1);
  pointsPath.add(line2);
  pointsPath.add(curve2);
  pointsPath.add(line3);
  pointsPath.add(curve3);
  pointsPath.add(line4);
  pointsPath.add(curve5);
  pointsPath.add(line6);

  return pointsPath;
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

const axesHelper = new THREE.AxesHelper( 500 );
scene.add(axesHelper);
