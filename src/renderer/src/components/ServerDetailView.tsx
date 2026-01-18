import React, { useState, useEffect } from 'react'
import { Connection } from '../types'

interface ServerDetailViewProps {
    connection: Connection | null
    onInstallMod: () => Promise<void>
    onUninstallMod: () => Promise<void>
    onRestartServer: () => void
    onDisconnect: () => void
}

const ServerDetailView: React.FC<ServerDetailViewProps> = ({
    connection,
    onInstallMod,
    onUninstallMod,
    onRestartServer,
    onDisconnect
}) => {
    const [localData, setLocalData] = useState<{ installed: boolean, path: string, modInstalled: boolean } | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (connection?.type === 'local') {
            checkLocalStatus()
            const interval = setInterval(checkLocalStatus, 5000)
            return () => clearInterval(interval)
        }
    }, [connection?.id]) // Changed dependency to connection.id

    const checkLocalStatus = async () => {
        // @ts-ignore
        if (!window.context) {
            console.warn('window.context not available')
            return
        }

        try {
            // @ts-ignore
            const result = await window.context.checkLocalInstall()
            setLocalData(result)
        } catch (error) {
            console.error('Failed to check local install:', error)
        }
    }

    const handleInstall = async () => {
        setLoading(true)
        await onInstallMod()
        if (connection?.type === 'local') {
            await checkLocalStatus()
        }
        setLoading(false)
    }

    const handleUninstall = async () => {
        setLoading(true)
        await onUninstallMod()
        if (connection?.type === 'local') {
            await checkLocalStatus()
        }
        setLoading(false)
    }

    if (!connection) {
        return (
            <div className="factorio-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#888' }}>
                    <div style={{ fontSize: '2em', marginBottom: '10px' }}>🔌</div>
                    <div>Select a connection to view details</div>
                </div>
            </div>
        )
    }

    const isLocal = connection.type === 'local'
    const isConnected = connection.status === 'connected' || connection.status === 'ready'
    const modInstalled = isLocal ? localData?.modInstalled : connection.modInstalled

    return (
        <div className="factorio-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <h2 style={{ borderBottom: '2px solid #e38800', paddingBottom: '10px', color: '#e38800', margin: '0 0 20px 0' }}>
                {connection.name}
            </h2>

            {/* Connection Info Card */}
            <div style={{ padding: '15px', background: '#222', border: '1px solid #444', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '0.9em' }}>
                    <div>
                        <div style={{ color: '#888', marginBottom: '5px' }}>Type</div>
                        <div style={{ color: '#fff', fontWeight: 'bold', textTransform: 'uppercase' }}>{connection.type}</div>
                    </div>
                    <div>
                        <div style={{ color: '#888', marginBottom: '5px' }}>Status</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className={`led ${isConnected ? 'green' : 'red'}`}></div>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{connection.status.toUpperCase()}</span>
                        </div>
                    </div>
                    {connection.rconConfig && (
                        <>
                            <div>
                                <div style={{ color: '#888', marginBottom: '5px' }}>Host</div>
                                <div style={{ color: '#fff', fontFamily: 'monospace' }}>{connection.rconConfig.host}</div>
                            </div>
                            <div>
                                <div style={{ color: '#888', marginBottom: '5px' }}>Port</div>
                                <div style={{ color: '#fff', fontFamily: 'monospace' }}>{connection.rconConfig.port}</div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Diagnostics */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#e38800', fontSize: '0.9em', marginBottom: '10px' }}>DIAGNOSTICS</h3>
                <div style={{ border: '1px solid #333' }}>
                    {isLocal && (
                        <div className="led-row">
                            <span>Factorio Installation</span>
                            <div className={`led ${localData?.installed ? 'green' : 'red'}`}></div>
                        </div>
                    )}
                    <div className="led-row">
                        <span>fun_core Mod</span>
                        <div className={`led ${modInstalled ? 'green' : 'red'}`}></div>
                    </div>
                </div>
            </div>

            {/* Signal Tower */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div className={`signal-tower ${isConnected && (isLocal ? localData?.installed : true) ? 'active' : 'inactive'}`}>
                    <div className="signal-icon">{isLocal ? '📡' : '📶'}</div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 'auto' }}>
                {isLocal && localData?.installed ? (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        {!localData.modInstalled ? (
                            <button
                                onClick={handleInstall}
                                disabled={loading}
                                className="btn-primary"
                                style={{ flex: 1 }}
                            >
                                {loading ? 'Installing...' : 'Install Mod'}
                            </button>
                        ) : (
                            <button
                                onClick={handleUninstall}
                                disabled={loading}
                                className="btn-primary"
                                style={{
                                    flex: 1,
                                    background: 'linear-gradient(180deg, #d65757 0%, #aa0000 100%)',
                                    borderColor: '#ff0000'
                                }}
                            >
                                {loading ? 'Uninstalling...' : 'Uninstall Mod'}
                            </button>
                        )}
                    </div>
                ) : null}

                {!isLocal && isConnected && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn-primary"
                            onClick={onRestartServer}
                            style={{
                                flex: 1,
                                background: 'linear-gradient(180deg, #e38800 0%, #aa6600 100%)'
                            }}
                        >
                            Restart Server
                        </button>
                        <button
                            className="btn-primary"
                            onClick={onDisconnect}
                            style={{ flex: 1, background: '#666' }}
                        >
                            Disconnect
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ServerDetailView
