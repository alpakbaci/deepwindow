# Deep Window

**Turn any photo into a window.** Drop in a picture, turn on your webcam, and your screen behaves like a pane of glass with the scene sitting just behind it. Move your head and you look *into* the photo.

<!-- Demo GIF goes here: ![Deep Window demo](media/demo.gif) -->

**[Try it live → alpakbaci.github.io/deepwindow](https://alpakbaci.github.io/deepwindow/)** · best on a laptop or desktop with a webcam, in Chrome or Edge

- **Your own photos.** Not a prepared 3D scene: any picture you load becomes a window, in a few seconds. Got a 3D model or a Gaussian splat instead? Drop a `.glb` or `.spz` and walk through it.
- **Private by design.** Everything runs in your browser. Your photo and camera feed never leave your computer. No server, no sign-up, no build step.
- **Physically based head tracking.** Your eye position is measured in centimetres, so the parallax lines up with how a real window would move.

## How it works

1. **Depth from a single photo.** [Depth Anything V2 (Small)](https://huggingface.co/onnx-community/depth-anything-v2-small) runs in the browser through [Transformers.js](https://huggingface.co/docs/transformers.js) (WebGPU, with a WASM fallback). Its relative disparity is mapped to distance with an inverse curve, and the photo is displaced into a 3D mesh.
2. **Where are your eyes?** [MediaPipe Face Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) finds your irises. The human iris is about 11.7 mm across for nearly everyone, so `distance = focal_px × 11.7 mm / iris_px`. Together with your screen size this gives your eye position relative to the screen, in real units. A [1€ filter](https://gery.casiez.net/1euro/) smooths it, with a little forward prediction to hide latency.
3. **Screen = glass.** Each frame is rendered with an off-axis (asymmetric frustum) projection: the screen rectangle stays fixed and the view frustum leans toward your eye. The photo sits *behind* the glass and overflows the frame, so the screen edge hides and reveals parts of the scene as you move. An optional grid tunnel gives the eye a perfectly rigid depth reference.

Without a webcam, you can look around with your mouse.

## 3D models (.glb)

Prefer real 3D? You can also load a **.glb** model: use "Open file" or drop it onto the page. It never leaves your computer either. To see it right away, open one of the two samples from the gallery:

- **Littlest Tokyo**, an animated diorama by [Glen Fox](https://artstation.com/artwork/1AGwX) (CC BY): `app.html?model=littlest-tokyo`
- **Türk Bakkalı**, an Istanbul corner shop by [PickleGork](https://sketchfab.com/3d-models/turk-bakkal-turkish-grocery-store-diorama-72cc6e44eb7848b68cec4a90d790bec6) (CC BY 4.0): `app.html?model=turk-bakkal`

There are three ways to show a model, switchable in the panel:

- **Object:** fits inside the window, its front at the glass, slowly turning.
- **Diorama:** the model's front face fills the screen edge to edge, so the walls of a box-shaped scene (an isometric room, a garden niche) line up with the edges of your screen, as if the box were really behind the glass. Refitted when you go full screen.
- **Walk-through:** life size, explored with the keyboard.

The app picks Object or Walk-through from the model's size, assuming it is in metres. If a model opens the wrong way (a tiny diorama exported in centimetres can look like a giant city), just switch.

- **Objects** (anything under about 4 m across) are scaled to sit just behind the glass. Drag to turn them, or let them spin.
- **Rooms and landscapes** (bigger than that) open at **life size**: one metre in the model is one metre behind your screen. Walk through them with the keyboard (this works in every view):

| Key | Action |
|---|---|
| `W` `A` `S` `D` / `↑` `↓` | Move |
| `←` `→` or drag | Turn |
| `Q` / `E` | Down / up |
| `Shift` | Move faster |
| `R` | Back to the start |
| `H` | Hide or show the controls (any mode) |

Draco, meshopt and KTX2 compressed files are supported, and embedded animations play automatically. Files up to **100 MB** are accepted; larger ones are refused, because their textures can take gigabytes of GPU memory. Use a single `.glb` file; a `.gltf` that points to separate texture and `.bin` files can't be loaded from one file. Free models: [Poly Haven](https://polyhaven.com/models) (CC0), [Sketchfab](https://sketchfab.com/features/gltf) (check each model's license).

## Splats (.spz)

Gaussian splats are photoreal 3D captures, made by phone scanning apps (Scaniverse, Polycam, Luma) or generators such as World Labs' Marble. Deep Window opens them with [Spark](https://sparkjs.dev), World Labs' open-source splat renderer, in the same Object / Diorama / Walk-through views and with the same keyboard controls as `.glb` models.

- **Only `.spz` is accepted.** It is about 10× smaller than `.ply`, and most `.ply` scenes are far over the size limit. Other splat formats (`.ply`, `.splat`, `.ksplat`, `.sog`) are refused with a message asking for `.spz`. Scaniverse exports `.spz` directly; other files can be converted with Niantic's open-source [spz](https://github.com/nianticlabs/spz) tools.
- **Up to 100 MB**, like models.
- **Upside down?** Most `.spz` files are saved with camera-style axes (y pointing down), so they are turned the right way up by default. If yours comes in upside down, press **Flip upside down** in the panel.
- Spark loads only when the first splat is opened, so photos and models never download it.

## Run it locally

No install is needed to use it: just open the [live demo](https://alpakbaci.github.io/deepwindow/). To run your own copy, any static file server works. The page must be served over `http://localhost` or HTTPS for the camera to work, so opening the file directly (`file://`) won't do.

```bash
git clone https://github.com/alpakbaci/deepwindow.git
cd deepwindow
python3 -m http.server 8000
```

Then open <http://localhost:8000>. On first use the depth model (tens of MB) downloads once and is cached by the browser.

## Tips for the strongest effect

- Go **full screen** and set your screen size under the camera controls. **Turn off camera** stops the webcam at any time, and **H** hides the controls for a clean view.
- **Close one eye.** With both eyes open, stereo vision tells your brain the screen is flat.
- Pick photos with **clear depth**: corridors, streets, a room seen through a doorway. Flat subjects shot from above don't work well.
- Chrome or Edge recommended (WebGPU). Other browsers fall back to slower CPU inference.

## Limitations

A single photo has no information about what is behind objects. Move your head far enough and you will see the depth surface stretch at object edges. The effect is tuned to look right within normal head movement in front of a laptop or monitor. Phones are not supported yet. Splats need WebGL2 and a reasonably recent GPU; very large scenes may stutter on integrated graphics.

## What loads from the internet

Your photos, models, splats and camera feed never leave your computer. To run, the page downloads its code and the AI models from public servers, each at a pinned version. Everything below is cached by the browser after the first visit. Those servers see an ordinary request (your IP address and browser), like any website. Deep Window itself has no server, no analytics and no cookies. Fonts are served from this repository, so no font service is contacted.

| What | From | When | Size | License |
|---|---|---|---|---|
| [three.js](https://threejs.org/) 0.186.1 | jsDelivr | every page | 2.1 MB | MIT |
| [Transformers.js](https://github.com/huggingface/transformers.js) 3.7.6, with its [ONNX Runtime Web](https://github.com/microsoft/onnxruntime) engine | jsDelivr | when a photo opens | 0.9 MB + 21 MB engine | Apache 2.0 / MIT |
| [Depth Anything V2 Small](https://huggingface.co/onnx-community/depth-anything-v2-small) (ONNX, revision `4472b73`) | Hugging Face | first photo, then cached | 49.6 MB (fp16, WebGPU) or 27.3 MB (q8, CPU) | Apache 2.0 |
| [MediaPipe Tasks Vision](https://github.com/google-ai-edge/mediapipe) 0.10.21 and its WebAssembly runtime | jsDelivr | when the camera is turned on | 9.7 MB | Apache 2.0 |
| [Face Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) model (`face_landmarker.task`, float16, v1) | Google Cloud Storage (`storage.googleapis.com/mediapipe-models`) | when the camera is turned on | 3.6 MB | Apache 2.0, per Google's [Face Mesh V2 model card](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker#models) |
| three.js GLTFLoader with the Draco, Basis Universal (KTX2) and meshoptimizer decoders | jsDelivr | when a `.glb` opens; decoders only if the file needs them | under 1 MB | MIT / Apache 2.0 |
| [Spark](https://github.com/sparkjsdev/spark) 2.3.1 | jsDelivr | when a `.spz` opens | 2.8 MB | MIT |

The depth model and the face model run on your device: the photo and the video frames are processed locally and are never uploaded.

## Repository layout

```
index.html, index.css, index.js   landing page
app.html, app.css, app.js         the app
favicon.svg, og.jpg               logo and link-preview image
fonts/                            self-hosted fonts and their licenses (SIL OFL 1.1)
samples/                          sample photos, the sample 3D models, gallery images, CREDITS.md
```

## Built with

| | License |
|---|---|
| [three.js](https://threejs.org/) 0.186 | MIT |
| [Transformers.js](https://github.com/huggingface/transformers.js) 3.7 | Apache 2.0 |
| [Depth Anything V2 Small](https://huggingface.co/onnx-community/depth-anything-v2-small) | Apache 2.0 |
| [MediaPipe Tasks Vision](https://github.com/google-ai-edge/mediapipe) 0.10 | Apache 2.0 |
| [MediaPipe Face Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) model (Face Mesh V2) | Apache 2.0 |
| [Spark](https://github.com/sparkjsdev/spark) 2.3 | MIT |
| [Fraunces](https://github.com/undercasetype/Fraunces), [IBM Plex Sans and Mono](https://github.com/IBM/plex) (fonts, self-hosted) | SIL OFL 1.1 |

See [What loads from the internet](#what-loads-from-the-internet) for where each library and model comes from. Sample photos are CC0 from Wikimedia Commons; the sample models are Littlest Tokyo by Glen Fox (CC BY) and Türk Bakkalı by PickleGork (CC BY 4.0, compressed for the web). See [samples/CREDITS.md](samples/CREDITS.md).

Inspired by Johnny Chung Lee's [Wii Remote head tracking](https://www.youtube.com/watch?v=Jd3-eiid-Uw) (2007) and the World Labs [off-axis projection demo](https://www.worldlabs.ai/labs/showcase/off-axis).

## License

[MIT](LICENSE) © 2026 Alp Akbacı
