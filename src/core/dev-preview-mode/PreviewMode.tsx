import { FC, memo, MutableRefObject, useEffect, useRef, useState } from "react";
import './PreviewMode.scss';

type WSRef = MutableRefObject<WebSocket | undefined>;

const previewEnv = process.env.PREVIEW_ENV;
const isPreviewInBrowser = previewEnv === 'browser';
const isPreviewInFigma = previewEnv === 'figma';

/**
 * Allow to render the figma plugin in the browser and maintain the communiation with the plugin back-end through a websocket dev server.
 * Ensure:
 * - the websocket server is started,
 * - the plugin is open in Figma,
 * - the plugin react app is open in the browser.
 * In the project template, `yarn start` does everything.
 * 
 * @example Wrap the app in index.tsx
 * ```ts
 * render(
 *   <PreviewMode>
 *     <App />
 *   </PreviewMode>
 *   , document.getElementById('react-page'));
 * ```
 */
export const PreviewMode: FC = memo(({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket>();

  useEffect(() => {
    if (previewEnv) {
      const closeWebsocket = startWebSocket(ws, setIsConnected);
      const stopListeningMsg = listenToPluginBackMessage(ws);
      return () => {
        closeWebsocket();
        stopListeningMsg();
      };
    }
  }, []);

  if (!previewEnv) return <>{children}</>;

  return (
    <div className="preview-app">
      <h3>Preview App</h3>
      <div className="preview-connection-info">
        <strong>Connection Status:</strong>
        <div className={`preview-connection-status${isConnected ? ' status-green' : ''}`} />
      </div>

      {isPreviewInBrowser && setIsConnected && (
        <div className="preview-plugin-wrapper">
          {children}
        </div>
      )}
    </div>
  );
});

function onWindowMsg(ws: WSRef, msg) {
  if (!msg.data.pluginMessage) return;
  if (isPreviewInBrowser && msg.data.__source === 'figma') return;

  const message = JSON.stringify({
    ...msg.data.pluginMessage,
    __source: previewEnv
  });
  if (ws.current?.readyState === 1) {
    ws.current.send(message);
  } else {
    setTimeout(() => onWindowMsg(ws, msg), 1000);
  }
}

function startWebSocket(ws: WSRef, setIsConnected: (connected: boolean) => void) {
  let isComponentMounted = true;

  ws.current = new WebSocket("ws://localhost:9001/ws");
  ws.current.onopen = () => {
    setIsConnected(true);
  };
  ws.current.onclose = () => {
    setIsConnected(false);

    setTimeout(() => {
      if (isComponentMounted) {
        startWebSocket(ws, setIsConnected);
      }
    }, 3000);
  };

  ws.current.onmessage = async event => {
    try {
      const data = event.data instanceof Blob ? await event.data.text() : event.data;
      const { __source, ...msg } = JSON.parse(data);

      if (__source === "figma" && !isPreviewInBrowser) {
        console.warn('Source is figma, but we are not in browser! Something is wrong.');
        return;
      }
      if (__source === "browser" && !isPreviewInFigma) {
        console.warn('Source is browser, but we are not in figma! Something is wrong.');
        return;
      }

      if (isPreviewInBrowser) {
        window.postMessage({ pluginMessage: msg, __source }, '*');
      } else if (isPreviewInFigma) {
        window.parent.postMessage({ pluginMessage: msg }, '*');
      }
    } catch (err) {
      console.error("not a valid message", err);
    }
  };

  return () => {
    isComponentMounted = false;
    ws.current?.close();
  };
}

// Call this method only once, when the component is mounted.
function listenToPluginBackMessage(ws: WSRef) {
  const aborter = new AbortController();
  window.addEventListener("message", msg => onWindowMsg(ws, msg), { signal: aborter.signal });
  return () => aborter.abort();
}