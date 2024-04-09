import { domain, clientId } from '../../auth_config.json';

export const environment = {
  production: false,
  auth: {
    domain,
    clientId,
    authorizationParams: {
      audience: 'https://smashdle-scores.hasura.app/v1/graphql',
      redirect_uri: window.location.origin,
    },
  },
};
