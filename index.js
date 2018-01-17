class observerStore {
    constructor(name, options, callbackFnObjForEachEntry) {
        this.featurePresent = true;
        if (!('IntersectionObserver' in window)) {
            this.featurePresent = false;
            console.error('Browser does not support : IntersectionObserver');
            return
        }
        //dataAttrs for checking elements to add is mandatory and will return if not passed
        //to add addtional checks use the checkOptions function
        if (!this.checkOptions(options))
            return;
        this.name = name;
        // can be used to pass initial callback fn object for elements to be added later on to the observer
        this.callbackFnObjForEachEntry = callbackFnObjForEachEntry || {};
        //initial options
        this.options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.01,
        };
        //update the options passed as args
        this.options = Object.assign({}, this.options, options);
        if(this.featurePresent){
            //if feature present then create a new observer
            this.observerObj = new IntersectionObserver(this.callbackfn.bind(this), this.options);
        }
    };
    //the callback function which will observe all elements and based on the type of [el-type] call the callback func passed for that type of element
    callbackfn(entries) {
        entries.forEach(entry => {
            // based on the type(data-attr of tht el) set the entryStoreObj to the required callback fn and args
            let entryStoreObj = this.callbackFnObjForEachEntry[entry.target.getAttribute(this.options.dataAttr)];
            //if no type is given then the default dataAttr is set as entryType
            let entryType = entryStoreObj && entryStoreObj.type || entry.target.getAttribute(this.options.dataAttr);
            if (entryStoreObj) {
                //the value to check how much % el should be visible to call the callback fn
                let entryLimit = entryStoreObj.limit || 0;
                //set the specific callback fn for the given type
                let entryCallbackFn = entryStoreObj.fn;
                //if once parameter is given then the callback is called only once then entry removed
                //else it is called everytime el is visible on screen
                let entryOnce = entryStoreObj.once || false;
                //to ignore deletion of el from obStore
                let ignoreDeletion = entryStoreObj.ignoreDeletion || false;
                if (typeof entryCallbackFn != 'function') {
                    //if no callback fn given then entry is removed
                    //see issue #1 at bot
                    if(!ignoreDeletion)
                        this.removeEntry(entry, entryType);
                    console.error('No callback fn given for entry: ', entryType);
                    return
                } else {
                    if (entryStoreObj.entryValidation && entryStoreObj.entryValidation(entry) || entry.intersectionRatio > entryLimit) {
                        if (entryOnce) {
                            //remove entry after calling it once
                            this.removeEntry(entry, entryType);
                        }
                        //called everytime el is in viewport
                        entryCallbackFn(entry);
                    }
                }
            } else {
                //if no entryObj is found then the entry el is removed from the store
                //see issue #1 at bot
                this.removeEntry(entry, entryType);
                console.error('No dataObject given for entry: ', entryType);
                return
            }
        });
    }
    //fn to remove entry for an el from the store
    //unobservers and removes the entry.target
    removeEntry(entry, type) {
        this.observerObj.unobserve(entry.target);
        this.removeEntryToCallbackFn(type);
    };
    //fn to add entry for an el
    //if callbackFn Obj provided then it is added else not
    //if the observe is called for this el before callback fn given then the el will be removed from the store
    //see issue #1 at bot
    addEntry(entry, additionalEntryCallbackFnObj) {
        this.observerObj.observe(entry);
        if (additionalEntryCallbackFnObj)
            this.addEntryToCallbackFn(additionalEntryCallbackFnObj);
    };
    //add elements based on a given type array from the whole page
    //if callbackFn Obj provided then it is added else not
    //if the observe is called for this el before callback fn given then the el will be removed from the store
    //see issue #1 at bot
    addTargets(targetTypeArray, additionalEntryCallbackFnObj) {
        targetTypeArray.forEach(target => {
            let targetObjs = document.querySelectorAll(target);
            targetObjs.forEach(targetObj => {
                this.observerObj.observe(targetObj);
            });
        });
        if (additionalEntryCallbackFnObj)
            this.addEntryToCallbackFn(additionalEntryCallbackFnObj);
    };
    //remove all el based on targetType
    removeTargets(targetTypeArray) {
        targetTypeArray.forEach(target => {
            let targetObjs = document.querySelectorAll(target);
            targetObjs.forEach(targetObj => {
                let type = targetObj.getAttribute(this.options.dataAttr);
                this.observerObj.unobserve(targetObj);
                this.removeEntryToCallbackFn(type);
            });
        });
    };
    //fn to update name of store
    updateName(newName) {
        this.name = newName;
    };
    //fn to update store options
    updateOptions(options) {
        if (!this.checkOptions(options))
            return;
        this.options = Object.assign({}, this.options, newOptions);
    }
    //fn to add callback entry objs
    addEntryToCallbackFn(additionalEntryCallbackFnObj) {
        this.callbackFnObjForEachEntry = Object.assign({}, this.callbackFnObjForEachEntry, additionalEntryCallbackFnObj);
    };
    //fn to remove callback entry objs
    removeEntryToCallbackFn(toRemoveObjArrayType) {
        delete this.callbackFnObjForEachEntry[toRemoveObjArrayType];
    };
    //fn to check validity of options
    //add custom validation in future
    checkOptions(options,customValidatorFn) {
        if (!options || !options.dataAttr) {
            console.error('No options or dataAttr provided');
            return false
        }
        //custom validator passed on initial setup
        if(customValidatorFn && typeof(customValidatorFn) == "function"){
            return customValidatorFn(options);
        }
        return true;
    };
    //fn to disconnect the entire store
    disconnect() {
        this.observerObj.disconnect();
    };
}

module.exports = observerStore;

//ISSUES
// #1 if el is added to store without a callback fn then the el is removed whn the observer starts
// can use param [ignoreDeletion] to ignore deleting the el from store but only works for the callback fn missing
// if no entryStoreObj is provided for tht element then it will be deleted
