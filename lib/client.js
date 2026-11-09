window.__ModuleLoader__.load({ id: "dsh-icon-grid", factory: (require) => {
"use strict";
var module = { exports: {} }; var exports = module.exports;
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
const react_dom_client = __toESM(require("react-dom/client"));
const react = __toESM(require("react"));
const react_jsx_runtime = __toESM(require("react/jsx-runtime"));

//#region src/panel/NumberField.tsx
const baseStyle = {
	width: 48,
	padding: "3px 6px",
	fontSize: 12,
	textAlign: "right",
	fontVariantNumeric: "tabular-nums",
	color: "#e8e8f0",
	border: "1px solid rgba(255,255,255,0.12)",
	borderRadius: 4,
	outline: "none",
	boxSizing: "border-box",
	cursor: "text",
	transition: "background 100ms, border-color 100ms"
};
const NumberField = ({ value, min, max, step = 1, precision = 0, onChange }) => {
	const [text, setText] = (0, react.useState)(() => String(value));
	const [focused, setFocused] = (0, react.useState)(false);
	(0, react.useEffect)(() => {
		if (!focused) setText(String(value));
	}, [value, focused]);
	const clamp = (v) => {
		let c = Math.max(min, Math.min(max, v));
		if (precision > 0) {
			const f = Math.pow(10, precision);
			c = Math.round(c * f) / f;
		} else c = Math.round(c);
		return c;
	};
	const commit = () => {
		const n = Number(text);
		if (!Number.isFinite(n)) {
			setText(String(value));
			return;
		}
		const v = clamp(n);
		setText(String(v));
		if (v !== value) onChange(v);
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
		type: "text",
		inputMode: "decimal",
		value: text,
		onChange: (e) => setText(e.target.value),
		onFocus: (e) => {
			setFocused(true);
			e.target.select();
		},
		onBlur: () => {
			setFocused(false);
			commit();
		},
		onKeyDown: (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				e.target.blur();
			} else if (e.key === "Escape") {
				setText(String(value));
				e.target.blur();
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				onChange(clamp(value + step));
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				onChange(clamp(value - step));
			}
		},
		style: {
			...baseStyle,
			background: focused ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)",
			border: focused ? "1px solid #0969da" : "1px solid rgba(255,255,255,0.12)"
		}
	});
};

//#endregion
//#region ../../../node_modules/.pnpm/@deepseek-ai+cosmokit@1.8.6/node_modules/@deepseek-ai/cosmokit/lib/index.js
/** Return true when a value is `null` or `undefined`. */
function isNullable(value) {
	return value === null || value === void 0;
}
/** Return true for non-array object values. */
function isPlainObject(data) {
	return data && typeof data === "object" && !Array.isArray(data);
}
/** Filter object entries and return a new object. */
function filterKeys(object, filter) {
	return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
/** Map object values while preserving the original key set. */
function mapValues(object, transform) {
	return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
/** Pick selected keys from an object, optionally including `undefined` values. */
function pick(source, keys, forced) {
	if (!keys) return { ...source };
	const result = {};
	for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
	return result;
}
/** Shared config references used by schema validators and plugin runtimes. */
const write = Symbol.for("cosmokit.volatile.write");
function snapshot(value, ancestors = /* @__PURE__ */ new Set()) {
	if (typeof value === "function") throw new TypeError("volatile config cannot contain functions");
	if (value === null || typeof value !== "object") return value;
	if (ancestors.has(value)) throw new TypeError("volatile config cannot contain cycles");
	ancestors.add(value);
	try {
		if (Array.isArray(value)) return Object.freeze(value.map((item) => snapshot(item, ancestors)));
		if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw new TypeError("volatile config objects must be plain objects or arrays");
		return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, snapshot(item, ancestors)])));
	} finally {
		ancestors.delete(value);
	}
}
/**
* Create a detached reference containing an immutable copy of the supplied data.
* @param value - validated config data; class instances and functions are unsupported.
* @returns a reference whose value is updated only by its owning runtime.
*/
function createVolatile(value) {
	let current = snapshot(value);
	return Object.freeze({
		get: () => current,
		[write]: (value$1) => {
			current = value$1;
		}
	});
}
/**
* Identify references across ESM/CJS copies of the shared library.
* @param value - a parsed config value.
* @returns whether the value implements the shared reference protocol.
*/
function isVolatile(value) {
	return typeof value === "object" && value !== null && write in value;
}
/** Test values using `instanceof` with a `toStringTag` fallback. */
function is(type, value) {
	if (arguments.length === 1) return (value$1) => is(type, value$1);
	return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
	return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
	return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
/** Binary source detection and base64/hex conversion helpers. */
var Binary;
(function(Binary$1) {
	Binary$1.is = isArrayBufferLike;
	Binary$1.isSource = isArrayBufferSource;
	function fromSource(source) {
		if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
		else return source;
	}
	Binary$1.fromSource = fromSource;
	function toBase64(source) {
		source = fromSource(source);
		if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
		let binary = "";
		const bytes = new Uint8Array(source);
		for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
		return btoa(binary);
	}
	Binary$1.toBase64 = toBase64;
	function fromBase64(source) {
		if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
		return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
	}
	Binary$1.fromBase64 = fromBase64;
	function toHex(source) {
		source = fromSource(source);
		if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
		return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
	}
	Binary$1.toHex = toHex;
	function fromHex(source) {
		if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
		const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
		const buffer = [];
		for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
		return Uint8Array.from(buffer).buffer;
	}
	Binary$1.fromHex = fromHex;
})(Binary || (Binary = {}));
/** Decode a base64 string into binary data. */
const base64ToArrayBuffer = Binary.fromBase64;
/** Encode binary data as base64. */
const arrayBufferToBase64 = Binary.toBase64;
/** Decode a hex string into binary data. */
const hexToArrayBuffer = Binary.fromHex;
/** Encode binary data as hex. */
const arrayBufferToHex = Binary.toHex;
/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
function clone(source, refs = /* @__PURE__ */ new Map()) {
	if (!source || typeof source !== "object") return source;
	if (is("Date", source)) return new Date(source.valueOf());
	if (is("RegExp", source)) return new RegExp(source.source, source.flags);
	if (isArrayBufferLike(source)) return source.slice(0);
	if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
	const cached = refs.get(source);
	if (cached) return cached;
	if (Array.isArray(source)) {
		const result$1 = [];
		refs.set(source, result$1);
		source.forEach((value, index) => {
			result$1[index] = Reflect.apply(clone, null, [value, refs]);
		});
		return result$1;
	}
	const result = Object.create(Object.getPrototypeOf(source));
	refs.set(source, result);
	for (const key of Reflect.ownKeys(source)) {
		const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
		if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
		Reflect.defineProperty(result, key, descriptor);
	}
	return result;
}
/**
* Compare values recursively, treating two volatile references as equal regardless of value.
* Strict comparison distinguishes null/undefined, treats opaque objects by identity,
* compares URLs by normalized href, treats array holes as undefined, and considers distinct cyclic structures unequal.
* @param a - first value.
* @param b - second value.
* @param strict - whether to require strict data equality outside volatile references.
* @returns whether the values compare equal.
*/
function deepEqual(a, b, strict) {
	const ancestors = /* @__PURE__ */ new Set();
	function compare(a$1, b$1) {
		if (a$1 === b$1) return true;
		if (isVolatile(a$1) || isVolatile(b$1)) return isVolatile(a$1) && isVolatile(b$1);
		if (!strict && isNullable(a$1) && isNullable(b$1)) return true;
		if (typeof a$1 !== typeof b$1 || typeof a$1 !== "object" || !a$1 || !b$1) return false;
		if (ancestors.has(a$1)) return false;
		function check(test, then) {
			return test(a$1) ? test(b$1) ? then(a$1, b$1) : false : test(b$1) ? false : void 0;
		}
		ancestors.add(a$1);
		try {
			return check(Array.isArray, (a$2, b$2) => {
				if (a$2.length !== b$2.length) return false;
				for (let index = 0; index < a$2.length; index++) if (!compare(a$2[index], b$2[index])) return false;
				return true;
			}) ?? check(is("Date"), (a$2, b$2) => a$2.valueOf() === b$2.valueOf()) ?? check(is("URL"), (a$2, b$2) => a$2.href === b$2.href) ?? check(is("RegExp"), (a$2, b$2) => a$2.source === b$2.source && a$2.flags === b$2.flags) ?? check(isArrayBufferLike, (a$2, b$2) => {
				if (a$2.byteLength !== b$2.byteLength) return false;
				const viewA = new Uint8Array(a$2);
				const viewB = new Uint8Array(b$2);
				for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
				return true;
			}) ?? ((!strict || [a$1, b$1].every((value) => Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)) && Object.keys({
				...a$1,
				...b$1
			}).every((key) => compare(a$1[key], b$1[key])));
		} finally {
			ancestors.delete(a$1);
		}
	}
	return compare(a, b);
}
/** Time constants plus parsing and formatting helpers. */
var Time;
(function(Time$1) {
	Time$1.millisecond = 1;
	Time$1.second = 1e3;
	Time$1.minute = Time$1.second * 60;
	Time$1.hour = Time$1.minute * 60;
	Time$1.day = Time$1.hour * 24;
	Time$1.week = Time$1.day * 7;
	let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
	function setTimezoneOffset(offset) {
		timezoneOffset = offset;
	}
	Time$1.setTimezoneOffset = setTimezoneOffset;
	function getTimezoneOffset() {
		return timezoneOffset;
	}
	Time$1.getTimezoneOffset = getTimezoneOffset;
	function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
		if (typeof date === "number") date = new Date(date);
		if (offset === void 0) offset = timezoneOffset;
		return Math.floor((date.valueOf() / Time$1.minute - offset) / 1440);
	}
	Time$1.getDateNumber = getDateNumber;
	function fromDateNumber(value, offset) {
		const date = new Date(value * Time$1.day);
		if (offset === void 0) offset = timezoneOffset;
		return new Date(+date + offset * Time$1.minute);
	}
	Time$1.fromDateNumber = fromDateNumber;
	const numeric = /\d+(?:\.\d+)?/.source;
	const timeRegExp = new RegExp(`^${[
		"w(?:eek(?:s)?)?",
		"d(?:ay(?:s)?)?",
		"h(?:our(?:s)?)?",
		"m(?:in(?:ute)?(?:s)?)?",
		"s(?:ec(?:ond)?(?:s)?)?"
	].map((unit) => `(${numeric}${unit})?`).join("")}$`);
	function parseTime(source) {
		const capture = timeRegExp.exec(source);
		if (!capture) return 0;
		return (parseFloat(capture[1]) * Time$1.week || 0) + (parseFloat(capture[2]) * Time$1.day || 0) + (parseFloat(capture[3]) * Time$1.hour || 0) + (parseFloat(capture[4]) * Time$1.minute || 0) + (parseFloat(capture[5]) * Time$1.second || 0);
	}
	Time$1.parseTime = parseTime;
	function parseDate(date) {
		const parsed = parseTime(date);
		if (parsed) date = Date.now() + parsed;
		else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
		else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
		return date ? new Date(date) : /* @__PURE__ */ new Date();
	}
	Time$1.parseDate = parseDate;
	function format(ms) {
		const abs = Math.abs(ms);
		if (abs >= Time$1.day - Time$1.hour / 2) return Math.round(ms / Time$1.day) + "d";
		else if (abs >= Time$1.hour - Time$1.minute / 2) return Math.round(ms / Time$1.hour) + "h";
		else if (abs >= Time$1.minute - Time$1.second / 2) return Math.round(ms / Time$1.minute) + "m";
		else if (abs >= Time$1.second) return Math.round(ms / Time$1.second) + "s";
		return ms + "ms";
	}
	Time$1.format = format;
	function toDigits(source, length = 2) {
		return source.toString().padStart(length, "0");
	}
	Time$1.toDigits = toDigits;
	function template(template$1, time = /* @__PURE__ */ new Date()) {
		return template$1.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
	}
	Time$1.template = template;
})(Time || (Time = {}));

//#endregion
//#region ../../../node_modules/.pnpm/@deepseek-ai+schemastery@3.18.5/node_modules/@deepseek-ai/schemastery/lib/index.mjs
const kSchema = Symbol.for("schemastery");
const kValidationError = Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError = class extends TypeError {
	options;
	name = "ValidationError";
	constructor(message, options) {
		let prefix = "$";
		for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
		else if (typeof segment === "number") prefix += "[" + segment + "]";
		else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
		if (prefix.startsWith(".")) prefix = prefix.slice(1);
		super((prefix === "$" ? "" : `${prefix} `) + message);
		this.options = options;
	}
	static is(error) {
		return !!error?.[kValidationError];
	}
};
Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
const Schema = function(options) {
	const schema = function(data, options$1 = {}) {
		return Schema.resolve(data, schema, options$1)[0];
	};
	if (options.refs) {
		const refs = mapValues(options.refs, (options$1) => new Schema(options$1));
		const getRef = (uid) => refs[uid];
		for (const key in refs) {
			const options$1 = refs[key];
			options$1.sKey = getRef(options$1.sKey);
			options$1.inner = getRef(options$1.inner);
			options$1.list = options$1.list && options$1.list.map(getRef);
			options$1.dict = options$1.dict && mapValues(options$1.dict, getRef);
		}
		return refs[options.uid];
	}
	Object.assign(schema, options);
	if (typeof schema.callback === "string") try {
		schema.callback = new Function("return " + schema.callback)();
	} catch {}
	Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
	Object.setPrototypeOf(schema, Schema.prototype);
	schema.meta ||= {};
	schema.toString = schema.toString.bind(schema);
	return schema;
};
Schema.prototype = Object.create(Function.prototype);
Schema.prototype[kSchema] = true;
Object.defineProperty(Schema.prototype, "~standard", { get() {
	return {
		version: 1,
		vendor: "schemastery",
		validate: (value) => {
			try {
				return { value: Schema.resolve(value, this, {})[0] };
			} catch (error) {
				if (ValidationError.is(error)) return { issues: [{
					message: error.message,
					path: error.options.path
				}] };
				throw error;
			}
		}
	};
} });
Schema.ValidationError = ValidationError;
Schema.prototype.toJSON = function toJSON() {
	if (globalThis.__schemastery_refs__) {
		globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
		return this.uid;
	}
	globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
	globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
	const result = {
		uid: this.uid,
		refs: globalThis.__schemastery_refs__
	};
	globalThis.__schemastery_refs__ = void 0;
	return result;
};
Schema.prototype.set = function set(key, value) {
	this.dict[key] = value;
	return this;
};
Schema.prototype.push = function push(value) {
	this.list.push(value);
	return this;
};
function mergeDesc(original, messages) {
	const result = typeof original === "string" ? { "": original } : { ...original };
	for (const locale in messages) {
		const value = messages[locale];
		if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
		else if (typeof value === "string") result[locale] = value;
	}
	return result;
}
function getInner(value) {
	return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
	return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema.prototype.i18n = function i18n(messages) {
	const schema = Schema(this);
	const desc = mergeDesc(schema.meta.description, messages);
	if (Object.keys(desc).length) schema.meta.description = desc;
	if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
		return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
	});
	if (schema.list) schema.list = schema.list.map((inner, index) => {
		return inner.i18n(mapValues(messages, (data = {}) => {
			if (Array.isArray(getInner(data))) return getInner(data)[index];
			if (Array.isArray(data)) return data[index];
			return extractKeys(data);
		}));
	});
	if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
		if (getInner(data)) return getInner(data);
		return extractKeys(data);
	}));
	if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
	return schema;
};
Schema.prototype.extra = function extra(key, value) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
};
for (const key of [
	"required",
	"disabled",
	"collapse",
	"hidden",
	"loose"
]) Object.assign(Schema.prototype, { [key](value = true) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
} });
Schema.prototype.deprecated = function deprecated() {
	const schema = Schema(this);
	schema.meta.badges ||= [];
	schema.meta.badges.push({
		text: "deprecated",
		type: "danger"
	});
	return schema;
};
Schema.prototype.experimental = function experimental() {
	const schema = Schema(this);
	schema.meta.badges ||= [];
	schema.meta.badges.push({
		text: "experimental",
		type: "warning"
	});
	return schema;
};
Schema.prototype.pattern = function pattern(regexp) {
	const schema = Schema(this);
	const pattern$1 = pick(regexp, ["source", "flags"]);
	schema.meta = {
		...schema.meta,
		pattern: pattern$1
	};
	return schema;
};
Schema.prototype.simplify = function simplify(value) {
	if (isVolatile(value)) value = value.get();
	if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
	if (isNullable(value)) return value;
	if (this.type === "object" || this.type === "dict") {
		const result = {};
		for (const key in value) {
			const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
			if (this.type === "dict" || !isNullable(item)) result[key] = item;
		}
		if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
		return result;
	} else if (this.type === "array" || this.type === "tuple") {
		const result = [];
		value.forEach((value$1, index) => {
			const schema = this.type === "array" ? this.inner : this.list[index];
			const item = schema ? schema.simplify(value$1) : value$1;
			result.push(item);
		});
		return result;
	} else if (this.type === "intersect") {
		const result = {};
		for (const item of this.list) Object.assign(result, item.simplify(value));
		return result;
	} else if (this.type === "union") for (const schema of this.list) try {
		Schema.resolve(value, schema, {});
		return schema.simplify(value);
	} catch {}
	return value;
};
Schema.prototype.toString = function toString(inline) {
	return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema.prototype.role = function role(role$1, extra) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		role: role$1,
		extra
	};
	return schema;
};
for (const key of [
	"default",
	"link",
	"comment",
	"description",
	"max",
	"min",
	"step"
]) Object.assign(Schema.prototype, { [key](value) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
} });
Schema.prototype.volatile = function volatile() {
	if (this.meta.volatile) throw new TypeError("volatile schema is already wrapped");
	return this.extra("volatile", true);
};
const resolvers = {};
const checkedVolatile = Symbol("checked-volatile-schema");
function validateVolatileSchema(schema, path = [], blocked = false, seen = /* @__PURE__ */ new Map()) {
	const states = seen.get(schema) ?? /* @__PURE__ */ new Set();
	if (states.has(blocked)) return;
	states.add(blocked);
	seen.set(schema, states);
	if (schema.meta?.volatile && blocked) throw new ValidationError("volatile fields require a fixed object path without an enclosing volatile field", { path });
	const nested = blocked || !!schema.meta?.volatile;
	if (schema.dict) for (const [key, child] of Object.entries(schema.dict)) validateVolatileSchema(child, [...path, key], nested, seen);
	if (schema.sKey) validateVolatileSchema(schema.sKey, [...path, "<key>"], true, seen);
	if (schema.inner && (schema.type !== "lazy" || schema.inner[kSchema])) validateVolatileSchema(schema.inner, [...path, "*"], true, seen);
	if (schema.list) for (let index = 0; index < schema.list.length; index++) validateVolatileSchema(schema.list[index], [...path, String(index)], true, seen);
}
Schema.extend = function extend(type, resolve) {
	resolvers[type] = resolve;
};
Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
	if (!schema) return [data];
	if (!options[checkedVolatile]) {
		validateVolatileSchema(schema, options.path);
		options = {
			...options,
			[checkedVolatile]: true
		};
	}
	if (schema.meta?.volatile) {
		const inner = Schema(schema);
		inner.meta = {
			...schema.meta,
			volatile: false
		};
		const [value, adapted] = Schema.resolve(data, inner, options, strict);
		try {
			return [createVolatile(value), adapted];
		} catch (error) {
			throw new ValidationError(error instanceof Error ? error.message : String(error), options);
		}
	}
	if (options.ignore?.(data, schema)) return [data];
	if (isNullable(data) && schema.type !== "lazy") {
		if (schema.meta.required) throw new ValidationError(`missing required value`, options);
		let current = schema;
		let fallback = schema.meta.default;
		while (current?.type === "intersect" && isNullable(fallback)) {
			current = current.list[0];
			fallback = current?.meta.default;
		}
		if (isNullable(fallback)) return [data];
		data = clone(fallback);
	}
	const callback = resolvers[schema.type];
	if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
	try {
		return callback(data, schema, options, strict);
	} catch (error) {
		if (!schema.meta.loose) throw error;
		return [schema.meta.default];
	}
};
Schema.from = function from(source) {
	if (isNullable(source)) return Schema.any();
	else if ([
		"string",
		"number",
		"boolean"
	].includes(typeof source)) return Schema.const(source).required();
	else if (source[kSchema]) return source;
	else if (typeof source === "function") switch (source) {
		case String: return Schema.string().required();
		case Number: return Schema.number().required();
		case Boolean: return Schema.boolean().required();
		case Function: return Schema.function().required();
		default: return Schema.is(source).required();
	}
	else throw new TypeError(`cannot infer schema from ${source}`);
};
Schema.lazy = function lazy(builder) {
	const toJSON = () => {
		if (!schema.inner[kSchema]) {
			schema.inner = schema.builder();
			schema.inner.meta = {
				...schema.meta,
				...schema.inner.meta
			};
		}
		return schema.inner.toJSON();
	};
	const schema = new Schema({
		type: "lazy",
		builder,
		inner: { toJSON }
	});
	return schema;
};
Schema.natural = function natural() {
	return Schema.number().step(1).min(0);
};
Schema.percent = function percent() {
	return Schema.number().step(.01).min(0).max(1).role("slider");
};
Schema.date = function date() {
	return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
		const date$1 = new Date(value);
		if (isNaN(+date$1)) throw new ValidationError(`invalid date "${value}"`, options);
		return date$1;
	}, true)]);
};
Schema.regExp = function regExp(flag = "") {
	return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
		try {
			return new RegExp(value, flag);
		} catch (e) {
			throw new ValidationError(e.message, options);
		}
	}, true)]);
};
Schema.arrayBuffer = function arrayBuffer(encoding) {
	return Schema.union([
		Schema.is(ArrayBuffer),
		Schema.is(SharedArrayBuffer),
		Schema.transform(Schema.any(), (value, options) => {
			if (Binary.isSource(value)) return Binary.fromSource(value);
			throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
		}, true),
		...encoding ? [Schema.transform(Schema.string(), (value, options) => {
			try {
				return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
			} catch (e) {
				throw new ValidationError(e.message, options);
			}
		}, true)] : []
	]);
};
Schema.extend("lazy", (data, schema, options, strict) => {
	if (!schema.inner[kSchema]) {
		schema.inner = schema.builder();
		schema.inner.meta = {
			...schema.meta,
			...schema.inner.meta
		};
		validateVolatileSchema(schema.inner, options.path, true);
	}
	return Schema.resolve(data, schema.inner, options, strict);
});
Schema.extend("any", (data) => {
	return [data];
});
Schema.extend("never", (data, _, options) => {
	throw new ValidationError(`expected nullable but got ${data}`, options);
});
Schema.extend("const", (data, { value }, options) => {
	if (deepEqual(data, value)) return [value];
	throw new ValidationError(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta, description, options, skipMin = false) {
	const { max = Infinity, min = -Infinity } = meta;
	if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
	if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta }, options) => {
	if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
	if (meta.pattern) {
		const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
		if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
	}
	checkWithinRange(data.length, meta, "string length", options);
	return [data];
});
function decimalShift(data, digits) {
	const str = data.toString();
	if (str.includes("e")) return data * Math.pow(10, digits);
	const index = str.indexOf(".");
	if (index === -1) return data * Math.pow(10, digits);
	const frac = str.slice(index + 1);
	const integer = str.slice(0, index);
	if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
	return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
	step = Math.abs(step);
	if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
	const index = step.toString().indexOf(".");
	const digits = step.toString().slice(index + 1).length;
	return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema.extend("number", (data, { meta }, options) => {
	if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
	checkWithinRange(data, meta, "number", options);
	const { step } = meta;
	if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
	return [data];
});
Schema.extend("boolean", (data, _, options) => {
	if (typeof data === "boolean") return [data];
	throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta }, options) => {
	let value = 0, keys = [];
	if (typeof data === "number") {
		value = data;
		for (const key in bits) if (data & bits[key]) keys.push(key);
	} else if (Array.isArray(data)) {
		keys = data;
		for (const key of keys) {
			if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
			if (key in bits) value |= bits[key];
		}
	} else throw new ValidationError(`expected number or array but got ${data}`, options);
	if (value === meta.default) return [value];
	return [value, keys];
});
Schema.extend("function", (data, _, options) => {
	if (typeof data === "function") return [data];
	throw new ValidationError(`expected function but got ${data}`, options);
});
Schema.extend("is", (data, { constructor }, options) => {
	if (typeof constructor === "function") {
		if (data instanceof constructor) return [data];
		throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
	} else {
		if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
		let prototype = Object.getPrototypeOf(data);
		while (prototype) {
			if (prototype.constructor?.name === constructor) return [data];
			prototype = Object.getPrototypeOf(prototype);
		}
		throw new ValidationError(`expected ${constructor} but got ${data}`, options);
	}
});
function property(data, key, schema, options) {
	try {
		const [value, adapted] = Schema.resolve(data[key], schema, {
			...options,
			path: [...options.path || [], key]
		});
		if (adapted !== void 0) data[key] = adapted;
		return value;
	} catch (e) {
		if (!options?.autofix) throw e;
		delete data[key];
		return schema.meta.volatile ? createVolatile(schema.meta.default) : schema.meta.default;
	}
}
Schema.extend("array", (data, { inner, meta }, options) => {
	if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
	checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
	return [data.map((_, index) => property(data, index, inner, options))];
});
Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
	if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
	const result = {};
	for (const key in data) {
		let rKey;
		try {
			rKey = Schema.resolve(key, sKey, options)[0];
		} catch (error) {
			if (strict) continue;
			throw error;
		}
		result[rKey] = property(data, key, inner, options);
		data[rKey] = data[key];
		if (key !== rKey) delete data[key];
	}
	return [result];
});
Schema.extend("tuple", (data, { list }, options, strict) => {
	if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
	const result = list.map((inner, index) => property(data, index, inner, options));
	if (strict) return [result];
	result.push(...data.slice(list.length));
	return [result];
});
function merge(result, data) {
	for (const key in data) {
		if (key in result) continue;
		result[key] = data[key];
	}
}
Schema.extend("object", (data, { dict }, options, strict) => {
	if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
	const result = {};
	for (const key in dict) {
		const value = property(data, key, dict[key], options);
		if (!isNullable(value) || key in data) result[key] = value;
	}
	if (!strict) merge(result, data);
	return [result];
});
Schema.extend("union", (data, { list, toString }, options, strict) => {
	const messages = [];
	for (const inner of list) try {
		return Schema.resolve(data, inner, options, strict);
	} catch (error) {
		messages.push(error);
	}
	throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
});
Schema.extend("intersect", (data, { list, toString }, options, strict) => {
	if (!list.length) return [data];
	let result;
	for (const inner of list) {
		const value = Schema.resolve(data, inner, options, true)[0];
		if (isNullable(value)) continue;
		if (isNullable(result)) result = value;
		else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		else if (typeof value === "object") merge(result ??= {}, value);
		else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
	}
	if (!strict && isPlainObject(data)) merge(result, data);
	return [result];
});
Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
	const [result, adapted = data] = Schema.resolve(data, inner, options, true);
	if (preserve) return [callback(result)];
	else return [callback(result), callback(adapted)];
});
const formatters = {};
function defineMethod(name, keys, format) {
	formatters[name] = format;
	Object.assign(Schema, { [name](...args) {
		const schema = new Schema({ type: name });
		keys.forEach((key, index) => {
			switch (key) {
				case "sKey":
					schema.sKey = args[index] ?? Schema.string();
					break;
				case "inner":
					schema.inner = Schema.from(args[index]);
					break;
				case "list":
					schema.list = args[index].map(Schema.from);
					break;
				case "dict":
					schema.dict = mapValues(args[index], Schema.from);
					break;
				case "bits":
					schema.bits = {};
					for (const key$1 in args[index]) {
						if (typeof args[index][key$1] !== "number") continue;
						schema.bits[key$1] = args[index][key$1];
					}
					break;
				case "callback": {
					const callback = schema.callback = args[index];
					callback["toJSON"] ||= () => callback.toString();
					break;
				}
				case "constructor": {
					const constructor = schema.constructor = args[index];
					if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
					break;
				}
				default: schema[key] = args[index];
			}
		});
		if (name === "object" || name === "dict") schema.meta.default = {};
		else if (name === "array" || name === "tuple") schema.meta.default = [];
		else if (name === "bitset") schema.meta.default = 0;
		return schema;
	} });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
	if (typeof constructor === "function") return constructor.name;
	else return constructor;
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
	if (Object.keys(dict).length === 0) return "{}";
	return `{ ${Object.entries(dict).map(([key, inner]) => {
		return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
	}).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
	const result = list.map(({ toString: format }) => format()).join(" | ");
	return inline ? `(${result})` : result;
});
defineMethod("intersect", ["list"], ({ list }) => {
	return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", [
	"inner",
	"callback",
	"preserve"
], ({ inner }, isInner) => inner.toString(isInner));

//#endregion
//#region src/config.mjs
const SETTINGS_NS = "dsh-icon-grid";
/** 子域默认值（唯一真相源） */
const ICON_GRID_DEFAULTS = {
	order: [],
	cols: 8,
	rows: 12,
	cell: 46,
	gap: 6,
	iconAlpha: .08,
	gridAccent: "",
	marginRight: 24,
	marginBottom: 24,
	showGridLines: true,
	gridLineAlpha: .15
};
const iconGrid = Schema.object({
	order: Schema.array(Schema.string()).default(ICON_GRID_DEFAULTS.order),
	cols: Schema.number().default(ICON_GRID_DEFAULTS.cols),
	rows: Schema.number().default(ICON_GRID_DEFAULTS.rows),
	cell: Schema.number().default(ICON_GRID_DEFAULTS.cell),
	gap: Schema.number().default(ICON_GRID_DEFAULTS.gap),
	iconAlpha: Schema.number().default(ICON_GRID_DEFAULTS.iconAlpha),
	gridAccent: Schema.string().default(ICON_GRID_DEFAULTS.gridAccent),
	marginRight: Schema.number().default(ICON_GRID_DEFAULTS.marginRight),
	marginBottom: Schema.number().default(ICON_GRID_DEFAULTS.marginBottom),
	showGridLines: Schema.boolean().default(ICON_GRID_DEFAULTS.showGridLines),
	gridLineAlpha: Schema.number().default(ICON_GRID_DEFAULTS.gridLineAlpha)
});
const Config = Schema.object({ iconGrid });
Config.meta = Config.meta || {};
Config.meta.volatile = true;
/** 默认配置（host / client / 测试共用的唯一真相源） */
const DEFAULT_CONFIG = { iconGrid: { ...ICON_GRID_DEFAULTS } };
/**

* 把任意（可能残缺的）配置补全成完整配置。

* 纯函数，host 落库、client 读取、单测都走这一条路径。

* @param {any} raw

*/
function normalizeConfig(raw) {
	const g = raw?.iconGrid ?? {};
	return { iconGrid: {
		...ICON_GRID_DEFAULTS,
		...g
	} };
}

//#endregion
//#region src/lib/settings.mjs
/**

* settings describe() 解析（host / client / 单测共用）。

*

* DSH settings.describe() 有两种形态：

*   - 数组：[{ ns, value, revision }, ...]

*   - 对象：{ ok: true, value: { namespaces: [...] } }

* host 和 client 必须走同一条解析，否则会出现"client 读得到、host 读不到"

* 导致每次启动都写默认值、覆盖用户配置的问题。

*/
/**

* @param {any} res describe() 返回值

* @param {string} ns 命名空间

* @returns {any | undefined}

*/
function pickNamespace(res, ns) {
	if (Array.isArray(res)) return res.find((c) => c?.ns === ns);
	if (res && res.ok && Array.isArray(res.value?.namespaces)) return res.value.namespaces.find((c) => c?.ns === ns);
	return void 0;
}

//#endregion
//#region src/panel/helpers.ts
const LOCAL_KEY = "dsh-icon-grid-config";
const PANEL_POS_KEY = "dsh-icon-grid-panel-pos";
const LEGACY_LOCAL_KEY = "dsh-ui-config";
function ls() {
	try {
		return typeof localStorage === "undefined" ? null : localStorage;
	} catch {
		return null;
	}
}
function loadLocalConfig() {
	try {
		const raw = ls()?.getItem(LOCAL_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? normalizeConfig(parsed) : null;
	} catch {
		return null;
	}
}
function saveLocalConfig(config) {
	try {
		ls()?.setItem(LOCAL_KEY, JSON.stringify(normalizeConfig(config)));
		return true;
	} catch {
		return false;
	}
}
/**

* 读本地配置；新 key 没有时尝试从旧 dsh-ui-config 迁移 iconGrid。

* 迁移成功后删旧 key，避免每次启动都重跑。

*/
function loadLocalConfigWithMigration() {
	const cur = loadLocalConfig();
	if (cur) return cur;
	try {
		const raw = ls()?.getItem(LEGACY_LOCAL_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed?.iconGrid) return null;
		const migrated = normalizeConfig({ iconGrid: parsed.iconGrid });
		saveLocalConfig(migrated);
		try {
			ls()?.removeItem(LEGACY_LOCAL_KEY);
		} catch {}
		return migrated;
	} catch {
		return null;
	}
}
function loadPanelPos() {
	try {
		const raw = ls()?.getItem(PANEL_POS_KEY);
		if (!raw) return null;
		const p = JSON.parse(raw);
		return p && typeof p.x === "number" && typeof p.y === "number" ? p : null;
	} catch {
		return null;
	}
}
function savePanelPos(p) {
	try {
		ls()?.setItem(PANEL_POS_KEY, JSON.stringify(p));
	} catch {}
}
/** 写 DSH settings（无条件写，避免 revision 竞态导致回弹），返回 {ok, msg} */
async function writeConfigToDsh(settingsSvc, config) {
	try {
		const update = await settingsSvc.update(SETTINGS_NS, normalizeConfig(config), void 0);
		if (update?.ok) return {
			ok: true,
			msg: ""
		};
		return {
			ok: false,
			msg: typeof update?.error === "string" ? update.error : update?.error?.message ?? "unknown"
		};
	} catch (e) {
		return {
			ok: false,
			msg: e instanceof Error ? e.message : String(e)
		};
	}
}
function detectTheme() {
	try {
		if (typeof document === "undefined") return "light";
		const el = document.documentElement;
		const body = document.body;
		const dataTheme = el.getAttribute("data-theme") || body.getAttribute("data-theme");
		if (dataTheme === "dark" || dataTheme === "light") return dataTheme;
		if (el.classList.contains("dark") || body.classList.contains("dark")) return "dark";
		if (el.classList.contains("light") || body.classList.contains("light")) return "light";
		const labelColor = getComputedStyle(el).getPropertyValue("--dsw-alias-label-primary").trim();
		if (labelColor && labelColor.startsWith("#")) {
			const r = parseInt(labelColor.slice(1, 3), 16);
			const g = parseInt(labelColor.slice(3, 5), 16);
			const b = parseInt(labelColor.slice(5, 7), 16);
			if (!isNaN(r) && (r + g + b) / 3 < 128) return "dark";
		}
		if (labelColor && labelColor.startsWith("rgb")) {
			const m$1 = labelColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
			if (m$1 && (Number(m$1[1]) + Number(m$1[2]) + Number(m$1[3])) / 3 < 128) return "dark";
		}
		let bg = getComputedStyle(body).backgroundColor;
		if (!bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent") bg = getComputedStyle(el).backgroundColor;
		const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
		if (!m) return "light";
		return (Number(m[1]) + Number(m[2]) + Number(m[3])) / 3 < 128 ? "dark" : "light";
	} catch {
		return "light";
	}
}
const GAP_BETWEEN_CHAT_AND_GRID = 24;
/** 找聊天中心列内 maxWidth 居中的内容块，返回最大右边界 */
function measureContentRight(centerCol) {
	let right = 0;
	for (const el of centerCol.querySelectorAll("*")) {
		const s = getComputedStyle(el);
		const mw = parseFloat(s.maxWidth);
		if (!isFinite(mw) || mw < 400 || mw > 1400) continue;
		const r = el.getBoundingClientRect();
		if (r.width < 400) continue;
		if (r.right > right) right = r.right;
	}
	return right;
}
/** 计算输入框卡片上方需要保留的底部 margin */
function measureBottomMargin(userMargin, gridLeft, gridWidth) {
	try {
		const el = document.querySelector("[data-composer-card]");
		if (!el) return userMargin;
		const rect = el.getBoundingClientRect();
		if (rect.height < 10) return userMargin;
		if (gridLeft !== null && gridWidth > 0) {
			const gridRight = gridLeft + gridWidth;
			if (gridLeft >= rect.right || gridRight <= rect.left) return userMargin;
		}
		return Math.max(userMargin, Math.round(window.innerHeight - rect.top + 8));
	} catch {
		return userMargin;
	}
}
/** 根据可用空间计算实际行列数 */
function computeGridLayout(config) {
	if (typeof document === "undefined") return {
		left: null,
		bottomMargin: config.marginBottom,
		renderCols: config.cols,
		renderRows: config.rows
	};
	const cc = document.querySelector("[class*=\"BynINW_centerCol\"]");
	if (!cc) return {
		left: null,
		bottomMargin: config.marginBottom,
		renderCols: config.cols,
		renderRows: config.rows
	};
	const ccRect = cc.getBoundingClientRect();
	const contentRight = measureContentRight(cc);
	if (contentRight > 0) {
		const left = Math.round(contentRight + GAP_BETWEEN_CHAT_AND_GRID);
		const rightLimit = Math.round(ccRect.right - 8);
		const maxW = Math.max(0, rightLimit - left);
		const g$1 = config.gap;
		const estCols = Math.max(1, Math.floor((maxW - 16 + g$1) / (config.cell + g$1)));
		const estGridW = estCols * config.cell + Math.max(0, estCols - 1) * g$1 + 16;
		const bottomMargin = measureBottomMargin(config.marginBottom, left, estGridW);
		const availH$1 = Math.max(60, window.innerHeight - bottomMargin - 16 - 8);
		const maxRows$1 = Math.max(1, Math.floor((availH$1 + g$1) / (config.cell + g$1)));
		if (estCols >= 1 && maxW >= config.cell + 16) return {
			left,
			bottomMargin,
			renderCols: Math.max(1, Math.min(config.cols, estCols)),
			renderRows: Math.max(1, Math.min(config.rows, maxRows$1))
		};
	}
	const availW = Math.max(60, window.innerWidth - config.marginRight - 16 - 8);
	const g = config.gap;
	const maxCols2 = Math.max(1, Math.floor((availW + g) / (config.cell + g)));
	const availH = Math.max(60, window.innerHeight - config.marginBottom - 16 - 8);
	const maxRows = Math.max(1, Math.floor((availH + g) / (config.cell + g)));
	return {
		left: null,
		bottomMargin: config.marginBottom,
		renderCols: Math.max(1, Math.min(config.cols, maxCols2)),
		renderRows: Math.max(1, Math.min(config.rows, maxRows))
	};
}
/** 清掉旧版可能残留的聊天列样式覆盖（兼容 dsh-icon-grid / dsh-ui 时代的数据属性） */
function cleanupLegacyChatOverrides() {
	if (typeof document === "undefined") return;
	const el = document.querySelector("[class*=\"BynINW_centerCol\"]");
	if (!el) return;
	const sel = "[data-dsh-icon-grid-aligned],[data-dsh-ui-aligned]";
	for (const child of el.querySelectorAll(sel)) {
		child.style.marginLeft = "";
		child.style.marginRight = "";
		delete child.dataset.dshIconGridAligned;
		delete child.dataset.dshUiAligned;
	}
	el.style.paddingRight = "";
}

//#endregion
//#region src/panel/GridPanel.tsx
const HEX_RE$1 = /^#[0-9a-fA-F]{6}$/;
const GridPanel = ({ config, status, bottomOffset, onUpdateGrid, onClose, onSave, onReset }) => {
	const panelRef = (0, react.useRef)(null);
	const [pos, setPos] = (0, react.useState)(() => loadPanelPos());
	const [dragging, setDragging] = (0, react.useState)(false);
	const grid = config.iconGrid ?? {};
	const accentColor = HEX_RE$1.test(grid.gridAccent) ? grid.gridAccent : "#0969da";
	(0, react.useEffect)(() => {
		const panel = panelRef.current;
		if (!panel) return;
		const rect = panel.getBoundingClientRect();
		setPos((prev) => {
			if (!prev) return prev;
			const x = Math.max(0, Math.min(window.innerWidth - rect.width, prev.x));
			const y = Math.max(0, Math.min(window.innerHeight - rect.height, prev.y));
			if (x !== prev.x || y !== prev.y) {
				savePanelPos({
					x,
					y
				});
				return {
					x,
					y
				};
			}
			return prev;
		});
	}, []);
	const onHeaderPointerDown = (0, react.useCallback)((e) => {
		if (e.button !== 0) return;
		const panel = panelRef.current;
		if (!panel) return;
		const rect = panel.getBoundingClientRect();
		const offsetX = e.clientX - rect.left;
		const offsetY = e.clientY - rect.top;
		const w = rect.width, h = rect.height;
		setDragging(true);
		let latest = null;
		const onMove = (ev) => {
			latest = {
				x: Math.max(0, Math.min(window.innerWidth - w, ev.clientX - offsetX)),
				y: Math.max(0, Math.min(window.innerHeight - h, ev.clientY - offsetY))
			};
			setPos(latest);
		};
		const onUp = () => {
			setDragging(false);
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			if (latest) savePanelPos(latest);
		};
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp);
	}, []);
	const gridAccentValue = HEX_RE$1.test(grid.gridAccent) ? grid.gridAccent : "#c5a468";
	const handlePickAccent = (0, react.useCallback)((value) => {
		onUpdateGrid({ gridAccent: value });
	}, [onUpdateGrid]);
	const handleClearAccent = (0, react.useCallback)(() => {
		onUpdateGrid({ gridAccent: "" });
	}, [onUpdateGrid]);
	const row = {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
		padding: "6px 0"
	};
	const labelStyle = {
		fontSize: 12,
		color: "#c8c8d0",
		minWidth: 82
	};
	const slider = {
		flex: 1,
		accentColor,
		height: 4,
		cursor: "pointer",
		minWidth: 60
	};
	const btn = {
		padding: "6px 14px",
		fontSize: 12,
		borderRadius: 6,
		border: "1px solid rgba(255,255,255,0.15)",
		background: "rgba(255,255,255,0.06)",
		color: "#e8e8f0",
		cursor: "pointer"
	};
	let statusBg = "rgba(255,255,255,0.06)", statusColor = "#c8c8d0", statusText = "未保存";
	if (status.kind === "saving") {
		statusBg = "rgba(255,200,0,0.12)";
		statusColor = "#ffc800";
		statusText = "保存中…";
	} else if (status.kind === "saved") {
		statusBg = "rgba(80,200,80,0.12)";
		statusColor = "#4ec94e";
		statusText = `✓ 已保存 ${status.at} ${status.source === "local" ? "（已写入本机）" : "（已写入 DSH）"}`;
	} else if (status.kind === "error") {
		statusBg = "rgba(255,80,80,0.12)";
		statusColor = "#ff6b6b";
		statusText = `✗ 保存失败：${status.msg}`;
	}
	const posStyle = pos ? {
		left: pos.x,
		top: pos.y
	} : {
		right: grid.marginRight,
		bottom: bottomOffset + 40
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		ref: panelRef,
		style: {
			position: "fixed",
			...posStyle,
			zIndex: 999998,
			width: 340,
			padding: "12px 14px 14px",
			borderRadius: 12,
			background: "rgba(28,28,36,0.96)",
			border: `1px solid ${accentColor}44`,
			boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
			color: "#e8e8f0",
			fontFamily: "system-ui, -apple-system, sans-serif",
			pointerEvents: "auto",
			backdropFilter: "blur(12px)",
			WebkitBackdropFilter: "blur(12px)"
		},
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				onPointerDown: onHeaderPointerDown,
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 6,
					paddingBottom: 8,
					borderBottom: "1px solid rgba(255,255,255,0.08)",
					cursor: dragging ? "grabbing" : "grab",
					userSelect: "none",
					touchAction: "none"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						fontSize: 13,
						fontWeight: 600
					},
					children: "▦ 图标网格设置"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					onPointerDown: (e) => e.stopPropagation(),
					onClick: onClose,
					style: {
						background: "none",
						border: "none",
						color: "#c8c8d0",
						fontSize: 16,
						cursor: "pointer",
						padding: "0 4px",
						lineHeight: 1
					},
					children: "✕"
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					marginBottom: 8,
					padding: "6px 10px",
					borderRadius: 6,
					background: statusBg,
					color: statusColor,
					fontSize: 11,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					minHeight: 20
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: statusText }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					onClick: onSave,
					style: {
						background: "rgba(255,255,255,0.08)",
						border: "none",
						color: "#e8e8f0",
						fontSize: 11,
						padding: "2px 8px",
						borderRadius: 4,
						cursor: "pointer"
					},
					children: "立即保存"
				})]
			}),
			[
				[
					"列数",
					"cols",
					3,
					16,
					1,
					0
				],
				[
					"行数",
					"rows",
					2,
					24,
					1,
					0
				],
				[
					"格子大小",
					"cell",
					28,
					80,
					1,
					0
				],
				[
					"格间距",
					"gap",
					0,
					20,
					1,
					0
				],
				[
					"图标底色",
					"iconAlpha",
					0,
					.4,
					.01,
					2
				],
				[
					"右边距",
					"marginRight",
					0,
					120,
					2,
					0
				],
				[
					"下边距",
					"marginBottom",
					0,
					120,
					2,
					0
				]
			].map(([label, key, min, max, s, prec]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: row,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: labelStyle,
						children: label
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "range",
						min,
						max,
						step: s,
						value: grid[key],
						onChange: (e) => onUpdateGrid({ [key]: Number(e.target.value) }),
						style: slider
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NumberField, {
						value: grid[key],
						min,
						max,
						step: s,
						precision: Number(prec),
						onChange: (v) => onUpdateGrid({ [key]: v })
					})
				]
			}, key)),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					marginTop: 6,
					padding: "8px 10px",
					borderRadius: 8,
					background: "rgba(255,255,255,0.04)",
					border: "1px solid rgba(255,255,255,0.08)"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 8
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							fontSize: 12,
							color: "#c8c8d0"
						},
						children: "图标主色"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 6
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "color",
							value: gridAccentValue,
							onChange: (e) => handlePickAccent(e.target.value),
							title: "选择主色后，图标底色用它着色；留空则跟随明暗半透明",
							style: {
								width: 28,
								height: 24,
								padding: 0,
								border: "1px solid rgba(255,255,255,0.18)",
								borderRadius: 4,
								background: "transparent",
								cursor: "pointer"
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: handleClearAccent,
							disabled: !grid.gridAccent,
							style: {
								...btn,
								padding: "3px 8px",
								fontSize: 11,
								opacity: grid.gridAccent ? 1 : .4,
								cursor: grid.gridAccent ? "pointer" : "not-allowed"
							},
							children: "清除"
						})]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 11,
						color: "#9a9aa8",
						marginTop: 6
					},
					children: grid.gridAccent ? `主色 ${grid.gridAccent}` : "不设主色时图标底色跟随明暗半透明"
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: row,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: labelStyle,
					children: "网格线"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
					style: {
						display: "flex",
						alignItems: "center",
						flex: 1,
						gap: 8,
						cursor: "pointer"
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: !!grid.showGridLines,
						onChange: (e) => onUpdateGrid({ showGridLines: e.target.checked }),
						style: {
							accentColor,
							cursor: "pointer"
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							fontSize: 12,
							color: "#c8c8d0"
						},
						children: "显示"
					})]
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: row,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: labelStyle,
						children: "网格线深浅"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: .5,
						step: .01,
						value: grid.gridLineAlpha,
						onChange: (e) => onUpdateGrid({ gridLineAlpha: Number(e.target.value) }),
						style: slider
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NumberField, {
						value: grid.gridLineAlpha,
						min: 0,
						max: .5,
						step: .01,
						precision: 2,
						onChange: (v) => onUpdateGrid({ gridLineAlpha: v })
					})
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					gap: 8,
					marginTop: 12,
					paddingTop: 10,
					borderTop: "1px solid rgba(255,255,255,0.08)"
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					style: btn,
					onClick: onReset,
					children: "重置默认"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					style: {
						...btn,
						background: accentColor,
						borderColor: accentColor
					},
					onClick: onClose,
					children: "完成"
				})]
			})
		]
	});
};

//#endregion
//#region src/lib/icons.mjs
/**

* 图标网格数据层（纯数据 + 纯函数，无 DSH 运行时依赖，可独立单测）。

*

* 网格本身不持有插件图标：外部插件把自己的图标推进 `window.__dshIconRegistry`，

* 这里只负责"注册表 → 槽位"的纯计算，以及与主题共享的 CSS 变量解析。

*/
/** 槽位里的空位标记 */
const EMPTY_SLOT = "";
/** 设置入口的固定 id（网格内始终存在的齿轮图标） */
const SETTINGS_ENTRY_ID = "__dsh-icon-grid-settings__";
/** 内建条目：由本插件自己注册进网格，不需要外部插件提供 */
const BUILTIN_ENTRIES = [{
	id: SETTINGS_ENTRY_ID,
	icon: "⚙️",
	label: "图标网格设置",
	builtin: true
}];
/**

* 读取全局注册表（外部插件推入的图标）。

* 无 window 时返回空数组，保证模块可在 Node 下单测。

*

* 过滤非法条目，避免外部插件传错类型把 Grid 渲染崩掉：

*   - id 必须是非空字符串

*   - icon 必须是 string 或 number（不允许 React 元素/对象）

*   - onClick / onUnload 若存在，必须是函数

*

* @returns {any[]}

*/
function readRegistry(win = typeof window === "undefined" ? void 0 : window) {
	const reg = win?.__dshIconRegistry;
	if (!Array.isArray(reg)) return [];
	return reg.filter((e) => e && typeof e === "object" && typeof e.id === "string" && e.id && (typeof e.icon === "string" || typeof e.icon === "number") && (e.onClick === void 0 || typeof e.onClick === "function") && (e.onUnload === void 0 || typeof e.onUnload === "function"));
}
/**

* 内建条目 + 外部注册条目。

* 内建始终在前（顺序稳定）；外部按 `weight` 降序排列（大在前），

* 相同 weight 保持注册顺序。返回新数组，不修改原始注册表。

*

* @param {any} [win]

*/
function allEntries(win) {
	const external = readRegistry(win).slice();
	external.sort((a, b) => {
		const wa = Number.isFinite(a?.weight) ? a.weight : 0;
		const wb = Number.isFinite(b?.weight) ? b.weight : 0;
		return wb - wa;
	});
	return [...BUILTIN_ENTRIES, ...external];
}
/**

* 把持久化的 order 数组摊平成定长槽位数组。

* 长度不足补 null，超长截断；空白串视为空槽。

* @param {string[]} order

* @param {number} count

* @returns {(string | null)[]}

*/
function slotsFromOrder(order, count) {
	const arr = Array(count).fill(null);
	const src = Array.isArray(order) ? order : [];
	for (let i = 0; i < count && i < src.length; i++) {
		const v = src[i];
		arr[i] = typeof v === "string" && v.trim() ? v : null;
	}
	return arr;
}
/** 槽位数组 → 持久化 order 数组 */
function orderFromSlots(slots) {
	return slots.map((s) => s ?? EMPTY_SLOT);
}
/**

* 槽位重算：清掉已消失的 id，把新出现的 id 填进空槽。

* 纯函数，返回新数组；无变化时返回原引用（便于 React 跳过渲染）。

* @param {(string | null)[]} slots

* @param {any[]} entries

* @returns {(string | null)[]}

*/
function reconcileSlots(slots, entries) {
	const ids = new Set(entries.map((e) => e.id));
	const next = [...slots];
	let changed = false;
	for (let i = 0; i < next.length; i++) if (next[i] && !ids.has(next[i])) {
		next[i] = null;
		changed = true;
	}
	for (const entry of entries) if (!next.includes(entry.id)) {
		const empty = next.indexOf(null);
		if (empty >= 0) {
			next[empty] = entry.id;
			changed = true;
		}
	}
	return changed ? next : slots;
}
/**

* 交换两个槽位（拖拽排序的最小单元）。越界/相同索引返回原引用。

* @param {(string | null)[]} slots

* @param {number} a

* @param {number} b

*/
function swapSlots(slots, a, b) {
	if (a === b || a < 0 || b < 0 || a >= slots.length || b >= slots.length) return slots;
	const next = [...slots];
	[next[a], next[b]] = [next[b], next[a]];
	return next;
}
/**

* 溢出计算：可见槽位不足时，最后一个可见格子换成 "+N"。

* hiddenCount 统计从 `visibleSlots - 1`（+N 格所在位置）起的所有非空槽。

* @param {(string | null)[]} slots 全量槽位

* @param {number} visibleSlots 实际可渲染格子数（renderCols * renderRows）

*/
function computeOverflow(slots, visibleSlots) {
	if (visibleSlots >= slots.length) return {
		hiddenCount: 0,
		showPlusCell: false,
		displaySlots: slots
	};
	const rest = slots.slice(visibleSlots - 1);
	const hiddenCount = rest.filter((s) => s !== null).length;
	if (hiddenCount > 0) return {
		hiddenCount,
		showPlusCell: true,
		displaySlots: slots.slice(0, visibleSlots - 1)
	};
	return {
		hiddenCount: 0,
		showPlusCell: false,
		displaySlots: slots.slice(0, visibleSlots)
	};
}
/**

* 拖拽落点 → 目标索引（纯数学映射；可见区溢出的 "+N" 格保护由调用方

* Grid.onPointerUp 在调用本函数之后手工处理）。

* @returns {number}

*/
function dropIndex(relX, relY, renderCols, renderRows, cell, gap) {
	const col = Math.max(0, Math.min(renderCols - 1, Math.floor(relX / (cell + gap))));
	const row = Math.max(0, Math.min(renderRows - 1, Math.floor(relY / (cell + gap))));
	return Math.max(0, row * renderCols + col);
}
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
/**

* 网格配色：图标底色 / 网格线 / 图标颜色。

*

* 不查询皮肤 token 表，全部交给浏览器解析 CSS 变量（跟随 DSH 当前主题）。

* 唯一的自定义输入是 `gridAccent`：

*   - ''        → 用 rgba(ink, iconAlpha) 的半透明黑/白

*   - '#rrggbb' → 用 color-mix(in srgb, accent N%, transparent)

*

* @param {{ gridAccent?: string, iconAlpha: number, gridLineAlpha: number, showGridLines: boolean }} config

* @param {'light'|'dark'} resolvedTheme

*/
function gridPalette(config, resolvedTheme) {
	const ink = resolvedTheme === "dark" ? "255,255,255" : "0,0,0";
	const raw = typeof config.gridAccent === "string" ? config.gridAccent.trim() : "";
	const accent = HEX_RE.test(raw) ? raw : null;
	const pct = Math.round(config.iconAlpha * 100);
	return {
		inkRgb: ink,
		iconBg: accent ? `color-mix(in srgb, ${accent} ${pct}%, transparent)` : `rgba(${ink},${config.iconAlpha})`,
		iconBgDragging: accent ? `color-mix(in srgb, ${accent} ${Math.min(pct + 12, 35)}%, transparent)` : `rgba(${ink},${Math.min(config.iconAlpha + .12, .35)})`,
		gridLine: config.showGridLines ? `1px solid var(--dsw-alias-border-l1, rgba(${ink},${config.gridLineAlpha}))` : "1px solid transparent",
		iconColor: `var(--dsw-alias-label-primary, ${resolvedTheme === "dark" ? "#e8e8f0" : "#222"})`,
		accent
	};
}
/**

* 插件的 cordis / DSH 名称。

* 优先取 `plugin` 字段（约定），否则回退 `id`。

* @param {any} entry

*/
function pluginNameOf(entry) {
	if (entry && typeof entry.plugin === "string") {
		const p = entry.plugin.trim();
		if (p) return p;
	}
	return entry?.id;
}
/**

* 从 `window.__dshIconRegistry` 移除指定 id 的条目。

* 返回是否移除成功（注册表不存在 / 未找到都返回 false）。

* @param {string} id

* @param {any} [win]

*/
function removeFromRegistry(id, win = typeof window === "undefined" ? void 0 : window) {
	const reg = win?.__dshIconRegistry;
	if (!Array.isArray(reg)) return false;
	const idx = reg.findIndex((e) => e?.id === id);
	if (idx < 0) return false;
	reg.splice(idx, 1);
	return true;
}
/**

* 统一卸载一个注册条目。按以下顺序尝试：

*   1. `window.__dshIconUnload(entry, name)`（集成层 / host 注入）

*   2. `entry.onUnload()`（插件自带清理，向后兼容）

* 都没有时返回 `{ ok: false, via: 'none' }`。不会抛异常。

*

* @param {any} entry

* @param {any} [win]

* @returns {Promise<{ ok: boolean, via: 'host' | 'onUnload' | 'none', msg: string }>}

*/
async function unloadEntry(entry, win = typeof window === "undefined" ? void 0 : window) {
	const name = pluginNameOf(entry);
	const hook = win?.__dshIconUnload;
	if (typeof hook === "function") try {
		const r = await hook(entry, name);
		if (r && r.ok === true) return {
			ok: true,
			via: "host",
			msg: r.msg ?? ""
		};
		if (r && typeof r.msg === "string") return {
			ok: false,
			via: "host",
			msg: r.msg
		};
	} catch {}
	if (entry && typeof entry.onUnload === "function") try {
		await entry.onUnload();
		return {
			ok: true,
			via: "onUnload",
			msg: ""
		};
	} catch (e) {
		const msg = e && typeof e.message === "string" ? e.message : String(e);
		return {
			ok: false,
			via: "onUnload",
			msg
		};
	}
	return {
		ok: false,
		via: "none",
		msg: "no unload hook"
	};
}

//#endregion
//#region src/panel/Grid.tsx
const Grid = ({ ctx, uiState, settingsSvc: settingsProp }) => {
	const settingsSvc = settingsProp ?? ctx.remote.settings;
	const [entries, setEntries] = (0, react.useState)(() => allEntries());
	const [config, setConfig] = (0, react.useState)(() => uiState?.get?.() ?? DEFAULT_CONFIG);
	const [slots, setSlots] = (0, react.useState)([]);
	const [loaded, setLoaded] = (0, react.useState)(false);
	const [drag, setDrag] = (0, react.useState)(null);
	const [renderCols, setRenderCols] = (0, react.useState)(DEFAULT_CONFIG.iconGrid.cols);
	const [renderRows, setRenderRows] = (0, react.useState)(DEFAULT_CONFIG.iconGrid.rows);
	const [gridLeft, setGridLeft] = (0, react.useState)(null);
	const [bottomMargin, setBottomMargin] = (0, react.useState)(DEFAULT_CONFIG.iconGrid.marginBottom);
	const [menu, setMenu] = (0, react.useState)(null);
	const [panelOpen, setPanelOpen] = (0, react.useState)(false);
	const [detectedTheme, setDetectedTheme] = (0, react.useState)(() => detectTheme());
	const [status, setStatus] = (0, react.useState)({ kind: "idle" });
	const gridRef = (0, react.useRef)(null);
	const slotsRef = (0, react.useRef)(slots);
	slotsRef.current = slots;
	const configRef = (0, react.useRef)(config);
	configRef.current = config;
	const renderColsRef = (0, react.useRef)(renderCols);
	renderColsRef.current = renderCols;
	const renderRowsRef = (0, react.useRef)(renderRows);
	renderRowsRef.current = renderRows;
	const saveTimer = (0, react.useRef)(null);
	const settingsSvcRef = (0, react.useRef)(settingsSvc);
	settingsSvcRef.current = settingsSvc;
	const uiStateRef = (0, react.useRef)(uiState);
	uiStateRef.current = uiState;
	const grid = config.iconGrid ?? DEFAULT_CONFIG.iconGrid;
	const cell = grid.cell, gap = grid.gap;
	const fullSlots = grid.cols * grid.rows;
	const gridCols = grid.cols;
	const gridRows = grid.rows;
	const gridCell = grid.cell;
	const gridGap = grid.gap;
	const gridMarginRight = grid.marginRight;
	const gridMarginBottom = grid.marginBottom;
	(0, react.useEffect)(() => {
		cleanupLegacyChatOverrides();
	}, []);
	(0, react.useEffect)(() => {
		const update = () => setDetectedTheme(detectTheme());
		update();
		const observer = new MutationObserver(update);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: [
				"class",
				"style",
				"data-theme"
			]
		});
		observer.observe(document.body, {
			attributes: true,
			attributeFilter: [
				"class",
				"style",
				"data-theme"
			]
		});
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		media.addEventListener?.("change", update);
		const t = setInterval(update, 1500);
		return () => {
			observer.disconnect();
			media.removeEventListener?.("change", update);
			clearInterval(t);
		};
	}, []);
	const resolvedTheme = detectedTheme;
	(0, react.useEffect)(() => {
		const onTheme = () => setDetectedTheme(detectTheme());
		ctx.on?.("theme/change", onTheme);
		return () => ctx.off?.("theme/change", onTheme);
	}, [ctx]);
	(0, react.useEffect)(() => {
		if (!uiState?.subscribe) return;
		const off = uiState.subscribe((cfg) => {
			if (!cfg?.iconGrid) return;
			const next = normalizeConfig(cfg);
			configRef.current = next;
			setConfig(next);
			const target = next.iconGrid.cols * next.iconGrid.rows;
			setSlots((prev) => prev.length === target ? prev : slotsFromOrder(next.iconGrid.order, target));
		});
		return () => {
			try {
				off?.();
			} catch {}
		};
	}, [uiState]);
	(0, react.useEffect)(() => {
		let raf = 0;
		const recompute = () => {
			const layout = computeGridLayout({
				cols: gridCols,
				rows: gridRows,
				cell: gridCell,
				gap: gridGap,
				marginRight: gridMarginRight,
				marginBottom: gridMarginBottom
			});
			setGridLeft(layout.left);
			setBottomMargin(layout.bottomMargin);
			setRenderCols(layout.renderCols);
			setRenderRows(layout.renderRows);
		};
		const schedule = () => {
			if (raf) cancelAnimationFrame(raf);
			raf = requestAnimationFrame(recompute);
		};
		schedule();
		const t1 = setTimeout(recompute, 200);
		const t2 = setTimeout(recompute, 800);
		const t3 = setTimeout(recompute, 2e3);
		window.addEventListener("resize", schedule);
		let ro = null;
		try {
			ro = new ResizeObserver(schedule);
			const card = document.querySelector("[data-composer-card]");
			if (card) ro.observe(card);
			const cc = document.querySelector("[class*=\"BynINW_centerCol\"]");
			if (cc) ro.observe(cc);
		} catch {}
		const attach = setInterval(() => {
			try {
				if (!ro) return;
				const card = document.querySelector("[data-composer-card]");
				if (card) ro.observe(card);
				const cc2 = document.querySelector("[class*=\"BynINW_centerCol\"]");
				if (cc2) ro.observe(cc2);
			} catch {}
		}, 1e3);
		return () => {
			if (raf) cancelAnimationFrame(raf);
			clearTimeout(t1);
			clearTimeout(t2);
			clearTimeout(t3);
			clearInterval(attach);
			window.removeEventListener("resize", schedule);
			ro?.disconnect();
		};
	}, [
		gridCols,
		gridRows,
		gridCell,
		gridGap,
		gridMarginRight,
		gridMarginBottom
	]);
	(0, react.useEffect)(() => {
		const tick = () => {
			const reg = allEntries();
			setEntries((prev) => {
				if (prev.length === reg.length && prev.every((e, i) => e.id === reg[i]?.id)) return prev;
				return [...reg];
			});
		};
		tick();
		const t = setInterval(tick, 300);
		return () => clearInterval(t);
	}, []);
	(0, react.useEffect)(() => {
		const saved = uiStateRef.current?.get?.() ?? DEFAULT_CONFIG;
		const merged = normalizeConfig(saved);
		configRef.current = merged;
		setConfig(merged);
		setSlots(slotsFromOrder(merged.iconGrid.order, merged.iconGrid.cols * merged.iconGrid.rows));
		setLoaded(true);
	}, []);
	(0, react.useEffect)(() => {
		if (!loaded) return;
		setSlots((prev) => {
			if (prev.length === fullSlots) return prev;
			if (prev.length > fullSlots) return prev.slice(0, fullSlots);
			return [...prev, ...Array(fullSlots - prev.length).fill(null)];
		});
	}, [fullSlots, loaded]);
	(0, react.useEffect)(() => {
		if (!loaded) return;
		setSlots((prev) => reconcileSlots(prev, entries));
	}, [entries, loaded]);
	const performSave = (0, react.useCallback)(async (overrides) => {
		const toSave = normalizeConfig({ iconGrid: {
			...configRef.current.iconGrid,
			...overrides?.iconGrid ?? {},
			order: orderFromSlots(slotsRef.current)
		} });
		configRef.current = toSave;
		uiState?.update?.(toSave);
		const localOk = saveLocalConfig(toSave);
		setStatus({ kind: "saving" });
		const dshResult = await writeConfigToDsh(settingsSvc, toSave);
		const now = new Date().toLocaleTimeString();
		if (dshResult.ok) setStatus({
			kind: "saved",
			at: now,
			source: "dsh"
		});
		else if (localOk) setStatus({
			kind: "saved",
			at: now,
			source: "local"
		});
		else setStatus({
			kind: "error",
			msg: dshResult.msg || "写入失败"
		});
	}, [settingsSvc, uiState]);
	const flushSave = (0, react.useCallback)(() => {
		if (saveTimer.current) {
			clearTimeout(saveTimer.current);
			saveTimer.current = null;
		}
		performSave();
	}, [performSave]);
	const updateGrid = (0, react.useCallback)((patch) => {
		const next = normalizeConfig({
			...configRef.current,
			iconGrid: {
				...configRef.current.iconGrid,
				...patch
			}
		});
		configRef.current = next;
		setConfig(next);
		if (saveTimer.current) clearTimeout(saveTimer.current);
		saveTimer.current = setTimeout(() => {
			saveTimer.current = null;
			performSave();
		}, 400);
	}, [performSave]);
	const PADDING = 8;
	const onPointerDown = (0, react.useCallback)((e, idx) => {
		if (e.button !== 0) return;
		const iconId = slotsRef.current[idx];
		if (!iconId) return;
		if (!gridRef.current) return;
		const c = configRef.current.iconGrid;
		const rcols = renderColsRef.current;
		const rect = gridRef.current.getBoundingClientRect();
		const col = idx % rcols;
		const row = Math.floor(idx / rcols);
		const cellLeft = rect.left + PADDING + col * (c.cell + c.gap);
		const cellTop = rect.top + PADDING + row * (c.cell + c.gap);
		const offsetX = e.clientX - cellLeft;
		const offsetY = e.clientY - cellTop;
		const startX = e.clientX, startY = e.clientY;
		let moved = false;
		const onMove = (ev) => {
			if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 4) moved = true;
			if (!moved) return;
			setDrag({
				id: iconId,
				fromIdx: idx,
				x: ev.clientX - offsetX,
				y: ev.clientY - offsetY
			});
		};
		const onUp = (ev) => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			if (moved && gridRef.current) {
				const rect2 = gridRef.current.getBoundingClientRect();
				const cc = configRef.current.iconGrid;
				const rcols2 = renderColsRef.current;
				const rrows2 = renderRowsRef.current;
				const relX = ev.clientX - rect2.left - PADDING;
				const relY = ev.clientY - rect2.top - PADDING;
				let toIdx = dropIndex(relX, relY, rcols2, rrows2, cc.cell, cc.gap);
				const lastIdx = rcols2 * rrows2 - 1;
				const visibleSlots$1 = rcols2 * rrows2;
				if (visibleSlots$1 < cc.cols * cc.rows && slotsRef.current.slice(visibleSlots$1 - 1).some((s) => s !== null) && toIdx >= lastIdx) toIdx = lastIdx - 1;
				if (toIdx !== idx) {
					const next = swapSlots(slotsRef.current, idx, toIdx);
					slotsRef.current = next;
					setSlots(next);
					performSave({ iconGrid: { order: orderFromSlots(next) } });
				}
			}
			setDrag(null);
		};
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp);
	}, [performSave]);
	(0, react.useEffect)(() => {
		if (!menu) return;
		const close = () => setMenu(null);
		window.addEventListener("click", close);
		window.addEventListener("contextmenu", close);
		return () => {
			window.removeEventListener("click", close);
			window.removeEventListener("contextmenu", close);
		};
	}, [menu]);
	const resetConfig = () => {
		const currentIds = slotsRef.current.filter(Boolean);
		const newCount = DEFAULT_CONFIG.iconGrid.cols * DEFAULT_CONFIG.iconGrid.rows;
		const newSlots = Array(newCount).fill(null);
		for (let i = 0; i < currentIds.length && i < newCount; i++) newSlots[i] = currentIds[i];
		const next = normalizeConfig({ iconGrid: {
			...DEFAULT_CONFIG.iconGrid,
			order: orderFromSlots(newSlots)
		} });
		configRef.current = next;
		setConfig(next);
		slotsRef.current = newSlots;
		setSlots(newSlots);
		performSave();
	};
	/**
	
	* 统一卸载：宿主 runtime 优先 → __dshIconUnload → entry.onUnload。
	
	* 无论卸载是否成功，都从注册表 + 槽位移除，避免 reconcile 把图标填回来。
	
	*/
	const handleUnload = (0, react.useCallback)(async (entry) => {
		const name = pluginNameOf(entry);
		let result = {
			ok: false,
			via: "none",
			msg: ""
		};
		try {
			const runtime = ctx.remote?.dshIconGridRuntime;
			if (runtime?.unload) {
				const r = await runtime.unload(name);
				if (r?.ok) result = {
					ok: true,
					via: "host",
					msg: r.msg ?? ""
				};
				else if (typeof r?.msg === "string") result = {
					ok: false,
					via: "host",
					msg: r.msg
				};
			}
		} catch (e) {
			result = {
				ok: false,
				via: "host",
				msg: String(e?.message ?? e)
			};
		}
		if (!result.ok) try {
			const r = await unloadEntry(entry);
			if (r.ok) result = r;
			else if (!result.msg) result = r;
		} catch {}
		removeFromRegistry(entry.id);
		const next = slotsRef.current.map((s) => s === entry.id ? null : s);
		slotsRef.current = next;
		setSlots(next);
		performSave({ iconGrid: { order: orderFromSlots(next) } });
		setMenu(null);
		if (!result.ok && result.msg) console.warn(`[dsh-icon-grid] 卸载 ${entry.id} 失败: ${result.msg}`);
	}, [ctx, performSave]);
	const visibleSlots = renderCols * renderRows;
	const { hiddenCount, showPlusCell, displaySlots } = computeOverflow(slots, visibleSlots);
	const entries2 = entries;
	const gridWidth = renderCols * cell + (renderCols - 1) * gap + 16;
	const gridHeight = renderRows * cell + (renderRows - 1) * gap + 16;
	const { iconBg, iconBgDragging, gridLine: gridLineBorder, iconColor } = gridPalette(grid, resolvedTheme);
	const noExternalIcons = entries2.every((e) => e.builtin);
	const emptyHintIdx = noExternalIcons ? displaySlots.findIndex((s) => s === null) : -1;
	const draggingIcon = drag ? entries2.find((e) => e.id === drag.id)?.icon : null;
	const menuEntry = menu ? entries2.find((e) => e.id === menu.id) : null;
	const renderCount = showPlusCell ? visibleSlots : Math.min(displaySlots.length, visibleSlots);
	const positionStyle = gridLeft !== null ? { left: gridLeft } : { right: grid.marginRight };
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			ref: gridRef,
			style: {
				position: "fixed",
				...positionStyle,
				bottom: bottomMargin,
				zIndex: 999990,
				width: gridWidth,
				height: gridHeight,
				display: "grid",
				gridTemplateColumns: `repeat(${renderCols}, ${cell}px)`,
				gridTemplateRows: `repeat(${renderRows}, ${cell}px)`,
				gap,
				padding: PADDING,
				background: "transparent",
				userSelect: "none",
				boxSizing: "border-box",
				pointerEvents: "none"
			},
			children: Array.from({ length: renderCount }).map((_, idx) => {
				if (showPlusCell && idx === visibleSlots - 1) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					title: `还有 ${hiddenCount} 个图标未显示，点击打开设置`,
					onClick: (e) => {
						e.stopPropagation();
						setPanelOpen(true);
					},
					style: {
						width: cell,
						height: cell,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						borderRadius: 10,
						cursor: "pointer",
						background: iconBg,
						border: gridLineBorder,
						boxSizing: "border-box",
						fontSize: Math.round(cell * .42),
						lineHeight: 1,
						color: iconColor,
						fontWeight: 600,
						pointerEvents: "auto"
					},
					children: ["+", hiddenCount]
				}, "__plus__");
				const id = displaySlots[idx];
				const entry = id ? entries2.find((e) => e.id === id) : null;
				const isHidden = drag !== null && drag.fromIdx === idx;
				if (!entry) {
					if (idx === emptyHintIdx) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						title: "外部插件通过 window.__dshIconRegistry 注册图标；点 ⚙️ 打开设置",
						style: {
							width: cell,
							height: cell,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							borderRadius: 10,
							background: iconBg,
							border: gridLineBorder,
							boxSizing: "border-box",
							fontSize: Math.round(cell * .4),
							lineHeight: 1,
							color: iconColor,
							opacity: .35,
							pointerEvents: "none",
							userSelect: "none"
						},
						children: "＋"
					}, "empty-hint");
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { style: {
						width: cell,
						height: cell,
						borderRadius: 10,
						background: "transparent",
						border: gridLineBorder,
						boxSizing: "border-box"
					} }, `empty-${idx}`);
				}
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					title: entry.label,
					onPointerDown: (e) => onPointerDown(e, idx),
					onContextMenu: (e) => {
						e.preventDefault();
						e.stopPropagation();
						if (entry.builtin) {
							setPanelOpen(true);
							return;
						}
						setMenu({
							x: e.clientX,
							y: e.clientY,
							id: entry.id
						});
					},
					onClick: (e) => {
						if (drag) return;
						e.stopPropagation();
						if (entry.builtin) setPanelOpen((v) => !v);
						else entry.onClick?.();
					},
					style: {
						width: cell,
						height: cell,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						borderRadius: 10,
						cursor: "grab",
						background: iconBg,
						border: gridLineBorder,
						boxSizing: "border-box",
						transition: "background 120ms",
						fontSize: Math.round(cell * .48),
						lineHeight: 1,
						color: iconColor,
						touchAction: "none",
						pointerEvents: "auto",
						visibility: isHidden ? "hidden" : "visible"
					},
					children: entry.icon
				}, entry.id);
			})
		}),
		drag && draggingIcon && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			style: {
				position: "fixed",
				left: drag.x,
				top: drag.y,
				width: cell,
				height: cell,
				zIndex: 999997,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: 10,
				background: iconBgDragging,
				boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
				transform: "scale(1.1)",
				fontSize: Math.round(cell * .48),
				lineHeight: 1,
				color: iconColor,
				pointerEvents: "none",
				boxSizing: "border-box",
				border: gridLineBorder
			},
			children: draggingIcon
		}),
		panelOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GridPanel, {
			config,
			status,
			bottomOffset: bottomMargin,
			onUpdateGrid: updateGrid,
			onClose: () => {
				flushSave();
				setPanelOpen(false);
			},
			onSave: flushSave,
			onReset: resetConfig
		}),
		menu && menuEntry && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			style: {
				position: "fixed",
				left: menu.x,
				top: menu.y,
				zIndex: 999999,
				background: "#1e1e28",
				border: "1px solid rgba(255,255,255,0.12)",
				borderRadius: 8,
				padding: "4px 0",
				minWidth: 160,
				boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
				fontSize: 13,
				color: "#e8e8f0",
				pointerEvents: "auto"
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: {
					padding: "8px 14px",
					cursor: "pointer"
				},
				onClick: () => {
					if (menuEntry.builtin) setPanelOpen(true);
					else menuEntry.onClick?.();
					setMenu(null);
				},
				children: "打开"
			}), !menuEntry.builtin && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: {
					padding: "8px 14px",
					cursor: "pointer",
					color: "#ff6b6b"
				},
				onClick: () => {
					handleUnload(menuEntry);
				},
				children: "卸载插件"
			})]
		})
	] });
};

//#endregion
//#region src/lib/ui-state.mjs
/**

* @param {any} rawConfig

*/
function createUiState(rawConfig) {
	let state = normalizeConfig(rawConfig);
	/** @type {Set<(s: any) => void>} */
	const listeners = new Set();
	const snapshot$1 = () => JSON.parse(JSON.stringify(state));
	const emit = () => {
		const s = snapshot$1();
		for (const fn of listeners) try {
			fn(s);
		} catch {}
	};
	return {
		get: () => snapshot$1(),
		subscribe(fn) {
			listeners.add(fn);
			return () => listeners.delete(fn);
		},
		update(patch) {
			const next = normalizeConfig({ iconGrid: {
				...state.iconGrid,
				...patch?.iconGrid ?? {}
			} });
			const changed = JSON.stringify(next) !== JSON.stringify(state);
			state = next;
			if (changed) emit();
			return snapshot$1();
		},
		describeGrid() {
			const g = state.iconGrid;
			return [
				`▦ 网格: ${g.cols}×${g.rows} · 格子 ${g.cell}px · 间距 ${g.gap}px`,
				`网格线: ${g.showGridLines ? "开" : "关"} · 深浅 ${g.gridLineAlpha}`,
				`图标底色: ${g.iconAlpha}${g.gridAccent ? ` · 主色 ${g.gridAccent}` : ""}`,
				`边距: 右 ${g.marginRight} / 下 ${g.marginBottom}`
			].join("\n");
		}
	};
}

//#endregion
//#region src/client.tsx
const inject = [
	"remote",
	"remote.settings",
	"theme"
];
let root = null;
let host = null;
function teardown() {
	if (root) {
		try {
			root.unmount();
		} catch {}
		root = null;
	}
	if (host) {
		try {
			host.remove();
		} catch {}
		host = null;
	}
	if (typeof document !== "undefined") document.querySelectorAll("#dsh-icon-grid-root").forEach((el) => {
		try {
			el.remove();
		} catch {}
	});
}
const LEGACY_SETTINGS_NS = "dsh-ui";
async function readState(settingsSvc, uiState) {
	const local = loadLocalConfigWithMigration();
	if (local) return local;
	try {
		const entry = pickNamespace(await settingsSvc?.describe(), SETTINGS_NS);
		if (entry?.value?.iconGrid) return normalizeConfig(entry.value);
	} catch {}
	try {
		const legacy = pickNamespace(await settingsSvc?.describe(), LEGACY_SETTINGS_NS);
		if (legacy?.value?.iconGrid) {
			const migrated = normalizeConfig({ iconGrid: legacy.value.iconGrid });
			saveLocalConfig(migrated);
			writeConfigToDsh(settingsSvc, migrated).catch(() => {});
			return migrated;
		}
	} catch {}
	return uiState.get();
}
function apply(ctx) {
	if (typeof document === "undefined") return;
	const hadResidue = !!document.getElementById("dsh-icon-grid-root");
	teardown();
	if (hadResidue) console.warn("[dsh-icon-grid] 检测到上次挂载残留，已清理后重新挂载（若频繁出现请检查热重载或重复加载）");
	const settingsSvc = ctx.remote?.settings;
	const uiState = createUiState(DEFAULT_CONFIG);
	host = document.createElement("div");
	host.id = "dsh-icon-grid-root";
	document.body.appendChild(host);
	root = (0, react_dom_client.createRoot)(host);
	root.render(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Grid, {
		ctx,
		uiState,
		settingsSvc
	}));
	readState(settingsSvc, uiState).then((cfg) => {
		if (!root) return;
		uiState.update(cfg);
	}).catch((e) => {
		console.error("[dsh-icon-grid] 读取状态失败:", e);
	});
	ctx.on?.("dsh-icon-grid/state-changed", (state) => {
		if (state && typeof state === "object") uiState.update(state);
	});
	ctx.on?.("dispose", () => {
		teardown();
	});
}

//#endregion
exports.apply = apply
exports.inject = inject
return module.exports; } });
//# sourceMappingURL=client.js.map