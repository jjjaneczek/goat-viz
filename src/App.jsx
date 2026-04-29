import { useState, useMemo, useCallback } from 'react';
import { footballAthletes, footballAttributeMeta } from './data/football';
import { chessAthletes, chessAttributeMeta } from './data/chess';
import { boxingAthletes, boxingAttributeMeta } from './data/boxing';
import { initialWeights } from './data/attributeMap';
import { normalizeAthletes } from './utils/normalize';
import { computeAllSportScores, computeOverallScores } from './utils/scoring';
import ProgressBar from './components/ProgressBar';
import SidePanel from './components/SidePanel';
import Stage0_Intro from './stages/Stage0_Intro';
import Stage1_Preferences from './stages/Stage1_Preferences/index';
import Stage2_SportDives from './stages/Stage2_SportDives/index';
import Stage3_CrossSport from './stages/Stage3_CrossSport/index';
import Stage4_Verdict from './stages/Stage4_Verdict/index';

const normalizedFootball = normalizeAthletes(footballAthletes);
const normalizedChess    = normalizeAthletes(chessAthletes);
const normalizedBoxing   = normalizeAthletes(boxingAthletes);

const PANEL_WIDTH = 272;

export default function App() {
  const [currentStage, setCurrentStage] = useState(0);
  const [currentSport, setCurrentSport] = useState('football');
  const [selectedTags, setSelectedTags] = useState([]);
  const [weights, setWeights] = useState(initialWeights);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedAthletes, setSelectedAthletes] = useState({
    football: [normalizedFootball[0].id, normalizedFootball[1].id],
    chess: [normalizedChess[0].id, normalizedChess[1].id],
    boxing: [normalizedBoxing[0].id, normalizedBoxing[1].id],
  });

  const sportScores = useMemo(() => computeAllSportScores({
    football: normalizedFootball,
    chess: normalizedChess,
    boxing: normalizedBoxing,
  }, weights), [weights]);

  const overallScores = useMemo(() =>
    computeOverallScores(sportScores),
  [sportScores]);

  const goTo = useCallback((stage) => setCurrentStage(stage), []);

  const showPanel = currentStage >= 1 && selectedTags.length > 0;
  const contentShift = showPanel && panelOpen ? PANEL_WIDTH : 0;

  const sharedProps = {
    currentStage, goTo,
    currentSport, setCurrentSport,
    selectedTags, setSelectedTags,
    weights, setWeights,
    selectedAthletes, setSelectedAthletes,
    sportScores, overallScores,
    athletes: { football: normalizedFootball, chess: normalizedChess, boxing: normalizedBoxing },
    attributeMeta: { football: footballAttributeMeta, chess: chessAttributeMeta, boxing: boxingAttributeMeta },
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', color: '#e5e5e5' }}>
      {showPanel && (
        <SidePanel
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          weights={weights}
          setWeights={setWeights}
          isOpen={panelOpen}
          setIsOpen={setPanelOpen}
        />
      )}

      <div style={{
        marginLeft: showPanel ? (panelOpen ? PANEL_WIDTH : 20) : 0,
        transition: 'margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {currentStage > 0 && <ProgressBar currentStage={currentStage} goTo={goTo} />}
        {currentStage === 0 && <Stage0_Intro goTo={goTo} />}
        {currentStage === 1 && <Stage1_Preferences {...sharedProps} />}
        {currentStage === 2 && <Stage2_SportDives {...sharedProps} />}
        {currentStage === 3 && <Stage3_CrossSport {...sharedProps} />}
        {currentStage === 4 && <Stage4_Verdict {...sharedProps} />}
      </div>
    </div>
  );
}
