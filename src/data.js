export const FORM_FIELDS = [
	{
		id: 1,
		name: "citizenship_number",
		field_type: "Text",
		field_populate: null,
		is_active: true,
	},
	{
		id: 3,
		name: "has_citizenship",
		field_type: "Radio",
		field_populate: {
			data: ["Yes", "No"],
		},
		is_active: true,
	},
	{
		id: 4,
		name: "hobbies",
		field_type: "Checkbox",
		field_populate: {
			data: ["Football", "Cricket", "Basketball"],
		},
		is_active: true,
	},
	{
		id: 6,
		name: "colors",
		field_type: "Dropdown",
		field_populate: {
			data: [
				{
					id: 1,
					label: "Red",
				},
				{
					id: 2,
					label: "Green",
				},
			],
		},
		is_active: true,
	},
	{
		id: 7,
		name: "age",
		field_type: "Number",
		field_populate: null,
		is_active: true,
	},
	{
		id: 8,
		name: "bio",
		field_type: "Textarea",
		field_populate: null,
		is_active: true,
	},
	{
		id: 9,
		name: "pin_code",
		field_type: "Password",
		field_populate: null,
		is_active: true,
	},
];
