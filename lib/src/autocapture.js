import { _bind_instance_methods, _each, _extend, _includes, _isFunction, _isUndefined, _register_event, _safewrap_instance_methods, logger, } from './utils';
import { getClassName, getSafeText, isElementNode, isSensitiveElement, isTag, isTextNode, shouldCaptureDomEvent, shouldCaptureElement, shouldCaptureValue, autocaptureCompatibleElements, isAngularStyleAttr, isDocumentFragment, getDirectAndNestedSpanText, } from './autocapture-utils';
import RageClick from './extensions/rageclick';
import { AUTOCAPTURE_DISABLED_SERVER_SIDE } from './posthog-persistence';
var autocapture = {
    _initializedTokens: [],
    _isAutocaptureEnabled: false,
    _setIsAutocaptureEnabled: function (instance) {
        var disabled_server_side = !!instance.get_property(AUTOCAPTURE_DISABLED_SERVER_SIDE);
        var enabled_client_side = !!instance.get_config('autocapture');
        this._isAutocaptureEnabled = enabled_client_side && !disabled_server_side;
    },
    _previousElementSibling: function (el) {
        if (el.previousElementSibling) {
            return el.previousElementSibling;
        }
        else {
            var _el = el;
            do {
                _el = _el.previousSibling; // resolves to ChildNode->Node, which is Element's parent class
            } while (_el && !isElementNode(_el));
            return _el;
        }
    },
    _getAugmentPropertiesFromElement: function (elem) {
        var shouldCaptureEl = shouldCaptureElement(elem);
        if (!shouldCaptureEl) {
            return {};
        }
        var props = {};
        _each(elem.attributes, function (attr) {
            if (attr.name.startsWith('data-ph-capture-attribute')) {
                var propertyKey = attr.name.replace('data-ph-capture-attribute-', '');
                var propertyValue = attr.value;
                if (propertyKey && propertyValue && shouldCaptureValue(propertyValue)) {
                    props[propertyKey] = propertyValue;
                }
            }
        });
        return props;
    },
    _getPropertiesFromElement: function (elem, maskInputs, maskText) {
        var tag_name = elem.tagName.toLowerCase();
        var props = {
            tag_name: tag_name,
        };
        if (autocaptureCompatibleElements.indexOf(tag_name) > -1 && !maskText) {
            if (tag_name.toLowerCase() === 'a' || tag_name.toLowerCase() === 'button') {
                props['$el_text'] = getDirectAndNestedSpanText(elem);
            }
            else {
                props['$el_text'] = getSafeText(elem);
            }
        }
        var classes = getClassName(elem);
        if (classes.length > 0)
            props['classes'] = classes.split(' ').filter(function (c) {
                return c !== '';
            });
        _each(elem.attributes, function (attr) {
            // Only capture attributes we know are safe
            if (isSensitiveElement(elem) && ['name', 'id', 'class'].indexOf(attr.name) === -1)
                return;
            if (!maskInputs && shouldCaptureValue(attr.value) && !isAngularStyleAttr(attr.name)) {
                props['attr__' + attr.name] = attr.value;
            }
        });
        var nthChild = 1;
        var nthOfType = 1;
        var currentElem = elem;
        while ((currentElem = this._previousElementSibling(currentElem))) {
            // eslint-disable-line no-cond-assign
            nthChild++;
            if (currentElem.tagName === elem.tagName) {
                nthOfType++;
            }
        }
        props['nth_child'] = nthChild;
        props['nth_of_type'] = nthOfType;
        return props;
    },
    _getDefaultProperties: function (eventType) {
        return {
            $event_type: eventType,
            $ce_version: 1,
        };
    },
    _extractCustomPropertyValue: function (customProperty) {
        var propValues = [];
        _each(document.querySelectorAll(customProperty['css_selector']), function (matchedElem) {
            var value;
            if (['input', 'select'].indexOf(matchedElem.tagName.toLowerCase()) > -1) {
                value = matchedElem['value'];
            }
            else if (matchedElem['textContent']) {
                value = matchedElem['textContent'];
            }
            if (shouldCaptureValue(value)) {
                propValues.push(value);
            }
        });
        return propValues.join(', ');
    },
    // TODO: delete custom_properties after changeless typescript refactor
    _getCustomProperties: function (targetElementList) {
        var _this = this;
        var props = {}; // will be deleted
        _each(this._customProperties, function (customProperty) {
            _each(customProperty['event_selectors'], function (eventSelector) {
                var eventElements = document.querySelectorAll(eventSelector);
                _each(eventElements, function (eventElement) {
                    if (_includes(targetElementList, eventElement) && shouldCaptureElement(eventElement)) {
                        props[customProperty['name']] = _this._extractCustomPropertyValue(customProperty);
                    }
                });
            });
        });
        return props;
    },
    _getEventTarget: function (e) {
        var _a;
        // https://developer.mozilla.org/en-US/docs/Web/API/Event/target#Compatibility_notes
        if (typeof e.target === 'undefined') {
            return e.srcElement || null;
        }
        else {
            if ((_a = e.target) === null || _a === void 0 ? void 0 : _a.shadowRoot) {
                return e.composedPath()[0] || null;
            }
            return e.target || null;
        }
    },
    _captureEvent: function (e, instance, eventName) {
        var _this = this;
        var _a;
        if (eventName === void 0) { eventName = '$autocapture'; }
        /*** Don't mess with this code without running IE8 tests on it ***/
        var target = this._getEventTarget(e);
        if (isTextNode(target)) {
            // defeat Safari bug (see: http://www.quirksmode.org/js/events_properties.html)
            target = (target.parentNode || null);
        }
        if (eventName === '$autocapture' && e.type === 'click' && e instanceof MouseEvent) {
            if ((_a = this.rageclicks) === null || _a === void 0 ? void 0 : _a.isRageClick(e.clientX, e.clientY, new Date().getTime())) {
                this._captureEvent(e, instance, '$rageclick');
            }
        }
        if (target && shouldCaptureDomEvent(target, e, this.config)) {
            var targetElementList = [target];
            var curEl = target;
            while (curEl.parentNode && !isTag(curEl, 'body')) {
                if (isDocumentFragment(curEl.parentNode)) {
                    targetElementList.push(curEl.parentNode.host);
                    curEl = curEl.parentNode.host;
                    continue;
                }
                targetElementList.push(curEl.parentNode);
                curEl = curEl.parentNode;
            }
            var elementsJson_1 = [];
            var autocaptureAugmentProperties_1 = {};
            var href_1, explicitNoCapture_1 = false;
            _each(targetElementList, function (el) {
                var shouldCaptureEl = shouldCaptureElement(el);
                // if the element or a parent element is an anchor tag
                // include the href as a property
                if (el.tagName.toLowerCase() === 'a') {
                    href_1 = el.getAttribute('href');
                    href_1 = shouldCaptureEl && shouldCaptureValue(href_1) && href_1;
                }
                // allow users to programmatically prevent capturing of elements by adding class 'ph-no-capture'
                var classes = getClassName(el).split(' ');
                if (_includes(classes, 'ph-no-capture')) {
                    explicitNoCapture_1 = true;
                }
                elementsJson_1.push(_this._getPropertiesFromElement(el, instance.get_config('mask_all_element_attributes'), instance.get_config('mask_all_text')));
                var augmentProperties = _this._getAugmentPropertiesFromElement(el);
                _extend(autocaptureAugmentProperties_1, augmentProperties);
            });
            if (!instance.get_config('mask_all_text')) {
                // if the element is a button or anchor tag get the span text from any
                // children and include it as/with the text property on the parent element
                if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button') {
                    elementsJson_1[0]['$el_text'] = getDirectAndNestedSpanText(target);
                }
                else {
                    elementsJson_1[0]['$el_text'] = getSafeText(target);
                }
            }
            if (href_1) {
                elementsJson_1[0]['attr__href'] = href_1;
            }
            if (explicitNoCapture_1) {
                return false;
            }
            var props = _extend(this._getDefaultProperties(e.type), {
                $elements: elementsJson_1,
            }, this._getCustomProperties(targetElementList), autocaptureAugmentProperties_1);
            instance.capture(eventName, props);
            return true;
        }
    },
    // only reason is to stub for unit tests
    // since you can't override window.location props
    _navigate: function (href) {
        window.location.href = href;
    },
    _addDomEventHandlers: function (instance) {
        var _this = this;
        var handler = function (e) {
            e = e || window.event;
            _this._captureEvent(e, instance);
        };
        _register_event(document, 'submit', handler, false, true);
        _register_event(document, 'change', handler, false, true);
        _register_event(document, 'click', handler, false, true);
    },
    _customProperties: [],
    rageclicks: null,
    config: undefined,
    init: function (instance) {
        var _a;
        if (typeof instance.__autocapture !== 'boolean') {
            this.config = instance.__autocapture;
        }
        // precompile the regex
        if ((_a = this.config) === null || _a === void 0 ? void 0 : _a.url_allowlist) {
            this.config.url_allowlist = this.config.url_allowlist.map(function (url) { return new RegExp(url); });
        }
        this.rageclicks = new RageClick(instance.get_config('rageclick'));
    },
    afterDecideResponse: function (response, instance) {
        var _a;
        this._setIsAutocaptureEnabled(instance);
        var token = instance.get_config('token');
        if (this._initializedTokens.indexOf(token) > -1) {
            logger.log('autocapture already initialized for token "' + token + '"');
            return;
        }
        if (instance.persistence) {
            instance.persistence.register((_a = {},
                _a[AUTOCAPTURE_DISABLED_SERVER_SIDE] = !!response['autocapture_opt_out'],
                _a));
        }
        this._initializedTokens.push(token);
        if (response &&
            response['config'] &&
            response['config']['enable_collect_everything'] &&
            this._isAutocaptureEnabled) {
            // TODO: delete custom_properties after changeless typescript refactor
            if (response['custom_properties']) {
                this._customProperties = response['custom_properties'];
            }
            this._addDomEventHandlers(instance);
        }
        else {
            instance['__autocapture'] = false;
        }
    },
    // this is a mechanism to ramp up CE with no server-side interaction.
    // when CE is active, every page load results in a decide request. we
    // need to gently ramp this up so we don't overload decide. this decides
    // deterministically if CE is enabled for this project by modding the char
    // value of the project token.
    enabledForProject: function (token, numBuckets, numEnabledBuckets) {
        if (!token) {
            return true;
        }
        numBuckets = !_isUndefined(numBuckets) ? numBuckets : 10;
        numEnabledBuckets = !_isUndefined(numEnabledBuckets) ? numEnabledBuckets : 10;
        var charCodeSum = 0;
        for (var i = 0; i < token.length; i++) {
            charCodeSum += token.charCodeAt(i);
        }
        return charCodeSum % numBuckets < numEnabledBuckets;
    },
    isBrowserSupported: function () {
        return _isFunction(document.querySelectorAll);
    },
};
_bind_instance_methods(autocapture);
_safewrap_instance_methods(autocapture);
export { autocapture };
//# sourceMappingURL=autocapture.js.map