import { useRecoilValue } from "recoil";
import "./ImageLoader.scss";
import { ClipLoader } from "react-spinners";
import { loaderAtom } from "../../state/editor";

interface IProps {
    spacingLeft?: number
}

export default function ImageLoader({spacingLeft = 0}: IProps) {
    const LoaderSpinner = useRecoilValue(loaderAtom)

    if(!LoaderSpinner.visible) return <></>

    return (
        <>
            <div className="image-loader-container" style={{width: `calc(100% - ${spacingLeft}px)`, left: spacingLeft}}>
                <span className="title">{LoaderSpinner.title}</span>
                <div className="loader">
                    <ClipLoader color="rgb(66, 72, 255)" />
                </div>
            </div>
        </>
    )
}