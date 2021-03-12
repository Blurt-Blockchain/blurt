export const getNumberStat = (count: number) => {
  const _count = count.toString();
  if (count < 1000) {
    return _count;
  } else if (count < 1000000) {
    return _count.slice(0, _count.length - 3) + ' K';
  } else {
    return (
      _count.slice(0, _count.length - 6) +
      '.' +
      _count.slice(_count.length - 6, _count.length - 3) +
      ' M'
    );
  }
};

export const putComma = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
