import "./UploadDragger.scss"
import { Progress, Upload, UploadFile, UploadProps } from "antd"
import { AiFillCheckCircle, AiFillCloseCircle, AiFillFileAdd } from "react-icons/ai"
import { imageListAtom, showUploadDraggerAtom } from "../../state/editor";
import { useRef, useState } from "react";
import { postImage } from "../../api/api";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { EditorState, IMImage } from "../../model/Types";
import { uuidv4 } from "../../utils/utils";
import { BiX } from "react-icons/bi";
import { Editor } from "../../model/Editor";

const Dragger = Upload.Dragger;

interface IProps {
    allowMultiple?: boolean,
    spacingLeft?: number,
    editor: Editor
}

export default function UploadDragger({allowMultiple = false, spacingLeft = 0, editor}: IProps) {
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const imImageListRef = useRef<IMImage[]>([])
    const imageList = useRecoilValue(imageListAtom)
    const setShowUploadDragger = useSetRecoilState(showUploadDraggerAtom)

    const props: UploadProps = ({
        name: 'file',
        multiple: allowMultiple,
        maxCount: allowMultiple ? Infinity : 1,
        customRequest: async (options) => {
            const { onSuccess, onError, file, onProgress } = options;

            const fmData = new FormData();
            const config = {
            headers: { "content-type": "multipart/form-data" },
            onUploadProgress: (event: ProgressEvent) => {
                const percent = Math.floor((event.loaded / event.total) * 100);
                onProgress && onProgress({ percent });
            }
            };
            fmData.append("file", file);

            try {
                const res = await postImage(fmData,config);
                imImageListRef.current = [...imImageListRef.current, {src: res.data.location, id: uuidv4(), name: res.data.originalname}];
                onSuccess && onSuccess("Ok");
            } catch (err) {
                console.log("Eroor: ", err);
                onError && (onError as any)({ err });
            }
        },
        itemRender: (originNode, file, currFileList, actions) => {
            setFileList(currFileList);
            const percent = file.percent
            const status = file.status as string;
            return (
                <div className={`item ${status === "done" && "success"} ${status === "error" && "error"} ${status === "uploading" && "progress"}`}>
                    <div className="content">
                        <div className="meta">
                            <span>{file.name}</span>
                            {["uploading"].includes(status) && <span>{percent}%</span>}
                            {status === "error" && <AiFillCloseCircle cursor={"pointer"} onClick={() => actions.remove()} size={20}/>}
                            {status === "done" && <AiFillCheckCircle size={20}/>}
                        </div>
                        {["uploading"].includes(status) && <Progress percent={percent} strokeColor={'rgb(66, 72, 255)'} trailColor="white" showInfo={false}/>}
                    </div>
                </div>
            )
        }
    });

    const handleSubmit = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation()
        if(isUploading || !isSuccess) return;
        const editorState: EditorState = allowMultiple ? imImageListRef.current.map(imImage => ({image: imImage, boxes:[]})) : [{image: imImageListRef.current.at(-1) as IMImage, boxes: []}]
        editor.importEditorState(editorState).then(() => {
            editor.loadImage(editor.images[0])
        })
        setShowUploadDragger(false)
    }

    const handleClose = (e:React.MouseEvent<SVGAElement, MouseEvent>) => {
        e.stopPropagation();
        setShowUploadDragger(false);
    }

    const isUploading = fileList.find(file => file.status === 'uploading');
    const isSuccess = fileList.find(file => file.status === "done")

    return (
        <>
            <div className="upload-dragger" style={{width: `calc(100% - ${spacingLeft}px)`, left: spacingLeft}}>
                <div className="container">
                    <Dragger {...props}>
                        <div className={`inner-container ${fileList.length && "mini"}`}>
                            { imageList.length ? <BiX cursor={'pointer'} className="close" size={25} onClick={handleClose}/> : ""}
                            <AiFillFileAdd color="rgb(66, 72, 255)" size={50}/>
                            {allowMultiple ? <span>Select Files to Upload</span> : <span>Select a File to Upload</span>}
                            {allowMultiple ? <p>or Drag and Drop, Copy and Paste Files here</p> : <p>or Drag and Drop, Copy and Pase a File here</p>}
                        </div>
                        {fileList.length ? <div className={`submit`}> <button className={`save  ${(isUploading || !isSuccess) ? 'disable' : ""}`} onClick={handleSubmit} >Submit </button> </div> : <></>}
                    </Dragger>
                </div>
            </div>
        </>
    )
}