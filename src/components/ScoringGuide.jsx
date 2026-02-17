export default function ScoringGuide() {
  return (
    <div className="guide-section">
      {/* Section 1: Scoring Scale */}
      <div className="guide-block">
        <div className="guide-block-header">SCORING SCALE</div>
        <table className="guide-table">
          <thead>
            <tr>
              <th>Answer</th>
              <th>Value</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="green">
              <td><strong>Yes</strong></td>
              <td>1</td>
              <td>Capability exists and is operational.</td>
            </tr>
            <tr className="red">
              <td><strong>No</strong></td>
              <td>0</td>
              <td>Capability does not exist or has not been addressed.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 2: Weight System */}
      <div className="guide-block">
        <div className="guide-block-header">WEIGHT SYSTEM</div>
        <table className="guide-table">
          <thead>
            <tr>
              <th>Weight</th>
              <th>Meaning</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>3</strong></td>
              <td>Critical &mdash; Deal-breaker for most MENA buyers. Must be addressed before market entry.</td>
              <td>Data residency in GCC, security certifications, regional references</td>
            </tr>
            <tr>
              <td><strong>2</strong></td>
              <td>Important &mdash; Significantly impacts competitiveness and sales velocity. Should be prioritized.</td>
              <td>Breach notification process, documentation adaptability, marketing presence</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 3: Readiness Tiers */}
      <div className="guide-block">
        <div className="guide-block-header">READINESS TIERS</div>
        <table className="guide-table">
          <thead>
            <tr>
              <th>Tier</th>
              <th>Score Range</th>
              <th>Meaning</th>
              <th>Recommended Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="green">
              <td><strong>TIER 1</strong></td>
              <td>69&ndash;100%</td>
              <td>Market Ready</td>
              <td>You&rsquo;re market ready. Bridge AI can help you accelerate your MENA go-to-market and scale faster with local expertise.</td>
            </tr>
            <tr className="yellow">
              <td><strong>TIER 2</strong></td>
              <td>40&ndash;69%</td>
              <td>Conditionally Ready</td>
              <td>You have some gaps to address, but nothing that should hold you back. Bridge AI has the know-how to help you close them and get to market with confidence.</td>
            </tr>
            <tr className="red">
              <td><strong>TIER 3</strong></td>
              <td>Below 40%</td>
              <td>Not Ready</td>
              <td>You may not be fully ready yet &mdash; and that&rsquo;s okay. Bridge AI can help you build a clear roadmap and lay the groundwork for a successful MENA entry.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 4: Calculation Methodology */}
      <div className="guide-block">
        <div className="guide-block-header">CALCULATION METHODOLOGY</div>
        <div className="guide-methodology">
          <ol>
            <li>Each question is answered Yes (1) or No (0) based on evidence provided by the partner.</li>
            <li>Each answer is multiplied by its weight (2 = Important, 3 = Critical) to produce a Weighted Score.</li>
            <li>Category scores are summed and compared against the maximum possible (all Yes &times; weights).</li>
            <li>The Overall Readiness Score = Total Weighted Score &divide; Maximum Possible Weighted Score.</li>
            <li>The Readiness Tier is determined by the overall percentage (see tier definitions above).</li>
          </ol>
          <div className="guide-formula">
            Formula: Readiness % = &Sigma;(Answer &times; Weight) &divide; &Sigma;(Weight) for all answered questions
          </div>
        </div>
      </div>
    </div>
  );
}
