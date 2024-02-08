import React, { Fragment, useState } from "react";
import axios from "axios";

import {
	KOBO_DATA,
	TARGET_FIELD,
	BENEF_DB_FIELDS,
	IMPORT_OPTIONS,
} from "./data";
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

const API_URL = process.env.REACT_APP_API_URL;

const SCREENS = {
	IMPORT_SOURCE: "Import Source",
	IMPORT_BENEF: "Import Beneficiary",
};

const { results } = KOBO_DATA;

const App = () => {
	const [currenSource, setCurrentSource] = useState("");
	const [rawData, setRawData] = useState([]);
	const [mappings, setMappings] = useState([]);
	const [currentScreen, setCurrentScreen] = useState(SCREENS.IMPORT_SOURCE);

	const handleSelectChange = async (e) => {
		setRawData([]);
		const { value } = e.target;
		if (value === IMPORT_OPTIONS.KOBOTOOL) {
			// Import from kobotool
			const response = await axios.get(`${API_URL}/app/getDataFromKobo`);

			console.log("d", response);
			const responseData = response?.data?.data?.results;
			const sanitized = removeFieldsWithUnderscore(responseData);
			setRawData(sanitized);
		}
		setCurrentSource(value);
	};

	const handleExcelFileUpload = async (file) => {
		if (!file) return alert("Please select file!");
		const formData = new FormData();
		formData.append("file", file);
		const uploaded = await axios.post(
			`${API_URL}/beneficiaries/upload`,
			formData
		);
		const { data } = uploaded.data;
		const sanitized = removeFieldsWithUnderscore(data);
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

		for (let m of mappings) {
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
			console.log("Paylaod==>", payload);
			const selectedFieldsOnly = includeOnlySelectedTarget(
				payload,
				selectedTargets
			);
			// Attach raw data
			const final_mapping = attachedRawData(selectedFieldsOnly, rawData);
			console.log("final_mapping=>", final_mapping);
			// Validate payload against backend
			const sourcePayload = {
				name: currenSource,
				details: { message: "This is just a test" },
				fieldMapping: { data: final_mapping },
			};
			await axios.post(`${API_URL}/sources`, sourcePayload);
			setCurrentScreen(SCREENS.IMPORT_BENEF);
			alert("Imported to source!");
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
				<ImportBenef handleHomeClick={handleHomeClick} />
			)}
			{currentScreen === SCREENS.IMPORT_SOURCE && (
				<Fragment>
					<div style={{ padding: 20, marginLeft: "40%" }}>
						<SelectDropdown handleSelectChange={handleSelectChange} />
						<div>
							{currenSource === IMPORT_OPTIONS.EXCEL && (
								<ExcelUploader onFileUpload={handleExcelFileUpload} />
							)}
						</div>
					</div>
					<hr />
					<div>
						{currenSource ? (
							<button
								style={{ padding: 10, margin: 20 }}
								type="button"
								onClick={handleCreateSource}
							>
								Create Source
							</button>
						) : (
							<p style={{ margin: 10 }}>Please select import source!</p>
						)}

						<a
							style={{ padding: 10, margin: 20 }}
							href="#sources"
							onClick={() => setCurrentScreen(SCREENS.IMPORT_BENEF)}
						>
							[View Sources]
						</a>

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
