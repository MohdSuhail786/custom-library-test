import { useEffect, useState } from "react";
import { Editor } from "../model/Editor";
import { useRecoilState, useSetRecoilState } from "recoil";
import { activeImageAtom, imageListAtom, loaderAtom, showUploadDraggerAtom } from "../state/editor";
import UploadDragger from "../components/UploadDragger/UploadDragger";
import TopActionBar from "../components/TopActionBar/TopActionBar";
import AnnotationPopup from "../components/AnnotationPopup/AnnotationPopup";
import Toolbar from "../components/Toolbar/Toolbar";
import ImageLoader from "../components/Loader/ImageLoader";
import { ProjectSetupSteps, editorState, labelList } from "../constants/Constants";

interface IProps {
  onContinue: () => void
}

export default function DrawingAreaSelection({onContinue}: IProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showUploadDragger, setShowUploadDragger] = useRecoilState(showUploadDraggerAtom)
  const setLoader = useSetRecoilState(loaderAtom)
  const setImageList = useSetRecoilState(imageListAtom)
  const setActiveImage = useSetRecoilState(activeImageAtom)

  useEffect(()=>{
    (async()=>{
      const editor = new Editor({
        container: 'drawing-area-editor',
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      setEditor(editor);

      (window as any).editor = editor;
    })()
  },[])

  useEffect(()=>{
    async function initEditor() {
      if(!editor) return;
      editor.container().focus()
      setShowUploadDragger(false);
      setLoader({visible: true, title: "Loading editor..."})
      await new Promise(resolve => setTimeout(resolve, 2000))
      await editor.importEditorState([editorState[1]])
      if(editor.images.length === 0) {
        setShowUploadDragger(true)
      }
      setLoader({visible: false})
    }
    initEditor()
  },[editor])

  const handleContinue = () => {
    setImageList([]);
    setShowUploadDragger(true);
    setActiveImage(null)
    editor?.removeActiveImage();
    editor?.destructor()
    onContinue()
  }

  const handleSave = async () => {
    try {
      setLoader({visible: true, title: "Saving current state..."})
      await new Promise(resolve => setTimeout(resolve,2000));
      const editorState = editor?.exportEditorState();
      console.log(editorState, "Editor State")
      setLoader({visible: true, title: "Saving Drawing Area..."})
      const bBoxes = editor?.extractBBoxes();
      console.log(bBoxes, "DRAWING AREA")
      await new Promise(resolve => setTimeout(resolve,2000));

    } catch (error) {
    } finally {
      setLoader({visible: false})
    }
  }

  return (
      <>
          <div id='drawing-area-editor'/>
          {
              editor && 
              <>
              {showUploadDragger && <UploadDragger editor={editor}/>}
              <TopActionBar editor={editor} step={ProjectSetupSteps.DRAWING_AREA_SELECTION} onSave={handleSave} onContinue={handleContinue}/>
              <AnnotationPopup editor={editor} matchEmptyString labelList={labelList[ProjectSetupSteps.DRAWING_AREA_SELECTION]}/>
              <Toolbar editor={editor}/>
              <ImageLoader />
              </>
          }
      </>
  )
}