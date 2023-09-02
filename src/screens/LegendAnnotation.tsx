import { RecoilRoot } from "recoil";
import RecoilNexus from "recoil-nexus";
import LegendExtraction from "./LegendExtraction";

interface Iprops {
    onContinue: () => void
}

export default function LegendAnnotation({onContinue}: Iprops) {
    return (
        <>
        <RecoilRoot>
            <RecoilNexus />
            <LegendExtraction onContinue={onContinue} />
      </RecoilRoot>
        </>
    )
}