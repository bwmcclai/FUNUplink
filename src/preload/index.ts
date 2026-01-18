import { contextBridge, ipcRenderer } from 'electron'
import { RconConfig, AuthCredentials } from '../renderer/src/types'

if (!process.contextIsolated) {
    throw new Error('contextIsolation must be enabled in the BrowserWindow')
}

try {
    contextBridge.exposeInMainWorld('context', {
        connectRcon: (config: RconConfig) => ipcRenderer.invoke('connect-rcon', config),
        onStatusChange: (callback: (status: string) => void) => {
            ipcRenderer.on('status-change', (_event, status) => callback(status))
        },
        onLog: (callback: (message: string) => void) => {
            ipcRenderer.on('log', (_event, message) => callback(message))
        },
        onSyncChange: (callback: (syncing: boolean) => void) => {
            ipcRenderer.on('sync-change', (_event, syncing) => callback(syncing))
        },
        removeListeners: () => {
            ipcRenderer.removeAllListeners('status-change')
            ipcRenderer.removeAllListeners('log')
            ipcRenderer.removeAllListeners('sync-change')
        },
        login: (creds: AuthCredentials) => ipcRenderer.invoke('auth-login', creds),
        logout: () => ipcRenderer.invoke('auth-logout'),
        getSession: () => ipcRenderer.invoke('auth-get-session'),
        installMod: (customPath?: string) => ipcRenderer.invoke('mod-install', customPath),
        uninstallMod: () => ipcRenderer.invoke('mod-uninstall'),
        checkLocalInstall: () => ipcRenderer.invoke('check-local-install'),
        downloadMod: () => ipcRenderer.invoke('download-mod'),
        restartServer: () => ipcRenderer.invoke('restart-server'),
        installRemoteMod: (sftpConfig: any) => ipcRenderer.invoke('install-remote-mod', sftpConfig)
    })
} catch (error) {
    console.error(error)
}
