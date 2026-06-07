// @ts-ignore
import { Elm } from './Main.elm';

const app = Elm.Main.init({
    node: document.getElementById('elm-app'),
    flags: null
});

// Initialize Worker
const worker = new Worker(new URL('./sync-worker.ts', import.meta.url), {
    type: 'module'
});

// Port Bridge
if (app.ports && app.ports.toWorker) {
    app.ports.toWorker.subscribe((msg: any) => {
        worker.postMessage(msg);
    });
}

worker.onmessage = (e) => {
    if (app.ports && app.ports.fromWorker) {
        app.ports.fromWorker.send(e.data);
    }
};

console.log('Pingolin Bootstrapped.');
