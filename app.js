if ('serviceWorker' in navigator) {
   navigator.serviceWorker.register('/Devtober2019/mainSW.js');
}

var importFilenames = [
    '/Devtober2019/js/scannerModal.js'
];
var index = 0;

function importFile(callback) {
    if (importFilenames.length === index) {
        return;
    }

    import(importFilenames[index]).then(module => {
        Object.assign(window, module);
        
        console.log(`Imported ${importFilenames[index]}`);
        ++index;
        callback(importFile);
    });
}

function instantiateTemplate(templateID, parent = document.body) {
    var template = document.querySelector(`#${templateID}`);

    if (!template) {
        console.error(`template ${templateID} is invalid: ${template}`);
        return;
    }

    var instance = document.importNode(template.content, true).children[0];
    parent.appendChild(instance);

    return instance;
}

importFile(importFile);

console.log('app.js LOG');

window.addEventListener('load', async () => {
    console.log('app.js LOAD LOG');

    if (window.location.hostname !== 'localhost') {
        checkForVideoInput();
    }

    var templatesToLoad = [
        'scannerModal',
        'scannerResultModal',

        'pages/home',
    ];
    var parser = new DOMParser();
    var processed = 0;
    var resolve = () => {console.error('RESOLVE UNSET !');};

    templatesToLoad.forEach((async templateName => {
        let finish = () => {
            if (++processed === templatesToLoad.length) {
                resolve();
            }
        };

        try {
            let response = await fetch(`templates/${templateName}.html`);
            let responseText = await response.text();
            
            if (response.status < 200 || response.status > 299) {
                console.error(`Could not load template ${templateName} [${response.status}]: ${responseText}`);
                return;
            }
    
            var template = parser.parseFromString(responseText, 'text/html').querySelector('head > template');
            document.body.appendChild(template);
            console.log(`Imported template ${templateName}`);
        }
        catch (e) {
            console.error(`Error while loading template ${templatesToLoad}: ${e}`);
        }
        finally {
            finish();
        }
    }));

    await new Promise((r) => {
        resolve = r;
    });

    instantiateTemplate('home-page', document.body);
});
