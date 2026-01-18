import React from 'react'

interface HeadsUpDisplayProps {
    user: any
    syncStatus: boolean
    onLoginClick: () => void
    onLogoutClick: () => void
    onLogClick: () => void
}

const HeadsUpDisplay: React.FC<HeadsUpDisplayProps> = ({ user, syncStatus, onLoginClick, onLogoutClick, onLogClick }) => {
    return (
        <div style={{
            height: '60px',
            background: '#1a1a1a',
            borderBottom: '2px solid #e38800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '1.5em', marginRight: '10px', color: '#e38800', fontWeight: 'bold' }}>FUN UPLINK</div>
                {syncStatus && <span className="status-light connected blink" style={{ background: '#57d657', padding: '2px 8px', borderRadius: '4px', color: '#000', fontSize: '0.8em', fontWeight: 'bold' }}>SYNCING</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                    onClick={onLogClick}
                    className="btn-primary"
                    style={{
                        marginRight: '15px',
                        background: '#333',
                        border: '1px solid #e38800',
                        color: '#e38800',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9em',
                        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)'
                    }}
                    title="System Terminal"
                >
                    <span style={{ fontSize: '1.2em' }}>&gt;_</span> TERMINAL
                </button>

                {user ? (
                    <>
                        <div style={{ marginRight: '15px', textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8em', color: '#888' }}>OPERATIVE</div>
                            <div style={{ color: '#fff', fontWeight: 'bold' }}>{user.email}</div>
                        </div>
                        <button onClick={onLogoutClick} className="btn-primary" style={{ padding: '5px 15px', fontSize: '0.8em', background: '#333' }}>Logout</button>
                    </>
                ) : (
                    <button onClick={onLoginClick} className="btn-primary" style={{ padding: '8px 20px' }}>Establish Global Uplink</button>
                )}
            </div>
        </div>
    )
}

export default HeadsUpDisplay
