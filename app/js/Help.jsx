/**
 * Copyright 2016-2021 Sourcepole AG
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

export function renderHelp() {
    return (
        <div>
            <ul>
                <li>QWC2 build {process.env.BuildDate}</li>
                <li>QWC2 Version: {process.env.QWC2Version}</li>
                <li>QWC2 Download Source: {process.env.QWC2DownloadSource}</li>
                <li>QWC2 Repository URL: {process.env.QWC2RepoSource}</li>
            </ul>
        </div>);
}
