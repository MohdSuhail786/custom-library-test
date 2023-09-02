import "./TopActionBar.scss";
import { ProjectSetupSteps } from "../../model/Types";
import { Editor } from "../../model/Editor";
interface IProps {
    editor: Editor;
    step: ProjectSetupSteps;
    onContinue: () => void;
    onSave: () => Promise<void>;
}
export default function TopActionBar({ editor, step, onContinue, onSave }: IProps): import("react/jsx-runtime").JSX.Element;
export {};
