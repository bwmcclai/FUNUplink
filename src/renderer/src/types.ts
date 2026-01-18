export interface RconConfig {
    host: string
    port: string
    password: string
}

export interface SftpConfig {
    host: string
    port: number
    username: string
    password: string
    remotePath: string
}

export interface Connection {
    id: string
    type: 'local' | 'remote'
    name: string
    rconConfig?: RconConfig
    status: 'ready' | 'connected' | 'offline' | 'connecting' | 'error'
    modInstalled?: boolean
}

export interface AuthCredentials {
    email: string
    password: string
}

export interface IpcApi {
    connectRcon: (config: RconConfig) => Promise<void>
    onStatusChange: (callback: (status: string) => void) => void
    onLog: (callback: (log: string) => void) => void
    removeListeners: () => void

    // Auth
    login: (creds: AuthCredentials) => Promise<{ user: any, error: any }>
    logout: () => Promise<void>
    getSession: () => Promise<any>

    // Mod
    installMod: (customPath?: string) => Promise<{ success: boolean, message: string }>
    uninstallMod: () => Promise<{ success: boolean, message: string }>
    checkLocalInstall: () => Promise<{ installed: boolean, path: string, modInstalled: boolean }>
    restartServer: () => Promise<{ success: boolean, message: string }>
    installRemoteMod: (sftpConfig: any) => Promise<{ success: boolean, message: string }>
}
