import './App.css';
import { ProjectSetupSteps, nextProjectSetupSetpMap } from './constants/Constants';
import LegendExtraction from './screens/LegendExtraction';
import DrawingAreaSelection from './screens/DrawingAreaSelection';
import MetadataExtraction from './screens/MetadataExtraction';
import { useState } from 'react';

function App() {
  const [step, setStep] = useState(ProjectSetupSteps.LEGEND_EXTRACTION)

  const handleContinue = () => {
    const nextStep = nextProjectSetupSetpMap[step];
    if(!nextStep) return;
    setStep(nextStep)
  }

  return (
   <>
    {
      {
        [ProjectSetupSteps.LEGEND_EXTRACTION] : <LegendExtraction onContinue={handleContinue}/>,
        [ProjectSetupSteps.DRAWING_AREA_SELECTION] : <DrawingAreaSelection onContinue={handleContinue}/>,
        [ProjectSetupSteps.METADATA_EXTRACTION] : <MetadataExtraction onContinue={handleContinue}/>,
      }[step]
    }
   </>
  );
}

export default App;
