const {connect} = window['react-redux'];
const {bindActionCreators} = window.redux;

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
