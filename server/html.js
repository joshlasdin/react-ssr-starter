import React from 'react';

const safeString = x => JSON.stringify(x).replace(/</g, '\\u003c');

/* eslint-disable react/no-danger */
const Html = ({
    app = '',
    title = '',
    favicon = '',
    stylesheets = [],
    scripts = [],
    initialState = {},
}) => (
    <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            <link rel="shortcut icon" href={favicon} />
            <title>{title}</title>

            {stylesheets.map(x => <link rel="stylesheet" key={x.href} {...x} />)}
        </head>
        <body className="font-sans leading-normal text-base text-grey-base">
            <div id="root" dangerouslySetInnerHTML={{ __html: app }} />
            <script
                dangerouslySetInnerHTML={{
                    __html: `window.__STATE__ = ${safeString(initialState)}`,
                }}
            />
            {scripts.map(x => <script key={x.src} {...x} />)}
        </body>
    </html>
);

export default Html;
