import React, { Fragment, useState } from "react";
import axios from "axios";

import {
  KOBO_DATA,
  TARGET_FIELD,
  BENEF_DB_FIELDS,
  IMPORT_SOURCE,
} from "./data";
import {
  attachedRawData,
  attachedRawData2,
  includeOnlySelectedTarget,
  removeFieldsWithUnderscore,
  splitFullName,
} from "./utils";
import "./App.css";
import ImportBenef from "./screens/ImportBenef";
import UploadFile from "./screens/importFile";

const UNIQUE_ID = "_id";
const API_URL = process.env.REACT_APP_API_URL;

const SCREENS = {
  HOME: "Home",
  IMPORT_BENEF: "Import Beneficiary",
};

const { results } = KOBO_DATA;

const DynamicArrayRenderer = ({ dataArray }) => {
  const [mappings, setMappings] = useState([]);

  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);

  const handleSubmit = (e) => {
    e.preventDefault();
    let finalPayload = removeFieldsWithUnderscore(dataArray);
    const selectedTargets = [UNIQUE_ID]; // Only submit selected target fields

    for (let m of mappings) {
      if (m.targetField === TARGET_FIELD.FIRSTNAME_LASTNAME) {
        // Split fullName, update target_key and delete old_source_key
        selectedTargets.push("firstName");
        selectedTargets.push("lastName");
        const replaced = finalPayload.map((item) => {
          const { firstName, lastName } = splitFullName(item[m.sourceField]);
          const newItem = { ...item, firstName, lastName };
          delete newItem[m.sourceField];

          return newItem;
        });
        finalPayload = replaced;
      } else {
        selectedTargets.push(m.targetField);
        // Update target_key and delete old_source_key
        const replaced = finalPayload.map((item) => {
          const newItem = { ...item, [m.targetField]: item[m.sourceField] };
          delete newItem[m.sourceField];
          return newItem;
        });
        finalPayload = replaced;
      }
    }
    // console.log(finalPayload, "finalpayload");
    return importToSource(finalPayload, selectedTargets);
  };

  const importToSource = async (payload, selectedTargets) => {
    console.log("payload!", payload);
    console.log("selectedTargerts", selectedTargets);
    try {
      const omitID = selectedTargets.filter((f) => f !== UNIQUE_ID);
      if (!omitID.length) return alert("Please select target fields!");
      // console.log("selectedTargets=>", selectedTargets);
      // Remove non-selected fields
      const sanitized = includeOnlySelectedTarget(payload, selectedTargets);
      console.log("sanitized", sanitized);
      // Attach raw data
      const attached = attachedRawData2(sanitized, dataArray);
      // console.log("Attached=>", attached);
      // Validate payload against backend
      // const sourcePayload = {
      //   name: IMPORT_SOURCE.KOBOTOOL,
      //   details: { message: "This is just a test" },
      //   field_mapping: { data: attached },
      // };
      // await axios.post(`${API_URL}/sources`, sourcePayload);
      // setCurrentScreen(SCREENS.IMPORT_BENEF);
      // alert("Imported to source!");
    } catch (err) {
      // console.log("ERR==>", err);
      alert("Internal server error!");
    }
  };

  const handleTargetFieldChange = (sourceField, targetField) => {
    const index = mappings.findIndex(
      (item) => item.sourceField === sourceField
    );
    if (index !== -1) {
      mappings[index] = { ...mappings[index], targetField };
    } else {
      setMappings([...mappings, { sourceField, targetField }]);
    }
  };

  return (
    <div>
      {currentScreen === SCREENS.IMPORT_BENEF && <ImportBenef />}
      {currentScreen === SCREENS.HOME && (
        <>
          <h3>Beneficiary List</h3>
          <hr />
          <table>
            {dataArray.map((item, index) => {
              const keys = Object.keys(item);

              return (
                <Fragment key={index}>
                  <tbody>
                    {index === 0 && (
                      <tr>
                        {keys.map((key, i) => {
                          return (
                            <td key={i + 1}>
                              <strong>{key.toLocaleUpperCase()}</strong> <br />
                              <select
                                name="targetField"
                                id="targetField"
                                onChange={(e) =>
                                  handleTargetFieldChange(key, e.target.value)
                                }
                              >
                                <option value="None">--Choose Target--</option>
                                {BENEF_DB_FIELDS.map((f) => {
                                  return (
                                    <option key={f} value={f}>
                                      {f}
                                    </option>
                                  );
                                })}
                              </select>
                            </td>
                          );
                        })}
                      </tr>
                    )}

                    <tr>
                      {/* Render key:value */}
                      {keys.map((key, i) => (
                        <td key={i + 1}>
                          {typeof item[key] === "object" ? (
                            // Render nested objects
                            <NestedObjectRenderer object={item[key]} />
                          ) : (
                            // Render simple values
                            item[key]
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </Fragment>
              );
            })}
          </table>
          <br />
          <button style={{ padding: 10 }} type="button" onClick={handleSubmit}>
            Create Source
          </button>{" "}
          &nbsp;
        </>
      )}
    </div>
  );
};

const NestedObjectRenderer = ({ object }) => {
  const keys = Object.keys(object);

  return (
    <ul>
      {keys.map((key, i) => (
        <li key={i}>
          <strong>{key}:</strong> {object[key]}
        </li>
      ))}
    </ul>
  );
};

const MyComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importData, setImportData] = useState([]);

  const handleFileUpload = async (file) => {
    setSelectedFile(file);
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const uploadFile = await axios.post(
        `${API_URL}/beneficiaries/upload`,
        formData
      );
      setImportData(uploadFile?.data);
      setSelectedFile(null);
    } else {
      console.log("No file selected.");
    }
  };
  const myArray = removeFieldsWithUnderscore(results);
  const dataImport = removeFieldsWithUnderscore(importData);
  console.log("importData", importData);
  return (
    <>
      <DynamicArrayRenderer dataArray={dataImport} />;
      <UploadFile onFileUpload={handleFileUpload} />;
    </>
  );
};

export default MyComponent;
