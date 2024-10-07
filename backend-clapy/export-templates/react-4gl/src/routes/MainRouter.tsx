import {
    createBrowserRouter,
    RouterProvider,
    RouteObject,
} from "react-router-dom";
import { screens } from "./screens";

const posId = window.location.href.replace('//', '').split('/')[1]
const isPosId = posId && parseInt(posId) > 20 && parseInt(posId) < 100

const router = createBrowserRouter([
    {
        path: "/",
        element: screens.find(s => s.route === 'NoPosId')?.component,
    },
    {
        path: isPosId ? "/:posid" : "/:posid/*",
        element: isPosId ? screens.find(s => s.route === 'NoToken')?.component
            : screens.find(s => s.route === 'NoPosId')?.component,
    },
    ...(isPosId ? [{
        path: "/:posid/:token", // nested route for /:number/:username
        element: screens.find(s => s.route === 'Wellcome')?.component,
    }] : []),
    ...(isPosId ? screens.map((s, i) => ({ path: `/:posid/:token/${s.route}`, element: s.component } as RouteObject)) : [])
]);

export const MainRouter = () => <RouterProvider router={router} />