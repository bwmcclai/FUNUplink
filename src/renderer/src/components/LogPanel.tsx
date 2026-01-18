import React, { useEffect, useRef } from 'react'

interface LogPanelProps {
    logs: string[]
    onClose: () => void
    onClear: () => void
}

const LogPanel: React.FC<LogPanelProps> = ({ logs, onClose, onClear }) => {
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [logs])

    const handleExport = () => {
        const logText = logs.join('\n')
        const blob = new Blob([logText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fun-uplink-logs-${new Date().toISOString().replace(/:/g, '-')}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '80vw', maxHeight: '80vh' }}>
                <button className="modal-close" onClick={onClose}>X</button>
                <h2 style={{ color: '#e38800', marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>System Terminal</h2>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button
                        onClick={onClear}
                        className="btn-primary"
                        style={{
                            padding: '6px 15px',
                            fontSize: '0.9em',
                            background: 'linear-gradient(180deg, #d65757 0%, #aa0000 100%)',
                            borderColor: '#ff0000'
                        }}
                    >
                        Clear Logs
                    </button>
                    <button
                        onClick={handleExport}
                        className="btn-primary"
                        style={{ padding: '6px 15px', fontSize: '0.9em' }}
                    >
                        Export Logs
                    </button>
                    <div style={{ flex: 1, textAlign: 'right', color: '#888', fontSize: '0.9em', alignSelf: 'center' }}>
                        {logs.length} log entries
                    </div>
                </div>

                <div className="lcd-screen" style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10px',
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    background: '#000',
                    border: '1px solid #444',
                    color: '#57d657',
                    height: 'calc(80vh - 150px)'
                }}>
                    {logs.length === 0 && <span style={{ opacity: 0.5 }}>Waiting for input...</span>}
                    {logs.map((log, i) => (
                        <div key={i} className="log-line">{log}</div>
                    ))}
                    <div ref={endRef}></div>
                </div>
            </div>
        </div>
    )
}

export default LogPanel
