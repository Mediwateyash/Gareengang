import { useState, useEffect } from 'react';
import API_URL from '../config';
import './AdminCodes.css';

const AdminCodes = () => {
    const [activeTab, setActiveTab] = useState('workspaces'); // workspaces, codes, submissions
    const [workspaces, setWorkspaces] = useState([]);
    const [codes, setCodes] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);

    // Form states - Workspaces
    const [wsName, setWsName] = useState('');
    const [wsDesc, setWsDesc] = useState('');

    // Form states - Secret Code
    const [codeStr, setCodeStr] = useState('');
    const [codeType, setCodeType] = useState('general');
    const [flowMode, setFlowMode] = useState('verification');
    const [preApprovedPhones, setPreApprovedPhones] = useState('');
    const [askName, setAskName] = useState(false);
    const [askEmail, setAskEmail] = useState(false);
    const [maxUses, setMaxUses] = useState(0);
    const [instructionTitle, setInstructionTitle] = useState('Complete the Task');
    const [instructionText, setInstructionText] = useState('Please provide the requested information below.');
    const [successMsg, setSuccessMsg] = useState('Access Granted.');
    const [rejectMsg, setRejectMsg] = useState('Request Denied.');
    const [revealType, setRevealType] = useState('none');
    const [revealData, setRevealData] = useState('');
    
    // Dynamic Config
    const [inputs, setInputs] = useState([]);

    // Submissions Display & Filters
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchPhone, setSearchPhone] = useState('');
    const [filterWs, setFilterWs] = useState('all');

    // Modals
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [customRejectReason, setCustomRejectReason] = useState('');
    const [viewTarget, setViewTarget] = useState(null); // For details viewing

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    useEffect(() => {
        if (activeTab === 'submissions') fetchSubmissions();
    }, [activeTab, filterStatus, searchPhone, filterWs]);

    useEffect(() => {
        if (selectedWorkspace) {
            fetchCodes(selectedWorkspace._id);
        }
    }, [selectedWorkspace]);

    const fetchWorkspaces = async () => {
        const res = await fetch(`${API_URL}/secret-codes/workspaces`);
        const data = await res.json();
        setWorkspaces(data);
    };

    const fetchCodes = async (wsId) => {
        const res = await fetch(`${API_URL}/secret-codes/codes/${wsId}`);
        const data = await res.json();
        setCodes(data);
    };

    const fetchSubmissions = async () => {
        const query = new URLSearchParams({
            status: filterStatus,
            workspaceId: filterWs,
            search: searchPhone
        }).toString();
        const res = await fetch(`${API_URL}/secret-codes/submissions?${query}`);
        const data = await res.json();
        setSubmissions(data);
    };

    // --- Actions ---
    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/secret-codes/workspaces`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: wsName, description: wsDesc })
        });
        setWsName('');
        setWsDesc('');
        fetchWorkspaces();
    };

    const handleCreateCode = async (e) => {
        e.preventDefault();
        if(!selectedWorkspace) return alert("Select a workspace first");
        
        await fetch(`${API_URL}/secret-codes/codes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                workspaceId: selectedWorkspace._id,
                codeString: codeStr,
                type: codeType,
                flowMode,
                preApprovedPhones,
                askName, askEmail,
                maxUses,
                instructionTitle,
                instructionText,
                instructionConfig: inputs,
                successMessage: successMsg,
                rejectMessage: rejectMsg,
                revealType,
                revealData
            })
        });
        fetchCodes(selectedWorkspace._id);
        setCodeStr('');
        setInputs([]);
        setPreApprovedPhones('');
        alert("Code Generated Successfully");
    };

    const addInputConfig = () => {
        setInputs([...inputs, { fieldName: '', type: 'text', required: true, placeholder: '' }]);
    };
    const updateInputConfig = (index, field, value) => {
        const newInputs = [...inputs];
        newInputs[index][field] = value;
        setInputs(newInputs);
    };

    const handleApproval = async (subId, status, customMsg = '') => {
        await fetch(`${API_URL}/secret-codes/submissions/${subId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, adminRemark: customMsg })
        });
        fetchSubmissions();
        setShowRejectModal(false);
    };

    const openRejectModal = (subId) => {
        setRejectTarget(subId);
        setShowRejectModal(true);
    };

    return (
        <div className="admin-codes-container">
            <div className="codes-header-tabs">
                <button className={activeTab === 'workspaces' ? 'active' : ''} onClick={() => setActiveTab('workspaces')}>📦 Workspaces</button>
                <button className={activeTab === 'codes' ? 'active' : ''} onClick={() => setActiveTab('codes')}>🔑 Secret Codes</button>
                <button className={activeTab === 'submissions' ? 'active' : ''} onClick={() => setActiveTab('submissions')}>📡 Submissions Review <span className="badge">{submissions.length}</span></button>
            </div>

            {/* ERROR MODAL / REJECT MODAL */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Reject Decision</h3>
                        <textarea 
                            value={customRejectReason} 
                            onChange={(e)=>setCustomRejectReason(e.target.value)} 
                            placeholder="Custom reason (optional)"
                            rows="4" style={{width: '100%', margin: '1rem 0'}}
                        />
                        <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                            <button onClick={()=>setShowRejectModal(false)}>Cancel</button>
                            <button onClick={()=>handleApproval(rejectTarget, 'rejected', customRejectReason)} style={{background: 'red', color: 'white'}}>Confirm Reject</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* VIEW DETAILS MODAL */}
            {viewTarget && (
                <div className="modal-overlay" onClick={()=>setViewTarget(null)}>
                    <div className="modal-content" onClick={e=>e.stopPropagation()} style={{maxWidth: '600px', width: '90%'}}>
                        <h3>Submission Data</h3>
                        <hr style={{margin: '1rem 0', opacity: 0.2}}/>
                        <p><strong>Phone:</strong> {viewTarget.phone}</p>
                        {viewTarget.name && <p><strong>Name:</strong> {viewTarget.name}</p>}
                        {viewTarget.email && <p><strong>Email:</strong> {viewTarget.email}</p>}
                        <div style={{marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px'}}>
                            <h4 style={{marginBottom: '1rem', color: '#334155'}}>Task Answers / Files</h4>
                            {viewTarget.taskData && Object.keys(viewTarget.taskData).length > 0 ? (
                                Object.entries(viewTarget.taskData).map(([key, val]) => (
                                    <div key={key} style={{marginBottom: '0.8rem'}}>
                                        <div style={{fontWeight: 'bold', fontSize: '0.9rem', color: '#64748b'}}>{key.toUpperCase()}</div>
                                        <div>{val}</div>
                                    </div>
                                ))
                            ) : (
                                <p style={{color: '#94a3b8'}}>No task data submitted.</p>
                            )}
                        </div>
                        <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'space-between'}}>
                            {viewTarget.status === 'pending' && (
                                <div style={{display: 'flex', gap: '1rem'}}>
                                    <button onClick={()=>{handleApproval(viewTarget._id, 'approved'); setViewTarget(null);}} style={{background: '#10b981', color: 'white'}}>Approve Request</button>
                                    <button onClick={()=>{openRejectModal(viewTarget._id); setViewTarget(null);}} style={{background: '#ef4444', color: 'white'}}>Reject</button>
                                </div>
                            )}
                            <button onClick={()=>setViewTarget(null)}>Close Viewer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 1: WORKSPACES */}
            {activeTab === 'workspaces' && (
                <div className="tab-content">
                    <h2>Manage Code Workspaces</h2>
                    <form onSubmit={handleCreateWorkspace} className="workspace-form">
                        <input type="text" placeholder="Workspace Name (e.g. Secret Event 2026)" value={wsName} onChange={(e)=>setWsName(e.target.value)} required />
                        <input type="text" placeholder="Description" value={wsDesc} onChange={(e)=>setWsDesc(e.target.value)} />
                        <button type="submit">Create Workspace</button>
                    </form>
                    
                    <div className="ws-grid">
                        {workspaces.map(ws => (
                            <div key={ws._id} className="ws-card">
                                <h3>{ws.name}</h3>
                                <p>{ws.description}</p>
                                <span className={ws.isActive ? 'badge-green' : 'badge-red'}>{ws.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: CODES */}
            {activeTab === 'codes' && (
                <div className="tab-content">
                    <div className="workspace-selector">
                        <label>Select Workspace to Manage Codes:</label>
                        <select onChange={(e) => setSelectedWorkspace(workspaces.find(w => w._id === e.target.value))} value={selectedWorkspace?._id || ''}>
                            <option value="">-- Select Workspace --</option>
                            {workspaces.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                        </select>
                    </div>

                    {selectedWorkspace && (
                        <div className="code-split-view">
                            <div className="code-creator">
                                <h3>Generate Secret Code</h3>
                                <form onSubmit={handleCreateCode} className="code-generator-form">
                                    <input type="text" placeholder="Type secret code string (e.g. ALPHA99)" value={codeStr} style={{fontSize: '1.2rem', fontWeight: 'bold'}} onChange={(e)=>setCodeStr(e.target.value)} required />
                                    
                                    <div className="form-row">
                                        <select value={flowMode} onChange={(e)=>setFlowMode(e.target.value)} style={{background: '#eef2ff', fontWeight: 'bold', color: '#4f46e5'}}>
                                            <option value="verification">Verification Required Mode (Review Manually)</option>
                                            <option value="pre_approved">Pre-Approved Mode (Instant Access)</option>
                                        </select>
                                    </div>
                                    
                                    <div className="form-row">
                                        <select value={codeType} onChange={(e)=>setCodeType(e.target.value)}>
                                            <option value="general">General (Many uses)</option>
                                            <option value="single_use">Single Use</option>
                                        </select>
                                        <input type="number" placeholder="Max uses (0=unlimited)" value={maxUses} onChange={(e)=>setMaxUses(e.target.value)} />
                                    </div>
                                    
                                    {flowMode === 'pre_approved' && (
                                        <div style={{padding: '1rem', background: '#dcfce7', borderRadius: '8px'}}>
                                            <label style={{display:'block', marginBottom: '0.5rem', color: '#166534', fontWeight: 'bold'}}>Pre-approved Phones (Comma separated)</label>
                                            <textarea 
                                                value={preApprovedPhones} 
                                                onChange={(e)=>setPreApprovedPhones(e.target.value)}
                                                placeholder="e.g. 9876543210, 8765432109"
                                                rows="3"
                                            />
                                        </div>
                                    )}

                                    <div style={{display: 'flex', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                                        <label><input type="checkbox" checked={askName} onChange={e=>setAskName(e.target.checked)}/> Ask for Name</label>
                                        <label><input type="checkbox" checked={askEmail} onChange={e=>setAskEmail(e.target.checked)}/> Ask for Email</label>
                                        <span style={{fontSize: '0.8rem', color: '#64748b'}}>Phone is always required.</span>
                                    </div>

                                    <hr />
                                    <h4>Dynamic Instructions Engine</h4>
                                    <input type="text" placeholder="Task Title" value={instructionTitle} onChange={(e)=>setInstructionTitle(e.target.value)} />
                                    <textarea placeholder="Instruction Body" value={instructionText} onChange={(e)=>setInstructionText(e.target.value)} />
                                    
                                    <div className="dynamic-inputs-builder">
                                        <h5>Required User Inputs</h5>
                                        {inputs.map((inp, idx) => (
                                            <div key={idx} className="dynamic-input-row">
                                                <input type="text" placeholder="Field Name (e.g. Verification Selfie)" value={inp.fieldName} onChange={(e)=>updateInputConfig(idx, 'fieldName', e.target.value)} required/>
                                                <select value={inp.type} onChange={(e)=>updateInputConfig(idx, 'type', e.target.value)}>
                                                    <option value="text">Text Input</option>
                                                    <option value="textarea">Large Text Box</option>
                                                    <option value="file">File Upload</option>
                                                </select>
                                                <button type="button" onClick={() => setInputs(inputs.filter((_, i) => i !== idx))} style={{background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px'}}>X</button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={addInputConfig} className="btn-add-input">+ Add Require Input</button>
                                    </div>
                                    <hr />
                                    <h4>Final Success & Reject Configuration</h4>
                                    <input type="text" placeholder="Success Message" value={successMsg} onChange={(e)=>setSuccessMsg(e.target.value)} />
                                    <input type="text" placeholder="Reject Message" value={rejectMsg} onChange={(e)=>setRejectMsg(e.target.value)} />
                                    
                                    <button type="submit" className="btn-huge">Generate Code</button>
                                </form>
                            </div>

                            <div className="code-list">
                                <h3>Active Codes in Workspace</h3>
                                {codes.map(c => (
                                    <div key={c._id} className="secret-code-card">
                                        <h4>{c.codeString}</h4>
                                        <p>Type: {c.type} | Uses: {c.currentUses}/{c.maxUses || '∞'}</p>
                                        <p>Mode: <strong style={{color: c.flowMode==='pre_approved'?'#10b981':'#f59e0b'}}>{c.flowMode}</strong></p>
                                        <span className="sc-badge">{c.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: SUBMISSIONS */}
            {activeTab === 'submissions' && (
                <div className="tab-content">
                    <h2>Real-Time Submissions Control</h2>
                    <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                        <input type="text" placeholder="Search by Phone Number..." value={searchPhone} onChange={e=>setSearchPhone(e.target.value)} style={{flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1'}} />
                        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1'}}>
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending Review</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed / Pre-Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <select value={filterWs} onChange={e=>setFilterWs(e.target.value)} style={{padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1'}}>
                            <option value="all">All Workspaces</option>
                            {workspaces.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                        </select>
                    </div>

                    <table className="admin-table submissions-table">
                        <thead>
                            <tr>
                                <th>Contact Details</th>
                                <th>Code Used</th>
                                <th>Access Mode</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map(sub => (
                                <tr key={sub._id}>
                                    <td>
                                        <strong>{sub.phone}</strong>
                                        {(sub.name || sub.email) && <div style={{fontSize: '0.8rem', color: '#64748b'}}>{sub.name} | {sub.email}</div>}
                                    </td>
                                    <td>
                                        {sub.codeId?.codeString}
                                        <div style={{fontSize: '0.7rem', color: '#94a3b8'}}>{sub.workspaceId?.name}</div>
                                    </td>
                                    <td><span style={{fontSize: '0.85rem', fontWeight: 'bold', color: sub.flowMode==='pre_approved'?'#10b981':'#f59e0b'}}>{(sub.flowMode || 'verification').toUpperCase().replace('_', ' ')}</span></td>
                                    <td><span className={`status-pill pill-${sub.status}`}>{sub.status.toUpperCase()}</span></td>
                                    <td>
                                        <button className="btn-action btn-small" onClick={()=>setViewTarget(sub)}>View Details</button>
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && <tr><td colSpan="5">No submissions found matching criteria.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminCodes;
