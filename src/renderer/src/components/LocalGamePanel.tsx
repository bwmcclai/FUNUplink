import React, { useState, useEffect } from 'react'
import { RconConfig } from '../types'

interface LocalGamePanelProps {
    onInstallMod: () => Promise<void>
    onUninstallMod: () => Promise<void>
}

const LocalGamePanel: React.FC<LocalGamePanelProps> = ({ onInstallMod, onUninstallMod }) => {
    const [data, setData] = useState<{ installed: boolean, path: string, modInstalled: boolean } | null>(null)
    const [loading, setLoading] = useState(false)

    const checkStatus = async () => {
        // @ts-ignore
        const result = await window.context.checkLocalInstall()
        setData(result)
    }

    useEffect(() => {
        checkStatus()
        const interval = setInterval(checkStatus, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleInstall = async () => {
        setLoading(true)
        await onInstallMod()
        await checkStatus()
        setLoading(false)
    }

    const handleUninstall = async () => {
        setLoading(true)
        await onUninstallMod()
        await checkStatus()
        setLoading(false)
    }

    return (
        <div className="factorio-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ borderBottom: '2px solid #e38800', paddingBottom: '10px', color: '#e38800' }}>Local Diagnostics</h2>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', paddingTop: '20px' }}>

                {/* Diagnostics List */}
                <div style={{ width: '100%', marginBottom: '20px', border: '1px solid #333' }}>
                    <div className="led-row">
                        <span>Factorio Installation</span>
                        <div className={`led ${data?.installed ? 'green' : 'red'}`}></div>
                    </div>
                    <div className="led-row">
                        <span>fun_core Mod</span>
                        <div className={`led ${data?.modInstalled ? 'green' : 'red'}`}></div>
                    </div>
                </div>

                {/* Signal Tower Animation */}
                <div className={`signal-tower ${data?.modInstalled && data?.installed ? 'active' : 'inactive'}`}>
                    <div className="signal-icon">📡</div>
                </div>

                {/* Mod Controls */}
                <div style={{ width: '100%', marginTop: 'auto' }}>

                    {data?.installed ? (
                        <>
                            {!data.modInstalled ? (
                                <button
                                    onClick={handleInstall}
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    {loading ? 'Installing...' : 'Install Mod'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleUninstall}
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{ width: '100%', background: 'linear-gradient(180deg, #d65757 0%, #aa0000 100%)', borderColor: '#ff0000' }}
                                >
                                    {loading ? 'Uninstalling...' : 'Uninstall Mod'}
                                </button>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                            SYSTEM OFFLINE<br />
                            <span style={{ fontSize: '0.8em' }}>Factorio not detected</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LocalGamePanel
