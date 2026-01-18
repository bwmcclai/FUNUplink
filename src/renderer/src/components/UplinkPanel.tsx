import React, { useState } from 'react'
import LoginPanel from './LoginPanel'
import { AuthCredentials } from '../types'

interface UplinkPanelProps {
    user: any
    onLogin: (creds: AuthCredentials) => void
    onLogout: () => void
    syncStatus: boolean
}

const UplinkPanel: React.FC<UplinkPanelProps> = ({ user, onLogin, onLogout, syncStatus }) => {
    const [showLogin, setShowLogin] = useState(false)

    if (user) {
        return (
            <div className="uplink-panel" style={{ border: '2px solid #57d657', padding: '15px', marginTop: '20px', backgroundColor: '#111' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#57d657' }}>Network Uplink: ACTIVE</h3>
                    <button onClick={onLogout} className="btn-primary" style={{ width: 'auto', padding: '5px 10px', fontSize: '0.8em' }}>Disconnect</button>
                </div>
                <p style={{ margin: '10px 0 0' }}>Operative: <strong>{user.email}</strong></p>
                <p>Sync Status: {syncStatus ? <span style={{ color: '#57d657' }}>SYNCING</span> : <span style={{ color: '#888' }}>IDLE</span>}</p>
            </div>
        )
    }

    if (showLogin) {
        return (
            <div style={{ marginTop: '20px', border: '2px solid #e38800', padding: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                    <button onClick={() => setShowLogin(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>Cancel</button>
                </div>
                <LoginPanel onLogin={onLogin} />
            </div>
        )
    }

    return (
        <div className="uplink-panel" style={{ border: '2px dashed #6d6d6d', padding: '15px', marginTop: '20px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#888' }}>Network Uplink: OFFLINE</h3>
            <p style={{ fontSize: '0.9em', color: '#aaa' }}>Connect to the Cloud Network to trade items and sync inventory.</p>
            <button onClick={() => setShowLogin(true)} className="btn-primary" style={{ marginTop: '10px' }}>Establish Global Uplink</button>
        </div>
    )
}

export default UplinkPanel
