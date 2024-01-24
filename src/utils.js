export function splitFullName(fullName) {
  // Split the full name into an array of words
  let nameArray = fullName.split(" ");

  // Extract the first and last names
  let firstName = nameArray[0];
  let lastName = nameArray[nameArray.length - 1];

  // Create an object to hold the result
  let result = {
    firstName: firstName,
    lastName: lastName,
  };

  return result;
}

export function removeFieldsWithUnderscore(dataArray) {
  return dataArray.map((item) => {
    const newObj = {};
    Object.keys(item).forEach((key) => {
      if (!key.startsWith("_")) {
        newObj[key] = item[key];
      }
      if (key === "_id") newObj[key] = item[key];
    });

    return newObj;
  });
}

export const attachedRawData = (payload, rawDataSource) => {
  let result = [];
  for (let p of payload) {
    const found = rawDataSource.find((f) => f._id === p._id);
    if (found) {
      const newItem = { ...p, rawData: found };
      result.push(newItem);
    }
  }
  return result;
};

export const attachedRawData2 = (payload, rawDataSource) => {
  let result = [];
  for (let i = 0; i < payload.length; i++) {
    let newItem = { ...payload[i], rawData: rawDataSource[i] };
    result.push(newItem);
  }
  return result;
};
export const includeOnlySelectedTarget = (array, selectedTargets) => {
  return array.map((item) => {
    const extractedFields = {};
    selectedTargets.forEach((key) => {
      if (item.hasOwnProperty(key)) {
        extractedFields[key] = item[key];
      }
    });

    return extractedFields;
  });
};
