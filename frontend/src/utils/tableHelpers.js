import currentDevice from 'current-device';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';
import numeral from 'numeral';
import Moment from 'moment-timezone';
import {
  AMOUNT_FIELD_FORMATS_BY_PRECISION,
  DATE_FIELD_FORMATS,
  TIME_REGEX_TEST,
  TIME_FORMAT,
} from '../constants/Constants';

const propTypes = {
  // from @connect
  dispatch: PropTypes.func.isRequired,

  // from <DocumentList>
  autofocus: PropTypes.bool,
  rowEdited: PropTypes.bool,
  onSelectionChanged: PropTypes.func,
  onRowEdited: PropTypes.func,
  defaultSelected: PropTypes.array,
  disableOnClickOutside: PropTypes.func,
  limitOnClickOutside: PropTypes.bool,
  supportOpenRecord: PropTypes.bool,
};

export function constructorFn(props) {
  const { defaultSelected, rowEdited } = props;

  this.state = {
    // TODO: Maybe we sholud move this to redux ?
    selected:
      defaultSelected && defaultSelected !== null
        ? defaultSelected
        : [undefined],
    listenOnKeys: true,
    contextMenu: {
      open: false,
      x: 0,
      y: 0,
      fieldName: null,
      supportZoomInto: false,
      supportFieldEdit: false,
    },
    dataHash: uuid(),
    promptOpen: false,
    isBatchEntry: false,
    rows: [],
    collapsedRows: [],
    collapsedParentsRows: [],
    pendingInit: true,
    collapsedArrayMap: [],
    rowEdited: rowEdited,
    tableRefreshToggle: false,
  };
}

/**
 * @method getAmountFormatByPrecisiont
 * @param {string} precision
 **/
export function getAmountFormatByPrecision(precision) {
  return precision &&
    precision >= 0 &&
    precision < AMOUNT_FIELD_FORMATS_BY_PRECISION.length
    ? AMOUNT_FIELD_FORMATS_BY_PRECISION[precision]
    : null;
}

/**
 * @method getDateFormat
 * @param {string} fieldType
 * @summary get the date format according to the given fieldType provided parameter
 *   <FieldType> =====> <stringFormat> correspondence:
 *   Date: 'L',
 *   ZonedDateTime: 'L LTS',
 *   DateTime: 'L LTS',
 *   Time: 'LT',
 *   Timestamp: 'L HH:mm:ss',
 */
export function getDateFormat(fieldType) {
  return DATE_FIELD_FORMATS[fieldType];
}

/**
 * @method getSizeClass
 * @param {object} col
 * @summary get the class size dinamically (for Bootstrap ) for the col obj given as param
 */
export function getSizeClass(col) {
  const { widgetType, size } = col;
  const lg = ['List', 'Lookup', 'LongText', 'Date', 'DateTime', 'Time'];
  const md = ['Text', 'Address', 'ProductAttributes'];

  if (size) {
    switch (size) {
      case 'S':
        return 'td-sm';
      case 'M':
        return 'td-md';
      case 'L':
        return 'td-lg';
      case 'XL':
        return 'td-xl';
      case 'XXL':
        return 'td-xxl';
    }
  } else {
    if (lg.indexOf(widgetType) > -1) {
      return 'td-lg';
    } else if (md.indexOf(widgetType) > -1) {
      return 'td-md';
    } else {
      return 'td-sm';
    }
  }
}

/**
 * @method createDate
 * @param {object} containing the fieldValue, fieldType and the active locale
 * @summary creates a Date using Moment lib formatting it with the locale passed as param
 */
export function createDate({ fieldValue, fieldType, activeLocale }) {
  const languageKey = activeLocale ? activeLocale.key : null;
  if (fieldValue) {
    return !Moment.isMoment(fieldValue) && fieldValue.match(TIME_REGEX_TEST)
      ? Moment.utc(Moment.duration(fieldValue).asMilliseconds())
          .locale(languageKey)
          .format(TIME_FORMAT)
      : Moment(fieldValue)
          .locale(languageKey)
          .format(getDateFormat(fieldType));
  }

  return '';
}

/**
 * @method createAmount
 * @param {string} fieldValue
 * @param {string} precision
 * @param {boolean} isGerman
 * @summary creates an amount for a given value with the desired precision and it provides special formatting
 *          for the case when german language is set
 */
export function createAmount(fieldValue, precision, isGerman) {
  if (fieldValue) {
    const fieldValueAsNum = numeral(parseFloat(fieldValue));
    const numberFormat = getAmountFormatByPrecision(precision);
    const returnValue = numberFormat
      ? fieldValueAsNum.format(numberFormat)
      : fieldValueAsNum.format();

    // For German natives we want to show numbers with comma as a value separator
    // https://github.com/metasfresh/me03/issues/1822
    if (isGerman && parseFloat(returnValue) != null) {
      const commaRegexp = /,/g;
      commaRegexp.test(returnValue);
      const lastIdx = commaRegexp.lastIndex;

      if (lastIdx) {
        return returnValue;
      }

      return `${returnValue}`.replace('.', ',');
    }

    return returnValue;
  }

  return '';
}

export function handleCopy(e) {
  e.preventDefault();

  const cell = e.target;
  const textValue = cell.value || cell.textContent;

  e.clipboardData.setData('text/plain', textValue);
}

export function handleOpenNewTab({ windowId, rowIds }) {
  if (!rowIds) {
    return;
  }

  rowIds.forEach((rowId) => {
    window.open(`/window/${windowId}/${rowId}`, '_blank');
  });
}

export function shouldRenderColumn(column) {
  if (
    !column.restrictToMediaTypes ||
    column.restrictToMediaTypes.length === 0
  ) {
    return true;
  }

  const deviceType = currentDevice.type;
  let mediaType = 'tablet';

  if (deviceType === 'mobile') {
    mediaType = 'phone';
  } else if (deviceType === 'desktop') {
    mediaType = 'screen';
  }

  return column.restrictToMediaTypes.indexOf(mediaType) !== -1;
}

export { propTypes };
