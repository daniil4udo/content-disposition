/*!
 * content-disposition
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 */

module.exports = contentDisposition

/**
 * Module dependencies.
 */

var basename = require('path').basename

/**
 * RegExp to match non attr-char not handled by encodeURI.
 */

var encodeUriAttrCharRegExp = /[*']/g

/**
 * RegExp to match non-US-ASCII characters.
 */

var nonAsciiRegExp = /[^\x00-\x7f]/g

/**
 * RegExp to match chars that must be quoted-pair in RFC 2616
 */

var quoteRegExp = /([\\"])/g

/**
 * RegExp for various RFC 2616 grammar
 *
 * TEXT = <any OCTET except CTLs, but including LWS>
 */

var textRegExp = /^[\u0020-\u007e\u0080-\u00ff]+$/

/**
 * Create an attachment Content-Disposition header.
 *
 * @param {string} filename
 * @return {string}
 * @api public
 */

function contentDisposition(filename) {
  if (typeof filename !== 'string') {
    throw new TypeError('argument filename is required')
  }

  // restrict to file base name
  var name = basename(filename)

  if (!nonAsciiRegExp.test(name)) {
    // simple header
    // file name is always quoted and not a token for RFC 2616 compatibility
    return 'attachment; filename=' + qstring(name)
  }

  // simple Unicode -> US-ASCII transliteration
  var asciiFilename = name.replace(nonAsciiRegExp, '?')

  return 'attachment; filename=' + qstring(asciiFilename)
    + '; filename*=' + ustring(name)
}

/**
 * Percent encode a single character.
 *
 * @param {string} char
 * @return {string}
 * @api private
 */

function pencode(char) {
  var hex = String(char)
    .charCodeAt(0)
    .toString(16)
    .toUpperCase()
  return hex.length === 1
    ? '%0' + hex
    : '%' + hex
}

/**
 * Quote a string for HTTP.
 *
 * @param {string} val
 * @return {string}
 * @api private
 */

function qstring(val) {
  var str = String(val)

  if (str.length > 0 && !textRegExp.test(str)) {
    throw new TypeError('invalid quoted string value')
  }

  return '"' + str.replace(quoteRegExp, '\\$1') + '"'
}

/**
 * Encode a Unicode string for HTTP (RFC 5987).
 *
 * @param {string} val
 * @return {string}
 * @api private
 */

function ustring(val) {
  var str = String(val)

  // percent encode as UTF-8
  var encoded = encodeURI(str)
    .replace(encodeUriAttrCharRegExp, pencode)

  return 'UTF-8\'\'' + encoded
}
