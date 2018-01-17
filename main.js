import 'intersectionObserverService';
// call this func to setup the service and use for elements
function _setUpIntersectionObForModules() {
    let options = {
      //set this attr on the elements to be used as entry for Observer
      //required is only the dataAttr
      //rest are optional
        dataAttr: 'data-io-type'
    }
    let ob = new IObService('module-loader', options);
    if (!ob.featurePresent) {
    //use the default polyfill you would use in the project
        callback_1();
        callback_2();
        return;
    }
    let modulesToLoad = [SELECTORS.EL_1, SELECTORS.EL_2];

    let callbackfnObj = {
    //define the type as the attr property of data-io-type on the el
        'el_type_1': {
            type: 'el_type_1',
            limit: 0,
            once: true,
            //pass a fn in closure and it will be called with the args in the observerService with the args of the observer 
            //or just pass a callback if you dont want to use any args or use bind
            fn: (args) => {
                callback_1();
            }
        },
        'el_type_2': {
            type: 'el_type_2',
            limit: 0,
            once: true,
            fn: (args) => {
                callback_2();
            }
        }
    };
    ob.addTargets(modulesToLoad, callbackfnObj);
};
