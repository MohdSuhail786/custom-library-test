import { useEffect, useState } from "react";
import { Editor } from "../model/Editor";
import { useRecoilState, useSetRecoilState } from "recoil";
import { activeImageAtom, imageListAtom, loaderAtom, showUploadDraggerAtom } from "../state/editor";
import UploadDragger from "../components/UploadDragger/UploadDragger";
import TopActionBar from "../components/TopActionBar/TopActionBar";
import LeftSidebar from "../components/LeftSidebar/LeftSidebar";
import AnnotationPopup from "../components/AnnotationPopup/AnnotationPopup";
import Toolbar from "../components/Toolbar/Toolbar";
import ImageLoader from "../components/Loader/ImageLoader";
import { ProjectSetupSteps, editorState, labelList } from "../constants/Constants";

interface IProps {
    onContinue: () => void
}

const spacingLeft = 300;

export default function LegendExtraction({onContinue}: IProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showUploadDragger, setShowUploadDragger] = useRecoilState(showUploadDraggerAtom)
  const setLoader = useSetRecoilState(loaderAtom)
  const setImageList = useSetRecoilState(imageListAtom)
  const setActiveImage = useSetRecoilState(activeImageAtom)

  useEffect(()=>{
    (async()=>{
      const editor = new Editor({
        container: 'legend-editor',
        width: window.innerWidth,
        height: window.innerHeight,
        spacingLeft
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
      await editor.importEditorState(editorState)
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
      setLoader({visible: true, title: "Uploading legend..."})
      const legend = editor?.extractCutOuts();
      console.log(legend, "Legend")
      await new Promise(resolve => setTimeout(resolve,2000));

    } catch (error) {
    } finally {
      setLoader({visible: false})
    }
  }

  return (
      <>
          <div id='legend-editor'/>
          {
              editor && 
              <>
              {showUploadDragger && <UploadDragger allowMultiple spacingLeft={spacingLeft} editor={editor}/>}
              <TopActionBar editor={editor} step={ProjectSetupSteps.LEGEND_EXTRACTION} onSave={handleSave} onContinue={handleContinue}/>
              {<LeftSidebar editor={editor}/> }
              <AnnotationPopup editor={editor} labelList={labelList[ProjectSetupSteps.LEGEND_EXTRACTION]}/>
              <Toolbar editor={editor}/>
              <ImageLoader spacingLeft={spacingLeft}/>
              </>
          }
      </>
  )
}