import { atom } from "recoil";
import { Box } from "../model/Box";
import { AppMode, LoaderSpinner } from "../model/Types";
import { Image } from "../model/Image";

export const boxListAtom = atom<Box[]>({
    key: 'boxListAtom',
    default: [],
})

export const appModeAtom = atom<AppMode>({
    key: 'appModeAtom',
    default: {
        mode: "DRAWING_MODE"
    }
})

export const loaderAtom = atom<LoaderSpinner>({
    key: 'loaderAtom',
    default: {
        visible: false,
    }
})

export const showUploadDraggerAtom = atom<boolean>({
    key: 'showUploadDraggerAtom',
    default: false
})

export const activeImageAtom = atom<Image | null>({
    key: 'activeImage',
    default: null,
})

export const imageListAtom = atom<Image[]>({
    key: 'imageListAtom',
    default: [],
})