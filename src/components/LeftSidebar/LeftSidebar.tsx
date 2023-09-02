import { useRecoilState, useRecoilValue } from "recoil"
import "./LeftSidebar.scss"
import { activeImageAtom, imageListAtom, showUploadDraggerAtom } from "../../state/editor"
import { useEffect, useState } from "react"
import { Editor } from "../../model/Editor"
import CircularCheckbox from "../CircularCheckbox/CircularCheckbox"
import { Image } from "../../model/Image"

interface IProps {
    editor: Editor
}

export default function LeftSidebar({editor}: IProps) {
    const imageList = useRecoilValue(imageListAtom)
    const [showUploadDragger, setShowUploadDragger] = useRecoilState(showUploadDraggerAtom)
    const [searchKey, setSearchKey] = useState("")
    const activeImage = useRecoilValue(activeImageAtom)
    
    const loadImage = (image: Image) => () => {
        editor.loadImage(image)
    }
    console.log(imageList,"***")
    const filteredImages = imageList.filter(image => image.name().includes(searchKey));

    return (
        <>
        <div className="left-side-bar">
            <span className="heading">Files</span>
            <div className="input-group">
                <svg className="icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
                <input placeholder="Search File" value={searchKey} onChange={e=>setSearchKey(e.target.value)} type="search" className="input" autoFocus/>
            </div>
            <div className="button-group">
                <button className={`search`} onClick={() => setShowUploadDragger(!showUploadDragger)}>{showUploadDragger && imageList.length !== 0 ? "Close" : "Upload"} </button>
            </div>
            <div className="converted-images-container">
                <div className="item heading">
                    <div><CircularCheckbox size={17} /></div>
                    <span>Image</span>
                    <span>Name</span>
                </div>
                {
                    filteredImages.map(image => (
                        <>
                            <div className={`item ${activeImage?.id() === image.id() ? "active" :""}`} onClick={loadImage(image)}>
                                <div><CircularCheckbox checked={activeImage?.id() === image.id()} size={15} /></div>
                                <img src={image.src} width={50} height={40} />
                                <span>{image.name()}</span>
                            </div>
                        </>
                    ))
                }
                {
                    filteredImages.length === 0 ? (
                        <div className="no-item">
                            No Items
                        </div>
                    ) : ""
                }
            </div>
        </div>
        </>
    )
}