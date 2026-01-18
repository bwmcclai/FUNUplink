import React from 'react'
import HeadsUpDisplay from './HeadsUpDisplay'
import ConnectionSidebar from './ConnectionSidebar'
import ServerDetailView from './ServerDetailView'
import { Connection } from '../types'

interface DashboardProps {
    user: any
    syncStatus: boolean
    connections: Connection[]
    selectedConnectionId: string | null
    onSelectConnection: (id: string) => void
    onAddConnection: () => void
    onConnect: () => Promise<void>
    onLoginClick: () => void
    onLogoutClick: () => Promise<void>
    onInstallMod: () => Promise<void>
    onUninstallMod: () => Promise<void>
    onRestartServer: () => void
    onDisconnect: () => void
    onLogClick: () => void
}

const Dashboard: React.FC<DashboardProps> = ({
    user, syncStatus, connections, selectedConnectionId,
    onSelectConnection, onAddConnection,
    onLoginClick, onLogoutClick, onInstallMod, onUninstallMod,
    onRestartServer, onDisconnect, onLogClick
}) => {
    const selectedConnection = connections.find(c => c.id === selectedConnectionId) || null

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <HeadsUpDisplay
                user={user}
                syncStatus={syncStatus}
                onLoginClick={onLoginClick}
                onLogoutClick={onLogoutClick}
                onLogClick={onLogClick}
            />

            <div style={{ flex: 1, padding: '20px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', overflow: 'hidden' }}>
                <ConnectionSidebar
                    connections={connections}
                    selectedId={selectedConnectionId}
                    onSelect={onSelectConnection}
                    onAddConnection={onAddConnection}
                />
                <ServerDetailView
                    connection={selectedConnection}
                    onInstallMod={onInstallMod}
                    onUninstallMod={onUninstallMod}
                    onRestartServer={onRestartServer}
                    onDisconnect={onDisconnect}
                />
            </div>
        </div>
    )
}

export default Dashboard
