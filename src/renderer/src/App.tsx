import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import LoginPanel from './components/LoginPanel'
import LogPanel from './components/LogPanel'
import ConnectionModal from './components/ConnectionModal'
import { RconConfig, Connection } from './types'

function App() {
    const [user, setUser] = useState<any>(null)
    const [status, setStatus] = useState('Disconnected')
    const [logs, setLogs] = useState<string[]>([])
    const [isSyncing, setIsSyncing] = useState(false)
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showLogModal, setShowLogModal] = useState(false)
    const [showConnectionModal, setShowConnectionModal] = useState(false)
    const [connections, setConnections] = useState<Connection[]>([])
    const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)

    useEffect(() => {
        // Initialize with local connection
        const localConnection: Connection = {
            id: 'local',
            type: 'local',
            name: 'Local Server',
            status: 'ready'
        }
        setConnections([localConnection])
        setSelectedConnectionId('local')

        // Check if running in Electron
        // @ts-ignore
        if (!window.context) {
            console.warn('Not running in Electron environment')
            return
        }

        // Listen for status changes
        // @ts-ignore
        window.context.onStatusChange((newStatus: string) => {
            setStatus(newStatus)

            // Update selected connection status if it's remote
            if (selectedConnectionId && selectedConnectionId !== 'local') {
                setConnections(prev => prev.map(conn =>
                    conn.id === selectedConnectionId
                        ? { ...conn, status: newStatus === 'Connected' ? 'connected' : newStatus === 'Connecting...' ? 'connecting' : 'offline' }
                        : conn
                ))
            }
        })

        // Listen for logs
        // @ts-ignore
        window.context.onLog((message: string) => {
            setLogs(prev => [...prev, message])
        })

        // Listen for sync status changes
        // @ts-ignore
        window.context.onSyncChange((syncing: boolean) => {
            setIsSyncing(syncing)
        })

        // Check for existing session
        checkSession()
    }, [])

    const checkSession = async () => {
        // @ts-ignore
        if (!window.context) return

        // @ts-ignore
        const session = await window.context.getSession()
        if (session?.user) {
            setUser(session.user)
        }
    }

    const handleLogin = async (creds: { email: string, password: string }) => {
        // @ts-ignore
        const result = await window.context.login(creds)
        if (result.user) {
            setUser(result.user)
            setShowLoginModal(false)
        }
    }

    const handleLogout = async () => {
        // @ts-ignore
        await window.context.logout()
        setUser(null)
    }

    const handleAddConnection = (name: string, config: RconConfig) => {
        const newConnection: Connection = {
            id: `remote-${Date.now()}`,
            type: 'remote',
            name,
            rconConfig: config,
            status: 'offline'
        }
        setConnections(prev => [...prev, newConnection])
        setSelectedConnectionId(newConnection.id)
    }

    const handleSelectConnection = (id: string) => {
        setSelectedConnectionId(id)

        // If selecting a remote connection, auto-connect
        const connection = connections.find(c => c.id === id)
        if (connection?.type === 'remote' && connection.rconConfig) {
            handleConnect()
        }
    }

    const handleConnect = async () => {
        const connection = connections.find(c => c.id === selectedConnectionId)
        if (!connection?.rconConfig) return

        setStatus('Connecting...')
        try {
            // @ts-ignore
            await window.context.connectRcon(connection.rconConfig)
        } catch (e) {
            // Handled by listener
        }
    }

    const handleInstallMod = async () => {
        // @ts-ignore
        if (!window.context) return

        // @ts-ignore
        const result = await window.context.installMod()
        setLogs(prev => [...prev, result.message])
    }

    const handleClearLogs = () => {
        setLogs([])
    }

    const handleUninstallMod = async () => {
        // @ts-ignore
        if (!window.context) return

        // @ts-ignore
        const result = await window.context.uninstallMod()
        setLogs(prev => [...prev, result.message])
    }

    const handleRestartServer = () => {
        if (confirm('Are you sure you want to restart the server? This will disconnect all players.')) {
            // @ts-ignore
            window.context.restartServer?.()
        }
    }

    const handleDisconnect = () => {
        window.location.reload()
    }

    return (
        <>
            <Dashboard
                user={user}
                syncStatus={isSyncing}
                connections={connections}
                selectedConnectionId={selectedConnectionId}
                onSelectConnection={handleSelectConnection}
                onAddConnection={() => setShowConnectionModal(true)}
                onConnect={handleConnect}
                onLoginClick={() => setShowLoginModal(true)}
                onLogoutClick={handleLogout}
                onInstallMod={handleInstallMod}
                onUninstallMod={handleUninstallMod}
                onRestartServer={handleRestartServer}
                onDisconnect={handleDisconnect}
                onLogClick={() => setShowLogModal(true)}
            />

            {showLoginModal && (
                <LoginPanel onLogin={handleLogin} />
            )}

            {showLogModal && (
                <LogPanel logs={logs} onClose={() => setShowLogModal(false)} onClear={handleClearLogs} />
            )}

            {showConnectionModal && (
                <ConnectionModal
                    onClose={() => setShowConnectionModal(false)}
                    onSave={handleAddConnection}
                />
            )}
        </>
    )
}

export default App
