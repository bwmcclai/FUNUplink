import React, { useState } from 'react'
import { AuthCredentials } from '../types'

interface LoginPanelProps {
    onLogin: (creds: AuthCredentials) => void
}

const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onLogin({ email, password })
    }

    return (
        <div className="connection-panel" style={{ maxWidth: '400px', margin: '0 auto', top: '50px', position: 'relative' }}>
            <h3 style={{ textAlign: 'center', color: '#e38800' }}>F.U.N. Access Terminal</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Operative ID (Email):</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Passcode:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary">Authenticate</button>
            </form>
        </div>
    )
}

export default LoginPanel
