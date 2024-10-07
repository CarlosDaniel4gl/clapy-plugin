import { BLUE, GREEN, GREY, ORANGE, RED, YELLOW } from "./colors";

/**
 * Define las propiedades que tiene visualmente un surtidor. Básicamente color e imagen (opcional)
 */
export interface FuellingPointMainStateProps {
  color: string;
  image?: string;
}

/**
 * Define un mapa donde tenemos, para cada estado de surtidor, las propiedades visuales que le corresponden.
 */
export const fuellingPointMainStateColorMap: Map<
  string,
  FuellingPointMainStateProps
> = new Map();

fuellingPointMainStateColorMap.set("UNCONFIGURED", {
  color: ORANGE,
  image: "/assets/fuellingPointMainStateImages/unconfigured.png",
});
fuellingPointMainStateColorMap.set("CLOSED", {
  color: GREY,
  image: "/assets/fuellingPointMainStateImages/closed.png",
});
fuellingPointMainStateColorMap.set("IDLE", {
  color: BLUE,
  image: undefined,
});
fuellingPointMainStateColorMap.set("ERROR", {
  color: RED,
  image: "/assets/fuellingPointMainStateImages/error.png",
});
fuellingPointMainStateColorMap.set("CALLING", {
  color: BLUE,
  image: "/assets/fuellingPointMainStateImages/calling.gif",
});
fuellingPointMainStateColorMap.set("PREAUTHORIZED", {
  color: GREEN,
  image: undefined,
});
fuellingPointMainStateColorMap.set("STARTING", {
  color: BLUE,
  image: "/assets/fuellingPointMainStateImages/starting.gif",
});
fuellingPointMainStateColorMap.set("STARTING_PAUSED", {
  color: BLUE,
  image: "/assets/fuellingPointMainStateImages/error.png",
});
fuellingPointMainStateColorMap.set("STARTING_TERMINATED", {
  color: BLUE,
  image: "/assets/fuellingPointMainStateImages/starting-terminated.png",
});
fuellingPointMainStateColorMap.set("FUELLING", {
  color: BLUE,
  image: "/assets/fuellingPointMainStateImages/fuelling.gif",
});
fuellingPointMainStateColorMap.set("FUELLING_PAUSED", {
  color: BLUE,
  image: "/assets/fuellingPointMainStateImages/error.png",
});
fuellingPointMainStateColorMap.set("FUELLING_TERMINATED", {
  color: BLUE,
  image: "/assets/fuellingPointMainStateImages/fuelling-terminated.png",
});
fuellingPointMainStateColorMap.set("UNAVAILABLE", {
  color: RED,
  image: undefined,
});
fuellingPointMainStateColorMap.set("UNAVAILABLE_AND_CALLING", {
  color: RED,
  image: "/assets/fuellingPointMainStateImages/calling.gif",
});
fuellingPointMainStateColorMap.set("OFFLINE", {
  color: YELLOW,
  image: "/assets/fuellingPointMainStateImages/offline.png",
});

// errorImage=images/surtidor/error/SUR_IMAGEN.png
// unconfiguredImage=images/surtidor/unconfigured/engranaje.png
// closedImage=images/surtidor/closed/candado.png
// fuellingImage=images/surtidor/suministro.gif
// startingImage=images/surtidor/descuelgue/descolgar4.gif
// callingImage=images/surtidor/calling/sur_imagen.gif
// offLineImage=images/surtidor/offline/SUR_IMAGEN.png
// fuellingTerminated=images/surtidor/offline/SUR_IMAGEN-azul.png
// startingTerminated=images/surtidor/offline/SUR_IMAGEN-azuls.png
// suministroImage=images/surtidor/suministro.gif

/**
UNCONFIGURED(false, false),
CLOSED(false, false),
IDLE(false, false),
ERROR(false, false),
CALLING(true, false),
PREAUTHORIZED(false, false),
STARTING(true, false),
STARTING_PAUSED(true, false),
STARTING_TERMINATED(true, false),
FUELLING(false, true),
FUELLING_PAUSED(false, true),
FUELLING_TERMINATED(false, true),
UNAVAILABLE(false, false),
UNAVAILABLE_AND_CALLING(true, false),
OFFLINE(false, false);
 */
