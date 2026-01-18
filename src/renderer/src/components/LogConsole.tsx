import React, { useRef, useEffect } from 'react'

interface LogConsoleProps {
    logs: string[]
}

const LogConsole: React.FC<LogConsoleProps> = ({ logs }) => {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    return (
        <div className="log-console">
            {logs.map((log, index) => (
                <div key={index} className="log-line">
                    <span style={{ color: '#888', marginRight: '8px' }}>
                        [{new Date().toLocaleTimeString()}]
                    </span>
                    {log}
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    )
}

export default LogConsole
