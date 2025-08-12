(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var lib = {};

	var splitQuery$1 = {};

	var options = {};

	(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.oracleSplitterOptions = exports.redisSplitterOptions = exports.noSplitSplitterOptions = exports.mongoSplitterOptions = exports.sqliteSplitterOptions = exports.postgreSplitterOptions = exports.mssqlSplitterOptions = exports.mysqlSplitterOptions = exports.defaultSplitterOptions = void 0;
	exports.defaultSplitterOptions = {
	    stringsBegins: ["'"],
	    stringsEnds: { "'": "'" },
	    stringEscapes: { "'": "'" },
	    allowSemicolon: true,
	    allowCustomDelimiter: false,
	    allowCustomSqlTerminator: false,
	    allowGoDelimiter: false,
	    allowSlashDelimiter: false,
	    allowDollarDollarString: false,
	    noSplit: false,
	    skipSeparatorBeginEnd: false,
	    doubleDashComments: true,
	    multilineComments: true,
	    javaScriptComments: false,
	    returnRichInfo: false,
	    splitByLines: false,
	    splitByEmptyLine: false,
	    preventSingleLineSplit: false,
	    adaptiveGoSplit: false,
	    ignoreComments: false,
	    copyFromStdin: false,
	    queryParameterStyle: null,
	};
	exports.mysqlSplitterOptions = Object.assign(Object.assign({}, exports.defaultSplitterOptions), { allowCustomDelimiter: true, stringsBegins: ["'", '`', '"'], stringsEnds: { "'": "'", '`': '`', '"': '"' }, stringEscapes: { "'": '\\', '`': '`', '"': '\\' } });
	exports.mssqlSplitterOptions = Object.assign(Object.assign({}, exports.defaultSplitterOptions), { allowSemicolon: false, allowGoDelimiter: true, stringsBegins: ["'", '['], stringsEnds: { "'": "'", '[': ']' }, stringEscapes: { "'": "'" } });
	exports.postgreSplitterOptions = Object.assign(Object.assign({}, exports.defaultSplitterOptions), { allowDollarDollarString: true, stringsBegins: ["'", '"'], stringsEnds: { "'": "'", '"': '"' }, stringEscapes: { "'": "'", '"': '"' } });
	exports.sqliteSplitterOptions = Object.assign(Object.assign({}, exports.defaultSplitterOptions), { skipSeparatorBeginEnd: true, stringsBegins: ["'", '"'], stringsEnds: { "'": "'", '"': '"' }, stringEscapes: { "'": "'", '"': '"' } });
	exports.mongoSplitterOptions = Object.assign(Object.assign({}, exports.defaultSplitterOptions), { stringsBegins: ["'", '"'], stringsEnds: { "'": "'", '"': '"' }, stringEscapes: { "'": '\\', '"': '\\' } });
	exports.noSplitSplitterOptions = Object.assign(Object.assign({}, exports.defaultSplitterOptions), { noSplit: true });
	exports.redisSplitterOptions = Object.assign(Object.assign({}, exports.defaultSplitterOptions), { splitByLines: true });
	exports.oracleSplitterOptions = Object.assign(Object.assign({}, exports.defaultSplitterOptions), { allowCustomSqlTerminator: true, allowSlashDelimiter: true, stringsBegins: ["'", '"'], stringsEnds: { "'": "'", '"': '"' }, stringEscapes: { "'": "'", '"': '"' } });
	}(options));

	Object.defineProperty(splitQuery$1, "__esModule", { value: true });
	splitQuery$1.splitQuery = splitQuery$1.finishSplitStream = splitQuery$1.getInitialDelimiter = splitQuery$1.splitQueryLine = splitQuery$1.scanToken = void 0;
	const options_1 = options;
	const SEMICOLON = ';';
	const BEGIN_EXTRA_KEYWORDS = ['DEFERRED', 'IMMEDIATE', 'EXCLUSIVE', 'TRANSACTION'];
	const BEGIN_EXTRA_KEYWORDS_REGEX = new RegExp(`^(?:${BEGIN_EXTRA_KEYWORDS.join('|')})`, 'i');
	const END_EXTRA_KEYWORDS = ['TRANSACTION', 'IF'];
	const END_EXTRA_KEYWORDS_REGEX = new RegExp(`^(?:${END_EXTRA_KEYWORDS.join('|')})`, 'i');
	function movePosition(context, count, isWhite) {
	    let { source, position, line, column, streamPosition } = context;
	    while (count > 0) {
	        if (source[position] == '\n') {
	            line += 1;
	            column = 0;
	        }
	        else {
	            column += 1;
	        }
	        position += 1;
	        streamPosition += 1;
	        count -= 1;
	    }
	    context.position = position;
	    context.streamPosition = streamPosition;
	    context.line = line;
	    context.column = column;
	    if (!context.wasDataInCommand) {
	        if (isWhite) {
	            context.trimCommandStartPosition = streamPosition;
	            context.trimCommandStartLine = line;
	            context.trimCommandStartColumn = column;
	        }
	        else {
	            context.wasDataInCommand = true;
	        }
	    }
	    if (!isWhite) {
	        context.noWhitePosition = streamPosition;
	        context.noWhiteLine = line;
	        context.noWhiteColumn = column;
	    }
	}
	const WHITESPACE_TOKEN = {
	    type: 'whitespace',
	    length: 1,
	};
	const EOLN_TOKEN = {
	    type: 'eoln',
	    length: 1,
	};
	const DATA_TOKEN = {
	    type: 'data',
	    length: 1,
	};
	function scanDollarQuotedString(context) {
	    if (!context.options.allowDollarDollarString)
	        return null;
	    let pos = context.position;
	    const s = context.source;
	    const match = /^(\$[a-zA-Z0-9_]*\$)/.exec(s.slice(pos));
	    if (!match)
	        return null;
	    const label = match[1];
	    pos += label.length;
	    while (pos < context.end) {
	        if (s.slice(pos).startsWith(label)) {
	            return {
	                type: 'string',
	                length: pos + label.length - context.position,
	            };
	        }
	        pos++;
	    }
	    return null;
	}
	function scanToken(context) {
	    var _a;
	    let pos = context.position;
	    const s = context.source;
	    const ch = s[pos];
	    if (context.isCopyFromStdin) {
	        if (s.slice(pos).startsWith('\\.') && !context.wasDataOnLine) {
	            return {
	                type: 'copy_stdin_end',
	                length: 2,
	            };
	        }
	        let pos2 = pos;
	        while (pos2 < context.end && s[pos2] != '\n')
	            pos2++;
	        if (pos2 < context.end && s[pos2] == '\n')
	            pos2++;
	        return {
	            type: 'copy_stdin_line',
	            length: pos2 - pos,
	        };
	    }
	    if (context.options.stringsBegins.includes(ch)) {
	        pos++;
	        const endch = context.options.stringsEnds[ch];
	        const escapech = context.options.stringEscapes[ch];
	        while (pos < context.end) {
	            if (s[pos] == endch) {
	                break;
	            }
	            if (escapech && s[pos] == escapech) {
	                pos += 2;
	            }
	            else {
	                pos++;
	            }
	        }
	        return {
	            type: 'string',
	            length: pos - context.position + 1,
	        };
	    }
	    if (context.options.queryParameterStyle &&
	        ((_a = context.options.queryParameterStyle) === null || _a === void 0 ? void 0 : _a.length) == 1 &&
	        ch == context.options.queryParameterStyle &&
	        (context.options.queryParameterStyle == '?' || /[a-zA-Z0-9_]/.test(s[pos + 1]))) {
	        pos++;
	        if (context.options.queryParameterStyle != '?') {
	            while (pos < context.end && /[a-zA-Z0-9_]/.test(s[pos]))
	                pos++;
	        }
	        return {
	            type: 'parameter',
	            value: s.slice(context.position, pos),
	            length: pos - context.position,
	        };
	    }
	    const isInBeginEnd = context.options.skipSeparatorBeginEnd && context.beginEndIdentLevel > 0;
	    if (context.currentDelimiter && s.slice(pos).startsWith(context.currentDelimiter) && !isInBeginEnd) {
	        return {
	            type: 'delimiter',
	            length: context.currentDelimiter.length,
	        };
	    }
	    if (ch == ' ' || ch == '\t' || ch == '\r') {
	        return WHITESPACE_TOKEN;
	    }
	    if (ch == '\n') {
	        return EOLN_TOKEN;
	    }
	    if (context.options.doubleDashComments && ch == '-' && s[pos + 1] == '-') {
	        while (pos < context.end && s[pos] != '\n')
	            pos++;
	        return {
	            type: 'comment',
	            length: pos - context.position,
	        };
	    }
	    if (context.options.multilineComments && ch == '/' && s[pos + 1] == '*') {
	        pos += 2;
	        while (pos < context.end) {
	            if (s[pos] == '*' && s[pos + 1] == '/')
	                break;
	            pos++;
	        }
	        return {
	            type: 'comment',
	            length: pos - context.position + 2,
	        };
	    }
	    if (context.options.allowCustomDelimiter && !context.wasDataOnLine) {
	        const m = s.slice(pos).match(/^DELIMITER[ \t]+([^\n]+)/i);
	        if (m) {
	            return {
	                type: 'set_delimiter',
	                value: m[1].trim(),
	                length: m[0].length,
	            };
	        }
	    }
	    if (context.options.allowCustomSqlTerminator) {
	        const m = s.slice(pos).match(/^SET[ \t]+SQLT(ERMINATOR)?[ \t]+(ON|OFF|".")/i);
	        if (m) {
	            if (m[2].toUpperCase() == 'OFF') {
	                return {
	                    type: 'set_sqlterminator',
	                    value: null,
	                    length: m[0].length,
	                };
	            }
	            if (m[2].toUpperCase() == 'ON') {
	                return {
	                    type: 'set_sqlterminator',
	                    value: SEMICOLON,
	                    length: m[0].length,
	                };
	            }
	            if (m[2].startsWith('"')) {
	                return {
	                    type: 'set_sqlterminator',
	                    value: m[2].slice(1, -1),
	                    length: m[0].length,
	                };
	            }
	        }
	    }
	    if ((context.options.allowGoDelimiter || context.options.adaptiveGoSplit) && !context.wasDataOnLine) {
	        const m = s.slice(pos).match(/^GO[\t\r ]*(\n|$)/i);
	        if (m) {
	            return {
	                type: 'go_delimiter',
	                length: m[0].endsWith('\n') ? m[0].length - 1 : m[0].length,
	            };
	        }
	    }
	    if (context.options.allowSlashDelimiter && !context.wasDataOnLine) {
	        const m = s.slice(pos).match(/^\/[\t\r ]*(\n|$)/i);
	        if (m) {
	            return {
	                type: 'slash_delimiter',
	                length: m[0].endsWith('\n') ? m[0].length - 1 : m[0].length,
	            };
	        }
	    }
	    if (context.options.adaptiveGoSplit) {
	        const m = s.slice(pos).match(/^(CREATE|ALTER)\s*(PROCEDURE|FUNCTION|TRIGGER)/i);
	        if (m) {
	            return {
	                type: 'create_routine',
	                length: m[0].length,
	            };
	        }
	    }
	    if (context.options.copyFromStdin && !context.wasDataOnLine && s.slice(pos).startsWith('COPY ')) {
	        return {
	            type: 'copy',
	            length: 5,
	        };
	    }
	    if (context.isCopyFromStdinCandidate && s.slice(pos).startsWith('FROM stdin;')) {
	        let pos2 = pos + 'FROM stdin;'.length;
	        const pos0 = pos2 - 1;
	        while (pos2 < context.end && s[pos2] != '\n')
	            pos2++;
	        if (s[pos2] == '\n')
	            pos2++;
	        return {
	            type: 'copy_stdin_start',
	            length: pos2 - pos,
	            lengthWithoutWhitespace: pos0 - pos,
	        };
	    }
	    if (context.options.skipSeparatorBeginEnd && s.slice(pos).match(/^begin/i)) {
	        let pos2 = pos + 'BEGIN'.length;
	        let pos0 = pos2;
	        while (pos0 < context.end && /[^a-zA-Z0-9]/.test(s[pos0]))
	            pos0++;
	        if (!BEGIN_EXTRA_KEYWORDS_REGEX.test(s.slice(pos0))) {
	            return {
	                type: 'begin',
	                length: pos2 - pos,
	                lengthWithoutWhitespace: pos0 - pos,
	            };
	        }
	    }
	    if (context.options.skipSeparatorBeginEnd && s.slice(pos).match(/^end/i)) {
	        let pos2 = pos + 'END'.length;
	        let pos0 = pos2;
	        while (pos0 < context.end && /[^a-zA-Z0-9]/.test(s[pos0]))
	            pos0++;
	        if (!END_EXTRA_KEYWORDS_REGEX.test(s.slice(pos0))) {
	            return {
	                type: 'end',
	                length: pos2 - pos,
	            };
	        }
	    }
	    const dollarString = scanDollarQuotedString(context);
	    if (dollarString)
	        return dollarString;
	    return DATA_TOKEN;
	}
	splitQuery$1.scanToken = scanToken;
	function containsDataAfterDelimiterOnLine(context, delimiter) {
	    var _a;
	    const cloned = {
	        options: context.options,
	        source: context.source,
	        position: context.position,
	        currentDelimiter: context.currentDelimiter,
	        end: context.end,
	        wasDataOnLine: context.wasDataOnLine,
	        isCopyFromStdinCandidate: context.isCopyFromStdinCandidate,
	        isCopyFromStdin: context.isCopyFromStdin,
	        beginEndIdentLevel: context.beginEndIdentLevel,
	    };
	    cloned.position += delimiter.length;
	    while (cloned.position < cloned.end) {
	        const token = scanToken(cloned);
	        if (!token) {
	            cloned.position += 1;
	            continue;
	        }
	        switch (token.type) {
	            case 'whitespace':
	                cloned.position += token.length;
	                continue;
	            case 'eoln':
	                return false;
	            case 'comment':
	                if ((_a = token.value) === null || _a === void 0 ? void 0 : _a.includes('\n'))
	                    return true;
	                cloned.position += token.length;
	                continue;
	            default:
	                return true;
	        }
	    }
	}
	function pushQuery(context, specialMarker) {
	    context.commandPart += context.source.slice(context.currentCommandStart, context.position);
	    pushCurrentQueryPart(context, specialMarker);
	}
	function pushCurrentQueryPart(context, specialMarker) {
	    const trimmed = context.commandPart.substring(context.trimCommandStartPosition - context.commandStartPosition, context.noWhitePosition - context.commandStartPosition);
	    if (trimmed.trim()) {
	        if (context.options.returnRichInfo) {
	            context.pushOutput({
	                text: trimmed,
	                start: {
	                    position: context.commandStartPosition,
	                    line: context.commandStartLine,
	                    column: context.commandStartColumn,
	                },
	                end: {
	                    position: context.streamPosition,
	                    line: context.line,
	                    column: context.column,
	                },
	                trimStart: {
	                    position: context.trimCommandStartPosition,
	                    line: context.trimCommandStartLine,
	                    column: context.trimCommandStartColumn,
	                },
	                trimEnd: {
	                    position: context.noWhitePosition,
	                    line: context.noWhiteLine,
	                    column: context.noWhiteColumn,
	                },
	                specialMarker,
	            });
	        }
	        else {
	            context.pushOutput(trimmed);
	        }
	    }
	}
	function markStartCommand(context) {
	    context.commandStartPosition = context.streamPosition;
	    context.commandStartLine = context.line;
	    context.commandStartColumn = context.column;
	    context.trimCommandStartPosition = context.streamPosition;
	    context.trimCommandStartLine = context.line;
	    context.trimCommandStartColumn = context.column;
	    context.wasDataInCommand = false;
	}
	function splitByLines(context) {
	    while (context.position < context.end) {
	        if (context.source[context.position] == '\n') {
	            pushQuery(context);
	            context.commandPart = '';
	            movePosition(context, 1, true);
	            context.currentCommandStart = context.position;
	            markStartCommand(context);
	        }
	        else {
	            movePosition(context, 1, /\s/.test(context.source[context.position]));
	        }
	    }
	    if (context.end > context.currentCommandStart) {
	        context.commandPart += context.source.slice(context.currentCommandStart, context.position);
	    }
	}
	function splitQueryLine(context) {
	    if (context.options.splitByLines) {
	        splitByLines(context);
	        return;
	    }
	    while (context.position < context.end) {
	        const token = scanToken(context);
	        if (!token) {
	            // nothing special, move forward
	            movePosition(context, 1, false);
	            continue;
	        }
	        switch (token.type) {
	            case 'string':
	                movePosition(context, token.length, false);
	                context.wasDataOnLine = true;
	                break;
	            case 'comment':
	                movePosition(context, token.length, !!context.options.ignoreComments);
	                context.wasDataOnLine = true;
	                break;
	            case 'eoln':
	                if (!context.wasDataOnLine && context.options.splitByEmptyLine) {
	                    pushQuery(context);
	                    context.commandPart = '';
	                    movePosition(context, token.length, false);
	                    context.currentCommandStart = context.position;
	                    context.wasDataOnLine = false;
	                    markStartCommand(context);
	                    break;
	                }
	                movePosition(context, token.length, true);
	                context.wasDataOnLine = false;
	                break;
	            case 'data':
	                movePosition(context, token.length, false);
	                context.wasDataOnLine = true;
	                break;
	            case 'parameter':
	                movePosition(context, token.length, false);
	                context.wasDataOnLine = true;
	                break;
	            case 'whitespace':
	                movePosition(context, token.length, true);
	                break;
	            case 'set_delimiter':
	            case 'set_sqlterminator':
	                pushQuery(context);
	                context.commandPart = '';
	                context.currentDelimiter = token.value;
	                movePosition(context, token.length, false);
	                context.currentCommandStart = context.position;
	                markStartCommand(context);
	                break;
	            case 'go_delimiter':
	                pushQuery(context);
	                context.commandPart = '';
	                movePosition(context, token.length, false);
	                context.currentCommandStart = context.position;
	                markStartCommand(context);
	                if (context.options.adaptiveGoSplit) {
	                    context.currentDelimiter = SEMICOLON;
	                }
	                break;
	            case 'slash_delimiter':
	                pushQuery(context);
	                context.commandPart = '';
	                movePosition(context, token.length, false);
	                context.currentCommandStart = context.position;
	                markStartCommand(context);
	                break;
	            case 'create_routine':
	                movePosition(context, token.length, false);
	                if (context.options.adaptiveGoSplit) {
	                    context.currentDelimiter = null;
	                }
	                break;
	            case 'copy':
	                movePosition(context, token.length, false);
	                context.isCopyFromStdinCandidate = true;
	                context.wasDataOnLine = true;
	                break;
	            case 'copy_stdin_start':
	                movePosition(context, token.lengthWithoutWhitespace, false);
	                movePosition(context, token.length - token.lengthWithoutWhitespace, true);
	                context.isCopyFromStdin = true;
	                context.isCopyFromStdinCandidate = false;
	                context.wasDataOnLine = false;
	                pushQuery(context, 'copy_stdin_start');
	                context.commandPart = '';
	                context.currentCommandStart = context.position;
	                markStartCommand(context);
	                break;
	            case 'copy_stdin_line':
	                movePosition(context, token.length, false);
	                context.isCopyFromStdin = true;
	                context.isCopyFromStdinCandidate = false;
	                pushQuery(context, 'copy_stdin_line');
	                context.commandPart = '';
	                context.currentCommandStart = context.position;
	                markStartCommand(context);
	                break;
	            case 'copy_stdin_end':
	                movePosition(context, token.length, false);
	                context.isCopyFromStdin = false;
	                context.wasDataOnLine = true;
	                pushQuery(context, 'copy_stdin_end');
	                context.commandPart = '';
	                context.currentCommandStart = context.position;
	                markStartCommand(context);
	                break;
	            case 'delimiter':
	                if (context.options.preventSingleLineSplit && containsDataAfterDelimiterOnLine(context, token)) {
	                    movePosition(context, token.length, false);
	                    context.wasDataOnLine = true;
	                    break;
	                }
	                pushQuery(context);
	                context.commandPart = '';
	                movePosition(context, token.length, false);
	                context.currentCommandStart = context.position;
	                markStartCommand(context);
	                context.isCopyFromStdinCandidate = false;
	                break;
	            case 'begin':
	                if (context.options.skipSeparatorBeginEnd) {
	                    context.beginEndIdentLevel++;
	                }
	                movePosition(context, token.length, false);
	                break;
	            case 'end':
	                if (context.options.skipSeparatorBeginEnd && context.beginEndIdentLevel > 0) {
	                    context.beginEndIdentLevel--;
	                }
	                movePosition(context, token.length, false);
	                break;
	        }
	    }
	    if (context.end > context.currentCommandStart) {
	        context.commandPart += context.source.slice(context.currentCommandStart, context.position);
	    }
	}
	splitQuery$1.splitQueryLine = splitQueryLine;
	function getInitialDelimiter(options) {
	    if (options === null || options === void 0 ? void 0 : options.adaptiveGoSplit)
	        return SEMICOLON;
	    return (options === null || options === void 0 ? void 0 : options.allowSemicolon) === false ? null : SEMICOLON;
	}
	splitQuery$1.getInitialDelimiter = getInitialDelimiter;
	function finishSplitStream(context) {
	    pushCurrentQueryPart(context);
	}
	splitQuery$1.finishSplitStream = finishSplitStream;
	function splitQuery(sql, options = null) {
	    var _a;
	    const usedOptions = Object.assign(Object.assign({}, options_1.defaultSplitterOptions), options);
	    if (usedOptions.noSplit) {
	        if (usedOptions.returnRichInfo) {
	            const lines = sql.split('\n');
	            return [
	                {
	                    text: sql,
	                    start: {
	                        position: 0,
	                        line: 0,
	                        column: 0,
	                    },
	                    end: {
	                        position: sql.length,
	                        line: lines.length,
	                        column: ((_a = lines[lines.length - 1]) === null || _a === void 0 ? void 0 : _a.length) || 0,
	                    },
	                },
	            ];
	        }
	        return [sql];
	    }
	    const output = [];
	    const context = {
	        source: sql,
	        end: sql.length,
	        currentDelimiter: getInitialDelimiter(options),
	        position: 0,
	        column: 0,
	        line: 0,
	        currentCommandStart: 0,
	        commandStartLine: 0,
	        commandStartColumn: 0,
	        commandStartPosition: 0,
	        streamPosition: 0,
	        noWhiteLine: 0,
	        noWhiteColumn: 0,
	        noWhitePosition: 0,
	        trimCommandStartPosition: 0,
	        trimCommandStartLine: 0,
	        trimCommandStartColumn: 0,
	        beginEndIdentLevel: 0,
	        wasDataInCommand: false,
	        isCopyFromStdin: false,
	        isCopyFromStdinCandidate: false,
	        pushOutput: cmd => output.push(cmd),
	        wasDataOnLine: false,
	        options: usedOptions,
	        commandPart: '',
	    };
	    splitQueryLine(context);
	    finishSplitStream(context);
	    return output;
	}
	splitQuery$1.splitQuery = splitQuery;

	var queryParamHandler = {};

	Object.defineProperty(queryParamHandler, "__esModule", { value: true });
	queryParamHandler.replaceQueryParameters = queryParamHandler.extractQueryParameters = void 0;
	const splitQuery_1 = splitQuery$1;
	function createParameterizerContext(sql, options) {
	    return {
	        options,
	        source: sql,
	        position: 0,
	        currentDelimiter: (0, splitQuery_1.getInitialDelimiter)(options),
	        end: sql.length,
	        wasDataOnLine: false,
	        isCopyFromStdin: false,
	        isCopyFromStdinCandidate: false,
	        beginEndIdentLevel: 0,
	    };
	}
	function extractQueryParameters(sql, options) {
	    if (!sql || !options) {
	        return [];
	    }
	    const context = createParameterizerContext(sql, options);
	    const res = new Set();
	    while (context.position < context.end) {
	        const token = (0, splitQuery_1.scanToken)(context);
	        if (token === null) {
	            break;
	        }
	        if (token.type === 'parameter') {
	            if (token.value == '?') {
	                res.add(`?${res.size + 1}`);
	            }
	            else {
	                res.add(token.value);
	            }
	        }
	        context.position += token.length;
	    }
	    return Array.from(res);
	}
	queryParamHandler.extractQueryParameters = extractQueryParameters;
	function replaceQueryParameters(sql, params, options) {
	    if (!sql || !options) {
	        return sql;
	    }
	    const context = createParameterizerContext(sql, options);
	    let res = '';
	    let questionParamCounter = 0;
	    while (context.position < context.end) {
	        const token = (0, splitQuery_1.scanToken)(context);
	        if (token === null) {
	            break;
	        }
	        if (token.type === 'parameter') {
	            const paramName = token.value == '?' ? `?${++questionParamCounter}` : token.value;
	            if (params[paramName]) {
	                res += params[paramName];
	            }
	            else {
	                res += sql.substring(context.position, context.position + token.length);
	            }
	        }
	        else {
	            res += sql.substring(context.position, context.position + token.length);
	        }
	        context.position += token.length;
	    }
	    return res;
	}
	queryParamHandler.replaceQueryParameters = replaceQueryParameters;

	(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.replaceQueryParameters = exports.extractQueryParameters = exports.splitQuery = void 0;
	var splitQuery_1 = splitQuery$1;
	Object.defineProperty(exports, "splitQuery", { enumerable: true, get: function () { return splitQuery_1.splitQuery; } });
	var queryParamHandler_1 = queryParamHandler;
	Object.defineProperty(exports, "extractQueryParameters", { enumerable: true, get: function () { return queryParamHandler_1.extractQueryParameters; } });
	Object.defineProperty(exports, "replaceQueryParameters", { enumerable: true, get: function () { return queryParamHandler_1.replaceQueryParameters; } });
	__exportStar(options, exports);
	}(lib));

	onmessage = e => {
	  const result = lib.splitQuery(e.data.text, e.data.options);
	  postMessage(result);
	};

})();
//# sourceMappingURL=query-parser-worker.js.map
