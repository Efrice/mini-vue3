const toDisplayString = (val) => {
    return String(val);
};

const extend = Object.assign;
const isOn = (key) => /^on[A-Z]/.test(key);
const getEvent = (key) => key.slice(2).toLowerCase();
const isArray = Array.isArray;
const isString = (val) => typeof val === "string";
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const isFunction = (val) => typeof val === "function";
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (obj, key) => hasOwnProperty.call(obj, key);
const equal = (value1, value2) => Object.is(value1, value2);
const camelize = (event) => event.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const capitalize = (event) => event && event[0].toUpperCase() + event.slice(1);
const onEvent = (event) => event ? "on" + capitalize(camelize(event)) : "";

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        el: null,
        type,
        props,
        key: props && props.key,
        children,
        shapeFlag: getShapeFlag(type),
    };
    if (isString(children)) {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (isObject(children)) {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return isString(type) ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootSelector) {
                const rootContainer = document.querySelector(rootSelector);
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
}

class ReactiveEffect {
    constructor(fn, scheduler) {
        this.active = true;
        this.deps = [];
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const res = this._fn();
        shouldTrack = false;
        return res;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    // targetMap -> target -> depsMap -> key -> dep
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function isTracking() {
    // reactive when not effect, this activeEffect is null
    return shouldTrack && activeEffect !== null;
}
function trackEffects(dep) {
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
    }
}
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
let activeEffect = null; // reactiveEffect instance
let shouldTrack;
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function stop(runner) {
    runner.effect.stop();
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
        if (!isReadonly) {
            track(target, key);
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
    set,
};
const readonlyHandler = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`${key} can't set, ${target} is readonly`);
        return true;
    },
};
const shallowReadonlyHandler = extend({}, readonlyHandler, {
    get: shallowReadonlyGet,
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
function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE];
}
function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY];
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}

class RefImpl {
    constructor(value) {
        this._rawValue = value;
        this._value = convert(value);
        this.__v_isRef = true;
        this.dep = new Set();
    }
    get value() {
        if (isTracking()) {
            trackEffects(this.dep);
        }
        return this._value;
    }
    set value(newValue) {
        if (equal(newValue, this._rawValue))
            return;
        this._rawValue = newValue;
        this._value = convert(newValue);
        triggerEffects(this.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRef) {
    return new Proxy(objectWithRef, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
}

class ComputedRefImpl {
    constructor(getter) {
        this._getter = getter;
        this._dirty = true;
        this._effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true;
            }
        });
    }
    get value() {
        if (this._dirty) {
            this._value = this._effect.run();
            this._dirty = false;
        }
        return this._value;
    }
}
function computed(getter) {
    return new ComputedRefImpl(getter);
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const handler = props[onEvent(event)];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
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
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initSlots(instance, children) {
    const { shapeFlag } = instance.vnode;
    if (shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */ && isObject(children)) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotvalue(value(props));
    }
}
function normalizeSlotvalue(value) {
    return isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        parent,
        isMounted: false,
        next: null,
        type: vnode.type,
        setupState: {},
        provides: (parent === null || parent === void 0 ? void 0 : parent.provides) || {},
        props: {},
        slots: {},
        subTree: {},
        emit: () => { },
        render: null,
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceHandler);
    const { setup } = component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // object function
    if (isObject(setupResult)) {
        instance.setupState = proxyRefs(setupResult);
    }
    finshComponentSetup(instance);
}
function finshComponentSetup(instance) {
    const component = instance.type;
    if (!component.render && compiler) {
        if (component.template) {
            component.render = compiler(component.template);
        }
    }
    instance.render = component.render;
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
let compiler;
function registerRuntimeCompiler(_compiler) {
    compiler = _compiler;
}

function provide(key, value) {
    var _a;
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            return isFunction(defaultValue) ? defaultValue() : defaultValue;
        }
    }
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (isFunction(slot)) {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function getSequence(nums) {
    const len = nums.length;
    const p = Array.from({ length: len });
    const res = [0];
    let l, r;
    for (let i = 1; i < len; i++) {
        const cur = nums[i], j = res[res.length - 1];
        if (nums[j] < cur) {
            p[i] = j;
            res.push(i);
            continue;
        }
        (l = 0), (r = res.length - 1);
        while (l < r) {
            const mid = (l + r) >> 1;
            if (nums[res[mid]] < cur) {
                l = mid + 1;
            }
            else {
                r = mid;
            }
        }
        if (nums[res[l]] > cur) {
            if (l > 0) {
                p[i] = res[l - 1];
            }
            res[l] = i;
        }
    }
    r = res.length - 1;
    l = p[res[r]];
    while (r--) {
        res[r] = l;
        l = p[l];
    }
    return res;
}

function shouldComponentUpdate(n1, n2) {
    const { props: prevProps } = n1;
    const { props: nextProps } = n2;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

const queue = [];
let isFlushPending = false;
const p = Promise.resolve();
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    let job;
    while ((job = queue.shift())) {
        job && job();
    }
}

function createRenderer(options) {
    const { createElement, patchProp, insert, remove } = options;
    function render(vnode, container) {
        patch(null, vnode, container);
    }
    function patch(n1, n2, container, parentComponent, anchor) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2, container, parentComponent, anchor);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, parentComponent, anchor) {
        const prevProps = n1.props;
        const nextProps = n2.props;
        const el = (n2.el = n1.el);
        patchProps(el, prevProps, nextProps);
        patchChildren(el, n1, n2, parentComponent, anchor);
    }
    function patchProps(el, prevProps, nextProps) {
        for (const key in nextProps) {
            const prevProp = prevProps[key];
            const nextProp = nextProps[key];
            if (prevProp !== nextProp) {
                patchProp(el, key, nextProp);
            }
        }
        for (const key in prevProps) {
            if (!(key in nextProps)) {
                patchProp(el, key, null);
            }
        }
    }
    function patchChildren(container, n1, n2, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        const nextShapeFlag = n2.shapeFlag;
        if (prevShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */ &&
            nextShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            setElementText(container, n2.children);
        }
        else if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */ &&
            nextShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            unmountChildren(n1.children);
            setElementText(container, n2.children);
        }
        else if (prevShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */ &&
            nextShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            setElementText(container, null);
            mountChildren(n2, container, parentComponent, anchor);
        }
        else if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */ &&
            nextShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            patchKeyedChildren(n1.children, n2.children, container, parentComponent, anchor);
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
        let i = 0, e1 = c1.length - 1, e2 = c2.length - 1;
        const l2 = c2.length;
        // left
        while (i <= e1 && i <= e2) {
            const n1 = c1[i], n2 = c2[i];
            if (isSameVNode(n1, n2)) {
                patch(n1, n2, container, parentComponent, anchor);
            }
            else {
                break;
            }
            i++;
        }
        // right
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1], n2 = c2[e2];
            if (isSameVNode(n1, n2)) {
                patch(n1, n2, container, parentComponent, anchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // i e1 e2
        if (i > e1) {
            if (i <= e2) {
                const anchor = e2 + 1 < l2 ? c2[e2 + 1].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            while (i <= e1) {
                remove(c1[i].el);
                i++;
            }
        }
        else {
            // center
            let s1 = i, s2 = i;
            const toBePatched = e2 - s2 + 1;
            let patched = 0;
            const newIndexToOldIndexMap = Array.from({ length: toBePatched }, () => 0);
            let moved = false;
            let newIndexMax = 0;
            const keyToNewIndexMap = new Map();
            for (let j = s2; j <= e2; j++) {
                const nextChild = c2[j];
                keyToNewIndexMap.set(nextChild.key, j);
            }
            let newIndex;
            for (let k = s1; k <= e1; k++) {
                const prevChild = c1[k];
                if (patched >= toBePatched) {
                    remove(prevChild.el);
                    continue;
                }
                if (prevChild.key) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let i = s2; i <= e2; i++) {
                        if (isSameVNode(c1[i], c2[i])) {
                            newIndex = i;
                            break;
                        }
                    }
                }
                if (newIndex) {
                    if (newIndex >= newIndexMax) {
                        newIndexMax = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    patch(prevChild, c2[newIndex], container, parentComponent, anchor);
                    newIndexToOldIndexMap[newIndex - s2] = k + 1;
                    patched++;
                }
                else {
                    remove(prevChild.el);
                }
            }
            const increasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                anchor = c2[i + s2 + 1].el;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, c2[i + s2], container, parentComponent, anchor);
                }
                if (moved) {
                    if (increasingNewIndexSequence[j] !== i) {
                        insert(c2[i + s2].el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function isSameVNode(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    function setElementText(container, text) {
        container.textContent = text;
    }
    function unmountChildren(children) {
        children.forEach((item) => {
            const { el } = item;
            remove(el);
        });
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        const { type, props, shapeFlag, children } = vnode;
        const el = (vnode.el = createElement(type));
        setProps(el, props);
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parentComponent, anchor);
        }
        insert(el, container, anchor);
    }
    function setProps(el, props) {
        for (const key in props) {
            const value = props[key];
            patchProp(el, key, value);
        }
    }
    function mountChildren(vnode, container, parentComponent, anchor) {
        vnode.children.forEach((v) => patch(null, v, container, parentComponent, anchor));
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            patchComponent(n1, n2);
        }
    }
    function patchComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shouldComponentUpdate(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    function mountComponent(n2, container, parentComponent, anchor) {
        const instance = (n2.component = createComponentInstance(n2, parentComponent));
        setupComponent(instance);
        setupRenderEffect(instance, n2, container, anchor);
    }
    function setupRenderEffect(instance, vnode, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = instance.render.call(proxy, proxy);
                instance.subTree = subTree;
                patch(null, subTree, container, instance);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const { proxy } = instance;
                const subTree = instance.render.call(proxy, proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
                vnode.el = subTree.el;
            }
        }, {
            scheduler: () => {
                queueJobs(instance.update);
            },
        });
    }
    function updateComponentPreRender(instance, next) {
        instance.vnode = next;
        instance.next = null;
        instance.props = next.props;
    }
    return {
        render,
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, vlaue) {
    if (isOn(key)) {
        el.addEventListener(getEvent(key), vlaue);
    }
    if (isString(vlaue)) {
        el.setAttribute(key, vlaue);
    }
    else if (isArray(vlaue)) {
        el.setAttribute(key, vlaue.join(" "));
    }
    else if (vlaue === undefined || vlaue === null) {
        el.removeAttribute(key);
    }
}
function insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    computed: computed,
    createApp: createApp,
    createAppAPI: createAppAPI,
    createElementVNode: createVNode,
    createRenderer: createRenderer,
    createTextVNode: createTextVNode,
    effect: effect,
    getCurrentInstance: getCurrentInstance,
    h: h,
    inject: inject,
    insert: insert,
    isProxy: isProxy,
    isReactive: isReactive,
    isReadonly: isReadonly,
    isRef: isRef,
    nextTick: nextTick,
    provide: provide,
    proxyRefs: proxyRefs,
    reactive: reactive,
    readonly: readonly,
    ref: ref,
    registerRuntimeCompiler: registerRuntimeCompiler,
    remove: remove,
    renderSlots: renderSlots,
    shallowReadonly: shallowReadonly,
    stop: stop,
    toDisplayString: toDisplayString,
    unRef: unRef
});

const TO_DISPLAY_STRING = Symbol("toDisplayString");
const CREATE_ELEMENT_VNODE = Symbol("createElementVNode");
const helperMapName = {
    [TO_DISPLAY_STRING]: "toDisplayString",
    [CREATE_ELEMENT_VNODE]: "createElementVNode",
};

function generate(ast) {
    const context = createCodegenContext();
    const { push } = context;
    genFuntionPreamble(ast, context);
    push("return ");
    const functionName = "render";
    const args = ["_ctx", "_cache"];
    const signature = args.join(", ");
    push(`function ${functionName}(${signature})`);
    push("{ return ");
    genNode(ast.codegenNode, context);
    push("}");
    return {
        code: context.code,
    };
}
function createCodegenContext() {
    const context = {
        code: "",
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helperMapName[key]}`;
        },
    };
    return context;
}
function genFuntionPreamble(ast, context) {
    const { push } = context;
    const VueBinging = "Vue";
    const aliasHelper = (s) => `${helperMapName[s]}: _${helperMapName[s]}`;
    if (ast.helpers.length > 0) {
        push(`const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${VueBinging}\n`);
    }
}
function genNode(node, context) {
    switch (node.type) {
        case 1 /* NodeTypes.TEXT */:
            genText(node, context);
            break;
        case 3 /* NodeTypes.INTERPOLATION */:
            genInterpolation(node, context);
            break;
        case 4 /* NodeTypes.SIMPLE_EXPRESSION */:
            genExpression(node, context);
            break;
        case 2 /* NodeTypes.ELEMENT */:
            genElement(node, context);
            break;
        case 5 /* NodeTypes.COMPOUND_EXPRESSION */:
            genCompoundExpression(node, context);
            break;
    }
}
function genCompoundExpression(node, context) {
    const { push } = context;
    node.children.forEach((child) => {
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(child, context);
        }
    });
}
function genText(node, context) {
    const { push } = context;
    push(`'${node.content}'`);
}
function genInterpolation(node, context) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(")");
}
function genExpression(node, context) {
    const { push } = context;
    push(node.content);
}
function genElement(node, context) {
    const { push, helper } = context;
    const { tag, children } = node;
    push(`${helper(CREATE_ELEMENT_VNODE)}('${tag}', null, `);
    children.forEach((child) => {
        genNode(child, context);
    });
    push(")");
}

function baseParse(content) {
    const context = createParseContent(content);
    return createRoot(parseChildren(context, []));
}
function createParseContent(content) {
    return {
        source: content,
    };
}
function parseChildren(context, ancestors) {
    const nodes = [];
    while (!isEnd(context, ancestors)) {
        let node;
        const s = context.source;
        if (s.startsWith("{{")) {
            node = parseInterpolation(context);
        }
        else if (s.startsWith("<")) {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors);
            }
        }
        else {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function isEnd(context, ancestors) {
    if (ancestors.length > 0 && context.source.startsWith("</")) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i];
            if (startsWithEndTagOpen(context.source, tag)) {
                return true;
            }
        }
    }
    return !context.source;
}
function parseText(context) {
    let endIndex = context.source.length;
    let endTokens = ["<", "{{"];
    endTokens.forEach((item) => {
        const index = context.source.indexOf(item);
        if (index !== -1 && endIndex > index) {
            endIndex = index;
        }
    });
    const content = parseTextData(context, endIndex);
    advanceBy(context, content.length);
    return {
        type: 1 /* NodeTypes.TEXT */,
        content: content.trim(),
    };
}
function parseTextData(context, length) {
    return context.source.slice(0, length);
}
function parseElement(context, ancestors) {
    const element = parseTag(context, 0 /* TagTypes.START */);
    ancestors.push(element.tag);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, 1 /* TagTypes.END */);
    }
    else {
        throw new Error(`lack close tag ${element.tag}`);
    }
    return element;
}
function startsWithEndTagOpen(source, tag) {
    const closeTagFlag = "</", len = closeTagFlag.length;
    return (source.startsWith(closeTagFlag) &&
        source.slice(len, len + tag.length).toLowerCase() === tag.toLowerCase());
}
function parseTag(context, tagType) {
    const match = /^<\/?([a-z]+)/.exec(context.source);
    const tag = match[1];
    advanceBy(context, match[0].length + 1);
    if (tagType === 1 /* TagTypes.END */)
        return;
    return {
        type: 2 /* NodeTypes.ELEMENT */,
        tag,
    };
}
function parseInterpolation(context) {
    const openDelimiter = "{{";
    const closeDelimiter = "}}";
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);
    advanceBy(context, openDelimiter.length);
    const rawContentLength = closeIndex - closeDelimiter.length;
    const rawContent = parseTextData(context, rawContentLength);
    advanceBy(context, rawContentLength + closeDelimiter.length);
    return {
        type: 3 /* NodeTypes.INTERPOLATION */,
        content: {
            type: 4 /* NodeTypes.SIMPLE_EXPRESSION */,
            content: rawContent.trim(),
        },
    };
}
function advanceBy(context, length) {
    context.source = context.source.slice(length);
}
function createRoot(children) {
    return {
        type: 0 /* NodeTypes.ROOT */,
        children,
    };
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    traverseNode(root, context);
    createRootCodegen(root);
    root.helpers = [...context.helpers.keys()];
}
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        },
    };
    return context;
}
function createRootCodegen(root) {
    root.codegenNode = root.children[0];
}
function traverseNode(root, context) {
    const exitFns = [];
    context.nodeTransforms.forEach((plugin) => {
        const exitFn = plugin(root, context);
        exitFn && exitFns.push(exitFn);
    });
    switch (root.type) {
        case 3 /* NodeTypes.INTERPOLATION */:
            context.helper(TO_DISPLAY_STRING);
            break;
        case 0 /* NodeTypes.ROOT */:
        case 2 /* NodeTypes.ELEMENT */:
            root.children.forEach((node) => traverseNode(node, context));
            break;
    }
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}

function transformsElement(node, context) {
    if (node.type === 2 /* NodeTypes.ELEMENT */) {
        return () => {
            context.helper(CREATE_ELEMENT_VNODE);
        };
    }
}

function transformExpression(node) {
    if (node.type === 3 /* NodeTypes.INTERPOLATION */) {
        node.content = processExpression(node.content);
    }
}
function processExpression(node) {
    node.content = "_ctx." + node.content;
    return node;
}

function transformText(node) {
    if (node.type === 2 /* NodeTypes.ELEMENT */) {
        return () => {
            const { children } = node;
            let nodeContainer;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];
                        if (isText(next)) {
                            if (!nodeContainer) {
                                nodeContainer = children[i] = {
                                    type: 5 /* NodeTypes.COMPOUND_EXPRESSION */,
                                    children: [child],
                                };
                            }
                            nodeContainer.children.push(" + ");
                            nodeContainer.children.push(next);
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            nodeContainer = null;
                            break;
                        }
                    }
                }
            }
        };
    }
}
function isText(node) {
    return node.type === 1 /* NodeTypes.TEXT */ || node.type === 3 /* NodeTypes.INTERPOLATION */;
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformText, transformsElement],
    });
    return generate(ast);
}

function compileToFunction(template) {
    const { code } = baseCompile(template);
    const render = new Function("Vue", code)(runtimeDom);
    return render;
}
registerRuntimeCompiler(compileToFunction);

export { computed, createApp, createAppAPI, createVNode as createElementVNode, createRenderer, createTextVNode, effect, getCurrentInstance, h, inject, insert, isProxy, isReactive, isReadonly, isRef, nextTick, provide, proxyRefs, reactive, readonly, ref, registerRuntimeCompiler, remove, renderSlots, shallowReadonly, stop, toDisplayString, unRef };
