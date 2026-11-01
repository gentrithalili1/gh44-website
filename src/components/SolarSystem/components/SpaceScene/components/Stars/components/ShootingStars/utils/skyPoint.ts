import { type Camera, Matrix4, Vector3 } from "three";

// How the camera saw the sky when a meteor launched: from screen to world, where the camera was,
// and from world into the turning sky's own frame.
export type SkyView = { screenToWorld: Matrix4; origin: Vector3; worldToSky: Matrix4 };

export function createSkyView(): SkyView {
  return { screenToWorld: new Matrix4(), origin: new Vector3(), worldToSky: new Matrix4() };
}

type SetSkyViewParams = { view: SkyView; camera: Camera; skyMatrixWorld: Matrix4 };

// Records the camera and the sky's turn now, in place.
export function setSkyView({ view, camera, skyMatrixWorld }: SetSkyViewParams) {
  view.screenToWorld.multiplyMatrices(camera.matrixWorld, camera.projectionMatrixInverse);
  view.origin.setFromMatrixPosition(camera.matrixWorld);
  view.worldToSky.copy(skyMatrixWorld).invert();
}

type ToSkyPointParams = {
  // Pixels from the top left of the screen at launch.
  x: number;
  y: number;
  viewport: { width: number; height: number };
  view: SkyView;
  // How far out the star shell is.
  distance: number;
  // Written in place, so a frame allocates nothing.
  target?: Vector3;
};

// A point of a meteor drawn in screen pixels at launch, moved out onto the star shell along the
// camera's line of sight, in the sky's frame: it stays in the sky as the camera turns, and turns
// with the sky.
export function toSkyPoint({
  x,
  y,
  viewport,
  view,
  distance,
  target = new Vector3(),
}: ToSkyPointParams) {
  return target
    .set((x / viewport.width) * 2 - 1, 1 - (y / viewport.height) * 2, 0.5)
    .applyMatrix4(view.screenToWorld)
    .sub(view.origin)
    .normalize()
    .multiplyScalar(distance)
    .add(view.origin)
    .applyMatrix4(view.worldToSky);
}
