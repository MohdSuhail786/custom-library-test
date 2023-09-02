import { useRecoilState, useRecoilValue } from "recoil";
import "./TopActionBar.scss";
import { activeImageAtom } from "../../state/editor";
import { BsArrowRight, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { ProjectSetupSteps } from "../../model/Types";
import { Editor } from "../../model/Editor";


interface IProps {
    editor: Editor,
    step: ProjectSetupSteps,
    onContinue: () => void
    onSave: () => Promise<void>
}

export default function TopActionBar({editor, step, onContinue, onSave}: IProps) {

    const activeImage = useRecoilValue(activeImageAtom)

    const handlePagination = (action: "prev" | "next") => () => {
        if(!activeImage) return;
        const currentIndex = editor.images.findIndex(image => image.id() === activeImage.id());
        let image = null;
        if(action === "prev") image = editor.images[(currentIndex - 1 + editor.images.length) % editor.images.length];
        else if(action === "next") image = editor.images[(currentIndex + 1) % editor.images.length]
        console.log(image, "MAGE")
        if(image) {
            editor.loadImage(image)
        }
    }

    const handleContinue = async () => {
        await onSave();
        onContinue();
    }

    const heading = step.split("_").join(" ")

    return (
        <>
            <div className="top-action-bar">
                <span className="heading">{heading}</span>
                <div className="pagination">
                    {
                        activeImage?.name() ? (
                            <>
                                <BsChevronLeft cursor={"pointer"} onClick={handlePagination("prev")}/>
                                {activeImage.name().length > 25 ? activeImage.name().slice(0,23) + "..." : activeImage.name()}
                                <BsChevronRight cursor={"pointer"} onClick={handlePagination("next")}/>        
                            </>
                        ) : ""
                    }
                </div>
                <div className="button-group">
                    <button className={`outline`} onClick={onSave}>Save </button>
                    <button className={`primary`} onClick={handleContinue}>Continue <BsArrowRight style={{ fontWeight: 700 }} /> </button>
                </div>
            </div>
        </>
    )
}