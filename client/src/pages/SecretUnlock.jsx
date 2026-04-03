import { useState, useEffect } from 'react';
import API_URL from '../config';
import './SecretFlow.css';

// --- SUB-COMPONENTS --- //

const AccessPortal = ({ onVerify, errorMsg, isLoading }) => {
    const [code, setCode] = useState('');
    const [phone, setPhone] = useState('');
    
    return (
        <div className="cinematic-container">
            <h1 className="glowing-title" style={{marginBottom: '0'}}>SECURE ACCESS</h1>
            <p style={{color: '#94a3b8', marginBottom: '2rem'}}>ENTER CREDENTIALS TO PROCEED</p>
            
            <input 
                type="text" 
                className="secret-input" 
                placeholder="SECRET CODE" 
                value={code} 
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                autoFocus
            />
            <input 
                type="text" 
                className="secret-input" 
                placeholder="PHONE NUMBER" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
            />
            {errorMsg && <p style={{color: '#ef4444', marginBottom: '1rem', fontWeight: 'bold'}}>{errorMsg}</p>}
            
            <button className="secret-btn" onClick={() => onVerify(code, phone)} disabled={isLoading || !code || !phone}>
                {isLoading ? '...INITIALIZING...' : 'AUTHENTICATE'}
            </button>
        </div>
    );
};

const IdentityView = ({ config, onNext, isLoading }) => {
    const [form, setForm] = useState({ name: '', email: '' });
    
    return (
        <div className="cinematic-container">
            <h2 className="glowing-title" style={{fontSize: '2rem'}}>SECONDARY VERIFICATION</h2>
            <div className="task-form">
                {config.askName && (
                    <>
                        <label>Legal Name</label>
                        <input type="text" className="secret-input secret-input-small" required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
                    </>
                )}
                {config.askEmail && (
                    <>
                        <label>Verified Email</label>
                        <input type="email" className="secret-input secret-input-small" required value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
                    </>
                )}
                
                <button className="secret-btn" onClick={() => onNext(form)} disabled={isLoading || (config.askName && !form.name) || (config.askEmail && !form.email)}>
                    PROCEED TO OBJECTIVE
                </button>
            </div>
        </div>
    );
};

const TaskRoomView = ({ payload, onSubmitTask, isLoading }) => {
    const [responses, setResponses] = useState({});

    useEffect(() => {
        if (!payload.instructions || payload.instructions.length === 0) {
            onSubmitTask({});
        }
    }, [payload.instructions, onSubmitTask]);

    if (!payload.instructions || payload.instructions.length === 0) {
        return <div className="cinematic-container"><div className="loader-core"></div></div>;
    }

    return (
        <div className="cinematic-container" style={{maxWidth: '800px'}}>
            <h2 className="glowing-title" style={{fontSize: '2rem'}}>{payload.title}</h2>
            <p style={{color: '#a78bfa', marginBottom: '2rem'}}>{payload.text}</p>
            
            <div className="task-form">
                {payload.instructions.map((inp, idx) => (
                    <div key={idx} style={{marginBottom: '1.5rem'}}>
                        <label>{inp.fieldName} {inp.required && '*'}</label>
                        {inp.type === 'textarea' ? (
                            <textarea 
                                className="secret-input secret-input-small" 
                                style={{height: '100px'}}
                                placeholder={inp.placeholder}
                                onChange={(e) => setResponses({...responses, [inp.fieldName]: e.target.value})}
                            ></textarea>
                        ) : inp.type === 'file' ? (
                            <input 
                                type="file" 
                                className="secret-input secret-input-small"
                                onChange={(e) => alert("File upload simulated. Use standard links for now.")}
                            />
                        ) : (
                            <input 
                                type={inp.type} 
                                className="secret-input secret-input-small"
                                placeholder={inp.placeholder}
                                onChange={(e) => setResponses({...responses, [inp.fieldName]: e.target.value})}
                            />
                        )}
                    </div>
                ))}
                <button className="secret-btn" onClick={() => onSubmitTask(responses)} disabled={isLoading}>
                    {isLoading ? 'UPLOADING...' : 'TRANSMIT & REDEEM'}
                </button>
            </div>
        </div>
    );
};

const UnderReviewView = () => (
    <div className="cinematic-container">
        <div className="loader-core" style={{animationDuration: '6s', borderLeftColor: '#fcd34d'}}></div>
        <h2 className="glowing-title" style={{fontSize: '2rem', color: '#fcd34d', textShadow: '0 0 20px rgba(252, 211, 77, 0.4)'}}>UNDER REVIEW</h2>
        <p className="rejection-text" style={{color: '#cbd5e1'}}>CODE REDEEMED SUCCESSFULLY. <br/><br/>YOUR SUBMISSION IS CURRENTLY PENDING ADMINISTRATOR APPROVAL. PLEASE RETURN AND RE-AUTHENTICATE LATER TO CHECK YOUR CLEARANCE STATUS.</p>
    </div>
);

const RejectionView = ({ message }) => (
    <div className="cinematic-container">
        <div className="rejection-cube"></div>
        <h2 className="glowing-title" style={{color: '#ef4444', textShadow: '0 0 20px rgba(239, 68, 68, 0.5)'}}>ACCESS DENIED</h2>
        <p className="rejection-text">{message || 'SYSTEM ADMINISTRATOR HAS REJECTED THIS HANDSHAKE.'}</p>
    </div>
);

const SuccessView = ({ submissionId }) => {
    const [data, setData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/secret-codes/status/${submissionId}`)
            .then(res => res.json())
            .then(resData => {
                setData(resData);
                if (resData.revealTime) {
                    const target = new Date(resData.revealTime).getTime();
                    const timer = setInterval(() => {
                        const now = new Date().getTime();
                        const distance = target - now;
                        if (distance < 0) {
                            clearInterval(timer);
                            setTimeLeft('REVEALED');
                        } else {
                            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
                            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                            const s = Math.floor((distance % (1000 * 60)) / 1000);
                            setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
                        }
                    }, 1000);
                    return () => clearInterval(timer);
                }
            });
    }, [submissionId]);

    if (!data) return <div className="cinematic-container"><div className="loader-core"></div></div>;

    return (
        <div className="cinematic-container">
            <div className="success-orb"></div>
            <h2 className="glowing-title" style={{color: '#10b981', textShadow: '0 0 20px rgba(16, 185, 129, 0.5)'}}>CLEARANCE GRANTED</h2>
            <p style={{fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '2rem'}} dangerouslySetInnerHTML={{__html: data.successMessage}}></p>
            
            {data.revealType && data.revealType !== 'none' && (
                <div style={{background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '12px'}}>
                    <h3 style={{color: '#fcd34d', marginBottom: '1rem'}}>CLASSIFIED REVEAL</h3>
                    {timeLeft && timeLeft !== 'REVEALED' ? (
                        <div className="countdown-timer">{timeLeft}</div>
                    ) : (
                        <div style={{animation: 'fadeUpIn 1s'}}>
                            {data.revealType === 'link' ? (
                                <a href={data.revealData} target="_blank" rel="noreferrer" className="secret-btn" style={{display: 'inline-block', width: 'auto', padding: '1rem 3rem'}}>ACCESS SECURE DECRYPT LINK</a>
                            ) : (
                                <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{data.revealData}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- MAIN ROUTER COMPONENT --- //

const SecretFlowRouter = () => {
    // Flow states: 'portal' -> 'identity' -> 'task' -> 'under_review' | 'success' | 'rejected'
    const [view, setView] = useState('portal');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Core payload memory
    const [coreData, setCoreData] = useState({
        code: '', phone: '', codeId: '', workspaceId: '', name: '', email: ''
    });
    const [configPayload, setConfigPayload] = useState({});
    const [submissionId, setSubmissionId] = useState(null);
    const [rejectMessage, setRejectMessage] = useState('');

    const handleVerify = async (code, phone) => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const res = await fetch(`${API_URL}/secret-codes/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, phone })
            });
            const data = await res.json();
            
            if (!data.valid) {
                setErrorMsg(data.message);
                setIsLoading(false);
                return;
            }

            // Rapid Re-entry routing
            if (data.reEntry) {
                setSubmissionId(data.submissionId);
                if (data.status === 'completed' || data.status === 'approved') setView('success');
                else if (data.status === 'pending') setView('under_review');
                else {
                    // It's rejected, grab reason
                    const statusRes = await fetch(`${API_URL}/secret-codes/status/${data.submissionId}`);
                    const statusData = await statusRes.json();
                    setRejectMessage(statusData.adminRemark);
                    setView('rejected');
                }
                setIsLoading(false);
                return;
            }

            // Fresh Path Setup
            setCoreData({ ...coreData, code, phone, codeId: data.codeId, workspaceId: data.workspaceId });
            setConfigPayload({
                flowMode: data.flowMode,
                askName: data.askName,
                askEmail: data.askEmail,
                title: data.instructionTitle,
                text: data.instructionText,
                instructions: data.instructionConfig
            });

            // Route to identity if required, else skip to Task logic
            if (data.askName || data.askEmail) {
                setView('identity');
            } else {
                setView('task');
            }
        } catch(e) { setErrorMsg('VERIFICATION NETWORK FAILURE.'); }
        setIsLoading(false);
    };

    const handleIdentitySubmit = (form) => {
        setCoreData({ ...coreData, name: form.name, email: form.email });
        setView('task');
    };

    const handleTaskSubmit = async (taskData) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/secret-codes/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codeId: coreData.codeId,
                    workspaceId: coreData.workspaceId,
                    phone: coreData.phone,
                    name: coreData.name,
                    email: coreData.email,
                    taskData
                })
            });
            const data = await res.json();
            
            if (data.success) {
                setSubmissionId(data.submissionId);
                // Pre-approved goes straight to success room. Verification goes to pending.
                if (data.status === 'completed') {
                    setView('success');
                } else {
                    setView('under_review');
                }
            } else {
                setErrorMsg(data.message || 'Transmission failed.');
                setView('portal');
            }
        } catch(e) { 
            setErrorMsg('TRANSMISSION NETWORK FAILURE.'); 
            setView('portal');
        }
        setIsLoading(false);
    };

    return (
        <div className="secret-flow-wrapper">
            {view === 'portal' && <AccessPortal onVerify={handleVerify} errorMsg={errorMsg} isLoading={isLoading} />}
            {view === 'identity' && <IdentityView config={configPayload} onNext={handleIdentitySubmit} isLoading={isLoading} />}
            {view === 'task' && <TaskRoomView payload={configPayload} onSubmitTask={handleTaskSubmit} isLoading={isLoading} />}
            {view === 'under_review' && <UnderReviewView />}
            {view === 'rejected' && <RejectionView message={rejectMessage} />}
            {view === 'success' && <SuccessView submissionId={submissionId} />}
        </div>
    );
};

export default SecretFlowRouter;
