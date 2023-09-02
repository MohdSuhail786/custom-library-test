import "./Toolbar.scss";
import { MdOutlineFitScreen } from 'react-icons/md';
import { BsBoundingBox, BsBrightnessHigh } from 'react-icons/bs';
import { LiaHandPaperSolid, LiaRedoAltSolid, LiaUndoAltSolid } from 'react-icons/lia';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { useRecoilValue } from "recoil";
import { appModeAtom } from "../../state/editor";
import { Editor } from "../../model/Editor";
import { AppMode } from "../../model/Types";

interface IProps {
    editor: Editor
}

export default function Toolbar({editor}: IProps) {

    const appMode = useRecoilValue(appModeAtom);

    const setMode = (mode: AppMode) => () => {
        if(!editor || appMode.mode === "EDIT_MODE") return;
        editor.setMode(mode)
    }

    const zoomInOut = (deltaY: number) => () => {
        if(!editor) return;
        const centerPos = { x: (editor.width() - 300) / 2 + 300, y: (editor.height() - 55) / 2 + 55 }
        editor.zoomInOutStage({ deltaY, preventDefault: () => {}, ctrlKey: true } as WheelEvent, centerPos, centerPos)
    }

    if(!editor) return <></>;

    return (
        <>
            <div className="toolbar">
                <div className={`item ${appMode.mode === 'DRAG_SELECTION_MODE' && "active"}`} onClick={setMode({mode: "DRAG_SELECTION_MODE"})}><LiaHandPaperSolid /></div>
                <div className={`item ${appMode.mode === 'DRAWING_MODE' && "active"}`} onClick={setMode({mode: "DRAWING_MODE"})}><BsBoundingBox /></div>
                <div className="divider" />
                <div className="item" onClick={zoomInOut(0)}><AiOutlinePlus /></div>
                <div className="item" onClick={() => editor.fitToScreen()}><MdOutlineFitScreen /></div>
                <div className="item" onClick={zoomInOut(1)}><AiOutlineMinus /></div>
                <div className="divider" />
                <div className="item" onClick={() => editor.activeImage?.actionStore.undo().catch((e) => console.log(e))}><LiaUndoAltSolid /></div>
                <div className="item" onClick={() => editor.activeImage?.actionStore.redo().catch((e) => console.log(e))}><LiaRedoAltSolid /></div>
                <div className="divider" />
                <div className="item"><BsBrightnessHigh /></div>
            </div>
        </>
    )
}