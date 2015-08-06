import Express from 'express';
import React from 'react';
import Location from 'react-router/lib/Location';
import config from './config';
import favicon from 'serve-favicon';
import compression from 'compression';
import httpProxy from 'http-proxy';
import path from 'path';
import createStore from './redux/create';
import api from './api/api';
import ApiClient from './ApiClient';
import universalRouter from './universalRouter';
import Html from './Html';
import PrettyError from 'pretty-error';
import Helmet from 'react-helmet';
import serialize from 'serialize-javascript';
const pretty = new PrettyError();
const app = new Express();
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:' + config.apiPort
});

app.use(compression());
app.use(favicon(path.join(__dirname, '..', 'static', 'favicon.ico')));

let webpackStats;

if (!__DEVELOPMENT__) {
  webpackStats = require('../webpack-stats.json');
}

app.use(require('serve-static')(path.join(__dirname, '..', 'static')));

// Proxy to API server
app.use('/api', (req, res) => {
  proxy.web(req, res);
});

app.use((req, res) => {
  if (__DEVELOPMENT__) {
    webpackStats = require('../webpack-stats.json');
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    delete require.cache[require.resolve('../webpack-stats.json')];
  }
  const client = new ApiClient(req);
  const store = createStore(client);
  const location = new Location(req.path, req.query);
  if (__DISABLE_SSR__) {
    // TODO: fix this
    // res.send('<!doctype html>\n' +
    //  React.renderToString(<Html webpackStats={webpackStats} component={<div/>} store={store} />));
  } else {
    universalRouter(location, undefined, store)
      .then(({component, transition, isRedirect}) => {

        if (isRedirect) {
          res.redirect(transition.redirectInfo.pathname);
          return;
        }

        const styles = webpackStats.css.files
          .map((css, i) => <link href={css}
                                 key={i}
                                 media="screen, projection"
                                 rel="stylesheet"
                                 type="text/css" />);


        const script_url = webpackStats.script[0];
        const content = React.renderToString(component);

        let {title, link, meta} = Helmet.rewind();
        res.send(Html({
          meta,
          link,
          title,
          styles,
          content,
          script_url,
          store: serialize(store.getState())
        }));


      })
      .catch((error) => {
        console.error('ROUTER ERROR:', pretty.render(error));
        res.status(500).send({error: error.stack});
      });
  }
});

if (config.port) {
  app.listen(config.port, (err) => {
    if (err) {
      console.error(err);
    } else {
      api().then(() => {
        console.info('==> ✅  Server is listening');
        console.info('==> 🌎  %s running on port %s, API on port %s', config.app.name, config.port, config.apiPort);
        console.info('----------\n==> 💻  Open http://localhost:%s in a browser to view the app.', config.port);
      });
    }
  });
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
