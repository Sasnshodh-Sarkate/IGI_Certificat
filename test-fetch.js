const fetch = require('node-fetch');

async function testFetch() {
    try {
        const response = await fetch('http://localhost:3001/certificates/jobs');
        console.log('Status:', response.status);
        const data = await response.text();
        console.log('Data:', data);
    } catch (error) {
        console.error('Fetch failed:', error.message);
    }
}

testFetch();
