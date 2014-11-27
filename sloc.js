// Generated by CoffeeScript 1.8.0

/*
This program is distributed under the terms of the MIT license.
Copyright 2012 - 2014 (c) Markus Kohlhase <mail@markus-kohlhase.de>
 */

(function() {
  var countComments, countMixed, emptyLines, emptyLns, endOfLine, extensions, getCommentExpressions, getStop, getType, keys, lineSum, matchIdx, newLines, newLns, nonEmpty, slocModule, trampoline,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  keys = ['total', 'source', 'comment', 'single', 'block', 'mixed', 'empty'];

  nonEmpty = /[^\s]/;

  endOfLine = /$/m;

  newLines = /\n/g;

  emptyLines = /^\s*$/mg;

  getCommentExpressions = function(lang) {
    var single, start, stop;
    single = (function() {
      switch (lang) {
        case "coffee":
        case "py":
        case "ls":
        case "nix":
        case "r":
        case "rb":
        case "jl":
        case "pl":
        case "yaml":
        case "hr":
          return /\#/;
        case "js":
        case "c":
        case "cc":
        case "cpp":
        case "cs":
        case "h":
        case "hpp":
        case "hx":
        case "ino":
        case "java":
        case "php":
        case "php5":
        case "go":
        case "groovy":
        case "scss":
        case "less":
        case "rs":
        case "styl":
        case "scala":
        case "swift":
        case "ts":
          return /\/{2}/;
        case "lua":
        case "hs":
          return /--/;
        case "erl":
          return /\%/;
        case "monkey":
        case "vb":
          return /'/;
        case "rkt":
        case "clj":
        case "cljs":
        case "hy":
          return /;/;
        default:
          return null;
      }
    })();
    switch (lang) {
      case "coffee":
        start = stop = /\#{3}/;
        break;
      case "js":
      case "c":
      case "cc":
      case "cpp":
      case "cs":
      case "h":
      case "hpp":
      case "hx":
      case "ino":
      case "java":
      case "ls":
      case "nix":
      case "php":
      case "php5":
      case "go":
      case "groovy":
      case "css":
      case "scss":
      case "less":
      case "rs":
      case "styl":
      case "scala":
      case "ts":
        start = /\/\*+/;
        stop = /\*\/{1}/;
        break;
      case "python":
      case "py":
        start = stop = /\"{3}|\'{3}/;
        break;
      case "handlebars":
      case "hbs":
      case "mustache":
        start = /\{\{\!/;
        stop = /\}\}/;
        break;
      case "hs":
        start = /\{-/;
        stop = /-\}/;
        break;
      case "html":
      case "htm":
      case "svg":
      case "xml":
        start = /<\!--/;
        stop = /-->/;
        break;
      case "lua":
        start = /--\[{2}/;
        stop = /--\]{2}/;
        break;
      case "monkey":
        start = /#rem/i;
        stop = /#end/i;
        break;
      case "rb":
        start = /\=begin/;
        stop = /\=end/;
        break;
      case "rkt":
        start = /#\|/;
        stop = /\|#/;
        break;
      case "jl":
        start = /\#\=/;
        stop = /\=\#/;
        break;
      default:
        if (__indexOf.call(extensions, lang) >= 0) {
          start = stop = null;
        } else {
          throw new TypeError("File extension '" + lang + "' is not supported");
        }
    }
    return {
      start: start,
      stop: stop,
      single: single
    };
  };

  countMixed = function(res, lines, idx, startIdx, match) {
    var _ref;
    if ((nonEmpty.exec(lines[0])) && (((_ref = res.last) != null ? _ref.stop : void 0) === idx || startIdx === idx)) {
      res.mixed.push({
        start: idx,
        stop: idx
      });
    }
    if ((match != null) && nonEmpty.exec(lines.slice(-1)[0].substr(0, match.index))) {
      return res.mixed.push({
        start: startIdx,
        stop: startIdx
      });
    }
  };

  getStop = function(comment, type, regex) {
    return comment.match((function() {
      switch (type) {
        case 'single':
          return endOfLine;
        case 'block':
          return regex.stop;
      }
    })());
  };

  getType = function(single, start) {
    if (single && !start) {
      return 'single';
    } else if (start && !single) {
      return 'block';
    } else {
      if (start.index <= single.index) {
        return 'block';
      } else {
        return 'single';
      }
    }
  };

  matchIdx = function(m) {
    return m.index + m[0].length;
  };

  emptyLns = function(c) {
    var _ref;
    return ((_ref = c.match(emptyLines)) != null ? _ref.length : void 0) || 0;
  };

  newLns = function(c) {
    var _ref;
    return ((_ref = c.match(newLines)) != null ? _ref.length : void 0) || 0;
  };

  countComments = function(code, regex) {
    var myself;
    myself = function(res, code, idx) {
      var cStartIdx, comment, empty, len, lines, match, single, splitAt, start, startIdx, stop, type, _ref, _ref1;
      if (code === '') {
        return res;
      }
      if (code[0] === '\n') {
        return function() {
          return myself(res, code.slice(1), ++idx);
        };
      }
      start = (_ref = regex.start) != null ? _ref.exec(code) : void 0;
      single = (_ref1 = regex.single) != null ? _ref1.exec(code) : void 0;
      if (!(start || single)) {
        countMixed(res, code.split('\n'), idx);
        return res;
      }
      type = getType(single, start);
      match = (function() {
        switch (type) {
          case 'single':
            return single;
          case 'block':
            return start;
        }
      })();
      cStartIdx = matchIdx(match);
      comment = code.substring(cStartIdx);
      lines = code.substring(0, match.index).split('\n');
      startIdx = lines.length - 1 + idx;
      stop = getStop(comment, type, regex);
      if (!stop) {
        res.error = true;
        return res;
      }
      empty = emptyLns(code.substring(match.index, cStartIdx + matchIdx(stop)));
      comment = comment.substring(0, stop.index);
      len = newLns(comment);
      splitAt = cStartIdx + comment.length + stop[0].length;
      code = code.substring(splitAt);
      countMixed(res, lines, idx, startIdx, match);
      res.last = {
        start: startIdx,
        stop: startIdx + len,
        empty: empty
      };
      res[type].push(res.last);
      return function() {
        return myself(res, code, startIdx + len);
      };
    };
    return trampoline(myself({
      single: [],
      block: [],
      mixed: []
    }, code, 0));
  };

  trampoline = function(next) {
    while (typeof next === 'function') {
      next = next();
    }
    return next;
  };

  lineSum = function(comments) {
    var c, d, i, sum, _i, _len, _ref;
    sum = 0;
    for (i = _i = 0, _len = comments.length; _i < _len; i = ++_i) {
      c = comments[i];
      d = (c.stop - c.start) + 1;
      if (((_ref = comments[i + 1]) != null ? _ref.start : void 0) === c.stop) {
        d--;
      }
      sum += d;
    }
    return sum;
  };

  slocModule = function(code, lang, opt) {
    var b, bIdx, block, blockEmpty, comment, empty, mixed, res, s, single, source, total, x, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    if (opt == null) {
      opt = {};
    }
    if (typeof code !== "string") {
      throw new TypeError("'code' has to be a string");
    }
    code = code.replace(/\r\n|\r/g, '\n');
    if (code.slice(-1) === '\n') {
      code = code.slice(0, -1);
    }
    total = (1 + newLns(code)) || 1;
    empty = emptyLns(code);
    res = countComments(code, getCommentExpressions(lang));
    single = lineSum(res.single);
    block = lineSum(res.block);
    mixed = lineSum(res.mixed);
    comment = block + single;
    bIdx = (function() {
      var _i, _len, _ref, _ref1, _results;
      _ref = res.block;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        b = _ref[_i];
        if (!(_ref1 = b.stop, __indexOf.call(_results, _ref1) >= 0)) {
          _results.push(b.stop);
        }
      }
      return _results;
    })();
    _ref = res.single;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      if (_ref1 = s.start, __indexOf.call(bIdx, _ref1) >= 0) {
        comment--;
      }
    }
    blockEmpty = 0;
    _ref2 = res.block;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      x = _ref2[_j];
      blockEmpty = +x.empty;
    }
    source = total - comment - empty + blockEmpty + mixed;
    if (opt.debug) {
      console.log(res);
    }
    return {
      total: total,
      source: source,
      comment: comment,
      single: single,
      block: block,
      mixed: mixed,
      empty: empty
    };
  };

  extensions = ["c", "cc", "clj", "cljs", "coffee", "cpp", "cs", "css", "erl", "go", "groovy", "h", "handlebars", "hbs", "hpp", "hr", "hs", "html", "htm", "hx", "hy", "ino", "java", "jl", "js", "less", "lua", "ls", "monkey", "mustache", "nix", "php", "php5", "pl", "py", "r", "rb", "rkt", "rs", "scala", "scss", "styl", "svg", "swift", "ts", "vb", "xml", "yaml"];

  slocModule.extensions = extensions;

  slocModule.keys = keys;

  if ((typeof define !== "undefined" && define !== null ? define.amd : void 0) != null) {
    define(function() {
      return slocModule;
    });
  } else if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = slocModule;
  } else if (typeof window !== "undefined" && window !== null) {
    window.sloc = slocModule;
  }

}).call(this);
