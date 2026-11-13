import type { RefObject } from "react";

import { messages } from "#/components/SolarSystem/messages";

import type { SceneState } from "../../types";
import { VoyagerProbe } from "./components/VoyagerProbe";
import { VOYAGER_COURSES } from "./utils/voyagerCourse";

interface VoyagersProps {
  // Step back with the rest of the system.
  isFaded: boolean;
  sceneStateRef: RefObject<SceneState>;
}

export function Voyagers({ isFaded, sceneStateRef }: VoyagersProps) {
  return VOYAGER_COURSES.map((course) => (
    <VoyagerProbe
      key={course.id}
      course={course}
      name={messages.voyagers[course.id]}
      isFaded={isFaded}
      sceneStateRef={sceneStateRef}
    />
  ));
}
