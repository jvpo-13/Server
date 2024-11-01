let enhancer = null;
(async () => {
    enhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance();
    document.getElementById("enhancerUIContainer").appendChild(enhancer.getUIElement());
    await enhancer.open(true);
})();

/*
import {VideoCapture} from 'camera-capture'
const c = new VideoCapture()
c.addFrameListener(frame => {  
  // frame by default is unencoded raw Image Data `{width: 480, height: 320, data: UIntArray}``
  // which is often what image processing / surfaces interfaces expect for fast processing. 
  // Use `mime` option to receive it in other formats (see examples below)
  surface.putImageData(0,0,frame.width, frame.height, frame.data)
})
// pause / resume frame emission (without tunning off the camera)
setTimeout(()=>c.pause(), 1000)
setTimeout(()=>c.resume(), 2000)
// shutdown everything, including, camera, browser, server:
setTimeout(()=>c.stop(), 3000)
console.log('Capturing camera');
await c.start() // promise will be resolved only when `stop`
console.log('Stopping camera capture');*/