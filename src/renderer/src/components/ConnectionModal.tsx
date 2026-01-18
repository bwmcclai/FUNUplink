import React, { useState } from 'react'
import { RconConfig } from '../types'

interface ConnectionModalProps {
    onClose: () => void
    onSave: (name: string, config: RconConfig) => void
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('')
    const [host, setHost] = useState('')
    const [port, setPort] = useState('27015')
    const [password, setPassword] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(name, { host, port, password })
        onClose()
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '500px' }}>
                <button className="modal-close" onClick={onClose}>X</button>
                <h2 style={{ color: '#e38800', marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                    Add Remote Connection
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9em' }}>
                            Connection Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Production Server"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9em' }}>
                            RCON Host
                        </label>
                        <input
                            type="text"
                            value={host}
                            onChange={(e) => setHost(e.target.value)}
                            placeholder="e.g. 172.240.240.236"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9em' }}>
                            RCON Port
                        </label>
                        <input
                            type="text"
                            value={port}
                            onChange={(e) => setPort(e.target.value)}
                            placeholder="27015"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9em' }}>
                            RCON Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="RCON password"
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                            Save Connection
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-primary"
                            style={{ flex: 1, background: '#666' }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ConnectionModal
