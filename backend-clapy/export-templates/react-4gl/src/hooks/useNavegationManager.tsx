import { useContext, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForecourtContext } from '../context/ForecourtContext.tsx/ForecourtContext';

import { useRouteParams } from '../routes/useRouteParams';

export const useNavigationManager = () => {
  const {
    forecourtState: { loginInfo, loginActive },
  } = useContext(ForecourtContext);
  const { posId, wsToken } = useRouteParams();
  const nav = useNavigate();
  useEffect(() => {
    // if (loginActive > 0) {
    //   nav(`/${posId}/${wsToken}/Pista`);
    // } else if (loginActive < 0) {
    //   nav(`/${posId}/${wsToken}/UserPassword`);
    // }
  }, [loginActive]);
  return { nav };
};
