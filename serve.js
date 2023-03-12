#!/usr/bin/env node
import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";

const MIME_TYPES = {
  default: "application/octet-stream",
  html: "text/html; charset=UTF-8",
  js: "application/javascript",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml"
};

function main() {
    const args = process.argv.slice(2, process.argv.length);
    const port = args[0] ?? 8000;
    http.createServer(serveRequest).listen(port);
    const rootDir = process.cwd();
    console.log(`Sering ${rootDir} at http://localhost:${port}/`);
}

/**
 * @param req {Request}
 * @param res {Response}
 */
async function serveRequest(req, res) {
    let filePath = path.join(process.cwd(), req.url);
    if (req.url.endsWith("/")) {
        filePath = path.join(filePath, "index.html")
    };
    if (! isAccessible(filePath)) {
        console.log(`404: ${filePath}`);
        res.writeHead(404);
        res.write("not found");
        return;
    }
    console.log(`200: ${filePath}`);
    const ext = path.extname(filePath).substring(1).toLowerCase();
    res.writeHead(200, { 
        "Content-Type": MIME_TYPES[ext] || MIME_TYPES.default 
    });
    fs.createReadStream(filePath).pipe(res);
}

/**
 * @param filePath {string}
 * @returns {boolean}
 */
async function isAccessible(filePath) {
    if (! filePath.startsWith(process.cwd())) {
        return false;
    }
    try {
        await fs.promises.access(filePath);
    } catch(e) {
        return false;
    }
    return true;
}

main();
