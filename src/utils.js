import _ from 'lodash';

export const interKeys = (obj1, obj2) => _.intersection(_.keys(obj1), _.keys(obj2));

export const getTypeOf = _.flow([
  value => Object.prototype.toString.call(value),
  value => value.slice(8, -1),
  _.camelCase
]);
// const getTypeOf = (value) => (value |> Object.prototype.toString.call(#) |> #.slice(8, -1) |> _.lowerCase);

export const isAsyncFunction = (fn) => (getTypeOf(fn) === 'asyncFunction');
