const { app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const root = fs.realpathSync(path.resolve(__dirname, '..', 'artifacts'));
const requested = process.env.DEUTSCHMASTER_SMOKE_PROFILE;
if (!requested || !path.isAbsolute(requested)) throw new Error('An absolute packaged smoke profile is required.');
const profile = fs.realpathSync(requested);
const relative = path.relative(root, profile);
if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Packaged smoke profile must be inside project artifacts.');
app.setPath('userData', profile);
const session = path.join(profile, 'chromium'); fs.mkdirSync(session, { recursive: true });
app.setPath('sessionData', session);
fs.writeFileSync(path.join(profile, 'profile-proof.json'), JSON.stringify({ userData: app.getPath('userData'), sessionData: app.getPath('sessionData'), executable: process.execPath }));
