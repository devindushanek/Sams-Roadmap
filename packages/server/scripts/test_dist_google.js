const { googleService } = require('../dist/services/google');

console.log('Testing compiled GoogleService...');
try {
    const url = googleService.getAuthUrl();
    console.log('URL generated:', url);
    if (url.includes('client_id=')) {
        console.log('SUCCESS: client_id found.');
    } else {
        console.log('FAILURE: client_id missing.');
    }
} catch (e) {
    console.error('Error:', e);
}
