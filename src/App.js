import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";

import { TARGET_FIELD, BENEF_DB_FIELDS, IMPORT_OPTIONS } from "./data";
import {
  attachedRawData,
  includeOnlySelectedTarget,
  removeFieldsWithUnderscore,
  splitFullName,
} from "./utils";
import "./App.css";
import ImportBenef from "./screens/ImportBenef";
import ExcelUploader from "./components/ExcelUploader";
import SelectDropdown from "./components/SelectDropdown";
import NestedObjectRenderer from "./components/NestedObjectRenderer";
import SelectKoboForm from "./components/SelectKoboForm";

const API_URL = process.env.REACT_APP_API_URL;

const SCREENS = {
  IMPORT_SOURCE: "Import Source",
  IMPORT_BENEF: "Import Beneficiary",
};

const App = () => {
  const [currenSource, setCurrentSource] = useState("");
  const [rawData, setRawData] = useState([]);
  const [mappings, setMappings] = useState([]); // [{sourceField, targetField}]
  const [currentScreen, setCurrentScreen] = useState(SCREENS.IMPORT_SOURCE);
  const [fetching, setFetching] = useState(false);
  const [koboForms, setKoboForms] = useState([]);
  const [importId, setImportId] = useState(null); // Kobo form id
  const [existingMappings, setExistingMappings] = useState([]);
  const [authToken, setAuthToken] = useState("");

  console.log("ExistingMappings", existingMappings);

  useEffect(() => {
    const res = async () => {
      const re = await axios.post(`${API_URL}/auth/otp`, {
        authAddress: "admin@mailinator.com",
      });
      const authToken = await axios.post(`${API_URL}/auth/login`, {
        authAddress: "admin@mailinator.com",
        otp: re?.data?.data?.otp,
      });
      setAuthToken(authToken?.data?.data?.accessToken);
    };
    res();
  }, []);

  console.log(fetching);

  const handleKoboFormChange = async (e) => {
    try {
      setRawData([]);
      setExistingMappings([]);
      const { value } = e.target;
      console.log(value);
      if (!value) return alert("Please select kobo form!");
      setFetching(true);
      const found = koboForms.find((f) => f.name === value);
      const formId = found.formId || "";
      setImportId(formId);
      console.log(authToken);
      const d = await axios.get(`${API_URL}/sources/${formId}/mappings`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (d.data.data.length) setExistingMappings(d.data.data);
      const response = await axios.get(`${API_URL}/app/kobo-import/${value}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      console.log(response);
      const responseData = response?.data?.data?.results || [];
      const sanitized = removeFieldsWithUnderscore(responseData);
      setRawData(sanitized);
      setFetching(false);
    } catch (err) {
      setFetching(false);
    }
  };

  const handleSelectChange = async (e) => {
    setRawData([]);
    const { value } = e.target;
    if (value === IMPORT_OPTIONS.KOBOTOOL) {
      const d = await axios.get(`${API_URL}/app/settings/kobotool`);
      setKoboForms(d.data.data);
    }
    setCurrentSource(value);
  };

  const handleExcelFileUpload = async (file) => {
    if (!file) return alert("Please select file!");
    const formData = new FormData();
    formData.append("file", file);
    const uploaded = await axios.post(
      `${API_URL}/beneficiaries/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    const { workbookData, sheetId } = uploaded.data?.data;
    setImportId(sheetId);
    const sanitized = removeFieldsWithUnderscore(workbookData);
    setRawData(sanitized);
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

  const handleCreateSource = (e) => {
    e.preventDefault();
    let finalPayload = rawData;
    const selectedTargets = []; // Only submit selected target fields

    const myMappings = existingMappings.length ? existingMappings : mappings;

    for (let m of myMappings) {
      if (m.targetField === TARGET_FIELD.FIRSTNAME) {
        selectedTargets.push(TARGET_FIELD.FIRSTNAME);
        const replaced = finalPayload.map((item) => {
          const firstName = item[m.sourceField];
          const newItem = { ...item, firstName };
          if (m.sourceField !== m.targetField) delete newItem[m.sourceField];
          return newItem;
        });
        finalPayload = replaced;
      } else if (m.targetField === TARGET_FIELD.LASTNAME) {
        selectedTargets.push(TARGET_FIELD.LASTNAME);
        const replaced = finalPayload.map((item) => {
          const lastName = item[m.sourceField];
          const newItem = { ...item, lastName };
          if (m.sourceField !== m.targetField) delete newItem[m.sourceField];
          return newItem;
        });
        finalPayload = replaced;
      } else if (m.targetField === TARGET_FIELD.FULL_NAME) {
        // Split fullName, update target_key:value and delete old_source_key
        selectedTargets.push(TARGET_FIELD.FIRSTNAME);
        selectedTargets.push(TARGET_FIELD.LASTNAME);
        const replaced = finalPayload.map((item) => {
          const { firstName, lastName } = splitFullName(item[m.sourceField]);
          const newItem = { ...item, firstName, lastName };
          if (m.sourceField !== m.targetField) delete newItem[m.sourceField];
          return newItem;
        });
        finalPayload = replaced;
      } else {
        selectedTargets.push(m.targetField);
        // Update target_key:value and delete old_source_key
        const replaced = finalPayload.map((item) => {
          const newItem = { ...item, [m.targetField]: item[m.sourceField] };
          if (m.sourceField !== m.targetField) delete newItem[m.sourceField];
          return newItem;
        });
        finalPayload = replaced;
      }
    }
    console.log("FinalPayload", finalPayload);
    return importToSource(finalPayload, selectedTargets);
  };

  const importToSource = async (payload, selectedTargets) => {
    try {
      if (!selectedTargets.length) return alert("Please select target fields!");
      // Remove non-selected fields
      const selectedFieldsOnly = includeOnlySelectedTarget(
        payload,
        selectedTargets
      );
      // Attach raw data
      const final_mapping = attachedRawData(selectedFieldsOnly, rawData);
      // Validate payload against backend
      const sourcePayload = {
        name: currenSource,
        importId,
        details: { message: "This is default message" },
        fieldMapping: { data: final_mapping, sourceTargetMappings: mappings },
      };
      await axios.post(`${API_URL}/sources`, sourcePayload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // setCurrentScreen(SCREENS.IMPORT_BENEF);
      alert("Beneficiaries added to the import Queue!");
    } catch (err) {
      console.log("ERR==>", err);
      alert("Internal server error!");
    }
  };

  const handleHomeClick = () => {
    setRawData([]);
    setCurrentScreen(SCREENS.IMPORT_SOURCE);
  };

  return (
    <>
      {currentScreen === SCREENS.IMPORT_BENEF && (
        <ImportBenef handleHomeClick={handleHomeClick} authToken={authToken} />
      )}
      {currentScreen === SCREENS.IMPORT_SOURCE && (
        <Fragment>
          <div style={{ padding: 20, marginLeft: "40%" }}>
            <SelectDropdown handleSelectChange={handleSelectChange} />
            <br />
            {koboForms.length > 0 ? (
              <SelectKoboForm
                options={koboForms}
                handleKoboFormChange={handleKoboFormChange}
              />
            ) : (
              <i>
                {currenSource === IMPORT_OPTIONS.KOBOTOOL &&
                  "Create a Kobotool form settings!"}
              </i>
            )}
            <div>
              {currenSource === IMPORT_OPTIONS.EXCEL && (
                <ExcelUploader onFileUpload={handleExcelFileUpload} />
              )}
            </div>
          </div>
          <hr />
          <div>
            {currenSource && (
              <button
                style={{ padding: 10, margin: 20 }}
                type="button"
                onClick={handleCreateSource}
              >
                Create Source
              </button>
            )}

            {existingMappings.length > 0 && (
              <span>
                Fields are already mapped. You can create source right now!
              </span>
            )}

            <a
              style={{ padding: 10, margin: 20 }}
              href="#sources"
              onClick={() => setCurrentScreen(SCREENS.IMPORT_BENEF)}
            >
              [View Sources]
            </a>

            {fetching && (
              <p style={{ margin: 20 }}>Fetching Beneficiaries...</p>
            )}

            <table>
              {rawData.map((item, index) => {
                const keys = Object.keys(item);

                return (
                  <Fragment key={index}>
                    <tbody>
                      {index === 0 && (
                        <tr>
                          {keys.map((key, i) => {
                            return (
                              <td key={i + 1}>
                                <strong>{key.toLocaleUpperCase()}</strong>{" "}
                                <br />
                                <select
                                  name="targetField"
                                  id="targetField"
                                  onChange={(e) =>
                                    handleTargetFieldChange(key, e.target.value)
                                  }
                                >
                                  <option value="None">
                                    --Choose Target--
                                  </option>
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
          </div>
        </Fragment>
      )}
    </>
  );
};

export default App;
