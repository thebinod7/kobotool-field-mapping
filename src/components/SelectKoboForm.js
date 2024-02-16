import React from "react";

export default function SelectKoboForm({ handleKoboFormChange, options }) {
	return (
		<div>
			<label htmlFor="kobo-form">Kobo Form: </label>

			<select onChange={handleKoboFormChange} name="kobo-form" id="kobo-form">
				<option value="">--Select--</option>
				{options.map((item) => {
					return (
						<option key={item.id} value={item.name}>
							{item.name}
						</option>
					);
				})}
			</select>
		</div>
	);
}
