import React from 'react'

interface StatusIndicatorProps {
    status: string
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    let color = '#6d6d6d' // Grey
    if (status === 'Connected') color = '#57d657' // Green
    else if (status === 'Error') color = '#d65757' // Red
    else if (status === 'Connecting...') color = '#d6ce57' // Yellow

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div
                style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    marginRight: '10px',
                    boxShadow: `0 0 5px ${color}`
                }}
            />
            <span style={{ fontWeight: 'bold', color: color }}>{status}</span>
        </div>
    )
}

export default StatusIndicator
