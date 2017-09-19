import React from 'react';
import PropTypes from 'prop-types';
import {makeStyleFromTheme} from 'mattermost-redux/utils/theme_utils';

export default class PostType%Type% extends React.PureComponent {
    static propTypes = {

        /*
         * The post to render the message for
         */
        post: PropTypes.object.isRequired,

        /*
         * An array of words counting as mentions for the current user
         */
        mentionKeys: PropTypes.arrayOf(PropTypes.string),

        /**
         * Set to render post body compactly
         */
        compactDisplay: PropTypes.bool,

        /**
         * Flags if the post_message_view is for the RHS (Reply).
         */
        isRHS: PropTypes.bool,

        /*
         * Logged in user's theme
         */
        theme: PropTypes.object.isRequired
    };

    static defaultProps = {
        mentionKeys: [],
        compactDisplay: false,
        isRHS: false
    };

    constructor(props) {
        super(props);

        this.state = {
        };
    }

    render() {
        const style = getStyle(this.props.theme);
        const post = this.props.post;

        return (
            <div
                style={{...style.container}}
            >
                {'Message with post type custom_%type% overridden from %plugin_id%. Original message: ' + post.message}
            </div>
        );
    }
}

const getStyle = makeStyleFromTheme((theme) => {
    return {
        container: {
            backgroundColor: theme.centerChannelBg,
            color: theme.centerChannelColor
        }
    };
});
