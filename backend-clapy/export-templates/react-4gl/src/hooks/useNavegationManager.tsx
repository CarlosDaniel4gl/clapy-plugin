import { useContext, useEffect, useReducer } from "react";
import { useRouteParams } from "../routes/useRouteParams";
import { useNavigate } from "react-router-dom";
import { ForecourtContext } from "../context/ForecourtContext";

export const useNavigationManager = () => {
    const { forecourtState: { loginInfo, loginActive } } = useContext(ForecourtContext)
    const { posId, wsToken, isLogin } = useRouteParams()
    const nav = useNavigate()
    useEffect(() => {
        if (loginActive > 0 && !isLogin) {
            nav(`/${posId}/${wsToken}/Pista`)
        }
        else if (loginActive < 0 && !isLogin) {
            nav(`/${posId}/${wsToken}/UserPassword`)
        }
    }, [loginActive])
    return { nav }
}