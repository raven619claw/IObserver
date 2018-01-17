import 'index';
// call this func to setup the service and use for elements
function _setUpIntersectionObForModules() {
    let options = {
      //set this attr on the elements to be used as entry for Observer
      //all are optional
      //this dataAttr val will be set to default if no specific attr value given in the callbackObj
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
    //define the type of each el or the attr property of data-io-type on the el is set as the type
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
