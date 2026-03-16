import NorthWest from "./NW.svg?react";
import NorthCentral from "./NC.svg?react";
import NorthEast from "./NE.svg?react";
import SouthSouth from "./SS.svg?react";
import SouthEast from "./SE.svg?react";
import SouthWest from "./SW.svg?react";
import Unknown from "./Unknown.svg?react";
import { GeoZone } from "@/types/enums";

export const regionImgs = {
    [GeoZone.NorthEast]: NorthEast,
    [GeoZone.NortHCentral]: NorthCentral,
    [GeoZone.NorthWest]: NorthWest,
    [GeoZone.SouthSouth]: SouthSouth,
    [GeoZone.SouthEast]: SouthEast,
    [GeoZone.SouthWest]: SouthWest,
    default: Unknown,
};
