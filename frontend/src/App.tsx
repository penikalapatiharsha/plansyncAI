// frontend/src/App.tsx
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Users, ShieldAlert, Check } from 'lucide-react';
import { PlanConfiguration, CensusCleansingResponse } from './types';

export default function App() {
  // Document Extraction States (Step 1)
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [config, setConfig] = useState<PlanConfiguration | null>(null);

  // Census Cleansing States (Step 2)
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvLoading, setCsvLoading] = useState<boolean>(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [censusResult, setCensusResult] = useState<CensusCleansingResponse | null>(null);
  
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
      setPdfError(null);
    }
  };

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setCsvError(null);
      setCensusResult(null);
    }
  };

  // Step 1 API Call: Multi-Agent PDF Extraction
  const handleAnalyzePlan = async () => {
    if (!pdfFile) return;
    setPdfLoading(true);
    setPdfError(null);
    setConfig(null);
    setIsSaved(false);

    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/analyze-plan', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`Server Error: ${response.statusText}`);
      const data: PlanConfiguration = await response.json();
      setConfig(data);
    } catch (err: any) {
      setPdfError(err.message || 'Failed to process document.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Step 2 API Call: Rules-Driven Data Scrubbing Engine
  const handleCleanseCensus = async () => {
    if (!csvFile || !config) return;
    setCsvLoading(true);
    setCsvError(null);

    const formData = new FormData();
    formData.append('file', csvFile);
    // Send the AI configuration rules as a stringified form parameter
    formData.append('extracted_rules_json', JSON.stringify(config));

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/cleanse-census', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`Scrubbing Engine Failed: ${response.statusText}`);
      const data: CensusCleansingResponse = await response.json();
      setCensusResult(data);
    } catch (err: any) {
      setCsvError(err.message || 'Failed to scrub data.');
    } finally {
      setCsvLoading(false);
    }
  };

  const handleSaveToSystem = () => {
    setIsSaved(true);
    alert(`Successfully synced configuration and ${censusResult?.summary.clean_records_count} clean records to GRK for client: ${config?.company_name}`);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      <header style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', color: '#0f172a' }}>PlanSync Hyper-Automation Engine</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Fidelity Workplace Investing — Autonomous Onboarding Portal</p>
      </header>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* ================= LEFT SIDE: CONTROL PANEL INGESTION ================= */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Panel Step 1: PDF Upload */}
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '16px', marginTop: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ backgroundColor: '#0284c7', color: '#ffffff', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>1</span>
              Ingest Plan Document (PDF)
            </h2>
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '6px', padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '12px' }}>
              <input type="file" accept=".pdf" onChange={handlePdfChange} id="pdf-upload" style={{ display: 'none' }} />
              <label htmlFor="pdf-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <Upload size={24} color="#64748b" />
                <span style={{ fontWeight: 600, color: '#334155', fontSize: '14px' }}>Upload legal 401(k) PDF</span>
              </label>
            </div>
            {pdfFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '12px', fontSize: '13px' }}>
                <FileText size={16} color="#0284c7" />
                <span style={{ fontWeight: 500, color: '#334155', wordBreak: 'break-all' }}>{pdfFile.name}</span>
              </div>
            )}
            <button 
              onClick={handleAnalyzePlan} 
              disabled={!pdfFile || pdfLoading}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: pdfFile && !pdfLoading ? '#0284c7' : '#cbd5e1', color: '#ffffff', fontWeight: 600, cursor: pdfFile && !pdfLoading ? 'pointer' : 'not-allowed' }}
            >
              {pdfLoading ? 'Extracting Structure Plan Rules...' : 'Run Plan Rules Analysis'}
            </button>
            {pdfError && <div style={{ color: '#b91c1c', fontSize: '13px', marginTop: '8px' }}><AlertCircle size={14} /> {pdfError}</div>}
          </div>

          {/* Panel Step 2: CSV Upload (Unlocked only after step 1 succeeds) */}
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', opacity: config ? 1 : 0.5, pointerEvents: config ? 'auto' : 'none' }}>
            <h2 style={{ fontSize: '16px', marginTop: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ backgroundColor: '#0284c7', color: '#ffffff', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>2</span>
              Ingest Employee Census (CSV)
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '-4px', marginBottom: '12px' }}>Processes data using rules verified above.</p>
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '6px', padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '12px' }}>
              <input type="file" accept=".csv" onChange={handleCsvChange} id="csv-upload" style={{ display: 'none' }} />
              <label htmlFor="csv-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <Users size={24} color="#64748b" />
                <span style={{ fontWeight: 600, color: '#334155', fontSize: '14px' }}>Upload raw payroll CSV roster</span>
              </label>
            </div>
            {csvFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '12px', fontSize: '13px' }}>
                <FileText size={16} color="#16a34a" />
                <span style={{ fontWeight: 500, color: '#334155', wordBreak: 'break-all' }}>{csvFile.name}</span>
              </div>
            )}
            <button 
              onClick={handleCleanseCensus} 
              disabled={!csvFile || csvLoading}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: csvFile && !csvLoading ? '#16a34a' : '#cbd5e1', color: '#ffffff', fontWeight: 600, cursor: csvFile && !csvLoading ? 'pointer' : 'not-allowed' }}
            >
              {csvLoading ? 'Executing Data Auditing Pipeline...' : 'Scrub & Reconcile Roster'}
            </button>
            {csvError && <div style={{ color: '#b91c1c', fontSize: '13px', marginTop: '8px' }}><AlertCircle size={14} /> {csvError}</div>}
          </div>

        </div>

        {/* ================= RIGHT SIDE: OPERATIONAL CANVAS TRACKING ================= */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Canvas Component 1: Extracted Rules Blueprint */}
          {config && (
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '14px', color: '#475569', textTransform: 'uppercase', tracking: '0.05em', margin: '0 0 12px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>Verified Plan Rules</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>CLIENT ACCOUNT</label>
                  <input type="text" value={config.company_name} onChange={(e) => setConfig({ ...config, company_name: e.target.value })} style={{ width: '100%', padding: '6px', marginTop: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>AUTO DEFERRAL DEFAULT</label>
                  <input type="number" value={config.auto_enrollment.default_percentage || 0} onChange={(e) => setConfig({ ...config, auto_enrollment: { ...config.auto_enrollment, default_percentage: parseFloat(e.target.value) || 0 } })} style={{ width: '70px', padding: '6px', marginTop: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '13px' }} /> %
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>EXTRACTED MATCH FORMULA</label>
                <textarea rows={2} value={config.employer_matching_logic.formula_description} onChange={(e) => setConfig({ ...config, employer_matching_logic: { ...config.employer_matching_logic, formula_description: e.target.value } })} style={{ width: '100%', padding: '6px', marginTop: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}

          {/* Canvas Component 2: Roster Ingestion Output Canvas */}
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', minHeight: '300px' }}>
            <h3 style={{ fontSize: '14px', color: '#475569', textTransform: 'uppercase', margin: '0 0 12px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>Roster Processing Feed</h3>
            
            {!censusResult && !csvLoading && (
              <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '60px 0' }}>
                Once a plan document is analyzed, feed the payroll CSV array downstream to review ledger status output.
              </div>
            )}

            {csvLoading && (
              <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '60px 0' }}>
                Executing logic processing loops against legal variables...
              </div>
            )}

            {censusResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Micro Metric Blocks */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#16a34a' }}>{censusResult.summary.clean_records_count}</div>
                    <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>System-Ready Records</div>
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#dc2626' }}>{censusResult.summary.exception_count}</div>
                    <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600 }}>Exceptions Flagged</div>
                  </div>
                </div>

                {/* Exception Queue Warnings Render */}
                {censusResult.exceptions_queue.length > 0 && (
                  <div style={{ border: '1px solid #fecaca', borderRadius: '6px', backgroundColor: '#fff5f5', padding: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldAlert size={16} /> Data Rule Violations Isolated
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                      {censusResult.exceptions_queue.map((exc) => (
                        <div key={exc.row_id} style={{ fontSize: '12px', color: '#7f1d1d', backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '4px', borderLeft: '3px solid #dc2626' }}>
                          <strong>Row {exc.row_id} | {exc.employee}:</strong> {exc.violations.join(' | ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clean Record Roster Log Render */}
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#1e293b' }}>Clean Roster Staging (Auto-Corrected Names & Deferrals)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px', backgroundColor: '#f8fafc' }}>
                    {censusResult.clean_records.map((rec) => (
                      <div key={rec.row_id} style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', fontSize: '12px', padding: '6px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: '#64748b', marginRight: '8px' }}>#{rec.row_id}</span>
                          <strong style={{ color: '#334155' }}>{rec.full_name}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>Status: {rec.status}</span>
                        </div>
                        <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, fontSize: '11px' }}>
                          Rate: {rec.calculated_deferral_percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleSaveToSystem}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '4px' }}
                >
                  <CheckCircle2 size={18} />
                  Authorize & Commit Complete Onboarding Roster
                </button>

                {isSaved && (
                  <div style={{ textAlign: 'center', color: '#16a34a', fontSize: '13px', fontWeight: 500 }}>
                    🌟 Core implementation variables successfully updated across the recordkeeping ledger.
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}