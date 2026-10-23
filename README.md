# Deep Window

**Turn any photo into a window.** Drop in a picture, turn on your webcam, and your screen behaves like a pane of glass with the scene sitting just behind it. Move your head and you look *into* the photo.

<!-- Demo GIF goes here: ![Deep Window demo](media/demo.gif) -->

**[Try it live →](https://alpakbaci.github.io/deepwindow/)**

- **Your own photos.** Not a prepared 3D scene: any picture you load becomes a window, in a few seconds. Got a 3D model instead? Drop a `.glb` and walk through it.
- **Private by design.** Everything runs in your browser. Your photo and camera feed never leave your computer. No server, no sign-up, no build step.
- **Physically based head tracking.** Your eye position is measured in centimetres, so the parallax lines up with how a real window would move.

## How it works

1. **Depth from a single photo.** [Depth Anything V2 (Small)](https://huggingface.co/onnx-community/depth-anything-v2-small) runs in the browser through [Transformers.js](https://huggingface.co/docs/transformers.js) (WebGPU, with a WASM fallback). Its relative disparity is mapped to distance with an inverse curve, and the photo is displaced into a 3D mesh.
2. **Where are your eyes?** [MediaPipe Face Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) finds your irises. The human iris is about 11.7 mm across for nearly everyone, so `distance = focal_px × 11.7 mm / iris_px`. Together with your screen size this gives your eye position relative to the screen, in real units. A [1€ filter](https://gery.casiez.net/1euro/) smooths it, with a little forward prediction to hide latency.
3. **Screen = glass.** Each frame is rendered with an off-axis (asymmetric frustum) projection: the screen rectangle stays fixed and the view frustum leans toward your eye. The photo sits *behind* the glass and overflows the frame, so the screen edge hides and reveals parts of the scene as you move. An optional grid tunnel gives the eye a perfectly rigid depth reference.

Without a webcam, you can look around with your mouse.

## 3D models (.glb)

Prefer real 3D? You can also load a **.glb** model: use "Open file" or drop it onto the page. It never leaves your computer either. To see it right away, open the **Littlest Tokyo** sample (an animated diorama by Glen Fox, CC BY) from the gallery, or go straight to `app.html?model=littlest-tokyo`.

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

Draco, meshopt and KTX2 compressed files are supported, and embedded animations play automatically. Files up to **100 MB** are accepted; larger ones are refused, because their textures can take gigabytes of GPU memory. Use a single `.glb` file; a `.gltf` that points to separate texture and `.bin` files can't be loaded from one file. Free models: [Poly Haven](https://polyhaven.com/models) (CC0), [Sketchfab](https://sketchfab.com/features/gltf) (check each model's license).

## Run it locally

Any static file server works. The page must be served over `http://localhost` or HTTPS for the camera to work, so opening the file directly (`file://`) won't do.

```bash
git clone https://github.com/alpakbaci/deepwindow.git
cd deepwindow
python3 -m http.server 8000
```

Then open <http://localhost:8000>. On first use the depth model (tens of MB) downloads once and is cached by the browser.

## Tips for the strongest effect

- Go **full screen** and set your screen size under the camera controls.
- **Close one eye.** With both eyes open, stereo vision tells your brain the screen is flat.
- Pick photos with **clear depth**: corridors, streets, a room seen through a doorway. Flat subjects shot from above don't work well.
- Chrome or Edge recommended (WebGPU). Other browsers fall back to slower CPU inference.

## Limitations

A single photo has no information about what is behind objects. Move your head far enough and you will see the depth surface stretch at object edges. The effect is tuned to look right within normal head movement in front of a laptop or monitor. Phones are not supported yet.

## Built with

| | License |
|---|---|
| [three.js](https://threejs.org/) 0.186 | MIT |
| [Transformers.js](https://github.com/huggingface/transformers.js) 3.7 | Apache 2.0 |
| [Depth Anything V2 Small](https://huggingface.co/onnx-community/depth-anything-v2-small) | Apache 2.0 |
| [MediaPipe Tasks Vision](https://github.com/google-ai-edge/mediapipe) 0.10 | Apache 2.0 |

3D models load through three.js's GLTFLoader, with the Draco (Apache 2.0), Basis Universal (Apache 2.0) and meshoptimizer (MIT) decoders that ship with three.js. Libraries and models load from public CDNs at pinned versions. Sample photos are CC0 from Wikimedia Commons; the sample model is Littlest Tokyo by Glen Fox (CC BY). See [samples/CREDITS.md](samples/CREDITS.md).

Inspired by Johnny Chung Lee's [Wii Remote head tracking](https://www.youtube.com/watch?v=Jd3-eiid-Uw) (2007) and the World Labs [off-axis projection demo](https://www.worldlabs.ai/labs/showcase/off-axis).

## License

[MIT](LICENSE) © 2026 Alp Akbacı
