module.exports.uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = (Math.random() * 16) | 0;
    let v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// indxFunc return the index position
module.exports.uniq = (ar, indxFunc) => {
  indxFunc =
    indxFunc ||
    ((self, value) => {
      return self.indexOf(value);
    });

  const distinct = (value, indx, self) => {
    return indxFunc(self, value) === indx;
  };

  return ar.filter(distinct);
};

module.exports.commonResponse = ({ statusCode, body }) => {
  return {
    statusCode,
    body,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
};
