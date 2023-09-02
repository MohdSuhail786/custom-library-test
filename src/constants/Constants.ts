import { entityClassesMaster } from "../SampleEntityClassMaster";
import { EditorState, ProjectSetupSteps as ProjectSetupStepsType } from "../model/Types";

export const ProjectSetupSteps = {
    LEGEND_EXTRACTION: "LEGEND_EXTRACTION" as ProjectSetupStepsType,
    DRAWING_AREA_SELECTION: "DRAWING_AREA_SELECTION" as ProjectSetupStepsType,
    METADATA_EXTRACTION: "METADATA_EXTRACTION" as ProjectSetupStepsType
}


export const nextProjectSetupSetpMap = {
    "LEGEND_EXTRACTION": "DRAWING_AREA_SELECTION" as ProjectSetupStepsType,
    "DRAWING_AREA_SELECTION": "METADATA_EXTRACTION"  as ProjectSetupStepsType,
    "METADATA_EXTRACTION": null
}

export const labelList = {
    [ProjectSetupSteps.LEGEND_EXTRACTION]: entityClassesMaster.map(e => e.pid_entity_class),
    [ProjectSetupSteps.DRAWING_AREA_SELECTION]: ["drawing_area", "non_drawing_area"],
    [ProjectSetupSteps.METADATA_EXTRACTION]: ["title", "project", "document_no.", "address"]
}

export const editorState: EditorState = [
    {
        "image": {
            "id": "1",
            "src": "https://api.escuelajs.co/api/v1/files/f85d.jpg",
            "name": "AKER LEGEND 1"
        },
        "boxes": [
            {
                "x": 100,
                "y": 100,
                "width": 100,
                "height": 100,
                "label": "air_filter"
            },
            {
                "x": 200,
                "y": 200,
                "width": 200,
                "height": 200,
                "label": "air_filter"
            }
        ]
    },
    {
        "image": {
            "id": "2",
            "src": "https://api.escuelajs.co/api/v1/files/b7be.jpg",
            "name": "AKER LEGEND 2 very long name of file sdf"
        },
        "boxes": [
            {
                "x": 300,
                "y": 300,
                "width": 300,
                "height": 300,
                "label": "air_filter"
            },
            {
                "x": 400,
                "y": 400,
                "width": 400,
                "height": 400,
                "label": "air_filter"
            },
            {
                "x": 1579.816586921851,
                "y": 1623.2615629984052,
                "width": 612.4768740031896,
                "height": 650.3620414673046,
                "label": "air_filter"
            },
            {
                "x": 1430.6926025725238,
                "y": 582.7526946276369,
                "width": 70.4111305479039,
                "height": 53.37617960889486,
                "label": "ball_valve"
            }
        ]
    }
]