export const inRange = (number, range = { min: 0, max: 60 }) => {
  const { min, max } = range;
  if (number > max || number === min) {
    return false;
  }
  return true;
};
