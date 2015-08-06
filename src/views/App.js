import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {isLoaded as isInfoLoaded} from '../reducers/info';
import {isLoaded as isAuthLoaded} from '../reducers/auth';
import {load as loadInfo} from '../actions/infoActions';
import * as authActions from '../actions/authActions';
import {load as loadAuth} from '../actions/authActions';
import InfoBar from '../components/InfoBar';
import {createTransitionHook} from '../universalRouter';
import {requireServerCss} from '../util';
import Helmet from 'react-helmet';

const styles = __CLIENT__ ? require('./App.scss') : requireServerCss(require.resolve('./App.scss'));

class App extends Component {
  static propTypes = {
    user: PropTypes.object,
    logout: PropTypes.func
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  };

  componentWillMount() {
    const {router, store} = this.context;
    this.transitionHook = createTransitionHook(store);
    router.addTransitionHook(this.transitionHook);
  }

  componentWillUnmount() {
    const {router, store} = this.context;
    router.removeTransitionHook(this.transitionHook);
  }

  handleLogout(event) {
    event.preventDefault();
    this.props.logout();
  }

  render() {
    const {user} = this.props;

    const cdn = '//cdnjs.cloudflare.com/ajax/libs/';
    const title = 'React Redux Example';
    const description = 'All the modern best practices in one example.';
    const image = 'https://react-redux.herokuapp.com/logo.jpg';

    const meta = [
      {property: 'og:site_name', content: title},
      {property: 'og:image', content: image},
      {property: 'og:locale', content: 'en_US'},
      {property: 'og:title', content: title},
      {property: 'og:description', content: description},
      {name: 'twitter:card', content: 'summary'},
      {property: 'twitter:site', content: '@erikras'},
      {property: 'twitter:creator', content: '@erikras'},
      {property: 'twitter:image', content: image},
      {property: 'twitter:image:width', content: '200'},
      {property: 'twitter:image:height', content: '200'},
      {property: 'twitter:title', content: title},
      {property: 'twitter:description', content: description},
      {charSet:'utf-8'}
    ];

    const link = [
      {rel: 'shortcut icon', href: '/favicon.ico'},
      {href: `${cdn}twitter-bootstrap/3.3.5/css/bootstrap.css`, media:'screen, projection', rel:'stylesheet', type:'text/css'},
      {href: `${cdn}font-awesome/4.3.0/css/font-awesome.min.css`, media:'screen, projection', rel:'stylesheet', type:'text/css'}
    ];

    return (
      <div className={styles.app}>
        <Helmet title={title} meta={meta} link={link} />
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container">
            <Link to="/" className="navbar-brand">
              <div className={styles.brand} />
              React Redux Example
            </Link>

            <ul className="nav navbar-nav">
              <li><Link to="/widgets">Widgets</Link></li>
              <li><Link to="/survey">Survey</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/redirect">Redirect to Home</Link></li>
              {!user && <li><Link to="/login">Login</Link></li>}
              {user && <li className="logout-link"><a href="/logout" onClick={::this.handleLogout}>Logout</a></li>}
            </ul>
            {user &&
            <p className={styles.loggedInMessage + ' navbar-text'}>Logged in as <strong>{user.name}</strong>.</p>}
            <ul className="nav navbar-nav navbar-right">
              <li>
                <a href="https://github.com/erikras/react-redux-universal-hot-example"
                   target="_blank" title="View on Github"><i className="fa fa-github" /></a>
              </li>
            </ul>
          </div>
        </nav>
        <div className={styles.appContent}>
          {this.props.children}
        </div>
        <InfoBar />

        <div className="well text-center">
          Have questions? Ask for help <a
          href="https://github.com/erikras/react-redux-universal-hot-example/issues"
          target="_blank">on Github</a> or in the <a
          href="http://www.reactiflux.com/" target="_blank">#react-redux-universal</a> Slack channel.
        </div>
      </div>
    );
  }
}

@connect(state => ({
  user: state.auth.user
}))
export default
class AppContainer {
  static propTypes = {
    user: PropTypes.object,
    dispatch: PropTypes.func.isRequired
  }

  static fetchData(store) {
    const promises = [];
    if (!isInfoLoaded(store.getState())) {
      promises.push(store.dispatch(loadInfo()));
    }
    if (!isAuthLoaded(store.getState())) {
      promises.push(store.dispatch(loadAuth()));
    }
    return Promise.all(promises);
  }

  render() {
    const { user, dispatch } = this.props;
    return <App user={user} {...bindActionCreators(authActions, dispatch)}>
      {this.props.children}
    </App>;
  }
}
