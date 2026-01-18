import React, { useState } from 'react'

interface ModInstallerPanelProps {
    onInstall: () => Promise<void>
}

const ModInstallerPanel: React.FC<ModInstallerPanelProps> = ({ onInstall }) => {
    const [installing, setInstalling] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const handleInstall = async () => {
        setInstalling(true)
        setMessage("Installing mod...")
        try {
            await onInstall()
            setMessage("Installation verified.")
        } catch (e: any) {
            setMessage(`Error: ${e.message}`)
        } finally {
            setInstalling(false)
        }
    }

    return (
        <div className="status-panel" style={{ marginTop: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#e38800' }}>Mod Management</h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>FUN_Mod: </span>
                <button
                    onClick={handleInstall}
                    disabled={installing}
                    className="btn-primary"
                    style={{ width: 'auto', padding: '5px 15px', fontSize: '0.8em' }}
                >
                    {installing ? 'Installing...' : 'Install / Update Mod'}
                </button>
            </div>
            {message && <p style={{ fontSize: '0.8em', marginTop: '5px', color: message.includes('Error') ? '#d65757' : '#ccc' }}>{message}</p>}
        </div>
    )
}

export default ModInstallerPanel
