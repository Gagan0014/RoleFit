import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF resume.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Your resume must be smaller than 5 MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload your resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const uploadResponse = await fetch(
        "http://localhost:5000/api/resume/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || "Resume upload failed.");
      }

      const analysisResponse = await fetch(
        "http://localhost:5000/api/ai/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeText: uploadData.text,
            jobDescription,
          }),
        }
      );

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok) {
        throw new Error(
          analysisData.message || "Resume analysis failed."
        );
      }

      setAnalysis(analysisData.analysis);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setJobDescription("");
    setAnalysis(null);
    setError("");
  };

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="/">
          <span className="brand-icon">R</span>
          <span className="brand-name">RoleFit</span>
        </a>

        <nav className="nav-links">
          <a href="#analyze">Analyze</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          <button className="sign-in">Sign In</button>
          <button className="get-started">Get Started</button>
        </div>
      </header>

      <main>
        <section className="hero" id="analyze">
          <div className="hero-glow glow-one"></div>
          <div className="hero-glow glow-two"></div>
          <div className="hero-glow glow-three"></div>

          <div className="hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">AI ROLE FIT CHECKER</p>

              <h1>
                How well does your
                <br />
                resume <span>fit the role?</span>
              </h1>

              <p className="hero-description">
                Compare your resume with a target job and get a clear view
                of your strengths, skill gaps, and overall role fit.
              </p>

              <label className={`upload-card ${file ? "uploaded" : ""}`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />

                {file ? (
                  <>
                    <div className="upload-file-icon">PDF</div>
                    <div className="upload-content">
                      <strong>{file.name}</strong>
                      <span>Ready to analyze · PDF</span>
                    </div>
                    <div className="upload-change">Change</div>
                  </>
                ) : (
                  <>
                    <div className="upload-icon">↑</div>
                    <div className="upload-content">
                      <strong>Drop your resume here or choose a file</strong>
                      <span>PDF only · Maximum 5 MB</span>
                    </div>
                    <div className="upload-button">Choose file</div>
                  </>
                )}
              </label>

              <p className="privacy-note">
                <span>▣</span>
                Your resume stays private and is not used to train the model.
              </p>
            </div>

            <div className="preview-wrap">
              <div className="preview-window">
                <div className="preview-topbar">
                  <div className="preview-brand">
                    <span className="preview-mark">R</span>
                    RoleFit
                  </div>
                  <span className="preview-status">Analysis preview</span>
                </div>

                <div className="preview-body">
                  <aside className="preview-sidebar">
                    <div className="preview-score-card">
                      <span className="mini-label">ROLE FIT</span>

                      <div className="mini-score">
                        <strong>{analysis?.roleFitScore ?? 84}</strong>
                        <span>/100</span>
                      </div>

                      <div className="mini-meter">
                        <div
                          style={{
                            width: `${Math.min(
                              Math.max(analysis?.roleFitScore ?? 84, 0),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <span className="mini-caption">
                        {analysis ? "Your result" : "Strong match"}
                      </span>
                    </div>

                    <div className="preview-list">
                      <span className="mini-label">KEY SIGNALS</span>

                      <div className="preview-list-item positive">
                        <span>✓</span>
                        Matched skills
                      </div>
                      <div className="preview-list-item positive">
                        <span>✓</span>
                        Relevant projects
                      </div>
                      <div className="preview-list-item warning">
                        <span>+</span>
                        Skill gaps
                      </div>
                      <div className="preview-list-item neutral">
                        <span>•</span>
                        Suggestions
                      </div>
                    </div>
                  </aside>

                  <div className="preview-main">
                    <div className="preview-section-title">
                      <span>ROLE ANALYSIS</span>
                      <span>AI</span>
                    </div>

                    <div className="preview-line long"></div>
                    <div className="preview-line medium"></div>
                    <div className="preview-line short"></div>

                    <div className="preview-box">
                      <div className="preview-box-header">
                        <span>SKILL MATCH</span>
                        <strong>
                          {analysis
                            ? `${analysis.matchedSkills.length} matched`
                            : "Good"}
                        </strong>
                      </div>

                      <div className="preview-tags">
                        {(analysis?.matchedSkills?.slice(0, 4) || [
                          "React",
                          "Node.js",
                          "MongoDB",
                        ]).map((skill, index) => (
                          <span className="preview-tag" key={index}>
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="preview-box">
                      <div className="preview-box-header">
                        <span>SKILL GAPS</span>
                        <strong className="orange-text">
                          {analysis
                            ? `${analysis.missingSkills.length} to improve`
                            : "2 to improve"}
                        </strong>
                      </div>

                      <div className="preview-tags">
                        {(analysis?.missingSkills?.slice(0, 3) || [
                          "AWS",
                          "Docker",
                        ]).map((skill, index) => (
                          <span
                            className="preview-tag missing"
                            key={index}
                          >
                            + {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="preview-chart">
                      <span className="chart-label">FIT SIGNAL</span>
                      <div className="chart">
                        <div className="chart-bar bar-one"></div>
                        <div className="chart-bar bar-two"></div>
                        <div className="chart-bar bar-three"></div>
                        <div className="chart-bar bar-four"></div>
                        <div className="chart-bar bar-five"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="analyzer-section" id="how-it-works">
          <div className="section-heading">
            <p className="eyebrow">START ANALYZING</p>
            <h2>Tell RoleFit what you're applying for.</h2>
            <p>
              Add the job description, then let RoleFit compare it with your
              resume.
            </p>
          </div>

          <div className="job-card">
            <div className="job-card-top">
              <div>
                <span className="step-number">01</span>
                <span className="step-label">TARGET ROLE</span>
              </div>

              <span className="character-count">
                {jobDescription.length} characters
              </span>
            </div>

            <textarea
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(event.target.value)
              }
              placeholder={`Paste the job description here...

Example:
• Strong JavaScript and React skills
• Experience building REST APIs
• Node.js / Express
• MongoDB
• Familiarity with AWS or Docker`}
            />

            <div className="job-card-footer">
              <span className="helper-text">
                The more complete the job description, the better the match.
              </span>

              <button
                className="analyze-button"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze Role Fit"}
                <span>→</span>
              </button>
            </div>

            {error && <div className="error-box">{error}</div>}
          </div>
        </section>

        {analysis && (
          <section className="results-section" id="results">
            <div className="results-heading">
              <div>
                <p className="eyebrow">YOUR RESULT</p>
                <h2>RoleFit analysis</h2>
                <p>
                  A quick, practical breakdown of where you match and where
                  you can improve.
                </p>
              </div>

              <button className="secondary-button" onClick={resetAnalysis}>
                Analyze another resume
              </button>
            </div>

            <div className="results-layout">
              <div className="result-score-card">
                <span className="result-label">ROLE FIT</span>
                <strong>{analysis.roleFitScore}</strong>
                <span className="result-denom">/100</span>

                <div className="result-meter">
                  <div
                    style={{
                      width: `${Math.min(
                        Math.max(analysis.roleFitScore, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p>{analysis.roleAnalysis}</p>
              </div>

              <div className="result-main">
                <div className="result-columns">
                  <div className="result-panel">
                    <span className="result-label">MATCHED SKILLS</span>

                    <div className="result-tags">
                      {analysis.matchedSkills.map((skill, index) => (
                        <span className="result-tag matched" key={index}>
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="result-panel">
                    <span className="result-label">SKILL GAPS</span>

                    <div className="result-tags">
                      {analysis.missingSkills.map((skill, index) => (
                        <span className="result-tag missing" key={index}>
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="result-panel wide">
                  <span className="result-label">SUMMARY</span>
                  <p>{analysis.summary}</p>
                </div>

                <div className="result-columns">
                  <div className="result-panel">
                    <span className="result-label">STRENGTHS</span>
                    <ul>
                      {analysis.strengths.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="result-panel">
                    <span className="result-label">WEAKNESSES</span>
                    <ul>
                      {analysis.weaknesses.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="result-panel wide">
                  <span className="result-label">RECOMMENDATIONS</span>
                  <ol>
                    {analysis.suggestions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="how-section" id="about">
          <div>
            <p className="eyebrow">HOW IT WORKS</p>
            <h2>Simple input.<br />Useful output.</h2>
          </div>

          <div className="how-grid">
            <div>
              <span>01</span>
              <h3>Upload</h3>
              <p>Your PDF resume is converted into usable text.</p>
            </div>

            <div>
              <span>02</span>
              <h3>Compare</h3>
              <p>Gemini evaluates your profile against the target role.</p>
            </div>

            <div>
              <span>03</span>
              <h3>Improve</h3>
              <p>Get clear skill gaps and practical next steps.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>RoleFit</span>
        <span>AI-powered role matching</span>
      </footer>
    </div>
  );
}

export default App;
