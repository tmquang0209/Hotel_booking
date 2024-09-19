import busboy from "busboy";
import fs from "fs";
import path from "path";

const CHUNKS_DIR = path.join("./uploads", "chunks");
fs.mkdirSync(CHUNKS_DIR, { recursive: true });

const MERGED_DIR = path.join("./uploads", "merged");
fs.mkdirSync(MERGED_DIR, { recursive: true });

export const upload = (req, res) => {
    const bb = busboy({ headers: req.headers });
    bb.on("file", (fieldName, file, fileName, encoding, mimeType) => {
        const saveTo = path.join("./uploads", "chunks", fileName.filename);
        file.pipe(fs.createWriteStream(saveTo));

        file.on("end", () => {
            console.log("File saved to", saveTo);
        });
    });

    bb.on("finish", () => {
        res.writeHead(200, { Connection: "close" });
        res.end("Upload complete");
    });

    req.pipe(bb);
};

export const merge = (req, res) => {
    const { fileName, totalChunks } = req.body;

    // Validate input
    if (!fileName || !totalChunks) {
        return res.status(400).send("Filename and totalChunks are required");
    }

    const filePath = path.join(MERGED_DIR, fileName);
    const writeStream = fs.createWriteStream(filePath);

    let chunkIndex = 0;

    const appendNextChunk = () => {
        const chunkFilePath = path.join(CHUNKS_DIR, `${fileName}.part${chunkIndex}`);

        // Check if the chunk exists
        if (!fs.existsSync(chunkFilePath)) {
            return res.status(400).send(`Chunk ${chunkIndex} not found`);
        }

        // Read the chunk and append it to the final file
        const chunkStream = fs.createReadStream(chunkFilePath);
        chunkStream.pipe(writeStream, { end: false });

        chunkStream.on("end", () => {
            chunkIndex++;

            if (chunkIndex < totalChunks) {
                appendNextChunk();
            } else {
                writeStream.end(() => {
                    cleanupChunks(fileName, totalChunks);
                    return res.status(200).send("File merged successfully");
                });
            }
        });

        // Handle stream errors
        chunkStream.on("error", (err) => {
            console.error(`Error reading chunk ${chunkIndex}:`, err);
            res.status(500).send(`Error reading chunk ${chunkIndex}`);
        });
    };

    appendNextChunk();
};

const cleanupChunks = (fileName, totalChunks) => {
    for (let i = 0; i < totalChunks; i++) {
        const chunkFilePath = path.join(CHUNKS_DIR, `${fileName}.part${i}`);
        if (fs.existsSync(chunkFilePath)) {
            fs.unlinkSync(chunkFilePath);
            console.log(`Deleted chunk ${i}`);
        }
    }
};
