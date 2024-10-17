import { jwtDecode } from "jwt-decode";
import "core-js/stable/atob";
import { useParams } from "react-router-dom";

interface JWTPayload {
    ws: string
    card: boolean
}

export const useRouteParams = () => {
    const { posid, token } = useParams();
    const posId = posid || window.location.href.replace('//', '').split('/')[1]
    const wsToken = token || window.location.href.replace('//', '').split('/')[2]
    let wsUrl = ""
    let card = false
    try {
        const decoded = jwtDecode(wsToken || '') as JWTPayload
        wsUrl = decoded.ws
        wsUrl = 'ws://192.168.1.210:4994'
        card = decoded.card
        // const decodedHeader = jwtDecode(token, { header: true })
    } catch (e) { }

    const isPosId = posId && (posId != '' && parseInt(posId) >= 21 && parseInt(posId) <= 99)
    const posiErr = isPosId ? `Introduce PosId mayor a ${20} y menor que ${100}, ambos no iuncluidos` : undefined

    return { posId, wsToken, wsUrl, card, isPosId, posiErr }

}