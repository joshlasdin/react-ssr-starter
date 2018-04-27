import path from 'path';
import express from 'express';
import hmr from './hot-modules';

const PORT = process.env.PORT || 3000;
const PRODUCTION = process.env.NODE_ENV === 'production';
const BUILD_DIR = path.join(__dirname, '..', 'build');

const app = express();

if (PRODUCTION) {
    app.use(express.static(BUILD_DIR, { index: false }));
} else {
    hmr(app);
}

// We require this inside a handler so it can be hot-reloaded
app.get('*', async (...args) => require('./react-renderer').default(...args));

app.listen(PORT, err => {
    if (err) return console.warn(err);
    return console.log(`Listening on ${PORT}...`);
});

module.exports = app;
