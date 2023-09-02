import { Box } from "./Box"

export type AppMode = ( {
    mode: "DRAG_SELECTION_MODE" | "DRAWING_MODE",
} | {
    mode: "EDIT_MODE",
    boxInEditMode: Box,
    visible: boolean
})

export type ProjectSetupSteps = "LEGEND_EXTRACTION" | "DRAWING_AREA_SELECTION" | "METADATA_EXTRACTION"

export type LoaderSpinner = (
    {
        visible: true,
        title: string
    } | {
        visible: false
    }
)

export type IMBox = {
    x: number,
    y: number,
    width: number, 
    height: number,
    label: string
}

export type IMImage = {
    src: string,
    id: string,
    name: string
}

export type IMState = {
    image: IMImage,
    boxes: IMBox[]
}

export type EditorState = IMState[]