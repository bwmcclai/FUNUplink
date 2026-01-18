import React, { useState } from 'react'
import { RconConfig } from '../types'

interface ConnectionPanelProps {
    onConnect: (config: RconConfig) => void
    disabled: boolean
}

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({ onConnect, disabled }) => {
    const [host, setHost] = useState('127.0.0.1')
    const [port, setPort] = useState('27015')
    const [password, setPassword] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onConnect({ host, port, password })
    }

    return (
        <form onSubmit={handleSubmit} className="connection-panel">
            <h3>RCON Connection</h3>
            <div className="form-group">
                <label>Host:</label>
                <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    disabled={disabled}
                />
            </div>
            <div className="form-group">
                <label>Port:</label>
                <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    disabled={disabled}
                />
            </div>
            <div className="form-group">
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={disabled}
                />
            </div>
            <button type="submit" disabled={disabled} className="btn-primary">
                {disabled ? 'Connecting...' : 'Connect'}
            </button>
        </form>
    )
}

export default ConnectionPanel
