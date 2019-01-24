import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Cube from './geometry/Cube'; // Added for HW0

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  colorR: 1, // Added for HW0
  colorG: 1, // Added for HW0
  colorB: .0, // Added for HW0  
  'My Shader' : false, // Added for HW0
  'Load Scene': loadScene, // A function pointer, essentially
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube; // Added for HW0
let prevTesselations: number = 5;
let timerBegin: number = Date.now(); // Added for HW0

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  // Added for HW0
  cube = new Cube(vec3.fromValues(0,0,0));
  cube.create();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'colorR', 0, 1).step(.1); // Added for HW0
  gui.add(controls, 'colorG', 0, 1).step(.1); // Added for HW0
  gui.add(controls, 'colorB', 0, 1).step(.1); // Added for HW0
  gui.add(controls, 'My Shader'); // Added for HW 0
  gui.add(controls, 'Load Scene');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  // Added for HW0 - my shader
  const myShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/my-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/my-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    if(controls.tesselations != prevTesselations)
    {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }

    // Added for HW0 - additional argument (vec4) to pass the gui slider values to the renderer as the color
    // if the value of the check box for myShader is true, use custom shader
    if(controls["My Shader"] == true){
    renderer.render(camera, myShader, vec4.fromValues(controls.colorR, controls.colorG, controls.colorB, 1), [
      cube, // Added for HW0
    ]);
    myShader.setUTime(Date.now() - timerBegin);
  }
  // if check box is false, use normal lambert shader
  else{
    renderer.render(camera, lambert, vec4.fromValues(controls.colorR, controls.colorG, controls.colorB, 1), [
      //icosphere,
      //square,
      cube, // Added for HW0
    ]);
  }
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();  
}

main();
