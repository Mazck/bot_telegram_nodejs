const axios = require('axios');
const AdmZip = require('adm-zip');
const fs = require('fs');

const url = 'https://z7j2nk-3000.csb.app/download-zip';
const zipFilePath = 'downloaded.zip';
const outputDir = 'extracted_files';

async function downloadAndExtractZip() {
    // Download the ZIP file
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
    });

    // Save the ZIP file
    const writer = fs.createWriteStream(zipFilePath);
    response.data.pipe(writer);

    // Wait for the download to complete
    await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });

    // Extract the ZIP file
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(outputDir, true);
    
    console.log('Download and extraction complete!');
}

downloadAndExtractZip().catch(console.error);