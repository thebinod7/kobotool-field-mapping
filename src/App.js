import React, { Fragment, useState } from "react";
import axios from "axios";

import { KOBO_DATA } from "./data";
import {
	attachedRawData,
	includeOnlySelectedTarget,
	removeFieldsWithUnderscore,
	splitFullName,
} from "./utils";
import "./App.css";

const { results } = KOBO_DATA;
const UNIQUE_ID = "_id";
const API_URL = "http://localhost:5600/api/v1/beneficiaries/import";

const TARGET_FIELD = {
	FIRSTNAME_LASTNAME: "firstName_lastName",
	LOCATION: "location",
	PHONE: "phone",
	EMAIL: "email",
	GENDER: "gender",
	BIRTH_DATE: "birthDate",
	NOTES: "notes",
	LATITUDE: "latitude",
	LONGITUDE: "longitude",
};

const BENEF_DB_FIELDS = [
	TARGET_FIELD.FIRSTNAME_LASTNAME,
	TARGET_FIELD.LOCATION,
	TARGET_FIELD.PHONE,
	TARGET_FIELD.EMAIL,
	TARGET_FIELD.GENDER,
	TARGET_FIELD.BIRTH_DATE,
	TARGET_FIELD.NOTES,
	TARGET_FIELD.LATITUDE,
	TARGET_FIELD.LONGITUDE,
];

const DynamicArrayRenderer = ({ dataArray }) => {
	const [mappings, setMappings] = useState([]);

	const handleSubmit = (e) => {
		e.preventDefault();
		let finalPayload = removeFieldsWithUnderscore(results);
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
		return importToDB(finalPayload, selectedTargets);
	};

	const importToDB = async (payload, selectedTargets) => {
		console.log("selectedTargets=>", selectedTargets);
		// Remove non-selected fields
		const sanitized = includeOnlySelectedTarget(payload, selectedTargets);
		// Attach raw data
		const attached = attachedRawData(sanitized, results);
		console.log("Attached=>", attached);
		// Validate payload against backend
		const res = await axios.post(API_URL, attached);
		console.log("RES==>", res.data);
		// Import to DB
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
			<div className="flex-container">
				<div className="left-side">
					<div id="table">
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
						<br />
						<button type="button" onClick={handleSubmit}>
							Submit
						</button>{" "}
						&nbsp;
						<button type="button">Preview</button>
					</div>
				</div>
				<div className="right-side">
					<h3>Schema Preview</h3>
					<hr />
				</div>
			</div>
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
	const myArray = removeFieldsWithUnderscore(results);

	return <DynamicArrayRenderer dataArray={myArray} />;
};

export default MyComponent;
