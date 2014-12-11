/*****************************************************************************/
/* App: The Global Application Namespace */
/*****************************************************************************/
App = {
	activeSeason: '1415',
	MAX_VALUE: 15,
	passwordRegex: /[A-Za-z0-9]{6,}/,
	getOrdinal: function(num) {
		return ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][num % 10];
	}
};