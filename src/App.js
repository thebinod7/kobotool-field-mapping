import React, { Fragment, useState } from "react";
import { KOBO_DATA } from "./data";
import { removeFieldsWithUnderscore, splitFullName } from "./utils";
import "./App.css";

const { results } = KOBO_DATA;

const TARGET_FIELDS = {
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
	TARGET_FIELDS.FIRSTNAME_LASTNAME,
	TARGET_FIELDS.LOCATION,
	TARGET_FIELDS.PHONE,
	TARGET_FIELDS.EMAIL,
	TARGET_FIELDS.GENDER,
	TARGET_FIELDS.BIRTH_DATE,
	TARGET_FIELDS.NOTES,
	TARGET_FIELDS.LATITUDE,
	TARGET_FIELDS.LONGITUDE,
];

const DynamicArrayRenderer = ({ dataArray }) => {
	const [mappings, setMappings] = useState([]);

	const handleSubmit = (e) => {
		e.preventDefault();
		let finalPayload = removeFieldsWithUnderscore(results);

		for (let m of mappings) {
			if (m.targetField === TARGET_FIELDS.FIRSTNAME_LASTNAME) {
				// Split fullName, update target_key and delete old_key
				const replaced = finalPayload.map((item) => {
					const { firstName, lastName } = splitFullName(item[m.sourceField]);
					const newItem = { ...item, firstName, lastName };
					delete newItem[m.sourceField];
					return newItem;
				});
				finalPayload = replaced;
			} else {
				// Update target_key and delete old_key
				const replaced = finalPayload.map((item) => {
					const newItem = { ...item, [m.targetField]: item[m.sourceField] };
					delete newItem[m.sourceField];
					return newItem;
				});
				finalPayload = replaced;
			}
		}
		console.log("FINAL==>", finalPayload);
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
			<h3>=======Beneficiary List=========</h3>
			<hr />
			<table>
				{dataArray.map((item, index) => {
					const keys = Object.keys(item);

					return (
						<Fragment key={index}>
							<tbody>
								<tr>
									{/* Render key:value */}
									{keys.map((key, i) => (
										<td key={i + 1}>
											{index === 0 && (
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
											)}

											{index === 0 ? <strong>{key}:</strong> : ""}
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

			<button type="button" onClick={handleSubmit}>
				Submit
			</button>
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
