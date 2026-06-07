const app = Elm.Main.init({
    node: document.getElementById('elm-app'),
    flags: null
});

// Initialize Worker
const worker = new Worker('/sync-worker.js', {
    type: 'module'
});

// Port Bridge
if (app.ports && app.ports.toWorker) {
    app.ports.toWorker.subscribe((msg) => {
        worker.postMessage(msg);
    });
}

worker.onmessage = (e) => {
    if (app.ports && app.ports.fromWorker) {
        app.ports.fromWorker.send(e.data);
    }
};

console.log('Pingolin Bootstrapped.');
