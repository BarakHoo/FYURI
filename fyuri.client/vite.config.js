import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

// Only setup HTTPS certificates for development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

let httpsConfig = undefined;

if (isDevelopment) {
    const baseFolder =
        env.APPDATA !== undefined && env.APPDATA !== ''
            ? `${env.APPDATA}/ASP.NET/https`
            : `${env.HOME}/.aspnet/https`;

    const certificateName = "fyuri.client";
    const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
    const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

    if (!fs.existsSync(baseFolder)) {
        fs.mkdirSync(baseFolder, { recursive: true });
    }

    if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
        if (0 !== child_process.spawnSync('dotnet', [
            'dev-certs',
            'https',
            '--export-path',
            certFilePath,
            '--format',
            'Pem',
            '--no-password',
        ], { stdio: 'inherit', }).status) {
            throw new Error("Could not create certificate.");
        }
    }

    httpsConfig = {
        key: fs.readFileSync(keyFilePath),
        cert: fs.readFileSync(certFilePath),
    };
}

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7282';

// Base path the app is served from. Default "/fyuri/" so the site lives at
// munkys.dev/fyuri. Set VITE_BASE_PATH="/" to host at the root instead.
const basePath = (env.VITE_BASE_PATH || '/fyuri/').replace(/\/*$/, '/');

// https://vitejs.dev/config/
export default defineConfig({
    base: basePath,
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            // Match /api and /images whether or not they carry the base prefix,
            // and strip the prefix before forwarding to the backend (which runs
            // under UsePathBase in production but at the root in dev).
            [`^(${basePath})?api`]: {
                target,
                secure: false,
                rewrite: (p) => p.replace(new RegExp(`^${basePath}`), '/')
            },
            [`^(${basePath})?images`]: {
                target,
                secure: false,
                rewrite: (p) => p.replace(new RegExp(`^${basePath}`), '/')
            },
            '^/weatherforecast': {
                target,
                secure: false
            }
        },
        port: parseInt(env.DEV_SERVER_PORT || '5173'),
        https: httpsConfig
    }
})
