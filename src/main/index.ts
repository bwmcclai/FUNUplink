import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { Rcon } from 'rcon-client'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as os from 'os'
import archiver from 'archiver'

// TODO: Replace with real keys/env vars
const SUPABASE_URL = 'https://pankyqebaapfdunbeqax.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ziBX_9mz9QRl5XLv1D3sJQ_chG-r6zS'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

let rconClient: Rcon | null = null
let isSyncing = false
let mainWindow: BrowserWindow | null = null

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        backgroundColor: '#2e2e2e',
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            sandbox: false,
            contextIsolation: true
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow?.show()
    })

    // HMR for renderer base on electron-vite CLI.
    // Load the remote URL for development or the local html file for production.
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

app.whenReady().then(() => {
    createWindow()

    // IPC Handler for RCON Connection
    ipcMain.handle('connect-rcon', async (_event, config) => {
        const { host, port, password } = config

        if (mainWindow) {
            mainWindow.webContents.send('status-change', 'Connecting...')
            mainWindow.webContents.send('log', `Attempting to connect to ${host}:${port}...`)
        }

        try {
            if (rconClient) {
                mainWindow?.webContents.send('log', 'Closing existing RCON connection...')
                await rconClient.end()
            }

            mainWindow?.webContents.send('log', `Connecting to ${host}:${port}...`)
            mainWindow?.webContents.send('log', `Authentication with provided password...`)

            rconClient = await Rcon.connect({
                host,
                port: parseInt(port),
                password,
                timeout: 15000 // Increased to 15s timeout
            })

            if (mainWindow) {
                mainWindow.webContents.send('status-change', 'Connected')
                mainWindow.webContents.send('log', '✓ Successfully connected to Factorio via RCON.')
                mainWindow.webContents.send('log', '✓ Authentication successful.')
            }

            // Start sync loop if not running?
            // Actually sync loop is on interval, it will just start working now that rconClient is set.

        } catch (error: any) {
            console.error('RCON Connection Error:', error)
            if (mainWindow) {
                mainWindow.webContents.send('status-change', 'Error')
                mainWindow.webContents.send('log', `✗ Connection Failed: ${error.message}`)

                // More detailed error info
                if (error.message.includes('timeout')) {
                    mainWindow.webContents.send('log', '  → Server did not respond within 15 seconds')
                    mainWindow.webContents.send('log', '  → Check that RCON is enabled in server-settings.json')
                } else if (error.message.includes('authentication')) {
                    mainWindow.webContents.send('log', '  → Password authentication failed')
                    mainWindow.webContents.send('log', '  → Check RCON password in server-settings.json')
                } else if (error.message.includes('ECONNREFUSED')) {
                    mainWindow.webContents.send('log', '  → Connection refused by server')
                } else {
                    mainWindow.webContents.send('log', `  → Error details: ${JSON.stringify(error)}`)
                }
            }
            throw error
        }
    })

    // IPC Handlers for Auth
    ipcMain.handle('auth-login', async (_event, creds) => {
        const { email, password } = creds
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            return { error: error.message, user: null }
        }
        return { error: null, user: data.user }
    })

    ipcMain.handle('auth-logout', async () => {
        await supabase.auth.signOut()
    })

    // IPC Handler for Mod Installation
    ipcMain.handle('mod-install', async (_event, customPath?: string) => {
        try {
            let modsPath = customPath

            if (!modsPath) {
                // Determine default path
                const home = os.homedir()
                if (process.platform === 'darwin') {
                    modsPath = join(home, 'Library/Application Support/factorio/mods')
                } else if (process.platform === 'win32') {
                    modsPath = join(home, 'AppData/Roaming/Factorio/mods')
                } else {
                    modsPath = join(home, '.factorio/mods') // Linux
                }
            }

            if (!fs.existsSync(modsPath!)) {
                return { success: false, message: `Mods directory not found at: ${modsPath}` }
            }

            // Simpler for this context:
            let source = join(app.getAppPath(), '../../fun_core_0.1.0') // Dev context roughly

            // Check current directory
            if (!fs.existsSync(source)) {
                source = join(process.cwd(), 'fun_core_0.1.0')
            }

            if (!fs.existsSync(source)) {
                return { success: false, message: `Source mod not found at ${source}.` }
            }

            const destZip = join(modsPath!, 'fun_core_0.1.0.zip')
            const destFolder = join(modsPath!, 'fun_core_0.1.0')

            // Cleanup existing folder to prevent conflicts
            if (fs.existsSync(destFolder)) {
                fs.rmSync(destFolder, { recursive: true, force: true })
            }

            // Create Zip
            const output = fs.createWriteStream(destZip)
            const archive = archiver('zip', { zlib: { level: 9 } })

            return new Promise((resolve, reject) => {
                output.on('close', () => {
                    resolve({ success: true, message: `Mod installed: ${destZip}` })
                })
                archive.on('error', (err: any) => reject({ success: false, message: err.message }))

                archive.pipe(output)
                archive.directory(source, 'fun_core_0.1.0')
                archive.finalize()
            })

        } catch (e: any) {
            console.error(e)
            return { success: false, message: e.message }
        }
    })

    // IPC Handler for Server Restart
    ipcMain.handle('restart-server', async () => {
        try {
            if (!rconClient) {
                return { success: false, message: 'Not connected to any server' }
            }

            mainWindow?.webContents.send('log', 'Requesting server restart...')

            // Use /quit command to gracefully shutdown (hosting provider should auto-restart)
            await rconClient.send('/quit')

            mainWindow?.webContents.send('log', '✓ Server restart command sent')
            mainWindow?.webContents.send('log', '  → Server should auto-restart shortly')

            // Disconnect the RCON client
            await rconClient.end()
            rconClient = null

            if (mainWindow) {
                mainWindow.webContents.send('status-change', 'Disconnected')
                mainWindow.webContents.send('log', 'RCON connection closed')
            }

            return { success: true, message: 'Server restart initiated' }
        } catch (error: any) {
            console.error('Server restart error:', error)
            mainWindow?.webContents.send('log', `✗ Restart failed: ${error.message}`)
            return { success: false, message: error.message }
        }
    })

    // IPC Handler for Mod Uninstallation
    ipcMain.handle('mod-uninstall', async () => {
        try {
            const home = os.homedir()
            let modsPath = ''

            // Detect Paths
            if (process.platform === 'darwin') {
                modsPath = join(home, 'Library/Application Support/factorio/mods')
            } else if (process.platform === 'win32') {
                modsPath = join(home, 'AppData/Roaming/Factorio/mods')
            } else {
                modsPath = join(home, '.factorio/mods')
            }

            if (!fs.existsSync(modsPath)) {
                return { success: false, message: `Mods directory not found.` }
            }

            const zipPath = join(modsPath, 'fun_core_0.1.0.zip')
            const dirPath = join(modsPath, 'fun_core_0.1.0')

            let deleted = false
            if (fs.existsSync(zipPath)) {
                fs.unlinkSync(zipPath)
                deleted = true
            }
            if (fs.existsSync(dirPath)) {
                fs.rmSync(dirPath, { recursive: true, force: true })
                deleted = true
            }

            if (deleted) {
                return { success: true, message: 'Mod uninstalled successfully.' }
            } else {
                return { success: false, message: 'Mod files not found to delete.' }
            }

        } catch (e: any) {
            console.error(e)
            return { success: false, message: e.message }
        }
    })

    // IPC Handler for Checking Local Install
    ipcMain.handle('check-local-install', async () => {
        const home = os.homedir()
        let modsPath = ''
        let factorioPath = ''

        // Detect Paths
        if (process.platform === 'darwin') {
            modsPath = join(home, 'Library/Application Support/factorio/mods')
            factorioPath = join(home, 'Library/Application Support/factorio')
        } else if (process.platform === 'win32') {
            modsPath = join(home, 'AppData/Roaming/Factorio/mods')
            factorioPath = join(home, 'AppData/Roaming/Factorio')
        } else {
            modsPath = join(home, '.factorio/mods')
            factorioPath = join(home, '.factorio')
        }

        const installed = fs.existsSync(factorioPath)
        const modInstalled = fs.existsSync(join(modsPath, 'fun_core_0.1.0.zip')) || fs.existsSync(join(modsPath, 'fun_core_0.1.0'))

        return { installed, path: factorioPath, modInstalled }
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// === Sync Loop Logic ===
async function syncLoop() {
    if (isSyncing || !rconClient) return

    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return // Don't sync if not logged in

    isSyncing = true

    try {
        // Step A: EXPORT (Get data FROM Factorio)
        // We call a custom remote interface defined in your Lua Mod
        // Using silent-command to avoid spamming chat
        const response = await rconClient.send(
            `/silent-command if remote.interfaces["fun_core"] then rcon.print(remote.call('fun_core', 'get_export_buffer')) else rcon.print('{"items":[]}') end`
        )

        try {
            const exportData = JSON.parse(response)

            if (exportData.items && exportData.items.length > 0) {
                // Push to Cloud
                const { error } = await supabase.rpc('process_export', {
                    payload: exportData.items
                })

                if (error) throw error

                if (mainWindow) {
                    mainWindow.webContents.send('log', `Exported ${exportData.items.length} stacks.`)
                }
            }
        } catch (e) {
            // JSON parse error or empty response is common if mod not ready
        }

        // STEP B: IMPORT (Send data TO Factorio)
        // Check Supabase for any "Pending Deliveries"
        const { data: deliveries } = await supabase
            .from('pending_deliveries')
            .select('*')
            .eq('claimed', false)

        if (deliveries && deliveries.length > 0) {
            for (const delivery of deliveries) {
                const cmd = `/silent-command if remote.interfaces["fun_core"] then remote.call('fun_core', 'spawn_delivery', '${JSON.stringify(delivery)}') end`
                await rconClient.send(cmd)

                // Mark as claimed
                await supabase.from('pending_deliveries').update({ claimed: true }).eq('id', delivery.id)

                if (mainWindow) {
                    mainWindow.webContents.send('log', `Imported delivery: ${delivery.id}`)
                }
            }
        }

    } catch (err: any) {
        console.error("Sync Error:", err)
        if (mainWindow) {
            mainWindow.webContents.send('log', `Sync Error: ${err.message}`)
        }
    } finally {
        isSyncing = false
    }
}


// Start polling
setInterval(syncLoop, 3000)
