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
	includeOnlySelectedTarget,
	removeFieldsWithUnderscore,
	splitFullName,
} from "./utils";
import "./App.css";
import ImportBenef from "./screens/ImportBenef";
import ExcelUploader from "./ExcelUploader";

const API_URL = process.env.REACT_APP_API_URL;

const SCREENS = {
	HOME: "Home",
	IMPORT_BENEF: "Import Beneficiary",
};

const { results } = KOBO_DATA;

const DynamicArrayRenderer = ({ dataArray }) => {
	const [mappings, setMappings] = useState([]);
	const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
	const [excelData, setExcelData] = useState([]);

	const handleSubmit = (e) => {
		e.preventDefault();
		let finalPayload = removeFieldsWithUnderscore(excelData);
		const selectedTargets = []; // Only submit selected target fields

		console.log("F==>", finalPayload);

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
		console.log("Final=>", finalPayload);
		return importToSource(finalPayload, selectedTargets);
	};

	const importToSource = async (payload, selectedTargets) => {
		try {
			// const omitID = selectedTargets.filter((f) => f !== UNIQUE_ID);
			if (!selectedTargets.length) return alert("Please select target fields!");
			// Remove non-selected fields
			console.log("Paylaod==>", payload);
			const selectedFieldsOnly = includeOnlySelectedTarget(
				payload,
				selectedTargets
			);
			// Attach raw data
			const final_mapping = attachedRawData(selectedFieldsOnly, excelData);
			console.log("final_mapping=>", final_mapping);
			// Validate payload against backend
			const sourcePayload = {
				name: IMPORT_SOURCE.KOBOTOOL,
				details: { message: "This is just a test" },
				field_mapping: { data: final_mapping },
			};
			await axios.post(`${API_URL}/sources`, sourcePayload);
			setCurrentScreen(SCREENS.IMPORT_BENEF);
			alert("Imported to source!");
		} catch (err) {
			console.log("ERR==>", err);
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

	const handleExcelFileUpload = async (file) => {
		if (!file) return alert("Please select file!");
		const formData = new FormData();
		formData.append("file", file);
		const uploaded = await axios.post(
			`${API_URL}/beneficiaries/upload`,
			formData
		);
		const { data } = uploaded.data;
		setExcelData(data);
	};

	console.log("mappings=>", mappings);

	return (
		<div>
			{currentScreen === SCREENS.IMPORT_BENEF && <ImportBenef />}
			{currentScreen === SCREENS.HOME && (
				<>
					<h3>Beneficiary List</h3>
					<hr />
					<ExcelUploader onFileUpload={handleExcelFileUpload} />
					<table>
						{excelData.map((item, index) => {
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
	const [benefList, setBenefList] = useState(results);

	const myArray = removeFieldsWithUnderscore(benefList);

	return <DynamicArrayRenderer dataArray={myArray} />;
};

export default MyComponent;
