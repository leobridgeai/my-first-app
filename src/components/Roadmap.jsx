import { categories } from '../data';

export default function Roadmap({ answers, roadmapData, onRoadmapChange }) {
  // Build gaps: questions answered 0 (No), sorted by priority (Critical first)
  const gaps = [];
  categories.forEach((cat) => {
    cat.questions.forEach((q) => {
      if (answers[q.id] === 0) {
        gaps.push({
          id: q.id,
          question: q.question,
          weight: q.weight,
          priority: q.weight === 3 ? 'Critical' : 'Important',
        });
      }
    });
  });

  // Sort: Critical (weight 3) first, then Important (weight 2)
  gaps.sort((a, b) => b.weight - a.weight);

  return (
    <div>
      <div className="roadmap-header">MENA READINESS ROADMAP</div>
      <div className="roadmap-section">
        <p className="roadmap-description">
          This roadmap auto-populates gaps (questions answered &lsquo;No&rsquo;) from the Assessment.
          Use it to plan remediation &mdash; prioritize Critical (weight 3) items first.
        </p>

        {gaps.length === 0 ? (
          <div className="roadmap-empty">
            <span className="empty-icon">&#10003;</span>
            No gaps identified. Answer questions with &ldquo;No&rdquo; in the Assessment tab to see gaps here.
          </div>
        ) : (
          <table className="roadmap-table">
            <colgroup>
              <col className="col-rnum" />
              <col className="col-rid" />
              <col className="col-rdesc" />
              <col className="col-rpriority" />
              <col className="col-rstatus" />
              <col className="col-rdate" />
              <col className="col-rowner" />
            </colgroup>
            <thead>
              <tr>
                <th className="col-rnum">#</th>
                <th className="col-rid">ID</th>
                <th className="col-rdesc">Gap Description</th>
                <th className="col-rpriority">Priority</th>
                <th className="col-rstatus">Status</th>
                <th className="col-rdate">Target Date</th>
                <th className="col-rowner">Owner</th>
              </tr>
            </thead>
            <tbody>
              {gaps.map((gap, idx) => {
                const data = roadmapData[gap.id] || { status: 'Not Started', date: '', owner: '' };
                return (
                  <tr key={gap.id}>
                    <td>{idx + 1}</td>
                    <td>{gap.id}</td>
                    <td>{gap.question}</td>
                    <td>
                      <span className={`priority-badge ${gap.priority.toLowerCase()}`}>
                        {gap.priority}
                      </span>
                    </td>
                    <td>
                      <select
                        className="roadmap-select"
                        value={data.status}
                        onChange={(e) =>
                          onRoadmapChange(gap.id, { ...data, status: e.target.value })
                        }
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Complete">Complete</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className="roadmap-date"
                        type="date"
                        value={data.date}
                        onChange={(e) =>
                          onRoadmapChange(gap.id, { ...data, date: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="roadmap-input"
                        type="text"
                        placeholder="Assign owner"
                        value={data.owner}
                        onChange={(e) =>
                          onRoadmapChange(gap.id, { ...data, owner: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
