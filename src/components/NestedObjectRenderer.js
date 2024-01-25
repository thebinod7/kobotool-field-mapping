import React from "react";

export default function NestedObjectRenderer({ object }) {
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
}
