export function splitFullName(fullName) {
	// Split the full name into an array of words
	let nameArray = fullName.split(" ");

	// Extract the first and last names
	let firstName = nameArray[0];
	let lastName = nameArray[nameArray.length - 1];

	// Create an object to hold the result
	let result = {
		firstName: firstName,
		lastName: lastName,
	};

	return result;
}
