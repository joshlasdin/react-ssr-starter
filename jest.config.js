module.exports = {
    moduleNameMapper: {
        '^.+\\.(css|scss)$': 'identity-obj-proxy',
    },
    setupFiles: ['./test/setup.js'],
    snapshotSerializers: ['enzyme-to-json/serializer'],
};
