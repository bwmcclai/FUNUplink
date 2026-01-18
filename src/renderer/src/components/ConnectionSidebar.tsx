import React from 'react'
import { Connection } from '../types'

interface ConnectionSidebarProps {
    connections: Connection[]
    selectedId: string | null
    onSelect: (id: string) => void
    onAddConnection: () => void
}

const ConnectionSidebar: React.FC<ConnectionSidebarProps> = ({
    connections,
    selectedId,
    onSelect,
    onAddConnection
}) => {
    return (
        <div className="factorio-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '15px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#e38800', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                CONNECTIONS
            </h3>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '15px' }}>
                {connections.map(conn => (
                    <div
                        key={conn.id}
                        onClick={() => onSelect(conn.id)}
                        style={{
                            padding: '12px',
                            marginBottom: '8px',
                            background: conn.id === selectedId ? '#2a2a2a' : '#1a1a1a',
                            border: `1px solid ${conn.id === selectedId ? '#e38800' : '#333'}`,
                            cursor: 'pointer',
                            borderRadius: '2px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div
                                    className={`led ${conn.status === 'ready' || conn.status === 'connected' ? 'green' :
                                            conn.status === 'connecting' ? 'yellow' : 'red'
                                        }`}
                                ></div>
                                <span style={{ fontWeight: 'bold', color: '#fff' }}>{conn.name}</span>
                            </div>
                            <span style={{ fontSize: '0.7em', color: '#888', textTransform: 'uppercase' }}>
                                {conn.type}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.75em', color: '#666', marginTop: '4px', marginLeft: '20px' }}>
                            {conn.status === 'ready' && 'Ready'}
                            {conn.status === 'connected' && 'Connected'}
                            {conn.status === 'offline' && 'Offline'}
                            {conn.status === 'connecting' && 'Connecting...'}
                            {conn.status === 'error' && 'Error'}
                        </div>
                    </div>
                ))}
            </div>

            <button
                className="btn-primary"
                onClick={onAddConnection}
                style={{ width: '100%', padding: '10px' }}
            >
                + Add Connection
            </button>
        </div>
    )
}

export default ConnectionSidebar
