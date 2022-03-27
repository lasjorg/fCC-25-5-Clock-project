export const formatTime = (time) => {
  // 3600 === 60 === 1 hour === 01:00:00 and not 00:60:00
  if (time === 3600) return '60:00';
  return new Date(time * 1000).toISOString().substring(14, 19);
};
