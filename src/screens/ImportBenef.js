import axios from "axios";
import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

function ImportBenef() {
	const [sources, setSources] = useState([]);

	const handleImortClick = async (uuid) => {
		console.log({ uuid });
		try {
			const res = await axios.get(`${API_URL}/beneficiaries/${uuid}/import`);
			return res.data;
		} catch (err) {
			console.log("Err=>", err);
		}
	};

	useEffect(() => {
		async function fetchSources() {
			const res = await axios.get(`${API_URL}/sources`);
			const { data } = res;
			setSources(data.rows);
		}

		fetchSources();
	}, []);

	return (
		<div style={{ margin: 20, padding: 20 }}>
			<h3>Beneficiary Source List</h3>
			<table>
				<thead>
					<th>Source</th>
					<th>Created At</th>
					<th>Beneficiary Count</th>
					<th>Action</th>
				</thead>

				<tbody>
					{!!sources.length ? (
						sources.map((d) => {
							return (
								<tr key={d.id}>
									<td>{d.name}</td>
									<td>{d.created_at}</td>
									<td>{d.field_mapping.data.length}</td>
									<td>
										<button
											type="button"
											onClick={() => handleImortClick(d.uuid)}
										>
											Import Beneficiary
										</button>
									</td>
								</tr>
							);
						})
					) : (
						<tr>
							<td>No data found</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}

export default ImportBenef;