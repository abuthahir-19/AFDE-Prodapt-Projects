import { useEffect, useState, useRef } from "react";
import {
  DatabaseZap, Play, RefreshCw, CheckCircle2, XCircle,
  FileSpreadsheet, Database, ArrowRight, AlertTriangle,
  BookOpen, Users, ArrowLeftRight, Clock, Loader2,
  ChevronRight, PackageCheck, Layers, Upload,
} from "lucide-react";
import { getEtlStatus, runEtlPipeline } from "../services/api";
import "./ETL.css";

const ENTITY_ICON = {
  books:        <BookOpen size={15} />,
  borrowers:    <Users size={15} />,
  transactions: <ArrowLeftRight size={15} />,
};

const PHASE_COLOR = {
  extract:   "phase-extract",
  transform: "phase-transform",
  load:      "phase-load",
};

const PHASE_ICON = {
  extract:   <FileSpreadsheet size={13} />,
  transform: <Layers size={13} />,
  load:      <Upload size={13} />,
};

export default function ETL() {
  const [status, setStatus]   = useState(null);
  const [report, setReport]   = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError]     = useState("");
  const logRef = useRef(null);

  const fetchStatus = () =>
    getEtlStatus()
      .then((r) => setStatus(r.data))
      .catch(() => setError("Cannot reach backend. Is the server running?"));

  useEffect(() => { fetchStatus(); }, []);

  // Auto-scroll log to bottom as steps arrive
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [report?.steps]);

  const handleRun = async () => {
    setRunning(true);
    setReport(null);
    setError("");
    try {
      const res = await runEtlPipeline();
      setReport(res.data);
      fetchStatus();           // refresh CSV / DB counts after load
    } catch (err) {
      setError(err.response?.data?.detail || "ETL pipeline failed unexpectedly.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-icon etl-header-icon">
          <DatabaseZap size={22} />
        </div>
        <div>
          <h1>ETL Pipeline</h1>
          <p>Extract → Transform → Load CSV data into the database</p>
        </div>
        <div className="etl-header-actions">
          <button className="btn btn-secondary" onClick={fetchStatus} disabled={running}>
            <RefreshCw size={14} />Refresh Status
          </button>
          <button className="btn btn-primary etl-run-btn" onClick={handleRun} disabled={running}>
            {running
              ? <><Loader2 size={15} className="spin" />Running Pipeline…</>
              : <><Play size={15} />Run ETL Pipeline</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <XCircle size={15} />{error}
        </div>
      )}

      {/* ── Status cards ───────────────────────────────────────── */}
      {status && (
        <div className="etl-status-grid">
          {["books", "borrowers", "transactions"].map((entity) => {
            const csv = status.csv_files[entity] ?? {};
            const dbCount = status.database[entity] ?? 0;
            return (
              <div key={entity} className="etl-status-card">
                <div className="etl-status-card-header">
                  <div className="entity-icon-wrap">{ENTITY_ICON[entity]}</div>
                  <span className="entity-label">{entity}</span>
                </div>

                <div className="etl-status-row">
                  <div className="etl-source-block">
                    <FileSpreadsheet size={13} />
                    <span className="source-label">CSV Source</span>
                  </div>
                  {csv.exists ? (
                    <div className="etl-count-pill csv-pill">
                      <CheckCircle2 size={11} />{csv.rows ?? "?"} rows
                    </div>
                  ) : (
                    <div className="etl-count-pill missing-pill">
                      <AlertTriangle size={11} />Not found
                    </div>
                  )}
                </div>

                <div className="etl-arrow-row">
                  <ArrowRight size={14} className="etl-arrow" />
                </div>

                <div className="etl-status-row">
                  <div className="etl-source-block">
                    <Database size={13} />
                    <span className="source-label">Database</span>
                  </div>
                  <div className="etl-count-pill db-pill">
                    <PackageCheck size={11} />{dbCount} rows
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pipeline visual ────────────────────────────────────── */}
      <div className="card etl-pipeline-visual">
        <div className="card-header">
          <div className="card-header-icon"><Layers size={16} /></div>
          <h2>Pipeline Stages</h2>
        </div>
        <div className="pipeline-stages">
          {[
            { id: "extract",   icon: FileSpreadsheet, label: "Extract",   desc: "Read raw CSV files",                color: "#2563eb" },
            { id: "transform", icon: Layers,          label: "Transform", desc: "Deduplicate & clean dirty records", color: "#7c3aed" },
            { id: "load",      icon: Upload,          label: "Load",      desc: "Upsert clean data into SQLite",     color: "#059669" },
          ].map((stage, i, arr) => (
            <div key={stage.id} className="pipeline-stage-wrap">
              <div className="pipeline-stage" style={{ "--stage-color": stage.color }}>
                <div className="stage-icon-circle">
                  <stage.icon size={20} />
                </div>
                <div className="stage-info">
                  <span className="stage-label">{stage.label}</span>
                  <span className="stage-desc">{stage.desc}</span>
                </div>
              </div>
              {i < arr.length - 1 && <ChevronRight size={20} className="stage-connector" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Run button (prominent, middle) ─────────────────────── */}
      {!report && !running && (
        <div className="etl-cta">
          <button className="btn btn-primary etl-run-btn-lg" onClick={handleRun}>
            <Play size={18} />Run ETL Pipeline
          </button>
          <p>Loads data from <code>books.csv</code>, <code>borrowers.csv</code>, and <code>transactions.csv</code></p>
        </div>
      )}

      {/* ── Running state ──────────────────────────────────────── */}
      {running && (
        <div className="card etl-running-card">
          <div className="etl-running-inner">
            <Loader2 size={36} className="spin etl-run-spinner" />
            <p className="etl-running-text">Pipeline is running…</p>
            <p className="etl-running-sub">Extracting, transforming, and loading data. Please wait.</p>
          </div>
        </div>
      )}

      {/* ── Report ─────────────────────────────────────────────── */}
      {report && (
        <>
          {/* Status banner */}
          <div className={`etl-result-banner ${report.status === "success" ? "banner-success" : "banner-error"}`}>
            {report.status === "success"
              ? <><CheckCircle2 size={18} />Pipeline completed successfully in <strong>{report.duration_seconds}s</strong></>
              : <><XCircle size={18} />Pipeline failed: {report.error}</>}
          </div>

          {/* Summary cards */}
          {report.status === "success" && (
            <div className="etl-summary-grid">
              {Object.entries(report.summary).map(([entity, counts]) => (
                <div key={entity} className="etl-summary-card">
                  <div className="summary-entity-header">
                    {ENTITY_ICON[entity]}
                    <span>{entity}</span>
                  </div>
                  <div className="summary-counts">
                    <div className="summary-count-item extracted">
                      <span className="sc-value">{counts.extracted}</span>
                      <span className="sc-label">Extracted</span>
                    </div>
                    <div className="summary-count-sep">→</div>
                    <div className="summary-count-item removed">
                      <span className="sc-value">{counts.removed}</span>
                      <span className="sc-label">Removed</span>
                    </div>
                    <div className="summary-count-sep">→</div>
                    <div className="summary-count-item loaded">
                      <span className="sc-value">{counts.loaded}</span>
                      <span className="sc-label">Loaded</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step-by-step log */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-icon"><Clock size={16} /></div>
              <h2>Pipeline Log</h2>
              <span className="count-chip">{report.steps.length} steps</span>
            </div>
            <div className="etl-log" ref={logRef}>
              {report.steps.map((step, i) => (
                <div key={i} className={`log-row ${PHASE_COLOR[step.phase]}`}>
                  <div className="log-phase-badge">
                    {PHASE_ICON[step.phase]}
                    {step.phase.toUpperCase()}
                  </div>
                  <div className="log-entity-badge">{ENTITY_ICON[step.entity]}{step.entity}</div>
                  <span className="log-message">{step.message}</span>
                  {step.rows_removed > 0 && (
                    <span className="log-removed-chip">
                      <AlertTriangle size={10} />{step.rows_removed} removed
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
