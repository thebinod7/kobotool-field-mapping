import React from "react";
import { IMPORT_OPTIONS } from "../data";

export default function SelectDropdown({ handleSelectChange }) {
	return (
		<div>
			<label htmlFor="import-source">Import Source: </label>

			<select
				onChange={handleSelectChange}
				name="import-source"
				id="import-source"
			>
				<option value="">--Select--</option>
				<option value={IMPORT_OPTIONS.KOBOTOOL}>Kobotool</option>
				<option value={IMPORT_OPTIONS.EXCEL}>Excel</option>
			</select>
		</div>
	);
}
