// Configuração básica da cena
const scene = new THREE.Scene();
const width = 1800
const height = 1800
const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 10000 );
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(800, 800);
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

const axesHelper = new THREE.AxesHelper( 500 );
scene.add(axesHelper);