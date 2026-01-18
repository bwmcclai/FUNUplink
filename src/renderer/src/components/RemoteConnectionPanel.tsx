import React, { useState } from 'react'
import ConnectionPanel from './ConnectionPanel'
import { RconConfig } from '../types'

interface RemoteConnectionPanelProps {
    status: string
    logs: string[]
    rconConfig: RconConfig | null
    onConnect: (config: RconConfig) => Promise<void>
}

const RemoteConnectionPanel: React.FC<RemoteConnectionPanelProps> = ({ status, logs, rconConfig, onConnect }) => {
    const isConnected = status === 'Connected'

    return (
        <div className="factorio-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ borderBottom: '2px solid #e38800', paddingBottom: '10px', color: '#e38800' }}>Remote Uplink</h2>

            <div style={{ paddingTop: '20px' }}>
                {/* Diagnostics List */}
                <div style={{ width: '100%', marginBottom: '20px', border: '1px solid #333' }}>
                    <div className="led-row">
                        <span>RCON Link</span>
                        <div className={`led ${isConnected ? 'green' : (status === 'Connecting...' ? 'yellow' : 'red')}`}></div>
                    </div>
                </div>

                {/* Signal Tower Animation */}
                <div className={`signal-tower ${isConnected ? 'active' : 'inactive'}`}>
                    <div className="signal-icon">📶</div>
                </div>

                {/* Connection Details (when connected) */}
                {isConnected && rconConfig && (
                    <div style={{ marginTop: '20px', padding: '15px', background: '#222', border: '1px solid #444' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#e38800', fontSize: '0.9em' }}>Connection Details</h4>
                        <div style={{ fontSize: '0.85em', lineHeight: '1.6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ color: '#888' }}>Host:</span>
                                <span style={{ color: '#fff', fontFamily: 'monospace' }}>{rconConfig.host}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ color: '#888' }}>Port:</span>
                                <span style={{ color: '#fff', fontFamily: 'monospace' }}>{rconConfig.port}</span>
                            </div>
                        </div>

                        {/* Server Controls */}
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #444', display: 'flex', gap: '10px' }}>
                            <button
                                className="btn-primary"
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    fontSize: '0.85em',
                                    background: 'linear-gradient(180deg, #e38800 0%, #aa6600 100%)'
                                }}
                                onClick={() => {
                                    if (confirm('Are you sure you want to restart the server? This will disconnect all players.')) {
                                        // @ts-ignore
                                        window.context.restartServer?.()
                                    }
                                }}
                            >
                                Restart Server
                            </button>
                            <button
                                className="btn-primary"
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    fontSize: '0.85em',
                                    background: '#666'
                                }}
                                onClick={() => {
                                    window.location.reload()
                                }}
                            >
                                Disconnect
                            </button>
                        </div>
                    </div>
                )}

                {/* Connection Controls (Hide if connected) */}
                {!isConnected && (
                    <div style={{ marginBottom: '20px' }}>
                        <ConnectionPanel onConnect={onConnect} disabled={status === 'Connecting...'} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default RemoteConnectionPanel
