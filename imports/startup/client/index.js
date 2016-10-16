import 'whatwg-fetch';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import renderRoutes from './routes.jsx';

// This is Use of Disabling User zooming the Page in IOS10
const noScalable = () => {
  document.documentElement.addEventListener('touchstart', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, false);
};

Meteor.startup(() => {
  // i18n.setLocale(utils.language()); // SOME ERROR HERE
  noScalable();
  injectTapEventPlugin();
  render(renderRoutes(), document.getElementById('app'));
});
