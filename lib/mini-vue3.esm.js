const extend = Object.assign;
const isOn = (key) => /^on[A-Z]/.test(key);
const getEvent = (key) => key.slice(2).toLowerCase();
const isArray = Array.isArray;
const isString = (val) => typeof val === 'string';
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (obj, key) => hasOwnProperty.call(obj, key);

const targetMap = new Map();
function trigger(target, key) {
    // targetMap -> target -> depsMap -> key -> dep
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        }
        if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandler = {
    get,
    set
};
const readonlyHandler = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`${key} can't set, ${target} is readonly`);
        return true;
    }
};
const shallowReadonlyHandler = extend({}, readonlyHandler, {
    get: shallowReadonlyGet
});

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
})(ReactiveFlags || (ReactiveFlags = {}));
function createProxy(raw, baseHandler) {
    if (!isObject(raw)) {
        console.warn(`Proxy target must be a object`);
        return raw;
    }
    return new Proxy(raw, baseHandler);
}
function reactive(raw) {
    return createProxy(raw, mutableHandler);
}
function readonly(raw) {
    return createProxy(raw, readonlyHandler);
}
function shallowReadonly(raw) {
    return createProxy(raw, shallowReadonlyHandler);
}

function initProps(instance, rawProps) {
    instance.props = rawProps;
}

const publicPropertiesMap = {
    $el: i => i.vnode.el
};
const publicInstanceHandler = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        if (key === '$el') {
            return publicPropertiesMap['$el'](instance);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        render: null
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initSlots
    initProps(instance, instance.vnode.props);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceHandler);
    const { setup } = component;
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props));
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // object function
    if (isObject(setupResult)) {
        instance.setupState = setupResult;
    }
    finshComponentSetup(instance);
}
function finshComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, props, shapeFlag, children } = vnode;
    const el = vnode.el = document.createElement(type);
    setAttr(el, props);
    mountChildren(el, shapeFlag, children);
    container.append(el);
}
function setAttr(el, props) {
    for (const key in props) {
        const value = props[key];
        if (isOn(key)) {
            el.addEventListener(getEvent(key), value);
        }
        if (isString(value)) {
            el.setAttribute(key, value);
        }
        else if (isArray(value)) {
            el.setAttribute(key, value.join(' '));
        }
    }
}
function mountChildren(el, shapeFlag, children) {
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        children.forEach(v => patch(v, el));
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // vnode
    patch(subTree, container);
    vnode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        el: null,
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type)
    };
    if (isString(children)) {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return isString(type) ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootSelector) {
            const rootContainer = document.querySelector(rootSelector);
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
