import React from 'react';
import { Redirect } from 'react-router-dom';
import Status from 'routing/status';

export default ({ from, to, status = 301 }) => (
    <Status status={status}>
        <Redirect from={from} to={to} />;
    </Status>
);
