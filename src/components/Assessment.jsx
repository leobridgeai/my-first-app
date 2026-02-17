import { categories, TOTAL_MAX_WEIGHT, getTier, getStatusBadge } from '../data';

export default function Assessment({ answers, notes, companyName, onAnswerChange, onNoteChange, onCompanyChange }) {
  const categoryStats = categories.map((cat) => {
    const maxWeight = cat.questions.reduce((sum, q) => sum + q.weight, 0);
    let scoreAchieved = 0;
    let answeredCount = 0;
    let hasAnyAnswer = false;

    cat.questions.forEach((q) => {
      const val = answers[q.id];
      if (val !== '') {
        hasAnyAnswer = true;
        answeredCount += val === 1 ? 1 : 0;
        scoreAchieved += val * q.weight;
      }
    });

    const pct = hasAnyAnswer ? (scoreAchieved / maxWeight) * 100 : null;
    return { name: cat.name, maxWeight, scoreAchieved, answeredCount, pct };
  });

  const totalAchieved = categoryStats.reduce((sum, c) => sum + c.scoreAchieved, 0);
  const overallPct = totalAchieved > 0 ? (totalAchieved / TOTAL_MAX_WEIGHT) * 100 : 0;
  const tier = getTier(overallPct);

  return (
    <div>
      <div className="company-row">
        <label htmlFor="company">Company:</label>
        <input
          id="company"
          type="text"
          value={companyName}
          onChange={(e) => onCompanyChange(e.target.value)}
          placeholder="Enter company name"
        />
      </div>

      <div className="instructions">
        INSTRUCTIONS: Answer each question with Yes (1) or No (0). Leave blank if not applicable. See Scoring Guide tab for details.
      </div>

      <table className="assessment-table">
        <colgroup>
          <col className="col-num" />
          <col className="col-id" />
          <col className="col-question" />
          <col className="col-answer" />
          <col className="col-weight" />
          <col className="col-score" />
          <col className="col-notes" />
        </colgroup>
        <thead>
          <tr>
            <th className="col-num">#</th>
            <th className="col-id">ID</th>
            <th className="col-question">Assessment Question</th>
            <th className="col-answer">Yes/No (1/0)</th>
            <th className="col-weight">Weight</th>
            <th className="col-score">Weighted Score</th>
            <th className="col-notes">Notes / Evidence</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, catIdx) => {
            const stats = categoryStats[catIdx];
            return (
              <CategoryBlock
                key={cat.key}
                category={cat}
                stats={stats}
                answers={answers}
                notes={notes}
                onAnswerChange={onAnswerChange}
                onNoteChange={onNoteChange}
              />
            );
          })}
        </tbody>
      </table>

      {/* Overall Score Section */}
      <div className="score-section">
        <div className="score-header">OVERALL MENA READINESS SCORE</div>
        <div className="score-grid">
          <div className="score-row achieved">
            <span className="score-label">Total Weighted Score Achieved</span>
            <span className="score-value">{totalAchieved}</span>
          </div>
          <div className="score-row max">
            <span className="score-label">Maximum Possible Weighted Score</span>
            <span className="score-value">{TOTAL_MAX_WEIGHT}</span>
          </div>
          <div className="score-row percentage">
            <span className="score-label">MENA READINESS SCORE (%)</span>
            <span className="score-value">{Math.round(overallPct)}%</span>
          </div>
          <div className="score-row tier">
            <span className="score-label">READINESS TIER</span>
            <span className="score-value">{tier.label} &mdash; {tier.message}</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="breakdown-section">
        <h3>Category Breakdown</h3>
        <table className="breakdown-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Score Achieved</th>
              <th>Max Possible</th>
              <th>Category %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {categoryStats.map((stat, i) => {
              const status = getStatusBadge(stat.pct);
              return (
                <tr key={i}>
                  <td>{stat.name}</td>
                  <td>{stat.scoreAchieved}</td>
                  <td>{stat.maxWeight}</td>
                  <td>{stat.pct !== null ? `${Math.round(stat.pct)}%` : '\u2014'}</td>
                  <td>
                    <span className={`badge ${status.type}`}>{status.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryBlock({ category, stats, answers, notes, onAnswerChange, onNoteChange }) {
  return (
    <>
      <tr className="category-header">
        <td colSpan={7}>{category.name}</td>
      </tr>
      {category.questions.map((q) => {
        const val = answers[q.id];
        const weightedScore = val !== '' ? val * q.weight : '';
        return (
          <tr key={q.id} className="question-row">
            <td>{q.num}</td>
            <td>{q.id}</td>
            <td>{q.question}</td>
            <td>
              <select
                className="answer-select"
                value={val}
                onChange={(e) => {
                  const v = e.target.value;
                  onAnswerChange(q.id, v === '' ? '' : Number(v));
                }}
              >
                <option value="">--</option>
                <option value="1">1 (Yes)</option>
                <option value="0">0 (No)</option>
              </select>
            </td>
            <td>{q.weight === 3 ? '3 (Critical)' : '2 (Important)'}</td>
            <td>{weightedScore !== '' ? weightedScore : ''}</td>
            <td className="col-notes-cell">
              <textarea
                className="notes-input"
                placeholder={q.exampleNote}
                value={notes[q.id] || ''}
                onChange={(e) => onNoteChange(q.id, e.target.value)}
                rows={1}
              />
            </td>
          </tr>
        );
      })}
      <tr className="subtotal-row">
        <td colSpan={3}>{category.name} &mdash; Subtotal</td>
        <td>{stats.answeredCount}</td>
        <td>{stats.maxWeight}</td>
        <td>{stats.scoreAchieved}</td>
        <td className="col-notes-cell"></td>
      </tr>
    </>
  );
}
