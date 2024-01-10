import { useState } from "react";
import "./App.css";
import { splitFullName } from "./utils";
import { DynamicForm } from "./DynamicForm";
import { FORM_FIELDS } from "./data";

const KOBO_DATA = {
	count: 5,
	next: null,
	previous: null,
	results: [
		{
			_id: 182675281,
			"formhub/uuid": "9b35920b74c34e60ac6ade6ac7224332",
			start: "2022-09-09T13:13:11.356+05:45",
			end: "2022-09-09T13:13:16.641+05:45",
			Name: "Martina Deleon",
			Phone: "+1 (561) 555-7348",
			Address: "Unde quos eligendi facilis nostrum sunt in",
			__version__: "vJ2h57HfcaRTLpCX3xz2Hh",
			"meta/instanceID": "uuid:19fe381f-a06b-4a15-9409-9bd6af211172",
			_xform_id_string: "aNdpuv5XkgBg4VmdvRXJ2Z",
			_uuid: "19fe381f-a06b-4a15-9409-9bd6af211172",
			_attachments: [],
			_status: "submitted_via_web",
			_geolocation: [null, null],
			_submission_time: "2022-09-09T07:28:27",
			_tags: [],
			_notes: [],
			_validation_status: {},
			_submitted_by: null,
		},
		{
			_id: 182675284,
			"formhub/uuid": "9b35920b74c34e60ac6ade6ac7224332",
			start: "2022-09-09T13:13:16.673+05:45",
			end: "2022-09-09T13:13:20.385+05:45",
			Name: "Brennan Tanner",
			Phone: "+1 (176) 832-8056",
			Address: "Ullamco culpa nulla vero in incididunt",
			__version__: "vJ2h57HfcaRTLpCX3xz2Hh",
			"meta/instanceID": "uuid:9fbb55bc-f830-4ae9-af8d-3445687564b6",
			_xform_id_string: "aNdpuv5XkgBg4VmdvRXJ2Z",
			_uuid: "9fbb55bc-f830-4ae9-af8d-3445687564b6",
			_attachments: [],
			_status: "submitted_via_web",
			_geolocation: [null, null],
			_submission_time: "2022-09-09T07:28:27",
			_tags: [],
			_notes: [],
			_validation_status: {},
			_submitted_by: null,
		},
		{
			_id: 182675286,
			"formhub/uuid": "9b35920b74c34e60ac6ade6ac7224332",
			start: "2022-09-09T13:13:20.404+05:45",
			end: "2022-09-09T13:13:24.127+05:45",
			Name: "Odette Gross",
			Phone: "+1 (509) 476-1335",
			Address: "Molestias ipsum provident aut quaerat suscipit quia",
			__version__: "vJ2h57HfcaRTLpCX3xz2Hh",
			"meta/instanceID": "uuid:2f8ce50c-ee7a-48f4-9b41-0fa8d7533322",
			_xform_id_string: "aNdpuv5XkgBg4VmdvRXJ2Z",
			_uuid: "2f8ce50c-ee7a-48f4-9b41-0fa8d7533322",
			_attachments: [],
			_status: "submitted_via_web",
			_geolocation: [null, null],
			_submission_time: "2022-09-09T07:28:28",
			_tags: [],
			_notes: [],
			_validation_status: {},
			_submitted_by: null,
		},
		{
			_id: 182675287,
			"formhub/uuid": "9b35920b74c34e60ac6ade6ac7224332",
			start: "2022-09-09T13:13:24.143+05:45",
			end: "2022-09-09T13:13:27.376+05:45",
			Name: "Jade David",
			Phone: "+1 (299) 341-6514",
			Address:
				"Itaque itaque in obcaecati sed omnis dolorem proident expedita reprehenderit voluptatem",
			__version__: "vJ2h57HfcaRTLpCX3xz2Hh",
			"meta/instanceID": "uuid:3befd102-9316-4e25-95f4-d063a459a68d",
			_xform_id_string: "aNdpuv5XkgBg4VmdvRXJ2Z",
			_uuid: "3befd102-9316-4e25-95f4-d063a459a68d",
			_attachments: [],
			_status: "submitted_via_web",
			_geolocation: [null, null],
			_submission_time: "2022-09-09T07:28:28",
			_tags: [],
			_notes: [],
			_validation_status: {},
			_submitted_by: null,
		},
		{
			_id: 182675293,
			"formhub/uuid": "9b35920b74c34e60ac6ade6ac7224332",
			start: "2022-09-09T13:13:27.395+05:45",
			end: "2022-09-09T13:13:32.391+05:45",
			Name: "Nolan Griffin",
			Phone: "+1 (993) 412-6745",
			Address:
				"Numquam magna proident quis suscipit minim nobis magna eligendi autem quia debitis voluptas",
			__version__: "vJ2h57HfcaRTLpCX3xz2Hh",
			"meta/instanceID": "uuid:4c56c945-4a91-49a7-8135-b66f2e3bed77",
			_xform_id_string: "aNdpuv5XkgBg4VmdvRXJ2Z",
			_uuid: "4c56c945-4a91-49a7-8135-b66f2e3bed77",
			_attachments: [],
			_status: "submitted_via_web",
			_geolocation: [null, null],
			_submission_time: "2022-09-09T07:28:35",
			_tags: [],
			_notes: [],
			_validation_status: {},
			_submitted_by: null,
		},
	],
};

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

const SOURCE_FIELDS = {
	NAME: "Name",
	ADDRESS: "Address",
	PHONE: "Phone",
};

function App() {
	const [finalData, setFinalData] = useState([]);
	const [mapFields, setMapFields] = useState([]);

	const handleBtnSubmit = (e) => {
		e.preventDefault();
		const unique = [...new Set(mapFields)];
		console.log("Submit==>", unique);
	};

	const splitAndMapNameField = (sourceField) => {
		const values = KOBO_DATA.results.map((obj) => obj[sourceField]);
		const mappedFields = [];
		for (let v of values) {
			const { firstName, lastName } = splitFullName(v);
			mappedFields.push({ firstName, lastName });
		}
		return mappedFields;
	};

	const mapSourceToTarget = (sourceField, targetField) => {
		const values = KOBO_DATA.results.map((obj) => obj[sourceField]);
		const mappedFields = [];
		for (let v of values) {
			let obj = {};
			obj[targetField] = v;
			mappedFields.push(obj);
		}
		return mappedFields;
	};

	// Final = [{firstName,lastName,location,phone}]
	const handleTargetFieldChange = (e, sourceField) => {
		const targetField = e.target.value;
		if (
			sourceField === SOURCE_FIELDS.NAME &&
			targetField === TARGET_FIELDS.FIRSTNAME_LASTNAME
		) {
			setMapFields([...mapFields, { sourceField, targetField }]);
			const mappedNames = splitAndMapNameField(sourceField);
			setFinalData([...finalData, ...mappedNames]);
		}
		if (
			sourceField === SOURCE_FIELDS.ADDRESS &&
			targetField === TARGET_FIELDS.LOCATION
		) {
			setMapFields([...mapFields, { sourceField, targetField }]);
			const mappedAddress = mapSourceToTarget(sourceField, targetField);
			setFinalData([...finalData, ...mappedAddress]);
		}
		if (
			sourceField === SOURCE_FIELDS.PHONE &&
			targetField === TARGET_FIELDS.PHONE
		) {
			setMapFields([...mapFields, { sourceField, targetField }]);
			const mappedPhone = mapSourceToTarget(sourceField, targetField);
			setFinalData([...finalData, ...mappedPhone]);
		}
	};

	console.log("Final Data==>", finalData);

	return (
		<div className="App">
			<h3>==Beneficiary List==</h3>

			{/* <DynamicForm formData={FORM_FIELDS} /> */}

			<table>
				<tbody>
					<tr>
						<th>
							Name will become{" "}
							<select
								name="nameTarget"
								id="nameTarget"
								onChange={(e) => handleTargetFieldChange(e, SOURCE_FIELDS.NAME)}
							>
								<option value="None">--Select--</option>
								{BENEF_DB_FIELDS.map((f) => {
									return (
										<option key={f} value={f}>
											{f}
										</option>
									);
								})}
							</select>
						</th>
						<th>
							Address will become{" "}
							<select
								name="addressTarget"
								id="addressTarget"
								onChange={(e) =>
									handleTargetFieldChange(e, SOURCE_FIELDS.ADDRESS)
								}
							>
								<option value="None">--Select--</option>
								{BENEF_DB_FIELDS.map((f) => {
									return (
										<option key={f} value={f}>
											{f}
										</option>
									);
								})}
							</select>
						</th>
						<th>
							Phone will become{" "}
							<select
								name="phoneTarget"
								id="phoneTarget"
								onChange={(e) =>
									handleTargetFieldChange(e, SOURCE_FIELDS.PHONE)
								}
							>
								<option value="None">--Select--</option>
								{BENEF_DB_FIELDS.map((f) => {
									return (
										<option key={f} value={f}>
											{f}
										</option>
									);
								})}
							</select>
						</th>
					</tr>

					{KOBO_DATA.results.map((d) => {
						return (
							<tr key={d._id}>
								<td>{d.Name}</td>
								<td>{d.Address}</td>
								<td>{d.Phone}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
			<div>
				<button onClick={handleBtnSubmit} type="button">
					Submit
				</button>
			</div>
		</div>
	);
}

export default App;
