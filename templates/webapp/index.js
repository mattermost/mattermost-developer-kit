// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.
%plugin_imports%
class PluginClass {
    initialize(registerComponents, store) {
        registerComponents({%plugin_components%}, {%plugin_post_types%});
    }
}

global.window.plugins['%plugin_id%'] = new PluginClass();
