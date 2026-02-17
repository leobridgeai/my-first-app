import { useState, useCallback } from 'react';
import { categories } from './data';
import Assessment from './components/Assessment';
import ScoringGuide from './components/ScoringGuide';
import Roadmap from './components/Roadmap';

// Initialize answers: { MR1: '', MR2: '', ... }
function initAnswers() {
  const obj = {};
  categories.forEach((cat) => {
    cat.questions.forEach((q) => {
      obj[q.id] = '';
    });
  });
  return obj;
}

function App() {
  const [activeTab, setActiveTab] = useState('assessment');
  const [companyName, setCompanyName] = useState('');
  const [answers, setAnswers] = useState(initAnswers);
  const [notes, setNotes] = useState({});
  const [roadmapData, setRoadmapData] = useState({});

  const handleAnswerChange = useCallback((id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleNoteChange = useCallback((id, value) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleRoadmapChange = useCallback((id, data) => {
    setRoadmapData((prev) => ({ ...prev, [id]: data }));
  }, []);

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>MENA READINESS ASSESSMENT</h1>
        <p className="subtitle">
          Go-to-Market Readiness Diagnostic for SaaS Companies Entering the Middle East &amp; North Africa
        </p>
      </header>

      {/* Tabs */}
      <nav className="tabs">
        <button
          className={`tab-btn ${activeTab === 'assessment' ? 'active' : ''}`}
          onClick={() => setActiveTab('assessment')}
        >
          Assessment
        </button>
        <button
          className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          Scoring Guide
        </button>
        <button
          className={`tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('roadmap')}
        >
          Readiness Roadmap
        </button>
      </nav>

      {/* Export bar */}
      <div className="export-bar">
        <button className="export-btn" onClick={handleExportPDF}>
          Export to PDF
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content" style={{ display: activeTab === 'assessment' ? 'block' : 'none' }}>
        <Assessment
          answers={answers}
          notes={notes}
          companyName={companyName}
          onAnswerChange={handleAnswerChange}
          onNoteChange={handleNoteChange}
          onCompanyChange={setCompanyName}
        />
      </div>

      <div className="tab-content" style={{ display: activeTab === 'guide' ? 'block' : 'none' }}>
        <ScoringGuide />
      </div>

      <div className="tab-content" style={{ display: activeTab === 'roadmap' ? 'block' : 'none' }}>
        <Roadmap
          answers={answers}
          roadmapData={roadmapData}
          onRoadmapChange={handleRoadmapChange}
        />
      </div>
    </div>
  );
}

export default App;
