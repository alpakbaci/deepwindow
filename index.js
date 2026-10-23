// hero: the tunnel's vanishing point follows the pointer (an off-axis view in pure CSS);
// with no pointer around it drifts on its own so the depth still reads
const stage = document.getElementById('stage');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
let tx = 0, ty = 0, x = 0, y = 0, lastMove = -1e9;
addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; lastMove = performance.now();
});
function tick(now){
  if (now - lastMove > 2500){ tx = Math.sin(now / 2600) * 0.6; ty = Math.sin(now / 3900) * 0.3; }
  x += (tx - x) * 0.06; y += (ty - y) * 0.06;
  stage.style.setProperty('--ex', x.toFixed(4)); stage.style.setProperty('--ey', y.toFixed(4));
  requestAnimationFrame(tick);
}
if (!still) requestAnimationFrame(tick);
