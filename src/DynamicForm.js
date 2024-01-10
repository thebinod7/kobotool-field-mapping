import React, { useState } from "react";

export const DynamicForm = ({ formData }) => {
	const [formValues, setFormValues] = useState({});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormValues((prevValues) => ({
			...prevValues,
			[name]: type === "checkbox" ? (checked ? value : null) : value,
		}));
	};

	const renderFormField = (field) => {
		switch (field.field_type) {
			case "Text":
			case "Number":
			case "Password":
				return (
					<input
						type={field.field_type.toLowerCase()}
						name={field.name}
						value={formValues[field.name] || ""}
						onChange={handleChange}
					/>
				);
			case "Radio":
				return (
					<div>
						{field.field_populate.data.map((option) => (
							<label key={option}>
								<input
									type="radio"
									name={field.name}
									value={option}
									checked={formValues[field.name] === option}
									onChange={handleChange}
								/>
								{option}
							</label>
						))}
					</div>
				);
			case "Checkbox":
				return (
					<div>
						{field.field_populate.data.map((option) => (
							<label key={option}>
								<input
									type="checkbox"
									name={field.name}
									value={option}
									checked={formValues[field.name]?.includes(option) || false}
									onChange={handleChange}
								/>
								{option}
							</label>
						))}
					</div>
				);
			case "Dropdown":
				return (
					<select
						name={field.name}
						onChange={handleChange}
						value={formValues[field.name] || ""}
					>
						<option value="">Select</option>
						{field.field_populate.data.map((option) => (
							<option key={option.id} value={option.label}>
								{option.label}
							</option>
						))}
					</select>
				);
			case "Textarea":
				return (
					<textarea
						name={field.name}
						value={formValues[field.name] || ""}
						onChange={handleChange}
					/>
				);
			default:
				return null;
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// Handle form submission with formValues
		console.log("Form Values:", formValues);
	};

	return (
		<form onSubmit={handleSubmit}>
			{formData.map((field) => (
				<div key={field.id}>
					<label>{field.name}</label>
					{renderFormField(field)}
				</div>
			))}
			<button type="submit">Submit</button>
		</form>
	);
};
