import "./AnnotationPopup.scss";
import { Editor } from "../../model/Editor";
interface IProps {
    editor: Editor;
    labelList: string[];
    matchEmptyString?: boolean;
    allowCustomLabels?: boolean;
}
export default function AnnotationPopup({ editor, labelList, matchEmptyString, allowCustomLabels }: IProps): import("react/jsx-runtime").JSX.Element;
export {};
