export interface LogEntry {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
}

class Logger {
    private logs: LogEntry[] = [];
    private maxLogs: number = 1000;

    log(level: 'INFO' | 'WARN' | 'ERROR', message: string) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
        };
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        console.log(`[${entry.timestamp}] [${level}] ${message}`);
    }

    info(message: string) {
        this.log('INFO', message);
    }

    warn(message: string) {
        this.log('WARN', message);
    }

    error(message: string) {
        this.log('ERROR', message);
    }

    getLogs(limit: number = 100): LogEntry[] {
        return this.logs.slice(-limit);
    }

    clear() {
        this.logs = [];
    }
}

export const logger = new Logger();
