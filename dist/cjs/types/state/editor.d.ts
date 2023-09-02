import { Box } from "../model/Box";
import { AppMode, LoaderSpinner } from "../model/Types";
import { Image } from "../model/Image";
export declare const boxListAtom: import("recoil").RecoilState<Box<import("../model/Box").GroupConfig>[]>;
export declare const appModeAtom: import("recoil").RecoilState<AppMode>;
export declare const loaderAtom: import("recoil").RecoilState<LoaderSpinner>;
export declare const showUploadDraggerAtom: import("recoil").RecoilState<boolean>;
export declare const activeImageAtom: import("recoil").RecoilState<Image<import("../model/Image").ImageConfig> | null>;
export declare const imageListAtom: import("recoil").RecoilState<Image<import("../model/Image").ImageConfig>[]>;
