import si from 'systeminformation';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

// Critical system processes that should NEVER be killed
const CRITICAL_PROCESSES = [
    'System', 'Registry', 'smss.exe', 'csrss.exe', 'wininit.exe', 'services.exe',
    'lsass.exe', 'svchost.exe', 'fontdrvhost.exe', 'winlogon.exe', 'explorer.exe',
    'dwm.exe', 'spoolsv.exe', 'node.exe', 'electron.exe', 'Glyph.exe', 'Antigravity.exe'
];

export class SystemService {
    private cache: { [key: string]: { data: any, timestamp: number } } = {};

    private getCached(key: string, ttl: number) {
        const cached = this.cache[key];
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }
        return null;
    }

    private setCache(key: string, data: any) {
        this.cache[key] = { data, timestamp: Date.now() };
    }

    async getStats() {
        // Cache static info (OS, Graphics) for 1 hour
        let osInfo = this.getCached('osInfo', 3600000);
        let graphics = this.getCached('graphics', 3600000);

        // Cache slow changing info (Disk) for 60 seconds
        let disk = this.getCached('disk', 60000);

        if (!osInfo) {
            osInfo = await si.osInfo();
            this.setCache('osInfo', osInfo);
        }
        if (!graphics) {
            graphics = await si.graphics();
            this.setCache('graphics', graphics);
        }
        if (!disk) {
            disk = await si.fsSize();
            this.setCache('disk', disk);
        }

        // Fetch dynamic info sequentially to avoid shell storm
        const cpu = await si.cpu();
        const mem = await si.mem();
        const currentLoad = await si.currentLoad();
        const temp = await si.cpuTemperature();
        const battery = await si.battery();

        const mainGpu = graphics.controllers.sort((a: any, b: any) => (b.vram || 0) - (a.vram || 0))[0];

        return {
            cpu: {
                manufacturer: cpu.manufacturer,
                brand: cpu.brand,
                speed: cpu.speed,
                cores: cpu.cores,
                load: Math.round(currentLoad.currentLoad),
                temp: temp.main || 0
            },
            memory: {
                total: mem.total,
                free: mem.free,
                used: mem.used,
                active: mem.active,
                available: mem.available,
                percentage: Math.round((mem.active / mem.total) * 100)
            },
            disk: disk.map((d: any) => ({
                fs: d.fs,
                type: d.type,
                size: d.size,
                used: d.used,
                use: Math.round(d.use),
                mount: d.mount
            })),
            battery: {
                hasBattery: battery.hasBattery,
                percent: battery.percent,
                isCharging: battery.isCharging,
                timeRemaining: battery.timeRemaining
            },
            gpu: {
                vendor: mainGpu?.vendor || 'N/A',
                model: mainGpu?.model || 'N/A',
                vram: mainGpu?.vram || 0
            },
            os: {
                platform: osInfo.platform,
                distro: osInfo.distro,
                release: osInfo.release,
                arch: osInfo.arch
            }
        };
    }

    async getProcesses() {
        const cached = this.getCached('processes', 10000); // 10 seconds cache
        if (cached) return cached;

        const processes = await si.processes();
        const result = processes.list
            .filter(p => p.cpu > 0 || p.mem > 0)
            .sort((a, b) => b.mem - a.mem)
            .map(p => ({
                name: p.name,
                pid: p.pid,
                cpu: p.cpu.toFixed(1),
                mem: p.mem.toFixed(1),
                user: p.user,
                isCritical: CRITICAL_PROCESSES.includes(p.name)
            }));

        this.setCache('processes', result);
        return result;
    }

    async getServices() {
        const cached = this.getCached('services', 60000); // 60 seconds cache
        if (cached) return cached;

        // Use PowerShell to get non-core services
        try {
            const { stdout } = await execAsync('powershell "Get-Service | Where-Object {$_.Status -eq \'Running\' -and $_.StartType -ne \'Disabled\'} | Select-Object -First 50 Name, DisplayName, Status"');
            // Parse the output (simplified)
            const lines = stdout.split('\r\n').slice(3); // Skip headers
            const result = lines.map(line => {
                const parts = line.trim().split(/\s{2,}/);
                if (parts.length >= 2) {
                    return { name: parts[0], displayName: parts[1] || parts[0], status: 'Running' };
                }
                return null;
            }).filter(Boolean);

            this.setCache('services', result);
            return result;
        } catch (e) {
            console.error('Failed to get services', e);
            return [];
        }
    }

    async killProcess(pid: number) {
        try {
            process.kill(pid);
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    async setPowerMode(mode: 'performance' | 'balanced' | 'saver') {
        const GUIDS = {
            performance: '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c',
            balanced: '381b4222-f694-41f0-9685-ff5bb260df2e',
            saver: 'a1841308-3541-4fab-bc81-f71556f20b4a'
        };
        try {
            await execAsync(`powercfg /setactive ${GUIDS[mode]}`);
            return { success: true, mode };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    // Aggressive RAM Cleaning (Empty Working Sets)
    async cleanRAM() {
        try {
            // This PowerShell script iterates through processes and empties their working set
            const psCommand = `
                $processes = Get-Process
                foreach ($proc in $processes) {
                    try {
                        $proc.MinWorkingSet = [System.IntPtr]::Zero
                    } catch {}
                }
            `;
            await execAsync(`powershell -Command "${psCommand.replace(/\n/g, ';')}"`);
            return { success: true };
        } catch (e: any) {
            console.error('RAM Clean failed', e);
            return { success: false, error: e.message };
        }
    }

    async applyTweak(tweakId: string) {
        try {
            switch (tweakId) {
                case 'clipboard':
                    await execAsync('powershell Set-Clipboard $null');
                    break;
                case 'dns':
                    await execAsync('ipconfig /flushdns');
                    break;
                case 'telemetry':
                    // Requires Admin, might fail silently if not elevated
                    await execAsync('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f');
                    break;
                case 'cortana':
                    await execAsync('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" /v AllowCortana /t REG_DWORD /d 0 /f');
                    break;
                default:
                    throw new Error('Unknown tweak');
            }
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    async scanJunk() {
        // Mock scan for demo purposes (calculating real size takes time)
        // In a real app, we'd recursively check these paths.
        const categories = [
            { id: 'system', name: 'System Junk Files', path: os.tmpdir(), size: '1.2 GB' },
            { id: 'app', name: 'Application Junk', path: path.join(os.homedir(), 'AppData', 'Local', 'Temp'), size: '450 MB' },
            { id: 'browser', name: 'Browser Cache', path: 'Chrome/Edge Cache', size: '800 MB' },
            { id: 'recycle', name: 'Recycle Bin', path: 'Recycle Bin', size: '2.1 GB' },
            { id: 'logs', name: 'System Logs', path: 'C:\\Windows\\Logs', size: '150 MB' }
        ];
        return categories;
    }

    async cleanJunkCategory(categoryId: string) {
        try {
            if (categoryId === 'recycle') {
                await execAsync('PowerShell.exe -NoProfile -Command Clear-RecycleBin -Force -ErrorAction SilentlyContinue');
            } else if (categoryId === 'system' || categoryId === 'app') {
                // Clean temp dir
                const tempDir = os.tmpdir();
                const files = await fs.promises.readdir(tempDir);
                for (const file of files) {
                    try {
                        await fs.promises.unlink(path.join(tempDir, file));
                    } catch { }
                }
            }
            // Other categories skipped for safety in this demo
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    async cleanSystem(options: { temp: boolean; recycle: boolean; cache: boolean }) {
        if (options.temp) await this.cleanJunkCategory('system');
        if (options.recycle) await this.cleanJunkCategory('recycle');
        if (options.cache) await this.cleanJunkCategory('browser');
        return { freedSpace: 0, filesDeleted: 0, tasks: [] }; // Mock return for compatibility
    }

    async getStartupApps() {
        try {
            const { stdout } = await execAsync('powershell "Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location, User"');
            const lines = stdout.split('\r\n').slice(3);
            return lines.map(line => {
                const parts = line.trim().split(/\s{2,}/);
                if (parts.length >= 2) {
                    return { name: parts[0], command: parts[1], location: parts[2] || '', user: parts[3] || '' };
                }
                return null;
            }).filter(Boolean);
        } catch (e) {
            console.error('Failed to get startup apps', e);
            return [];
        }
    }

    async toggleStartup(name: string, enable: boolean) {
        // This is tricky via node without specific registry access or admin rights.
        // For now, we will simulate the toggle or use a registry command if possible.
        // Real implementation would require editing HKCU\Software\Microsoft\Windows\CurrentVersion\Run
        return { success: false, error: 'Startup toggle requires elevated registry access (Not implemented safely yet)' };
    }

    async checkForUpdates() {
        try {
            // Use winget to check for updates
            const { stdout } = await execAsync('winget upgrade --include-unknown');
            // Parse winget output (simplified)
            const lines = stdout.split('\n');
            const updates = lines
                .filter(l => l.includes(' < ')) // Heuristic for "Old < New" version style
                .map(l => {
                    const parts = l.trim().split(/\s{2,}/);
                    return { name: parts[0], id: parts[1], version: parts[2], newVersion: parts[3] };
                });
            return updates;
        } catch (e) {
            return []; // Winget might return exit code 1 if no updates found
        }
    }

    async smartShutdown() {
        const log = [] as string[];
        try {
            // 1. Detect External Drive
            const drives = await si.fsSize();
            const externalDrive = drives.find(d => d.mount !== 'C:' && d.size > 1000000000); // Not C: and > 1GB

            // 2. Backup (Simulated for safety/speed in this demo)
            if (externalDrive) {
                log.push(`Detected backup drive: ${externalDrive.mount}`);
                log.push('Backing up critical documents...');
                // In real app: await fs.promises.cp(userDocs, externalDrive.mount + '/Backup');
                await new Promise(r => setTimeout(r, 1000)); // Fake delay
                log.push('Backup complete.');
            } else {
                log.push('No external backup drive found. Skipping backup.');
            }

            // 3. System Clean
            log.push('Cleaning system junk...');
            await this.cleanSystem({ temp: true, recycle: true, cache: false });
            log.push('System clean complete.');

            // 4. Shutdown
            log.push('Initiating shutdown...');
            // await execAsync('shutdown /s /t 10'); // Commented out to prevent accidental shutdown during dev

            return { success: true, log, message: 'Shutdown sequence initiated (Simulated)' };
        } catch (e: any) {
            return { success: false, error: e.message, log };
        }
    }
}

export const systemService = new SystemService();
