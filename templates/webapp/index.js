// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import ProfilePopover from './components/profile_popover';

class PluginClass {
    initialize(registerComponents, store) {
        registerComponents({%plugin_components%});
    }
}

global.window.plugins['%plugin_id%'] = new PluginClass();
