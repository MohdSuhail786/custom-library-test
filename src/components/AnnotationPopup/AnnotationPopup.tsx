import { useRecoilValue } from "recoil"
import "./AnnotationPopup.scss"
import {BiX} from "react-icons/bi"
import { appModeAtom } from "../../state/editor";
import { RemoveBoxAction } from "../../actions/RemoveBoxAction";
import { Editor } from "../../model/Editor";
import { IoMdReturnLeft } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { Vector2d } from "konva/lib/types";
import { ProjectSetupSteps as ProjectSetupStepsType } from "../../model/Types";
import { ProjectSetupSteps } from "../../constants/Constants";
import ActionsStore from "../../actions/ActionStore";

const padding = 10;
const modalWidthHeight = 320;

interface IProps {
    editor: Editor
    labelList: string[]
    matchEmptyString?: boolean
    allowCustomLabels?: boolean
}

export default function AnnotationPopup({editor,labelList, matchEmptyString = false, allowCustomLabels = false}: IProps) {
    const appMode = useRecoilValue(appModeAtom)
    const [labelSearch, setLabelSearch] = useState({key:"", allowFilter: true})
    const [position, setPosition] = useState<Vector2d | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<number | null>(null)
    const [matchLables, setMatchLables] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef<HTMLSpanElement>(null);
    
    useEffect(()=>{
        if(!labelSearch.allowFilter) return;
        const matchClasses = ((labelSearch.key) === "" && !matchEmptyString) ? [] : labelList.filter(label => (textToHumanReadable(label || "")).includes(labelSearch.key.toUpperCase()));
        setMatchLables(matchClasses);
        setSelectedLabel(matchClasses.length ? 0 : null)
    },[labelSearch])

    useEffect(()=>{
        if(!appMode || appMode.mode !== "EDIT_MODE") return;
        if(!appMode.visible) {
            setPosition(null);
            return;
        }
        const boxPosition = appMode.boxInEditMode.getClientRect();
        const boxWidth = appMode.boxInEditMode.getClientRect().width + padding;
    
        const x = boxPosition.x + boxWidth + modalWidthHeight > window.innerWidth ? boxPosition.x - modalWidthHeight : boxPosition.x + boxWidth
        const y = (boxPosition.y + modalWidthHeight) > window.innerHeight ? boxPosition.y - ((boxPosition.y + modalWidthHeight) - window.innerHeight) : boxPosition.y;
        setPosition({x,y})
    },[appMode])

    useEffect(()=>{
        if(appMode.mode === "EDIT_MODE" && inputRef.current) {
            setLabelSearch({key: textToHumanReadable(appMode.boxInEditMode.label), allowFilter: false});
            inputRef.current.select();
        }
    },[appMode])

    const updateLabel = (label: string) => {
        if(appMode.mode !== "EDIT_MODE") return;
        appMode.boxInEditMode.updateLabel(label);
        handleClose();
    }

    useEffect(()=>{
        function keyDownEventHandler(event: KeyboardEvent) {
            if(!inputRef.current) return;
            inputRef.current.focus();
            if(event.key === 'Enter') {
                handleSave()
            } else if(event.key === "ArrowDown" && selectedLabel!== null) {
                event.preventDefault();
                const newSelectedLabel = (selectedLabel + 1) % matchLables.length
                setSelectedLabel(newSelectedLabel);
                setLabelSearch({key: textToHumanReadable(matchLables[newSelectedLabel]), allowFilter: false});
            } else if(event.key === "ArrowUp" && selectedLabel!== null) {
                event.preventDefault();
                const newSelectedLabel = selectedLabel === 0 ? matchLables.length - 1 : selectedLabel - 1
                setSelectedLabel(newSelectedLabel);
                setLabelSearch({key: textToHumanReadable(matchLables[newSelectedLabel]), allowFilter: false});
            } else if(event.key === 'Escape') {
                handleClose();
            }
        }
        document.addEventListener('keydown', keyDownEventHandler);
        return () => document.removeEventListener('keydown', keyDownEventHandler);
    }, [appMode, selectedLabel, matchLables])

    const scrollElementIntoViewWithinDiv = (element:Element, div:Element) => {
        const rect = element.getBoundingClientRect();
        const divRect = div.getBoundingClientRect();
        if (
          rect.top < divRect.top ||
          rect.bottom > divRect.bottom
        ) {
          element.scrollIntoView({
            block: 'nearest'
          });
        }
    }

    useEffect(()=>{
        if(selectedLabel === null) return;
        const span = activeRef.current;
        const parent = listRef.current
        if(!span || !parent) return;
        scrollElementIntoViewWithinDiv(span,parent);
    }, [selectedLabel])

    const textToHumanReadable = (text: string): string => {
        return text.replaceAll("_"," ").toUpperCase()
    }

    if(appMode.mode !== 'EDIT_MODE' || !editor) return <></>
    
    const handleClose = () => {
        editor.setMode({mode: "DRAWING_MODE"})
        setLabelSearch({key: '', allowFilter: true})
        setSelectedLabel(null)
        setPosition(null)
    }
    
    const handleDelete = async() => {
        await new RemoveBoxAction({box: appMode.boxInEditMode, actionsStore: appMode.boxInEditMode.image?.actionStore as ActionsStore}).directExecute();
        handleClose()
    }

    const handleSave = () => {
        if(allowCustomLabels) {
           updateLabel(labelSearch.key) 
        } else {
            selectedLabel !== null && updateLabel(matchLables[selectedLabel])
        }
    }
    
    return (
        <>
            <div className="annotation-popup" style={position ? {top: position.y, left: position.x} : {display: 'none'}}>
                <div className="header">
                    <span>Annotation Editor</span>
                    <BiX cursor={'pointer'} size={22} onClick={handleClose}/>
                </div>
                <div className="content-container">
                    <div className="input-group">
                        <svg className="icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
                        <input ref={inputRef} placeholder="Label" value={labelSearch.key} onChange={(e) => setLabelSearch({key:e.target.value,allowFilter:true})} type="text" className="input" autoFocus/>
                    </div>
                    <div className="button-group">
                        <button className="delete" onClick={handleDelete}>Delete</button>
                        <button className="save" onClick={handleSave}>Save <IoMdReturnLeft size={18} /></button>
                    </div>
                    <div className="divider" />
                    <div className="list-options" ref={listRef}>
                        {
                            matchLables.length !== 0 ? (
                                <>
                                    {
                                        matchLables.map((label:string,index:number) => (
                                            <>
                                                <span ref={(()=>selectedLabel === index ? activeRef : null)()} key={`${label}_${index}`} onClick={() => {setSelectedLabel(index); updateLabel(label);}} className={`${selectedLabel === index ? "active" : ""}`}>{textToHumanReadable(label)}</span>
                                            </>
                                        ))
                                    }
                                </>
                            ) : (
                                <>
                                    {!allowCustomLabels ? <p>{labelSearch.key === "" ? "Type a lable for this box." : "Try using different search key."}</p> : <>
                                        <p style={{cursor:"pointer"}} onClick={handleSave}>Create a new label "{labelSearch.key}" </p>
                                    </>}
                                </>
                            )
                        }
                    </div>
                </div>
            </div>
        </>
    )
}