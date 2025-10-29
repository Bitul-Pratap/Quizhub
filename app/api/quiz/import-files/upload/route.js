import { NextResponse } from "next/server";
import formidable from 'formidable';
import { Readable, Writable } from "stream";
import fs from 'fs';
import path from 'path';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { nanoid } from "nanoid";


// Turn off the default body parser
export const config = {
    api: {
        bodyParser: false,
    }
};

const MEMORY_THRESHOLD = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB

// Ensure upload directory exists
// if (!fs.existsSync(UPLOAD_DIR)) {
//     fs.mkdirSync(UPLOAD_DIR, { recursive: true });
// }

const sessions = new Map();

export async function POST(req) {
    // Read cookies from the request
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(cookieHeader.split(';').map(c => {
        const [k, v] = c.trim().split('=');
        return [k, v];
    }));

    let sessionId = cookies.sessionId;
    console.log("Incoming sessionId:", sessionId);
    let sessionData;
    console.log("Current sessions in memory:", sessions, sessions.has(sessionId));

    if (sessionId && sessions.has(sessionId)) {
        // Use existing session
        sessionData = sessions.get(sessionId);
        console.log("Existing session data:", sessionData);

        // Clean up previous files for this session
        const uploadDir = path.join(process.cwd(), `uploads/${sessionId}`);
        if (fs.existsSync(uploadDir)) {
            for (const file of fs.readdirSync(uploadDir)) {
                fs.unlinkSync(path.join(uploadDir, file));
            }
        }
    } else {
        // Create new session
        const session = await getServerSession(authOptions);
        sessionId = nanoid();
        sessionData = {
            sessionId,
            email: session?.user?.email,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        };
        sessions.set(sessionId, sessionData);
    }

    const contentType = req.headers.get('content-type') || '';
    const contentLength = req.headers.get('content-length') || '0';
    if (!contentType || !contentType.includes('multipart/form-data')) {
        return NextResponse.json({ success: false, error: 'Unsupported content-type' }, { status: 400 });
    }

    const UPLOAD_DIR = path.join(process.cwd(), `uploads/${sessionData.sessionId}`);
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    

    // raw buffer from req.body
    const buffer = await req.arrayBuffer();
    // Convert the buffer to a readable stream
    const mockReq = new Readable();
    mockReq.push(Buffer.from(buffer));
    mockReq.push(null); // Signal the end of the stream
    mockReq.headers = {
        'content-type': contentType,
        'content-length': contentLength,
    };
    mockReq.method = 'POST';
    mockReq.url = '';
    

    let totalUploadSize = 0;
    // Hybrid approach: custom fileWriteStreamHandler
    const form = formidable({
        multiples: true,
        keepExtensions: true,
        maxFileSize: MAX_TOTAL_SIZE,
        // uploadDir: tmpDir, // fallback
        fileWriteStreamHandler: (file) => {
            const filePath = path.join(UPLOAD_DIR, `${Date.now()}-${file.originalFilename}`);
            const diskStream = fs.createWriteStream(filePath);

            const writable = new Writable({
                write(chunk, encoding, callback) {
                    diskStream.write(chunk, encoding, callback);
                },
                final(callback) {
                    diskStream.end(() => {
                        file.filepath = filePath;
                        callback();
                    });
                }
            });

            writable.on("error", () => {
                diskStream.destroy();
                fs.unlink(filePath, () => {}); // cleanup partial file
            });

            return writable;
        }
    });

    // Parse the form and get fields/files
    const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(mockReq, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });

    // Prepare metadata for response
    const uploaded = [];
    const fileArray = Array.isArray(files.files) ? files.files : [files.files];
    for (const file of fileArray) {
            uploaded.push({
                originalFilename: file.originalFilename,
                mimetype: file.mimetype,
                size: file.size,
                storage: 'disk',
                storedPath: path.relative(UPLOAD_DIR, file.filepath),
            });
    }

    
    sessionData.files = uploaded;
    sessionData.totalFiles = uploaded.length;
    sessions.set(sessionId, sessionData);

    return new NextResponse(
        JSON.stringify({
            success: true,
            files: uploaded
        }),
        {
            status: 200,
            headers: {
                'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=1800`
            }
        }
    );
}