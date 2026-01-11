import { PinterestService } from '../src/services/pinterest';
import { YouTubeService } from '../src/services/youtube';
import { db } from '../src/db';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from parent directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import * as fs from 'fs';

const logFile = path.resolve(__dirname, '..', 'test_output.log');
fs.writeFileSync(logFile, 'Starting test...\n');

function log(msg: string) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function testServices() {
    log('Testing Pinterest Service...');
    try {
        const pinterest = new PinterestService();
        const pins = await pinterest.getFeed(true);
        log(`Pinterest: Found ${pins.length} pins`);
        if (pins.length > 0) log(`Sample pin: ${pins[0].title}`);
    } catch (error: any) {
        log(`Pinterest Error: ${error.message}`);
        if (error.response) log(`Response: ${JSON.stringify(error.response.data)}`);
    }

    log('\nTesting YouTube Service...');
    try {
        const youtube = new YouTubeService();
        const videos = await youtube.getSubscriptionFeed(true);
        log(`YouTube: Found ${videos.length} videos`);
        if (videos.length > 0) log(`Sample video: ${videos[0].title}`);
    } catch (error: any) {
        log(`YouTube Error: ${error.message}`);
    }
}

testServices().catch(err => log(`Fatal: ${err}`));
