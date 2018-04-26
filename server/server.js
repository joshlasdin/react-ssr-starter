import path from 'path';
import express from 'express';
import reactRenderer from './react-renderer';
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

app.get('*', reactRenderer);

app.listen(PORT, err => {
    if (err) return console.warn(err);
    return console.log(`Listening on ${PORT}...`);
});

module.exports = app;
