import { inferWeights } from '../../data/attributeMap';
import Step1_Tags from './Step1_Tags';

export default function Stage1_Preferences({
  selectedTags, setSelectedTags,
  weights, setWeights,
  goTo,
}) {
  function handleNext() {
    const inferred = inferWeights(selectedTags);
    setWeights(inferred);
    goTo(2);
  }

  return (
    <div style={{ minHeight: '100vh', padding: '60px 20px 40px' }}>
      <Step1_Tags
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        onNext={handleNext}
      />
    </div>
  );
}
