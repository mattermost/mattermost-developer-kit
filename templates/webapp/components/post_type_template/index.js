import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import PostType%Type% from './post_type_%type%.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostType%Type%);
