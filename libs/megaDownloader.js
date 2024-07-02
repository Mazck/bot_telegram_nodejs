const { File } = require('megajs');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

async function downloadFromMega(url) {
    const folder = File.fromURL(url);

    await folder.loadAttributes();

    const files = await Promise.all(
        folder.children.map(async (child) => {
            const filePath = path.join('./downloads', child.name);
            const data = await child.downloadBuffer();
            fs.writeFileSync(filePath, data);
            return { name: child.name, path: filePath };
        })
    );

    return files;
}

async function splitVideo(filePath, maxSizeMB) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const partsDir = path.join(path.dirname(filePath), 'video_parts');
    fs.mkdirSync(partsDir, { recursive: true });

    const cmd = `/usr/local/bin/MP4Box -split-size ${maxSizeBytes} -out ${partsDir}/part ${filePath}`;
    const { stdout, stderr } = await exec(cmd);

    if (stderr) {
        console.error(`Error splitting video ${filePath}: ${stderr}`);
        throw new Error(`Error splitting video ${filePath}: ${stderr}`);
    }

    const parts = fs.readdirSync(partsDir).filter(file => file.startsWith('part'));
    const partPaths = parts.map(part => path.join(partsDir, part));
    return partPaths;
}

async function sendFilesToChat(bot, chatId, files, delay = 50000) {
    const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi', '.mkv'];
    const maxSize = 50 * 1024 * 1024; // 50 MB

    const mediaFiles = [];
    const documentFiles = [];

    for (const file of files) {
        const fileExtension = path.extname(file.name).toLowerCase();
        const fileSize = fs.statSync(file.path).size;
        const isMedia = mediaExtensions.includes(fileExtension);

        if (isMedia && fileSize <= maxSize) {
            const mediaType = ['.mp4', '.mov', '.avi', '.mkv'].includes(fileExtension) ? 'video' : 'photo';
            mediaFiles.push({
                type: mediaType,
                media: fs.createReadStream(file.path),
                caption: file.name
            });
        } else if (fileSize <= maxSize) {
            documentFiles.push(file);
        } else if (isMedia && fileSize > maxSize && ['.mp4', '.mov', '.avi', '.mkv'].includes(fileExtension)) {
            const videoParts = await splitVideo(file.path, maxSize / (1024 * 1024));
            for (const partPath of videoParts) {
                mediaFiles.push({
                    type: 'video',
                    media: fs.createReadStream(partPath),
                    caption: `${file.name} - part ${path.basename(partPath)}`
                });
            }
        } else {
            console.log(`File ${file.name} is larger than 50MB and will not be sent.`);
        }
    }

    if (mediaFiles.length > 0) {
        for (let i = 0; i < mediaFiles.length; i += 10) {
            const mediaGroup = mediaFiles.slice(i, i + 10);
            await bot.sendMediaGroup(chatId, mediaGroup);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    for (const file of documentFiles) {
        let success = false;
        while (!success) {
            try {
                await bot.sendDocument(chatId, file.path, {}, { filename: file.name });
                success = true;
            } catch (error) {
                if (error.response && error.response.statusCode === 429) {
                    const retryAfter = error.response.parameters.retry_after || delay;
                    console.error(`Lỗi khi gửi tệp ${file.path}: Quá nhiều yêu cầu. Thử lại sau ${retryAfter} giây.`);
                    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                } else {
                    console.error(`Lỗi khi gửi tệp ${file.path}:`, error);
                    success = true;
                }
            }
        }
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Xóa các tệp sau khi gửi xong
    files.forEach(async file => {
        try {
            await promisify(fs.unlink)(file.path);
            console.log(`Đã xóa tệp ${file.path}`);
        } catch (err) {
            console.error(`Lỗi khi xóa tệp ${file.path}:`, err);
        }
    });
}

module.exports = { downloadFromMega, sendFilesToChat };