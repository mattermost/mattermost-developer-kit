const React = window.react;
import PropTypes from 'prop-types';
import {makeStyleFromTheme} from 'mattermost-redux/utils/theme_utils';

export default class Root extends React.PureComponent {
    static propTypes = {

        /*
         * Logged in user's theme
         */
        theme: PropTypes.object.isRequired,

        /* Add custom props here */

        /* Define action props here or remove if no actions */
        actions: PropTypes.shape({
        }).isRequired

    }

    static defaultProps = {
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
                style={{...style.container}}
            >
                {'This is the Root component from the %plugin_id% plugin'}
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
            left: '50%',
            top: '50%',
            height: '200px',
            width: '200px',
            border: '1px solid black',
            zIndex: 9999 // Bring popover to top
        }
    };
});
