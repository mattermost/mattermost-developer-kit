import React from 'react';
import PropTypes from 'prop-types';
import {makeStyleFromTheme} from 'mattermost-redux/utils/theme_utils';

export default class ProfilePopover extends React.PureComponent {
    static propTypes = {

        /*
         * Source URL from the image to display in the popover
         */
        src: PropTypes.string.isRequired,

        /*
         * User the popover is being opened for
         */
        user: PropTypes.object.isRequired,

        /*
         * Status for the user, either 'offline', 'away' or 'online'
         */
        status: PropTypes.string,

        /*
         * Set to true if the user is in a WebRTC call
         */
        isBusy: PropTypes.bool,

        /*
         * Function to call to hide the popover
         */
        hide: PropTypes.func,

        /*
         * Set to true if the popover was opened from the right-hand
         * sidebar (comment thread, search results, etc.)
         */
        isRHS: PropTypes.bool,

        /*
         * Logged in user's theme
         */
        theme: PropTypes.func.isRequired,

        /*
         * The CSS absolute left position
         */
        positionLeft: PropTypes.number.isRequired,

        /*
         * The CSS absolute top position
         */
        positionTop: PropTypes.number.isRequired,

        /* Add custom props here */

        /* Define action props here or remove if no actions */
        actions: PropTypes.shape({
        }).isRequired

    }

    static defaultProps = {
        isBusy: false,
        hide: () => {},
        isRHS: false
        /* If necessary, add defaults for custom props here */
    }

    constructor(props) {
        super(props);

        this.state = {
            /* Initialize any state here */
        };
    }

    /* Add React component lifecycle functions (componentDidMount, etc.) and custom functions
        here as needed. Make sure to use arrow function syntax for your custom functions to
        auto-bind this */

    exampleFunction = () => {
        // Do some things
    }

    /* Construct and return the JSX to render here. Make sure that rendering is solely based
        on props and state. */
    render() {
        const style = getStyle(this.props.theme);
        return (
            <div
                style={{...style.container, left: this.props.positionLeft, top: this.props.positionTop}}
            >
                {'This is from the example plugin'}
            </div>
        );
    }
}

/* Define CSS styles here */
const getStyle = makeStyleFromTheme((theme) => {
    return {
        container: {
            /* Use the theme object to match component style to the user's theme */
            backgroundColor: theme.centerChannelBg,
            position: 'absolute',
            height: '200px',
            width: '200px',
            border: '1px solid black',
            zIndex: 9999 // Bring popover to top
        }
    };
});
